-- Migration Version: rollback_schema
-- Description: Drop all public NAVIS V3 database tables cleanly in reverse dependency order.
-- Warning: This script deletes all data in these tables. Run backups before execution!

-- 1. Disable row level security on all target tables
ALTER TABLE IF EXISTS public.trend_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.culture_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assurance_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_fragilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kris DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.controls DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_to_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategic_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings_business_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- 2. Drop tables cascading all dependent constraints
DROP TABLE IF EXISTS public.trend_logs CASCADE;
DROP TABLE IF EXISTS public.culture_metrics CASCADE;
DROP TABLE IF EXISTS public.scenarios CASCADE;
DROP TABLE IF EXISTS public.assurance_mappings CASCADE;
DROP TABLE IF EXISTS public.risk_fragilities CASCADE;
DROP TABLE IF EXISTS public.actions CASCADE;
DROP TABLE IF EXISTS public.kris CASCADE;
DROP TABLE IF EXISTS public.controls CASCADE;
DROP TABLE IF EXISTS public.risk_relationships CASCADE;
DROP TABLE IF EXISTS public.risk_to_objectives CASCADE;
DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.strategic_objectives CASCADE;
DROP TABLE IF EXISTS public.settings_locations CASCADE;
DROP TABLE IF EXISTS public.settings_business_units CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 3. Notify completion
SELECT 'NAVIS schema rollback completed successfully.' AS status;
