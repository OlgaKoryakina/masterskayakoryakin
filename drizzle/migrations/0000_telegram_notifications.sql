ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS notified_at timestamptz;
ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS notified_at timestamptz;
CREATE TABLE public.telegram_recipients (
  chat_id bigint PRIMARY KEY,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_recipients TO service_role;
GRANT SELECT, DELETE ON public.telegram_recipients TO authenticated;
ALTER TABLE public.telegram_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_recipients_admin_select ON public.telegram_recipients FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY telegram_recipients_admin_delete ON public.telegram_recipients FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));