-- Lazy cache for menu-only (no free-text) generations. Identical menu inputs
-- produce the same SKILL.md, so we generate once, store it, and serve it for
-- ~$0 on repeat — keeping the credit charge while dropping COGS to near zero.

create table if not exists public.generation_cache (
  cache_key    text primary key,
  content      text not null,
  category     text,
  platform     text,
  hit_count    integer not null default 0,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);
alter table public.generation_cache enable row level security;

-- Read a cached generation and atomically record the hit. Returns the stored
-- content, or null on a miss.
create or replace function public.get_generation_cache(p_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_content text;
begin
  update public.generation_cache
     set hit_count = hit_count + 1,
         last_used_at = now()
   where cache_key = p_key
   returning content into v_content;
  return v_content;
end;
$$;

-- Store (or replace, e.g. on regenerate) a cached generation. hit_count is left
-- untouched on conflict so the counter survives a refresh of the content.
create or replace function public.put_generation_cache(
  p_key text,
  p_content text,
  p_category text,
  p_platform text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.generation_cache (cache_key, content, category, platform)
  values (p_key, p_content, p_category, p_platform)
  on conflict (cache_key) do update
    set content      = excluded.content,
        category     = excluded.category,
        platform     = excluded.platform,
        last_used_at = now();
end;
$$;

-- Server-only (service-role / SECURITY DEFINER). Lock out the public anon key.
revoke execute on function public.get_generation_cache(text) from public, anon, authenticated;
revoke execute on function public.put_generation_cache(text, text, text, text) from public, anon, authenticated;
grant  execute on function public.get_generation_cache(text) to service_role;
grant  execute on function public.put_generation_cache(text, text, text, text) to service_role;
