// Seeded Enterprise Risk Universe and seeded risks for NAVIS V3 - Board Risk Intelligence Platform.

export const riskTemplates = {
  "customer_concentration": {
    id: "customer_concentration",
    title: "Customer Concentration",
    category: "Financial",
    l1: "Financial",
    l2: "Revenue Concentration",
    l3: "Enterprise Churn",
    description: "High reliance on a small number of top-tier accounts, exposing the company to massive revenue shocks if any churn.",
    causes: [
      "Enterprise sales-driven model with low total customer count",
      "Lack of mid-market and SMB diversification",
      "Key accounts expanding significantly faster than new customer acquisition"
    ],
    suggestedControls: [
      "Implement multi-executive relationship mapping for top 10 accounts",
      "Structure multi-year customer agreements with early renewal incentives",
      "Maintain a dedicated Customer Success (CS) VIP squad with SLA commitments"
    ],
    suggestedKRIs: [
      "Revenue percentage from top 5 customers (Limit: 35%)",
      "Net Revenue Retention (NRR) of top accounts",
      "Health score metrics of major enterprise tenants"
    ],
    boardImpact: "Significant threat to recurring revenue stability, cash flow predictability, and valuation multiples during an IPO process."
  },
  "founder_dependency": {
    id: "founder_dependency",
    title: "Founder Dependency",
    category: "Strategic",
    l1: "Strategic",
    l2: "Key Person Dependency",
    l3: "Founder Silo",
    description: "Key product, technical, and commercial decisions disproportionately concentrated in the founders, limiting scale.",
    causes: [
      "Lack of an empowered second-line leadership team",
      "Founder involvement in day-to-day operations and low-level code/sales",
      "Information silos and gatekeeping of critical customer/technical context"
    ],
    suggestedControls: [
      "Hire professional C-Suite (VP Engineering, VP Sales, VP Product)",
      "Establish formalized delegation matrices for spend and strategic decisions",
      "Implement robust documentation standards for product architecture and customer delivery"
    ],
    suggestedKRIs: [
      "Founder hours spent on non-strategic tasks",
      "Key decisions delayed awaiting founder approval (>48 hours)",
      "Percentage of core processes fully documented"
    ],
    boardImpact: "High operational vulnerability. Institutional investors discount valuation if the business is not self-sustaining."
  },
  "platform_dependency": {
    id: "platform_dependency",
    title: "Platform & API Dependency",
    category: "Technology",
    l1: "Technology",
    l2: "Infrastructure dependency",
    l3: "Third-Party API Block",
    description: "Extreme reliance on third-party public platforms (e.g. AWS, Meta APIs, Google Workspace) for product delivery or customer acquisition.",
    causes: [
      "Single cloud provider without multi-region failover",
      "Product core built directly on top of proprietary third-party APIs",
      "No direct-to-consumer distribution; highly dependent on ad network APIs"
    ],
    suggestedControls: [
      "Establish multi-cloud architecture or backup recovery systems",
      "Regular API contract and partner tier audits",
      "Build native cache layer to withstand short-term platform outages"
    ],
    suggestedKRIs: [
      "API response time latency from platform provider",
      "Percentage of critical product features decoupled from single APIs",
      "SLA breach minutes from platform partner"
    ],
    boardImpact: "Risk of sudden operational blackout or service shutdown if partner terms change or APIs are deprecated."
  },
  "cyber_security": {
    id: "cyber_security",
    title: "Cyber Security & Data Breaches",
    category: "Cyber",
    l1: "Cyber",
    l2: "Data Security",
    l3: "Multitenant Datastore Bypass",
    description: "Unauthorized access to SaaS production servers leading to exposure of customer data, IP theft, or system downtime.",
    causes: [
      "Weak access controls, missing Multi-Factor Authentication (MFA)",
      "Unpatched open-source software libraries used in product builds",
      "Absence of continuous penetration testing and vulnerability scanning"
    ],
    suggestedControls: [
      "Enforce mandatory single sign-on (SSO) and MFA across all tools",
      "Implement real-time network intrusion monitoring and automated firewalls",
      "Run quarterly external penetration audits"
    ],
    suggestedKRIs: [
      "Unpatched high/critical vulnerabilities older than 14 days",
      "Failed phishing simulation rate among staff",
      "Mean Time to Detect (MTTD) security anomalies"
    ],
    boardImpact: "Immediate loss of customer trust, major SOC 2 compliance failure, and high risk of legal lawsuits."
  },
  "data_privacy_dpdpa": {
    id: "data_privacy_dpdpa",
    title: "Data Privacy & Indian DPDPA Compliance",
    category: "Privacy",
    l1: "Privacy",
    l2: "Regulatory Privacy",
    l3: "PII Consent Log Gaps",
    description: "Failure to comply with major privacy laws, specifically the Indian Digital Personal Data Protection Act (DPDPA) and GDPR.",
    causes: [
      "Storing customer PII without explicit consent or structured logs",
      "Inability to handle customer data erasure or access requests",
      "Sharing data with third-party subprocessors without data protection agreements"
    ],
    suggestedControls: [
      "Appoint a dedicated Data Protection Officer (DPO)",
      "Implement a localized consent manager and audit log database",
      "Adopt data encryption at rest and in transit across all environments"
    ],
    suggestedKRIs: [
      "Percentage of database schemas with fully cataloged PII",
      "Outstanding data subject rights (DSR) requests beyond SLA limit",
      "Vendor privacy compliance audits completed"
    ],
    boardImpact: "Astronomical regulatory fines (up to ₹250 Cr under DPDPA) and severe damage to credibility prior to an IPO."
  },
  "soc2_readiness": {
    id: "soc2_readiness",
    title: "SOC 2 Type II Readiness Gaps",
    category: "Compliance",
    l1: "Compliance",
    l2: "Industry certifications",
    l3: "Audit Trail Slippages",
    description: "Unpreparedness or design gaps in security controls blocking the acquisition of a clean SOC 2 Type II report.",
    causes: [
      "Ad-hoc access reviews and lack of formal change management logs",
      "Absence of business continuity and disaster recovery drill evidence",
      "Inadequate employee background checks and security awareness training"
    ],
    suggestedControls: [
      "Deploy continuous compliance monitoring agent (e.g. Vanta, Drata)",
      "Formalize weekly git pull request approvals and automated lint audits",
      "Conduct mock SOC 2 readiness evaluation with external CPA firm"
    ],
    suggestedKRIs: [
      "Continuous compliance test failing alerts outstanding",
      "Policy acknowledgement rate by new employees (<30 days)",
      "Evidence collection gaps remaining for current audit cycle"
    ],
    boardImpact: "Severely bottlenecks global sales expansion; mid-market and enterprise SaaS customers require SOC 2 to close deals."
  },
  "vendor_dependency": {
    id: "vendor_dependency",
    title: "Vendor Lock-in & Supply Chain Risk",
    category: "Vendor",
    l1: "Vendor",
    l2: "Vendor Supply Chain",
    l3: "Single API Core Lock",
    description: "Inability to shift operational reliance from a critical vendor whose failure could halt our core services.",
    causes: [
      "Proprietary database structures blocking system migrations",
      "Single-source vendor contracts without backup alternatives",
      "Critical customer integrations hard-coded to vendor protocols"
    ],
    suggestedControls: [
      "Enforce mandatory multi-vendor assessments annually",
      "Design loosely-coupled service APIs that enable swappable adapters",
      "Maintain active, validated backups of vendor data locally"
    ],
    suggestedKRIs: [
      "Vendor critical alerts open (>24 hours)",
      "Annual growth rate of single-vendor invoice costs",
      "Backup restoration verification status"
    ],
    boardImpact: "Creates strategic fragility, limits negotiation leverage, and exposes company to vendor pricing shocks."
  },
  "revenue_concentration": {
    id: "revenue_concentration",
    title: "Revenue Model & Pricing Vulnerability",
    category: "Financial",
    l1: "Financial",
    l2: "Pricing Stability",
    l3: "Flat Seat Squeeze",
    description: "Unstable revenue mix or over-reliance on a single pricing model that is easily underpriced by competitors.",
    causes: [
      "Flat seat-based pricing vs value-based usage metrics",
      "Aggressive discounting by sales teams to hit short-term ARR targets",
      "Lack of recurring expansion revenue paths in existing accounts"
    ],
    suggestedControls: [
      "Establish centralized price-desk approval for deals exceeding 15% discount",
      "Incorporate usage-based pricing elements alongside flat platform fees",
      "Launch specialized product add-ons to boost ARPU (Average Revenue Per User)"
    ],
    suggestedKRIs: [
      "Expansion MRR contribution rate",
      "Average discount percentage given on new enterprise contracts",
      "LTV to CAC ratio"
    ],
    boardImpact: "Lowers valuation multiples and threatens long-term cash flow break-even timeline."
  },
  "talent_attrition": {
    id: "talent_attrition",
    title: "Talent Attrition & Key Person Risk",
    category: "People",
    l1: "People",
    l2: "Talent Retention",
    l3: "Architect Brain Drain",
    description: "Loss of core engineering, product, or sales personnel, slowing down product releases and account growth.",
    causes: [
      "Uncompetitive ESOP programs compared to funded scale-ups",
      "Poor remote/hybrid work culture or manager friction",
      "Lack of clear, documented career growth tracks for top performers"
    ],
    suggestedControls: [
      "Perform bi-annual compensation benchmarking audits",
      "Design structured succession plans for all critical technical/product leads",
      "Establish an active ESOP liquidity/buyback roadmap"
    ],
    suggestedKRIs: [
      "Regrettable attrition rate of 'A-Players' (Target: <8%)",
      "Average time-to-fill key technical vacancies (>60 days)",
      "Employee Net Promoter Score (eNPS)"
    ],
    boardImpact: "Delays key roadmap commits, degrades product quality, and raises operational overhead."
  },
  "ai_governance": {
    id: "ai_governance",
    title: "AI Governance & IP Liability",
    category: "AI",
    l1: "AI",
    l2: "AI Governance",
    l3: "PII Ingestion Leak",
    description: "Legal, reputational, or technical risks arising from unverified AI model deployments (e.g. data hallucination, model bias, IP copyright leaks).",
    causes: [
      "Placing customer data into public LLM endpoints without sandboxes",
      "Lack of human-in-the-loop reviews on critical AI outputs",
      "Absence of clear organizational policies on generative AI usage"
    ],
    suggestedControls: [
      "Establish an AI Safety & Ethics Review Committee",
      "Utilize enterprise-grade API agreements with zero-data-retention clauses",
      "Build dynamic verification guardrails to catch AI hallucinations before user display"
    ],
    suggestedKRIs: [
      "Hallucination / accuracy incident reports",
      "Unapproved AI tools detected in corporate networks",
      "Percentage of AI features covered by explicit customer disclaimer"
    ],
    boardImpact: "Exposes company to copyright lawsuits, compliance reviews, and reputational backlash."
  },
  "regulatory_risk": {
    id: "regulatory_risk",
    title: "Regulatory & Compliance Shocks",
    category: "Legal",
    l1: "Legal",
    l2: "Regulatory Legal",
    l3: "Cross-Border Gateway Block",
    description: "Unexpected shifts in taxation (GST), cross-border billing rules (RBI), or tech regulations that impact operations.",
    causes: [
      "Complex international SaaS entity structures with unclear transfer pricing",
      "Dynamic cross-border credit card recurring charge restrictions",
      "Slow adaptation to new regional tax regulations"
    ],
    suggestedControls: [
      "Retain tier-1 specialized international SaaS tax consultancies",
      "Deploy multi-jurisdiction payment processors (e.g. Stripe + Adyen)",
      "Maintain active legal watch on regional RBI and tax circulars"
    ],
    suggestedKRIs: [
      "Tax liability audit warnings open",
      "Payment gateway checkout failure rates on international credit cards",
      "Compliance audit timelines missed"
    ],
    boardImpact: "Can temporarily halt international revenues or lead to heavy retro-active tax assessments."
  },
  "ipo_readiness": {
    id: "ipo_readiness",
    title: "IPO Readiness Gaps",
    category: "Strategic",
    l1: "Strategic",
    l2: "IPO Governance",
    l3: "SEBI Board Non-Compliance",
    description: "Inability to proceed with an IPO due to weak internal audit controls, unaligned board structures, or messy financial histories.",
    causes: [
      "Non-compliant board structure (e.g. missing required independent directors)",
      "Delayed quarterly financial closures and audit delays",
      "Messy capitalization tables and unstructured option agreements"
    ],
    suggestedControls: [
      "Recruit independent, highly-regarded directors early in growth stages",
      "Appoint tier-1 auditing firm (Big 4) for quarterly financial audits",
      "Transition all cap table management to professional digital platforms (e.g. Carta)"
    ],
    suggestedKRIs: [
      "Days taken to complete quarterly financial book closing (Limit: 15 days)",
      "Audit adjustment counts raised by external auditors",
      "Corporate governance policy alignment score"
    ],
    boardImpact: "Derails IPO timeline by 12–18 months, causing major exit delays for VC/PE backers."
  }
};

// 1. STRATEGIC OBJECTIVES (F1 Mappings)
export const seededObjectives = [
  {
    id: "obj-ipo",
    title: "IPO Readiness & Listing SEBI Alignment",
    owner: "CEO & Founder",
    targetDate: "2027-09-30",
    importance: "Critical",
    successMetrics: "Double-audited books, clean Big 4 reports, SEBI listing brochure filed, and 3 independent board directors successfully appointed.",
    status: "Critical Gaps" // On Track, At Risk, Critical Gaps
  },
  {
    id: "obj-growth",
    title: "₹500 Cr ARR Revenue Milestones Expansion",
    owner: "CRO (Chief Revenue Officer)",
    targetDate: "2026-12-31",
    importance: "High",
    successMetrics: "Establish ₹500 Cr global annual recurring revenue (ARR) with Net Revenue Retention (NRR) hovering above 115%.",
    status: "On Track"
  },
  {
    id: "obj-retention",
    title: "Enterprise Customer Churn Prevention (<0.5%)",
    owner: "VP of Customer Success",
    targetDate: "2026-12-31",
    importance: "Critical",
    successMetrics: "Maintain monthly gross logo churn below 0.5% and net revenue retention at net-negative expansion rates.",
    status: "At Risk"
  },
  {
    id: "obj-ebitda",
    title: "Maintain 18%+ EBITDA Margin Operating Target",
    owner: "CFO (Chief Financial Officer)",
    targetDate: "2026-12-31",
    importance: "High",
    successMetrics: "Operating expenses managed within bounds to hold cash margins above 18% in prelim bankers audit evaluations.",
    status: "On Track"
  },
  {
    id: "obj-cyber",
    title: "Zero-Downtime InfoSec & SOC 2 Trust Assurance",
    owner: "CISO (Chief Information Security Officer)",
    targetDate: "2026-06-30",
    importance: "Critical",
    successMetrics: "100% automated test pass rate on SOC 2 agents, zero data breach reports, and zero un-scrubbed API leaks.",
    status: "On Track"
  }
];

// 2. SCENARIO ANALYSIS SIMULATOR DATA (F4 Mappings)
export const seededScenarios = [
  {
    id: "scen-cyber",
    title: "Multitenant Datastore Cyber Attack",
    description: "External threat actor exfiltrates transaction records containing customer PII, forcing endpoint shutdowns and SEBI/DPDPA regulatory notices.",
    objectiveId: "obj-cyber",
    revenueImpact: { best: "-₹60L", expected: "-₹1.5Cr", worst: "-₹5.5Cr" },
    ebitdaImpact: { best: "-2%", expected: "-5%", worst: "-18%" },
    cashImpact: { best: "-₹80L", expected: "-₹1.8Cr", worst: "-₹6.2Cr" },
    objectiveImpact: "Directly threatens InfoSec trust assurance goals and triggers compliance audits blocking SEBI IPO clearance."
  },
  {
    id: "scen-churn",
    title: "Major Customer Churn",
    description: "Top 3 enterprise customers decline contract renewal due to product delivery delays, dropping ARR and compressing runway.",
    objectiveId: "obj-retention",
    revenueImpact: { best: "-₹70L", expected: "-₹1.8Cr", worst: "-₹8.0Cr" },
    ebitdaImpact: { best: "-2.5%", expected: "-6%", worst: "-25%" },
    cashImpact: { best: "-₹90L", expected: "-₹2.2Cr", worst: "-₹9.2Cr" },
    objectiveImpact: "Threatens our 500 Cr ARR growth goals and reduces valuation multiples by 40% in VC discussions."
  },
  {
    id: "scen-exec",
    title: "Key Executive Resignation",
    description: "Sudden joint resignation of CRO and VP of Engineering to join a competitor, 4 months prior to planned IPO filing.",
    objectiveId: "obj-ipo",
    revenueImpact: { best: "-₹30L", expected: "-₹90L", worst: "-₹3.5Cr" },
    ebitdaImpact: { best: "-1%", expected: "-3%", worst: "-10%" },
    cashImpact: { best: "-₹40L", expected: "-₹1.2Cr", worst: "-₹4.2Cr" },
    objectiveImpact: "Delays IPO filing schedules by 3-6 months and disrupts global enterprise pipeline momentum."
  },
  {
    id: "scen-cloud",
    title: "Cloud Provider Outage",
    description: "Catastrophic DNS routing failure at primary cloud provider, rendering SaaS database clusters offline for 36 contiguous hours.",
    objectiveId: "obj-cyber",
    revenueImpact: { best: "-₹20L", expected: "-₹1.2Cr", worst: "-₹6.0Cr" },
    ebitdaImpact: { best: "-0.8%", expected: "-4%", worst: "-20%" },
    cashImpact: { best: "-₹30L", expected: "-₹1.5Cr", worst: "-₹7.5Cr" },
    objectiveImpact: "Breaches zero-downtime customer SLA targets, triggering mandatory refund payouts and trust loss."
  },
  {
    id: "scen-dpdp",
    title: "DPDP Consent Penalty",
    description: "Data Protection Board of India audit issues show-cause notice regarding non-compliant pre-checked user consent flows.",
    objectiveId: "obj-ipo",
    revenueImpact: { best: "-₹80L", expected: "-₹2.2Cr", worst: "-₹15.0Cr" },
    ebitdaImpact: { best: "-2.5%", expected: "-6%", worst: "-35%" },
    cashImpact: { best: "-₹1.1Cr", expected: "-₹2.8Cr", worst: "-₹18.0Cr" },
    objectiveImpact: "Threatens listing readiness; requires mandatory Prospectus amendments and regulatory penalty disclosure."
  },
  {
    id: "scen-fund",
    title: "Fundraising Failure",
    description: "Lead investor pulls out of ₹120 Crore Series C funding round at final closure stage, compressing corporate runway to 4 months.",
    objectiveId: "obj-ipo",
    revenueImpact: { best: "-₹1.1Cr", expected: "-₹2.8Cr", worst: "-₹12.0Cr" },
    ebitdaImpact: { best: "-3%", expected: "-7%", worst: "-30%" },
    cashImpact: { best: "-₹1.5Cr", expected: "-₹3.5Cr", worst: "-₹14.5Cr" },
    objectiveImpact: "Forces severe operational budget restructuring and puts IPO readiness funding on hold."
  },
  {
    id: "scen-competitor-capital",
    title: "Competitor Raises Large Capital",
    description: "Direct competitor closes a ₹650 Crore ($80M) Series D round, initiating a price-war and poaching key sales leads.",
    objectiveId: "obj-retention",
    revenueImpact: { best: "-₹50L", expected: "-₹1.5Cr", worst: "-₹7.0Cr" },
    ebitdaImpact: { best: "-1.5%", expected: "-5%", worst: "-20%" },
    cashImpact: { best: "-₹70L", expected: "-₹1.8Cr", worst: "-₹8.5Cr" },
    objectiveImpact: "Disrupts net renewal rates and compresses enterprise contract values due to discount matching."
  },
  {
    id: "scen-partner-loss",
    title: "Loss of Key Strategic Partner",
    description: "Primary channel systems integrator partner terminates distribution deal to launch their own competing SaaS platform.",
    objectiveId: "obj-retention",
    revenueImpact: { best: "-₹50L", expected: "-₹1.5Cr", worst: "-₹6.5Cr" },
    ebitdaImpact: { best: "-1.5%", expected: "-4.5%", worst: "-18%" },
    cashImpact: { best: "-₹70L", expected: "-₹1.8Cr", worst: "-₹8.2Cr" },
    objectiveImpact: "Closes 35% of shared sales pipelines, requiring rapid direct-to-market transition."
  },
  {
    id: "scen-regulator-investigation",
    title: "Regulatory Investigation by SEBI",
    description: "SEBI audit division opens an inquiry into historical disclosures, placing listing prospectus approvals on hold.",
    objectiveId: "obj-ipo",
    revenueImpact: { best: "-₹40L", expected: "-₹1.8Cr", worst: "-₹10.0Cr" },
    ebitdaImpact: { best: "-1.5%", expected: "-5%", worst: "-25%" },
    cashImpact: { best: "-₹60L", expected: "-₹2.2Cr", worst: "-₹12.5Cr" },
    objectiveImpact: "Causes mandatory Listing deferral, derailing capital schedules for backing funds."
  },
  {
    id: "scen-bankruptcy-client",
    title: "Large Enterprise Client Bankruptcy",
    description: "Our largest customer representing 20% of revenue files for insolvency, default-writing off ₹8 Crores of receivables.",
    objectiveId: "obj-retention",
    revenueImpact: { best: "-₹80L", expected: "-₹2.5Cr", worst: "-₹8.0Cr" },
    ebitdaImpact: { best: "-2.5%", expected: "-6.5%", worst: "-25%" },
    cashImpact: { best: "-₹1.1Cr", expected: "-₹3.2Cr", worst: "-₹10.5Cr" },
    objectiveImpact: "Directly drops EBITDA margins, compressing runway buffers and forcing debt covenant reviews."
  },
  {
    id: "scen-founder-conflict",
    title: "Founder Alignment Conflict",
    description: "CEO and CTO reach impasse over pivot strategies; CTO blocks codebase write-access and threatens immediate exit.",
    objectiveId: "obj-ipo",
    revenueImpact: { best: "-₹50L", expected: "-₹1.8Cr", worst: "-₹8.5Cr" },
    ebitdaImpact: { best: "-1.8%", expected: "-5%", worst: "-24%" },
    cashImpact: { best: "-₹70L", expected: "-₹2.2Cr", worst: "-₹11.2Cr" },
    objectiveImpact: "Derails product delivery sprints and triggers key governance warning signals to IPO backers."
  },
  {
    id: "scen-supply-disruption",
    title: "Supply Chain Disruption",
    description: "Hardware security token supplier goes bankrupt, freezing logistics and delaying 24 BFSI client onboarding pipelines.",
    objectiveId: "obj-retention",
    revenueImpact: { best: "-₹30L", expected: "-₹1.2Cr", worst: "-₹5.5Cr" },
    ebitdaImpact: { best: "-1%", expected: "-3.5%", worst: "-15%" },
    cashImpact: { best: "-₹45L", expected: "-₹1.5Cr", worst: "-₹6.8Cr" },
    objectiveImpact: "Triggers SLA breach penalties and blocks core financial account onboarding pipelines."
  }
]_;

// 3. RISK CULTURE SCORECARD INDEX DATA (F9 Mappings)
export const seededCultureMetrics = {
  policyAcknowledgementRate: 94,
  trainingCompletionRate: 88,
  incidentReportVelocityDays: 4,
  nearMissLoggedCount: 28,
  whistleblowerCasesActive: 0,
  cultureScore: 86, // (Weighted average)
  trend: "Improving" // Improving, Stable, Deteriorating
};

// Seeded Risks Pack, updated with V3 dimensions (Velocity timescales, Objective linkages, 3 Lines of Defense, Taxonomy)
export const seededRisks = [
  {
    id: "risk-001",
    title: "Top-Tier Enterprise Customer Concentration",
    category: "Financial",
    l1: "Financial",
    l2: "Revenue Concentration",
    l3: "Enterprise Churn",
    description: "Our top 3 enterprise customer accounts represent 48% of total annual recurring revenue (ARR). Churn of any single account would cause a massive revenue drop, threatening our cash runway.",
    owner: "CRO (Chief Revenue Officer)",
    businessUnit: "Enterprise Sales",
    location: "Bangalore HQ",
    
    // Multi-dimensional scoring + VELOCITY (F3)
    likelihood: 4,
    impact: 5,
    velocity: 4, // 1-5 scale (Calculates Inherent)
    inherentScore: 80, // L x I * 4
    
    likelihoodResidual: 3,
    impactResidual: 4,
    velocityResidual: 3,
    residualScore: 48, // LR * IR * 4
    
    timeToImpact: "Moderate", // Very Slow, Slow, Moderate, Fast, Immediate
    timeToDetection: "Fast",
    timeToRecovery: "Slow",
    
    // Appetite & Trends (F4 & F2)
    appetiteStatus: "Above Appetite", // Appetite: Score >= 45 is Above, 25-44 is Near, < 25 is Within
    trend: "Deteriorating", 
    
    // Strategic Linkage (F1)
    objectiveIds: ["obj-growth", "obj-retention"],

    // Enterprise Value Impact Mapping Profile (F6)
    fragility: {
      revenue: 5,
      growth: 4,
      customerTrust: 2,
      technology: 1,
      people: 2,
      operations: 3,
      reputation: 3,
      valuation: 5
    },

    // 3 Lines of Defense Assurance mapping (F8)
    assurance: {
      firstLine: "CRO / VP Enterprise Sales (Ownership)",
      secondLine: "Risk & Compliance Committee (Monitoring)",
      thirdLine: "Big 4 External Audit Assurance (Assurance)",
      gapDetected: false
    },

    // Network Relationships
    parentRiskId: "risk-013", // IPO Readiness Gaps
    childRiskIds: ["risk-008"], // Pricing Vulnerability
    relatedRiskIds: ["risk-002"], // Founder Dependency

    controls: [
      { name: "Executive Account Sponsorship Program", type: "Preventive", frequency: "Monthly", rating: "Partially Effective" },
      { name: "Multi-Year Lock-in Contracts (Minimum 24 months)", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Top 3 accounts revenue contribution", current: "48%", threshold: "35%", status: "BREACHED" }
    ],
    actions: [
      { id: "act-101", title: "Negotiate 3-year enterprise renewal for Top Client", owner: "Head of Account Management", dueDate: "2026-06-15", priority: "High", status: "In Progress" }
    ]
  },
  {
    id: "risk-002",
    title: "Founder Dependency on Technical & Deal Closure Architecture",
    category: "Strategic",
    l1: "Strategic",
    l2: "Key Person Dependency",
    l3: "Founder Silo",
    description: "Key product and architectural designs are single-point dependent on our founder/CTO. Additionally, enterprise deals above ₹2 Cr require the CEO's personal intervention, choking organizational scale.",
    owner: "CEO / Founder",
    businessUnit: "Executive Office",
    location: "Bangalore HQ",
    
    likelihood: 4,
    impact: 4,
    velocity: 3,
    inherentScore: 64,
    
    likelihoodResidual: 3,
    impactResidual: 4,
    velocityResidual: 3,
    residualScore: 48,
    
    timeToImpact: "Slow",
    timeToDetection: "Moderate",
    timeToRecovery: "Very Slow",
    
    appetiteStatus: "Above Appetite",
    trend: "Stable",
    
    objectiveIds: ["obj-ipo", "obj-growth"],
    
    fragility: {
      revenue: 3,
      growth: 5,
      customerTrust: 3,
      technology: 4,
      people: 4,
      operations: 4,
      reputation: 2,
      valuation: 4
    },

    assurance: {
      firstLine: "CEO & Founder (Ownership)",
      secondLine: "Board Governance Committee (Monitoring)",
      thirdLine: "None (GAP DETECTED)",
      gapDetected: true
    },

    parentRiskId: "risk-013", // IPO Readiness Gaps
    childRiskIds: ["risk-009"], // Talent Attrition
    relatedRiskIds: ["risk-001"], // Customer Concentration

    controls: [
      { name: "Succession mapping for tech leadership", type: "Corrective", frequency: "Annually", rating: "Ineffective" },
      { name: "Formal commercial authorization matrix", type: "Preventive", frequency: "Continuous", rating: "Partially Effective" }
    ],
    kris: [
      { name: "Founder time spent in low-level engineering audits", current: "35%", threshold: "15%", status: "BREACHED" }
    ],
    actions: [
      { id: "act-102", title: "Recruit VP of Engineering to takeover systems architecture", owner: "Chief People Officer", dueDate: "2026-07-31", priority: "High", status: "In Progress" }
    ]
  },
  {
    id: "risk-003",
    title: "Platform & API Dependency on Meta & AWS Services",
    category: "Technology",
    l1: "Technology",
    l2: "Infrastructure dependency",
    l3: "Third-Party API Block",
    description: "Our marketing engine core is tightly bound to Meta Graph APIs. Any sudden deprecation or pricing changes in Meta API access or AWS cloud services poses immediate downtime and operational failure risk.",
    owner: "VP of Engineering",
    businessUnit: "Infrastructure & Platform",
    location: "US East (AWS Region)",
    
    likelihood: 3,
    impact: 4,
    velocity: 5,
    inherentScore: 48,
    
    likelihoodResidual: 2,
    impactResidual: 4,
    velocityResidual: 4,
    residualScore: 32,
    
    timeToImpact: "Immediate",
    timeToDetection: "Immediate",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Improving",
    
    objectiveIds: ["obj-cyber"],
    
    fragility: {
      revenue: 4,
      growth: 3,
      customerTrust: 4,
      technology: 5,
      people: 1,
      operations: 5,
      reputation: 4,
      valuation: 3
    },

    assurance: {
      firstLine: "VP of Engineering (Ownership)",
      secondLine: "DevOps Security Compliance (Monitoring)",
      thirdLine: "Internal Auditing Squad (Assurance)",
      gapDetected: false
    },

    parentRiskId: null,
    childRiskIds: ["risk-004"], // Cyber Security & Data Breaches
    relatedRiskIds: ["risk-007"], // Vendor Supply Chain Risk

    controls: [
      { name: "Multi-Region Cloud Failover Setup", type: "Corrective", frequency: "Continuous", rating: "Effective" },
      { name: "Local caching of non-realtime API requests", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Meta API webhook error rate", current: "0.1%", threshold: "1.0%", status: "OK" }
    ],
    actions: [
      { id: "act-103", title: "Test AWS Multi-Region disaster recovery failover", owner: "Lead DevOps Engineer", dueDate: "2026-06-30", priority: "Medium", status: "Not Started" }
    ]
  },
  {
    id: "risk-004",
    title: "Cyber Security Breach on Customer Production Datastore",
    category: "Cyber",
    l1: "Cyber",
    l2: "Data Security",
    l3: "Multitenant Datastore Bypass",
    description: "Cyber threat landscape includes SQL injections, dependency vulnerability exploits (e.g. Log4j), or key leakage, leading to unauthorized access to tenant databases containing sensitive financial transactions.",
    owner: "Chief Information Security Officer (CISO)",
    businessUnit: "Security Operations",
    location: "Cloud Datacenters",
    
    likelihood: 3,
    impact: 5,
    velocity: 5,
    inherentScore: 60,
    
    likelihoodResidual: 2,
    impactResidual: 5,
    velocityResidual: 4,
    residualScore: 40,
    
    timeToImpact: "Immediate",
    timeToDetection: "Immediate",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Stable",
    
    objectiveIds: ["obj-cyber"],
    
    fragility: {
      revenue: 4,
      growth: 3,
      customerTrust: 5,
      technology: 4,
      people: 2,
      operations: 4,
      reputation: 5,
      valuation: 4
    },

    assurance: {
      firstLine: "CISO (Ownership)",
      secondLine: "SecOps Compliance Desk (Monitoring)",
      thirdLine: "None (GAP DETECTED)",
      gapDetected: true
    },

    parentRiskId: null,
    childRiskIds: ["risk-005"], // DPDPA Non-compliance
    relatedRiskIds: ["risk-006"], // SOC 2 Readiness

    controls: [
      { name: "Continuous intrusion detection systems (IDS)", type: "Detective", frequency: "Continuous", rating: "Effective" },
      { name: "Mandatory Employee Single Sign-On (SSO) with MFA", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Unpatched high security CVEs older than 14 days", current: "0", threshold: "2", status: "OK" }
    ],
    actions: [
      { id: "act-104", title: "Conduct annual external code pentesting audit", owner: "CISO", dueDate: "2026-06-25", priority: "High", status: "In Progress" }
    ]
  },
  {
    id: "risk-005",
    title: "Data Privacy & Indian DPDPA Non-Compliance Risks",
    category: "Privacy",
    l1: "Privacy",
    l2: "Regulatory Privacy",
    l3: "PII Consent Log Gaps",
    description: "Failure to enforce consent management frameworks, PII database encryption, or customer data erasure requests in compliance with the newly enacted Indian Digital Personal Data Protection Act (DPDPA).",
    owner: "Head of Legal & Compliance",
    businessUnit: "Legal & Privacy",
    location: "Pan-India Operations",
    
    likelihood: 4,
    impact: 5,
    velocity: 3,
    inherentScore: 80,
    
    likelihoodResidual: 2,
    impactResidual: 5,
    velocityResidual: 3,
    residualScore: 40,
    
    timeToImpact: "Slow",
    timeToDetection: "Moderate",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Improving",
    
    objectiveIds: ["obj-ipo", "obj-retention"],
    
    fragility: {
      revenue: 3,
      growth: 3,
      customerTrust: 5,
      technology: 3,
      people: 1,
      operations: 3,
      reputation: 5,
      valuation: 4
    },

    assurance: {
      firstLine: "Head of Legal & Compliance (Ownership)",
      secondLine: "Privacy Control Council (Monitoring)",
      thirdLine: "Internal Compliance Audit Team (Assurance)",
      gapDetected: false
    },

    parentRiskId: "risk-011", // Regulatory Compliance Shocks
    childRiskIds: [],
    relatedRiskIds: ["risk-004"], // Cyber Security Breach

    controls: [
      { name: "Consent logs manager module in core SaaS platform", type: "Preventive", frequency: "Continuous", rating: "Effective" },
      { name: "Encryption of database PII columns at rest", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Average turnaround time for Data Subject access requests", current: "12 Days", threshold: "15 Days", status: "OK" }
    ],
    actions: [
      { id: "act-105", title: "Formalize updated privacy policy matching DPDPA templates", owner: "Data Privacy Counsel", dueDate: "2026-06-10", priority: "Medium", status: "In Progress" }
    ]
  },
  {
    id: "risk-006",
    title: "SOC 2 Type II Security Readiness Gaps",
    category: "Compliance",
    l1: "Compliance",
    l2: "Industry certifications",
    l3: "Audit Trail Slippages",
    description: "Failure to maintain formalized security control audits, incident documentation, and automated system check logs, resulting in delay or loss of SOC 2 Type II certification.",
    owner: "CISO",
    businessUnit: "Security Operations",
    location: "Global Systems",
    
    likelihood: 4,
    impact: 4,
    velocity: 2,
    inherentScore: 64,
    
    likelihoodResidual: 2,
    impactResidual: 4,
    velocityResidual: 2,
    residualScore: 32,
    
    timeToImpact: "Moderate",
    timeToDetection: "Moderate",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Improving",
    
    objectiveIds: ["obj-ipo", "obj-cyber"],
    
    fragility: {
      revenue: 4,
      growth: 5,
      customerTrust: 4,
      technology: 3,
      people: 2,
      operations: 3,
      reputation: 4,
      valuation: 4
    },

    assurance: {
      firstLine: "CISO / VP Engineering (Ownership)",
      secondLine: "Information Security Committee (Monitoring)",
      thirdLine: "Big 4 CPA Independent SOC 2 Audit (Assurance)",
      gapDetected: false
    },

    parentRiskId: "risk-013", // IPO Readiness Gaps
    childRiskIds: [],
    relatedRiskIds: ["risk-004"], // Cyber Security Breach

    controls: [
      { name: "Continuous SOC 2 compliance monitoring agent", type: "Detective", frequency: "Continuous", rating: "Effective" },
      { name: "Formalized Git pull request peer approval flows", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Continuous check failure alerts open (>72 hours)", current: "3 Alerts", threshold: "0 Alerts", status: "BREACHED" }
    ],
    actions: [
      { id: "act-106", title: "Remediate failing checks flagged on compliance panel", owner: "SecOps Lead", dueDate: "2026-06-05", priority: "High", status: "In Progress" }
    ]
  },
  {
    id: "risk-007",
    title: "Critical Vendor Dependency Lock-in (Single-Source API)",
    category: "Vendor",
    l1: "Vendor",
    l2: "Vendor Supply Chain",
    l3: "Single API Core Lock",
    description: "We are heavily locked into a specialized third-party data-enrichment API vendor with no active backup. Service outages, unilateral contract termination, or pricing hikes would directly disrupt our analytics dashboards.",
    owner: "VP of Product",
    businessUnit: "Product Management",
    location: "Third-party services",
    
    likelihood: 3,
    impact: 3,
    velocity: 4,
    inherentScore: 36,
    
    likelihoodResidual: 3,
    impactResidual: 3,
    velocityResidual: 3,
    residualScore: 36,
    
    timeToImpact: "Fast",
    timeToDetection: "Immediate",
    timeToRecovery: "Slow",
    
    appetiteStatus: "Near Appetite",
    trend: "Stable",
    
    objectiveIds: ["obj-growth"],
    
    fragility: {
      revenue: 3,
      growth: 2,
      customerTrust: 3,
      technology: 4,
      people: 1,
      operations: 4,
      reputation: 2,
      valuation: 2
    },

    assurance: {
      firstLine: "VP of Product (Ownership)",
      secondLine: "Operations Audit Desk (Monitoring)",
      thirdLine: "None (GAP DETECTED)",
      gapDetected: true
    },

    parentRiskId: null,
    childRiskIds: [],
    relatedRiskIds: ["risk-003"], // Platform Dependency

    controls: [
      { name: "Vendor risk assessment audit", type: "Preventive", frequency: "Annually", rating: "Ineffective" }
    ],
    kris: [
      { name: "Single-vendor cost increase year-on-year", current: "+42%", threshold: "+25%", status: "BREACHED" }
    ],
    actions: [
      { id: "act-107", title: "Evaluate alternative enrichment APIs and draft integration schema", owner: "Lead Backend Developer", dueDate: "2026-08-15", priority: "Low", status: "Not Started" }
    ]
  },
  {
    id: "risk-008",
    title: "SaaS Revenue Model Pricing Structure Vulnerability",
    category: "Financial",
    l1: "Financial",
    l2: "Pricing Stability",
    l3: "Flat Seat Squeeze",
    description: "We operate flat pricing seat models with high support overheads. If market competitors launch usage-based pricing or bundle enrichment APIs for free, our contract renewals will suffer severe churn pressure.",
    owner: "CRO (Chief Revenue Officer)",
    businessUnit: "Enterprise Sales",
    location: "Global SaaS Markets",
    
    likelihood: 4,
    impact: 3,
    velocity: 3,
    inherentScore: 48,
    
    likelihoodResidual: 4,
    impactResidual: 3,
    velocityResidual: 3,
    residualScore: 48,
    
    timeToImpact: "Moderate",
    timeToDetection: "Moderate",
    timeToRecovery: "Slow",
    
    appetiteStatus: "Above Appetite",
    trend: "Deteriorating",
    
    objectiveIds: ["obj-growth", "obj-retention", "obj-ebitda"],
    
    fragility: {
      revenue: 5,
      growth: 4,
      customerTrust: 2,
      technology: 1,
      people: 1,
      operations: 2,
      reputation: 3,
      valuation: 5
    },

    assurance: {
      firstLine: "CRO (Ownership)",
      secondLine: "Sales Pricing Desk (Monitoring)",
      thirdLine: "External Financial Auditors (Assurance)",
      gapDetected: false
    },

    parentRiskId: "risk-001", // Top-Tier Customer Concentration
    childRiskIds: [],
    relatedRiskIds: [],

    controls: [
      { name: "Pricing tier adjustment council reviews", type: "Preventive", frequency: "Quarterly", rating: "Ineffective" }
    ],
    kris: [
      { name: "LTV to CAC ratio decay rate", current: "2.8x", threshold: "3.5x", status: "BREACHED" }
    ],
    actions: [
      { id: "act-108", title: "Prepare value-based pricing strategy proposal for Board review", owner: "Director of Product Growth", dueDate: "2026-06-20", priority: "Medium", status: "In Progress" }
    ]
  },
  {
    id: "risk-009",
    title: "Engineering Attrition & Key System Developer Loss",
    category: "People",
    l1: "People",
    l2: "Talent Retention",
    l3: "Architect Brain Drain",
    description: "High attrition of senior technical architects and developers in Bangalore due to competitive compensation pressures. This delays core roadmap releases by multiple quarters and decreases product stability.",
    owner: "VP of HR / Chief People Officer",
    businessUnit: "Human Resources",
    location: "Bangalore Office",
    
    likelihood: 4,
    impact: 4,
    velocity: 3,
    inherentScore: 64,
    
    likelihoodResidual: 3,
    impactResidual: 3,
    velocityResidual: 3,
    residualScore: 36,
    
    timeToImpact: "Moderate",
    timeToDetection: "Slow",
    timeToRecovery: "Very Slow",
    
    appetiteStatus: "Near Appetite",
    trend: "Stable",
    
    objectiveIds: ["obj-growth", "obj-retention"],
    
    fragility: {
      revenue: 2,
      growth: 4,
      customerTrust: 3,
      technology: 4,
      people: 5,
      operations: 3,
      reputation: 2,
      valuation: 3
    },

    assurance: {
      firstLine: "VP of HR / CPO (Ownership)",
      secondLine: "HR Compliance Audit Team (Monitoring)",
      thirdLine: "None (GAP DETECTED)",
      gapDetected: true
    },

    parentRiskId: "risk-002", // Founder Dependency
    childRiskIds: [],
    relatedRiskIds: [],

    controls: [
      { name: "Succession maps & critical knowledge bases", type: "Corrective", frequency: "Annually", rating: "Partially Effective" },
      { name: "ESOP pool expansion program", type: "Preventive", frequency: "Annually", rating: "Partially Effective" }
    ],
    kris: [
      { name: "Core developer regretted attrition", current: "14%", threshold: "8%", status: "BREACHED" }
    ],
    actions: [
      { id: "act-109", title: "Conduct comprehensive tech team compensation benchmarking", owner: "CPO", dueDate: "2026-06-30", priority: "Medium", status: "Not Started" }
    ]
  },
  {
    id: "risk-010",
    title: "AI Hallucination & Data Infringement IP Liability",
    category: "AI",
    l1: "AI",
    l2: "AI Governance",
    l3: "PII Ingestion Leak",
    description: "Our AI-powered customer reports module may output fabricated data (hallucinations) or accidentally ingest customer PII into public LLM fine-tuning pipelines, risking massive legal and trademark liabilities.",
    owner: "Head of AI Research & Dev",
    businessUnit: "AI Product Lab",
    location: "Bangalore HQ",
    
    likelihood: 3,
    impact: 4,
    velocity: 4,
    inherentScore: 48,
    
    likelihoodResidual: 3,
    impactResidual: 3,
    velocityResidual: 3,
    residualScore: 36,
    
    timeToImpact: "Fast",
    timeToDetection: "Fast",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Deteriorating",
    
    objectiveIds: ["obj-cyber"],
    
    fragility: {
      revenue: 3,
      growth: 3,
      customerTrust: 4,
      technology: 4,
      people: 2,
      operations: 3,
      reputation: 4,
      valuation: 3
    },

    assurance: {
      firstLine: "Head of AI R&D (Ownership)",
      secondLine: "Safety & Ethics Council (Monitoring)",
      thirdLine: "None (GAP DETECTED)",
      gapDetected: true
    },

    parentRiskId: null,
    childRiskIds: [],
    relatedRiskIds: ["risk-005"], // DPDPA Compliance

    controls: [
      { name: "Enterprise Zero Data Retention API Agreements", type: "Preventive", frequency: "Continuous", rating: "Effective" },
      { name: "Human-in-the-loop review on generated outputs", type: "Detective", frequency: "Continuous", rating: "Ineffective" }
    ],
    kris: [
      { name: "Weekly reports of AI compliance anomalies", current: "4 Incidents", threshold: "1 Incident", status: "BREACHED" }
    ],
    actions: [
      { id: "act-110", title: "Deploy automated regex-based PII scrubbers on LLM calls", owner: "Security Software Architect", dueDate: "2026-06-12", priority: "High", status: "In Progress" }
    ]
  },
  {
    id: "risk-011",
    title: "Regulatory Compliance & International Payment Shocks",
    category: "Legal",
    l1: "Legal",
    l2: "Regulatory Legal",
    l3: "Cross-Border Gateway Block",
    description: "Failure to comply with international tax frameworks (e.g. Nexus laws in US states, EU VAT rules) or strict RBI directives on cross-border recurring card subscriptions, disrupting auto-renew revenues.",
    owner: "VP of Finance",
    businessUnit: "Finance Operations",
    location: "Global Entities",
    
    likelihood: 3,
    impact: 4,
    velocity: 4,
    inherentScore: 48,
    
    likelihoodResidual: 2,
    impactResidual: 4,
    velocityResidual: 3,
    residualScore: 32,
    
    timeToImpact: "Fast",
    timeToDetection: "Moderate",
    timeToRecovery: "Moderate",
    
    appetiteStatus: "Near Appetite",
    trend: "Stable",
    
    objectiveIds: ["obj-growth", "obj-ebitda"],
    
    fragility: {
      revenue: 4,
      growth: 3,
      customerTrust: 2,
      technology: 2,
      people: 1,
      operations: 4,
      reputation: 3,
      valuation: 4
    },

    assurance: {
      firstLine: "VP of Finance (Ownership)",
      secondLine: "Treasury Compliance Desk (Monitoring)",
      thirdLine: "Internal Financial Audit Team (Assurance)",
      gapDetected: false
    },

    parentRiskId: null,
    childRiskIds: ["risk-005"], // DPDPA Compliance
    relatedRiskIds: [],

    controls: [
      { name: "Multi-Gateway Billing Router (Stripe + Adyen)", type: "Corrective", frequency: "Continuous", rating: "Effective" },
      { name: "External international tax audit reviews", type: "Preventive", frequency: "Annually", rating: "Effective" }
    ],
    kris: [
      { name: "International checkout gateway retry failures", current: "4.8%", threshold: "2.0%", status: "BREACHED" }
    ],
    actions: [
      { id: "act-111", title: "Transition secondary US entities to fully centralized billing gateway", owner: "Director of Treasury", dueDate: "2026-07-15", priority: "Medium", status: "Not Started" }
    ]
  },
  {
    id: "risk-013",
    title: "Governance Gaps Blocking IPO Readiness Timeline",
    category: "Strategic",
    l1: "Strategic",
    l2: "IPO Governance",
    l3: "SEBI Board Non-Compliance",
    description: "Failure to align our corporate structures with SEBI and public market governance standards (e.g., lacking the required ratio of independent directors, delay in closing audit statements), risking a major delay in our ₹400 Cr IPO prospectus filing.",
    owner: "CEO / Founder",
    businessUnit: "Executive Office",
    location: "Bangalore HQ",
    
    likelihood: 4,
    impact: 5,
    velocity: 3,
    inherentScore: 80,
    
    likelihoodResidual: 3,
    impactResidual: 5,
    velocityResidual: 3,
    residualScore: 60,
    
    timeToImpact: "Slow",
    timeToDetection: "Slow",
    timeToRecovery: "Very Slow",
    
    appetiteStatus: "Above Appetite",
    trend: "Deteriorating",
    
    objectiveIds: ["obj-ipo"],
    
    fragility: {
      revenue: 2,
      growth: 4,
      customerTrust: 3,
      technology: 1,
      people: 3,
      operations: 4,
      reputation: 4,
      valuation: 5
    },

    assurance: {
      firstLine: "CEO / Founders Office (Ownership)",
      secondLine: "Board Nomination Desk (Monitoring)",
      thirdLine: "Lead External Legal Counsel Assurer (Assurance)",
      gapDetected: false
    },

    parentRiskId: null,
    childRiskIds: ["risk-001", "risk-002", "risk-006"], // Feeds Customer Conc, Founder Dep, SOC 2
    relatedRiskIds: ["risk-011"], // Regulatory shocks

    controls: [
      { name: "Transition to Big 4 accounting firm for audits", type: "Preventive", frequency: "Continuous", rating: "Effective" }
    ],
    kris: [
      { name: "Independent director vacancy duration", current: "90 Days", threshold: "60 Days", status: "BREACHED" }
    ],
    actions: [
      { id: "act-113", title: "Nominate two independent director profiles to Board Committee", owner: "CEO / Board Nominations Head", dueDate: "2026-06-30", priority: "High", status: "In Progress" }
    ]
  }
];
