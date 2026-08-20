ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS services text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.clients SET services = ARRAY['analisis'] WHERE name IN ('Actinver','Guanajuato') AND cardinality(services) = 0;
UPDATE public.clients SET services = ARRAY['estrategia','ads','audiovisual'] WHERE name IN ('Padre Sada','El Diluvio','Mario Doria','Mario Doria - Urólogo') AND cardinality(services) = 0;

INSERT INTO public.clients (name, client_type, is_active, services)
SELECT 'Falcon', 'activo', true, ARRAY['estrategia','ads','audiovisual']
WHERE NOT EXISTS (SELECT 1 FROM public.clients WHERE name = 'Falcon');