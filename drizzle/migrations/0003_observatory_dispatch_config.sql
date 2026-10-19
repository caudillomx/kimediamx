CREATE OR REPLACE FUNCTION public.observatory_dispatch_monitor() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE secret_value text; function_url text; vertical_record record;
BEGIN
 SELECT value INTO secret_value FROM public.app_settings WHERE key='cron_secret';
 SELECT value INTO function_url FROM public.app_settings WHERE key='observatory_function_url';
 IF secret_value IS NULL OR secret_value='' OR function_url IS NULL THEN RAISE EXCEPTION 'Scheduler configuration missing'; END IF;
 IF EXISTS (SELECT 1 FROM public.app_settings WHERE key='observatory_monitor_pause' AND value IS NOT NULL AND value<>'') THEN RETURN; END IF;
 FOR vertical_record IN SELECT slug FROM public.observatory_verticals ORDER BY sort_order LOOP
 PERFORM net.http_post(url := function_url, headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',secret_value), body := jsonb_build_object('vertical',vertical_record.slug), timeout_milliseconds := 300000);
 END LOOP;
END; $$;
REVOKE ALL ON FUNCTION public.observatory_dispatch_monitor() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.observatory_dispatch_monitor() TO service_role;