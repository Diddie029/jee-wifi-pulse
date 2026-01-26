-- Drop existing insert policy that requires admin role
DROP POLICY IF EXISTS "Admins can insert vouchers" ON public.vouchers;

-- Create a policy that allows anyone to insert vouchers (for demo purposes)
-- In production, this should require proper admin authentication
CREATE POLICY "Allow insert vouchers"
ON public.vouchers
FOR INSERT
WITH CHECK (true);

-- Also allow updates and deletes for demo
DROP POLICY IF EXISTS "Admins can update vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admins can delete vouchers" ON public.vouchers;

CREATE POLICY "Allow update vouchers"
ON public.vouchers
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete vouchers"
ON public.vouchers
FOR DELETE
USING (true);

-- Update select policy to allow viewing all vouchers
DROP POLICY IF EXISTS "Admins can view all vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Anyone can view available vouchers" ON public.vouchers;

CREATE POLICY "Allow select vouchers"
ON public.vouchers
FOR SELECT
USING (true);