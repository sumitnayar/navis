-- Migration Version: 004_auth_required_reads
-- Description: Require an authenticated Supabase session for all tenant read policies.

ALTER POLICY "Tenant read organizations" ON public.organizations TO authenticated;
ALTER POLICY "Tenant read settings" ON public.settings TO authenticated;
ALTER POLICY "Tenant read business units" ON public.settings_business_units TO authenticated;
ALTER POLICY "Tenant read locations" ON public.settings_locations TO authenticated;
ALTER POLICY "Tenant read strategic objectives" ON public.strategic_objectives TO authenticated;
ALTER POLICY "Tenant read risks" ON public.risks TO authenticated;
ALTER POLICY "Tenant read risk to objectives" ON public.risk_to_objectives TO authenticated;
ALTER POLICY "Tenant read risk relationships" ON public.risk_relationships TO authenticated;
ALTER POLICY "Tenant read controls" ON public.controls TO authenticated;
ALTER POLICY "Tenant read kris" ON public.kris TO authenticated;
ALTER POLICY "Tenant read actions" ON public.actions TO authenticated;
ALTER POLICY "Tenant read fragility" ON public.risk_fragilities TO authenticated;
ALTER POLICY "Tenant read assurance" ON public.assurance_mappings TO authenticated;
ALTER POLICY "Tenant read scenarios" ON public.scenarios TO authenticated;
ALTER POLICY "Tenant read culture" ON public.culture_metrics TO authenticated;
ALTER POLICY "Tenant read trends" ON public.trend_logs TO authenticated;
ALTER POLICY "Tenant read audits" ON public.audit_trails TO authenticated;
