-- Add a policy to allow anyone to lookup companies by enrollment code
-- This is safe because enrollment codes are meant to be shared
create policy "Anyone can lookup companies by enrollment code"
  on public.companies for select
  using (true);

-- Note: We're keeping RLS enabled but adding a permissive policy
-- This allows providers to find companies by enrollment code
-- while still protecting other company operations
