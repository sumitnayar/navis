-- NAVIS V3 Production Relational Schema Migrations & Seeds
-- Open the Supabase SQL Editor, paste this script, and click "Run".

-- ==========================================
-- 1. DATABASE SCHEMA TABLES
-- ==========================================

-- 1. SETTINGS STORAGE
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_config',
    brand_name VARCHAR(100) DEFAULT 'NAVIS',
    company_name VARCHAR(255) DEFAULT 'ScaleFlow Technologies Pvt Ltd',
    revenue_bracket VARCHAR(100) DEFAULT '₹280 Cr (FY26)',
    ipo_timeline VARCHAR(100) DEFAULT 'Target Q3 FY27 (NSE/BSE Mainboard)',
    soc2_status VARCHAR(100) DEFAULT 'SOC 2 Type II Certified',
    business_units TEXT[] DEFAULT ARRAY['Enterprise Sales', 'Engineering & Infrastructure', 'Security Operations', 'Finance Operations', 'Legal & HR', 'Product Management'],
    locations TEXT[] DEFAULT ARRAY['Bangalore HQ', 'Chennai Dev Center', 'US Delaware Entity'],
    active_user_role VARCHAR(100) DEFAULT 'CRO (Chief Risk Officer)'
);

-- 2. STRATEGIC OBJECTIVES
CREATE TABLE IF NOT EXISTS public.strategic_objectives (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    target_date DATE NOT NULL,
    importance VARCHAR(30) CHECK (importance IN ('Critical', 'High', 'Medium', 'Low')),
    success_metrics TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('On Track', 'At Risk', 'Critical Gaps')) DEFAULT 'On Track'
);

-- 3. ENTERPRISE RISKS REGISTER
CREATE TABLE IF NOT EXISTS public.risks (
    id VARCHAR(50) PRIMARY KEY,
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
    parent_risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE SET NULL,
    child_risk_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    related_risk_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    objective_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    controls JSONB DEFAULT '[]'::JSONB,
    kris JSONB DEFAULT '[]'::JSONB,
    actions JSONB DEFAULT '[]'::JSONB,
    assurance JSONB DEFAULT '{"firstLine":"CRO","secondLine":"Risk Comm","thirdLine":"None","gapDetected":true}'::JSONB,
    last_reviewed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SCENARIO ANALYSIS SIMULATOR
CREATE TABLE IF NOT EXISTS public.scenarios (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective_id VARCHAR(50) REFERENCES public.strategic_objectives(id) ON DELETE CASCADE,
    revenue_impact JSONB NOT NULL,
    ebitda_impact JSONB NOT NULL,
    cash_impact JSONB NOT NULL,
    objective_impact TEXT NOT NULL
);

-- 5. RISK CULTURE METRICS SCORECARD
CREATE TABLE IF NOT EXISTS public.culture_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_acknowledgement_rate INT CHECK (policy_acknowledgement_rate BETWEEN 0 AND 100),
    training_completion_rate INT CHECK (training_completion_rate BETWEEN 0 AND 100),
    incident_report_velocity_days INT CHECK (incident_report_velocity_days >= 0),
    near_miss_logged_count INT CHECK (near_miss_logged_count >= 0),
    whistleblower_cases_active INT CHECK (whistleblower_cases_active >= 0),
    culture_score INT,
    trend VARCHAR(50) DEFAULT 'Stable',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RISK POSTURE HISTORICAL TREND LOGS
CREATE TABLE IF NOT EXISTS public.trend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id VARCHAR(50) REFERENCES public.risks(id) ON DELETE CASCADE,
    risk_title VARCHAR(255) NOT NULL,
    previous_score INT NOT NULL,
    new_score INT NOT NULL,
    active_user VARCHAR(100) NOT NULL,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI CACHE FOR OFFLINE FALLBACK
CREATE TABLE IF NOT EXISTS public.ai_cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. DEMO REQUESTS FROM LANDING PAGE
CREATE TABLE IF NOT EXISTS public.demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. DEMO REPOSITORY SEED DATA
-- ==========================================

-- 1. SEED DEFAULT SETTINGS
INSERT INTO public.settings (id, brand_name, company_name, revenue_bracket, ipo_timeline, active_user_role)
VALUES ('default_config', 'NAVIS', 'ScaleFlow Technologies Pvt Ltd', '₹280 Cr (FY26)', 'Target Q3 FY27 (NSE/BSE Mainboard)', 'CRO (Chief Risk Officer)')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CORPORATE STRATEGIC OBJECTIVES
INSERT INTO public.strategic_objectives (id, title, owner, target_date, importance, success_metrics, status) VALUES
('obj-ipo', 'IPO Readiness & Listing SEBI Alignment', 'CEO & Founder', '2027-09-30', 'Critical', 'Double-audited books, clean Big 4 reports, SEBI listing brochure filed, and 3 independent board directors appointed.', 'Critical Gaps'),
('obj-growth', '₹500 Cr ARR Revenue Milestones Expansion', 'CRO (Chief Revenue Officer)', '2026-12-31', 'High', 'Establish ₹500 Cr global annual recurring revenue (ARR) with Net Revenue Retention (NRR) above 115%.', 'On Track'),
('obj-retention', 'Enterprise Customer Churn Prevention (<0.5%)', 'VP of Customer Success', '2026-12-31', 'Critical', 'Maintain monthly gross logo churn below 0.5% and net revenue retention at net-negative expansion rates.', 'At Risk'),
('obj-ebitda', 'Maintain 18%+ EBITDA Margin Operating Target', 'CFO (Chief Financial Officer)', '2026-12-31', 'High', 'Operating expenses managed within bounds to hold cash margins above 18% in banker audit evaluations.', 'On Track'),
('obj-cyber', 'Zero-Downtime InfoSec & SOC 2 Trust Assurance', 'CISO (Chief Information Security Officer)', '2026-06-30', 'Critical', '100% automated test pass rate on SOC 2 agents, zero data breach reports, and zero un-scrubbed API leaks.', 'On Track')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ENTERPRISE RISKS REGISTER
INSERT INTO public.risks (id, title, category, l1, l2, l3, description, owner, business_unit, location, likelihood, impact, velocity, likelihood_residual, impact_residual, velocity_residual, parent_risk_id, objective_ids, controls, kris, actions, fragility, assurance) VALUES
(
  'risk-001', 'Top-Tier Enterprise Customer Concentration', 'Financial', 'Financial', 'Revenue Concentration', 'Enterprise Churn',
  'Our top 3 enterprise customer accounts represent 48% of total annual recurring revenue (ARR). Churn of any single account would cause a massive revenue drop, threatening our cash runway.',
  'CRO (Chief Risk Officer)', 'Enterprise Sales', 'Bangalore HQ', 4, 5, 4, 3, 4, 3, NULL, 
  ARRAY['obj-growth', 'obj-retention'],
  '[{"name": "Executive Account Sponsorship Program", "type": "Preventive", "frequency": "Monthly", "rating": "Partially Effective"}, {"name": "Multi-Year Lock-in Contracts (Minimum 24 months)", "type": "Preventive", "frequency": "Continuous", "rating": "Effective"}]'::JSONB,
  '[{"name": "Top 3 accounts revenue contribution", "current": "48%", "threshold": "35%", "status": "BREACHED"}]'::JSONB,
  '[{"id": "act-101", "title": "Negotiate 3-year enterprise renewal for Top Client", "owner": "Head of Account Management", "dueDate": "2026-06-15", "priority": "High", "status": "In Progress"}]'::JSONB,
  '{"revenue":5,"growth":4,"customerTrust":2,"technology":1,"people":2,"operations":3,"reputation":3,"valuation":5}'::JSONB,
  '{"firstLine":"CRO / VP Enterprise Sales (Ownership)","secondLine":"Risk & Compliance Committee (Monitoring)","thirdLine":"Big 4 External Audit Assurance (Assurance)","gapDetected":false}'::JSONB
),
(
  'risk-002', 'Founder Dependency on Technical & Deal Closure Architecture', 'Strategic', 'Strategic', 'Key Person Dependency', 'Founder Silo',
  'Key product and architectural designs are single-point dependent on our founder/CTO. Additionally, enterprise deals above ₹2 Cr require the CEO''s personal intervention, choking organizational scale.',
  'CEO & Founder', 'Executive Office', 'Bangalore HQ', 4, 4, 3, 3, 4, 3, NULL, 
  ARRAY['obj-ipo', 'obj-growth'],
  '[{"name": "Succession mapping for tech leadership", "type": "Corrective", "frequency": "Annually", "rating": "Ineffective"}, {"name": "Formal commercial authorization matrix", "type": "Preventive", "frequency": "Continuous", "rating": "Partially Effective"}]'::JSONB,
  '[{"name": "Founder time spent in low-level engineering audits", "current": "35%", "threshold": "15%", "status": "BREACHED"}]'::JSONB,
  '[{"id": "act-102", "title": "Recruit VP of Engineering to takeover systems architecture", "owner": "Chief People Officer", "dueDate": "2026-07-31", "priority": "High", "status": "In Progress"}]'::JSONB,
  '{"revenue":3,"growth":5,"customerTrust":3,"technology":4,"people":4,"operations":4,"reputation":2,"valuation":4}'::JSONB,
  '{"firstLine":"CEO & Founder (Ownership)","secondLine":"Board Governance Committee (Monitoring)","thirdLine":"None (GAP DETECTED)","gapDetected":true}'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SIMULATION SCENARIO PLANNERS
INSERT INTO public.scenarios (id, title, description, objective_id, revenue_impact, ebitda_impact, cash_impact, objective_impact) VALUES
('scen-cyber', 'Multitenant Datastore Cyber Attack', 'Simulation of a severe SQL injection or database credential leakage leading to customer financial transactional data leak.', 'obj-cyber', '{"best": "-₹15L", "expected": "-₹60L", "worst": "-₹2.8Cr"}'::JSONB, '{"best": "-1%", "expected": "-5%", "worst": "-18%"}'::JSONB, '{"best": "-₹20L", "expected": "-₹80L", "worst": "-₹3.2Cr"}'::JSONB, 'Worst case results in immediate loss of SOC 2 Trust compliance and forces a delay in our IPO sequence.'),
('scen-churn', 'Churn of Top 3 Enterprise Customers', 'Simulation of our three largest contract tenants churn due to product delivery delay or pricing undercuts.', 'obj-retention', '{"best": "-₹40L", "expected": "-₹1.8Cr", "worst": "-₹4.2Cr"}'::JSONB, '{"best": "-3%", "expected": "-12%", "worst": "-28%"}'::JSONB, '{"best": "-₹35L", "expected": "-₹1.5Cr", "worst": "-₹3.9Cr"}'::JSONB, 'Slashes revenue goals, compressing valuation multiples by 40% in preliminary VC discussions.'),
('scen-audit', 'Severe Independent Director Vacancy Delay', 'Simulation of regulatory SEBI prospectus block due to failure to fill our required independent director board seats.', 'obj-ipo', '{"best": "-₹0", "expected": "-₹20L", "worst": "-₹90L"}'::JSONB, '{"best": "-0.5%", "expected": "-2%", "worst": "-7%"}'::JSONB, '{"best": "-₹10L", "expected": "-₹45L", "worst": "-₹1.5Cr"}'::JSONB, 'Causes a structural delay of 12 months in NSE/BSE filing, derailing liquidity schedules for VC backers.')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL CULTURE GAUGES
INSERT INTO public.culture_metrics (policy_acknowledgement_rate, training_completion_rate, incident_report_velocity_days, near_miss_logged_count, whistleblower_cases_active, culture_score, trend)
VALUES (94, 88, 4, 28, 0, 86, 'Improving');

-- ==========================================
-- 3. V3 UPDATE & AI INSIGHTS MIGRATIONS
-- ==========================================

-- Add new columns to risks if they do not exist (for existing database upgrades)
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS last_reviewed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- AI Insights Table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    insight_text TEXT NOT NULL,
    source_data JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 4. POLICY INTELLIGENCE & RAG TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.document_vault (
    id VARCHAR(100) PRIMARY KEY,
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    document_summary TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    extracted_counts JSONB DEFAULT '{}'::JSONB,
    status VARCHAR(50) DEFAULT 'pending_review',
    changes_accepted INT DEFAULT 0,
    changes_dismissed INT DEFAULT 0,
    raw_extraction JSONB DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.policy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    framework_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_name TEXT,
    file_url TEXT,
    mime_type TEXT,
    uploaded_by UUID,
    status TEXT NOT NULL CHECK (status IN ('Uploaded', 'Processing', 'Ready', 'Failed')),
    extracted_text TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.policy_document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    section_title TEXT,
    page_number INT,
    token_count INT,
    embedding vector(1536), -- Nullable, if pgvector is available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.policy_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    cited_chunks JSONB DEFAULT '[]'::JSONB,
    confidence TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

