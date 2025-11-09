-- Verify and fix multi-tenant schema integrity

-- Check for orphaned provider_company_links
SELECT 
  pcl.id as link_id,
  pcl.provider_id,
  pcl.company_id,
  pcl.status
FROM provider_company_links pcl
LEFT JOIN providers p ON pcl.provider_id = p.id
WHERE p.id IS NULL;

-- Clean up any orphaned links (if any exist)
DELETE FROM provider_company_links
WHERE provider_id NOT IN (SELECT id FROM providers);

-- Verify foreign key constraints are in place
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'provider_company_links';

-- Add NOT NULL constraint to critical fields if missing
ALTER TABLE provider_company_links 
  ALTER COLUMN provider_id SET NOT NULL,
  ALTER COLUMN company_id SET NOT NULL;

-- Ensure providers table has unique constraint on user_id
ALTER TABLE providers 
  DROP CONSTRAINT IF EXISTS providers_user_id_key;

ALTER TABLE providers 
  ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
