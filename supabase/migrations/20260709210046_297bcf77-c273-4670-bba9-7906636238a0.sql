
-- client_access: which viewer user can see which client
CREATE TABLE public.client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, client_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_access TO authenticated;
GRANT ALL ON public.client_access TO service_role;
ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client_access"
  ON public.client_access FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own client_access"
  ON public.client_access FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- helper
CREATE OR REPLACE FUNCTION public.has_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_access
    WHERE user_id = _user_id AND client_id = _client_id
  )
$$;

-- client_portal_reports
CREATE TABLE public.client_portal_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  title TEXT NOT NULL,
  summary_md TEXT,
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily','weekly','benchmark','other')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_portal_reports_client_date ON public.client_portal_reports (client_id, report_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_reports TO authenticated;
GRANT ALL ON public.client_portal_reports TO service_role;
ALTER TABLE public.client_portal_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client_portal_reports"
  ON public.client_portal_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Viewers read allowed client_portal_reports"
  ON public.client_portal_reports FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TRIGGER trg_client_portal_reports_updated_at
  BEFORE UPDATE ON public.client_portal_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- client_portal_attachments
CREATE TABLE public.client_portal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.client_portal_reports(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_portal_attachments_report ON public.client_portal_attachments (report_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_attachments TO authenticated;
GRANT ALL ON public.client_portal_attachments TO service_role;
ALTER TABLE public.client_portal_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client_portal_attachments"
  ON public.client_portal_attachments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Viewers read allowed client_portal_attachments"
  ON public.client_portal_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_portal_reports r
      WHERE r.id = report_id
        AND public.has_client_access(auth.uid(), r.client_id)
    )
  );

-- Storage policies on client-reports bucket
-- Path convention: <client_id>/<report_id>/<filename>
CREATE POLICY "Admins manage client-reports storage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'client-reports' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'client-reports' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Viewers read allowed client-reports storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-reports'
    AND public.has_client_access(
      auth.uid(),
      NULLIF(split_part(name, '/', 1), '')::uuid
    )
  );
