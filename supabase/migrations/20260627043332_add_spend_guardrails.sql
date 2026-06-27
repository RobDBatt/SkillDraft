-- Shared, persistent guards for abuse (per-IP rate limit) and runaway spend
-- (global daily run cap). Replaces the per-instance in-memory limiter, which
-- did not hold across Vercel serverless instances or cold starts.

create table if not exists public.rate_limits (
  key       text primary key,
  count     integer not null default 0,
  reset_at  timestamptz not null
);
alter table public.rate_limits enable row level security;

create table if not exists public.usage_counters (
  day    date primary key,
  count  integer not null default 0
);
alter table public.usage_counters enable row level security;

-- Atomic per-key rate limit. Returns true if the call is within p_limit for the
-- current window (recording it), false once the limit is exceeded. The window
-- resets lazily once reset_at has passed.
create or replace function public.bump_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count    = case when r.reset_at < now() then 1 else r.count + 1 end,
        reset_at = case when r.reset_at < now()
                        then now() + make_interval(secs => p_window_seconds)
                        else r.reset_at end
  returning r.count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Atomic global daily cap. Increments today's counter only while it is strictly
-- below p_cap and returns true (allowed); returns false once the cap is reached.
-- The conditional UPDATE keeps the counter from ever exceeding p_cap and is
-- race-safe under concurrent calls (row lock + WHERE re-evaluation).
create or replace function public.bump_daily_usage(p_cap integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_counters (day, count)
  values (current_date, 0)
  on conflict (day) do nothing;

  update public.usage_counters
     set count = count + 1
   where day = current_date
     and count < p_cap;

  return found;
end;
$$;

-- Only the server (service-role key / SECURITY DEFINER) may invoke these.
-- Without this, the public anon key could call them directly and exhaust the
-- daily cap to DoS generation for everyone.
revoke execute on function public.bump_rate_limit(text, integer, integer) from public;
revoke execute on function public.bump_daily_usage(integer) from public;
grant execute on function public.bump_rate_limit(text, integer, integer) to service_role;
grant execute on function public.bump_daily_usage(integer) to service_role;
