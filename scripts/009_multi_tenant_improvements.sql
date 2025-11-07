-- Add request_note column to provider_company_links table
alter table public.provider_company_links add column if not exists request_note text;

-- Add rejected_at and rejected_by columns for tracking rejections
alter table public.provider_company_links add column if not exists rejected_at timestamptz;
alter table public.provider_company_links add column if not exists rejected_by uuid references public.profiles(id);

-- Create indexes for better query performance
create index if not exists idx_provider_company_links_provider on public.provider_company_links(provider_id);
create index if not exists idx_provider_company_links_company on public.provider_company_links(company_id);
create index if not exists idx_provider_company_links_status on public.provider_company_links(status);

-- Add policy for admins to delete provider links (remove providers from company)
create policy "Admins can delete links from their companies"
  on public.provider_company_links for delete
  using (
    exists (
      select 1 from public.companies
      where id = company_id and admin_id = auth.uid()
    )
  );

-- Update providers table to support multiple companies (remove NOT NULL constraint if exists)
-- Providers can belong to multiple companies through provider_company_links
alter table public.providers alter column company_id drop not null;

-- Add policy for providers to insert documents linked to their approved companies
drop policy if exists "Providers can insert their own documents" on public.documents;
create policy "Providers can insert documents for approved companies"
  on public.documents for insert
  with check (
    provider_id in (
      select p.id from public.providers p
      inner join public.provider_company_links pcl on pcl.provider_id = (
        select id from public.profiles where id = auth.uid()
      )
      where p.user_id = auth.uid()
      and pcl.status = 'approved'
      and p.company_id = pcl.company_id
    )
  );

-- Log table for tracking admin actions
create table if not exists public.admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null check (action_type in ('approve_request', 'reject_request', 'remove_provider', 'approve_document', 'reject_document')),
  target_id uuid not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  notes text,
  created_at timestamptz default now()
);

alter table public.admin_action_logs enable row level security;

-- Policy for admins to view their own action logs
create policy "Admins can view their action logs"
  on public.admin_action_logs for select
  using (
    admin_id = auth.uid() or
    company_id in (
      select id from public.companies where admin_id = auth.uid()
    )
  );

-- Policy for admins to insert action logs
create policy "Admins can insert action logs"
  on public.admin_action_logs for insert
  with check (admin_id = auth.uid());
