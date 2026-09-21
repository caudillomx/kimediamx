INSERT INTO public.client_portal_dependencias (client_id, nombre, nombre_corto, tipo, titular, titular_cargo, sort_order, active)
SELECT '651190b4-7787-4814-af9a-b5aff22d9297', 'Presidencia del Sistema DIF Estatal', 'Presidencia DIF', 'organismo', 'Juan Carlos Montesinos', 'Presidente', 27, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.client_portal_dependencias
  WHERE client_id = '651190b4-7787-4814-af9a-b5aff22d9297'
    AND nombre = 'Presidencia del Sistema DIF Estatal'
);