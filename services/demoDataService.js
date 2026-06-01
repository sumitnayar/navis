import { isSupabaseConfigured, supabaseClient } from './supabaseClient.js';

const DEMO_ORG_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';
const DEMO_PREFIX = '[DEMO Trackier SaaS]';
const RISK_KEY = 'navis_v3_risks';
const TREND_KEY = 'navis_v3_trends';

const risks = [
  ['demo-trk-risk-001', 'Meta API Dependency Risk', 'Ecosystem / Platform Dependency', 'Partner APIs', 'Meta Marketing API', 'Campaign attribution, conversion reporting, and partner payout workflows depend heavily on Meta API availability and policy continuity.', 'VP Partnerships', 'Platform Engineering', 'Bangalore HQ', 4, 5, 5, 4, 5, 5, 'Deteriorating', [5, 4, 5, 5, 3, 4, 4, 4]],
  ['demo-trk-risk-002', 'Google Ecosystem Policy Change Risk', 'Ecosystem / Platform Dependency', 'Partner APIs', 'Google Ads Policy', 'Google Ads, GA4, and Play policy shifts may limit tracking signals, attribution fidelity, and customer campaign automation.', 'Director - Ecosystem Strategy', 'Product Management', 'Gurugram', 3, 5, 4, 3, 4, 4, 'Stable', [4, 4, 5, 4, 2, 3, 4, 4]],
  ['demo-trk-risk-003', 'Attribution Accuracy Customer Churn Risk', 'Customer', 'Retention', 'Measurement Confidence', 'Enterprise customers may churn if attribution variance grows across Meta, Google, MMP, and server-side tracking channels.', 'Chief Customer Officer', 'Customer Success', 'Mumbai', 4, 5, 4, 4, 4, 4, 'Deteriorating', [5, 5, 5, 4, 3, 4, 4, 5]],
  ['demo-trk-risk-004', 'SOC 2 Readiness Gap', 'Compliance', 'Security Assurance', 'SOC 2 Type II', 'Incomplete evidence collection and control testing may delay enterprise procurement, renewals, and security reviews.', 'CISO', 'Security Operations', 'Bangalore HQ', 4, 4, 3, 4, 4, 3, 'Deteriorating', [4, 5, 4, 4, 3, 4, 5, 5]],
  ['demo-trk-risk-005', 'Data Privacy Compliance Exposure', 'Compliance', 'Privacy', 'DPDPA / GDPR', 'Cross-border campaign, conversion, and user-event data processing may create privacy compliance exposure across customer markets.', 'Data Privacy Counsel', 'Legal & Compliance', 'Bangalore HQ', 3, 5, 4, 3, 5, 4, 'Stable', [4, 4, 5, 4, 2, 4, 5, 4]],
  ['demo-trk-risk-006', 'Key Engineer Dependency', 'People', 'Talent Concentration', 'Core Platform SMEs', 'Critical attribution pipeline knowledge is concentrated with a small number of senior backend engineers.', 'VP Engineering', 'Engineering', 'Bangalore HQ', 4, 4, 4, 4, 4, 4, 'Deteriorating', [3, 5, 3, 5, 5, 5, 3, 4]],
  ['demo-trk-risk-007', 'Cloud Outage Risk', 'Technology', 'Resilience', 'Cloud Availability', 'A regional cloud outage could interrupt tracking ingestion, dashboard availability, and real-time campaign optimization.', 'Head of DevOps', 'Infrastructure', 'AWS Mumbai', 3, 5, 5, 3, 5, 5, 'Stable', [4, 4, 5, 5, 2, 5, 4, 4]],
  ['demo-trk-risk-008', 'Revenue Concentration Risk', 'Financial', 'Revenue Quality', 'Top Customer Exposure', 'A small group of enterprise accounts contributes a material share of ARR and expansion pipeline.', 'CFO', 'Finance Operations', 'Mumbai', 4, 5, 3, 4, 5, 3, 'Deteriorating', [5, 5, 4, 2, 2, 3, 4, 5]],
  ['demo-trk-risk-009', 'Product Roadmap Delay Risk', 'Product', 'Execution', 'Roadmap Governance', 'Strategic product releases for server-side tracking, fraud detection, and privacy-safe attribution may slip.', 'Chief Product Officer', 'Product Management', 'Bangalore HQ', 4, 4, 3, 4, 4, 3, 'Deteriorating', [4, 5, 4, 4, 4, 4, 3, 4]],
  ['demo-trk-risk-010', 'AI Governance Immaturity', 'Compliance', 'AI Governance', 'Model Risk', 'Use of AI for risk summaries, customer support, and campaign insights may lack model governance and approval controls.', 'Head of Governance', 'Risk Office', 'Bangalore HQ', 3, 4, 4, 3, 4, 4, 'Stable', [3, 4, 4, 4, 3, 3, 5, 4]],
  ['demo-trk-risk-011', 'Security Incident Response Weakness', 'Cybersecurity', 'Incident Management', 'Response Readiness', 'Incident response ownership, evidence capture, and customer notification workflows are not yet fully tested.', 'CISO', 'Security Operations', 'Bangalore HQ', 4, 5, 5, 4, 5, 5, 'Deteriorating', [4, 4, 5, 5, 4, 5, 5, 5]],
  ['demo-trk-risk-012', 'Vendor Dependency Risk', 'Operational', 'Third Party', 'Critical Vendors', 'Reliance on selected enrichment, fraud intelligence, CRM, and messaging vendors may create service continuity exposure.', 'Head of Procurement', 'Operations', 'Bangalore HQ', 3, 4, 3, 3, 4, 3, 'Stable', [3, 3, 4, 3, 2, 4, 3, 3]],
  ['demo-trk-risk-013', 'Scalability and Performance Risk', 'Technology', 'Platform Scale', 'High Volume Events', 'Event ingestion and reporting latency may degrade during peak campaign seasons or large customer onboarding.', 'Director - Platform Engineering', 'Engineering', 'AWS Mumbai', 4, 5, 4, 4, 4, 4, 'Deteriorating', [5, 5, 5, 5, 3, 5, 4, 5]],
  ['demo-trk-risk-014', 'Founder Dependency Risk', 'Strategic', 'Leadership Dependency', 'Founder Decisions', 'Key pricing, enterprise negotiation, and architecture decisions still rely heavily on founder approval.', 'CEO Office', 'Executive Office', 'Bangalore HQ', 4, 4, 3, 4, 4, 3, 'Stable', [4, 5, 3, 4, 5, 4, 4, 5]],
  ['demo-trk-risk-015', 'Customer Support Escalation Risk', 'Operational', 'Support', 'Enterprise SLAs', 'Complex attribution disputes and platform incidents may overload senior support teams and delay SLA response.', 'Head of Customer Success', 'Customer Success', 'Gurugram', 4, 4, 4, 4, 3, 4, 'Deteriorating', [4, 4, 5, 3, 4, 5, 3, 3]],
  ['demo-trk-risk-016', 'Enterprise Sales Friction from Compliance Gaps', 'Customer', 'Sales Enablement', 'Security Reviews', 'Enterprise deals may slip when procurement teams request formal SOC 2 evidence, DPA packs, and security artifacts.', 'VP Sales', 'Enterprise Sales', 'Mumbai', 4, 5, 3, 4, 4, 3, 'Deteriorating', [5, 5, 4, 3, 2, 3, 4, 5]],
  ['demo-trk-risk-017', 'Revenue Forecast Volatility Risk', 'Financial', 'Forecasting', 'Pipeline Quality', 'API policy shifts and delayed enterprise deals may weaken forecast accuracy and board confidence.', 'FP&A Lead', 'Finance Operations', 'Mumbai', 3, 4, 3, 3, 4, 3, 'Stable', [5, 4, 3, 2, 2, 3, 3, 4]],
  ['demo-trk-risk-018', 'Customer Data Quality Drift Risk', 'Product', 'Data Quality', 'Signal Integrity', 'Inconsistent source events, missing UTMs, and partner data drift may reduce reporting confidence.', 'Product Analytics Lead', 'Product Management', 'Bangalore HQ', 4, 4, 4, 3, 4, 4, 'Stable', [4, 5, 5, 4, 3, 4, 3, 4]],
  ['demo-trk-risk-019', 'Access Control Review Gap', 'Cybersecurity', 'Identity', 'Privileged Access', 'Admin roles across cloud, database, support, and analytics tools may not be reviewed frequently enough.', 'Security Engineering Lead', 'Security Operations', 'Bangalore HQ', 3, 5, 4, 3, 4, 4, 'Improving', [3, 3, 4, 5, 3, 4, 4, 4]],
  ['demo-trk-risk-020', 'Customer Contract Margin Leakage', 'Financial', 'Pricing', 'Discount Governance', 'Custom enterprise terms and support-heavy accounts may reduce gross margin and implementation capacity.', 'Revenue Operations Lead', 'Finance Operations', 'Mumbai', 4, 4, 3, 4, 3, 3, 'Stable', [5, 4, 4, 2, 2, 4, 3, 4]],
  ['demo-trk-risk-021', 'Fraud Detection Model Drift', 'Product', 'Fraud Analytics', 'Model Drift', 'Campaign fraud models may lose accuracy as affiliate traffic patterns evolve.', 'Head of Data Science', 'Product Management', 'Bangalore HQ', 3, 4, 4, 3, 4, 4, 'Stable', [4, 4, 4, 4, 3, 4, 3, 3]],
  ['demo-trk-risk-022', 'Mobile SDK Reliability Risk', 'Technology', 'SDK Quality', 'Customer Integrations', 'Mobile SDK defects may disrupt install attribution, in-app event capture, and customer trust.', 'Mobile Platform Lead', 'Engineering', 'Bangalore HQ', 3, 4, 4, 3, 4, 4, 'Improving', [4, 4, 5, 4, 3, 4, 3, 4]],
  ['demo-trk-risk-023', 'Regulatory Change Monitoring Gap', 'Compliance', 'Regulatory Intelligence', 'Adtech Rules', 'Privacy, consent, platform, and advertising regulation changes may not be captured early enough.', 'Compliance Manager', 'Legal & Compliance', 'Bangalore HQ', 3, 4, 3, 3, 4, 3, 'Stable', [3, 4, 4, 3, 2, 3, 5, 4]],
  ['demo-trk-risk-024', 'Partner Payout Reconciliation Risk', 'Operational', 'Finance Operations', 'Affiliate Payouts', 'Data mismatches between tracked conversions, approved payouts, and customer invoices may create disputes.', 'Finance Controller', 'Finance Operations', 'Mumbai', 3, 4, 3, 3, 3, 3, 'Improving', [4, 4, 4, 3, 2, 5, 3, 3]],
  ['demo-trk-risk-025', 'Board Reporting Latency Risk', 'Strategic', 'Governance Reporting', 'Executive Visibility', 'Leadership may receive delayed or fragmented risk signals from customer escalations, uptime, security, and compliance.', 'Chief Risk Officer', 'Risk Office', 'Bangalore HQ', 3, 4, 3, 3, 4, 3, 'Stable', [4, 4, 4, 3, 3, 4, 4, 4]],
  ['demo-trk-risk-026', 'Data Warehouse Cost Overrun', 'Financial', 'Cloud Cost', 'Analytics Spend', 'High-volume event retention and warehouse queries may drive cloud costs above budget.', 'Cloud FinOps Lead', 'Infrastructure', 'AWS Mumbai', 3, 4, 3, 3, 3, 3, 'Stable', [4, 4, 3, 4, 2, 4, 2, 4]],
  ['demo-trk-risk-027', 'Customer Implementation Backlog Risk', 'Operational', 'Onboarding', 'Implementation Capacity', 'Delayed onboarding for enterprise customers may defer revenue recognition and damage expansion confidence.', 'Implementation Head', 'Customer Success', 'Gurugram', 4, 4, 3, 4, 3, 3, 'Deteriorating', [5, 5, 4, 3, 4, 5, 3, 4]],
  ['demo-trk-risk-028', 'API Rate Limit Exhaustion Risk', 'Technology', 'Integration Reliability', 'Partner Rate Limits', 'Large customer campaigns may exceed partner or internal API limits during peak reporting windows.', 'Platform Reliability Lead', 'Engineering', 'Bangalore HQ', 3, 4, 4, 3, 4, 4, 'Stable', [4, 4, 5, 5, 2, 4, 3, 3]],
  ['demo-trk-risk-029', 'Reputation Risk from Tracking Disputes', 'Customer', 'Trust', 'Public Claims', 'Public customer disputes over tracking accuracy may weaken market trust and enterprise references.', 'Head of Brand', 'Marketing', 'Mumbai', 3, 5, 4, 3, 4, 4, 'Stable', [4, 5, 5, 3, 2, 3, 5, 5]],
  ['demo-trk-risk-030', 'Security Findings Remediation Delay', 'Cybersecurity', 'Vulnerability Management', 'Open Findings', 'Security findings from scans, penetration tests, and cloud reviews may remain open beyond target SLAs.', 'Security Program Manager', 'Security Operations', 'Bangalore HQ', 4, 4, 4, 4, 4, 4, 'Deteriorating', [3, 4, 5, 5, 4, 4, 5, 4]]
];

const relationships = [
  ['demo-trk-risk-001', 'demo-trk-risk-003', 'parent-child'],
  ['demo-trk-risk-001', 'demo-trk-risk-017', 'parent-child'],
  ['demo-trk-risk-002', 'demo-trk-risk-018', 'parent-child'],
  ['demo-trk-risk-003', 'demo-trk-risk-029', 'parent-child'],
  ['demo-trk-risk-004', 'demo-trk-risk-016', 'parent-child'],
  ['demo-trk-risk-005', 'demo-trk-risk-029', 'parent-child'],
  ['demo-trk-risk-006', 'demo-trk-risk-009', 'parent-child'],
  ['demo-trk-risk-007', 'demo-trk-risk-015', 'parent-child'],
  ['demo-trk-risk-007', 'demo-trk-risk-029', 'parent-child'],
  ['demo-trk-risk-010', 'demo-trk-risk-005', 'parent-child'],
  ['demo-trk-risk-011', 'demo-trk-risk-005', 'parent-child'],
  ['demo-trk-risk-012', 'demo-trk-risk-007', 'related'],
  ['demo-trk-risk-013', 'demo-trk-risk-028', 'parent-child'],
  ['demo-trk-risk-014', 'demo-trk-risk-006', 'parent-child'],
  ['demo-trk-risk-014', 'demo-trk-risk-009', 'parent-child'],
  ['demo-trk-risk-016', 'demo-trk-risk-017', 'parent-child'],
  ['demo-trk-risk-018', 'demo-trk-risk-003', 'related'],
  ['demo-trk-risk-019', 'demo-trk-risk-011', 'related'],
  ['demo-trk-risk-020', 'demo-trk-risk-008', 'related'],
  ['demo-trk-risk-021', 'demo-trk-risk-003', 'related'],
  ['demo-trk-risk-022', 'demo-trk-risk-018', 'parent-child'],
  ['demo-trk-risk-023', 'demo-trk-risk-005', 'parent-child'],
  ['demo-trk-risk-024', 'demo-trk-risk-020', 'related'],
  ['demo-trk-risk-025', 'demo-trk-risk-014', 'related'],
  ['demo-trk-risk-026', 'demo-trk-risk-020', 'parent-child'],
  ['demo-trk-risk-027', 'demo-trk-risk-016', 'parent-child'],
  ['demo-trk-risk-028', 'demo-trk-risk-001', 'related'],
  ['demo-trk-risk-030', 'demo-trk-risk-011', 'parent-child']
];

const controls = [
  ['demo-trk-risk-001', 'API policy monitoring process', 'Detective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-001', 'Meta API contingency architecture review', 'Preventive', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-002', 'Google policy change watchlist', 'Detective', 'Weekly', 'Effective'],
  ['demo-trk-risk-003', 'Attribution variance investigation playbook', 'Corrective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-003', 'Customer communication protocol for tracking disputes', 'Corrective', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-004', 'SOC 2 control readiness tracker', 'Detective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-004', 'Evidence owner certification workflow', 'Preventive', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-005', 'Data processing inventory', 'Preventive', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-005', 'DPA and consent review checklist', 'Detective', 'Monthly', 'Effective'],
  ['demo-trk-risk-006', 'Critical knowledge transfer plan', 'Corrective', 'Biweekly', 'Ineffective'],
  ['demo-trk-risk-006', 'Architecture decision record repository', 'Preventive', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-007', 'Cloud backup and recovery process', 'Corrective', 'Monthly', 'Effective'],
  ['demo-trk-risk-007', 'Multi-region failover runbook', 'Corrective', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-008', 'Top account concentration review', 'Detective', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-008', 'Enterprise renewal governance committee', 'Preventive', 'Monthly', 'Effective'],
  ['demo-trk-risk-009', 'Product roadmap governance forum', 'Preventive', 'Biweekly', 'Partially Effective'],
  ['demo-trk-risk-010', 'AI use-case approval register', 'Preventive', 'Monthly', 'Ineffective'],
  ['demo-trk-risk-011', 'Incident response runbook', 'Corrective', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-011', 'Security incident tabletop exercise', 'Detective', 'Quarterly', 'Ineffective'],
  ['demo-trk-risk-012', 'Vendor due diligence checklist', 'Preventive', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-013', 'Load testing and capacity review', 'Detective', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-014', 'Delegation and authorization matrix', 'Preventive', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-015', 'Customer escalation protocol', 'Corrective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-016', 'Security questionnaire response library', 'Preventive', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-017', 'Revenue forecast sensitivity review', 'Detective', 'Monthly', 'Effective'],
  ['demo-trk-risk-018', 'Data quality anomaly dashboard', 'Detective', 'Daily', 'Partially Effective'],
  ['demo-trk-risk-019', 'Quarterly access review', 'Detective', 'Quarterly', 'Partially Effective'],
  ['demo-trk-risk-019', 'MFA for admin accounts', 'Preventive', 'Continuous', 'Effective'],
  ['demo-trk-risk-020', 'Discount approval workflow', 'Preventive', 'Per Deal', 'Partially Effective'],
  ['demo-trk-risk-021', 'Model drift monitoring review', 'Detective', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-022', 'SDK release quality gate', 'Preventive', 'Per Release', 'Effective'],
  ['demo-trk-risk-023', 'Regulatory intelligence tracker', 'Detective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-024', 'Partner payout reconciliation checklist', 'Detective', 'Monthly', 'Effective'],
  ['demo-trk-risk-025', 'Board risk reporting cadence', 'Preventive', 'Monthly', 'Partially Effective'],
  ['demo-trk-risk-026', 'Cloud cost budget alerts', 'Detective', 'Weekly', 'Effective'],
  ['demo-trk-risk-027', 'Implementation capacity planning forum', 'Preventive', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-028', 'API rate limit alerting', 'Detective', 'Daily', 'Partially Effective'],
  ['demo-trk-risk-029', 'Reputation response playbook', 'Corrective', 'Quarterly', 'Ineffective'],
  ['demo-trk-risk-030', 'Vulnerability remediation SLA tracker', 'Detective', 'Weekly', 'Partially Effective'],
  ['demo-trk-risk-030', 'Code review and deployment approval', 'Preventive', 'Per Release', 'Effective']
];

const kris = [
  ['demo-trk-risk-001', 'Meta API webhook error rate', '2.6%', '1.0%', 'BREACHED'],
  ['demo-trk-risk-002', 'Google policy exceptions raised', '3', '5', 'OK'],
  ['demo-trk-risk-003', 'Gross customer churn rate', '4.8%', '3.0%', 'BREACHED'],
  ['demo-trk-risk-004', 'Open SOC 2 evidence gaps', '18', '5', 'BREACHED'],
  ['demo-trk-risk-005', 'Unmapped data processing activities', '11', '3', 'BREACHED'],
  ['demo-trk-risk-006', 'Critical modules with single SME', '7', '3', 'BREACHED'],
  ['demo-trk-risk-007', 'Monthly uptime percentage', '99.71%', '99.90%', 'BREACHED'],
  ['demo-trk-risk-008', 'Revenue from top 5 customers', '46%', '35%', 'BREACHED'],
  ['demo-trk-risk-009', 'Roadmap milestones slipped this quarter', '6', '2', 'BREACHED'],
  ['demo-trk-risk-010', 'AI use cases without owner approval', '5', '0', 'BREACHED'],
  ['demo-trk-risk-011', 'Incident response drill completion', '0 of 2', '2 of 2', 'BREACHED'],
  ['demo-trk-risk-013', 'P95 event ingestion latency', '8.4 sec', '5 sec', 'BREACHED'],
  ['demo-trk-risk-015', 'Support escalation volume', '42', '25', 'BREACHED'],
  ['demo-trk-risk-016', 'Enterprise deal slippage from security reviews', '6 deals', '2 deals', 'BREACHED'],
  ['demo-trk-risk-018', 'Attribution variance tickets', '31', '15', 'BREACHED'],
  ['demo-trk-risk-019', 'Privileged users pending review', '9', '0', 'BREACHED'],
  ['demo-trk-risk-020', 'Custom discount approvals above policy', '12', '4', 'BREACHED'],
  ['demo-trk-risk-021', 'Fraud model precision variance', '9%', '5%', 'BREACHED'],
  ['demo-trk-risk-022', 'SDK crash-free sessions', '99.82%', '99.75%', 'OK'],
  ['demo-trk-risk-024', 'Partner payout reconciliation breaks', '4', '5', 'OK'],
  ['demo-trk-risk-026', 'Warehouse spend variance to budget', '+18%', '+10%', 'BREACHED'],
  ['demo-trk-risk-027', 'Enterprise onboarding backlog', '14 accounts', '6 accounts', 'BREACHED'],
  ['demo-trk-risk-028', 'API throttling events per week', '19', '8', 'BREACHED'],
  ['demo-trk-risk-030', 'Unresolved high security findings', '7', '2', 'BREACHED']
];

const actions = [
  ['demo-trk-act-001', 'demo-trk-risk-001', 'Document Meta API dependency contingency plan', 'VP Partnerships', '2026-06-18', 'High', 'In Progress'],
  ['demo-trk-act-002', 'demo-trk-risk-002', 'Complete Google policy impact assessment', 'Director - Ecosystem Strategy', '2026-06-24', 'Medium', 'Not Started'],
  ['demo-trk-act-003', 'demo-trk-risk-003', 'Create customer attribution dispute playbook', 'Chief Customer Officer', '2026-06-12', 'High', 'In Progress'],
  ['demo-trk-act-004', 'demo-trk-risk-004', 'Complete SOC 2 readiness gap assessment', 'CISO', '2026-06-10', 'High', 'In Progress'],
  ['demo-trk-act-005', 'demo-trk-risk-005', 'Refresh DPA and data inventory for top customers', 'Data Privacy Counsel', '2026-06-28', 'High', 'Not Started'],
  ['demo-trk-act-006', 'demo-trk-risk-006', 'Publish critical service knowledge maps', 'VP Engineering', '2026-05-20', 'High', 'In Progress'],
  ['demo-trk-act-007', 'demo-trk-risk-007', 'Review cloud disaster recovery test results', 'Head of DevOps', '2026-06-21', 'High', 'Not Started'],
  ['demo-trk-act-008', 'demo-trk-risk-008', 'Prepare board update on revenue concentration', 'CFO', '2026-06-15', 'High', 'In Progress'],
  ['demo-trk-act-009', 'demo-trk-risk-009', 'Rebaseline privacy-safe attribution roadmap', 'Chief Product Officer', '2026-05-24', 'Medium', 'In Progress'],
  ['demo-trk-act-010', 'demo-trk-risk-010', 'Approve AI governance operating policy', 'Head of Governance', '2026-06-26', 'Medium', 'Not Started'],
  ['demo-trk-act-011', 'demo-trk-risk-011', 'Run security incident tabletop exercise', 'CISO', '2026-05-18', 'High', 'Not Started'],
  ['demo-trk-act-012', 'demo-trk-risk-012', 'Refresh vendor criticality assessment', 'Head of Procurement', '2026-06-30', 'Medium', 'Not Started'],
  ['demo-trk-act-013', 'demo-trk-risk-013', 'Run peak-volume load test for tracking pipeline', 'Director - Platform Engineering', '2026-06-09', 'High', 'In Progress'],
  ['demo-trk-act-014', 'demo-trk-risk-014', 'Update delegation matrix for enterprise deal approvals', 'CEO Office', '2026-06-20', 'Medium', 'In Progress'],
  ['demo-trk-act-015', 'demo-trk-risk-015', 'Revise customer escalation severity matrix', 'Head of Customer Success', '2026-05-25', 'Medium', 'In Progress'],
  ['demo-trk-act-016', 'demo-trk-risk-016', 'Build security questionnaire response library', 'VP Sales', '2026-06-17', 'High', 'In Progress'],
  ['demo-trk-act-017', 'demo-trk-risk-017', 'Add API policy sensitivity to board forecast pack', 'FP&A Lead', '2026-06-25', 'Medium', 'Not Started'],
  ['demo-trk-act-018', 'demo-trk-risk-018', 'Launch attribution data quality weekly review', 'Product Analytics Lead', '2026-06-07', 'Medium', 'In Progress'],
  ['demo-trk-act-019', 'demo-trk-risk-019', 'Implement quarterly access review process', 'Security Engineering Lead', '2026-06-14', 'High', 'In Progress'],
  ['demo-trk-act-020', 'demo-trk-risk-020', 'Tighten discount approval thresholds', 'Revenue Operations Lead', '2026-06-29', 'Medium', 'Not Started'],
  ['demo-trk-act-021', 'demo-trk-risk-021', 'Review model drift report for fraud scoring', 'Head of Data Science', '2026-06-19', 'Medium', 'Not Started'],
  ['demo-trk-act-022', 'demo-trk-risk-022', 'Complete SDK regression suite automation', 'Mobile Platform Lead', '2026-05-27', 'Medium', 'Completed'],
  ['demo-trk-act-023', 'demo-trk-risk-023', 'Create monthly adtech regulatory bulletin', 'Compliance Manager', '2026-06-22', 'Low', 'Not Started'],
  ['demo-trk-act-024', 'demo-trk-risk-024', 'Close payout reconciliation breaks for top affiliates', 'Finance Controller', '2026-05-29', 'Medium', 'Completed'],
  ['demo-trk-act-025', 'demo-trk-risk-025', 'Add risk dashboard to monthly leadership review', 'Chief Risk Officer', '2026-06-11', 'Medium', 'In Progress'],
  ['demo-trk-act-026', 'demo-trk-risk-026', 'Implement warehouse query budget guardrails', 'Cloud FinOps Lead', '2026-06-27', 'Low', 'Not Started'],
  ['demo-trk-act-027', 'demo-trk-risk-027', 'Approve temporary implementation pod hiring plan', 'Implementation Head', '2026-05-22', 'High', 'In Progress'],
  ['demo-trk-act-028', 'demo-trk-risk-028', 'Add API rate-limit dashboard to NOC screen', 'Platform Reliability Lead', '2026-06-13', 'Medium', 'In Progress'],
  ['demo-trk-act-029', 'demo-trk-risk-029', 'Create customer communication playbook', 'Head of Brand', '2026-06-23', 'High', 'Not Started'],
  ['demo-trk-act-030', 'demo-trk-risk-030', 'Remediate all high findings older than 30 days', 'Security Program Manager', '2026-06-06', 'High', 'In Progress'],
  ['demo-trk-act-031', 'demo-trk-risk-004', 'Complete auditor evidence walkthrough', 'CISO', '2026-05-31', 'High', 'Completed'],
  ['demo-trk-act-032', 'demo-trk-risk-007', 'Finalize failover communications checklist', 'Head of DevOps', '2026-06-05', 'Medium', 'In Progress']
];

const trendLogs = [
  ['demo-trk-risk-001', 12, 20, 'Meta API policy monitoring indicates elevated dependency exposure.'],
  ['demo-trk-risk-003', 12, 16, 'Customer churn pressure rose after attribution variance escalations.'],
  ['demo-trk-risk-004', 9, 16, 'SOC 2 evidence gaps remain open across access and change controls.'],
  ['demo-trk-risk-006', 12, 16, 'Single SME concentration worsened after platform team attrition.'],
  ['demo-trk-risk-007', 10, 15, 'Cloud availability missed internal uptime target during ingestion spike.'],
  ['demo-trk-risk-008', 16, 20, 'Top customer concentration remains above appetite.'],
  ['demo-trk-risk-011', 12, 20, 'Incident response drill did not complete this cycle.'],
  ['demo-trk-risk-013', 12, 16, 'Peak ingestion latency exceeded board threshold.'],
  ['demo-trk-risk-019', 16, 12, 'Privileged access cleanup improved following MFA rollout.'],
  ['demo-trk-risk-022', 12, 9, 'SDK regression automation reduced release incident rate.'],
  ['demo-trk-risk-024', 12, 9, 'Payout reconciliation backlog reduced after finance review.'],
  ['demo-trk-risk-030', 12, 16, 'Security remediation queue aged beyond SLA.']
];

export const DEMO_RECORD_COUNTS = {
  risks: risks.length,
  relationships: relationships.length,
  controls: controls.length,
  kris: kris.length,
  actions: actions.length,
  trendLogs: trendLogs.length
};

function demoRiskIds() {
  return risks.map(r => r[0]);
}

function activeOrgFromSession(session) {
  return session?.user?.user_metadata?.organization_id || DEMO_ORG_FALLBACK_ID;
}

function mapControlEffectiveness(rating) {
  if (rating === 'Effective') return 'Highly Effective';
  if (rating === 'Partially Effective') return 'Partially Effective';
  return 'Ineffective';
}

function mapControlStatus(rating) {
  if (rating === 'Ineffective') return 'Under Review';
  return 'Active';
}

function toRiskRow(risk, organizationId) {
  const [id, title, category, l2, l3, description, owner, businessUnit, location, likelihood, impact, velocity, likelihoodResidual, impactResidual, velocityResidual, trend] = risk;
  return {
    id,
    organization_id: organizationId,
    title: `${DEMO_PREFIX} ${title}`,
    category,
    l1: category,
    l2,
    l3,
    description: `${description} Demo marker: ${DEMO_PREFIX}.`,
    owner,
    business_unit: businessUnit,
    location,
    likelihood,
    impact,
    velocity,
    likelihood_residual: likelihoodResidual,
    impact_residual: impactResidual,
    velocity_residual: velocityResidual,
    trend,
    time_to_impact: velocityResidual >= 5 ? 'Immediate' : velocityResidual >= 4 ? 'Fast' : 'Moderate',
    time_to_detection: likelihoodResidual >= 4 ? 'Delayed' : 'Moderate',
    time_to_recovery: impactResidual >= 5 ? 'Extended' : 'Moderate'
  };
}

function toFragilityRow(risk, organizationId) {
  const [id,,,,,,,,,,,,,,,, fragility] = risk;
  return {
    risk_id: id,
    organization_id: organizationId,
    revenue: fragility[0],
    growth: fragility[1],
    customer_trust: fragility[2],
    technology: fragility[3],
    people: fragility[4],
    operations: fragility[5],
    reputation: fragility[6],
    valuation: fragility[7]
  };
}

function toAssuranceRow(risk, organizationId) {
  const [id,,,,,, owner] = risk;
  return {
    risk_id: id,
    organization_id: organizationId,
    first_line: owner,
    second_line: 'Risk Office',
    third_line: 'Internal Audit',
    gap_detected: true
  };
}

function localRiskObjects() {
  const childMap = new Map();
  const relatedMap = new Map();
  const parentMap = new Map();
  relationships.forEach(([parent, child, type]) => {
    if (type === 'parent-child') {
      if (!childMap.has(parent)) childMap.set(parent, []);
      childMap.get(parent).push(child);
      if (!parentMap.has(child)) parentMap.set(child, parent);
    } else {
      if (!relatedMap.has(parent)) relatedMap.set(parent, []);
      if (!relatedMap.has(child)) relatedMap.set(child, []);
      relatedMap.get(parent).push(child);
      relatedMap.get(child).push(parent);
    }
  });

  return risks.map((risk) => {
    const [id, title, category, l2, l3, description, owner, businessUnit, location, likelihood, impact, velocity, likelihoodResidual, impactResidual, velocityResidual, trend, fragility] = risk;
    const residualScore = likelihoodResidual * impactResidual;
    return {
      id,
      title: `${DEMO_PREFIX} ${title}`,
      category,
      l1: category,
      l2,
      l3,
      description: `${description} Demo marker: ${DEMO_PREFIX}.`,
      owner,
      businessUnit,
      location,
      likelihood,
      impact,
      velocity,
      likelihoodResidual,
      impactResidual,
      velocityResidual,
      residualScore,
      appetiteStatus: residualScore >= 16 ? 'Above Appetite' : residualScore >= 11 ? 'Near Appetite' : 'Within Appetite',
      trend,
      timeToImpact: velocityResidual >= 5 ? 'Immediate' : velocityResidual >= 4 ? 'Fast' : 'Moderate',
      timeToDetection: likelihoodResidual >= 4 ? 'Delayed' : 'Moderate',
      timeToRecovery: impactResidual >= 5 ? 'Extended' : 'Moderate',
      parentRiskId: parentMap.get(id) || null,
      childRiskIds: childMap.get(id) || [],
      relatedRiskIds: relatedMap.get(id) || [],
      controls: controls.filter(c => c[0] === id).map(([, name, type, frequency, rating]) => ({
        name,
        type,
        frequency,
        rating,
        effectiveness: mapControlEffectiveness(rating),
        status: mapControlStatus(rating)
      })),
      kris: kris.filter(k => k[0] === id).map(([, name, current, threshold, status]) => ({ name, current, threshold, status })),
      actions: actions.filter(a => a[1] === id).map(([actionId,, title, actionOwner, dueDate, priority, status]) => ({
        id: actionId,
        title,
        owner: actionOwner,
        dueDate,
        priority,
        status
      })),
      fragility: {
        revenue: fragility[0],
        growth: fragility[1],
        customerTrust: fragility[2],
        technology: fragility[3],
        people: fragility[4],
        operations: fragility[5],
        reputation: fragility[6],
        valuation: fragility[7]
      },
      assurance: {
        firstLine: owner,
        secondLine: 'Risk Office',
        thirdLine: 'Internal Audit',
        gapDetected: true
      }
    };
  });
}

async function requireSupabaseSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    throw new Error('You must be signed in before generating demo data.');
  }
  return data.session;
}

async function clearCloudDemoData() {
  const ids = demoRiskIds();
  const actionIds = actions.map(a => a[0]);

  await supabaseClient.from('controls').delete().in('risk_id', ids);
  await supabaseClient.from('kris').delete().in('risk_id', ids);
  await supabaseClient.from('actions').delete().in('id', actionIds);
  await supabaseClient.from('trend_logs').delete().in('risk_id', ids);
  await supabaseClient.from('risk_fragilities').delete().in('risk_id', ids);
  await supabaseClient.from('assurance_mappings').delete().in('risk_id', ids);
  await supabaseClient.from('risk_to_objectives').delete().in('risk_id', ids);
  await supabaseClient.from('risk_relationships').delete().in('parent_id', ids);
  await supabaseClient.from('risk_relationships').delete().in('child_id', ids);
  const { error } = await supabaseClient.from('risks').delete().in('id', ids);
  if (error) throw error;
}

function clearLocalDemoData() {
  const ids = new Set(demoRiskIds());
  const currentRisks = JSON.parse(localStorage.getItem(RISK_KEY) || '[]');
  const currentTrends = JSON.parse(localStorage.getItem(TREND_KEY) || '[]');
  localStorage.setItem(RISK_KEY, JSON.stringify(currentRisks.filter(r => !ids.has(r.id))));
  localStorage.setItem(TREND_KEY, JSON.stringify(currentTrends.filter(t => !ids.has(t.riskId) && !String(t.id || '').startsWith('demo-trk-trend-'))));
}

export class DemoDataService {
  static getRecordCounts() {
    return { ...DEMO_RECORD_COUNTS };
  }

  static isDemoRiskId(id) {
    return String(id || '').startsWith('demo-trk-risk-');
  }

  static async generate() {
    if (isSupabaseConfigured) {
      const session = await requireSupabaseSession();
      const organizationId = activeOrgFromSession(session);
      await clearCloudDemoData();

      let result = await supabaseClient.from('risks').upsert(risks.map(r => toRiskRow(r, organizationId)));
      if (result.error) throw result.error;

      result = await supabaseClient.from('risk_fragilities').upsert(risks.map(r => toFragilityRow(r, organizationId)));
      if (result.error) throw result.error;

      result = await supabaseClient.from('assurance_mappings').upsert(risks.map(r => toAssuranceRow(r, organizationId)));
      if (result.error) throw result.error;

      result = await supabaseClient.from('risk_relationships').upsert(relationships.map(([parent_id, child_id, relation_type]) => ({
        parent_id,
        child_id,
        relation_type,
        organization_id: organizationId
      })));
      if (result.error) throw result.error;

      result = await supabaseClient.from('controls').insert(controls.map(([risk_id, name, type, frequency, rating]) => ({
        organization_id: organizationId,
        risk_id,
        name,
        type,
        frequency,
        rating
      })));
      if (result.error) throw result.error;

      result = await supabaseClient.from('kris').insert(kris.map(([risk_id, name, current, threshold, status]) => ({
        organization_id: organizationId,
        risk_id,
        name,
        current,
        threshold,
        status
      })));
      if (result.error) throw result.error;

      result = await supabaseClient.from('actions').upsert(actions.map(([id, risk_id, title, owner, due_date, priority, status]) => ({
        id,
        organization_id: organizationId,
        risk_id,
        title,
        owner,
        due_date,
        priority,
        status
      })));
      if (result.error) throw result.error;

      result = await supabaseClient.from('trend_logs').insert(trendLogs.map(([risk_id, previous_score, new_score, comments], index) => ({
        organization_id: organizationId,
        risk_id,
        risk_title: risks.find(r => r[0] === risk_id)?.[1] || risk_id,
        previous_score,
        new_score,
        active_user: 'Demo Data Generator',
        comments,
        timestamp: new Date(Date.UTC(2026, 4, 1 + index * 2)).toISOString()
      })));
      if (result.error) throw result.error;
    } else {
      clearLocalDemoData();
      const currentRisks = JSON.parse(localStorage.getItem(RISK_KEY) || '[]');
      const currentTrends = JSON.parse(localStorage.getItem(TREND_KEY) || '[]');
      localStorage.setItem(RISK_KEY, JSON.stringify([...currentRisks, ...localRiskObjects()]));
      localStorage.setItem(TREND_KEY, JSON.stringify([
        ...currentTrends,
        ...trendLogs.map(([riskId, previousScore, newScore, comments], index) => ({
          id: `demo-trk-trend-${String(index + 1).padStart(3, '0')}`,
          riskId,
          riskTitle: risks.find(r => r[0] === riskId)?.[1] || riskId,
          previousScore,
          newScore,
          user: 'Demo Data Generator',
          comments,
          timestamp: new Date(Date.UTC(2026, 4, 1 + index * 2)).toISOString()
        }))
      ]));
    }

    return this.getRecordCounts();
  }

  static async clear() {
    if (isSupabaseConfigured) {
      await requireSupabaseSession();
      await clearCloudDemoData();
    } else {
      clearLocalDemoData();
    }

    return this.getRecordCounts();
  }
}
