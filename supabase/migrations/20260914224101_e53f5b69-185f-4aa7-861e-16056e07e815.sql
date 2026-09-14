CREATE TABLE public.client_google_ads_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  label text,
  active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_sync_error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, customer_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_google_ads_accounts TO authenticated;
GRANT ALL ON public.client_google_ads_accounts TO service_role;

ALTER TABLE public.client_google_ads_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops manage google ads accounts"
ON public.client_google_ads_accounts
FOR ALL
TO authenticated
USING (public.has_ops_write(auth.uid()))
WITH CHECK (public.has_ops_write(auth.uid()));

CREATE TRIGGER tg_cgaa_touch
BEFORE UPDATE ON public.client_google_ads_accounts
FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();