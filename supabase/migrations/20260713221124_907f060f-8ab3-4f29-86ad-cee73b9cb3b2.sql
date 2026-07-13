
-- =========================================================================
-- 1. STORAGE BUCKETS — tighten policies
-- =========================================================================

-- client-brandbooks: admins only
DROP POLICY IF EXISTS "Authenticated users can upload brandbooks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read brandbooks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brandbooks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brandbooks" ON storage.objects;

CREATE POLICY "Admins manage brandbooks" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'client-brandbooks' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'client-brandbooks' AND public.has_role(auth.uid(), 'admin'));

-- client-corpus-files: admin OR user with client_access on the first path segment (client_id)
DROP POLICY IF EXISTS "Authenticated read corpus files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload corpus files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete corpus files" ON storage.objects;

CREATE POLICY "Read corpus files by client access" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-corpus-files'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_client_access(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Admins upload corpus files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-corpus-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete corpus files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-corpus-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update corpus files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-corpus-files' AND public.has_role(auth.uid(), 'admin'));

-- content-inputs: public bucket (files remain servable via public CDN URL by bucket flag).
-- Remove blanket SELECT on storage.objects (which enables listing) and restrict writes to admins.
DROP POLICY IF EXISTS "Anyone can read content input files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload content input files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete content input files" ON storage.objects;

CREATE POLICY "Admins manage content input files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'content-inputs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'content-inputs' AND public.has_role(auth.uid(), 'admin'));

-- minutes: admins only (read + write)
DROP POLICY IF EXISTS "Authenticated users can upload minutes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read minutes files" ON storage.objects;

CREATE POLICY "Admins manage minutes files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'minutes' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'minutes' AND public.has_role(auth.uid(), 'admin'));

-- client-avatars: public bucket, keep CDN read (public flag), restrict write to admins,
-- remove listing capability by dropping any SELECT-on-objects policy (there was none broad, only writes).
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

CREATE POLICY "Admins upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-avatars' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- 2. PUBLIC TABLES — drop blanket authenticated policies, keep admin ALL
-- =========================================================================

-- action_items
DROP POLICY IF EXISTS "Authenticated users can read action items" ON public.action_items;
DROP POLICY IF EXISTS "Authenticated users can update action items" ON public.action_items;

-- ad_campaigns
DROP POLICY IF EXISTS "Authenticated can insert ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Authenticated can read ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Authenticated can update ad_campaigns" ON public.ad_campaigns;

-- ad_performance
DROP POLICY IF EXISTS "Authenticated can insert ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Authenticated can read ad_performance" ON public.ad_performance;

-- ads_proposal_performance
DROP POLICY IF EXISTS "Authenticated delete ads_proposal_performance" ON public.ads_proposal_performance;
DROP POLICY IF EXISTS "Authenticated insert ads_proposal_performance" ON public.ads_proposal_performance;
DROP POLICY IF EXISTS "Authenticated read ads_proposal_performance" ON public.ads_proposal_performance;
DROP POLICY IF EXISTS "Authenticated update ads_proposal_performance" ON public.ads_proposal_performance;

-- ads_proposals
DROP POLICY IF EXISTS "Authenticated delete ads_proposals" ON public.ads_proposals;
DROP POLICY IF EXISTS "Authenticated insert ads_proposals" ON public.ads_proposals;
DROP POLICY IF EXISTS "Authenticated read ads_proposals" ON public.ads_proposals;
DROP POLICY IF EXISTS "Authenticated update ads_proposals" ON public.ads_proposals;

-- app_settings
DROP POLICY IF EXISTS "Authenticated can read settings" ON public.app_settings;

-- client_contacts
DROP POLICY IF EXISTS "Authenticated users can read client contacts" ON public.client_contacts;

-- client_corpus
DROP POLICY IF EXISTS "Authenticated delete corpus" ON public.client_corpus;
DROP POLICY IF EXISTS "Authenticated insert corpus" ON public.client_corpus;
DROP POLICY IF EXISTS "Authenticated read corpus" ON public.client_corpus;
DROP POLICY IF EXISTS "Authenticated update corpus" ON public.client_corpus;

-- client_objectives
DROP POLICY IF EXISTS "Authenticated users can read objectives" ON public.client_objectives;

-- client_reports (keep admin ALL only)
DROP POLICY IF EXISTS "Authenticated can insert client_reports" ON public.client_reports;
DROP POLICY IF EXISTS "Authenticated can read client_reports" ON public.client_reports;

-- client_trend_keywords
DROP POLICY IF EXISTS "Authenticated can insert trend_keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can read trend_keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can update trend_keywords" ON public.client_trend_keywords;
DROP POLICY IF EXISTS "Authenticated can delete trend_keywords" ON public.client_trend_keywords;

-- client_trend_results
DROP POLICY IF EXISTS "Authenticated can insert trend_results" ON public.client_trend_results;
DROP POLICY IF EXISTS "Authenticated can read trend_results" ON public.client_trend_results;
DROP POLICY IF EXISTS "Authenticated can update trend_results" ON public.client_trend_results;

-- client_weekly_milestones
DROP POLICY IF EXISTS "Authenticated can read weekly milestones" ON public.client_weekly_milestones;
DROP POLICY IF EXISTS "Authenticated can insert weekly milestones" ON public.client_weekly_milestones;

-- content_analytics
DROP POLICY IF EXISTS "Authenticated can insert content_analytics" ON public.content_analytics;
DROP POLICY IF EXISTS "Authenticated can read content_analytics" ON public.content_analytics;

-- content_cycles
DROP POLICY IF EXISTS "Authenticated can insert content_cycles" ON public.content_cycles;
DROP POLICY IF EXISTS "Authenticated can read content_cycles" ON public.content_cycles;
DROP POLICY IF EXISTS "Authenticated can update content_cycles" ON public.content_cycles;

-- content_inputs
DROP POLICY IF EXISTS "Authenticated can insert content_inputs" ON public.content_inputs;
DROP POLICY IF EXISTS "Authenticated can read content_inputs" ON public.content_inputs;
DROP POLICY IF EXISTS "Authenticated can update content_inputs" ON public.content_inputs;
DROP POLICY IF EXISTS "Authenticated can delete content_inputs" ON public.content_inputs;

-- content_learnings
DROP POLICY IF EXISTS "Authenticated can insert content_learnings" ON public.content_learnings;
DROP POLICY IF EXISTS "Authenticated can read content_learnings" ON public.content_learnings;

-- content_pieces
DROP POLICY IF EXISTS "Authenticated can insert content_pieces" ON public.content_pieces;
DROP POLICY IF EXISTS "Authenticated can read content_pieces" ON public.content_pieces;
DROP POLICY IF EXISTS "Authenticated can update content_pieces" ON public.content_pieces;
DROP POLICY IF EXISTS "Authenticated can delete content_pieces" ON public.content_pieces;

-- content_profiles
DROP POLICY IF EXISTS "Authenticated can insert content_profiles" ON public.content_profiles;
DROP POLICY IF EXISTS "Authenticated can read content_profiles" ON public.content_profiles;
DROP POLICY IF EXISTS "Authenticated can update content_profiles" ON public.content_profiles;

-- deals
DROP POLICY IF EXISTS "Authenticated users can read deals" ON public.deals;
DROP POLICY IF EXISTS "Authenticated users can update deals" ON public.deals;

-- interactions
DROP POLICY IF EXISTS "Authenticated users can read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Authenticated users can update interactions" ON public.interactions;

-- minutes
DROP POLICY IF EXISTS "Authenticated users can read minutes" ON public.minutes;

-- team_members
DROP POLICY IF EXISTS "Authenticated users can read team members" ON public.team_members;

-- clients: drop blanket read/write, add admin ALL + scoped SELECT for portal users
DROP POLICY IF EXISTS "Authenticated users can read clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Ensure admin ALL policy exists for clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='clients' AND policyname='Admins manage clients'
  ) THEN
    EXECUTE $p$CREATE POLICY "Admins manage clients" ON public.clients
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'))$p$;
  END IF;
END $$;

CREATE POLICY "Portal users read their own client" ON public.clients
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_client_access(auth.uid(), id)
  );

-- =========================================================================
-- 3. FUNCTIONS — revoke EXECUTE from anon/authenticated on internal-only ones
-- =========================================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_client_name_from_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_portal_touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_action_items_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_participants_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fpk_to_num(text) FROM PUBLIC, anon, authenticated;

-- =========================================================================
-- 4. Fix mutable search_path on fpk_to_num
-- =========================================================================

CREATE OR REPLACE FUNCTION public.fpk_to_num(v text)
 RETURNS double precision
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  s text;
  n double precision;
BEGIN
  IF v IS NULL OR v = '' OR v = '-' THEN RETURN NULL; END IF;
  s := replace(replace(replace(v, '%', ''), ' ', ''), ',', '.');
  BEGIN
    n := s::double precision;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  IF n IS NULL OR n = 'NaN'::double precision THEN RETURN NULL; END IF;
  RETURN n;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.fpk_to_num(text) FROM PUBLIC, anon, authenticated;
