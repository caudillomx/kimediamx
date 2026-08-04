REVOKE EXECUTE ON FUNCTION public.gto_validate_access_code(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_client_access(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_client_access(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_validate_access_code(text) TO service_role;