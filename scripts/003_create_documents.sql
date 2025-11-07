-- Create documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  document_type text not null check (document_type in ('license', 'certification', 'insurance', 'other')),
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  uploaded_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  notes text
);

alter table public.documents enable row level security;

-- Documents policies
create policy "Providers can view their own documents"
  on public.documents for select
  using (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

create policy "Providers can insert their own documents"
  on public.documents for insert
  with check (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

create policy "Providers can update their own documents"
  on public.documents for update
  using (
    provider_id in (
      select id from public.providers where user_id = auth.uid()
    )
  );

-- Admins can view all documents
create policy "Admins can view all documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all documents
create policy "Admins can update all documents"
  on public.documents for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
