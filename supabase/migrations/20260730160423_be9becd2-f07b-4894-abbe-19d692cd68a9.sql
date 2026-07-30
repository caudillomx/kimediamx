-- 1. client_trend_keywords: admin only
DROP POLICY IF EXISTS "Authenticated can delete trend keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can insert trend keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can read trend keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can update trend keywords" ON public.client_trend_keywords;

-- 2. client_trend_results: admin only
DROP POLICY IF EXISTS "Authenticated can delete trend results" ON public.client_trend_results;
DROP POLICY IF EXISTS "Authenticated can insert trend results" ON public.client_trend_results;
DROP POLICY IF EXISTS "Authenticated can read trend results" ON public.client_trend_results;

-- 3. client_weekly_milestones: admins manage; client users read own via objective -> client
DROP POLICY IF EXISTS "Authenticated users can read milestones" ON public.client_weekly_milestones;
DROP POLICY IF EXISTS "Authenticated users can update milestones" ON public.client_weekly_milestones;

CREATE POLICY "Client users read their milestones"
  ON public.client_weekly_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_objectives o
      WHERE o.id = client_weekly_milestones.objective_id
        AND o.client_id IS NOT NULL
        AND public.has_client_access(auth.uid(), o.client_id)
    )
  );

-- 4. client_weekly_status
DROP POLICY IF EXISTS "Authenticated read weekly status" ON public.client_weekly_status;
DROP POLICY IF EXISTS "Authenticated update weekly status" ON public.client_weekly_status;

CREATE POLICY "Admins manage weekly status"
  ON public.client_weekly_status FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Client users read their weekly status"
  ON public.client_weekly_status FOR SELECT
  TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

-- 5. clients: drop blanket read
DROP POLICY IF EXISTS "Authenticated read clients" ON public.clients;

-- 6. route_progress: remove public access, admin only
DROP POLICY IF EXISTS "Anyone can read route progress" ON public.route_progress;
DROP POLICY IF EXISTS "Anyone can update route progress" ON public.route_progress;
DROP POLICY IF EXISTS "Anyone can insert route progress" ON public.route_progress;

-- 7. SECURITY DEFINER functions: revoke PUBLIC execute, grant only what is needed
REVOKE ALL ON FUNCTION public.get_brand_kit_by_token(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_bootstrap_session(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_delete_corpus_upload(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_insert_diagnostico(uuid, uuid, text, text, text, jsonb, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_list_corpus_uploads(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_list_diagnosticos(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_update_participante_progress(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_update_sesion(uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gto_validate_access_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_client_access(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_code_usage(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- public course/portal flows run unauthenticated: keep anon + authenticated
GRANT EXECUTE ON FUNCTION public.get_brand_kit_by_token(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_bootstrap_session(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_delete_corpus_upload(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_insert_diagnostico(uuid, uuid, text, text, text, jsonb, text, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_list_corpus_uploads(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_list_diagnosticos(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_update_participante_progress(uuid, uuid, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_update_sesion(uuid, uuid, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gto_validate_access_code(text) TO anon, authenticated, service_role;

-- RLS helper functions must be executable by roles evaluated in policies
GRANT EXECUTE ON FUNCTION public.has_client_access(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

-- server-side only
GRANT EXECUTE ON FUNCTION public.increment_code_usage(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;