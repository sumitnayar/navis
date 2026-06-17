// Navis Clause Library — General Governance Clauses
// Wave 3.6: Institutional Quality Governance Documents
// Total: 60 clauses across Sections 1–3, 7–12

export const GENERAL_CLAUSES = [

  // ============================================================
  // SECTION 1 — PURPOSE & OBJECTIVE (8 clauses)
  // ============================================================

  {
    id: "cl-gen-purpose-001",
    name: "General Governance Purpose Statement",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27701", "ISO 22301", "NIST CSF", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "This policy establishes the overarching governance framework through which {{COMPANY_NAME}} shall direct, control, and continuously improve its information governance posture. The framework shall ensure that organizational objectives are achieved while maintaining compliance with all applicable legal, regulatory, and contractual obligations. {{COMPANY_NAME}} shall embed governance principles into all business functions, technology operations, and strategic decision-making processes to safeguard stakeholder interests and institutional integrity.",
    rationale: "Establishes the foundational governance mandate required by ISO 27001 Clause 5.1 (Leadership and commitment) and COBIT 2019 EDM01 (Ensured Governance Framework Setting and Maintenance). A clearly articulated purpose statement is a prerequisite for all downstream policy sections."
  },

  {
    id: "cl-gen-purpose-002",
    name: "Information Security Purpose",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish and maintain an Information Security Management System (ISMS) to preserve the confidentiality, integrity, and availability of all information assets under its custody or control. This policy shall define the security objectives, risk appetite, and control framework necessary to protect information assets against unauthorized access, disclosure, modification, destruction, or disruption. All information security controls shall be proportionate to the assessed risk and aligned with the organization's strategic objectives.",
    rationale: "Directly fulfills ISO 27001 Clause 5.2 (Policy) and NIST CSF ID.GV-1 (Organizational information security policy). SOC 2 Trust Services Criteria CC1.1 requires a defined commitment to security principles."
  },

  {
    id: "cl-gen-purpose-003",
    name: "Privacy Management Purpose",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["GDPR", "ISO 27701", "DPDPA", "CCPA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish a Privacy Information Management System (PIMS) to ensure the lawful, fair, and transparent processing of personal data across all jurisdictions in which it operates. This policy shall articulate the principles, obligations, and accountability mechanisms through which {{COMPANY_NAME}} fulfills its duties as a data controller and, where applicable, as a data processor. All personal data processing activities shall be conducted in strict accordance with the data protection laws of {{CUSTOMER_GEOGRAPHY}} and any additional jurisdictions in which data subjects reside.",
    rationale: "Fulfills GDPR Article 5(2) accountability principle, ISO 27701 Clause 5.2.1 (Understanding the needs and expectations of interested parties), and DPDPA Section 4 (Obligations of Data Fiduciary). Establishes the dual controller-processor mandate."
  },

  {
    id: "cl-gen-purpose-004",
    name: "Business Resilience Purpose",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["ISO 22301", "NIST CSF", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish and maintain a Business Continuity Management System (BCMS) to ensure the resilience of critical business operations, technology infrastructure, and service delivery capabilities against disruptive events. This policy shall define the recovery objectives, continuity strategies, and crisis management protocols necessary to minimize operational downtime and protect stakeholder value. All resilience measures shall be validated through regular testing, exercising, and lessons-learned reviews.",
    rationale: "Fulfills ISO 22301 Clause 5.2 (Policy) and NIST CSF PR.IP-9 (Response and recovery plans). COBIT 2019 DSS04 (Managed Continuity) requires a documented continuity management commitment."
  },

  {
    id: "cl-gen-purpose-005",
    name: "Third-Party Governance Purpose",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27036", "NIST CSF", "DORA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish a comprehensive third-party risk management framework to govern the selection, onboarding, monitoring, and offboarding of all external service providers, vendors, and partners that access, process, store, or transmit organizational data or provide critical business services. This policy shall ensure that third-party engagements do not introduce unacceptable risk to the organization's security posture, privacy obligations, or operational resilience. All third-party relationships shall be subject to due diligence, contractual controls, and ongoing performance monitoring commensurate with the risk they present.",
    rationale: "Fulfills ISO 27001 Annex A.15 (Supplier relationships), ISO 27036 (Information security for supplier relationships), NIST CSF ID.SC (Supply Chain Risk Management), and DORA Article 28 (ICT third-party risk management)."
  },

  {
    id: "cl-gen-purpose-006",
    name: "AI Governance Purpose",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["EU AI Act", "NIST AI RMF", "ISO 42001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish an Artificial Intelligence Governance Framework to ensure the responsible, ethical, and transparent development, deployment, and operation of AI and machine learning systems across the organization. This policy shall define the risk classification, human oversight, bias mitigation, and accountability mechanisms necessary to ensure that AI systems operate within acceptable risk tolerances and comply with applicable regulatory requirements. All AI systems deployed by {{COMPANY_NAME}} shall be subject to impact assessments, monitoring for drift and bias, and documented human oversight protocols prior to production deployment.",
    rationale: "Fulfills EU AI Act Article 9 (Risk management system), NIST AI RMF GOVERN function, and ISO 42001 Clause 5.2 (AI Management System Policy). Proactively addresses emerging regulatory requirements for AI governance."
  },

  {
    id: "cl-gen-purpose-007",
    name: "Regulatory Compliance Objective",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["ISO 27001", "GDPR", "SOC 2", "HIPAA", "DPDPA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain continuous compliance with all applicable laws, regulations, industry standards, and contractual obligations governing its operations in {{CUSTOMER_GEOGRAPHY}}. The organization shall implement a regulatory compliance monitoring program to identify, assess, and respond to changes in the legal and regulatory landscape that affect its governance obligations. Compliance gaps shall be documented, escalated to the appropriate governance body, and remediated within defined timelines established by the compliance function.",
    rationale: "Fulfills ISO 27001 Annex A.18.1 (Compliance with legal and contractual requirements), GDPR Article 5(1)(a) (Lawfulness), and SOC 2 CC2.2 (Communication of internal control information). Establishes proactive regulatory tracking as a governance obligation."
  },

  {
    id: "cl-gen-purpose-008",
    name: "Business Alignment Objective",
    group: "Purpose & Objective",
    section: 1,
    domain: "general",
    frameworks: ["COBIT", "ISO 27001", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "All governance policies, standards, and procedures established under this framework shall be aligned with the strategic business objectives, risk appetite, and operational priorities of {{COMPANY_NAME}}. The governance framework shall serve as an enabler of business value, not solely as a compliance mechanism, ensuring that security, privacy, and resilience investments are proportionate to the risks they mitigate and the business outcomes they support. The Board of Directors and executive leadership shall review the alignment between governance objectives and business strategy no less than annually.",
    rationale: "Fulfills COBIT 2019 EDM01.01 (Evaluate the governance system), ISO 27001 Clause 4.1 (Understanding the organization and its context), and NIST CSF ID.BE (Business Environment). Ensures governance is positioned as a strategic function rather than a purely technical discipline."
  },

  // ============================================================
  // SECTION 2 — SCOPE (8 clauses)
  // ============================================================

  {
    id: "cl-gen-scope-001",
    name: "Global Organizational Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27701", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all business units, departments, divisions, subsidiaries, and affiliated entities operating under the corporate umbrella of {{COMPANY_NAME}}, regardless of geographic location or legal jurisdiction. The scope shall encompass all operational, administrative, and strategic functions performed by or on behalf of the organization. Where {{COMPANY_NAME}} exercises controlling interest or management authority over a related entity, that entity shall adopt and implement this policy or demonstrate equivalent governance controls.",
    rationale: "Fulfills ISO 27001 Clause 4.3 (Determining the scope of the ISMS) and COBIT 2019 EDM01.02 (Direct the governance system). Enterprise-wide scope ensures no organizational function operates outside the governance perimeter."
  },

  {
    id: "cl-gen-scope-002",
    name: "IT Systems and Infrastructure Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all information technology systems, infrastructure components, networks, endpoints, servers, databases, middleware, and application platforms owned, operated, leased, or managed by {{COMPANY_NAME}}. The scope shall include production environments, development and staging environments, disaster recovery sites, and any shadow IT systems identified through asset discovery processes. All IT assets shall be inventoried, classified, and subject to the governance controls defined in this policy.",
    rationale: "Fulfills ISO 27001 Annex A.8.1 (Responsibility for assets), NIST CSF ID.AM (Asset Management), and SOC 2 CC6.1 (Logical and physical access controls). Explicitly includes non-production environments and shadow IT to close governance gaps."
  },

  {
    id: "cl-gen-scope-003",
    name: "Data Processing Operations Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "ISO 27701", "CCPA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall govern all data processing operations conducted by {{COMPANY_NAME}}, including but not limited to the collection, recording, organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination, alignment, combination, restriction, erasure, and destruction of personal and non-personal data. The scope shall extend to both automated and manual processing activities where data is stored or intended to be stored in a filing system. All processing activities shall be recorded in the organization's Register of Processing Activities (ROPA) and subjected to periodic review.",
    rationale: "Fulfills GDPR Article 4(2) definition of processing, Article 30 (Records of processing activities), ISO 27701 Clause 7.2.8 (Records related to processing PII), and DPDPA Section 2(x) definition of processing."
  },

  {
    id: "cl-gen-scope-004",
    name: "Cloud and Hybrid Environment Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["ISO 27017", "ISO 27018", "CSA CCM", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all cloud computing environments utilized by {{COMPANY_NAME}}, including Infrastructure-as-a-Service (IaaS), Platform-as-a-Service (PaaS), Software-as-a-Service (SaaS), and hybrid deployments spanning on-premises and cloud infrastructure hosted by {{CLOUD_PROVIDER}} or any other cloud service provider. The shared responsibility model between {{COMPANY_NAME}} and its cloud service providers shall be documented, and governance controls shall be applied to all layers within the organization's responsibility boundary. All cloud workloads shall be subject to the same governance standards as on-premises systems, with additional controls applied for multi-tenancy, data residency, and cross-border data transfer risks.",
    rationale: "Fulfills ISO 27017 (Cloud security), ISO 27018 (Protection of PII in public clouds), and CSA Cloud Controls Matrix DSI-01 (Data Security and Information Lifecycle Management). Addresses the shared responsibility model governance gap."
  },

  {
    id: "cl-gen-scope-005",
    name: "Geographic and Jurisdictional Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "CCPA", "ISO 27701"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply across all geographic territories and legal jurisdictions in which {{COMPANY_NAME}} operates, processes data, or provides services to data subjects or customers. Where {{COMPANY_NAME}} processes personal data of individuals located in {{CUSTOMER_GEOGRAPHY}}, the organization shall comply with the data protection laws applicable in those jurisdictions, including any requirements for data localization, cross-border transfer mechanisms, and local regulatory reporting. In the event of conflict between jurisdictional requirements, the most restrictive obligation shall prevail unless legal counsel determines otherwise.",
    rationale: "Fulfills GDPR Article 3 (Territorial scope), DPDPA Section 3 (Application of the Act), and CCPA Section 1798.140 (Definitions and territorial applicability). The 'most restrictive prevails' principle ensures baseline compliance across jurisdictions."
  },

  {
    id: "cl-gen-scope-006",
    name: "SaaS Platform Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["SOC 2", "ISO 27001", "CSA CCM"],
    jurisdiction: ["Global"],
    industry: ["SaaS"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall extend to all SaaS platform components operated by {{COMPANY_NAME}}, including the application layer, API interfaces, customer-facing portals, administrative consoles, data pipelines, and integration endpoints. The scope shall encompass tenant isolation controls, multi-tenancy governance, customer data segregation mechanisms, and platform availability commitments as documented in service level agreements (SLAs). All platform changes, including feature releases, infrastructure modifications, and security patches, shall be governed by the change management and release management processes defined within this policy framework.",
    rationale: "Fulfills SOC 2 CC8.1 (Change management), ISO 27001 Annex A.14.2 (Security in development and support processes), and CSA CCM IVS-09 (Network Security). Addresses SaaS-specific governance requirements for multi-tenant environments."
  },

  {
    id: "cl-gen-scope-007",
    name: "FinTech Operations Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["PCI DSS", "RBI Guidelines", "DORA", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["FinTech"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all financial technology operations conducted by {{COMPANY_NAME}}, including payment processing systems, digital lending platforms, transaction monitoring infrastructure, fraud detection mechanisms, and customer onboarding workflows involving Know Your Customer (KYC) and Anti-Money Laundering (AML) processes. The scope shall include all systems that store, process, or transmit cardholder data, financial transaction records, or regulated financial information. All FinTech operations shall comply with the prudential and technology risk management guidelines issued by the relevant financial regulators in {{COUNTRY}}.",
    rationale: "Fulfills PCI DSS Requirement 12.1 (Information security policy), RBI Master Direction on IT Governance, DORA Article 5 (ICT risk management framework), and ISO 27001 Annex A.18.1. Addresses the specific regulatory overlay for financial technology operations."
  },

  {
    id: "cl-gen-scope-008",
    name: "Healthcare Operations Scope",
    group: "Scope",
    section: 2,
    domain: "general",
    frameworks: ["HIPAA", "ISO 27799", "GDPR", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Healthcare"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all healthcare-related operations conducted by {{COMPANY_NAME}}, including the processing of Protected Health Information (PHI), electronic health records (EHR), clinical trial data, medical device telemetry, and patient-facing digital health platforms. The scope shall encompass all systems, processes, and personnel involved in the creation, receipt, maintenance, or transmission of individually identifiable health information. All healthcare data processing shall comply with the applicable health information privacy and security regulations in {{COUNTRY}}, including mandatory breach notification requirements and minimum necessary access standards.",
    rationale: "Fulfills HIPAA Privacy Rule 45 CFR 164.502 (Uses and disclosures), HIPAA Security Rule 45 CFR 164.306 (Security standards), ISO 27799 (Health informatics — Information security management in health), and GDPR Article 9 (Processing of special categories of data)."
  },

  // ============================================================
  // SECTION 3 — APPLICABILITY (8 clauses)
  // ============================================================

  {
    id: "cl-gen-applicability-001",
    name: "All Employees Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all employees of {{COMPANY_NAME}}, including full-time, part-time, and probationary personnel across all departments, functions, and hierarchical levels. Every employee shall be required to acknowledge receipt, understanding, and acceptance of this policy upon onboarding and annually thereafter. Failure by any employee to comply with the provisions of this policy shall constitute a violation of the terms of employment and shall be subject to the disciplinary procedures outlined in Section 8 of this document.",
    rationale: "Fulfills ISO 27001 Annex A.7.1.2 (Terms and conditions of employment), GDPR Article 29 (Processing under the authority of the controller or processor), and SOC 2 CC1.4 (Commitment to competence). Annual re-acknowledgment ensures ongoing awareness."
  },

  {
    id: "cl-gen-applicability-002",
    name: "Contractor and Temporary Staff Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "GDPR"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all contractors, consultants, temporary staff, interns, and secondees engaged by {{COMPANY_NAME}}, regardless of the duration or nature of their engagement. All such personnel shall be bound by the governance obligations defined herein through contractual clauses incorporated into their engagement agreements prior to the commencement of any work. Access to organizational systems, data, or facilities shall not be provisioned until the applicable contractual governance obligations have been executed and acknowledged by the individual.",
    rationale: "Fulfills ISO 27001 Annex A.7.1.1 (Screening) and A.7.1.2 (Terms and conditions of employment), NIST CSF PR.IP-11 (Cybersecurity in human resources practices), and GDPR Article 28(3)(b) (Processor obligations regarding confidentiality). Ensures governance coverage for the extended workforce."
  },

  {
    id: "cl-gen-applicability-003",
    name: "Third-Party and Vendor Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27036", "GDPR", "DORA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all third-party service providers, vendors, suppliers, and business partners that access, process, store, or transmit data owned or controlled by {{COMPANY_NAME}}, or that provide services critical to the organization's operations. Third parties shall be contractually obligated to implement governance controls equivalent to or exceeding those defined in this policy, as verified through due diligence assessments and ongoing monitoring. {{COMPANY_NAME}} shall maintain a centralized third-party register and shall classify all vendors by risk tier to determine the frequency and depth of governance assurance activities.",
    rationale: "Fulfills ISO 27001 Annex A.15.1 (Information security in supplier relationships), ISO 27036 (Supplier relationships), GDPR Article 28 (Processor obligations), and DORA Article 28 (ICT third-party risk). Risk-tiered vendor classification enables proportionate governance oversight."
  },

  {
    id: "cl-gen-applicability-004",
    name: "Board and Executive Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["COBIT", "ISO 27001", "GDPR", "Companies Act"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all members of the Board of Directors, executive leadership, and senior management of {{COMPANY_NAME}}. The Board shall bear ultimate accountability for the governance framework established under this policy and shall ensure that adequate resources, budget, and organizational authority are allocated to its implementation. Executive leadership shall be responsible for cascading governance objectives throughout the organization and for reporting the status of governance maturity, risk posture, and compliance metrics to the Board no less than quarterly.",
    rationale: "Fulfills COBIT 2019 EDM01 (Ensured Governance Framework Setting and Maintenance), ISO 27001 Clause 5.1 (Leadership and commitment), GDPR Article 5(2) (Accountability), and Companies Act 2013 Section 134(3)(e) (Directors' responsibility statement). Establishes tone from the top."
  },

  {
    id: "cl-gen-applicability-005",
    name: "Processor Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "ISO 27701"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "processor",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Where {{COMPANY_NAME}} acts as a data processor on behalf of a data controller, this policy shall govern the processing of personal data strictly in accordance with the documented instructions of the controller. {{COMPANY_NAME}} shall not process personal data for any purpose other than those specified in the data processing agreement (DPA) executed with the controller. The organization shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk of processing and shall assist the controller in fulfilling its obligations to data subjects and supervisory authorities.",
    rationale: "Fulfills GDPR Article 28(3) (Processor obligations), DPDPA Section 8 (Obligations of Data Processor), and ISO 27701 Clause 8.2 (Conditions for collection and processing). Establishes the processor-specific governance boundary."
  },

  {
    id: "cl-gen-applicability-006",
    name: "Sub-Processor Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["GDPR", "ISO 27701", "DPDPA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "processor",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Where {{COMPANY_NAME}} engages sub-processors to perform specific processing activities on behalf of a data controller, this policy shall require prior written authorization from the controller before any sub-processor engagement. {{COMPANY_NAME}} shall impose the same data protection obligations on sub-processors as those stipulated in the data processing agreement with the controller, through a binding contract or other legal instrument. {{COMPANY_NAME}} shall remain fully liable to the controller for the performance of the sub-processor's obligations and shall maintain an up-to-date register of all authorized sub-processors, which shall be made available to controllers upon request.",
    rationale: "Fulfills GDPR Article 28(2) and 28(4) (Sub-processor requirements), ISO 27701 Clause 8.5 (PII sharing, transfer, and disclosure), and DPDPA Section 8(2) (Obligations regarding sub-processing). Ensures cascading contractual governance through the processing chain."
  },

  {
    id: "cl-gen-applicability-007",
    name: "Customer-Facing Operations Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["GDPR", "CCPA", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all customer-facing operations, platforms, portals, applications, and communication channels operated by {{COMPANY_NAME}}. All personnel, systems, and processes involved in direct interaction with customers, end-users, or data subjects shall adhere to the governance controls defined herein, including data collection practices, consent management, transparency obligations, and incident communication protocols. Customer-facing operations shall be designed and operated in accordance with privacy-by-design and security-by-default principles from inception through decommissioning.",
    rationale: "Fulfills GDPR Article 25 (Data protection by design and by default), CCPA Section 1798.100 (Consumer rights), ISO 27001 Annex A.14.1 (Security requirements of information systems), and SOC 2 CC2.3 (Communication with external parties). Embeds governance into the customer experience layer."
  },

  {
    id: "cl-gen-applicability-008",
    name: "Remote Workforce Applicability",
    group: "Applicability",
    section: 3,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall apply to all personnel of {{COMPANY_NAME}} who perform work remotely, including those operating from home offices, co-working spaces, client sites, or while travelling. Remote workers shall be subject to the same governance obligations as on-premises personnel, with additional controls for endpoint security, secure connectivity, data handling in uncontrolled environments, and physical security of portable devices. {{COMPANY_NAME}} shall provide remote workers with approved tools, secure access mechanisms, and mandatory training on the governance requirements applicable to remote work arrangements.",
    rationale: "Fulfills ISO 27001 Annex A.6.2.2 (Teleworking), NIST CSF PR.AC-3 (Remote access management), and SOC 2 CC6.1 (Logical and physical access controls). Addresses the expanded attack surface and governance challenges introduced by distributed workforce models."
  },

  // ============================================================
  // SECTION 7 — EXCEPTIONS (7 clauses)
  // ============================================================

  {
    id: "cl-gen-exceptions-001",
    name: "Exception Request Process",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Any request for an exception to the provisions of this policy shall be submitted through a formal exception request process managed by the governance, risk, and compliance (GRC) function of {{COMPANY_NAME}}. The exception request shall include a detailed justification, a risk assessment of the proposed deviation, proposed compensating controls, the anticipated duration of the exception, and the name of the accountable executive sponsor. No exception shall be effective until it has received written approval from the Chief Information Security Officer (CISO) and, for exceptions affecting regulatory obligations, from the {{DPO_OFFICER}} or General Counsel.",
    rationale: "Fulfills ISO 27001 Clause 6.1.3 (Information security risk treatment), COBIT 2019 APO12 (Managed Risk), and NIST CSF ID.RA (Risk Assessment). A formalized exception process prevents ad-hoc deviations from governance controls."
  },

  {
    id: "cl-gen-exceptions-002",
    name: "Risk Acceptance Criteria",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 31000", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Exceptions to this policy shall only be granted where the residual risk, after the application of compensating controls, falls within the risk acceptance thresholds formally approved by the Board of Directors or the designated risk committee of {{COMPANY_NAME}}. The risk acceptance criteria shall consider the likelihood and impact of the deviation on confidentiality, integrity, availability, privacy, and regulatory compliance. Exceptions that result in residual risk exceeding the organization's defined risk appetite shall require explicit Board-level approval and shall be subject to enhanced monitoring for the duration of the exception period.",
    rationale: "Fulfills ISO 27001 Clause 6.1.3 (Risk treatment — risk acceptance), ISO 31000 Clause 6.5 (Risk treatment), and NIST CSF ID.RM (Risk Management Strategy). Ensures risk acceptance decisions are made at the appropriate governance level."
  },

  {
    id: "cl-gen-exceptions-003",
    name: "Temporary Exemption Protocol",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All exceptions granted under this policy shall be temporary in nature and shall not exceed a maximum duration of ninety (90) calendar days unless formally renewed through the exception request process. Each temporary exemption shall include a documented remediation plan with specific milestones for returning to full compliance. The GRC function shall track all active exceptions in a centralized exception register, and the exception owner shall provide progress updates on the remediation plan no less than bi-weekly throughout the exception period.",
    rationale: "Fulfills ISO 27001 Clause 10.1 (Nonconformity and corrective action), COBIT 2019 MEA02 (Managed System of Internal Control), and SOC 2 CC4.2 (Evaluation and communication of internal control deficiencies). Time-bound exceptions prevent indefinite governance gaps."
  },

  {
    id: "cl-gen-exceptions-004",
    name: "Regulatory Override Exception",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "HIPAA", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "No exception shall be granted that would result in a violation of applicable laws, regulations, or binding regulatory directives in any jurisdiction in which {{COMPANY_NAME}} operates. Where a policy provision exceeds the minimum regulatory requirement, an exception that reduces the control to the regulatory minimum shall require approval from General Counsel and the {{DPO_OFFICER}}. In the event that conflicting regulatory obligations across jurisdictions necessitate a deviation from this policy, the General Counsel shall determine the appropriate course of action, and the decision shall be documented with full legal reasoning and retained for a minimum of five (5) years.",
    rationale: "Fulfills GDPR Article 5(1)(a) (Lawfulness of processing), DPDPA Section 4 (Obligations of Data Fiduciary), HIPAA 45 CFR 164.306 (Security standards — general rules), and ISO 27001 Annex A.18.1.1 (Identification of applicable legislation). Establishes an absolute floor for compliance that exceptions cannot breach."
  },

  {
    id: "cl-gen-exceptions-005",
    name: "Emergency Exception Procedure",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 22301", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "In the event of a declared emergency, active security incident, or business continuity invocation, the CISO or the designated incident commander shall have the authority to grant temporary emergency exceptions to this policy for a period not exceeding seventy-two (72) hours. All emergency exceptions shall be documented within twenty-four (24) hours of being invoked, including the justification, scope of deviation, compensating controls applied, and the expected timeline for return to normal operations. Emergency exceptions exceeding seventy-two (72) hours shall be escalated to the standard exception request process for formal review and approval.",
    rationale: "Fulfills ISO 27001 Annex A.16.1.1 (Management of information security incidents), ISO 22301 Clause 8.4 (Business continuity procedures), and NIST CSF RS.RP (Response Planning). Provides a governed fast-track mechanism for crisis situations while maintaining accountability."
  },

  {
    id: "cl-gen-exceptions-006",
    name: "Exception Documentation Requirements",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Every approved exception shall be documented in a standardized exception record containing, at minimum: the exception identifier, the policy provision(s) to which the exception applies, the business justification, the risk assessment results, approved compensating controls, the exception owner, the approving authority, the effective date, the expiry date, and the remediation plan. All exception records shall be retained in the centralized GRC repository for a minimum of three (3) years following the closure or expiry of the exception. The GRC function shall produce a quarterly exception summary report for review by the risk committee.",
    rationale: "Fulfills ISO 27001 Clause 7.5 (Documented information), SOC 2 CC4.1 (Monitoring of internal controls), and COBIT 2019 MEA01 (Managed Performance and Conformance Monitoring). Standardized documentation ensures auditability and institutional memory of governance deviations."
  },

  {
    id: "cl-gen-exceptions-007",
    name: "Exception Review and Expiry",
    group: "Exceptions",
    section: 7,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All active exceptions shall be reviewed by the GRC function no less than monthly to assess the continued validity of the business justification, the effectiveness of compensating controls, and progress against the remediation plan. Exceptions that have reached their expiry date shall be automatically closed, and the exception owner shall certify that full compliance has been restored or shall submit a renewal request through the standard exception process. The GRC function shall escalate to the risk committee any exceptions that have been renewed more than twice or that have remained active for more than one hundred eighty (180) calendar days.",
    rationale: "Fulfills ISO 27001 Clause 9.1 (Monitoring, measurement, analysis, and evaluation), NIST CSF DE.CM (Security Continuous Monitoring), and COBIT 2019 MEA02.03 (Perform control self-assessments). Periodic review prevents exception fatigue and ensures governance gaps are actively managed toward closure."
  },

  // ============================================================
  // SECTION 8 — NON-COMPLIANCE & ENFORCEMENT (7 clauses)
  // ============================================================

  {
    id: "cl-gen-enforcement-001",
    name: "General Enforcement Framework",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish and maintain a formal enforcement framework to address violations of this policy and its associated standards, procedures, and guidelines. The enforcement framework shall be applied consistently across all personnel, regardless of seniority, tenure, or organizational function, and shall be proportionate to the severity, intent, and impact of the violation. The Human Resources department, in coordination with the GRC function and Legal, shall administer enforcement actions in accordance with applicable employment laws and the organization's disciplinary procedures.",
    rationale: "Fulfills ISO 27001 Annex A.7.2.3 (Disciplinary process), COBIT 2019 APO01.08 (Maintain compliance with policies and procedures), and SOC 2 CC1.5 (Accountability for internal control). Consistent enforcement regardless of seniority establishes governance credibility."
  },

  {
    id: "cl-gen-enforcement-002",
    name: "Disciplinary Escalation Matrix",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain a disciplinary escalation matrix that defines graduated enforcement responses based on the classification of the violation. First-time minor violations shall result in a formal written warning and mandatory remedial training. Repeated minor violations or first-time major violations shall result in performance improvement plans, suspension of system access privileges, and formal disciplinary proceedings. Gross violations, including deliberate data breaches, fraud, or willful non-compliance with regulatory obligations, shall result in immediate suspension of access, formal disciplinary action up to and including termination of employment, and referral to law enforcement where warranted.",
    rationale: "Fulfills ISO 27001 Annex A.7.2.3 (Disciplinary process), SOC 2 CC1.5 (Accountability), and NIST CSF PR.IP-11 (Cybersecurity in human resources practices). A graduated matrix ensures proportionality and defensibility of enforcement actions."
  },

  {
    id: "cl-gen-enforcement-003",
    name: "Regulatory Reporting Obligations for Non-Compliance",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "HIPAA", "DORA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "Where non-compliance with this policy results in a personal data breach, security incident, or regulatory violation, {{COMPANY_NAME}} shall fulfill all mandatory reporting obligations to supervisory authorities, affected data subjects, and other stakeholders within the timelines prescribed by applicable law. Breach notifications to supervisory authorities shall be submitted within seventy-two (72) hours of the organization becoming aware of the breach, or within such shorter period as required by specific regulations. The {{DPO_OFFICER}} shall maintain a breach register and shall coordinate with Legal, Communications, and the affected business units to ensure that all notifications are accurate, complete, and submitted within the required timeframes.",
    rationale: "Fulfills GDPR Article 33 (Notification to supervisory authority) and Article 34 (Communication to data subject), DPDPA Section 8(6) (Breach notification), HIPAA 45 CFR 164.408 (Notification to the Secretary), and DORA Article 19 (Reporting of major ICT-related incidents)."
  },

  {
    id: "cl-gen-enforcement-004",
    name: "Third-Party Non-Compliance Remediation",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["ISO 27001", "GDPR", "ISO 27036"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Where a third-party service provider, vendor, or sub-processor is found to be in non-compliance with the governance obligations imposed by {{COMPANY_NAME}}, the organization shall initiate a formal remediation process requiring the third party to submit a corrective action plan within fifteen (15) business days of notification. {{COMPANY_NAME}} shall reserve the right to conduct ad-hoc audits, suspend data sharing, or terminate the contractual relationship if the third party fails to remediate the non-compliance within the agreed timeline. All third-party contracts shall include provisions granting {{COMPANY_NAME}} these enforcement rights, including the right to audit and the right to terminate for material governance breaches.",
    rationale: "Fulfills ISO 27001 Annex A.15.2.1 (Monitoring and review of supplier services), GDPR Article 28(3)(h) (Processor audit rights), and ISO 27036-2 (Supplier relationship management). Contractual enforcement provisions are essential for third-party governance effectiveness."
  },

  {
    id: "cl-gen-enforcement-005",
    name: "Executive Accountability for Violations",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["COBIT", "GDPR", "Companies Act", "SOX"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "Executive leaders and senior management of {{COMPANY_NAME}} shall bear personal accountability for governance failures within their areas of responsibility. Where a governance violation is attributable to systemic failures in oversight, inadequate resource allocation, or negligent supervision, the responsible executive shall be subject to performance consequences, including impact on variable compensation, bonus eligibility, and advancement consideration. The Board of Directors shall receive a report on all significant governance violations involving executive-level personnel and shall determine the appropriate accountability measures in consultation with the Compensation and Governance committees.",
    rationale: "Fulfills COBIT 2019 EDM01.03 (Monitor the governance system), GDPR Article 83 (General conditions for imposing administrative fines — accountability of management), Companies Act 2013 Section 166 (Duties of directors), and SOX Section 302 (Corporate responsibility for financial reports). Executive accountability is a cornerstone of effective governance."
  },

  {
    id: "cl-gen-enforcement-006",
    name: "Non-Compliance Incident Documentation",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All instances of non-compliance with this policy shall be formally documented in the organization's incident management system, including the nature of the violation, the date and time of discovery, the personnel involved, the affected systems or data, the root cause analysis, the corrective actions taken, and the preventive measures implemented to avoid recurrence. Non-compliance records shall be retained for a minimum of five (5) years and shall be made available to internal and external auditors upon request. The GRC function shall analyze non-compliance trends quarterly to identify systemic governance weaknesses requiring structural remediation.",
    rationale: "Fulfills ISO 27001 Clause 10.1 (Nonconformity and corrective action), SOC 2 CC4.2 (Evaluation and communication of internal control deficiencies), and COBIT 2019 MEA02.04 (Identify and report control deficiencies). Trend analysis transforms individual incidents into organizational learning."
  },

  {
    id: "cl-gen-enforcement-007",
    name: "Contractual Enforcement Provisions",
    group: "Non-compliance & Enforcement",
    section: 8,
    domain: "general",
    frameworks: ["GDPR", "ISO 27001", "DORA", "ISO 27036"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All contracts, service agreements, and statements of work executed by {{COMPANY_NAME}} shall incorporate governance and compliance obligations consistent with this policy. Contracts shall include, at minimum, provisions for data protection, confidentiality, security requirements, audit rights, breach notification obligations, liability allocation for governance failures, and termination rights for material non-compliance. The Legal and Procurement functions shall maintain standardized contractual clauses aligned with this policy, and any deviation from the standard clauses shall require approval from the CISO and General Counsel.",
    rationale: "Fulfills GDPR Article 28(3) (Processor contract requirements), ISO 27001 Annex A.15.1.2 (Addressing security within supplier agreements), DORA Article 30 (Key contractual provisions), and ISO 27036-2 (Supplier agreement). Standardized clauses ensure consistent governance enforcement across the supply chain."
  },

  // ============================================================
  // SECTION 9 — MONITORING & COMPLIANCE (7 clauses)
  // ============================================================

  {
    id: "cl-gen-monitoring-001",
    name: "Compliance Monitoring Framework",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish and maintain a compliance monitoring framework that provides continuous visibility into the organization's adherence to this policy, applicable regulations, and contractual obligations. The framework shall incorporate automated monitoring tools, manual assessment procedures, and risk-based sampling methodologies to detect, measure, and report on compliance status. The GRC function shall produce monthly compliance status reports for operational management and quarterly compliance dashboards for the risk committee and Board of Directors.",
    rationale: "Fulfills ISO 27001 Clause 9.1 (Monitoring, measurement, analysis, and evaluation), COBIT 2019 MEA01 (Managed Performance and Conformance Monitoring), NIST CSF DE.CM (Security Continuous Monitoring), and SOC 2 CC4.1 (Monitoring activities). Layered monitoring ensures comprehensive governance oversight."
  },

  {
    id: "cl-gen-monitoring-002",
    name: "Internal Audit Procedures",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 19011", "SOC 2", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct internal audits of its governance framework at planned intervals, not less than annually, to verify that the controls defined in this policy are effectively implemented, operating as intended, and achieving their stated objectives. Internal audits shall be conducted by personnel who are independent of the functions being audited or by qualified external audit firms. The internal audit program shall be risk-based, with audit frequency and depth determined by the criticality and risk profile of the governance domain under review. All audit findings shall be formally documented, assigned to remediation owners, and tracked to closure within agreed timelines.",
    rationale: "Fulfills ISO 27001 Clause 9.2 (Internal audit), ISO 19011 (Guidelines for auditing management systems), SOC 2 CC4.1 (Monitoring activities), and COBIT 2019 MEA02 (Managed System of Internal Control). Auditor independence is essential for objective assurance."
  },

  {
    id: "cl-gen-monitoring-003",
    name: "Key Performance Indicators (KPIs)",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall define, measure, and report on a set of Key Performance Indicators (KPIs) and Key Risk Indicators (KRIs) to assess the effectiveness and maturity of its governance framework. KPIs shall include, at minimum: policy compliance rate across business units, percentage of personnel completing mandatory governance training, mean time to remediate audit findings, exception volume and aging, incident response times, and third-party compliance assessment completion rates. KPI targets shall be approved by the risk committee annually and shall be benchmarked against industry standards and peer organizations where practicable.",
    rationale: "Fulfills ISO 27001 Clause 9.1 (Monitoring, measurement, analysis, and evaluation), COBIT 2019 MEA01.03 (Collect and process performance and conformance data), and NIST CSF ID.RM-1 (Risk management processes). Quantitative metrics enable evidence-based governance decision-making."
  },

  {
    id: "cl-gen-monitoring-004",
    name: "Compliance Dashboard Reporting",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["COBIT", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "The GRC function of {{COMPANY_NAME}} shall maintain a compliance dashboard that provides real-time or near-real-time visibility into the organization's governance posture across all policy domains. The dashboard shall present aggregated compliance metrics, risk heat maps, open audit findings, active exceptions, regulatory change alerts, and incident status summaries. Executive dashboards shall be presented to the risk committee and Board of Directors on a quarterly basis, with ad-hoc reporting provided upon request or in response to material governance events.",
    rationale: "Fulfills COBIT 2019 MEA01.04 (Analyze and report performance), ISO 27001 Clause 9.3 (Management review — inputs), and SOC 2 CC2.1 (Information and communication). Dashboard reporting translates operational compliance data into strategic governance intelligence for the Board."
  },

  {
    id: "cl-gen-monitoring-005",
    name: "Regulatory Change Monitoring",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "GDPR", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement a regulatory change monitoring program to systematically identify, assess, and respond to changes in laws, regulations, industry standards, and regulatory guidance that affect its governance obligations. The Legal and GRC functions shall subscribe to regulatory intelligence services, participate in industry working groups, and maintain direct relationships with relevant supervisory authorities in {{CUSTOMER_GEOGRAPHY}}. All identified regulatory changes shall be assessed for impact within thirty (30) calendar days of publication, and required policy or control amendments shall be implemented within ninety (90) calendar days of the effective date of the regulatory change.",
    rationale: "Fulfills ISO 27001 Annex A.18.1.1 (Identification of applicable legislation and contractual requirements), GDPR Recital 78 (Appropriate technical and organisational measures), and COBIT 2019 MEA03 (Managed Compliance with External Requirements). Proactive regulatory monitoring prevents compliance surprises."
  },

  {
    id: "cl-gen-monitoring-006",
    name: "Compliance Evidence Collection",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish systematic processes for the collection, organization, and retention of compliance evidence to support internal and external audit activities, regulatory examinations, and certification assessments. Evidence shall include, at minimum: policy acknowledgment records, training completion logs, access review artifacts, vulnerability scan reports, penetration test results, incident response records, change management approvals, and third-party assessment reports. All compliance evidence shall be stored in a centralized, access-controlled repository with appropriate version control, and shall be retained in accordance with the organization's records retention schedule and applicable regulatory requirements.",
    rationale: "Fulfills ISO 27001 Clause 7.5 (Documented information), SOC 2 CC4.1 (Monitoring activities — evidence), and NIST CSF PR.IP-12 (Vulnerability management plan). Centralized evidence management reduces audit preparation burden and demonstrates continuous compliance."
  },

  {
    id: "cl-gen-monitoring-007",
    name: "Self-Assessment Program",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement a governance self-assessment program requiring all business unit leaders and process owners to conduct periodic self-assessments of their compliance with this policy. Self-assessments shall be conducted semi-annually using standardized questionnaires and checklists aligned with the control objectives defined in this policy. The GRC function shall validate a risk-based sample of self-assessment responses through independent testing and shall report discrepancies to the risk committee. Self-assessment results shall be incorporated into the overall compliance monitoring dashboard and shall inform the risk-based internal audit plan.",
    rationale: "Fulfills ISO 27001 Clause 9.1 (Monitoring, measurement, analysis, and evaluation), COBIT 2019 MEA02.03 (Perform control self-assessments), and NIST CSF ID.GV-4 (Governance and risk management processes address cybersecurity risks). Self-assessments distribute governance responsibility across the organization and increase control coverage."
  },

  // ============================================================
  // SECTION 10 — REVIEW & MAINTENANCE (7 clauses)
  // ============================================================

  {
    id: "cl-gen-review-001",
    name: "Annual Review Protocol",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27701", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall be subject to a comprehensive review no less than once every twelve (12) months, initiated by the GRC function and sponsored by the CISO or Chief Risk Officer. The annual review shall assess the continued adequacy, suitability, and effectiveness of the policy in light of changes to the organization's risk profile, business strategy, technology landscape, regulatory environment, and lessons learned from incidents and audits. The review outcome, including all proposed amendments, shall be presented to the risk committee for endorsement and to the Board of Directors or its designated committee for final approval.",
    rationale: "Fulfills ISO 27001 Clause 9.3 (Management review), ISO 27701 Clause 9.3 (Management review), and COBIT 2019 APO01.05 (Optimize the placement of the IT function). Annual review ensures the policy remains current and fit for purpose."
  },

  {
    id: "cl-gen-review-002",
    name: "Semi-Annual Review Protocol",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["PCI DSS", "RBI Guidelines", "DORA"],
    jurisdiction: ["Global"],
    industry: ["FinTech", "Healthcare"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "For organizations operating in regulated industries or processing high-risk data categories, this policy shall be reviewed on a semi-annual basis, with reviews scheduled in the first and third quarters of each fiscal year. The semi-annual review shall evaluate compliance with industry-specific regulatory requirements, assess the impact of any regulatory changes enacted since the previous review, and validate that controls remain proportionate to the current threat landscape. Semi-annual review reports shall be submitted to the relevant regulatory oversight committee and retained as evidence of ongoing governance diligence.",
    rationale: "Fulfills PCI DSS Requirement 12.1.1 (Review security policy at least annually — elevated to semi-annual for high-risk environments), RBI Master Direction on IT Governance (periodic review of IT policy), and DORA Article 6(5) (ICT risk management framework review). Accelerated review cycles are appropriate for high-risk or heavily regulated environments."
  },

  {
    id: "cl-gen-review-003",
    name: "Risk-Based Review Triggers",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "ISO 31000"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "In addition to scheduled periodic reviews, this policy shall be subject to an ad-hoc review upon the occurrence of any of the following trigger events: a significant security incident or data breach; a material change to the regulatory or legal environment; a major organizational restructuring, merger, or acquisition; the adoption of new technologies or business models that materially alter the risk profile; findings from internal or external audits indicating systemic control failures; or direction from the Board of Directors or regulatory authorities. Ad-hoc reviews shall be initiated within ten (10) business days of the trigger event and shall follow the same review and approval process as scheduled reviews.",
    rationale: "Fulfills ISO 27001 Clause 10.2 (Continual improvement), NIST CSF ID.RM-3 (Risk tolerance determination), and ISO 31000 Clause 6.7 (Recording and reporting). Event-driven reviews ensure the policy remains responsive to material changes in the operating environment."
  },

  {
    id: "cl-gen-review-004",
    name: "Amendment and Change Management",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All amendments to this policy shall be managed through a formal change management process that includes impact assessment, stakeholder consultation, legal review, and documented approval by the designated approving authority. Amendments shall be classified as minor (editorial, formatting, or clarification changes not affecting governance obligations) or major (substantive changes to policy requirements, scope, or applicability). Minor amendments shall require approval from the CISO; major amendments shall require endorsement by the risk committee and approval by the Board of Directors. All amendments shall be communicated to affected personnel within fifteen (15) business days of approval.",
    rationale: "Fulfills ISO 27001 Clause 7.5.3 (Control of documented information), COBIT 2019 BAI06 (Managed IT Changes), and SOC 2 CC8.1 (Change management). Distinguishing minor from major amendments enables appropriate governance oversight without creating unnecessary bureaucracy for editorial changes."
  },

  {
    id: "cl-gen-review-005",
    name: "Stakeholder Consultation Process",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "GDPR", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All policy reviews and major amendments shall include a structured stakeholder consultation process to ensure that the perspectives of key internal and external stakeholders are considered. Internal stakeholders shall include, at minimum: business unit leaders, the IT function, the Legal function, Human Resources, the Internal Audit function, and the {{DPO_OFFICER}}. External stakeholders, including key customers, regulatory bodies, and certification auditors, shall be consulted where their interests are materially affected by proposed changes. Stakeholder feedback shall be documented, evaluated, and incorporated into the policy revision where appropriate, with documented rationale for any feedback that is not adopted.",
    rationale: "Fulfills ISO 27001 Clause 4.2 (Understanding the needs and expectations of interested parties), GDPR Article 35(9) (Consultation of data subjects where appropriate in DPIA), and COBIT 2019 EDM05 (Ensured Stakeholder Engagement). Stakeholder consultation enhances policy quality and organizational buy-in."
  },

  {
    id: "cl-gen-review-006",
    name: "Review Documentation Requirements",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Each policy review cycle shall produce a formal review record documenting: the review date, the review participants, the scope of the review, the assessment methodology, all findings and observations, proposed amendments with justifications, stakeholder consultation outcomes, the approval decision, and the effective date of the revised policy. Review records shall be retained for a minimum of five (5) years and shall form part of the organization's governance audit trail. The GRC function shall maintain a review schedule and shall issue reminders to review participants no less than thirty (30) calendar days prior to the scheduled review date.",
    rationale: "Fulfills ISO 27001 Clause 7.5.1 (Documented information — general), SOC 2 CC4.1 (Monitoring activities — documentation), and COBIT 2019 MEA01.05 (Ensure implementation of corrective actions). Comprehensive review documentation demonstrates governance due diligence to regulators and auditors."
  },

  {
    id: "cl-gen-review-007",
    name: "Continuous Improvement Framework",
    group: "Review & Maintenance",
    section: 10,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 9001", "COBIT", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall adopt a continuous improvement approach to governance, leveraging the Plan-Do-Check-Act (PDCA) cycle to systematically enhance the effectiveness, efficiency, and maturity of its governance framework. Improvement initiatives shall be informed by audit findings, incident lessons learned, compliance monitoring data, stakeholder feedback, industry benchmarking, and emerging best practices. The GRC function shall maintain a governance improvement backlog, prioritized by risk impact and strategic alignment, and shall report progress on improvement initiatives to the risk committee on a quarterly basis.",
    rationale: "Fulfills ISO 27001 Clause 10.2 (Continual improvement), ISO 9001 Clause 10.3 (Continual improvement), COBIT 2019 APO02 (Managed Strategy), and NIST CSF ID.GV (Governance). The PDCA cycle is the internationally recognized mechanism for management system improvement."
  },

  // ============================================================
  // SECTION 11 — RELATED DOCUMENTS (4 clauses)
  // ============================================================

  {
    id: "cl-gen-related-001",
    name: "Privacy Policy Cross-References",
    group: "Related Documents",
    section: 11,
    domain: "general",
    frameworks: ["GDPR", "DPDPA", "ISO 27701"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall be read in conjunction with the following privacy-related documents maintained by {{COMPANY_NAME}}: the Data Protection and Privacy Policy, the Data Subject Rights Management Procedure, the Data Processing Agreement (DPA) Template, the Privacy Impact Assessment (PIA) Procedure, the Cross-Border Data Transfer Policy, the Consent Management Policy, the Data Retention and Disposal Policy, and the Register of Processing Activities (ROPA). In the event of conflict between this policy and any of the referenced privacy documents, the provision that affords the greatest level of protection to data subjects shall prevail.",
    rationale: "Fulfills ISO 27701 Clause 5.2.2 (Information security policy — privacy extension), GDPR Article 24 (Responsibility of the controller — documented measures), and DPDPA Section 4 (Obligations of Data Fiduciary). Cross-referencing ensures a cohesive privacy governance ecosystem and prevents policy fragmentation."
  },

  {
    id: "cl-gen-related-002",
    name: "Information Security Cross-References",
    group: "Related Documents",
    section: 11,
    domain: "general",
    frameworks: ["ISO 27001", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall be read in conjunction with the following information security documents maintained by {{COMPANY_NAME}}: the Information Security Policy, the Access Control Policy, the Cryptographic Controls Policy, the Vulnerability Management Procedure, the Penetration Testing Policy, the Security Incident Response Plan, the Acceptable Use Policy, the Asset Classification and Handling Standard, and the Secure Development Lifecycle (SDLC) Policy. All referenced documents shall be reviewed for consistency with this governance framework during each policy review cycle, and any inconsistencies shall be resolved by the CISO in coordination with the GRC function.",
    rationale: "Fulfills ISO 27001 Clause 7.5.3 (Control of documented information), NIST CSF PR.IP-1 (Baseline configuration), and SOC 2 CC2.1 (COSO principle — information and communication). A well-linked policy hierarchy prevents contradictions and facilitates holistic governance."
  },

  {
    id: "cl-gen-related-003",
    name: "Business Resilience Cross-References",
    group: "Related Documents",
    section: 11,
    domain: "general",
    frameworks: ["ISO 22301", "NIST CSF", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall be read in conjunction with the following business resilience documents maintained by {{COMPANY_NAME}}: the Business Continuity Policy, the Business Impact Analysis (BIA) Methodology, the Disaster Recovery Plan, the Crisis Management Plan, the IT Service Continuity Plan, the Pandemic Response Plan, the Emergency Communication Protocol, and the Business Continuity Testing and Exercise Schedule. All resilience documents shall be aligned with the governance objectives and risk appetite defined in this policy, and shall be tested through integrated exercises no less than annually.",
    rationale: "Fulfills ISO 22301 Clause 7.5 (Documented information), NIST CSF PR.IP-9 (Response plans and recovery plans), and COBIT 2019 DSS04 (Managed Continuity). Integrated cross-referencing ensures that resilience planning is embedded within the broader governance framework."
  },

  {
    id: "cl-gen-related-004",
    name: "Vendor and Third-Party Cross-References",
    group: "Related Documents",
    section: 11,
    domain: "general",
    frameworks: ["ISO 27001", "ISO 27036", "GDPR", "DORA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "This policy shall be read in conjunction with the following vendor and third-party management documents maintained by {{COMPANY_NAME}}: the Third-Party Risk Management Policy, the Vendor Due Diligence Procedure, the Vendor Security Assessment Questionnaire, the Third-Party Onboarding and Offboarding Procedure, the Sub-Processor Management Policy, the Standard Data Processing Agreement (DPA), the Vendor Performance Monitoring Framework, and the Third-Party Incident Response Coordination Protocol. All third-party governance documents shall incorporate the risk classification methodology and enforcement provisions defined in this governance framework.",
    rationale: "Fulfills ISO 27001 Annex A.15 (Supplier relationships), ISO 27036-1 (Overview and concepts for information security for supplier relationships), GDPR Article 28 (Processor), and DORA Article 28 (General principles for ICT third-party risk management). A complete third-party document hierarchy ensures end-to-end supply chain governance."
  },

  // ============================================================
  // SECTION 12 — VERSION CONTROL (4 clauses)
  // ============================================================

  {
    id: "cl-gen-version-001",
    name: "Version Control Metadata Template",
    group: "Version Control",
    section: 12,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Every policy document issued under this governance framework shall include a version control metadata block containing the following mandatory fields: document title, document identifier, version number (using semantic versioning: MAJOR.MINOR.PATCH), classification level, document owner, document author, review date, next review date, approval authority, approval date, and distribution list. The version control metadata shall appear on the first page of the document and shall be updated with each revision. The document owner shall ensure that only the current approved version is accessible to personnel, and that superseded versions are clearly marked as obsolete and archived.",
    rationale: "Fulfills ISO 27001 Clause 7.5.2 (Creating and updating documented information), COBIT 2019 BAI10 (Managed Configuration), and SOC 2 CC2.1 (Information and communication). Structured metadata ensures document traceability and prevents reliance on outdated governance documents."
  },

  {
    id: "cl-gen-version-002",
    name: "Approval Workflow Documentation",
    group: "Version Control",
    section: 12,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "All policy documents shall follow a documented approval workflow prior to publication, comprising the following stages: drafting by the document author, peer review by subject matter experts, legal review by the General Counsel or designated legal advisor, compliance review by the GRC function, endorsement by the risk committee or designated governance body, and final approval by the designated approving authority. Each stage of the approval workflow shall be recorded with the reviewer's identity, review date, comments provided, and approval or rejection decision. No policy document shall be published or disseminated until it has completed all stages of the approval workflow and received final written authorization from the approving authority.",
    rationale: "Fulfills ISO 27001 Clause 7.5.2 (Creating and updating — review and approval), COBIT 2019 APO01.06 (Define information and system ownership), and SOC 2 CC8.1 (Authorization of changes). A multi-stage approval workflow ensures quality, accuracy, and institutional legitimacy of governance documents."
  },

  {
    id: "cl-gen-version-003",
    name: "Change Log Requirements",
    group: "Version Control",
    section: 12,
    domain: "general",
    frameworks: ["ISO 27001", "SOC 2", "COBIT"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Every policy document shall maintain a change log that records the complete revision history of the document from its initial publication to the current version. Each change log entry shall include: the version number, the date of the change, a concise description of the changes made, the classification of the change (minor or major), the name of the individual who made the change, and the name and title of the approving authority. The change log shall be appended to the policy document and shall not be truncated, deleted, or modified for any previously recorded entries. Change logs shall serve as the authoritative record of the policy's evolution and shall be referenced during audits and regulatory examinations.",
    rationale: "Fulfills ISO 27001 Clause 7.5.3 (Control of documented information — changes), SOC 2 CC8.1 (Change management — documentation), and COBIT 2019 BAI06.01 (Evaluate, prioritize, and authorize change requests). An immutable change log provides a complete audit trail of governance document evolution."
  },

  {
    id: "cl-gen-version-004",
    name: "Document Retirement Process",
    group: "Version Control",
    section: 12,
    domain: "general",
    frameworks: ["ISO 27001", "COBIT", "ISO 15489"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "When a policy document is superseded, consolidated, or otherwise rendered obsolete, it shall be formally retired through a documented retirement process. The retirement process shall include: a formal retirement decision approved by the document owner and the GRC function, notification to all personnel on the distribution list that the document has been retired, removal of the document from all active distribution channels and document management systems, and archival of the retired document in a read-only repository with a clear 'RETIRED' classification marking. Retired documents shall be retained in the archive for a minimum of seven (7) years to support historical audit inquiries, regulatory investigations, and litigation hold requirements. The GRC function shall maintain a register of all retired governance documents.",
    rationale: "Fulfills ISO 27001 Clause 7.5.3 (Control of documented information — retention and disposition), COBIT 2019 BAI10.05 (Verify and review integrity of the configuration repository), and ISO 15489-1 (Records management — disposition). Formal retirement prevents the use of outdated governance instruments while preserving the institutional record."
  }

];
