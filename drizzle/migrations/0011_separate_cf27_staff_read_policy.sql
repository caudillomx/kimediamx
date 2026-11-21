ALTER POLICY "Registered workshop teams can read shared exercises"
ON public.cf27_teams
USING ((SELECT public.cf27_has_registered_team_access()));
CREATE POLICY "Operations staff can read workshop exercises"
ON public.cf27_teams
FOR SELECT
TO authenticated
USING ((SELECT public.has_ops_read(auth.uid())));