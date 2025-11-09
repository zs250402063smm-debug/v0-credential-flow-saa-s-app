-- Fix provider_company_links to reference providers table correctly
ALTER TABLE public.provider_company_links 
DROP CONSTRAINT IF EXISTS provider_company_links_provider_id_fkey;

ALTER TABLE public.provider_company_links 
ADD CONSTRAINT provider_company_links_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;

-- Drop old policies that might be using profiles.company_id
DROP POLICY IF EXISTS "Admins can view company documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update company documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view company licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can update company licenses" ON public.licenses;

-- Create correct RLS policies using companies table
CREATE POLICY "Admins can view company documents"
  ON public.documents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update company documents"
  ON public.documents FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view company licenses"
  ON public.licenses FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update company licenses"
  ON public.licenses FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_provider_company_links_provider_id ON public.provider_company_links(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_company_links_company_id ON public.provider_company_links(company_id);
CREATE INDEX IF NOT EXISTS idx_provider_company_links_status ON public.provider_company_links(status);

-- Add request_note column if missing
ALTER TABLE public.provider_company_links ADD COLUMN IF NOT EXISTS request_note text;

-- Create admin_action_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own logs"
  ON public.admin_action_logs FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can insert logs"
  ON public.admin_action_logs FOR INSERT
  WITH CHECK (admin_id = auth.uid());
