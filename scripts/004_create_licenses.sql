-- Create licenses table
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  license_number text not null,
  license_type text not null,
  issuing_state text not null,
  issue_date date not null,
  expiration_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'suspended', 'revoked')),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'failed')),
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.licenses enable row level security;

-- Licenses policies
create policy "Providers can view their own licenses"
  on public.licenses for select
  using (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

create policy "Providers can insert their own licenses"
  on public.licenses for insert
  with check (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

create policy "Providers can update their own licenses"
  on public.licenses for update
  using (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

-- Admins can view all licenses
create policy "Admins can view all licenses"
  on public.licenses for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all licenses
create policy "Admins can update all licenses"
  on public.licenses for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
