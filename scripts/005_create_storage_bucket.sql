-- Create storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies for documents bucket
create policy "Providers can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Providers can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Providers can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Providers can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can access all documents
create policy "Admins can view all documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
