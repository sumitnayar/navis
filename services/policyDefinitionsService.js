// Navis Policy Definitions Service
// Wave 3.6: Professional GRC definitions engine, framework-filtered.
// Generates institutional-quality definitions sections for governance documents.

export class PolicyDefinitionsService {

  // ─── DEFINITIONS REGISTRY ─────────────────────────────────────────────────
  static DEFINITIONS = [
    // ── GDPR ──────────────────────────────────────────────────────────────────
    {
      term: 'Personal Data',
      definition: 'Any information relating to an identified or identifiable natural person ("Data Subject"); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person.',
      source: 'GDPR Article 4(1)',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Data Subject',
      definition: 'An identified or identifiable natural person whose Personal Data is collected, stored, or otherwise processed by the Data Controller or Data Processor.',
      source: 'GDPR Article 4(1)',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Data Controller',
      definition: 'The natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of Personal Data.',
      source: 'GDPR Article 4(7)',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Data Processor',
      definition: 'A natural or legal person, public authority, agency, or other body which processes Personal Data on behalf of the Data Controller, subject to a written data processing agreement specifying the scope, nature, and purpose of processing.',
      source: 'GDPR Article 4(8)',
      frameworks: ['GDPR', 'DPDPA', 'ISO 27701']
    },
    {
      term: 'Processing',
      definition: 'Any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.',
      source: 'GDPR Article 4(2)',
      frameworks: ['GDPR', 'DPDPA', 'ISO 27701']
    },
    {
      term: 'Consent',
      definition: 'Any freely given, specific, informed, and unambiguous indication of the Data Subject\'s wishes by which he or she, by a statement or by a clear affirmative action, signifies agreement to the processing of Personal Data relating to him or her.',
      source: 'GDPR Article 4(11)',
      frameworks: ['GDPR', 'DPDPA']
    },
    {
      term: 'Special Categories of Personal Data',
      definition: 'Personal Data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health, or data concerning a natural person\'s sex life or sexual orientation.',
      source: 'GDPR Article 9(1)',
      frameworks: ['GDPR']
    },
    {
      term: 'Personal Data Breach',
      definition: 'A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, Personal Data transmitted, stored, or otherwise processed.',
      source: 'GDPR Article 4(12)',
      frameworks: ['GDPR', 'DPDPA', 'ISO 27001']
    },
    {
      term: 'Supervisory Authority',
      definition: 'An independent public authority which is established by a Member State pursuant to Article 51 of the GDPR, responsible for monitoring the application of data protection legislation.',
      source: 'GDPR Article 4(21)',
      frameworks: ['GDPR']
    },
    {
      term: 'Data Protection Impact Assessment (DPIA)',
      definition: 'A systematic assessment of the potential impact of processing operations on the protection of Personal Data, required where processing is likely to result in a high risk to the rights and freedoms of natural persons.',
      source: 'GDPR Article 35',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Records of Processing Activities (ROPA)',
      definition: 'A documented record maintained by the Data Controller and, where applicable, the Data Processor, containing prescribed information about processing activities including purposes, categories of data subjects, categories of Personal Data, recipients, transfers, retention periods, and security measures.',
      source: 'GDPR Article 30',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Standard Contractual Clauses (SCCs)',
      definition: 'Pre-approved contractual clauses adopted by the European Commission providing appropriate safeguards for the transfer of Personal Data to third countries that have not received an adequacy decision.',
      source: 'GDPR Article 46(2)(c)',
      frameworks: ['GDPR']
    },
    {
      term: 'Sub-processor',
      definition: 'A third party engaged by a Data Processor to carry out specific processing activities on behalf of the Data Controller, subject to prior written authorisation and a binding sub-processing agreement.',
      source: 'GDPR Article 28(2)',
      frameworks: ['GDPR', 'ISO 27701']
    },
    {
      term: 'Profiling',
      definition: 'Any form of automated processing of Personal Data consisting of the use of Personal Data to evaluate certain personal aspects relating to a natural person, in particular to analyse or predict aspects concerning that natural person\'s performance at work, economic situation, health, personal preferences, interests, reliability, behaviour, location, or movements.',
      source: 'GDPR Article 4(4)',
      frameworks: ['GDPR']
    },

    // ── DPDPA ─────────────────────────────────────────────────────────────────
    {
      term: 'Data Principal',
      definition: 'The individual to whom the Personal Data relates, and where such individual is a child, includes the parents or lawful guardian of such a child.',
      source: 'DPDPA Section 2(j)',
      frameworks: ['DPDPA']
    },
    {
      term: 'Data Fiduciary',
      definition: 'Any person who alone or in conjunction with other persons determines the purpose and means of processing of Personal Data.',
      source: 'DPDPA Section 2(i)',
      frameworks: ['DPDPA']
    },
    {
      term: 'Significant Data Fiduciary',
      definition: 'A Data Fiduciary or class of Data Fiduciaries notified by the Central Government based on an assessment of factors including volume and sensitivity of Personal Data processed, risk to the rights of Data Principals, potential impact on sovereignty and integrity of India, risk to electoral democracy, security of the State, and public order.',
      source: 'DPDPA Section 10',
      frameworks: ['DPDPA']
    },
    {
      term: 'Sensitive Personal Data (DPDPA)',
      definition: 'Personal Data which relates to financial data, health data, official identifiers, sexual orientation, biometric data, genetic data, transgender status, intersex status, caste or tribe, religious or political belief, or any other data category designated as sensitive by the Central Government.',
      source: 'DPDPA Section 2(1)',
      frameworks: ['DPDPA']
    },
    {
      term: 'Consent Manager',
      definition: 'A person registered with the Data Protection Board of India who acts as a single point of contact to enable a Data Principal to give, manage, review, and withdraw consent through an accessible, transparent, and interoperable platform.',
      source: 'DPDPA Section 2(g)',
      frameworks: ['DPDPA']
    },
    {
      term: 'Grievance Officer',
      definition: 'A designated officer appointed by the Data Fiduciary to address the grievances of Data Principals in relation to the processing of their Personal Data, and to serve as the primary point of contact for compliance inquiries.',
      source: 'DPDPA Section 2',
      frameworks: ['DPDPA']
    },
    {
      term: 'Data Protection Board of India',
      definition: 'The adjudicatory body established under the Digital Personal Data Protection Act to determine questions of non-compliance, impose penalties, and hear complaints from Data Principals.',
      source: 'DPDPA Section 18',
      frameworks: ['DPDPA']
    },

    // ── ISO 27001 ─────────────────────────────────────────────────────────────
    {
      term: 'Information Security',
      definition: 'The preservation of confidentiality, integrity, and availability of information. In addition, other properties such as authenticity, accountability, non-repudiation, and reliability can also be involved.',
      source: 'ISO 27001 Section 3.28',
      frameworks: ['ISO 27001']
    },
    {
      term: 'Confidentiality',
      definition: 'The property that information is not made available or disclosed to unauthorised individuals, entities, or processes.',
      source: 'ISO 27001 Section 3.10',
      frameworks: ['ISO 27001', 'SOC 2']
    },
    {
      term: 'Integrity',
      definition: 'The property of accuracy and completeness of information and its associated processing methods.',
      source: 'ISO 27001 Section 3.36',
      frameworks: ['ISO 27001', 'SOC 2']
    },
    {
      term: 'Availability',
      definition: 'The property of being accessible and usable upon demand by an authorised entity.',
      source: 'ISO 27001 Section 3.7',
      frameworks: ['ISO 27001', 'SOC 2']
    },
    {
      term: 'Risk',
      definition: 'The effect of uncertainty on objectives, expressed in terms of a combination of the consequences of an event and the associated likelihood of occurrence.',
      source: 'ISO 31000 Section 3.1',
      frameworks: ['ISO 27001', 'NIST CSF']
    },
    {
      term: 'Risk Assessment',
      definition: 'The overall process of risk identification, risk analysis, and risk evaluation, conducted to determine the nature and extent of information security risks and to establish appropriate risk treatment measures.',
      source: 'ISO 27001 Section 3.50',
      frameworks: ['ISO 27001', 'NIST CSF']
    },
    {
      term: 'Risk Treatment',
      definition: 'The process of selecting and implementing measures to modify risk, including risk avoidance, risk mitigation through controls, risk transfer (e.g., insurance or contractual arrangements), and informed risk acceptance.',
      source: 'ISO 27001 Section 3.52',
      frameworks: ['ISO 27001', 'NIST CSF']
    },
    {
      term: 'Asset',
      definition: 'Anything that has value to the organisation, including information assets, software assets, physical assets, services, people, intangibles (such as reputation), and associated processing facilities.',
      source: 'ISO 27001 Section 3.2',
      frameworks: ['ISO 27001']
    },
    {
      term: 'Incident',
      definition: 'A single or series of unwanted or unexpected information security events that have a significant probability of compromising business operations and threatening information security.',
      source: 'ISO 27001 Section 3.31',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Vulnerability',
      definition: 'A weakness of an asset or group of assets that can be exploited by one or more threats, potentially resulting in unauthorised access, disclosure, modification, or destruction of information.',
      source: 'ISO 27001 Section 3.77',
      frameworks: ['ISO 27001', 'NIST CSF']
    },
    {
      term: 'Threat',
      definition: 'A potential cause of an unwanted incident, which may result in harm to a system, organisation, or individual through the exploitation of a vulnerability.',
      source: 'ISO 27001 Section 3.74',
      frameworks: ['ISO 27001', 'NIST CSF']
    },

    // ── ISO 27701 ─────────────────────────────────────────────────────────────
    {
      term: 'Privacy Information Management System (PIMS)',
      definition: 'An extension to the Information Security Management System (ISMS) that incorporates additional requirements related to the processing of personally identifiable information (PII) and the protection of privacy.',
      source: 'ISO 27701 Section 3',
      frameworks: ['ISO 27701']
    },
    {
      term: 'PII Controller',
      definition: 'The privacy stakeholder that determines the purposes and means for processing personally identifiable information (PII), other than natural persons who use data for personal purposes.',
      source: 'ISO 27701 Section 3.1',
      frameworks: ['ISO 27701']
    },
    {
      term: 'PII Processor',
      definition: 'The privacy stakeholder that processes personally identifiable information (PII) on behalf of and according to the instructions of a PII Controller.',
      source: 'ISO 27701 Section 3.2',
      frameworks: ['ISO 27701']
    },

    // ── SOC 2 ─────────────────────────────────────────────────────────────────
    {
      term: 'Trust Services Criteria (TSC)',
      definition: 'The set of criteria established by the AICPA for evaluating the suitability of the design and operating effectiveness of controls relevant to the security, availability, processing integrity, confidentiality, and privacy of information and systems.',
      source: 'AICPA TSP Section 100',
      frameworks: ['SOC 2']
    },
    {
      term: 'Control Environment',
      definition: 'The set of standards, processes, and structures that provide the basis for carrying out internal control across the organisation, including the commitment to integrity, ethical values, and the exercise of oversight responsibilities.',
      source: 'AICPA SOC 2 CC1',
      frameworks: ['SOC 2']
    },
    {
      term: 'Audit Trail',
      definition: 'A chronological record that provides documentary evidence of the sequence of activities that have affected, at any time, a specific operation, procedure, event, or system resource.',
      source: 'SOC 2 CC7.2',
      frameworks: ['SOC 2', 'ISO 27001']
    },

    // ── NIST CSF ──────────────────────────────────────────────────────────────
    {
      term: 'Cybersecurity Framework Functions',
      definition: 'The five concurrent and continuous functions that constitute the NIST Cybersecurity Framework: Identify (asset management, risk assessment), Protect (access control, awareness training, data security), Detect (anomalies, continuous monitoring), Respond (response planning, communications, mitigation), and Recover (recovery planning, improvements, communications).',
      source: 'NIST CSF v1.1',
      frameworks: ['NIST CSF']
    },
    {
      term: 'Framework Profile',
      definition: 'The alignment of the NIST Cybersecurity Framework Functions, Categories, and Subcategories with the business requirements, risk tolerance, and resources of the organisation, representing the outcomes the organisation has selected to achieve.',
      source: 'NIST CSF v1.1',
      frameworks: ['NIST CSF']
    },

    // ── CROSS-FRAMEWORK ───────────────────────────────────────────────────────
    {
      term: 'Business Continuity',
      definition: 'The capability of the organisation to continue delivery of products or services at acceptable predefined levels following a disruptive incident, achieved through the implementation of documented business continuity plans, alternate processing facilities, and regular testing exercises.',
      source: 'ISO 22301 Section 3.3',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Disaster Recovery',
      definition: 'The process, policies, and procedures related to preparing for recovery or continuation of technology infrastructure critical to an organisation after a natural or human-induced disaster, typically expressed in terms of Recovery Time Objective (RTO) and Recovery Point Objective (RPO).',
      source: 'NIST SP 800-34',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Recovery Time Objective (RTO)',
      definition: 'The targeted duration of time within which a business process must be restored after a disruption in order to avoid unacceptable consequences associated with a break in continuity.',
      source: 'ISO 22301 Section 3.9',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Recovery Point Objective (RPO)',
      definition: 'The point in time to which data must be recovered after a disruption, representing the maximum tolerable amount of data loss measured in time.',
      source: 'ISO 22301 Section 3.8',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Encryption',
      definition: 'The process of converting information or data into a cipher to prevent unauthorised access, utilising cryptographic algorithms and key management practices to ensure that only authorised parties can access the original information.',
      source: 'ISO 27001 Annex A.10',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Multi-Factor Authentication (MFA)',
      definition: 'An authentication mechanism that requires the successful presentation of two or more independent authentication factors: something the user knows (e.g., password), something the user has (e.g., hardware token), and/or something the user is (e.g., biometric verification).',
      source: 'NIST SP 800-63B',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Least Privilege',
      definition: 'The security principle requiring that each user, process, or system component be granted the minimum level of access — or permissions — needed to perform its authorised functions, and no more.',
      source: 'ISO 27001 Annex A.9.4',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    },
    {
      term: 'Third Party',
      definition: 'Any external entity — including vendors, suppliers, sub-processors, partners, and service providers — that has access to, processes, stores, or transmits organisational information or provides services that support the organisation\'s operations.',
      source: 'ISO 27001 Annex A.15',
      frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF']
    }
  ];

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  /**
   * Return all available terms.
   */
  static getAllTerms() {
    return this.DEFINITIONS.map(d => ({
      term: d.term,
      frameworks: d.frameworks,
      source: d.source
    }));
  }

  /**
   * Return definitions filtered by selected frameworks.
   * @param {string[]} selectedFrameworks - Array of framework names.
   * @returns {Array} Filtered definitions.
   */
  static getDefinitions(selectedFrameworks) {
    if (!selectedFrameworks || selectedFrameworks.length === 0) {
      return this.DEFINITIONS;
    }

    const fwSet = new Set(selectedFrameworks.map(fw => {
      if (fw === 'DPDP') return 'DPDPA';
      return fw;
    }));

    return this.DEFINITIONS.filter(d =>
      d.frameworks.some(fw => fwSet.has(fw))
    );
  }

  /**
   * Generate a formatted definitions section for a governance document.
   * @param {string[]} selectedFrameworks
   * @param {Object} profile - Company profile for placeholder resolution.
   * @returns {string} Formatted definitions text block.
   */
  static generateDefinitionsSection(selectedFrameworks, profile = {}) {
    const defs = this.getDefinitions(selectedFrameworks);
    if (defs.length === 0) return '';

    const companyName = profile.companyName || 'The Organization';
    const posture = profile.controllerProcessor || 'Processor';

    let text = '';
    const grouped = {};

    // Group by primary framework for organizational clarity
    for (const d of defs) {
      const primaryFw = d.frameworks[0];
      if (!grouped[primaryFw]) grouped[primaryFw] = [];
      grouped[primaryFw].push(d);
    }

    for (const [fw, fwDefs] of Object.entries(grouped)) {
      text += `### ${fw} Definitions\n\n`;
      for (const d of fwDefs) {
        let defText = d.definition;
        // Resolve company-specific placeholders if present
        defText = defText
          .replace(/{{COMPANY_NAME}}/g, companyName)
          .replace(/{{POSTURE}}/g, posture);

        text += `**${d.term}** — ${defText} *(${d.source})*\n\n`;
      }
    }

    return text;
  }

  /**
   * Return a count of how many definitions are available for given frameworks.
   * @param {string[]} selectedFrameworks
   * @returns {number}
   */
  static getDefinitionCount(selectedFrameworks) {
    return this.getDefinitions(selectedFrameworks).length;
  }
}
