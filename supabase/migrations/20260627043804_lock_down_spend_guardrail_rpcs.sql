-- `revoke ... from public` does not remove the explicit execute grants Supabase
-- gives the anon/authenticated roles by default, so the public anon key could
-- still call these RPCs directly and exhaust the daily cap. Revoke explicitly.
revoke execute on function public.bump_rate_limit(text, integer, integer) from anon, authenticated;
revoke execute on function public.bump_daily_usage(integer) from anon, authenticated;
