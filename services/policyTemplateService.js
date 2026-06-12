// Navis Policy Template Service
// Houses curated base templates, industry variants, requirement packs, and clause libraries.

export const POLICY_DOMAINS = {
  infosec: {
    name: "Information Security",
    templates: {
      access_control: {
        title: "Access Control Policy",
        summary: "Defines authorization, user access management, privileged access, and password complexity.",
        baseText: "ScaleFlow Technologies Access Control Policy. All user accounts must be authorized on a least-privilege basis. Access controls are applied to protect internal systems, databases, and production servers. Privileged accounts (admin) require dedicated credentials and approval. Access reviews must occur at regular intervals. Termination of employment requires immediate access revocation.",
        requirements: ["Logical access controls", "Least privilege", "Access review", "Access revocation"]
      },
      password: {
        title: "Password Policy",
        summary: "Mandates complexity, length, MFA, and storage mechanisms for authentication credentials.",
        baseText: "ScaleFlow Technologies Password Policy. Passwords must be at least 12 characters, including uppercase, lowercase, numbers, and symbols. Multi-Factor Authentication (MFA) is mandatory for all access. Password storage must utilize salted cryptographic hashing (e.g., bcrypt). Sharing passwords is strictly prohibited.",
        requirements: ["Password requirements", "Multi-Factor Authentication (MFA)", "Credential protection"]
      },
      logging: {
        title: "Logging and Monitoring Policy",
        summary: "Establishes audit log capture, secure retention, and alerting rules for system activity.",
        baseText: "ScaleFlow Technologies Logging and Monitoring Policy. Security and system events must be logged continuously. Log contents must include user IDs, timestamps, event types, and outcomes. Access to audit logs must be restricted to prevent tampering. Alerts must be configured for brute-force attempts and critical infrastructure failures.",
        requirements: ["Logging procedures", "Audit logs security", "Incident detection and alerting"]
      },
      asset_mgmt: {
        title: "Asset Management Policy",
        summary: "Rules for identifying, classifying, tracking, and disposing of corporate physical and digital assets.",
        baseText: "ScaleFlow Technologies Asset Management Policy. An inventory of all hardware, software, and data assets must be maintained. Asset classification is based on sensitivity (Public, Internal, Confidential, Restricted). Disposal of devices must use secure wiping algorithms to prevent data recovery.",
        requirements: ["Data inventory", "Asset classification", "Secure asset disposal"]
      },
      cryptography: {
        title: "Cryptography Policy",
        summary: "Specifies protocols and key management rules for protecting data at rest and in transit.",
        baseText: "ScaleFlow Technologies Cryptography Policy. Data in transit must be encrypted using TLS 1.3 or higher. Data at rest must use AES-256 encryption. Cryptographic keys must be rotated annually and stored in a secure key management system. Legacy protocols like SSL and WEP are prohibited.",
        requirements: ["Encryption keys", "Encryption in transit", "Encryption at rest"]
      },
      incident_resp: {
        title: "Incident Response Policy",
        summary: "Framework for detecting, containing, investigating, and reporting security incidents.",
        baseText: "ScaleFlow Technologies Incident Response Policy. A dedicated Incident Response Team (IRT) is established to handle security alerts. Incident classification ranges from Low (minor anomalies) to Critical (active breach). Incident post-mortems must be documented and shared with leadership within 5 days of containment.",
        requirements: ["Incident detection and alerting", "Incident response plan", "Post-incident review"]
      },
      remote_work: {
        title: "Remote Working Policy",
        summary: "Security guidelines for employees accessing corporate resources from external networks.",
        baseText: "ScaleFlow Technologies Remote Working Policy. Remote connections must utilize a secure corporate VPN. Workstations must have disk encryption and active antivirus software. Printing corporate documents in remote locations is prohibited unless authorized. Public Wi-Fi usage requires VPN routing.",
        requirements: ["VPN authorization", "Device security configuration", "Physical security rules"]
      },
      acceptable_use: {
        title: "Acceptable Use Policy",
        summary: "Core code of conduct for employee usage of company network, email, and devices.",
        baseText: "ScaleFlow Technologies Acceptable Use Policy. Company assets are provided for business operations. Users must not use company resources to transmit illegal, harassing, or copyright-violating content. Corporate emails must not be used for personal registrations unless authorized.",
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
        baseText: "ScaleFlow Technologies Data Privacy Policy. We process customer identifiers, email addresses, and IP numbers. Personal data collection must follow data minimization principles. Explicit consent must be obtained prior to tracking. Users hold rights to access, update, or erase their information.",
        requirements: ["Notice requirements", "Lawful basis", "Data minimization", "Consent mechanism", "Data subject rights"]
      },
      data_retention: {
        title: "Data Retention Policy",
        summary: "Defines timelines for preserving personal data and schedules for secure deletion.",
        baseText: "ScaleFlow Technologies Data Retention Policy. Personal data is retained only as long as necessary to fulfill the business purpose. Inactive customer records are archived after 1 year and purged after 7 years. Backups are recycled on a 30-day rotation. Users may request expedited erasure.",
        requirements: ["Data retention limits", "Right to be forgotten", "Secure deletion schedules"]
      },
      dsar: {
        title: "DSAR Policy",
        summary: "Standard operating procedures for managing Data Subject Access Requests.",
        baseText: "ScaleFlow Technologies DSAR Policy. Users have the right to request a copy of their processed personal data. DSAR requests must be verified for identity. Complete data exports must be delivered in a structured, machine-readable format within 30 days of verification, without charging a fee.",
        requirements: ["Data subject rights", "Data portability", "Identity verification"]
      },
      consent_mgmt: {
        title: "Consent Management Policy",
        summary: "Rules for obtaining, recording, updating, and withdrawing customer consent.",
        baseText: "ScaleFlow Technologies Consent Management Policy. Consent must be freely given, specific, and informed. Opt-in models must be used for tracking cookies. Users must be provided an easy mechanism to withdraw consent at any time, which must be processed within 48 hours.",
        requirements: ["Consent mechanism", "Consent withdrawal", "Opt-in cookies banner"]
      },
      cross_border: {
        title: "Cross-Border Transfers Policy",
        summary: "Controls for transferring personal information across international geographical boundaries.",
        baseText: "ScaleFlow Technologies Cross-Border Transfers Policy. Personal data transfers outside the originating jurisdiction must utilize Standard Contractual Clauses (SCCs) or approved adequacy mechanisms. Data localization rules in key regions (e.g., India, EU) must be respected. Data transfers to unauthorized countries are prohibited.",
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
        baseText: "ScaleFlow Technologies Business Continuity Plan. ScaleFlow is committed to maintaining operations during disruptions. The CMT (Crisis Management Team) oversees execution. Secondary work centers and cloud failovers are established. Annual testing must be executed.",
        requirements: ["Business continuity testing", "Crisis response roles", "Redundant workspaces"]
      },
      dr: {
        title: "Disaster Recovery (DR) Policy",
        summary: "IT infrastructure recovery steps targeting RTO (< 4 hrs) and RPO (< 1 hr) thresholds.",
        baseText: "ScaleFlow Technologies Disaster Recovery Policy. Recovery Time Objective (RTO) is set to 4 hours. Recovery Point Objective (RPO) is set to 1 hour. In a disaster event, production services failover to secondary cloud zones. Annual failover tests must be performed.",
        requirements: ["Recovery Time Objective (RTO)", "Recovery Point Objective (RPO)", "Failover infrastructure", "Annual disaster simulation"]
      },
      backup: {
        title: "Backup Policy",
        summary: "Schedules, encryption, and testing rules for digital assets and database snapshots.",
        baseText: "ScaleFlow Technologies Backup Policy. Full backups are captured weekly, and incremental backups are run daily. Backups must be encrypted in transit and at rest. Backups are stored in separate geographic zones. Restores must be verified monthly.",
        requirements: ["Data Backup", "Backup encryption", "Restore validation checks"]
      },
      crisis_mgmt: {
        title: "Crisis Management Policy",
        summary: "Communication guidelines and action items for managing emergency situation messaging.",
        baseText: "ScaleFlow Technologies Crisis Management Policy. Crisis declarations are managed by the executive committee. Public communications must be routed through the authorized spokesperson. Customer notifications for critical outages must occur within 2 hours of discovery.",
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
        baseText: "ScaleFlow Technologies Vendor Risk Management Policy. All third-party sub-processors must undergo security screening prior to contracting. Vendors are graded High, Medium, or Low risk based on data access. Annual SOC 2 audits must be requested from high-risk vendors.",
        requirements: ["Vendor Risk Assessment", "Sub-processor contracts", "Annual vendor audits"]
      },
      supplier_sec: {
        title: "Supplier Security Policy",
        summary: "Mandatory security standards written into service contracts and SLA terms.",
        baseText: "ScaleFlow Technologies Supplier Security Policy. Suppliers must comply with ScaleFlow's data security requirements. Suppliers must report any security incident within 24 hours of discovery. Right-to-audit clauses must be included in all master service agreements.",
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
        baseText: "ScaleFlow Technologies AI Usage Policy. Employees may use generative AI tools to assist in drafting, research, and analysis. Uploading customer PII or proprietary source code to public LLMs is strictly prohibited. Output verification is mandatory to prevent hallucinations.",
        requirements: ["AI Usage Ethics", "Data protection behavior", "AI output verification"]
      },
      prompt_sec: {
        title: "Prompt Security Policy",
        summary: "Oversight for preventing prompt injection and data exposure in LLM queries.",
        baseText: "ScaleFlow Technologies Prompt Security Policy. Prompts sent to external AI providers must not contain secret tokens, client credentials, or intellectual property. Input sanitization utilities must filter prompts before transmission. Private model instances must be used for sensitive datasets.",
        requirements: ["Credential protection", "Input sanitization utilities", "Private LLM guidelines"]
      },
      model_gov: {
        title: "Model Governance Policy",
        summary: "Lifecycle control, drift checking, and authorization for custom models.",
        baseText: "ScaleFlow Technologies Model Governance Policy. Deploying custom models to production requires documented safety evaluations. Models must undergo regular drift inspections and training audit reviews. Third-party model agreements must specify data ownership.",
        requirements: ["Model safety evaluations", "Drift inspections", "Model training audit"]
      },
      ai_ethics: {
        title: "AI Ethics Policy",
        summary: "Framework for ensuring fairness, explainability, transparency, and bias reduction.",
        baseText: "ScaleFlow Technologies AI Ethics Policy. AI decision workflows must have human-in-the-loop oversight. Bias assessments must be conducted during training phase design. Automated decisions impacting credit, employment, or privacy must be explainable.",
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
    name: "DPDP Act (India)",
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
  ccpa: {
    name: "CCPA/CPRA (California)",
    requirements: [
      { id: "ccpa-optout", name: "Do Not Sell option", desc: "Provide a clear 'Do Not Sell My Personal Information' option to consumers." },
      { id: "ccpa-disclosure", name: "Data collection disclosures", desc: "Inform consumers about the categories of PII collected and the commercial purposes behind usage." },
      { id: "ccpa-deletion", name: "Right to delete", desc: "Support client requests to delete collected personal information." }
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
    id: "cl-retention",
    name: "Data Retention Clause",
    frameworks: ["DPDP", "GDPR", "ISO 27701"],
    text: "Personal data collected by ScaleFlow shall be retained only for as long as necessary to fulfill the specific purposes outlined in the notice, or as required by applicable laws. Upon fulfillment of the processing purpose, or upon successful withdrawal of user consent, ScaleFlow will securely delete, sanitize, or anonymize the data from all active databases and backup files within 30 days.",
    rationale: "Fulfills the purpose limitation and storage restriction principles mandated under GDPR and DPDP. Avoids liability from holding stale user information.",
    confidence: "High"
  },
  {
    id: "cl-grievance",
    name: "Grievance Redressal Clause",
    frameworks: ["DPDP"],
    text: "Data subjects may address any questions, feedback, or grievances regarding our data processing policies to our designated Grievance Officer at grievance@scaleflow.io. ScaleFlow will acknowledge receipt of all grievances within 48 hours and provide a resolved resolution within 30 days of submission.",
    rationale: "Directly satisfies Section 12 of the DPDP Act, requiring organizations to establish an active grievance officer and redressal route.",
    confidence: "High"
  },
  {
    id: "cl-withdrawal",
    name: "Consent Withdrawal Clause",
    frameworks: ["DPDP", "GDPR"],
    text: "You have the right to withdraw your consent to our processing of your personal information at any time. To execute this, click the 'Withdraw Consent' button in your account dashboard or email support@scaleflow.io. Upon receiving withdrawal, we will cease processing and instruct our sub-processors to destroy the personal data within 14 business days.",
    rationale: "Ensures compliance with GDPR Art. 7(3) and DPDP Sec. 6, establishing that withdrawing consent must be as simple as giving it.",
    confidence: "High"
  },
  {
    id: "cl-breach",
    name: "Data Breach Notification Clause",
    frameworks: ["GDPR", "SOC 2"],
    text: "In the event of a confirmed or suspected security incident leading to unauthorized personal data leakage, ScaleFlow will notify the supervisory authorities and affected individuals within 72 hours of breach detection. The notice will describe the nature of the breach, affected records, and immediate mitigation efforts.",
    rationale: "Meets GDPR Article 33 requirements, preventing regulatory fines by laying out strict timetables for external disclosures.",
    confidence: "High"
  },
  {
    id: "cl-pam",
    name: "Privileged Access Management (PAM) Clause",
    frameworks: ["ISO 27001", "SOC 2"],
    text: "Access to production networks, server images, and configuration databases is strictly restricted to authorized administrative users. Multi-Factor Authentication (MFA) is mandatory. Administrative roles must use dedicated, non-shared credentials. Permissions are granted on a least-privilege basis and undergo automated review every 90 days.",
    rationale: "Addresses SOC 2 CC6.1 logical access controls and ISO 27001 A.8.2. Prevents insider threats and unauthorized modifications.",
    confidence: "High"
  },
  {
    id: "cl-backup",
    name: "Database Backup Clause",
    frameworks: ["ISO 27001", "NIST CSF"],
    text: "Full database snapshots must be captured weekly, and incremental transaction logs must be backed up hourly. All backup files must be encrypted in transit and at rest using AES-256 standards. Backups are stored in separate, geographically redundant cloud instances. Restore validation testing is conducted monthly.",
    rationale: "Satisfies ISO 27001 Annex A.12.3 and NIST recovery standards, ensuring disaster recovery capabilities are validated.",
    confidence: "High"
  },
  {
    id: "cl-rto",
    name: "Disaster Recovery RTO/RPO SLA",
    frameworks: ["SOC 2", "NIST CSF"],
    text: "ScaleFlow IT infrastructure is designed with failover controls targeting a Recovery Time Objective (RTO) of less than 4 hours and a Recovery Point Objective (RPO) of less than 1 hour. Active-active cross-region configurations are deployed to maintain customer event tracking ingestion availability.",
    rationale: "Delineates quantifiable business continuity goals required under SOC 2 CC7.3. Builds enterprise client trust.",
    confidence: "Medium"
  },
  {
    id: "cl-vendor",
    name: "Vendor Security Due Diligence Clause",
    frameworks: ["ISO 27001", "SOC 2", "GDPR"],
    text: "All third-party suppliers, SaaS tools, and sub-processors with access to customer PII or corporate source files must undergo security reviews. Vendors must provide proof of annual SOC 2 compliance audits or equivalent ISO certifications. SLAs must require vendors to report breaches to ScaleFlow within 24 hours.",
    rationale: "Satisfies supply chain security requirements under ISO 27001 Annex A.15 and GDPR vendor processing agreements.",
    confidence: "High"
  },
  {
    id: "cl-logging",
    name: "System Event Logging Clause",
    frameworks: ["ISO 27001", "SOC 2"],
    text: "Security logs must record user authentication actions, authorization updates, database deletions, and configuration changes. Logs must capture timestamps, account IDs, source IPs, and event statuses. Log files are archived in write-once-read-many (WORM) storage for 365 days, restricted from modification.",
    rationale: "Satisfies audit trail requirements for SOC 2 CC7.2. Critical for forensic analysis during incident responses.",
    confidence: "High"
  },
  {
    id: "cl-aigov",
    name: "Generative AI Acceptable Use Clause",
    frameworks: ["ISO 27001", "Internal Governance"],
    text: "Employees must not submit customer personal data, developer API secrets, or proprietary source code to public generative AI tools or external LLM platforms. Verification by a human supervisor is mandatory before deploying AI-generated text, content, or designs to production environments.",
    rationale: "Establishes data protection boundaries for emerging AI utilization, protecting intellectual property and client privacy.",
    confidence: "High"
  },
  {
    id: "cl-crossborder",
    name: "Cross-Border Data Transfers Clause",
    frameworks: ["GDPR", "ISO 27701"],
    text: "International transfers of personal data to countries outside the European Economic Area or equivalent jurisdictions shall only be executed under approved Standard Contractual Clauses (SCCs) or legal adequacy decisions. ScaleFlow maintains data residency zones inside the EU and India to comply with local regulations.",
    rationale: "Fulfills GDPR Chapter V criteria. Prevents data localization violations.",
    confidence: "High"
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
