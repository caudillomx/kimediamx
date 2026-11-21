CREATE OR REPLACE FUNCTION public.cf27_has_registered_team_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.cf27_teams AS team
    WHERE team.token = NULLIF(
      COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-cf27-team-token',
      ''
    )
  );
$function$;
REVOKE ALL ON FUNCTION public.cf27_has_registered_team_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cf27_has_registered_team_access() TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public read workshop teams" ON public.cf27_teams;
CREATE POLICY "Registered workshop teams can read shared exercises"
ON public.cf27_teams
FOR SELECT
TO anon, authenticated
USING (
  (SELECT public.cf27_has_registered_team_access())
  OR (SELECT public.has_ops_read(auth.uid()))
);
COMMENT ON FUNCTION public.cf27_has_registered_team_access() IS 'Authorizes shared workshop reads only when the request proves possession of an existing team capability. Does not return tokens or team data.';