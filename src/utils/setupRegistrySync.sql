
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the registry sync to run every 6 hours
SELECT cron.schedule(
  'sync-registry-data-every-6h',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://cwzpukwrlihylylmitqq.supabase.co/functions/v1/sync-registry-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3enB1a3dybGloeWx5bG1pdHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjY3ODksImV4cCI6MjA1OTg0Mjc4OX0.QsaDEowJljGeh3Cn1XmPv6JCpYbrcSTzfhLXYeAsQJA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Optionally, schedule a daily cleanup job to remove old sync logs (older than 30 days)
SELECT cron.schedule(
  'cleanup-old-sync-logs',
  '0 2 * * *', -- Daily at 2 AM
  $$
  DELETE FROM public.registry_sync_logs 
  WHERE start_time < NOW() - INTERVAL '30 days';
  $$
);
```

-- View all scheduled jobs
SELECT * FROM cron.job;

-- To unschedule jobs if needed:
-- SELECT cron.unschedule('sync-registry-data-every-6h');
-- SELECT cron.unschedule('cleanup-old-sync-logs');
