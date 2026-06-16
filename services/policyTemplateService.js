// Navis Policy Template Service
// Curated base templates, industry variants, requirement packs, and clause libraries.

export const POLICY_DOMAINS = {
  infosec: {
    name: "Information Security",
    templates: {
      access_control: {
        title: "Access Control Policy",
        summary: "Defines authorization, user access management, privileged access, and password complexity.",
        baseText: "Access Control Policy. All user accounts must be authorized on a least-privilege basis. Access controls are applied to protect internal systems, databases, and production servers. Privileged accounts require dedicated credentials and approval. Access reviews must occur at regular intervals. Termination of employment requires immediate access revocation.",
        requirements: ["Logical access controls", "Least privilege", "Access review", "Access revocation"]
      },
      password: {
        title: "Password Policy",
        summary: "Mandates complexity, length, MFA, and storage mechanisms for authentication credentials.",
        baseText: "Password Policy. Passwords must be at least 12 characters, including uppercase, lowercase, numbers, and symbols. Multi-Factor Authentication (MFA) is mandatory for all access. Password storage must utilize salted cryptographic hashing (e.g., bcrypt). Sharing passwords is strictly prohibited.",
        requirements: ["Password requirements", "Multi-Factor Authentication (MFA)", "Credential protection"]
      },
      logging: {
        title: "Logging and Monitoring Policy",
        summary: "Establishes audit log capture, secure retention, and alerting rules for system activity.",
        baseText: "Logging and Monitoring Policy. Security and system events must be logged continuously. Log contents must include user IDs, timestamps, event types, and outcomes. Access to audit logs must be restricted to prevent tampering. Alerts must be configured for brute-force attempts and critical infrastructure failures.",
        requirements: ["Logging procedures", "Audit logs security", "Incident detection and alerting"]
      },
      asset_mgmt: {
        title: "Asset Management Policy",
        summary: "Rules for identifying, classifying, tracking, and disposing of corporate physical and digital assets.",
        baseText: "Asset Management Policy. An inventory of all hardware, software, and data assets must be maintained. Asset classification is based on sensitivity (Public, Internal, Confidential, Restricted). Disposal of devices must use secure wiping algorithms to prevent data recovery.",
        requirements: ["Data inventory", "Asset classification", "Secure asset disposal"]
      },
      cryptography: {
        title: "Cryptography Policy",
        summary: "Specifies protocols and key management rules for protecting data at rest and in transit.",
        baseText: "Cryptography Policy. Data in transit must be encrypted using TLS 1.3 or higher. Data at rest must use AES-256 encryption. Cryptographic keys must be rotated annually and stored in a secure key management system. Legacy protocols like SSL and WEP are prohibited.",
        requirements: ["Encryption keys", "Encryption in transit", "Encryption at rest"]
      },
      incident_resp: {
        title: "Incident Response Policy",
        summary: "Framework for detecting, containing, investigating, and reporting security incidents.",
        baseText: "Incident Response Policy. A dedicated Incident Response Team (IRT) is established to handle security alerts. Incident classification ranges from Low (minor anomalies) to Critical (active breach). Incident post-mortems must be documented and shared with leadership within 5 days of containment.",
        requirements: ["Incident detection and alerting", "Incident response plan", "Post-incident review"]
      },
      remote_work: {
        title: "Remote Working Policy",
        summary: "Security guidelines for employees accessing corporate resources from external networks.",
        baseText: "Remote Working Policy. Remote connections must utilize a secure corporate VPN. Workstations must have disk encryption and active antivirus software. Printing corporate documents in remote locations is prohibited unless authorized. Public Wi-Fi usage requires VPN routing.",
        requirements: ["VPN authorization", "Device security configuration", "Physical security rules"]
      },
      acceptable_use: {
        title: "Acceptable Use Policy",
        summary: "Core code of conduct for employee usage of company network, email, and devices.",
        baseText: "Acceptable Use Policy. Company assets are provided for business operations. Users must not use company resources to transmit illegal, harassing, or copyright-violating content. Corporate emails must not be used for personal registrations unless authorized.",
        requirements: ["Resource use rules", "Data protection behavior", "Corporate email usage"]
      }
    }
  },
  privacy: {
    name: "Privacy",
    templates: {
      privacy_charter: {
        title: "Privacy Policy",
        summary: "Governs personal data collection, processing consent, and user privacy disclosures.",
        baseText: "Data Privacy Policy. We process customer identifiers, email addresses, and IP numbers. Personal data collection must follow data minimization principles. Explicit consent must be obtained prior to tracking. Users hold rights to access, update, or erase their information.",
        requirements: ["Notice requirements", "Lawful basis", "Data minimization", "Consent mechanism", "Data subject rights"]
      },
      pims: {
        title: "PIMS Policy",
        summary: "Establishes structured controls for managing Privacy Information Management System (PIMS) parameters.",
        baseText: "Privacy Information Management System (PIMS) Policy. This policy establishes the organizational framework for managing processing risks of personally identifiable information (PII) under ISO 27701 standards. The system covers PII collected from user registrations, web services, and support communications. Controls govern PII collection limitation, consent recording, sub-processor monitoring, cross-border transfers, and data subject requests.",
        requirements: ["Purpose limitation", "Data inventory", "Data subject rights", "Cross-border transfers", "Sub-processor contracts"]
      },
      data_retention: {
        title: "Data Retention Policy",
        summary: "Defines timelines for preserving personal data and schedules for secure deletion.",
        baseText: "Data Retention Policy. Personal data is retained only as long as necessary to fulfill the business purpose. Inactive customer records are archived after 1 year and purged after 7 years. Backups are recycled on a 30-day rotation. Users may request expedited erasure.",
        requirements: ["Data retention limits", "Right to be forgotten", "Secure deletion schedules"]
      },
      dsar: {
        title: "DSAR Policy",
        summary: "Standard operating procedures for managing Data Subject Access Requests.",
        baseText: "DSAR Policy. Users have the right to request a copy of their processed personal data. DSAR requests must be verified for identity. Complete data exports must be delivered in a structured, machine-readable format within 30 days of verification, without charging a fee.",
        requirements: ["Data subject rights", "Data portability", "Identity verification"]
      },
      consent_mgmt: {
        title: "Consent Management Policy",
        summary: "Rules for obtaining, recording, updating, and withdrawing customer consent.",
        baseText: "Consent Management Policy. Consent must be freely given, specific, and informed. Opt-in models must be used for tracking cookies. Users must be provided an easy mechanism to withdraw consent at any time, which must be processed within 48 hours.",
        requirements: ["Consent mechanism", "Consent withdrawal", "Opt-in cookies banner"]
      },
      cross_border: {
        title: "Cross-Border Transfers Policy",
        summary: "Controls for transferring personal information across international geographical boundaries.",
        baseText: "Cross-Border Transfers Policy. Personal data transfers outside the originating jurisdiction must utilize Standard Contractual Clauses (SCCs) or approved adequacy mechanisms. Data localization rules in key regions must be respected. Data transfers to unauthorized countries are prohibited.",
        requirements: ["Cross-border transfers", "Standard Contractual Clauses (SCCs)", "Data localization"]
      }
    }
  },
  resilience: {
    name: "Business Resilience",
    templates: {
      bcp: {
        title: "Business Continuity Plan (BCP)",
        summary: "Strategy for maintaining critical operations during facility, power, or human disruptions.",
        baseText: "Business Continuity Plan. The company is committed to maintaining operations during disruptions. The CMT (Crisis Management Team) oversees execution. Secondary work centers and cloud failovers are established. Annual testing must be executed.",
        requirements: ["Business continuity testing", "Crisis response roles", "Redundant workspaces"]
      },
      dr: {
        title: "Disaster Recovery (DR) Policy",
        summary: "IT infrastructure recovery steps targeting RTO (< 4 hrs) and RPO (< 1 hr) thresholds.",
        baseText: "Disaster Recovery Policy. Recovery Time Objective (RTO) is set to 4 hours. Recovery Point Objective (RPO) is set to 1 hour. In a disaster event, production services failover to secondary cloud zones. Annual failover tests must be performed.",
        requirements: ["Recovery Time Objective (RTO)", "Recovery Point Objective (RPO)", "Failover infrastructure", "Annual disaster simulation"]
      },
      backup: {
        title: "Backup Policy",
        summary: "Schedules, encryption, and testing rules for digital assets and database snapshots.",
        baseText: "Backup Policy. Full backups are captured weekly, and incremental backups are run daily. Backups must be encrypted in transit and at rest. Backups are stored in separate geographic zones. Restores must be verified monthly.",
        requirements: ["Data Backup", "Backup encryption", "Restore validation checks"]
      },
      crisis_mgmt: {
        title: "Crisis Management Policy",
        summary: "Communication guidelines and action items for managing emergency situation messaging.",
        baseText: "Crisis Management Policy. Crisis declarations are managed by the executive committee. Public communications must be routed through the authorized spokesperson. Customer notifications for critical outages must occur within 2 hours of discovery.",
        requirements: ["Crisis response roles", "Notice requirements", "Customer outage notice"]
      }
    }
  },
  third_party: {
    name: "Third Party",
    templates: {
      vendor_risk: {
        title: "Vendor Risk Management Policy",
        summary: "Due diligence requirements, questionnaires, and grading for sub-processors.",
        baseText: "Vendor Risk Management Policy. All third-party sub-processors must undergo security screening prior to contracting. Vendors are graded High, Medium, or Low risk based on data access. Annual audits must be requested from high-risk vendors.",
        requirements: ["Vendor Risk Assessment", "Sub-processor contracts", "Annual vendor audits"]
      },
      supplier_sec: {
        title: "Supplier Security Policy",
        summary: "Mandatory security standards written into service contracts and SLA terms.",
        baseText: "Supplier Security Policy. Suppliers must comply with data security requirements. Suppliers must report any security incident within 24 hours of discovery. Right-to-audit clauses must be included in all master service agreements.",
        requirements: ["Sub-processor contracts", "Breach notification", "Audit rights clauses"]
      }
    }
  },
  ai_gov: {
    name: "AI Governance",
    templates: {
      ai_usage: {
        title: "AI Usage Policy",
        summary: "Acceptable use of generative AI tools and proprietary code upload boundaries.",
        baseText: "AI Usage Policy. Employees may use generative AI tools to assist in drafting, research, and analysis. Uploading customer PII or proprietary source code to public LLMs is strictly prohibited. Output verification is mandatory to prevent hallucinations.",
        requirements: ["AI Usage Ethics", "Data protection behavior", "AI output verification"]
      },
      prompt_sec: {
        title: "Prompt Security Policy",
        summary: "Oversight for preventing prompt injection and data exposure in LLM queries.",
        baseText: "Prompt Security Policy. Prompts sent to external AI providers must not contain secret tokens, client credentials, or intellectual property. Input sanitization utilities must filter prompts before transmission. Private model instances must be used for sensitive datasets.",
        requirements: ["Credential protection", "Input sanitization utilities", "Private LLM guidelines"]
      },
      model_gov: {
        title: "Model Governance Policy",
        summary: "Lifecycle control, drift checking, and authorization for custom models.",
        baseText: "Model Governance Policy. Deploying custom models to production requires documented safety evaluations. Models must undergo regular drift inspections and training audit reviews. Third-party model agreements must specify data ownership.",
        requirements: ["Model safety evaluations", "Drift inspections", "Model training audit"]
      },
      ai_ethics: {
        title: "AI Ethics Policy",
        summary: "Framework for ensuring fairness, explainability, transparency, and bias reduction.",
        baseText: "AI Ethics Policy. AI decision workflows must have human-in-the-loop oversight. Bias assessments must be conducted during training phase design. Automated decisions impacting credit, employment, or privacy must be explainable.",
        requirements: ["Human-in-the-loop oversight", "Bias assessments", "Explainability standards"]
      }
    }
  }
};

export const REQUIREMENT_PACKS = {
  iso27001: {
    name: "ISO 27001:2022",
    requirements: [
      { id: "iso-access", name: "Logical access controls", desc: "Access rights to networks, systems, and databases must be restricted based on business requirements." },
      { id: "iso-mfa", name: "Multi-Factor Authentication (MFA)", desc: "MFA must be implemented for accessing privileged administrative systems and cloud resources." },
      { id: "iso-logging", name: "Logging procedures", desc: "Audit logs recording user activities, exceptions, and security events must be produced and kept." },
      { id: "iso-backup", name: "Data Backup", desc: "Backups of information, software, and systems must be taken and tested regularly in accordance with policy." },
      { id: "iso-incident", name: "Incident response plan", desc: "Procedures must be established to ensure rapid response to information security events." }
    ]
  },
  iso27701: {
    name: "ISO 27701:2019",
    requirements: [
      { id: "iso27701-purpose", name: "Purpose limitation", desc: "Personal data must only be collected and processed for specified, explicit, and legitimate purposes." },
      { id: "iso27701-inventory", name: "Data inventory", desc: "Maintain a record of personal data processing categories, including sources, targets, and reasons." },
      { id: "iso27701-subject", name: "Data subject rights", desc: "Support data subject inquiries regarding processing, rectifications, and deletions." },
      { id: "iso27701-transfer", name: "Cross-border transfers", desc: "Ensure adequate safeguards exist before personal data crosses international boundaries." }
    ]
  },
  soc2: {
    name: "SOC 2 Type II",
    requirements: [
      { id: "soc2-privilege", name: "Least privilege", desc: "Access credentials must be limited only to users who require the capabilities to perform their roles." },
      { id: "soc2-review", name: "Access review", desc: "Perform periodic administrative reviews of active system permissions and user access rights." },
      { id: "soc2-alert", name: "Incident detection and alerting", desc: "Systems must trigger automated alerts on detecting potential unauthorized access configurations." },
      { id: "soc2-continuity", name: "Business continuity testing", desc: "Maintain and test a business continuity policy to recover operations after critical system failures." }
    ]
  },
  dpdp: {
    name: "DPDPA (India)",
    requirements: [
      { id: "dpdp-grievance", name: "Grievance mechanism", desc: "Establish an easily accessible grievance officer and mechanism for individuals to submit complaints." },
      { id: "dpdp-withdrawal", name: "Consent withdrawal", desc: "Provide individuals the right to withdraw consent as easily as it was given, stopping subsequent processing." },
      { id: "dpdp-retention", name: "Data retention limits", desc: "PII must be securely deleted or anonymized once the purpose of collection has been completed." },
      { id: "dpdp-notice", name: "Notice requirements", desc: "Data subjects must receive clear notice detailing the categories of PII collected, purposes, and rights." }
    ]
  },
  gdpr: {
    name: "GDPR (Europe)",
    requirements: [
      { id: "gdpr-basis", name: "Lawful basis", desc: "Processing of personal data is only lawful if backed by consent, contract, legal obligation, or legitimate interest." },
      { id: "gdpr-forget", name: "Right to be forgotten", desc: "Data subjects hold the right to obtain the erasure of their personal data without undue delay." },
      { id: "gdpr-breach", name: "Breach notification", desc: "Notify supervisory authorities within 72 hours of detecting a personal data breach." },
      { id: "gdpr-portability", name: "Data portability", desc: "Allow data subjects to retrieve their data in a structured, commonly used, machine-readable format." }
    ]
  },
  nist: {
    name: "NIST CSF v2.0",
    requirements: [
      { id: "nist-asset", name: "Asset classification", desc: "Physical and digital assets must be cataloged and prioritized based on system criticality." },
      { id: "nist-recovery", name: "Disaster response plan", desc: "Recovery processes and activities are executed and maintained to ensure timely restoration of systems." },
      { id: "nist-supplier", name: "Vendor Risk Assessment", desc: "Third-party risk management processes are established to evaluate supplier posture." }
    ]
  }
};

export const CLAUSE_LIBRARY = [
  {
    id: "cl-purpose-global",
    name: "Standard Governance Purpose",
    group: "Purpose",
    frameworks: ["ISO 27001", "ISO 27701", "SOC 2", "GDPR", "DPDPA", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "This policy establishes the operational governance framework for managing information security, security monitoring, and privacy protection protocols at {{COMPANY_NAME}}. It serves to define our administrative and technical safeguards in alignment with global regulatory frameworks and client commitments.",
    rationale: "Fulfills the basic compliance requirement of ISO 27001 A.5.1 and SOC 2 CC1.1 to establish and document authorized management intent."
  },
  {
    id: "cl-scope-global",
    name: "Global Scope Mandate",
    group: "Scope",
    frameworks: ["ISO 27001", "ISO 27701", "SOC 2", "GDPR", "DPDPA", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "This policy applies to all databases, application clusters, staging environments, networks, and physical workspaces owned, leased, or operated by {{COMPANY_NAME}}. It governs all full-time employees, contractors, third-party support partners, and sub-processors with access to corporate resources or customer PII.",
    rationale: "Ensures boundaries of the ISMS and PIMS are clearly defined and compliant with ISO 27001 clause 4.3."
  },
  {
    id: "cl-def-gdpr",
    name: "GDPR Core Definitions",
    group: "Definitions",
    frameworks: ["GDPR", "ISO 27701"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "Under this policy, terms are aligned with GDPR specifications:\n- 'Data Subject' refers to any natural person residing in the EU whose personal data is collected.\n- 'Data Controller' refers to the entity that determines processing purposes (e.g. {{COMPANY_NAME}} as a Fiduciary).\n- 'Data Processor' refers to the entity processing data on behalf of the controller (e.g. {{COMPANY_NAME}} acting as a {{POSTURE}}).",
    rationale: "Provides legal precision and conceptual mapping required for GDPR Article 4."
  },
  {
    id: "cl-def-dpdpa",
    name: "DPDPA Core Definitions",
    group: "Definitions",
    frameworks: ["DPDPA", "ISO 27701"],
    jurisdiction: ["India"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "Definitions adhere to the Digital Personal Data Protection Act (DPDPA):\n- 'Data Principal' means the individual to whom the personal data relates.\n- 'Data Fiduciary' means any person who alone or in conjunction with others determines the purpose and means of personal data processing.\n- 'Data Processor' means any person who processes personal data on behalf of a Data Fiduciary.",
    rationale: "Ensures structural compliance with the statutory terminology of DPDPA Section 2."
  },
  {
    id: "cl-roles-generic",
    name: "GRC Roles and Oversight",
    group: "Roles and Responsibilities",
    frameworks: ["ISO 27001", "ISO 27701", "SOC 2", "GDPR", "DPDPA"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Board-Ready",
    text: "Operational oversight is delegated to specialized compliance actors:\n- The Chief Information Security Officer (CISO) owns technical logging, access control audits, and threat monitoring controls.\n- The Data Protection Officer (DPO) ({{DPO_OFFICER}}) supervises privacy impact evaluations and handles data subject access inquiries.\n- The Grievance Officer ({{GRIEVANCE_OFFICER}}) is designated to handle individual complaints and statutory queries.",
    rationale: "Aligns organizational hierarchy with ISO 27001 A.5.3 (roles/responsibilities) and DPDPA/GDPR compliance expectations."
  },
  {
    id: "cl-consent-gdpr-dpdpa",
    name: "Consent Capture & Withdrawal",
    group: "Consent",
    frameworks: ["GDPR", "DPDPA"],
    jurisdiction: ["EU", "India"],
    industry: ["SaaS", "FinTech", "Healthcare"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "Consent to collect and process personal data must be freely given, specific, informed, and unconditional. Before any data capture occurs, users will receive a clear notice detailing data items collected and their right to withdraw consent. Withdrawal of consent can be executed easily at any time via account settings or emailing support. Processing will cease within 14 days of withdrawal.",
    rationale: "Mandated by GDPR Article 7 and DPDPA Section 6, establishing the consent withdrawal standard."
  },
  {
    id: "cl-dsar-standard",
    name: "DSAR Request Protocol",
    group: "DSAR",
    frameworks: ["GDPR", "DPDPA", "ISO 27701"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Board-Ready",
    text: "Data Principals and Subjects hold the right to request access, correction, porting, or complete deletion of their personal data. Requests must be verified for identity by the Privacy team. Complete data exports in a structured machine-readable format, or deletion confirmations, must be delivered to the applicant within 30 days of validation.",
    rationale: "Satisfies GDPR Chapter III and DPDPA Section 11/12 data principal right provisions."
  },
  {
    id: "cl-retention-secure",
    name: "Data Retention Limits",
    group: "Retention",
    frameworks: ["GDPR", "DPDPA", "ISO 27701"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "Personal data processed by {{COMPANY_NAME}} is subject to retention limits based on the processing summary: '{{PROCESSING_PURPOSE}}'. Backups are recycled on a strict 30-day rotation. Upon contract termination or consent withdrawal, client databases and linked tables will be wiped using secure deletion schedules within 30 days.",
    rationale: "Prevents regulatory liability by enforcing storage limitation criteria under GDPR Article 5(1)(e)."
  },
  {
    id: "cl-incident-sla",
    name: "Security Breach Notification SLA",
    group: "Incident Response",
    frameworks: ["ISO 27001", "SOC 2", "GDPR", "DPDPA"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "The Incident Response Team (IRT) will manage security threats. If a personal data breach is confirmed, {{COMPANY_NAME}} will notify supervisory authorities and affected individuals within 72 hours of detection. Root-cause analyses and post-incident reviews must be completed and logged within 5 business days of containment.",
    rationale: "Fulfills the critical statutory breach reporting rules of GDPR Article 33 and DPDPA requirements."
  },
  {
    id: "cl-vendor-due-diligence",
    name: "Vendor Security Screening",
    group: "Third Party Management",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF", "GDPR", "DPDPA"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech", "EdTech"],
    version: "v1.0",
    maturity: "Board-Ready",
    text: "All third-party SaaS vendors, suppliers, and sub-processors with access to customer data or systems must undergo security screening. Vendors must present proof of annual SOC 2 Type II or ISO 27001 certification. Data Processing Addendums (DPAs) must specify breach reporting timelines of 24 hours.",
    rationale: "Secures the supply chain in accordance with ISO 27001 Annex A.15 and GDPR Article 28."
  },
  {
    id: "cl-crossborder-transfer",
    name: "Cross-Border Data Transfers",
    group: "Cross-Border Transfers",
    frameworks: ["GDPR", "DPDPA", "ISO 27701"],
    jurisdiction: ["EU", "India"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "Personal data transfers outside originating jurisdictions will occur only through approved adequacy tools or Standard Contractual Clauses (SCCs). To satisfy data residency demands, {{COMPANY_NAME}} leverages regional hosting zones on {{CLOUD_PROVIDER}} in India and the EU to isolate datasets.",
    rationale: "Fulfills GDPR Chapter V restrictions and data localization expectations of local acts."
  },
  {
    id: "cl-audit-supplier",
    name: "Supplier Audit Rights",
    group: "Audit Rights",
    frameworks: ["SOC 2", "ISO 27001", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech"],
    version: "v1.0",
    maturity: "Consultant-Grade",
    text: "{{COMPANY_NAME}} maintains contract rights to execute annual audits of critical sub-processors. Audits review compliance certifications, security logs, and access management profiles. Sub-processors must resolve high-risk audit findings within 30 days of report distribution.",
    rationale: "Maintains accountability across vendor-managed infrastructure platforms under SOC 2 CC9.2."
  },
  {
    id: "cl-security-training",
    name: "Mandatory Awareness Training",
    group: "Training",
    frameworks: ["ISO 27001", "SOC 2", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Standard",
    text: "All personnel must complete security and data privacy awareness training upon hire and annually thereafter. Topics include password hygiene, phishing, data handling sensitivity, remote VPN controls, and incident reporting. Attendance logs and quiz completions are tracked and audited.",
    rationale: "Directly fulfills the awareness mandates of ISO 27001 Annex A.7.2.2 and SOC 2 CC2.1."
  },
  {
    id: "cl-review-frequency",
    name: "Annual Policy Review Protocol",
    group: "Review Frequency",
    frameworks: ["ISO 27001", "ISO 27701", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    version: "v1.0",
    maturity: "Standard",
    text: "This governance framework is subject to mandatory annual review. The CISO and DPO will inspect operational compliance, verify alignment with newer guidelines (including DPDPA and GDPR rules), and submit amendments to executive leadership for approval every 12 months.",
    rationale: "Addresses ISO 27001 clause 8.1 and SOC 2 CC1.2 requiring periodic framework validation."
  }
];

export class PolicyTemplateService {
  static getDomains() {
    return POLICY_DOMAINS;
  }

  static getRequirementPacks() {
    return REQUIREMENT_PACKS;
  }

  static getClauseLibrary() {
    return CLAUSE_LIBRARY;
  }

  static customizeTemplate(domainKey, templateKey, industry, profile = {}) {
    const domain = POLICY_DOMAINS[domainKey];
    if (!domain) return "";
    const template = domain.templates[templateKey];
    if (!template) return "";

    let text = template.baseText;
    
    // Customize text based on industry and profile
    if (industry) {
      text = text.replace(/ScaleFlow Technologies/g, profile.companyName || "ScaleFlow Technologies");
      
      if (industry === "SaaS") {
        text += `\nAdditional SaaS Provision: Access logging is integrated into automated cloud monitoring. All tenant client separation parameters are checked every 24 hours.`;
      } else if (industry === "FinTech") {
        text += `\nAdditional FinTech Provision: Controls comply with local banking regulatory guides (e.g., RBI/SEBI requirements). Transactions are signed cryptographically, and payment pathways use hardware security modules (HSM).`;
      } else if (industry === "Healthcare") {
        text += `\nAdditional Healthcare Provision: Access authorization requires patient consent logs. System controls are aligned with medical privacy laws (e.g., HIPAA standards), and clinical records are isolated from standard application traffic.`;
      } else if (industry === "EdTech") {
        text += `\nAdditional EdTech Provision: Access permissions are restricted for student directories. Data records representing minors under 18 require parental authorization records.`;
      } else if (industry === "Manufacturing") {
        text += `\nAdditional Manufacturing Provision: Access covers OT (Operational Technology) and IoT devices. Industrial SCADA interfaces are air-gapped from corporate networks.`;
      }
    }

    if (profile.cloudProvider) {
      text += `\nInfrastructure Note: All resources are hosted on ${profile.cloudProvider} with strict identity configuration boundaries.`;
    }

    return text;
  }

  // --- CONSULTANT-GRADE SIMULATION FALLBACK GENERATOR ---
  static generateSimulatedDraft(domainKey, templateKey, selectedFrameworks, profile = {}) {
    const domain = POLICY_DOMAINS[domainKey];
    if (!domain) return "Domain not found.";
    const template = domain.templates[templateKey];
    if (!template) return "Template not found.";

    const companyName = profile.companyName || "ScaleFlow Technologies";
    const industry = profile.industry || "SaaS";
    const country = profile.country || "Global";
    const geography = profile.customerGeography || "Global";
    const cloud = profile.cloudProvider || "AWS";
    const posture = profile.controllerProcessor || "Processor";
    const dpo = profile.dpoOfficer || "DPO / Privacy Team";
    const grievance = profile.grievanceOfficer || "Grievance Officer";
    const purpose = profile.processingPurpose || "Enterprise business operations and service delivery";
    const employeeCount = profile.employeeCount || "100";
    const specialCategories = profile.specialCategories || "None";

    // Format list of frameworks
    const fwsFormatted = (selectedFrameworks && selectedFrameworks.length > 0) 
      ? selectedFrameworks.join(", ") 
      : "Internal Governance";

    // 1. Build Header Box
    let doc = `================================================================================
DOCUMENT TITLE:   ${template.title}
ORGANIZATION:     ${companyName} (${industry} sector)
CLASSIFICATION:   Confidential - Internal Use Only
VERSION:          v1.0
STATUS:           Draft (Pending Board Approval)
EFFECTIVE DATE:   ${new Date().toLocaleDateString('en-GB')}
TARGET FRAMEWORKS: ${fwsFormatted}
JURISDICTION:     ${geography} (Origin: ${country})
REVISION OWNER:   ${dpo}
================================================================================

`;

    // 2. Section 1: Purpose & Scope
    doc += `## 1. PURPOSE & SCOPE\n\n`;
    // Fetch and customize Purpose clause
    const purposeClause = CLAUSE_LIBRARY.find(c => c.id === 'cl-purpose-global');
    let purposeText = purposeClause ? purposeClause.text : "";
    
    // Fetch and customize Scope clause
    const scopeClause = CLAUSE_LIBRARY.find(c => c.id === 'cl-scope-global');
    let scopeText = scopeClause ? scopeClause.text : "";

    // Perform replacements
    const replaceVars = (str) => {
      if (!str) return "";
      return str
        .replace(/{{COMPANY_NAME}}/g, companyName)
        .replace(/{{INDUSTRY}}/g, industry)
        .replace(/{{COUNTRY}}/g, country)
        .replace(/{{CUSTOMER_GEOGRAPHY}}/g, geography)
        .replace(/{{CLOUD_PROVIDER}}/g, cloud)
        .replace(/{{POSTURE}}/g, posture)
        .replace(/{{DPO_OFFICER}}/g, dpo)
        .replace(/{{GRIEVANCE_OFFICER}}/g, grievance)
        .replace(/{{PROCESSING_PURPOSE}}/g, purpose)
        .replace(/{{EMPLOYEE_COUNT}}/g, employeeCount)
        .replace(/{{SPECIAL_CATEGORIES}}/g, specialCategories);
    };

    doc += replaceVars(purposeText) + `\n\n` + replaceVars(scopeText) + `\n\n`;

    // 3. Section 2: Definitions
    doc += `## 2. COMPLIANCE DEFINITIONS\n\n`;
    let defsText = "";
    if (selectedFrameworks.includes("DPDPA") || selectedFrameworks.includes("DPDP")) {
      const dpdpDef = CLAUSE_LIBRARY.find(c => c.id === 'cl-def-dpdpa');
      if (dpdpDef) defsText += dpdpDef.text + `\n\n`;
    }
    if (selectedFrameworks.includes("GDPR")) {
      const gdprDef = CLAUSE_LIBRARY.find(c => c.id === 'cl-def-gdpr');
      if (gdprDef) defsText += gdprDef.text + `\n\n`;
    }
    if (!defsText) {
      defsText = `Definitions of terms under this policy align with standard ISO 27001:2022 and SOC 2 security framework models. Key terms include PII (Personally Identifiable Information), logical security keys, and admin access roles.`;
    }
    doc += replaceVars(defsText) + `\n`;

    // 4. Section 3: Roles and Responsibilities
    doc += `## 3. ROLES & GOVERNANCE OVERSIGHT\n\n`;
    const rolesClause = CLAUSE_LIBRARY.find(c => c.id === 'cl-roles-generic');
    let rolesText = rolesClause ? rolesClause.text : "";
    doc += replaceVars(rolesText) + `\n\n`;

    // 5. Section 4: Mapped Regulatory Controls (Dynamic based on selected frameworks)
    doc += `## 4. REGULATORY CONTROLS & COMPLIANCE REQUIREMENTS\n\n`;
    
    // Identify which clause groups to pull based on domain/policy type and frameworks
    const groupsToPull = [];
    if (domainKey === 'privacy') {
      groupsToPull.push('Consent', 'DSAR', 'Retention', 'Cross-Border Transfers');
    } else if (domainKey === 'infosec') {
      groupsToPull.push('Incident Response', 'Third Party Management', 'Training', 'Audit Rights');
    } else {
      groupsToPull.push('Incident Response', 'Third Party Management', 'Audit Rights', 'Training');
    }

    let controlsAddedCount = 0;
    groupsToPull.forEach(groupName => {
      // Find matching clauses for this group that map to selected frameworks
      const matches = CLAUSE_LIBRARY.filter(c => {
        if (c.group !== groupName) return false;
        // If no framework filter, allow. Otherwise check intersection.
        if (!c.frameworks || c.frameworks.length === 0) return true;
        
        return c.frameworks.some(fw => {
          // Check DPDPA -> DPDP alias mapping
          const fwKey = fw === 'DPDPA' ? 'DPDP' : fw;
          return selectedFrameworks.includes(fw) || selectedFrameworks.includes(fwKey);
        });
      });

      if (matches.length > 0) {
        // Add the best match
        const best = matches[0];
        doc += `### 4.${++controlsAddedCount} ${best.name} (${best.maturity})\n`;
        doc += `*Rationale:* ${best.rationale}\n\n`;
        doc += replaceVars(best.text) + `\n\n`;
      }
    });

    if (controlsAddedCount === 0) {
      doc += `No specific regulatory control clauses matched the selected combination of frameworks. Default organizational privacy and security baselines are maintained in active logs.\n\n`;
    }

    // 6. Section 5: Administrative Protocols
    doc += `## 5. ADMINISTRATIVE PROTOCOLS\n\n`;
    const trainingClause = CLAUSE_LIBRARY.find(c => c.id === 'cl-security-training');
    const reviewClause = CLAUSE_LIBRARY.find(c => c.id === 'cl-review-frequency');

    if (trainingClause) {
      doc += `### 5.1 Training & Human Awareness\n` + replaceVars(trainingClause.text) + `\n\n`;
    }
    if (reviewClause) {
      doc += `### 5.2 Revision Controls & Review Frequencies\n` + replaceVars(reviewClause.text) + `\n`;
    }

    return doc;
  }

  static getSimulationAnalysis(policyText, frameworkKey) {
    const pack = REQUIREMENT_PACKS[frameworkKey];
    if (!pack) return { missing: [], weak: [], strong: [] };

    const missing = [];
    const weak = [];
    const strong = [];

    // Analyze policy text based on keywords corresponding to each requirement
    pack.requirements.forEach(req => {
      const keywords = req.name.toLowerCase().split(" ");
      let matchCount = 0;
      
      keywords.forEach(word => {
        if (word.length > 3 && policyText.toLowerCase().includes(word)) {
          matchCount++;
        }
      });

      const coverageRatio = matchCount / keywords.filter(w => w.length > 3).length;

      if (policyText.toLowerCase().includes(req.name.toLowerCase())) {
        strong.push(req);
      } else if (coverageRatio > 0.4 || policyText.toLowerCase().includes(keywords[0])) {
        weak.push(req);
      } else {
        missing.push(req);
      }
    });

    return { missing, weak, strong };
  }
}
