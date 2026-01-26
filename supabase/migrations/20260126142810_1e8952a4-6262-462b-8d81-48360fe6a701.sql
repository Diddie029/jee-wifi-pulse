-- Create enum for voucher status
create type public.voucher_status as enum ('available', 'claimed', 'expired');

-- Create enum for app roles
create type public.app_role as enum ('admin', 'user');

-- Create vouchers table
create table public.vouchers (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    package_id int not null,
    package_duration text not null,
    package_price int not null,
    status voucher_status not null default 'available',
    created_at timestamp with time zone not null default now(),
    claimed_at timestamp with time zone,
    claimed_by text,
    expires_at timestamp with time zone
);

-- Create user_roles table for admin access
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Enable RLS
alter table public.vouchers enable row level security;
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for vouchers
-- Anyone can view available vouchers (for claiming)
create policy "Anyone can view available vouchers"
on public.vouchers
for select
using (status = 'available');

-- Admins can view all vouchers
create policy "Admins can view all vouchers"
on public.vouchers
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can insert vouchers
create policy "Admins can insert vouchers"
on public.vouchers
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can update vouchers
create policy "Admins can update vouchers"
on public.vouchers
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can delete vouchers
create policy "Admins can delete vouchers"
on public.vouchers
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Allow anyone to claim available vouchers (update status)
create policy "Anyone can claim available vouchers"
on public.vouchers
for update
using (status = 'available')
with check (status = 'claimed');

-- RLS Policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));