UPDATE public.client_portal_benchmark_competitors
SET dependencia_id = NULL
WHERE dependencia_id = 'fa94b7e8-afdf-4b52-bba9-bda06e53d1ec'::uuid
  AND profile_external_id IN ('15763501526', '1565533619870908416');