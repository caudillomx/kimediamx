REVOKE EXECUTE ON FUNCTION public.gto_bootstrap_session(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gto_bootstrap_session(uuid, uuid) TO service_role;
COMMENT ON FUNCTION public.gto_bootstrap_session(uuid, uuid) IS 'Server-only course bootstrap. gto-access verifies an expiring signed participant/session capability before calling this function.';