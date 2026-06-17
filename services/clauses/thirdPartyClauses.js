// Navis Clause Library — Third-Party Risk Management Clauses
// Wave 3.6: Institutional Quality Governance Documents

export const THIRD_PARTY_CLAUSES = [

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — ROLES & RESPONSIBILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-roles-001",
    name: "Vendor Risk Manager",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall appoint a Vendor Risk Manager who shall bear primary accountability for the design, implementation, and oversight of the third-party risk management programme. The Vendor Risk Manager shall maintain a comprehensive vendor inventory, oversee risk assessments for all third-party engagements, and ensure that vendor risk postures remain within the organization's approved risk appetite. The Vendor Risk Manager shall report to the Chief Risk Officer or equivalent executive and shall provide quarterly vendor risk reports to the Risk Committee documenting material risks, remediation progress, and emerging third-party threats.",
    rationale: "ISO 27001 A.15.1.1 requires an information security policy for supplier relationships with defined responsibilities. SOC 2 CC9.2 mandates assessment and management of risks associated with vendors and business partners."
  },
  {
    id: "cl-tp-roles-002",
    name: "Procurement Team Responsibilities",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Standard",
    confidence: "high",
    version: "v1.0",
    text: "The Procurement function within {{COMPANY_NAME}} shall integrate third-party risk management requirements into all sourcing, evaluation, and onboarding processes. The Procurement team shall ensure that no vendor engagement proceeds to contract execution without a completed risk assessment and documented approval from the Vendor Risk Manager. The Procurement team shall maintain standardized vendor onboarding checklists that include security questionnaire completion, due diligence documentation collection, and contractual security clause incorporation as mandatory prerequisites to vendor activation.",
    rationale: "ISO 27001 A.15.1.2 requires addressing all relevant information security requirements within supplier agreements. SOC 2 CC9.2 mandates that vendor management processes include risk assessment prior to engagement."
  },
  {
    id: "cl-tp-roles-003",
    name: "Contract Management Function",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish a Contract Management function responsible for ensuring that all third-party agreements incorporate mandatory security, privacy, and compliance clauses as defined by the Legal, Information Security, and Privacy functions. The Contract Management function shall maintain a centralized contract repository with automated expiry notifications, renewal tracking, and obligation monitoring capabilities. All vendor contracts involving access to {{COMPANY_NAME}} data, systems, or facilities shall undergo mandatory review by Information Security and Legal prior to execution.",
    rationale: "ISO 27001 A.15.1.2 mandates that agreements with suppliers include requirements to address information security risks. NIST CSF ID.SC-3 requires that suppliers and third-party partners are contractually obligated to implement appropriate safeguards."
  },
  {
    id: "cl-tp-roles-004",
    name: "Third-Party Audit Team",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall designate a Third-Party Audit Team, comprising representatives from Internal Audit, Information Security, and Compliance, responsible for conducting periodic assessments and audits of critical and high-risk vendors. The Third-Party Audit Team shall develop and maintain a risk-based audit schedule, execute on-site and remote vendor assessments, and track remediation of identified findings to closure. Audit results shall be documented in formal reports and shared with the Vendor Risk Manager and relevant business owners within thirty (30) calendar days of audit completion.",
    rationale: "ISO 27001 A.15.2.1 requires organizations to regularly monitor, review, and audit supplier service delivery. SOC 2 CC9.2 mandates ongoing assessment of vendor controls and risk postures."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: VENDOR RISK ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-vra-001",
    name: "Vendor Due Diligence Framework",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement a documented vendor due diligence framework that defines the assessment methodology, evaluation criteria, and approval workflows applicable to all prospective and existing third-party relationships. The framework shall assess vendors across security, privacy, financial stability, business continuity, regulatory compliance, and reputational risk dimensions. Due diligence depth and rigor shall be proportionate to the criticality of the vendor relationship, the sensitivity of data accessed, and the potential impact of vendor failure on {{COMPANY_NAME}}'s operations and obligations.",
    rationale: "ISO 27001 A.15.1.1 requires identification and documentation of information security requirements for mitigating risks associated with supplier access. NIST CSF ID.SC-2 requires identification, prioritization, and assessment of suppliers and partners of critical systems."
  },
  {
    id: "cl-tp-vra-002",
    name: "Vendor Risk Classification",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall classify all third-party vendors into risk tiers based on a standardized risk scoring methodology. Vendors shall be classified as Critical (Tier 1), High (Tier 2), Medium (Tier 3), or Low (Tier 4) based on factors including data access scope, system integration depth, operational dependency, regulatory sensitivity, and replaceability. Risk classification shall determine the frequency and depth of ongoing monitoring, audit rights exercised, contractual control requirements, and executive approval thresholds. Vendor risk classifications shall be reviewed and updated no less than annually or upon material change in the vendor relationship.",
    rationale: "ISO 27001 A.15.1.1 requires a risk-based approach to supplier relationship management. SOC 2 CC9.2 mandates risk-based categorization of vendors for differentiated oversight."
  },
  {
    id: "cl-tp-vra-003",
    name: "Security Questionnaire Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require all Tier 1 and Tier 2 vendors to complete a comprehensive security questionnaire based on industry-standard assessment frameworks prior to onboarding and no less than annually thereafter. Security questionnaires shall assess the vendor's information security programme maturity, access control mechanisms, encryption practices, incident response capabilities, business continuity arrangements, and relevant certifications. Questionnaire responses shall be validated against independent evidence including SOC 2 reports, ISO 27001 certificates, penetration test summaries, and vulnerability assessment results. Material gaps identified through questionnaire assessment shall be documented as accepted risks or addressed through contractual remediation requirements.",
    rationale: "ISO 27001 A.15.2.1 mandates monitoring and review of supplier services. NIST CSF ID.SC-2 requires assessment of suppliers using established criteria."
  },
  {
    id: "cl-tp-vra-004",
    name: "Vendor Financial Stability Assessment",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall assess the financial stability and viability of all Critical and High-risk vendors as part of initial due diligence and on an ongoing annual basis. Financial assessments shall include review of audited financial statements, credit ratings, litigation disclosures, and material business developments. For vendors that are privately held or unable to provide audited financials, {{COMPANY_NAME}} shall obtain alternative evidence of financial stability through parent company guarantees, bank references, or third-party financial intelligence services. Evidence of material financial deterioration shall trigger an immediate contingency planning review and potential activation of vendor exit strategies.",
    rationale: "ISO 27001 A.15.1.1 requires assessment of supplier viability risks. NIST CSF ID.SC-2 mandates assessment of supplier resilience including financial stability."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: SUB-PROCESSOR MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-subproc-001",
    name: "Sub-Processor Approval Workflow",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require all data processors engaged by the organization to obtain prior written authorization before engaging or changing any sub-processor that will process personal data or access confidential information on behalf of {{COMPANY_NAME}}. The sub-processor approval workflow shall include a risk assessment of the proposed sub-processor, verification of adequate data protection measures, and formal approval by the {{DPO_OFFICER}} or designated privacy function representative. All approved sub-processors shall be documented in a sub-processor register that is maintained current and made available to data subjects and supervisory authorities upon request.",
    rationale: "GDPR Article 28(2) requires prior specific or general written authorization for sub-processor engagement. ISO 27001 A.15.1.2 mandates addressing security requirements in supplier agreements including sub-contracting provisions."
  },
  {
    id: "cl-tp-subproc-002",
    name: "Sub-Processor Monitoring",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement ongoing monitoring of all approved sub-processors to verify continued compliance with data protection obligations, security requirements, and contractual commitments. Monitoring activities shall include annual review of sub-processor security certifications, periodic assessment of sub-processor incident history, and validation that sub-processor data handling practices remain consistent with the documented data processing agreements. The primary processor shall be contractually obligated to provide {{COMPANY_NAME}} with sub-processor audit reports, certification status updates, and immediate notification of any sub-processor security incidents affecting {{COMPANY_NAME}} data.",
    rationale: "GDPR Article 28(4) requires the processor to remain fully liable for sub-processor obligations. ISO 27001 A.15.2.1 requires regular monitoring and review of supplier service delivery."
  },
  {
    id: "cl-tp-subproc-003",
    name: "Sub-Processor Change Notification",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["GDPR", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "controller",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require all processors to provide no less than thirty (30) calendar days' prior written notice before adding, replacing, or materially altering the scope of any sub-processor. The notification shall include the identity and location of the proposed sub-processor, the processing activities to be performed, and the data protection measures implemented. {{COMPANY_NAME}} shall retain the right to object to any proposed sub-processor change and, in the event of an unresolved objection, shall retain the right to terminate the processing agreement without penalty. Where {{COMPANY_NAME}} acts as a processor, it shall extend equivalent sub-processor change notification obligations to its own customers.",
    rationale: "GDPR Article 28(2) requires notification of intended changes concerning sub-processors with opportunity to object. ISO 27001 A.15.1.2 mandates supplier agreements addressing sub-contracting controls."
  },
  {
    id: "cl-tp-subproc-004",
    name: "Data Processing Agreements",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["GDPR", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall execute Data Processing Agreements (DPAs) with all third parties that process personal data on behalf of the organization, prior to the commencement of any data processing activities. DPAs shall specify the subject matter and duration of processing, the nature and purpose of processing, the types of personal data processed, the categories of data subjects, and the obligations and rights of {{COMPANY_NAME}} as controller. DPAs shall incorporate mandatory clauses addressing data security measures, breach notification obligations, sub-processor controls, data subject rights assistance, data return and deletion upon termination, and demonstration of compliance through audits and inspections.",
    rationale: "GDPR Article 28(3) mandates binding contracts between controllers and processors specifying processing details. ISO 27001 A.15.1.2 requires documented agreements addressing information security requirements."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: CONTRACT CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-contract-001",
    name: "Security SLA Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall incorporate mandatory security service level agreements (SLAs) into all contracts with Tier 1 and Tier 2 vendors that access, process, store, or transmit {{COMPANY_NAME}} data or connect to {{COMPANY_NAME}} systems. Security SLAs shall define measurable targets for vulnerability remediation timelines (critical vulnerabilities within seventy-two hours, high vulnerabilities within thirty days), incident notification timelines (within twenty-four hours of detection), system availability, patch management cadence, and access review frequency. Non-compliance with security SLAs shall trigger formal remediation plans and, for persistent non-compliance, contractual escalation mechanisms including financial penalties and termination rights.",
    rationale: "ISO 27001 A.15.1.2 mandates agreement on information security requirements with suppliers. SOC 2 CC9.2 requires vendor agreements to include security-related commitments and obligations."
  },
  {
    id: "cl-tp-contract-002",
    name: "Right-to-Audit Clauses",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "GDPR", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "All contracts with Tier 1 and Tier 2 vendors shall include right-to-audit clauses granting {{COMPANY_NAME}} or its designated auditors the right to conduct security, privacy, and compliance audits of the vendor's operations, facilities, and systems relevant to the services provided. Right-to-audit provisions shall permit both scheduled audits with reasonable notice and unscheduled audits triggered by security incidents or material compliance concerns. The vendor shall be contractually obligated to provide full cooperation, access to relevant personnel and documentation, and timely remediation of audit findings. Where direct audit is impractical, {{COMPANY_NAME}} shall accept equivalent independent third-party audit reports such as SOC 2 Type II or ISO 27001 certification as alternative assurance mechanisms.",
    rationale: "GDPR Article 28(3)(h) requires the processor to allow for and contribute to audits conducted by the controller. ISO 27001 A.15.2.1 mandates monitoring and audit of supplier service delivery."
  },
  {
    id: "cl-tp-contract-003",
    name: "Data Protection Addendums",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["GDPR", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall append Data Protection Addendums (DPAs) to all vendor contracts where the vendor will access, process, or store personal data. DPAs shall incorporate the requirements of all applicable data protection regulations in jurisdictions where {{COMPANY_NAME}} operates, including provisions for cross-border data transfer mechanisms, data localization requirements, and supervisory authority cooperation. DPAs shall be reviewed and updated upon changes to applicable data protection laws and shall take precedence over conflicting provisions in the master services agreement. The {{DPO_OFFICER}} shall approve all DPAs prior to execution.",
    rationale: "GDPR Article 28(3) mandates contractual binding of processors with specific data protection provisions. ISO 27001 A.15.1.2 requires agreements addressing information security in the supply chain."
  },
  {
    id: "cl-tp-contract-004",
    name: "Liability and Indemnification Provisions",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "All contracts with Tier 1 and Tier 2 vendors shall include liability and indemnification provisions that allocate financial responsibility for data breaches, security incidents, regulatory penalties, and third-party claims arising from the vendor's failure to meet contractual security and privacy obligations. Indemnification clauses shall cover direct damages, regulatory fines and penalties, breach notification costs, credit monitoring expenses, legal fees, and reputational harm. {{COMPANY_NAME}} shall require vendors to maintain adequate cyber liability insurance coverage proportionate to the risk exposure of the engagement, with {{COMPANY_NAME}} named as an additional insured where contractually feasible.",
    rationale: "ISO 27001 A.15.1.2 requires agreements to address liability for information security failures. SOC 2 CC9.2 mandates that vendor contracts include provisions for risk allocation and indemnification."
  },
  {
    id: "cl-tp-contract-005",
    name: "Termination and Data Return Provisions",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["GDPR", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All vendor contracts involving access to {{COMPANY_NAME}} data shall include documented termination and data return provisions that define the procedures, timelines, and obligations for the secure transition or return of all data upon contract expiration, termination, or vendor change. The vendor shall be contractually obligated to return all {{COMPANY_NAME}} data in a standard, machine-readable format within thirty (30) calendar days of termination and to irrevocably delete all copies of {{COMPANY_NAME}} data from the vendor's systems, including backup media, within sixty (60) calendar days. The vendor shall provide written certification of data destruction upon completion, and {{COMPANY_NAME}} shall retain the right to verify destruction through audit.",
    rationale: "GDPR Article 28(3)(g) requires processors to delete or return personal data at the end of the processing relationship. ISO 27001 A.15.1.2 mandates agreement on information asset return and disposal upon contract termination."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: ONGOING MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-ongoing-001",
    name: "Annual Vendor Reassessment",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct formal risk reassessments of all Tier 1 vendors no less than annually and Tier 2 vendors no less than biennially. Reassessments shall evaluate changes in the vendor's security posture, financial condition, regulatory compliance status, operational performance, and relevance of risk classification. Reassessment methodology shall include updated security questionnaires, review of current third-party audit reports, evaluation of incident history, and assessment of any material changes to the vendor's organizational structure, ownership, or sub-processor arrangements. Reassessment results shall be documented and shared with the relevant business owner and the Vendor Risk Manager.",
    rationale: "ISO 27001 A.15.2.1 requires organizations to regularly monitor, review, and audit supplier service delivery. SOC 2 CC9.2 mandates periodic reassessment of vendor risk profiles."
  },
  {
    id: "cl-tp-ongoing-002",
    name: "Continuous Monitoring Indicators",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement continuous monitoring of key risk indicators for all Critical and High-risk vendors between formal assessment cycles. Continuous monitoring shall encompass automated security rating feeds, dark web exposure monitoring, financial distress signals, regulatory enforcement actions, adverse media alerts, and technology vulnerability disclosures affecting vendor products and services. Material changes in any monitored indicator shall trigger an automated alert to the Vendor Risk Manager and initiate an ad hoc risk review within five (5) business days. Continuous monitoring data shall be integrated into the vendor risk management platform to maintain current risk profiles.",
    rationale: "NIST CSF ID.SC-4 requires continuous monitoring of suppliers and third parties. ISO 27001 A.15.2.2 mandates management of changes to supplier services."
  },
  {
    id: "cl-tp-ongoing-003",
    name: "Vendor Incident Management",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "GDPR", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require all vendors with access to {{COMPANY_NAME}} data or systems to report any security incident, data breach, or service disruption that may affect {{COMPANY_NAME}} within twenty-four (24) hours of detection. Vendor contracts shall define incident notification procedures, required information to be included in incident reports, vendor cooperation obligations during investigation, and {{COMPANY_NAME}}'s rights to direct or participate in incident response activities. {{COMPANY_NAME}} shall maintain a documented vendor incident response playbook that defines internal escalation procedures, impact assessment protocols, regulatory notification requirements, and post-incident vendor accountability mechanisms.",
    rationale: "GDPR Article 33(2) requires processors to notify controllers of personal data breaches without undue delay. ISO 27001 A.16.1.2 requires reporting of information security events through appropriate management channels."
  },
  {
    id: "cl-tp-ongoing-004",
    name: "Vendor Performance Scorecards",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Standard",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain performance scorecards for all Tier 1 and Tier 2 vendors that track and measure vendor performance across security, compliance, service delivery, and relationship management dimensions. Scorecards shall incorporate quantitative metrics including SLA compliance rates, incident frequency and severity, audit finding closure rates, assessment completion timeliness, and security rating scores. Scorecard results shall be reviewed with vendor representatives during quarterly business reviews and shall serve as a formal input to contract renewal decisions, scope adjustments, and potential vendor replacement evaluations.",
    rationale: "ISO 27001 A.15.2.1 requires monitoring, reviewing, and evaluating supplier service delivery. SOC 2 CC9.2 mandates evaluation of vendor performance against established criteria."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: FOURTH-PARTY RISK
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-fourthparty-001",
    name: "Fourth-Party Visibility Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require all Critical and High-risk vendors to disclose the identity, location, and role of any fourth parties (the vendor's own suppliers and sub-contractors) that will have access to {{COMPANY_NAME}} data, contribute to service delivery, or host critical infrastructure components supporting services provided to {{COMPANY_NAME}}. Vendors shall be contractually obligated to maintain and provide an updated fourth-party register upon request and to notify {{COMPANY_NAME}} of material changes to fourth-party arrangements. {{COMPANY_NAME}} shall assess the risk exposure introduced by material fourth-party dependencies and shall retain the right to object to fourth-party engagements that introduce unacceptable risk.",
    rationale: "NIST CSF ID.SC-2 requires identification and assessment of suppliers of critical systems including downstream dependencies. ISO 27001 A.15.1.3 mandates addressing ICT supply chain risks."
  },
  {
    id: "cl-tp-fourthparty-002",
    name: "Concentration Risk Management",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall identify, measure, and manage concentration risk across its third-party and fourth-party ecosystem. Concentration risk assessments shall evaluate dependencies on single vendors for critical services, geographic concentration of vendor operations or infrastructure, shared infrastructure providers across multiple vendors, and single points of failure in the supply chain. {{COMPANY_NAME}} shall establish concentration risk thresholds for critical service categories and shall develop diversification strategies or enhanced contingency plans where concentration exceeds approved limits. Concentration risk exposure shall be reported to the Risk Committee on a quarterly basis.",
    rationale: "NIST CSF ID.SC-1 requires supply chain risk management processes that address concentration risk. SOC 2 CC9.1 mandates identification and assessment of risks including vendor concentration."
  },
  {
    id: "cl-tp-fourthparty-003",
    name: "Supply Chain Mapping",
    group: "Policy Requirements",
    section: 6,
    domain: "third_party",
    frameworks: ["ISO 27001", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall develop and maintain a supply chain map that documents the end-to-end flow of data and services across third-party and fourth-party relationships for all critical business functions. The supply chain map shall identify data processing locations, data transfer mechanisms, technology platforms utilized, and the jurisdictional scope of each entity in the supply chain. Supply chain mapping shall be updated no less than annually and shall be utilized as a primary input to risk assessment, business continuity planning, and regulatory compliance activities. The supply chain map shall be reviewed by the Vendor Risk Manager and made available to the {{DPO_OFFICER}} for data protection impact assessments.",
    rationale: "NIST CSF ID.SC-2 requires identification and prioritization of suppliers and partners. ISO 27001 A.15.1.3 mandates addressing information and communication technology supply chain risks."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — MONITORING & COMPLIANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-monitoring-001",
    name: "Vendor Compliance Dashboard",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain a centralized vendor compliance dashboard that provides real-time visibility into the compliance status of all third-party relationships. The dashboard shall track assessment completion rates, overdue reassessments, open audit findings, SLA compliance metrics, contractual obligation adherence, and security rating trends. The dashboard shall be accessible to the Vendor Risk Manager, relevant business owners, and senior leadership and shall support drill-down capabilities to individual vendor risk profiles. Dashboard data shall be refreshed no less than weekly and shall serve as the primary reporting mechanism for vendor risk governance.",
    rationale: "ISO 27001 A.15.2.1 requires monitoring and review of supplier services. SOC 2 CC4.1 mandates ongoing monitoring activities for evaluating the operating effectiveness of controls."
  },
  {
    id: "cl-tp-monitoring-002",
    name: "Third-Party Risk Reporting",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "The Vendor Risk Manager shall produce and distribute a quarterly Third-Party Risk Report to the Risk Committee and senior executive leadership. The report shall include an executive summary of the overall third-party risk posture, material vendor risk events, changes to critical vendor risk profiles, concentration risk analysis, regulatory compliance status, and key risk indicators trending. The report shall identify vendors requiring enhanced oversight, remediation actions in progress, and strategic recommendations for vendor risk programme improvements. An annual comprehensive third-party risk report shall be presented to the Board of Directors or its delegated risk oversight committee.",
    rationale: "ISO 27001 §9.3 requires management review including information on supplier performance. NIST CSF ID.SC-1 mandates reporting on supply chain risk management to stakeholders."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — REVIEW & MAINTENANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-tp-review-001",
    name: "Annual Vendor Review Cycle",
    group: "Review & Maintenance",
    section: 10,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct an annual comprehensive review of the third-party risk management programme, including the vendor risk management framework, assessment methodologies, classification criteria, contractual standards, and monitoring procedures. The annual review shall evaluate the programme's effectiveness in identifying, assessing, and mitigating third-party risks and shall benchmark the programme against industry best practices, regulatory expectations, and emerging threat landscapes. Review findings shall be documented and result in an updated programme roadmap with prioritized enhancements, resource requirements, and implementation timelines approved by the Chief Risk Officer.",
    rationale: "ISO 27001 §9.3 requires management review of the ISMS at planned intervals. SOC 2 CC4.2 mandates evaluation and communication of internal control deficiencies in a timely manner."
  },
  {
    id: "cl-tp-review-002",
    name: "Contract Renewal Assessment",
    group: "Review & Maintenance",
    section: 10,
    domain: "third_party",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct a formal risk and compliance assessment prior to the renewal of any Tier 1 or Tier 2 vendor contract. The renewal assessment shall evaluate the vendor's performance scorecard results, current risk classification, outstanding audit findings, incident history, financial stability, and continued alignment with {{COMPANY_NAME}}'s strategic objectives. The assessment shall also evaluate whether contractual security and privacy clauses remain adequate in light of evolving regulatory requirements and organizational needs. Contract renewals for Critical vendors shall require approval from the Vendor Risk Manager, the relevant business owner, and the Chief Information Security Officer or equivalent executive.",
    rationale: "ISO 27001 A.15.2.2 requires management of changes to supplier services. SOC 2 CC9.2 mandates reassessment of vendor risks at contract renewal points."
  }
];
