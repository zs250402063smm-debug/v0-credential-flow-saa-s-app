-- Create companies table for multi-tenant support
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enrollment_code text unique not null,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.companies enable row level security;

-- Companies policies
create policy "Admins can view their own company"
  on public.companies for select
  using (admin_id = auth.uid());

create policy "Admins can create companies"
  on public.companies for insert
  with check (admin_id = auth.uid());

create policy "Admins can update their own company"
  on public.companies for update
  using (admin_id = auth.uid());

-- Create provider_company_links table for many-to-many relationship
create table if not exists public.provider_company_links (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  unique(provider_id, company_id)
);

alter table public.provider_company_links enable row level security;

-- Provider company links policies
create policy "Providers can view their own links"
  on public.provider_company_links for select
  using (provider_id = auth.uid());

create policy "Providers can request links"
  on public.provider_company_links for insert
  with check (provider_id = auth.uid());

create policy "Admins can view links to their companies"
  on public.provider_company_links for select
  using (
    exists (
      select 1 from public.companies
      where id = company_id and admin_id = auth.uid()
    )
  );

create policy "Admins can update links to their companies"
  on public.provider_company_links for update
  using (
    exists (
      select 1 from public.companies
      where id = company_id and admin_id = auth.uid()
    )
  );

-- Add company_id to profiles for admin linking
alter table public.profiles add column if not exists company_id uuid references public.companies(id);

-- Add company_id to providers, documents, and licenses for data segregation
alter table public.providers add column if not exists company_id uuid references public.companies(id);
alter table public.documents add column if not exists company_id uuid references public.companies(id);
alter table public.licenses add column if not exists company_id uuid references public.companies(id);

-- Update RLS policies to include company_id filtering
drop policy if exists "Admins can view all providers" on public.providers;
create policy "Admins can view company providers"
  on public.providers for select
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

drop policy if exists "Admins can update all providers" on public.providers;
create policy "Admins can update company providers"
  on public.providers for update
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

drop policy if exists "Admins can delete providers" on public.providers;
create policy "Admins can delete company providers"
  on public.providers for delete
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

-- Similar updates for documents
drop policy if exists "Admins can view all documents" on public.documents;
create policy "Admins can view company documents"
  on public.documents for select
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

drop policy if exists "Admins can update all documents" on public.documents;
create policy "Admins can update company documents"
  on public.documents for update
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

-- Similar updates for licenses
drop policy if exists "Admins can view all licenses" on public.licenses;
create policy "Admins can view company licenses"
  on public.licenses for select
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

drop policy if exists "Admins can update all licenses" on public.licenses;
create policy "Admins can update company licenses"
  on public.licenses for update
  using (
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

-- Function to generate unique enrollment code
create or replace function generate_enrollment_code()
returns text
language plpgsql
as $$
declare
  code text;
  exists boolean;
begin
  loop
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    select count(*) > 0 into exists
    from public.companies
    where enrollment_code = code;
    
    exit when not exists;
  end loop;
  
  return code;
end;
$$;
