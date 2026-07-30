DELETE FROM public.client_portal_listening_analyses
WHERE client_id = '1b3831de-23f1-4aa7-a40f-8288ff70fb1d'
  AND week_start = '2026-07-07';

DELETE FROM public.client_portal_strategy_reports
WHERE client_id = '1b3831de-23f1-4aa7-a40f-8288ff70fb1d';

DELETE FROM public.client_portal_benchmark_narratives
WHERE client_id = '1b3831de-23f1-4aa7-a40f-8288ff70fb1d';