-- Migration Version: 002_forward_seeds (Hardened V3)
-- Description: Seed multi-tenant production PostgreSQL tables with the default ScaleFlow Demo Organization dataset.

-- 1. SEED DEFAULT DEMO TENANT ORGANISATION
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'ScaleFlow Demo Organization')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DEFAULT SETTINGS
INSERT INTO public.settings (id, organization_id, brand_name, company_name, revenue_bracket, ipo_timeline, soc2_status)
VALUES ('default_config', '00000000-0000-0000-0000-000000000000'::uuid, 'NAVIS', 'ScaleFlow Technologies Pvt Ltd', '₹280 Cr (FY26)', 'Target Q3 FY27 (NSE/BSE Mainboard)', 'SOC 2 Type II Certified')
ON CONFLICT (id, organization_id) DO NOTHING;

-- Seed Settings Business Units
INSERT INTO public.settings_business_units (organization_id, settings_id, unit_name) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Enterprise Sales'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Engineering & Infrastructure'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Security Operations'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Finance Operations'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Legal & HR'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Product Management')
ON CONFLICT (organization_id, unit_name) DO NOTHING;

-- Seed Settings Locations
INSERT INTO public.settings_locations (organization_id, settings_id, location_name) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Bangalore HQ'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'Chennai Dev Center'),
('00000000-0000-0000-0000-000000000000'::uuid, 'default_config', 'US Delaware Entity')
ON CONFLICT (organization_id, location_name) DO NOTHING;

-- 3. SEED STRATEGIC OBJECTIVES
INSERT INTO public.strategic_objectives (id, organization_id, title, owner, target_date, importance, success_metrics, status) VALUES
('obj-ipo', '00000000-0000-0000-0000-000000000000'::uuid, 'IPO Readiness & Listing SEBI Alignment', 'CEO & Founder', '2027-09-30', 'Critical', 'Double-audited books, clean Big 4 reports, SEBI listing brochure filed, and 3 independent board directors successfully appointed.', 'Critical Gaps'),
('obj-growth', '00000000-0000-0000-0000-000000000000'::uuid, '₹500 Cr ARR Revenue Milestones Expansion', 'CRO (Chief Revenue Officer)', '2026-12-31', 'High', 'Establish ₹500 Cr global annual recurring revenue (ARR) with Net Revenue Retention (NRR) hovering above 115%.', 'On Track'),
('obj-retention', '00000000-0000-0000-0000-000000000000'::uuid, 'Enterprise Customer Churn Prevention (<0.5%)', 'VP of Customer Success', '2026-12-31', 'Critical', 'Maintain monthly gross logo churn below 0.5% and net revenue retention at net-negative expansion rates.', 'At Risk'),
('obj-ebitda', '00000000-0000-0000-0000-000000000000'::uuid, 'Maintain 18%+ EBITDA Margin Operating Target', 'CFO (Chief Financial Officer)', '2026-12-31', 'High', 'Operating expenses managed within bounds to hold cash margins above 18% in prelim bankers audit evaluations.', 'On Track'),
('obj-cyber', '00000000-0000-0000-0000-000000000000'::uuid, 'Zero-Downtime InfoSec & SOC 2 Trust Assurance', 'CISO (Chief Information Security Officer)', '2026-06-30', 'Critical', '100% automated test pass rate on SOC 2 agents, zero data breach reports, and zero un-scrubbed API leaks.', 'On Track')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED CORE RISKS
INSERT INTO public.risks (id, organization_id, title, category, l1, l2, l3, description, owner, business_unit, location, likelihood, impact, velocity, likelihood_residual, impact_residual, velocity_residual, parent_risk_id, trend, time_to_impact, time_to_detection, time_to_recovery) VALUES
(
  'risk-001', '00000000-0000-0000-0000-000000000000'::uuid, 'Top-Tier Enterprise Customer Concentration', 'Financial', 'Financial', 'Revenue Concentration', 'Enterprise Churn',
  'Our top 3 enterprise customer accounts represent 48% of total annual recurring revenue (ARR). Churn of any single account would cause a massive revenue drop, threatening our cash runway.',
  'CRO (Chief Risk Officer)', 'Enterprise Sales', 'Bangalore HQ', 4, 5, 4, 3, 4, 3, NULL, 'Deteriorating', 'Moderate', 'Fast', 'Slow'
),
(
  'risk-002', '00000000-0000-0000-0000-000000000000'::uuid, 'Founder Dependency on Technical & Deal Closure Architecture', 'Strategic', 'Strategic', 'Key Person Dependency', 'Founder Silo',
  'Key product and architectural designs are single-point dependent on our founder/CTO. Additionally, enterprise deals above ₹2 Cr require the CEO''s personal intervention, choking organizational scale.',
  'CEO & Founder', 'Executive Office', 'Bangalore HQ', 4, 4, 3, 3, 4, 3, NULL, 'Stable', 'Slow', 'Moderate', 'Very Slow'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Junction Risk-Objective Links
INSERT INTO public.risk_to_objectives (risk_id, objective_id, organization_id) VALUES
('risk-001', 'obj-growth', '00000000-0000-0000-0000-000000000000'::uuid),
('risk-001', 'obj-retention', '00000000-0000-0000-0000-000000000000'::uuid),
('risk-002', 'obj-ipo', '00000000-0000-0000-0000-000000000000'::uuid),
('risk-002', 'obj-growth', '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (risk_id, objective_id) DO NOTHING;

-- Seed Risk Relationships
INSERT INTO public.risk_relationships (parent_id, child_id, organization_id, relation_type) VALUES
('risk-002', 'risk-001', '00000000-0000-0000-0000-000000000000'::uuid, 'related')
ON CONFLICT (parent_id, child_id, relation_type) DO NOTHING;

-- Seed Risk Controls
INSERT INTO public.controls (organization_id, risk_id, name, type, frequency, rating) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-001', 'Executive Account Sponsorship Program', 'Preventive', 'Monthly', 'Partially Effective'),
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-001', 'Multi-Year Lock-in Contracts (Minimum 24 months)', 'Preventive', 'Continuous', 'Effective'),
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-002', 'Succession mapping for tech leadership', 'Corrective', 'Annually', 'Ineffective'),
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-002', 'Formal commercial authorization matrix', 'Preventive', 'Continuous', 'Partially Effective')
ON CONFLICT DO NOTHING;

-- Seed Risk KRIs
INSERT INTO public.kris (organization_id, risk_id, name, current, threshold, status) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-001', 'Top 3 accounts revenue contribution', '48%', '35%', 'BREACHED'),
('00000000-0000-0000-0000-000000000000'::uuid, 'risk-002', 'Founder time spent in low-level engineering audits', '35%', '15%', 'BREACHED')
ON CONFLICT DO NOTHING;

-- Seed Risk Actions
INSERT INTO public.actions (id, organization_id, risk_id, title, owner, due_date, priority, status) VALUES
('act-101', '00000000-0000-0000-0000-000000000000'::uuid, 'risk-001', 'Negotiate 3-year enterprise renewal for Top Client', 'Head of Account Management', '2026-06-15', 'High', 'In Progress'),
('act-102', '00000000-0000-0000-0000-000000000000'::uuid, 'risk-002', 'Recruit VP of Engineering to takeover systems architecture', 'Chief People Officer', '2026-07-31', 'High', 'In Progress')
ON CONFLICT (id) DO NOTHING;

-- Seed Risk Fragilities
INSERT INTO public.risk_fragilities (risk_id, organization_id, revenue, growth, customer_trust, technology, people, operations, reputation, valuation) VALUES
('risk-001', '00000000-0000-0000-0000-000000000000'::uuid, 5, 4, 2, 1, 2, 3, 3, 5),
('risk-002', '00000000-0000-0000-0000-000000000000'::uuid, 3, 5, 3, 4, 4, 4, 2, 4)
ON CONFLICT (risk_id) DO NOTHING;

-- Seed Risk Assurances
INSERT INTO public.assurance_mappings (risk_id, organization_id, first_line, second_line, third_line, gap_detected) VALUES
('risk-001', '00000000-0000-0000-0000-000000000000'::uuid, 'CRO / VP Enterprise Sales (Ownership)', 'Risk & Compliance Committee (Monitoring)', 'Big 4 External Audit Assurance (Assurance)', false),
('risk-002', '00000000-0000-0000-0000-000000000000'::uuid, 'CEO & Founder (Ownership)', 'Board Governance Committee (Monitoring)', 'None (GAP DETECTED)', true)
ON CONFLICT (risk_id) DO NOTHING;

-- 5. SEED SIMULATION SCENARIO PLANNERS
INSERT INTO public.scenarios (id, organization_id, title, description, objective_id, revenue_impact_best, revenue_impact_expected, revenue_impact_worst, ebitda_impact_best, ebitda_impact_expected, ebitda_impact_worst, cash_impact_best, cash_impact_expected, cash_impact_worst, objective_impact) VALUES
('scen-cyber', '00000000-0000-0000-0000-000000000000'::uuid, 'Multitenant Datastore Cyber Attack', 'Simulation of a severe SQL injection or database credential leakage leading to customer financial transactional data leak.', 'obj-cyber', '-₹15L', '-₹60L', '-₹2.8Cr', '-1%', '-5%', '-18%', '-₹20L', '-₹80L', '-₹3.2Cr', 'Worst case results in immediate loss of SOC 2 Trust compliance and forces a delay in our IPO sequence.'),
('scen-churn', '00000000-0000-0000-0000-000000000000'::uuid, 'Churn of Top 3 Enterprise Customers', 'Simulation of our three largest contract tenants churn due to product delivery delay or pricing undercuts.', 'obj-retention', '-₹40L', '-₹1.8Cr', '-₹4.2Cr', '-3%', '-12%', '-28%', '-₹35L', '-₹1.5Cr', '-₹3.9Cr', 'Slashes revenue goals, compressing valuation multiples by 40% in preliminary VC discussions.'),
('scen-audit', '00000000-0000-0000-0000-000000000000'::uuid, 'Severe Independent Director Vacancy Delay', 'Simulation of regulatory SEBI prospectus block due to failure to fill our required independent director board seats.', 'obj-ipo', '-₹0', '-₹20L', '-₹90L', '-0.5%', '-2%', '-7%', '-₹10L', '-₹45L', '-₹1.5Cr', 'Causes a structural delay of 12 months in NSE/BSE filing, derailing liquidity schedules for VC backers.')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED INITIAL RISK CULTURE METRICS
INSERT INTO public.culture_metrics (organization_id, policy_acknowledgement_rate, training_completion_rate, incident_report_velocity_days, near_miss_logged_count, whistleblower_cases_active, culture_score, trend)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 94, 88, 4, 28, 0, 86, 'Improving');
