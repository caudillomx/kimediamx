CREATE TABLE public.client_efemeride_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  efemeride_date date NOT NULL,
  efemeride_name text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('si','no')),
  note text,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, efemeride_date, efemeride_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_efemeride_decisions TO authenticated;
GRANT ALL ON public.client_efemeride_decisions TO service_role;
ALTER TABLE public.client_efemeride_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leer decisiones efemérides" ON public.client_efemeride_decisions FOR SELECT TO authenticated
  USING (public.has_ops_read(auth.uid()) OR public.has_client_access(auth.uid(), client_id));
CREATE POLICY "Equipo inserta decisiones" ON public.client_efemeride_decisions FOR INSERT TO authenticated WITH CHECK (public.has_ops_write(auth.uid()));
CREATE POLICY "Equipo edita decisiones" ON public.client_efemeride_decisions FOR UPDATE TO authenticated USING (public.has_ops_write(auth.uid())) WITH CHECK (public.has_ops_write(auth.uid()));
CREATE POLICY "Equipo borra decisiones" ON public.client_efemeride_decisions FOR DELETE TO authenticated USING (public.has_ops_write(auth.uid()));
CREATE TRIGGER trg_ced_updated BEFORE UPDATE ON public.client_efemeride_decisions FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();