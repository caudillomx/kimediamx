
-- Content inputs: source materials for content generation (articles, stories, URLs, etc.)
CREATE TABLE public.content_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.content_cycles(id) ON DELETE CASCADE,
  input_type text NOT NULL DEFAULT 'texto',
  title text,
  content text,
  url text,
  file_name text,
  file_url text,
  tags text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read content_inputs" ON public.content_inputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert content_inputs" ON public.content_inputs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update content_inputs" ON public.content_inputs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete content_inputs" ON public.content_inputs FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins manage content_inputs" ON public.content_inputs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
