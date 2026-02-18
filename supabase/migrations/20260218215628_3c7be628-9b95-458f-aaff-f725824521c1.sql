
CREATE TABLE public.access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_entered text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_hint text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs" ON public.access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read logs" ON public.access_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
