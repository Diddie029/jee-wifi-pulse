-- =============================================
-- HOTSPOT MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =============================================

-- 1. LOCATIONS TABLE (Multi-location support)
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  router_ip TEXT,
  router_type TEXT DEFAULT 'mikrotik',
  api_port INTEGER DEFAULT 8728,
  api_username TEXT,
  ssid TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. HOTSPOT USERS TABLE (Username/Password login)
CREATE TABLE public.hotspot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  mac_address TEXT,
  is_active BOOLEAN DEFAULT true,
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  data_limit_mb INTEGER,
  bandwidth_limit_mbps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. USER SESSIONS TABLE (Track active sessions)
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.hotspot_users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  mac_address TEXT NOT NULL,
  ip_address TEXT,
  device_name TEXT,
  device_type TEXT,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  time_limit_seconds INTEGER,
  time_used_seconds INTEGER DEFAULT 0,
  data_limit_mb INTEGER,
  data_used_mb NUMERIC(10,2) DEFAULT 0,
  bandwidth_up_mbps INTEGER,
  bandwidth_down_mbps INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected', 'paused')),
  auth_method TEXT CHECK (auth_method IN ('voucher', 'password', 'mac', 'qr', 'sms', 'social')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. BLACKLIST TABLE
CREATE TABLE public.blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT,
  ip_address TEXT,
  phone_number TEXT,
  reason TEXT NOT NULL,
  blocked_by UUID,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  CONSTRAINT at_least_one_identifier CHECK (mac_address IS NOT NULL OR ip_address IS NOT NULL OR phone_number IS NOT NULL)
);

-- 5. WHITELIST TABLE (Auto-connect devices, walled garden)
CREATE TABLE public.whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT,
  ip_address TEXT,
  domain TEXT,
  description TEXT,
  is_walled_garden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. PAYMENTS TABLE (M-Pesa and other payments)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.hotspot_users(id) ON DELETE SET NULL,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_method TEXT DEFAULT 'mpesa',
  transaction_id TEXT UNIQUE,
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  mpesa_receipt TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  package_id INTEGER,
  package_duration TEXT,
  location_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. DEVICE TRACKING TABLE (Per-voucher device limits)
CREATE TABLE public.voucher_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE NOT NULL,
  mac_address TEXT NOT NULL,
  device_name TEXT,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(voucher_id, mac_address)
);

-- 8. Add columns to vouchers table
ALTER TABLE public.vouchers 
ADD COLUMN IF NOT EXISTS device_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS data_limit_mb INTEGER,
ADD COLUMN IF NOT EXISTS bandwidth_up_mbps INTEGER,
ADD COLUMN IF NOT EXISTS bandwidth_down_mbps INTEGER,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS is_reusable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;

-- 9. PACKAGES TABLE (Editable by admin)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  duration_display TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  data_limit_mb INTEGER,
  bandwidth_up_mbps INTEGER,
  bandwidth_down_mbps INTEGER,
  device_limit INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default packages
INSERT INTO public.packages (name, duration_minutes, duration_display, price, sort_order) VALUES
  ('Quick Access', 40, '40 minutes', 5, 1),
  ('Standard', 120, '2 hours', 10, 2),
  ('Extended', 360, '6 hours', 19, 3),
  ('Half Day', 720, '12 hours', 29, 4),
  ('Full Day', 1440, '24 hours', 39, 5),
  ('Weekly', 10080, '1 week', 199, 6),
  ('Monthly', 43200, '1 month', 799, 7);

-- 10. SMS OTP TABLE
CREATE TABLE public.sms_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_otp ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Permissive for demo)
-- =============================================

-- Locations (public read, admin write)
CREATE POLICY "Anyone can view active locations" ON public.locations FOR SELECT USING (is_active = true);
CREATE POLICY "Allow all location management" ON public.locations FOR ALL USING (true);

-- Hotspot Users
CREATE POLICY "Allow all hotspot_users" ON public.hotspot_users FOR ALL USING (true);

-- User Sessions
CREATE POLICY "Allow all user_sessions" ON public.user_sessions FOR ALL USING (true);

-- Blacklist
CREATE POLICY "Allow all blacklist" ON public.blacklist FOR ALL USING (true);

-- Whitelist
CREATE POLICY "Allow all whitelist" ON public.whitelist FOR ALL USING (true);

-- Payments
CREATE POLICY "Allow all payments" ON public.payments FOR ALL USING (true);

-- Voucher Devices
CREATE POLICY "Allow all voucher_devices" ON public.voucher_devices FOR ALL USING (true);

-- Packages
CREATE POLICY "Anyone can view active packages" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Allow all package management" ON public.packages FOR ALL USING (true);

-- SMS OTP
CREATE POLICY "Allow all sms_otp" ON public.sms_otp FOR ALL USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to auto-expire vouchers
CREATE OR REPLACE FUNCTION public.expire_vouchers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.vouchers 
  SET status = 'expired' 
  WHERE status = 'available' 
    AND expires_at IS NOT NULL 
    AND expires_at < now();
END;
$$;

-- Function to check device limit
CREATE OR REPLACE FUNCTION public.check_voucher_device_limit(
  _voucher_id UUID,
  _mac_address TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _device_limit INTEGER;
  _current_devices INTEGER;
  _device_exists BOOLEAN;
BEGIN
  -- Get voucher device limit
  SELECT device_limit INTO _device_limit FROM public.vouchers WHERE id = _voucher_id;
  
  -- Check if this device already registered
  SELECT EXISTS(
    SELECT 1 FROM public.voucher_devices 
    WHERE voucher_id = _voucher_id AND mac_address = _mac_address
  ) INTO _device_exists;
  
  IF _device_exists THEN
    RETURN true;
  END IF;
  
  -- Count current devices
  SELECT COUNT(*) INTO _current_devices 
  FROM public.voucher_devices 
  WHERE voucher_id = _voucher_id AND is_active = true;
  
  RETURN _current_devices < COALESCE(_device_limit, 1);
END;
$$;

-- Function to check if MAC/phone is blacklisted
CREATE OR REPLACE FUNCTION public.is_blacklisted(
  _mac_address TEXT DEFAULT NULL,
  _phone_number TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.blacklist
    WHERE (
      (_mac_address IS NOT NULL AND mac_address = _mac_address) OR
      (_phone_number IS NOT NULL AND phone_number = _phone_number) OR
      (_ip_address IS NOT NULL AND ip_address = _ip_address)
    )
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Enable realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;