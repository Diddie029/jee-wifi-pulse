-- Create table for tracking connected users/sessions
CREATE TABLE public.connected_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  package_id INTEGER NOT NULL,
  package_duration TEXT NOT NULL,
  package_price INTEGER NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  voucher_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.connected_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for connected_users (permissive for demo - should be admin-only in production)
CREATE POLICY "Allow select connected_users"
ON public.connected_users FOR SELECT
USING (true);

CREATE POLICY "Allow insert connected_users"
ON public.connected_users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update connected_users"
ON public.connected_users FOR UPDATE
USING (true);

CREATE POLICY "Allow delete connected_users"
ON public.connected_users FOR DELETE
USING (true);

-- Enable realtime for connected_users
ALTER PUBLICATION supabase_realtime ADD TABLE public.connected_users;