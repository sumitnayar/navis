-- Migration Version: 001_forward_schema (Hardened V3)
-- Description: Provision a fully normalized, multi-tenant PostgreSQL schema with audit trailing.
-- Constraints: Zero JSONB, zero arrays in core entities. Strict foreign keys and organization-level tenant isolation.

-- ==========================================
-- 1. TENANT MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. CORE CONFIGURATION & SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) DEFAULT 'default_config',
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    brand_name VARCHAR(100) DEFAULT 'NAVIS',
    company_name VARCHAR(255) DEFAULT 'ScaleFlow Technologies Pvt Ltd',
    revenue_bracket VARCHAR(100) DEFAULT '₹280 Cr (FY26)',
    ipo_timeline VARCHAR(100) DEFAULT 'Target Q3 FY27 (NSE/BSE Mainboard)',
    soc2_status VARCHAR(100) DEFAULT 'SOC 2 Type II Certified',
    PRIMARY KEY (id, organization_id)
);

CREATE TABLE IF NOT EXISTS public.settings_business_units (
    id SERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    settings_id VARCHAR(50) DEFAULT 'default_config',
    unit_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (settings_id, organization_id) REFERENCES public.settings(id, organization_id) ON DELETE CASCADE,
    UNIQUE (organization_id, unit_name)
);

CREATE TABLE IF NOT EXISTS public.settings_locations (
    id SERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    settings_id VARCHAR(50) DEFAULT 'default_config',
    location_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (settings_id, organization_id) REFERENCES public.settings(id, organization_id) ON DELETE CASCADE,
    UNIQUE (organization_id, location_name)
);

-- ==========================================
-- 3. STRATEGIC GOALS & GOVERNANCE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.strategic_objectives (
    id VARCHAR(50) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    target_date DATE NOT NULL,
    importance VARCHAR(30) CHECK (importance IN ('Critical', 'High', 'Medium', 'Low')),
    success_metrics TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('On Track', 'At Risk', 'Critical Gaps')) DEFAULT 'On Track'
);

-- ==========================================
-- 4. RISKS & RELATIONSHIPS REGISTER
-- ==========================================
CREATE TABLE IF NOT EXISTS public.risks (
    id VARCHAR(50) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    l1 VARCHAR(100) NOT NULL,
    l2 VARCHAR(100) NOT NULL,
    l3 VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    owner VARCHAR(100) NOT NULL,
    business_unit VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    likelihood INT CHECK (likelihood BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    velocity INT CHECK (velocity BETWEEN 1 AND 5),
    likelihood_residual INT CHECK (likelihood_residual BETWEEN 1 AND 5),
    impact_residual INT CHECK (impact_residual BETWEEN 1 AND 5),
    velocity_residual INT CHECK (velocity_residual BETWEEN 1 AND 5),
    residual_score INT GENERATED ALWAYS AS (likelihood_residual * impact_residual) STORED,
    appetite_status VARCHAR(50) GENERATED ALWAYS AS (
        CASE 
            WHEN (likelihood_residual * impact_residual) >= 16 THEN 'Above Appetite'
            WHEN (likelihood_residual * impact_residual) >= 11 THEN 'Near Appetite'
            ELSE 'Within Appetite'
        END
    ) STORED,
    trend VARCHAR(50) DEFAULT 'Stable',
    time_to_impact VARCHAR(50) DEFAULT 'Moderate',
    time_to_detection VARCHAR(50) DEFAULT 'Moderate',
    time_to_recovery VARCHAR(50) DEFAULT 'Moderate',
    parent_risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE SET NULL
);

-- Junction table for N-to-N Strategic Objectives
CREATE TABLE IF NOT EXISTS public.risk_to_objectives (
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    objective_id VARCHAR(50) REFERENCES public.strategic_objectives(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    PRIMARY KEY (risk_id, objective_id)
);

-- Junction table for self-referencing links
CREATE TABLE IF NOT EXISTS public.risk_relationships (
    parent_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    child_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) DEFAULT 'parent-child',
    PRIMARY KEY (parent_id, child_id, relation_type)
);

-- ==========================================
-- 5. MITIGATION CONTROLS & AUDITING
-- ==========================================
CREATE TABLE IF NOT EXISTS public.controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Preventive', 'Detective', 'Corrective')),
    frequency VARCHAR(50) NOT NULL,
    rating VARCHAR(50) NOT NULL CHECK (rating IN ('Effective', 'Partially Effective', 'Ineffective'))
);

CREATE TABLE IF NOT EXISTS public.kris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    current VARCHAR(100) NOT NULL,
    threshold VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('OK', 'BREACHED'))
);

CREATE TABLE IF NOT EXISTS public.actions (
    id VARCHAR(50) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(30) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed'))
);

CREATE TABLE IF NOT EXISTS public.risk_fragilities (
    risk_id VARCHAR(50) PRIMARY KEY REFERENCES public.risks(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    revenue INT CHECK (revenue BETWEEN 1 AND 5) DEFAULT 1,
    growth INT CHECK (growth BETWEEN 1 AND 5) DEFAULT 1,
    customer_trust INT CHECK (customer_trust BETWEEN 1 AND 5) DEFAULT 1,
    technology INT CHECK (technology BETWEEN 1 AND 5) DEFAULT 1,
    people INT CHECK (people BETWEEN 1 AND 5) DEFAULT 1,
    operations INT CHECK (operations BETWEEN 1 AND 5) DEFAULT 1,
    reputation INT CHECK (reputation BETWEEN 1 AND 5) DEFAULT 1,
    valuation INT CHECK (valuation BETWEEN 1 AND 5) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.assurance_mappings (
    risk_id VARCHAR(50) PRIMARY KEY REFERENCES public.risks(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_line VARCHAR(255) NOT NULL,
    second_line VARCHAR(255) NOT NULL,
    third_line VARCHAR(255) NOT NULL,
    gap_detected BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 6. SCENARIO ANALYSIS LAB
-- ==========================================
CREATE TABLE IF NOT EXISTS public.scenarios (
    id VARCHAR(50) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective_id VARCHAR(50) REFERENCES public.strategic_objectives(id) ON DELETE CASCADE,
    revenue_impact_best VARCHAR(50) NOT NULL,
    revenue_impact_expected VARCHAR(50) NOT NULL,
    revenue_impact_worst VARCHAR(50) NOT NULL,
    ebitda_impact_best VARCHAR(50) NOT NULL,
    ebitda_impact_expected VARCHAR(50) NOT NULL,
    ebitda_impact_worst VARCHAR(50) NOT NULL,
    cash_impact_best VARCHAR(50) NOT NULL,
    cash_impact_expected VARCHAR(50) NOT NULL,
    cash_impact_worst VARCHAR(50) NOT NULL,
    objective_impact TEXT NOT NULL
);

-- ==========================================
-- 7. RISK CULTURE & POSTURES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.culture_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    policy_acknowledgement_rate INT CHECK (policy_acknowledgement_rate BETWEEN 0 AND 100),
    training_completion_rate INT CHECK (training_completion_rate BETWEEN 0 AND 100),
    incident_report_velocity_days INT CHECK (incident_report_velocity_days >= 0),
    near_miss_logged_count INT CHECK (near_miss_logged_count >= 0),
    whistleblower_cases_active INT CHECK (whistleblower_cases_active >= 0),
    culture_score INT,
    trend VARCHAR(50) DEFAULT 'Stable',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.trend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    risk_title VARCHAR(255) NOT NULL,
    previous_score INT NOT NULL,
    new_score INT NOT NULL,
    active_user VARCHAR(100) NOT NULL,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. SECURE ENTERPRISE AUDIT TRAILS (F6)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id VARCHAR(100) NOT NULL,
    old_data JSONB DEFAULT NULL,
    new_data JSONB DEFAULT NULL,
    changed_by VARCHAR(255) DEFAULT 'system_process',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. PERFORMANCE INDEX REGISTRY
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_risks_tenant ON public.risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_category ON public.risks(category);
CREATE INDEX IF NOT EXISTS idx_controls_tenant ON public.controls(organization_id, risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON public.audit_trails(organization_id, table_name);
