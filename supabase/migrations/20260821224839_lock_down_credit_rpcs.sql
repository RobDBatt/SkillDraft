-- SkillDraft — lock down credit RPCs.
--
-- add_credits / deduct_credit / handle_new_user were SECURITY DEFINER with
-- EXECUTE to PUBLIC and no search_path pinned. add_credits updates
-- public.profiles as the definer, bypassing the select_own / update_own RLS
-- policies, and was reachable at POST /rest/v1/rpc/add_credits with only the
-- anon key that ships in the client bundle — anyone could grant any account
-- unlimited credits. deduct_credit was the mirror: drain any account by id.
-- handle_new_user is a trigger function and was never meant to be callable.
--
-- bump_daily_usage, bump_rate_limit, get_generation_cache and
-- put_generation_cache were already service_role-only with search_path set.
-- This brings the other three up to the same pattern.

-- 1. Pin search_path. '' rather than 'public': all three already fully-qualify
--    every table reference (public.profiles), and the remaining bare
--    identifiers (now, coalesce, found) resolve from pg_catalog, which is
--    always implicitly on the path.
alter function public.add_credits(uuid, integer)  set search_path = '';
alter function public.deduct_credit(uuid)         set search_path = '';
alter function public.handle_new_user()           set search_path = '';

-- 2. Revoke EXECUTE. PUBLIC must be named explicitly — anon and authenticated
--    inherit from it, so revoking only those two leaves the function reachable.
revoke execute on function public.add_credits(uuid, integer)
  from public, anon, authenticated;

revoke execute on function public.deduct_credit(uuid)
  from public, anon, authenticated;

revoke execute on function public.handle_new_user()
  from public, anon, authenticated;

-- 3. Re-grant to the roles that legitimately need it. service_role covers the
--    server-side callers (app/api/generate, app/api/improve,
--    app/api/stripe/webhook — all use the SUPABASE_SERVICE_ROLE_KEY client).
--    handle_new_user is fired by its trigger as the table owner and needs no
--    role grant: Postgres checks EXECUTE on a trigger function at CREATE
--    TRIGGER time, not at fire time.
grant execute on function public.add_credits(uuid, integer)  to service_role;
grant execute on function public.deduct_credit(uuid)         to service_role;

-- ---------------------------------------------------------------------------
-- Verified after applying (2026-08-21):
--   proconfig = search_path="" and grants = postgres/service_role only on all
--   three. From a shell, with the anon key out of .env.local:
--     POST /rest/v1/rpc/add_credits -> 401 {"code":"42501",
--       "message":"permission denied for function add_credits"}
--   Control request (GET /rest/v1/skills) still 200s, so the 401 is the
--   revoke, not a stale key.
--
-- ROLLBACK (restores the vulnerability — emergency use only):
--   grant execute on function public.add_credits(uuid, integer)  to anon, authenticated;
--   grant execute on function public.deduct_credit(uuid)         to anon, authenticated;
--   grant execute on function public.handle_new_user()           to anon, authenticated;
--   alter function public.add_credits(uuid, integer)  reset search_path;
--   alter function public.deduct_credit(uuid)         reset search_path;
--   alter function public.handle_new_user()           reset search_path;
-- ---------------------------------------------------------------------------
