-- Drop old RLS policies that reference profiles
DROP POLICY IF EXISTS "Providers can view their own links" ON public.provider_company_links;
DROP POLICY IF EXISTS "Providers can request links" ON public.provider_company_links;
DROP POLICY IF EXISTS "Admins can view links to their companies" ON public.provider_company_links;
DROP POLICY IF EXISTS "Admins can update links to their companies" ON public.provider_company_links;

-- Create new RLS policies that work with the providers table foreign key
-- Providers can view their own links (match by user_id through providers table)
CREATE POLICY "Providers can view their own links"
  ON public.provider_company_links FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- Providers can insert their own links (match by user_id through providers table)
CREATE POLICY "Providers can insert their own links"
  ON public.provider_company_links FOR INSERT
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- Admins can view links to their companies
CREATE POLICY "Admins can view links to their companies"
  ON public.provider_company_links FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

-- Admins can update links to their companies (for approval/rejection)
CREATE POLICY "Admins can update links to their companies"
  ON public.provider_company_links FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );

-- Admins can delete links to their companies (for removing providers)
CREATE POLICY "Admins can delete links to their companies"
  ON public.provider_company_links FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE admin_id = auth.uid()
    )
  );
