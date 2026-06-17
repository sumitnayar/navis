// Navis Clause Library — Definitions Clauses
// Wave 3.6: Institutional Quality Governance Documents
// Domain: definitions | Section: 4 (Definitions)
// Total Clauses: 25

export const DEFINITIONS_CLAUSES = [

  // ═══════════════════════════════════════════════════════════════════════════
  // GDPR CORE DEFINITIONS (5 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-gdpr-001",
    name: "GDPR Core Data Subjects and Roles",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["GDPR"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Article 4 of Regulation (EU) 2016/679 (General Data Protection Regulation):\n\n" +
      "1. \"Personal Data\" shall mean any information relating to an identified or identifiable natural person (\"Data Subject\"); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person.\n\n" +
      "2. \"Data Subject\" shall mean any identified or identifiable natural person whose Personal Data is collected, held, or processed by {{COMPANY_NAME}} in the course of its business operations, including but not limited to employees, customers, vendors, and end users.\n\n" +
      "3. \"Data Controller\" shall mean the natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of Personal Data. Where {{COMPANY_NAME}} determines the purposes and means of processing, it shall be regarded as the Data Controller.\n\n" +
      "4. \"Data Processor\" shall mean a natural or legal person, public authority, agency, or other body which processes Personal Data on behalf of the Data Controller. Where {{COMPANY_NAME}} processes Personal Data solely under the documented instructions of a third-party controller, it shall be regarded as a Data Processor.",
    rationale:
      "These foundational definitions derive directly from GDPR Article 4(1), 4(7), and 4(8). Establishing precise role designations is critical for determining obligations under Articles 24–29 (Controller and Processor responsibilities) and ensuring contractual clarity in Data Processing Agreements under Article 28."
  },

  {
    id: "cl-def-gdpr-002",
    name: "GDPR Processing Operations and Special Categories",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["GDPR"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Articles 4 and 9 of Regulation (EU) 2016/679:\n\n" +
      "1. \"Processing\" shall mean any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, including but not limited to collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.\n\n" +
      "2. \"Special Categories of Personal Data\" shall mean Personal Data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data processed for the purpose of uniquely identifying a natural person, data concerning health, or data concerning a natural person's sex life or sexual orientation. {{COMPANY_NAME}} shall not process Special Categories of Personal Data unless a lawful basis under Article 9(2) has been documented and approved by the {{DPO_OFFICER}}.\n\n" +
      "3. \"Profiling\" shall mean any form of automated processing of Personal Data consisting of the use of Personal Data to evaluate certain personal aspects relating to a natural person, in particular to analyse or predict aspects concerning that natural person's performance at work, economic situation, health, personal preferences, interests, reliability, behaviour, location, or movements.",
    rationale:
      "The definition of 'Processing' under GDPR Article 4(2) is intentionally broad and must be reproduced in full to prevent scope gaps. Special Categories under Article 9(1) carry heightened obligations requiring explicit lawful bases under Article 9(2). Profiling under Article 4(4) triggers additional transparency obligations under Article 22 and Recital 71."
  },

  {
    id: "cl-def-gdpr-003",
    name: "GDPR Consent Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["GDPR"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    controllerProcessor: "controller",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions governing consent shall apply in accordance with Article 4(11) and Article 7 of Regulation (EU) 2016/679:\n\n" +
      "1. \"Consent\" shall mean any freely given, specific, informed, and unambiguous indication of the Data Subject's wishes by which he or she, by a statement or by a clear affirmative action, signifies agreement to the processing of Personal Data relating to him or her. Consent must not be bundled with acceptance of terms and conditions, must not be a precondition for the provision of a service unless processing is strictly necessary for that service, and must be as easy to withdraw as to give.\n\n" +
      "2. \"Explicit Consent\" shall mean consent that is given by an express, affirmative statement — whether written, electronic, or oral (where recorded and verifiable) — that unambiguously confirms the Data Subject's agreement to a specified processing activity. Explicit Consent is required by {{COMPANY_NAME}} for (a) the processing of Special Categories of Personal Data under Article 9(2)(a), (b) automated individual decision-making including Profiling under Article 22(2)(c), and (c) cross-border transfers of Personal Data to third countries lacking an adequacy decision under Article 49(1)(a).",
    rationale:
      "Consent under GDPR Article 4(11) must satisfy four cumulative conditions: freely given, specific, informed, and unambiguous. Article 7 prescribes conditions for demonstrable consent and the right of withdrawal. Explicit Consent is a higher standard required under Articles 9, 22, and 49, and must be clearly differentiated from standard consent in organisational policies to prevent non-compliance."
  },

  {
    id: "cl-def-gdpr-004",
    name: "GDPR Breach and Supervisory Authority Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["GDPR"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Article 4(12) and Article 4(21) of Regulation (EU) 2016/679:\n\n" +
      "1. \"Personal Data Breach\" shall mean a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, Personal Data transmitted, stored, or otherwise processed. A Personal Data Breach encompasses confidentiality breaches (unauthorised or accidental disclosure of, or access to, Personal Data), integrity breaches (unauthorised or accidental alteration of Personal Data), and availability breaches (accidental or unauthorised loss of access to, or destruction of, Personal Data). {{COMPANY_NAME}} shall classify and respond to all Personal Data Breaches in accordance with its Incident Response Policy and the notification obligations prescribed under Articles 33 and 34.\n\n" +
      "2. \"Supervisory Authority\" shall mean an independent public authority established by an EU Member State pursuant to Article 51, responsible for monitoring the application of the GDPR. For the purposes of {{COMPANY_NAME}}'s operations, the Lead Supervisory Authority shall be determined based on the location of the organisation's main establishment or, where the organisation has no establishment in the EU, the Supervisory Authority of the Member State where Data Subjects are most substantially affected.",
    rationale:
      "The tripartite classification of Personal Data Breaches (confidentiality, integrity, availability) aligns with ENISA and WP29 Guidelines on Personal Data Breach Notification (WP250 rev.01). Precise definition of Supervisory Authority under Article 4(21) and the one-stop-shop mechanism under Articles 56–60 is essential for organisations operating across multiple EU jurisdictions."
  },

  {
    id: "cl-def-gdpr-005",
    name: "GDPR Accountability and Impact Assessment Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["GDPR"],
    jurisdiction: ["EU"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Articles 25, 30, and 35 of Regulation (EU) 2016/679:\n\n" +
      "1. \"Data Protection Impact Assessment\" (\"DPIA\") shall mean a systematic assessment of the potential impact of envisaged processing operations on the protection of Personal Data, conducted prior to the commencement of processing that is likely to result in a high risk to the rights and freedoms of natural persons. {{COMPANY_NAME}} shall conduct DPIAs for all processing activities that involve (a) systematic and extensive evaluation of personal aspects based on automated processing including Profiling, (b) processing on a large scale of Special Categories of Personal Data, or (c) systematic monitoring of a publicly accessible area on a large scale.\n\n" +
      "2. \"Records of Processing Activities\" (\"ROPA\") shall mean the comprehensive, written documentation maintained by {{COMPANY_NAME}} — whether acting as Controller or Processor — describing all categories of processing activities carried out under its responsibility, including the purposes of processing, categories of Data Subjects and Personal Data, categories of recipients, international transfers, retention periods, and a general description of technical and organisational security measures.\n\n" +
      "3. \"Data Protection by Design and by Default\" shall mean the implementation, at the time of determination of the means for processing and at the time of the processing itself, of appropriate technical and organisational measures — such as pseudonymisation, data minimisation, and access controls — designed to implement data protection principles and to integrate necessary safeguards into the processing, ensuring that by default only Personal Data which is necessary for each specific purpose of the processing is processed.",
    rationale:
      "DPIA requirements under Article 35 and WP29 Guidelines (WP248 rev.01) mandate pre-processing risk assessments for high-risk activities. ROPA under Article 30 is a core accountability obligation applicable to controllers and processors with more than 250 employees or engaging in non-occasional processing. Data Protection by Design under Article 25 operationalises the accountability principle of Article 5(2) and is increasingly scrutinised in regulatory enforcement actions."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DPDPA DEFINITIONS (4 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-dpdpa-001",
    name: "DPDPA Data Principal and Fiduciary Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["DPDPA"],
    jurisdiction: ["India"],
    industry: ["Global"],
    controllerProcessor: "controller",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Section 2 of the Digital Personal Data Protection Act, 2023 (India):\n\n" +
      "1. \"Data Principal\" shall mean the individual to whom the Personal Data relates, and in the case of (a) a child, the parent or lawful guardian of such child, and (b) a person with a disability, the lawful guardian acting on behalf of such person. All references to the rights of Data Principals within this Policy shall extend to such lawful guardians where applicable.\n\n" +
      "2. \"Data Fiduciary\" shall mean any person who, alone or in conjunction with other persons, determines the purpose and means of processing of Personal Data. Where {{COMPANY_NAME}} determines the purpose and means of processing Personal Data of individuals within the territory of India, or Personal Data processed in connection with the offering of goods or services to Data Principals within India, {{COMPANY_NAME}} shall be regarded as a Data Fiduciary.\n\n" +
      "3. \"Significant Data Fiduciary\" shall mean a Data Fiduciary or class of Data Fiduciaries as notified by the Central Government under Section 10, based on an assessment of factors including the volume and sensitivity of Personal Data processed, risk to the rights of Data Principals, potential impact on the sovereignty and integrity of India, risk to electoral democracy, security of the State, and public order. Where {{COMPANY_NAME}} is designated or reasonably expects designation as a Significant Data Fiduciary, enhanced obligations including the appointment of a Data Protection Officer and an independent data auditor shall apply.",
    rationale:
      "The DPDPA §2(j) definition of Data Principal extends custodial rights to parents and lawful guardians, creating distinct obligations for processing children's data under Section 9. The Significant Data Fiduciary designation under Section 10 triggers additional compliance obligations that must be anticipated in organisational governance frameworks, including mandatory DPO appointment and periodic audit requirements."
  },

  {
    id: "cl-def-dpdpa-002",
    name: "DPDPA Personal Data and Processing Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["DPDPA"],
    jurisdiction: ["India"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Section 2 of the Digital Personal Data Protection Act, 2023 (India):\n\n" +
      "1. \"Personal Data\" shall mean any data about an individual who is identifiable by or in relation to such data. For the avoidance of doubt, Personal Data under the DPDPA encompasses data in digital form, as well as non-digital data that is subsequently digitised. {{COMPANY_NAME}} shall treat all data capable of identifying an individual — whether directly or through combination with other available data — as Personal Data for the purposes of this Policy.\n\n" +
      "2. \"Processing\" shall mean, in relation to Personal Data, any wholly or partly automated operation or set of operations performed on digital Personal Data, including collection, recording, organisation, structuring, storage, adaptation, retrieval, use, alignment or combination, indexing, sharing, disclosure by transmission, dissemination or otherwise making available, restriction, erasure, or destruction.\n\n" +
      "3. \"Consent\" shall mean consent given by the Data Principal, which is free, specific, informed, unconditional, unambiguous, and signified by a clear affirmative action, for a specified purpose. {{COMPANY_NAME}} shall obtain Consent through a notice that is presented in clear and plain language, itemises the Personal Data to be collected and the purpose of processing, and provides the means for the Data Principal to withdraw Consent with the same ease with which it was given.",
    rationale:
      "DPDPA §2(t) defines Personal Data with specific reference to digital form, reflecting the Act's focus on digital data processing ecosystems. The definition of Consent under §2(e) and the notice requirements under Section 5 impose stricter conditions than many global equivalents, requiring that consent be 'unconditional' — prohibiting consent bundled with unrelated terms or conditioned upon service access where processing is not strictly necessary."
  },

  {
    id: "cl-def-dpdpa-003",
    name: "DPDPA Processor and Sub-processor Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["DPDPA"],
    jurisdiction: ["India"],
    industry: ["Global"],
    controllerProcessor: "processor",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with Section 2 of the Digital Personal Data Protection Act, 2023 (India):\n\n" +
      "1. \"Data Processor\" shall mean any person who processes Personal Data on behalf of a Data Fiduciary. Where {{COMPANY_NAME}} engages third-party service providers — including cloud infrastructure providers, analytics platforms, and managed service operators — to process Personal Data on its behalf, such entities shall be classified as Data Processors and shall be contractually bound to process Personal Data solely in accordance with the instructions of {{COMPANY_NAME}} as Data Fiduciary.\n\n" +
      "2. \"Sub-processor\" shall mean any Data Processor engaged by another Data Processor to carry out specific processing activities on behalf of the Data Fiduciary. {{COMPANY_NAME}} shall maintain a register of all Sub-processors, shall ensure that equivalent contractual obligations are imposed upon each Sub-processor, and shall remain accountable for the acts and omissions of its Sub-processors in accordance with the obligations of the Data Fiduciary under the Act.",
    rationale:
      "The DPDPA §2(k) definition of Data Processor places accountability squarely on the Data Fiduciary for all downstream processing. While the Act does not explicitly define 'Sub-processor,' institutional governance frameworks must address multi-tier processing chains to ensure that contractual and technical controls extend through the full data processing lifecycle, consistent with the accountability obligations under Section 8."
  },

  {
    id: "cl-def-dpdpa-004",
    name: "DPDPA Institutional Roles and Oversight Bodies",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["DPDPA"],
    jurisdiction: ["India"],
    industry: ["Global"],
    controllerProcessor: "controller",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the Digital Personal Data Protection Act, 2023 (India):\n\n" +
      "1. \"Grievance Officer\" shall mean the individual appointed by {{COMPANY_NAME}} under Section 8(10) to serve as the designated point of contact for Data Principals seeking to exercise their rights under the Act, including the right to access information about processing, the right to correction and erasure, and the right to grievance redressal. The Grievance Officer, currently designated as {{GRIEVANCE_OFFICER}}, shall acknowledge grievances within the prescribed timeline and resolve them in accordance with the organisation's Data Subject Rights Procedure.\n\n" +
      "2. \"Consent Manager\" shall mean an entity registered with the Data Protection Board of India that acts as a single point of contact to enable Data Principals to give, manage, review, and withdraw Consent through an accessible, transparent, and interoperable platform. Where {{COMPANY_NAME}} utilises a Consent Manager, it shall ensure that such entity is duly registered and meets the technical and operational standards prescribed by the Central Government.\n\n" +
      "3. \"Data Protection Board of India\" (\"DPBI\") shall mean the adjudicatory body established under Chapter IV of the Act, empowered to receive complaints from Data Principals, conduct inquiries into non-compliance, and impose penalties upon Data Fiduciaries and Significant Data Fiduciaries for violations of the Act. {{COMPANY_NAME}} shall cooperate fully with any inquiry, direction, or order issued by the Data Protection Board of India.",
    rationale:
      "The Grievance Officer obligation under DPDPA Section 8(10) is a mandatory compliance requirement for all Data Fiduciaries. The Consent Manager concept under Section 2(f) introduces a novel intermediary role in the Indian data protection ecosystem. Clear definition of the DPBI's jurisdiction and enforcement powers under Sections 18–28 is essential for organisational preparedness and board-level risk communication."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ISO 27001 DEFINITIONS (4 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-iso27001-001",
    name: "ISO 27001 Information Security Triad Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27001:2022, Clause 3, and ISO/IEC 27000:2018:\n\n" +
      "1. \"Information Security\" shall mean the preservation of confidentiality, integrity, and availability of information. Information Security extends to the protection of information in all forms — digital, physical, and verbal — and encompasses the policies, procedures, technical controls, and organisational structures implemented by {{COMPANY_NAME}} to manage information-related risks.\n\n" +
      "2. \"Confidentiality\" shall mean the property that information is not made available or disclosed to unauthorised individuals, entities, or processes. {{COMPANY_NAME}} shall enforce confidentiality through access control mechanisms, encryption, non-disclosure obligations, and information classification protocols.\n\n" +
      "3. \"Integrity\" shall mean the property of accuracy and completeness of information and processing methods. {{COMPANY_NAME}} shall implement controls to prevent unauthorised modification of information, including input validation, checksums, audit trails, and change management procedures.\n\n" +
      "4. \"Availability\" shall mean the property of being accessible and usable on demand by an authorised entity. {{COMPANY_NAME}} shall ensure the availability of critical information systems through redundancy, business continuity planning, and service level management in accordance with its operational requirements.",
    rationale:
      "The CIA triad (Confidentiality, Integrity, Availability) constitutes the foundational principle of ISO/IEC 27001:2022 and underpins the entire Information Security Management System (ISMS). These definitions align with ISO/IEC 27000:2018 §3.28 (Information Security), §3.10 (Confidentiality), §3.36 (Integrity), and §3.7 (Availability), and must be explicitly stated to establish the scope of the ISMS."
  },

  {
    id: "cl-def-iso27001-002",
    name: "ISO 27001 Risk Management Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001", "ISO 31000"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27001:2022, Clause 3, and ISO 31000:2018:\n\n" +
      "1. \"Risk\" shall mean the effect of uncertainty on objectives. In the context of information security, risk is characterised by reference to potential events, their consequences (impact), and their likelihood of occurrence. {{COMPANY_NAME}} shall express risk in terms of a combination of the consequences of an event and the associated likelihood.\n\n" +
      "2. \"Risk Assessment\" shall mean the overall process of risk identification, risk analysis, and risk evaluation. {{COMPANY_NAME}} shall conduct Risk Assessments at planned intervals and upon significant changes to the information environment, ensuring that the methodology produces consistent, valid, and comparable results.\n\n" +
      "3. \"Risk Treatment\" shall mean the process of selecting and implementing measures to modify risk. Risk Treatment options shall include (a) applying controls to mitigate risk, (b) accepting risk in accordance with documented risk acceptance criteria approved by the Risk Owner, (c) avoiding risk by eliminating the source or ceasing the activity, and (d) transferring risk through insurance or contractual arrangements.\n\n" +
      "4. \"Risk Owner\" shall mean the person or entity with the accountability and authority to manage a specific risk. {{COMPANY_NAME}} shall assign a Risk Owner for every risk identified within the Information Security Risk Register, and each Risk Owner shall be accountable for monitoring and reviewing the effectiveness of risk treatment measures within their domain.",
    rationale:
      "Risk-based thinking is the central methodology of ISO/IEC 27001:2022, with Clauses 6.1.2 and 8.2 mandating structured risk assessment processes. The definitions align with ISO 31000:2018 (Risk Management — Guidelines) and ISO/IEC 27005 (Information Security Risk Management). Explicit assignment of Risk Owners satisfies Clause 6.1.2(a)(2) and is a common audit finding when not clearly documented."
  },

  {
    id: "cl-def-iso27001-003",
    name: "ISO 27001 Information Asset Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27001:2022, Clause 3, and Annex A:\n\n" +
      "1. \"Asset\" shall mean any item that has value to {{COMPANY_NAME}} and requires protection. Assets shall encompass information assets, supporting assets (hardware, software, network infrastructure), human assets (personnel with critical knowledge or access), and intangible assets (reputation, brand, intellectual property).\n\n" +
      "2. \"Information Asset\" shall mean any data, information, or knowledge — regardless of form or medium — that is of value to {{COMPANY_NAME}}. Information Assets shall include, but are not limited to, databases, data files, system documentation, user manuals, training materials, operational procedures, business continuity plans, contracts, audit records, and intellectual property.\n\n" +
      "3. \"Information Classification\" shall mean the systematic categorisation of information assets based on their level of sensitivity and the impact that unauthorised disclosure, modification, or unavailability would have on {{COMPANY_NAME}}'s operations, legal obligations, or reputation. {{COMPANY_NAME}} shall maintain a classification scheme comprising the following levels: (a) Confidential — information whose unauthorised disclosure would cause significant harm; (b) Internal — information intended for internal use only; (c) Public — information approved for unrestricted dissemination.",
    rationale:
      "ISO/IEC 27001:2022 Annex A Control A.5.9 (Inventory of Information and Other Associated Assets) and A.5.12 (Classification of Information) require organisations to identify, classify, and protect information assets. A clearly defined classification scheme is a prerequisite for implementing proportionate controls and is routinely assessed during certification audits."
  },

  {
    id: "cl-def-iso27001-004",
    name: "ISO 27001 Incident and Threat Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27001:2022, Clause 3, and ISO/IEC 27035:\n\n" +
      "1. \"Information Security Incident\" shall mean a single or a series of unwanted or unexpected information security events that have a significant probability of compromising business operations and threatening information security. {{COMPANY_NAME}} shall classify incidents by severity level and initiate response procedures in accordance with its Incident Response Policy.\n\n" +
      "2. \"Information Security Event\" shall mean an identified occurrence of a system, service, or network state indicating a possible breach of information security policy or failure of controls, or a previously unknown situation that may be security-relevant. Not all security events constitute incidents; events shall be assessed and triaged to determine whether escalation to incident status is warranted.\n\n" +
      "3. \"Vulnerability\" shall mean a weakness of an asset or control that can be exploited by one or more threats. {{COMPANY_NAME}} shall maintain a vulnerability management programme that includes regular scanning, prioritised remediation based on exploitability and impact, and validation of remediation effectiveness.\n\n" +
      "4. \"Threat\" shall mean a potential cause of an unwanted incident, which may result in harm to a system, organisation, or individual. Threats shall encompass natural events (flood, earthquake), human actions (malicious attack, insider threat, social engineering), and technical failures (hardware malfunction, software defect).",
    rationale:
      "The distinction between Information Security Events and Incidents (ISO/IEC 27000:2018 §3.30 and §3.31) is foundational for effective triage and proportionate response. Vulnerability management aligns with Annex A Control A.8.8 (Management of Technical Vulnerabilities). The threat taxonomy supports the risk identification requirements under Clause 6.1.2 and ISO/IEC 27005."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ISO 27701 DEFINITIONS (3 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-iso27701-001",
    name: "ISO 27701 PII and Privacy Roles Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27701", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27701:2019, Clause 3:\n\n" +
      "1. \"Personally Identifiable Information\" (\"PII\") shall mean any information that (a) can be used to establish a link between the information and the natural person to whom such information relates, or (b) is or can be directly or indirectly linked to a natural person. PII as defined under ISO/IEC 27701 shall be treated as equivalent to \"Personal Data\" under Regulation (EU) 2016/679 and \"Personal Data\" under the Digital Personal Data Protection Act, 2023 (India), for the purposes of {{COMPANY_NAME}}'s governance framework.\n\n" +
      "2. \"PII Controller\" shall mean the privacy stakeholder that determines the purposes and means for processing PII. The PII Controller designation under ISO/IEC 27701 is functionally equivalent to the GDPR \"Data Controller\" and the DPDPA \"Data Fiduciary.\" {{COMPANY_NAME}} shall fulfil all PII Controller obligations specified in Clause 7 of ISO/IEC 27701:2019.\n\n" +
      "3. \"PII Processor\" shall mean the privacy stakeholder that processes PII on behalf of and in accordance with the instructions of a PII Controller. {{COMPANY_NAME}} shall fulfil all PII Processor obligations specified in Clause 8 of ISO/IEC 27701:2019, including maintaining documented instructions, ensuring confidentiality of processing personnel, and notifying the PII Controller of any PII breach without undue delay.",
    rationale:
      "ISO/IEC 27701:2019 §3.1 and §3.2 provide framework-agnostic definitions of PII, PII Controller, and PII Processor that map to jurisdiction-specific roles under GDPR and DPDPA. Establishing these equivalencies within the policy eliminates interpretive ambiguity when operating under multi-jurisdictional compliance obligations and supports the organisation's Privacy Information Management System (PIMS) certification scope."
  },

  {
    id: "cl-def-iso27701-002",
    name: "ISO 27701 Privacy Information Management System Definition",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27701", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definition shall apply in accordance with ISO/IEC 27701:2019, Clause 3:\n\n" +
      "1. \"Privacy Information Management System\" (\"PIMS\") shall mean the extension of the Information Security Management System (ISMS) established under ISO/IEC 27001 to incorporate the management of privacy, including the processing of PII. The PIMS encompasses the policies, procedures, guidelines, resources, and activities jointly managed by {{COMPANY_NAME}} to protect PII processing in accordance with applicable legal, regulatory, and contractual requirements. The PIMS shall integrate with the existing ISMS and shall not operate as a standalone governance structure, ensuring that information security and privacy controls are aligned, co-managed, and subject to unified risk assessment, internal audit, and management review processes.",
    rationale:
      "ISO/IEC 27701:2019 is structured as an extension of ISO/IEC 27001, not a standalone standard. The PIMS definition establishes the architectural relationship between the ISMS and privacy management, which is critical for integrated certification, audit scope definition, and resource allocation. Board-level governance must recognise that PIMS obligations extend the existing ISMS rather than creating parallel compliance infrastructure."
  },

  {
    id: "cl-def-iso27701-003",
    name: "ISO 27701 Privacy Impact and Privacy by Design Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27701", "ISO 27001", "GDPR"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "controller",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO/IEC 27701:2019, Clause 3, and ISO/IEC 29134:\n\n" +
      "1. \"Privacy Impact Assessment\" (\"PIA\") shall mean a systematic process for evaluating the potential effects that a proposed project, system, programme, or initiative may have on the privacy of individuals whose PII is processed. {{COMPANY_NAME}} shall conduct PIAs prior to the deployment of any new processing activity, technology, or vendor engagement that involves PII. The PIA process shall identify privacy risks, evaluate their severity and likelihood, and prescribe proportionate mitigation measures. Where the processing activity is subject to GDPR jurisdiction, the PIA shall incorporate the requirements of a Data Protection Impact Assessment under Article 35.\n\n" +
      "2. \"Privacy by Design\" shall mean the principle of embedding privacy protections into the design specifications, architecture, and operational procedures of information systems and business processes from the earliest stage of development. {{COMPANY_NAME}} shall require that all new systems, products, and services undergo a Privacy by Design review prior to deployment, ensuring that (a) data minimisation is applied by default, (b) PII is pseudonymised or anonymised where feasible, (c) access to PII is limited to authorised personnel on a need-to-know basis, and (d) retention periods are enforced automatically through technical controls.",
    rationale:
      "PIA requirements under ISO/IEC 27701:2019 Clause 7.2.5 and ISO/IEC 29134 complement GDPR Article 35 DPIA obligations. Privacy by Design under ISO/IEC 27701 Clause 7.4 operationalises the principle codified in GDPR Article 25 and recognised as a global best practice by privacy authorities including the Canadian OPC and Singapore PDPC. Embedding these definitions ensures that privacy engineering is a structural requirement, not a post-hoc remediation."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOC 2 DEFINITIONS (3 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-soc2-001",
    name: "SOC 2 Trust Services Criteria Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["SOC 2"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech", "Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the AICPA Trust Services Criteria (TSP Section 100, 2017 revision):\n\n" +
      "1. \"Trust Services Criteria\" (\"TSC\") shall mean the set of control criteria established by the American Institute of Certified Public Accountants (AICPA) for evaluating the suitability of the design and operating effectiveness of controls relevant to the security, availability, processing integrity, confidentiality, and privacy of information and systems. {{COMPANY_NAME}} shall align its internal controls with the applicable TSC categories as determined by the scope of its SOC 2 engagement.\n\n" +
      "2. \"Common Criteria\" (\"CC\") shall mean the foundational set of criteria within the Trust Services Criteria that apply across all SOC 2 engagements, organised into the following domains: CC1 — Control Environment; CC2 — Communication and Information; CC3 — Risk Assessment; CC4 — Monitoring Activities; CC5 — Control Activities; CC6 — Logical and Physical Access Controls; CC7 — System Operations; CC8 — Change Management; CC9 — Risk Mitigation. The Common Criteria are mandatory for all SOC 2 Type I and Type II reports and form the baseline control framework against which {{COMPANY_NAME}}'s operational controls are assessed.",
    rationale:
      "The AICPA TSP Section 100 Trust Services Criteria underpin all SOC 2 engagements. Clear definition of TSC and Common Criteria is essential for scoping SOC 2 readiness assessments, mapping internal controls to criteria, and communicating audit scope to external auditors and relying parties. The nine CC domains provide the structural framework for control documentation and testing."
  },

  {
    id: "cl-def-soc2-002",
    name: "SOC 2 Control Environment and Activities Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["SOC 2"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech", "Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with AICPA standards and the COSO Internal Control — Integrated Framework:\n\n" +
      "1. \"Control Environment\" shall mean the set of standards, processes, and structures that provide the foundation for carrying out internal control across {{COMPANY_NAME}}. The Control Environment encompasses the organisation's commitment to integrity and ethical values, the board of directors' and management's oversight responsibilities, the organisational structure and assignment of authority and responsibility, the processes for attracting, developing, and retaining competent individuals, and the rigour around performance measures, incentives, and rewards to drive accountability for the expected standards of conduct.\n\n" +
      "2. \"Control Activities\" shall mean the actions established through policies and procedures that help ensure that management's directives to mitigate risks to the achievement of objectives are carried out. Control Activities shall include, but are not limited to, authorisation and approval procedures, segregation of duties, verification and reconciliation processes, physical and logical access restrictions, and supervisory reviews. Control Activities are performed at all levels of {{COMPANY_NAME}} and at various stages within business processes, and shall be documented, tested, and evidenced in support of SOC 2 examination requirements.",
    rationale:
      "The Control Environment (CC1) and Control Activities (CC5) are core components of the COSO Internal Control Framework referenced by SOC 2 Common Criteria. CC1 establishes the 'tone at the top' that auditors evaluate first during SOC 2 examinations. CC5 Control Activities represent the operational controls that are tested for design suitability and operating effectiveness in SOC 2 Type II engagements."
  },

  {
    id: "cl-def-soc2-003",
    name: "SOC 2 Access, Audit Trail, and System Boundary Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["SOC 2"],
    jurisdiction: ["Global"],
    industry: ["SaaS", "FinTech", "Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the SOC 2 framework and AICPA guidance:\n\n" +
      "1. \"Logical Access\" shall mean the ability to interact with information systems and data through electronic means, governed by authentication and authorisation controls. {{COMPANY_NAME}} shall restrict Logical Access to information systems based on the principles of least privilege and need-to-know, enforce multi-factor authentication for access to critical systems, and conduct periodic access reviews at intervals not exceeding ninety (90) days.\n\n" +
      "2. \"Audit Trail\" shall mean the chronological record of system activities, including user actions, system events, administrative changes, and security-relevant transactions, sufficient to enable the reconstruction, review, and examination of the sequence of events surrounding or leading to each activity. {{COMPANY_NAME}} shall maintain Audit Trails for all in-scope systems, protect them from unauthorised modification or deletion, and retain them for a minimum period consistent with regulatory requirements and the organisation's records retention policy.\n\n" +
      "3. \"System Boundary\" shall mean the delineation of the infrastructure, software, people, procedures, and data that comprise the system for which the SOC 2 report is issued. {{COMPANY_NAME}} shall define and maintain a documented System Boundary that clearly identifies all components within the scope of the SOC 2 examination, including subservice organisations, cloud infrastructure providers, and any carve-out or inclusive method designations.",
    rationale:
      "Logical Access controls are assessed under Common Criteria CC6 and are among the most frequently cited areas of deficiency in SOC 2 examinations. Audit Trail requirements support CC4 (Monitoring Activities) and CC7 (System Operations). The System Boundary definition is a prerequisite for the SOC 2 system description (DC Section 200) and determines which controls are within the scope of the auditor's examination."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIST CSF DEFINITIONS (3 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-nist-001",
    name: "NIST CSF Core Functions Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the NIST Cybersecurity Framework (CSF) Version 2.0:\n\n" +
      "1. \"Identify\" (ID) shall mean the function that develops the organisational understanding to manage cybersecurity risk to systems, assets, data, and capabilities. Activities within the Identify function include asset management, business environment analysis, governance, risk assessment, risk management strategy, and supply chain risk management.\n\n" +
      "2. \"Protect\" (PR) shall mean the function that develops and implements appropriate safeguards to ensure delivery of critical infrastructure services. Activities within the Protect function include identity management and access control, awareness and training, data security, information protection processes and procedures, maintenance, and protective technology.\n\n" +
      "3. \"Detect\" (DE) shall mean the function that develops and implements appropriate activities to identify the occurrence of a cybersecurity event. Activities within the Detect function include anomalies and events detection, security continuous monitoring, and detection processes.\n\n" +
      "4. \"Respond\" (RS) shall mean the function that develops and implements appropriate activities to take action regarding a detected cybersecurity event. Activities within the Respond function include response planning, communications, analysis, mitigation, and improvements.\n\n" +
      "5. \"Recover\" (RC) shall mean the function that develops and implements appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired due to a cybersecurity event. Activities within the Recover function include recovery planning, improvements, and communications.\n\n" +
      "{{COMPANY_NAME}} shall map its cybersecurity controls and operational procedures to the five core functions of the NIST CSF to ensure comprehensive coverage and to facilitate risk-informed prioritisation of security investments.",
    rationale:
      "The five core functions of the NIST Cybersecurity Framework provide a high-level, outcome-driven taxonomy for organising cybersecurity activities. NIST CSF 2.0 adds the Govern function, but the five operational functions (Identify, Protect, Detect, Respond, Recover) remain the foundational structure. Mapping organisational controls to these functions satisfies EO 14028 requirements and facilitates cross-framework alignment with ISO 27001 and SOC 2."
  },

  {
    id: "cl-def-nist-002",
    name: "NIST CSF Profile and Tier Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the NIST Cybersecurity Framework (CSF) Version 2.0:\n\n" +
      "1. \"Framework Profile\" shall mean the alignment of the Functions, Categories, and Subcategories of the NIST CSF with the business requirements, risk tolerance, and resources of {{COMPANY_NAME}}. A Current Profile describes the cybersecurity outcomes that the organisation is currently achieving. A Target Profile describes the desired cybersecurity outcomes that the organisation has prioritised for achievement. {{COMPANY_NAME}} shall establish and maintain both a Current Profile and a Target Profile, and shall use the gap between them to inform the prioritisation and budgeting of cybersecurity initiatives.\n\n" +
      "2. \"Framework Tier\" shall mean the degree to which {{COMPANY_NAME}}'s cybersecurity risk management practices exhibit the characteristics defined by the NIST CSF. The four Tiers are: (a) Tier 1 — Partial: risk management practices are ad hoc and reactive; (b) Tier 2 — Risk Informed: risk management practices are approved by management but may not be established as organisation-wide policy; (c) Tier 3 — Repeatable: the organisation's risk management practices are formally approved and expressed as policy, and are regularly updated based on changes in risk; (d) Tier 4 — Adaptive: the organisation adapts its cybersecurity practices based on lessons learned and predictive indicators derived from previous and current cybersecurity activities. {{COMPANY_NAME}} shall target a minimum of Tier 3 (Repeatable) maturity for all critical business functions.",
    rationale:
      "Framework Profiles enable organisations to customise the NIST CSF to their specific risk environment and business context, as described in NIST CSF §3.2. Framework Tiers provide a maturity model for evaluating and communicating the sophistication of cybersecurity risk management practices to senior leadership and the board. Setting explicit tier targets demonstrates governance commitment and supports capital allocation discussions for cybersecurity programmes."
  },

  {
    id: "cl-def-nist-003",
    name: "NIST Supply Chain Risk and Continuous Monitoring Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["NIST CSF", "NIST SP 800-53", "NIST SP 800-161"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with the NIST Cybersecurity Framework and NIST Special Publications 800-53 and 800-161:\n\n" +
      "1. \"Supply Chain Risk Management\" (\"C-SCRM\") shall mean the systematic process for managing cybersecurity risk throughout the supply chain, encompassing the identification, assessment, and mitigation of risks that arise from the development, manufacturing, distribution, deployment, acquisition, maintenance, and disposal of information and communications technology (ICT) products and services. {{COMPANY_NAME}} shall integrate C-SCRM into its enterprise risk management programme and shall evaluate the cybersecurity posture of critical suppliers, vendors, and service providers prior to engagement and at regular intervals thereafter.\n\n" +
      "2. \"Continuous Monitoring\" shall mean the ongoing awareness of information security, vulnerabilities, and threats to support organisational risk management decisions. {{COMPANY_NAME}} shall implement a Continuous Monitoring strategy that includes (a) automated security status monitoring of organisational information systems and networks, (b) ongoing assessment of security control effectiveness, (c) active management of system and network configurations, (d) analysis of security-related information generated by assessments and monitoring, and (e) timely reporting of the security status of the organisation to designated officials. Monitoring frequency and scope shall be commensurate with the criticality and risk level of the information systems and data being monitored.",
    rationale:
      "C-SCRM is addressed under NIST CSF ID.SC and NIST SP 800-161 Rev. 1, reflecting the increasing regulatory focus on third-party and supply chain cybersecurity risks. Continuous Monitoring is mandated under NIST SP 800-53 CA-7 and NIST SP 800-137, and is essential for maintaining an ongoing authorisation posture. Both concepts are critical for organisations operating in regulated industries or subject to federal contractor requirements."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-FRAMEWORK DEFINITIONS (3 clauses)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-def-cross-001",
    name: "Business Continuity and Recovery Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 22301", "ISO 27001", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply in accordance with ISO 22301:2019, ISO/IEC 27001:2022, and the NIST Cybersecurity Framework:\n\n" +
      "1. \"Business Continuity\" shall mean the capability of {{COMPANY_NAME}} to continue the delivery of products and services at acceptable predefined levels following a disruptive incident. Business Continuity planning shall encompass the identification of critical business functions, the assessment of maximum tolerable periods of disruption, and the establishment of strategies to maintain or restore operations.\n\n" +
      "2. \"Disaster Recovery\" shall mean the process, policies, and procedures related to preparing for the recovery or continuation of technology infrastructure, systems, and applications critical to {{COMPANY_NAME}} after a natural or human-induced disaster. Disaster Recovery is a subset of Business Continuity and focuses specifically on the restoration of information technology systems and data.\n\n" +
      "3. \"Recovery Time Objective\" (\"RTO\") shall mean the maximum acceptable duration of time within which a business process, application, or system must be restored after a disruption to avoid unacceptable consequences. {{COMPANY_NAME}} shall establish RTOs for all critical systems based on Business Impact Analysis results and shall validate achievement of stated RTOs through periodic testing.\n\n" +
      "4. \"Recovery Point Objective\" (\"RPO\") shall mean the maximum acceptable amount of data loss measured in time — the point in time to which data must be recovered after a disruption to ensure continuity of operations. {{COMPANY_NAME}} shall establish RPOs for all critical data stores based on the business value and regulatory sensitivity of the data, and shall implement backup and replication strategies sufficient to meet stated RPOs.",
    rationale:
      "Business Continuity definitions align with ISO 22301:2019 §3 and support the resilience requirements of ISO/IEC 27001:2022 Annex A Control A.5.29 (Information Security During Disruption) and NIST CSF Recover function. RTO and RPO are quantitative metrics essential for Business Impact Analysis, infrastructure investment decisions, and service level commitments to customers and regulators."
  },

  {
    id: "cl-def-cross-002",
    name: "Cryptographic and Access Control Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001", "NIST SP 800-53", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply across all applicable frameworks including ISO/IEC 27001:2022, NIST SP 800-53, and SOC 2 Trust Services Criteria:\n\n" +
      "1. \"Encryption\" shall mean the process of converting information from a readable state (plaintext) into an encoded format (ciphertext) using a cryptographic algorithm and key, such that the information can only be decoded and read by parties possessing the corresponding decryption key. {{COMPANY_NAME}} shall apply encryption to Personal Data and confidential information both at rest and in transit, using algorithms and key lengths that meet or exceed current industry standards (AES-256 for data at rest; TLS 1.2 or higher for data in transit).\n\n" +
      "2. \"Key Management\" shall mean the set of policies, procedures, and technical controls governing the generation, distribution, storage, rotation, revocation, archival, and destruction of cryptographic keys. {{COMPANY_NAME}} shall implement a Key Management programme that ensures (a) separation of duties between key custodians, (b) use of hardware security modules (HSMs) or equivalent tamper-resistant mechanisms for key storage, (c) automated key rotation at intervals not exceeding twelve (12) months, and (d) auditable records of all key lifecycle events.\n\n" +
      "3. \"Multi-Factor Authentication\" (\"MFA\") shall mean an authentication mechanism that requires the presentation of two or more independent credentials from the following categories: (a) knowledge — something the user knows (password, PIN); (b) possession — something the user has (security token, mobile device); (c) inherence — something the user is (biometric verification). {{COMPANY_NAME}} shall enforce MFA for all access to production environments, administrative consoles, remote access connections, and systems processing Personal Data or confidential information.\n\n" +
      "4. \"Least Privilege\" shall mean the principle of granting users, systems, and processes only the minimum level of access — rights, permissions, and capabilities — strictly necessary to perform their authorised functions. {{COMPANY_NAME}} shall enforce the Least Privilege principle through role-based access control (RBAC), periodic entitlement reviews, and automated de-provisioning upon role change or termination.",
    rationale:
      "Encryption controls align with ISO/IEC 27001:2022 Annex A Controls A.8.24 (Use of Cryptography) and NIST SP 800-53 SC-12/SC-13. Key Management requirements derive from NIST SP 800-57. MFA is mandated under SOC 2 CC6.1 and is a baseline expectation of ISO 27001 Annex A Control A.8.5 (Secure Authentication). Least Privilege is codified in NIST SP 800-53 AC-6 and is assessed under SOC 2 CC6.3."
  },

  {
    id: "cl-def-cross-003",
    name: "Third-Party and Supply Chain Entity Definitions",
    group: "Definitions",
    section: 4,
    domain: "definitions",
    frameworks: ["ISO 27001", "GDPR", "DPDPA", "NIST CSF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text:
      "For the purposes of this Policy, the following definitions shall apply across all applicable frameworks:\n\n" +
      "1. \"Third Party\" shall mean any external entity — including vendors, service providers, consultants, partners, subcontractors, and affiliated organisations — that has access to, processes, stores, or transmits information assets or Personal Data of {{COMPANY_NAME}} or its customers. All Third Parties shall be subject to {{COMPANY_NAME}}'s Third-Party Risk Management programme and shall undergo due diligence assessment prior to engagement.\n\n" +
      "2. \"Vendor\" shall mean a Third Party that provides goods, software, or services to {{COMPANY_NAME}} under a contractual arrangement. Vendors that access, process, or store Personal Data or confidential information shall be classified as Critical Vendors and shall be subject to enhanced due diligence, contractual security requirements, and periodic reassessment at intervals not exceeding twelve (12) months.\n\n" +
      "3. \"Sub-processor\" shall mean any Third Party engaged by a Data Processor (or PII Processor) to carry out specific processing activities on behalf of the Data Controller (or PII Controller). {{COMPANY_NAME}} shall maintain a current register of all Sub-processors, shall impose equivalent data protection obligations on each Sub-processor through written agreements, and shall notify affected Data Controllers of any intended changes to Sub-processors in accordance with applicable contractual and regulatory requirements.\n\n" +
      "4. \"Fourth Party\" shall mean any entity that provides services to a Third Party that are material to or form part of the services delivered by such Third Party to {{COMPANY_NAME}}. Fourth Parties represent concentration risk and extended supply chain exposure. {{COMPANY_NAME}} shall require its Critical Vendors to disclose material Fourth-Party dependencies and shall incorporate Fourth-Party risk considerations into its vendor risk assessment methodology.",
    rationale:
      "Third-party and supply chain risk management spans multiple frameworks: GDPR Article 28 (Processor obligations), DPDPA Section 8 (Data Fiduciary accountability for processors), ISO/IEC 27001:2022 Annex A Control A.5.19–A.5.23 (Supplier relationships), NIST CSF ID.SC (Supply Chain Risk Management), and SOC 2 CC9.2 (Risk Mitigation — Vendor Management). Fourth-Party risk is an emerging area of regulatory focus and is assessed by leading audit firms as part of extended enterprise risk evaluations."
  }
];
