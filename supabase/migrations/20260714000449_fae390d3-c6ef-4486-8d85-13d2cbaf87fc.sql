
-- 1) portal_modules on clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS portal_modules jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Activate press_daily module for Guanajuato
UPDATE public.clients
SET portal_modules = coalesce(portal_modules, '{}'::jsonb) || jsonb_build_object('press_daily', true)
WHERE id = '651190b4-7787-4814-af9a-b5aff22d9297';

-- 2) scope on benchmark_periods
ALTER TABLE public.client_portal_benchmark_periods
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'general';
ALTER TABLE public.client_portal_benchmark_periods
  DROP CONSTRAINT IF EXISTS client_portal_benchmark_periods_scope_check;
ALTER TABLE public.client_portal_benchmark_periods
  ADD CONSTRAINT client_portal_benchmark_periods_scope_check
  CHECK (scope IN ('general','funcionarios','instituciones'));

-- 3) press_daily_batches
CREATE TABLE IF NOT EXISTS public.press_daily_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  batch_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','sent')),
  whatsapp_sent_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, batch_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_daily_batches TO authenticated;
GRANT ALL ON public.press_daily_batches TO service_role;
ALTER TABLE public.press_daily_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage press batches" ON public.press_daily_batches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Portal users read own press batches" ON public.press_daily_batches
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));
CREATE TRIGGER trg_press_batches_touch
  BEFORE UPDATE ON public.press_daily_batches
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

-- 4) press_daily_entries
CREATE TABLE IF NOT EXISTS public.press_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.press_daily_batches(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  medium text,
  author text,
  title text,
  url text,
  raw_text text NOT NULL,
  tone text CHECK (tone IN ('positivo','neutral','negativo','crisis')),
  topic text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS press_daily_entries_batch_idx ON public.press_daily_entries(batch_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_daily_entries TO authenticated;
GRANT ALL ON public.press_daily_entries TO service_role;
ALTER TABLE public.press_daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage press entries" ON public.press_daily_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Portal users read own press entries" ON public.press_daily_entries
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));
CREATE TRIGGER trg_press_entries_touch
  BEFORE UPDATE ON public.press_daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

-- 5) press_daily_digests
CREATE TABLE IF NOT EXISTS public.press_daily_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL UNIQUE REFERENCES public.press_daily_batches(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  summary_md text NOT NULL,
  whatsapp_text text NOT NULL,
  alerts jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  entries_count integer NOT NULL DEFAULT 0,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_daily_digests TO authenticated;
GRANT ALL ON public.press_daily_digests TO service_role;
ALTER TABLE public.press_daily_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage press digests" ON public.press_daily_digests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Portal users read own press digests" ON public.press_daily_digests
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));
CREATE TRIGGER trg_press_digests_touch
  BEFORE UPDATE ON public.press_daily_digests
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
