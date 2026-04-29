
-- Sandbox del capacitador: dependencia y sesión demo
INSERT INTO public.gto_dependencias (nombre, siglas, access_code, contacto_enlace, sort_order)
VALUES ('Sandbox del capacitador (demo en vivo)', 'DEMO', 'KIMEDIA-DEMO', 'KiMedia', -1)
ON CONFLICT DO NOTHING;

INSERT INTO public.gto_sesiones (dependencia_id, paso_actual, estado)
SELECT id, 0, 'pendiente'
FROM public.gto_dependencias
WHERE siglas = 'DEMO'
AND NOT EXISTS (
  SELECT 1 FROM public.gto_sesiones s WHERE s.dependencia_id = public.gto_dependencias.id
);
