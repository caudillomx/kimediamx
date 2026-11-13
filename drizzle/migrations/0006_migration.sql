
DROP POLICY IF EXISTS "Anyone can create sesiones" ON public.gto_sesiones;
CREATE POLICY "Anyone can create sesiones" ON public.gto_sesiones FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.gto_dependencias d WHERE d.id = dependencia_id) AND completed_at IS NULL AND notas_kimedia IS NULL);

DROP POLICY IF EXISTS "Anyone can create participantes" ON public.gto_participantes;
CREATE POLICY "Anyone can create participantes" ON public.gto_participantes FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.gto_sesiones s WHERE s.id = sesion_id) AND length(nombre) BETWEEN 1 AND 200 AND (email IS NULL OR length(email) <= 255) AND (cargo IS NULL OR length(cargo) <= 200));

DROP POLICY IF EXISTS "Anyone can insert corpus uploads" ON public.gto_corpus_uploads;
CREATE POLICY "Participants can insert corpus uploads" ON public.gto_corpus_uploads FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.gto_participantes p WHERE p.id = participante_id AND p.sesion_id = gto_corpus_uploads.sesion_id) AND length(file_name) BETWEEN 1 AND 300 AND length(storage_path) BETWEEN 1 AND 500 AND (file_size IS NULL OR file_size <= 52428800));

DROP POLICY IF EXISTS "Anyone can create brand profile" ON public.brand_kit_profiles;
CREATE POLICY "Anyone can create brand profile" ON public.brand_kit_profiles FOR INSERT TO anon, authenticated
WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND length(full_name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 255 AND email LIKE '%@%' AND length(profession) <= 200 AND length(social_handle) <= 200);

DROP POLICY IF EXISTS "Public change own vote" ON public.cfl_votes;
CREATE POLICY "Public change own vote" ON public.cfl_votes FOR UPDATE TO anon, authenticated
USING (length(voter) BETWEEN 8 AND 64)
WITH CHECK (length(question) <= 40 AND length(option) <= 60 AND length(voter) BETWEEN 8 AND 64);

DROP POLICY IF EXISTS "Authenticated users can insert interactions" ON public.interactions;

DROP POLICY IF EXISTS "Public monitoring status" ON public.observatory_monitor_runs;
CREATE POLICY "Ops read monitoring status" ON public.observatory_monitor_runs FOR SELECT TO authenticated
USING (public.has_ops_read(auth.uid()));

DROP POLICY IF EXISTS "Anyone can save coach outputs" ON public.webinar_coach_outputs;
CREATE POLICY "Anyone can save coach outputs" ON public.webinar_coach_outputs FOR INSERT TO anon, authenticated
WITH CHECK (length(evento) BETWEEN 1 AND 100 AND length(causa_social) BETWEEN 1 AND 2000 AND pg_column_size(output) <= 200000);

DROP POLICY IF EXISTS "Anyone can submit quiz responses" ON public.quiz_submissions;
CREATE POLICY "Anyone can submit quiz responses" ON public.quiz_submissions FOR INSERT TO anon, authenticated
WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 255 AND email LIKE '%@%' AND result_sent = false AND pg_column_size(answers) <= 50000);

DROP POLICY IF EXISTS "Anyone can register" ON public.webinar_registrations;
CREATE POLICY "Anyone can register" ON public.webinar_registrations FOR INSERT TO anon, authenticated
WITH CHECK (length(nombre) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 255 AND email LIKE '%@%' AND length(evento) BETWEEN 1 AND 100);

DROP POLICY IF EXISTS "Anyone can register for guide access" ON public.guide_registrations;
CREATE POLICY "Anyone can register for guide access" ON public.guide_registrations FOR INSERT TO anon, authenticated
WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 255 AND email LIKE '%@%' AND length(guide_type) BETWEEN 1 AND 100);
