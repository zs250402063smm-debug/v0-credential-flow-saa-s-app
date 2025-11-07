-- Add company_id to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add company_id to licenses table
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- Drop existing policies before recreating to avoid "already exists" error
DROP POLICY IF EXISTS "Admins can view company documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update company documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view company licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can update company licenses" ON public.licenses;

-- Drop old policies
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can update all licenses" ON public.licenses;

-- Create new RLS policies for documents with company_id filtering
CREATE POLICY "Admins can view company documents"
  ON public.documents FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update company documents"
  ON public.documents FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create new RLS policies for licenses with company_id filtering
CREATE POLICY "Admins can view company licenses"
  ON public.licenses FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update company licenses"
  ON public.licenses FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_licenses_company_id ON public.licenses(company_id);
