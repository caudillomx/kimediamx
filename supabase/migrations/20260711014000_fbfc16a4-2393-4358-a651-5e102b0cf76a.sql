DO $$
DECLARE
  table_names text[] := ARRAY[
    'team_members',
    'minutes',
    'clients',
    'client_objectives',
    'client_weekly_milestones',
    'fireflies_meetings',
    'fireflies_filter_rules'
  ];
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;