-- Revoke direct API EXECUTE from anon/authenticated on SECURITY DEFINER helpers.
-- These functions are intended for use inside RLS policies and triggers only.
REVOKE EXECUTE ON FUNCTION public.sync_auth_state_on_confirm() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_verification_reviewer(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_merchant_ref() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_merchant_role(uuid, uuid, public.app_role[]) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_merchant_role(uuid, uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_platform_role(uuid, public.platform_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_merchant_member(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_risk_reviewer(uuid) FROM anon, authenticated, PUBLIC;