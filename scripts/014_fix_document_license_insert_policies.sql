-- Fix RLS policies for documents and licenses to allow provider inserts with company_id

-- Drop and recreate provider INSERT policies for documents
DROP POLICY IF EXISTS "Providers can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Providers can insert documents for approved companies" ON public.documents;

-- Allow providers to insert documents for any company they're approved for
CREATE POLICY "Providers can insert documents for approved companies"
  ON public.documents FOR INSERT
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
    AND company_id IN (
      SELECT pcl.company_id 
      FROM public.provider_company_links pcl
      INNER JOIN public.providers p ON p.id = pcl.provider_id
      WHERE p.user_id = auth.uid() 
      AND pcl.status = 'approved'
    )
  );

-- Drop and recreate provider INSERT policies for licenses
DROP POLICY IF EXISTS "Providers can insert their own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Providers can insert licenses for approved companies" ON public.licenses;

-- Allow providers to insert licenses for any company they're approved for
CREATE POLICY "Providers can insert licenses for approved companies"
  ON public.licenses FOR INSERT
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
    AND company_id IN (
      SELECT pcl.company_id 
      FROM public.provider_company_links pcl
      INNER JOIN public.providers p ON p.id = pcl.provider_id
      WHERE p.user_id = auth.uid() 
      AND pcl.status = 'approved'
    )
  );

-- Verify policies are created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'licenses')
ORDER BY tablename, policyname;
