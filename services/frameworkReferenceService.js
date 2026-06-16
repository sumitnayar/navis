// Navis Framework Reference Service
// Stores and retrieves semantically correct GRC citations and regulatory reference details.

export class FrameworkReferenceService {
  static getRegistry() {
    return [
      // Consent / Consent Withdrawal
      {
        framework: "GDPR",
        category: "privacy_consent",
        reference: "GDPR Article 7",
        title: "Conditions for Consent",
        description: "Consent must be easily withdrawable and demonstrated clearly by the controller."
      },
      {
        framework: "DPDPA",
        category: "privacy_consent",
        reference: "DPDPA Section 6",
        title: "Consent",
        description: "Consent must be free, specific, informed, unconditional, and withdrawable."
      },
      {
        framework: "ISO 27701",
        category: "privacy_consent",
        reference: "ISO 27701 Clause 7.3.2",
        title: "Privacy Controls (Consent)",
        description: "Capture and record consent withdrawal requests efficiently."
      },

      // Data Subject Rights / DSAR
      {
        framework: "GDPR",
        category: "privacy_rights",
        reference: "GDPR Articles 12–22",
        title: "Rights of the Data Subject",
        description: "Defines rights to access, rectification, erasure, restriction, portability, and objection."
      },
      {
        framework: "DPDPA",
        category: "privacy_rights",
        reference: "DPDPA rights provisions",
        title: "Rights of Data Principal",
        description: "Provides rights to access summaries, correction, erasure, and grievance redressal."
      },
      {
        framework: "SOC 2",
        category: "privacy_rights",
        reference: "SOC 2 CC6.1",
        title: "Access Controls & Rights",
        description: "Enforces identity verification, authorization, and information retrieval controls."
      },

      // Cross-Border Data Transfers
      {
        framework: "GDPR",
        category: "cross_border",
        reference: "GDPR Chapter V",
        title: "Transfers of Personal Data to Third Countries",
        description: "Regulates transfers outside EEA based on adequacy, SCCs, or derogations."
      },
      {
        framework: "DPDPA",
        category: "cross_border",
        reference: "DPDPA transfer provisions",
        title: "Transfer outside India",
        description: "Governs personal data transfers outside India except to restricted blacklisted countries."
      },
      {
        framework: "ISO 27701",
        category: "cross_border",
        reference: "ISO 27701 Clause 7.4.7",
        title: "Transfer Safeguards",
        description: "Requires explicit documentation of jurisdictions and cross-border transfer protections."
      },

      // Processor Obligations / Supplier Controls
      {
        framework: "GDPR",
        category: "processor_obligations",
        reference: "GDPR Article 28",
        title: "Processor Obligations",
        description: "Mandates binding processor contracts, security commitments, and sub-processor approvals."
      },
      {
        framework: "ISO 27701",
        category: "processor_obligations",
        reference: "ISO 27701 processor controls",
        title: "Processor Agreements",
        description: "Requires detailed processor-controller agreements, security monitoring, and alignment."
      },
      {
        framework: "ISO 27001",
        category: "processor_obligations",
        reference: "ISO 27001 Clause A.15.1",
        title: "Supplier Security Policies",
        description: "Requires establishing and monitoring security requirements in supplier relationships."
      },
      {
        framework: "SOC 2",
        category: "processor_obligations",
        reference: "SOC 2 CC9.2",
        title: "Supply Chain Risk Mitigation",
        description: "Requires evaluating supplier security postures and vendor SLA compliance."
      },
      {
        framework: "NIST CSF",
        category: "processor_obligations",
        reference: "NIST CSF ID.SC",
        title: "Supply Chain Risk Management",
        description: "Mandates supplier assessments, contract agreements, and compliance reviews."
      },

      // Ownership & Roles
      {
        framework: "GDPR",
        category: "ownership",
        reference: "GDPR Article 37",
        title: "Designation of DPO",
        description: "Appoints a designated Data Protection Officer to supervise compliance tasks."
      },
      {
        framework: "DPDPA",
        category: "ownership",
        reference: "DPDPA Section 10",
        title: "Significant Data Fiduciary / DPO",
        description: "Appoints DPO as representative contact for principal communications."
      },
      {
        framework: "ISO 27701",
        category: "ownership",
        reference: "ISO 27701 Clause 7.2.5",
        title: "Privacy Roles",
        description: "Appoints specialized privacy managers or contact points."
      },
      {
        framework: "ISO 27001",
        category: "ownership",
        reference: "ISO 27001 Clause A.5.3",
        title: "Security Roles and Responsibilities",
        description: "Enforces assignments of security roles across the organization structure."
      },
      {
        framework: "SOC 2",
        category: "ownership",
        reference: "SOC 2 CC2.1",
        title: "Governance Structure",
        description: "Assigns oversight authority and reporting lines to specific roles."
      },
      {
        framework: "NIST CSF",
        category: "ownership",
        reference: "NIST CSF ID.GV",
        title: "Organizational Governance",
        description: "Outlines designated security responsibilities and governance metrics."
      },

      // Review Frequency / Approval
      {
        framework: "ISO 27001",
        category: "review",
        reference: "ISO 27001 Clause A.5.1",
        title: "Information Security Policies Review",
        description: "Policies must be reviewed at planned intervals or upon significant changes."
      },
      {
        framework: "SOC 2",
        category: "review",
        reference: "SOC 2 CC2.1",
        title: "Policy Reviews",
        description: "Ensures security policy reviews occur regularly and are officially approved."
      },
      {
        framework: "NIST CSF",
        category: "review",
        reference: "NIST CSF ID.GV",
        title: "Governance Reviews",
        description: "Ensures suitability, adequacy, and updating frequency of policies."
      },

      // Data Retention / Destruction
      {
        framework: "GDPR",
        category: "retention",
        reference: "GDPR Article 32",
        title: "Security & Retention Policies",
        description: "Personal data must not be stored longer than required for processing purposes."
      },
      {
        framework: "DPDPA",
        category: "retention",
        reference: "DPDPA Section 8",
        title: "Obligations of Data Fiduciary (Retention)",
        description: "Requires erasing personal data once purpose is fulfilled or consent withdrawn."
      },
      {
        framework: "ISO 27701",
        category: "retention",
        reference: "ISO 27701 Clause 7.3.2",
        title: "Retention Limits",
        description: "Enforces data destruction schedules and retention limitations."
      },
      {
        framework: "NIST CSF",
        category: "retention",
        reference: "NIST CSF PR.DS",
        title: "Data Destruction & Safeguards",
        description: "Requires secure erasure and lifecycle management for assets."
      }
    ];
  }

  static getReferencesForFrameworks(frameworksList) {
    const registry = this.getRegistry();
    return registry.filter(r => frameworksList.includes(r.framework));
  }
}
