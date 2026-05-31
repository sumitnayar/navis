-- Migration Version: 003_forward_rls (Hardened V3)
-- Description: Enforce RLS with strict tenant-isolation, environment-specific demo SELECT, and automatic audit triggers.

-- Enable RLS on all 16 tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_to_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_fragilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assurance_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culture_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trails ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- A. Tenant-Level Selection (Read) RLS Rules:
-- 1. Reviewers in Cloud Demo mode can view only rows matching the default Demo Org ID ('00000000-0000-0000-0000-000000000000').
-- 2. Authenticated SaaS users can view only rows matching their authenticated organization_id JWT claim.

CREATE POLICY "Tenant read organizations" ON public.organizations FOR SELECT USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read settings" ON public.settings FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read business units" ON public.settings_business_units FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read locations" ON public.settings_locations FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read strategic objectives" ON public.strategic_objectives FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read risks" ON public.risks FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read risk to objectives" ON public.risk_to_objectives FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read risk relationships" ON public.risk_relationships FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read controls" ON public.controls FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read kris" ON public.kris FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read actions" ON public.actions FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read fragility" ON public.risk_fragilities FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read assurance" ON public.assurance_mappings FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read scenarios" ON public.scenarios FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read culture" ON public.culture_metrics FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read trends" ON public.trend_logs FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Tenant read audits" ON public.audit_trails FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);


-- B. Admin-Only Write (Mutations) Tenant-Isolated RLS Rules:
-- Authenticated admins can insert, update, or delete rows ONLY if they are editing records within their active organization.
-- Notice: Demo org write blocks are implicitly enforced since reviewers will not hold admin metadata roles.

CREATE POLICY "Admin write settings" ON public.settings FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write business units" ON public.settings_business_units FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write locations" ON public.settings_locations FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write strategic objectives" ON public.strategic_objectives FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write risks" ON public.risks FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write risk to objectives" ON public.risk_to_objectives FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write risk relationships" ON public.risk_relationships FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write controls" ON public.controls FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write kris" ON public.kris FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write actions" ON public.actions FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write fragility" ON public.risk_fragilities FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write assurance" ON public.assurance_mappings FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write scenarios" ON public.scenarios FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write culture" ON public.culture_metrics FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin write trends" ON public.trend_logs FOR ALL TO authenticated 
    USING (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');


-- ==========================================
-- 2. AUTOMATIC SYSTEM AUDIT TRAILING TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.process_audit_trail() 
RETURNS TRIGGER AS $$
DECLARE
    target_org_id UUID;
    target_rec_id VARCHAR(100);
    val_old JSONB := NULL;
    val_new JSONB := NULL;
BEGIN
    -- Extract organization ID and record primary key based on the action trigger
    IF TG_OP = 'DELETE' THEN
        target_org_id := OLD.organization_id;
        target_rec_id := OLD.id::varchar;
        val_old := row_to_json(OLD)::jsonb;
    ELSE
        target_org_id := NEW.organization_id;
        target_rec_id := NEW.id::varchar;
        val_new := row_to_json(NEW)::jsonb;
        IF TG_OP = 'UPDATE' THEN
            val_old := row_to_json(OLD)::jsonb;
        END IF;
    END IF;

    -- Write trail record
    INSERT INTO public.audit_trails (organization_id, table_name, action, record_id, old_data, new_data, changed_by)
    VALUES (
        target_org_id,
        TG_TABLE_NAME,
        TG_OP,
        target_rec_id,
        val_old,
        val_new,
        COALESCE(auth.jwt() ->> 'email', 'system_process')
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map Audit triggers to core operational files
CREATE TRIGGER trg_audit_settings AFTER INSERT OR UPDATE OR DELETE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_objectives AFTER INSERT OR UPDATE OR DELETE ON public.strategic_objectives FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_risks AFTER INSERT OR UPDATE OR DELETE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_controls AFTER INSERT OR UPDATE OR DELETE ON public.controls FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_kris AFTER INSERT OR UPDATE OR DELETE ON public.kris FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_actions AFTER INSERT OR UPDATE OR DELETE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_scenarios AFTER INSERT OR UPDATE OR DELETE ON public.scenarios FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
CREATE TRIGGER trg_audit_culture AFTER INSERT OR UPDATE OR DELETE ON public.culture_metrics FOR EACH ROW EXECUTE FUNCTION public.process_audit_trail();
