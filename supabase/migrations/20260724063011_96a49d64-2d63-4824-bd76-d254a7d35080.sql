GRANT EXECUTE ON FUNCTION public.is_merchant_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_merchant_role(uuid, uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_merchant_role(uuid, uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_verification_reviewer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_risk_reviewer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_platform_role(uuid, public.platform_role) TO authenticated;