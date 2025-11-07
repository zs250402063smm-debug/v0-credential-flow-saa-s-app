-- Create providers table
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  npi text unique not null,
  specialty text not null,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive', 'suspended')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.providers enable row level security;

-- Providers policies
create policy "Providers can view their own data"
  on public.providers for select
  using (user_id = auth.uid());

create policy "Providers can update their own data"
  on public.providers for update
  using (user_id = auth.uid());

create policy "Providers can insert their own data"
  on public.providers for insert
  with check (user_id = auth.uid());

-- Admins can view all providers
create policy "Admins can view all providers"
  on public.providers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all providers
create policy "Admins can update all providers"
  on public.providers for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete providers
create policy "Admins can delete providers"
  on public.providers for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
