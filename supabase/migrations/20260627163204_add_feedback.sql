-- User-submitted feedback (feature requests, recommendations, bug reports).
-- Written only by the server (/api/feedback via the service role). RLS is on
-- with no policies, so the public anon/authenticated keys cannot read or write
-- it directly — submissions must go through the rate-limited API route.

create table if not exists public.feedback (
  id          bigint generated always as identity primary key,
  kind        text,
  message     text not null,
  email       text,
  user_id     uuid references auth.users(id) on delete set null,
  user_agent  text,
  created_at  timestamptz not null default now()
);
alter table public.feedback enable row level security;
