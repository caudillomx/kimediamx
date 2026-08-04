CREATE TABLE public.client_portal_user_prefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  focus_dependencia_id uuid REFERENCES public.client_portal_dependencias(id) ON DELETE SET NULL,
  theme text NOT NULL DEFAULT 'light',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_user_prefs TO authenticated;
GRANT ALL ON public.client_portal_user_prefs TO service_role;

ALTER TABLE public.client_portal_user_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own portal prefs"
ON public.client_portal_user_prefs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_cpup_updated
BEFORE UPDATE ON public.client_portal_user_prefs
FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();