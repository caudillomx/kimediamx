-- 1. Add client_id and objective_id to action_items
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS objective_id uuid REFERENCES public.client_objectives(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_action_items_client_id ON public.action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_objective_id ON public.action_items(objective_id);

-- 2. Add client_id to deals and interactions
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);

ALTER TABLE public.interactions
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_interactions_client_id ON public.interactions(client_id);

-- 3. Backfill by case-insensitive name match
UPDATE public.action_items ai
SET client_id = c.id
FROM public.clients c
WHERE ai.client_id IS NULL
  AND ai.client IS NOT NULL
  AND LOWER(TRIM(ai.client)) = LOWER(TRIM(c.name));

UPDATE public.deals d
SET client_id = c.id
FROM public.clients c
WHERE d.client_id IS NULL
  AND d.client_name IS NOT NULL
  AND LOWER(TRIM(d.client_name)) = LOWER(TRIM(c.name));

UPDATE public.interactions i
SET client_id = c.id
FROM public.clients c
WHERE i.client_id IS NULL
  AND i.client_name IS NOT NULL
  AND LOWER(TRIM(i.client_name)) = LOWER(TRIM(c.name));

-- 4. Trigger to keep client name text in sync when client_id is set
CREATE OR REPLACE FUNCTION public.sync_client_name_from_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_target_col text := TG_ARGV[0];
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    SELECT name INTO v_name FROM public.clients WHERE id = NEW.client_id;
    IF v_name IS NOT NULL THEN
      IF v_target_col = 'client' THEN
        NEW.client := v_name;
      ELSIF v_target_col = 'client_name' THEN
        NEW.client_name := v_name;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_client_name_action_items ON public.action_items;
CREATE TRIGGER trg_sync_client_name_action_items
  BEFORE INSERT OR UPDATE OF client_id ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_client_name_from_id('client');

DROP TRIGGER IF EXISTS trg_sync_client_name_deals ON public.deals;
CREATE TRIGGER trg_sync_client_name_deals
  BEFORE INSERT OR UPDATE OF client_id ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.sync_client_name_from_id('client_name');

DROP TRIGGER IF EXISTS trg_sync_client_name_interactions ON public.interactions;
CREATE TRIGGER trg_sync_client_name_interactions
  BEFORE INSERT OR UPDATE OF client_id ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_client_name_from_id('client_name');