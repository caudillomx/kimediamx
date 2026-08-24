ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

CREATE OR REPLACE FUNCTION public.has_ops_write(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_ops_read(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','editor','viewer')
  )
$$;

REVOKE ALL ON FUNCTION public.has_ops_write(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_ops_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_ops_write(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_ops_read(uuid) TO authenticated, service_role;

DO $$
DECLARE
  t text;
  ops_tables text[] := ARRAY[
    'action_items','interactions','minutes','clients','client_contacts','client_corpus',
    'client_objectives','client_reports','client_trend_keywords','client_trend_results',
    'client_weekly_milestones','client_weekly_status',
    'content_analytics','content_cycles','content_inputs','content_learnings',
    'content_pieces','content_profiles',
    'ad_campaigns','ad_performance','ads_proposals','ads_proposal_performance',
    'client_portal_assets','client_portal_attachments','client_portal_updates',
    'client_portal_datasets','client_portal_reports','client_portal_dependencias',
    'client_portal_weekly_recommendations','client_portal_credentials',
    'client_portal_benchmark_competitors','client_portal_benchmark_follower_daily',
    'client_portal_benchmark_metrics','client_portal_benchmark_periods',
    'client_portal_benchmark_posts','client_portal_benchmark_uploads',
    'client_portal_benchmark_narratives','client_portal_strategy_reports',
    'client_portal_listening_analyses','client_portal_listening_analysis_jobs',
    'client_portal_listening_entries',
    'notion_parrilla_items','notion_parrilla_sources',
    'fireflies_meetings','fireflies_filter_rules',
    'gto_deliverables','gto_dependencias','gto_diagnostico_textos','gto_mcn_scores',
    'gto_participantes','gto_sesiones','gto_training_sessions',
    'team_members','participants','brand_kit_profiles'
  ];
BEGIN
  FOREACH t IN ARRAY ops_tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Editors manage %1$s" ON public.%1$I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Viewers read %1$s" ON public.%1$I', t);
      EXECUTE format($f$CREATE POLICY "Editors manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_ops_write(auth.uid())) WITH CHECK (public.has_ops_write(auth.uid()))$f$, t);
      EXECUTE format($f$CREATE POLICY "Viewers read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.has_ops_read(auth.uid()))$f$, t);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    END IF;
  END LOOP;
END $$;