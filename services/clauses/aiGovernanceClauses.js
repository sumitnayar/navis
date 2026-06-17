// Navis Clause Library — AI Governance Clauses
// Wave 3.6: Institutional Quality Governance Documents

export const AI_GOVERNANCE_CLAUSES = [

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — ROLES & RESPONSIBILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-roles-001",
    name: "AI Governance Committee",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "ai_gov",
    frameworks: ["ISO 27001", "NIST CSF", "NIST AI RMF", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish an AI Governance Committee comprising senior representatives from Legal, Compliance, Information Security, Privacy, Engineering, and relevant business units to provide strategic oversight of all artificial intelligence and machine learning activities within the organization. The AI Governance Committee shall approve the AI usage policy, review and authorize high-risk AI deployments, establish ethical AI principles, and monitor the organization's AI risk posture. The Committee shall convene no less than quarterly and shall report AI governance matters, material risks, and strategic recommendations to the Board of Directors or its delegated technology committee.",
    rationale: "NIST AI RMF GOVERN 1.1 requires organizational policies and governance structures for AI risk management. ISO 27001 §5.1 mandates top management commitment and defined governance structures for information security including emerging technology risks."
  },
  {
    id: "cl-ai-roles-002",
    name: "AI Ethics Officer",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall designate an AI Ethics Officer who shall bear accountability for ensuring that all AI systems developed, deployed, or procured by the organization adhere to the organization's ethical AI principles, applicable regulatory requirements, and industry best practices. The AI Ethics Officer shall conduct or oversee ethical impact assessments for all AI systems that interact with customers, process personal data, or influence consequential decisions. The AI Ethics Officer shall serve as the primary escalation point for AI ethics concerns raised by employees, customers, or external stakeholders and shall maintain independence from AI development teams to ensure objective oversight.",
    rationale: "NIST AI RMF GOVERN 1.2 requires accountability structures and defined roles for AI risk management. EU AI Act Article 26 mandates designated individuals for AI system oversight."
  },
  {
    id: "cl-ai-roles-003",
    name: "Model Risk Owners",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall assign a designated Model Risk Owner for each AI or machine learning model deployed in production environments. The Model Risk Owner shall bear accountability for the model's performance, accuracy, fairness, security, and compliance throughout its lifecycle from development through retirement. Model Risk Owners shall ensure that all models under their ownership undergo required validation, are subject to ongoing monitoring, comply with approved risk tolerances, and are documented in the organization's AI model inventory. Model Risk Owners shall approve all material changes to model architecture, training data, or deployment configurations prior to production release.",
    rationale: "NIST AI RMF GOVERN 2.1 requires defined roles and responsibilities for AI risk management. SOC 2 CC3.4 mandates identification of risks associated with changes to information technology."
  },
  {
    id: "cl-ai-roles-004",
    name: "Data Science Team Lead Responsibilities",
    group: "Roles & Responsibilities",
    section: 5,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "Data Science Team Leads within {{COMPANY_NAME}} shall be responsible for ensuring that all AI and machine learning development activities conducted by their teams comply with the organization's AI governance policy, secure development practices, and data handling requirements. Team Leads shall enforce the use of approved development environments, version-controlled model repositories, and documented experiment tracking. Team Leads shall verify that all models developed by their teams undergo mandatory peer review, bias testing, and security assessment prior to submission for production deployment approval. Team Leads shall report model development pipeline status and identified risks to the Model Risk Owner on a monthly basis.",
    rationale: "NIST AI RMF GOVERN 3.2 requires policies and procedures for AI development teams. ISO 27001 A.14.2.1 mandates secure development policies for information systems including AI components."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: AI USAGE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-usage-001",
    name: "Acceptable AI Use Policy",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain a documented Acceptable AI Use Policy that defines the authorized purposes, approved tools, and operational boundaries for all AI and machine learning usage within the organization. The policy shall classify AI use cases into risk categories (minimal, limited, high, and unacceptable) and shall define the governance requirements, approval workflows, and control obligations applicable to each category. All employees, contractors, and third parties shall acknowledge the Acceptable AI Use Policy prior to utilizing any AI tools or services in connection with {{COMPANY_NAME}} business activities.",
    rationale: "NIST AI RMF GOVERN 1.1 requires organizational policies for AI use and risk management. ISO 27001 A.8.1.3 mandates acceptable use policies for information assets and technology."
  },
  {
    id: "cl-ai-usage-002",
    name: "Prohibited AI Applications",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall maintain an explicit list of prohibited AI applications that shall not be developed, deployed, or procured under any circumstances without exceptional Board-level approval. Prohibited applications shall include, at minimum: AI systems that perform autonomous decision-making on employment termination, credit denial, or insurance eligibility without human review; social scoring systems; real-time biometric identification in public spaces (unless mandated by law enforcement cooperation orders); AI systems designed to manipulate human behaviour through subliminal techniques; and any AI application that processes {{SPECIAL_CATEGORIES}} data without an approved Data Protection Impact Assessment. Violation of prohibited AI use restrictions shall constitute a serious policy breach subject to disciplinary action.",
    rationale: "EU AI Act Article 5 prohibits specific AI practices. NIST AI RMF GOVERN 1.1 requires identification and prohibition of unacceptable AI risk categories."
  },
  {
    id: "cl-ai-usage-003",
    name: "AI Tool Approval Process",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement a formal AI tool approval process that requires all AI and machine learning tools, platforms, APIs, and services to undergo security, privacy, and governance review prior to organizational adoption. The approval process shall include assessment of the tool's data handling practices, model transparency, vendor security posture, regulatory compliance, and alignment with the organization's AI governance principles. Approved AI tools shall be maintained in a centralized approved tool registry accessible to all employees. The use of any AI tool not listed in the approved registry shall be prohibited and shall constitute a violation of this policy.",
    rationale: "NIST AI RMF GOVERN 1.7 requires processes for AI system evaluation before deployment. ISO 27001 A.12.5.1 mandates controls on the installation of software on operational systems."
  },
  {
    id: "cl-ai-usage-004",
    name: "Shadow AI Prevention",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement technical and administrative controls to prevent the unauthorized use of AI tools and services (shadow AI) within the organization. Technical controls shall include network-level blocking of unauthorized AI service endpoints, Data Loss Prevention (DLP) rules to detect data uploads to unapproved AI platforms, and endpoint monitoring for unauthorized AI application installations. Administrative controls shall include mandatory AI awareness training for all employees, clear communication of approved AI tools and prohibited services, and a streamlined request process for evaluation of new AI tools. Shadow AI incidents shall be investigated and documented, with repeat violations escalated through the disciplinary process.",
    rationale: "NIST AI RMF GOVERN 1.1 requires organizations to manage risks from unauthorized AI use. ISO 27001 A.12.5.1 mandates restrictions on software installation. SOC 2 CC6.1 requires logical access controls to prevent unauthorized use."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: DATA IN AI
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-data-001",
    name: "Training Data Governance",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish formal governance requirements for all data used in AI and machine learning model training, validation, and testing. All training datasets shall be documented with data provenance records, licensing terms, consent basis, quality assessments, and bias evaluations prior to use. The use of personal data in model training shall require a documented legal basis under applicable data protection law and shall be subject to data minimization principles. Training data shall be subject to access controls equivalent to or exceeding those applied to the source data systems. A complete data lineage record shall be maintained for each production model documenting all datasets used throughout the model development lifecycle.",
    rationale: "NIST AI RMF MAP 2.3 requires documentation of data provenance and fitness for use. GDPR Article 5(1)(b) mandates purpose limitation for personal data processing including AI training."
  },
  {
    id: "cl-ai-data-002",
    name: "Personal Data in AI Systems",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["GDPR", "NIST AI RMF", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "The processing of personal data within AI systems shall comply with all applicable data protection regulations and shall be subject to additional safeguards including Data Protection Impact Assessments (DPIAs) for high-risk processing activities. Personal data used in AI inference shall be minimized to the data elements strictly necessary for the intended processing purpose. {{COMPANY_NAME}} shall implement technical measures to prevent the memorization, extraction, or reconstruction of personal data from AI model weights or outputs. Data subjects shall be informed when their personal data is processed by AI systems and shall be provided with mechanisms to exercise their rights under applicable data protection law, including the right to object to automated decision-making.",
    rationale: "GDPR Articles 13, 14, and 22 require transparency about automated decision-making and the right to object. NIST AI RMF GOVERN 1.6 requires mechanisms to address data privacy in AI."
  },
  {
    id: "cl-ai-data-003",
    name: "Data Quality for AI Systems",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish and enforce data quality standards for all data used in AI and machine learning systems. Data quality assessments shall evaluate completeness, accuracy, consistency, timeliness, representativeness, and relevance of datasets prior to their use in model training or inference. Data quality metrics shall be continuously monitored for production data pipelines feeding AI systems, with automated alerts for quality degradation beyond approved thresholds. All identified data quality issues shall be documented, investigated, and remediated prior to model retraining. Data quality assessment results shall be maintained as part of the model documentation and shall be reviewed during model validation activities.",
    rationale: "NIST AI RMF MEASURE 2.6 requires measurement of AI system data quality. ISO 27001 A.14.1.1 mandates information security requirements analysis including data integrity requirements."
  },
  {
    id: "cl-ai-data-004",
    name: "Synthetic Data Standards",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "GDPR"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish standards and governance requirements for the generation, validation, and use of synthetic data in AI and machine learning applications. Synthetic data generation processes shall be designed to prevent the reconstruction or inference of real personal data from synthetic outputs. All synthetic datasets shall undergo statistical fidelity assessments to validate that they adequately represent the characteristics of the source data distribution without preserving individual-level information. Synthetic data shall be clearly labelled and catalogued separately from production data, and its use in model training shall be documented in the model's data lineage records. The privacy effectiveness of synthetic data generation techniques shall be validated by the {{DPO_OFFICER}} or designated privacy function prior to use as a privacy-enhancing alternative to real personal data.",
    rationale: "NIST AI RMF MAP 2.3 addresses data fitness and provenance requirements. GDPR Recital 26 addresses the concept of anonymization and its relationship to data protection obligations."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: MODEL GOVERNANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-model-001",
    name: "Model Risk Assessment",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct a formal risk assessment for every AI and machine learning model prior to production deployment and no less than annually for all models in production. The risk assessment shall evaluate model risks across dimensions including accuracy and reliability, fairness and bias, security and adversarial robustness, privacy, transparency, and regulatory compliance. Models shall be classified into risk tiers (Critical, High, Medium, Low) based on the assessment outcome, with the risk tier determining the depth of validation requirements, monitoring frequency, and governance oversight applied. Risk assessment results shall be documented in the organization's AI model inventory and shall be reviewed and approved by the Model Risk Owner and the AI Governance Committee for all Critical and High-risk models.",
    rationale: "NIST AI RMF MAP 3.5 requires assessment of AI risks prior to deployment. ISO 27001 §6.1.2 mandates information security risk assessment for all information assets including AI systems."
  },
  {
    id: "cl-ai-model-002",
    name: "Model Validation Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "All AI and machine learning models classified as Critical or High-risk shall undergo independent validation by personnel or teams not involved in the model's development prior to production deployment. Model validation shall include assessment of model performance against defined acceptance criteria, evaluation of model behaviour on edge cases and adversarial inputs, testing for demographic and protected-class bias, and verification of model documentation completeness. Validation results shall be formally documented in a model validation report and approved by the Model Risk Owner prior to production release. Models that fail to meet validation criteria shall not be deployed until all identified deficiencies are remediated and the model is revalidated.",
    rationale: "NIST AI RMF MEASURE 1.1 requires independent evaluation of AI system performance. SOC 2 CC8.1 mandates testing of system changes prior to implementation."
  },
  {
    id: "cl-ai-model-003",
    name: "Model Performance Monitoring",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement continuous monitoring for all AI and machine learning models deployed in production environments. Monitoring shall track model performance metrics including accuracy, precision, recall, latency, throughput, error rates, and output distribution stability. Automated alerts shall be configured for performance degradation beyond approved thresholds, unexpected output patterns, and data drift indicators. All monitoring data shall be logged and retained for a minimum period consistent with the model's risk tier and applicable regulatory requirements. Performance anomalies shall be investigated within the timelines defined for the model's risk classification, and investigation outcomes shall be documented and reported to the Model Risk Owner.",
    rationale: "NIST AI RMF MEASURE 3.2 requires ongoing monitoring of AI system performance. ISO 27001 A.12.4.1 mandates event logging and monitoring for information systems."
  },
  {
    id: "cl-ai-model-004",
    name: "Model Retirement and Decommissioning",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall establish a formal model retirement and decommissioning process that defines the criteria, procedures, and approvals required to remove an AI or machine learning model from production service. Retirement criteria shall include sustained performance degradation below acceptable thresholds, supersession by a validated replacement model, regulatory non-compliance, or identification of unresolvable bias or security vulnerabilities. The decommissioning process shall ensure that model artifacts, training data references, and documentation are archived in accordance with the organization's data retention policy. All downstream systems and processes consuming the retired model's outputs shall be identified and transitioned prior to decommissioning. Model retirement decisions shall be approved by the Model Risk Owner and documented in the AI model inventory.",
    rationale: "NIST AI RMF GOVERN 6.2 requires processes for AI system decommissioning. ISO 27001 A.11.2.7 mandates secure disposal or re-use of equipment and information assets."
  },
  {
    id: "cl-ai-model-005",
    name: "Bias Detection and Mitigation",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement systematic bias detection and mitigation processes for all AI and machine learning models that influence decisions affecting individuals or groups. Bias testing shall evaluate model outputs across protected characteristics including race, gender, age, disability, religion, and national origin using established fairness metrics such as demographic parity, equalized odds, and calibration. Bias assessments shall be conducted during model development, prior to production deployment, and on an ongoing basis using production data. Models exhibiting statistically significant bias exceeding approved tolerance thresholds shall be flagged for mandatory remediation. All bias assessment results, remediation actions taken, and residual bias levels shall be documented and reviewed by the AI Ethics Officer.",
    rationale: "NIST AI RMF MEASURE 2.11 requires fairness assessment of AI systems across demographic groups. EU AI Act Article 10 mandates examination of data for possible biases in high-risk AI systems."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: PROMPT SECURITY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-prompt-001",
    name: "Prompt Injection Prevention",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "OWASP LLM Top 10"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement technical controls to detect, prevent, and mitigate prompt injection attacks against all generative AI systems and large language model (LLM) applications deployed or utilized by the organization. Controls shall include input validation and sanitization of user-provided prompts, separation of system instructions from user inputs, output filtering for sensitive information disclosure, and rate limiting to prevent automated exploitation. All LLM-integrated applications shall undergo prompt injection vulnerability testing as part of the security assessment process prior to production deployment. Identified prompt injection vulnerabilities shall be classified and remediated using the same severity-based timelines applied to application security vulnerabilities.",
    rationale: "OWASP LLM Top 10 LLM01 identifies prompt injection as the highest-priority LLM risk. NIST AI RMF MEASURE 2.7 requires assessment of AI system security including adversarial attacks."
  },
  {
    id: "cl-ai-prompt-002",
    name: "Confidential Data in Prompts",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall prohibit the inclusion of confidential, restricted, or personal data in prompts submitted to external AI services unless the service has been explicitly approved for such use and appropriate data processing agreements are in place. Technical controls including Data Loss Prevention (DLP) policies, content inspection proxies, and automated PII detection shall be implemented to prevent the inadvertent transmission of sensitive data to AI services. Internal AI systems that process confidential data shall implement prompt logging with access controls, data masking for stored prompts, and automated retention management. All employees shall receive training on the risks of sharing sensitive information with AI tools and the organization's specific prohibitions and approved alternatives.",
    rationale: "GDPR Article 5(1)(f) mandates appropriate security of personal data including protection against unauthorized processing. ISO 27001 A.13.2.1 requires policies and procedures for the protection of information in transfer."
  },
  {
    id: "cl-ai-prompt-003",
    name: "Output Verification Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall require that all AI-generated outputs used in business decisions, customer communications, regulatory filings, financial reporting, or legal proceedings undergo mandatory human verification prior to use. Output verification shall assess factual accuracy, completeness, consistency with organizational policies, and absence of inappropriate or harmful content. Automated output validation checks shall be implemented where technically feasible, including fact-checking against authoritative data sources, toxicity detection, and consistency scoring. The level of human verification required shall be proportionate to the risk impact of the output's intended use, with Critical and High-risk outputs requiring verification by qualified subject matter experts.",
    rationale: "NIST AI RMF MEASURE 2.5 requires validation of AI outputs for accuracy and reliability. ISO 27001 A.14.2.9 mandates system acceptance testing for information systems."
  },
  {
    id: "cl-ai-prompt-004",
    name: "AI Hallucination Controls",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement specific controls to detect and mitigate AI hallucination risks in all generative AI systems deployed or utilized by the organization. Controls shall include retrieval-augmented generation (RAG) architectures that ground AI outputs in verified organizational data sources, confidence scoring mechanisms that flag low-confidence outputs for human review, and output citation requirements that trace generated content to source materials. Users of generative AI tools shall be trained to recognize hallucination indicators and shall be required to independently verify all factual claims, statistical data, regulatory citations, and technical specifications generated by AI systems before incorporating them into organizational deliverables. Incidents of consequential AI hallucination shall be reported through the organization's incident management process and shall inform ongoing model and prompt engineering improvements.",
    rationale: "NIST AI RMF MEASURE 2.5 requires mechanisms to address confabulation and unreliable AI outputs. SOC 2 PI1.1 requires accuracy and completeness of information processing."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — POLICY REQUIREMENTS: TRANSPARENCY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-transparency-001",
    name: "AI Decision Explainability",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "GDPR", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall ensure that all AI systems that produce decisions or recommendations materially affecting individuals or business outcomes are capable of providing meaningful explanations of their decision logic. Explainability requirements shall be proportionate to the risk level and impact of the AI system's decisions, with high-risk systems requiring detailed, human-interpretable explanations of the factors that influenced each decision. {{COMPANY_NAME}} shall implement explainability techniques appropriate to each model type, including feature importance analysis, decision path visualization, counterfactual explanations, and natural language rationale generation. Explainability outputs shall be logged and retained for the duration required by applicable regulatory and record retention requirements.",
    rationale: "GDPR Article 22 and Recital 71 require meaningful information about the logic involved in automated decision-making. NIST AI RMF MEASURE 2.8 requires mechanisms for AI system explainability and interpretability."
  },
  {
    id: "cl-ai-transparency-002",
    name: "Human Oversight Requirements",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "GDPR", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall ensure that all AI systems classified as High-risk or Critical operate under meaningful human oversight mechanisms that enable qualified personnel to understand, monitor, intervene in, and override AI system outputs and decisions. Human oversight shall be proportionate to the risk level of the AI system and shall include, at minimum, the ability to halt AI system operation, override individual AI decisions, and escalate AI system concerns to the AI Governance Committee. Human oversight personnel shall receive specialized training on the AI system's capabilities, limitations, known failure modes, and escalation procedures. Fully autonomous decision-making without human review shall be prohibited for any AI system that produces legally significant effects on individuals.",
    rationale: "EU AI Act Article 14 requires human oversight measures for high-risk AI systems. GDPR Article 22 provides the right not to be subject to solely automated decision-making with legal effects."
  },
  {
    id: "cl-ai-transparency-003",
    name: "AI Disclosure Obligations",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "GDPR", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall disclose to customers, employees, and other affected parties when they are interacting with or subject to decisions made by AI systems. Disclosure shall be provided in clear, plain language and shall include the nature and purpose of the AI system, the types of data processed, the potential consequences of the AI interaction, and the mechanisms available for human review or appeal. AI-generated content produced for external distribution shall be clearly identified as AI-generated through appropriate labelling or metadata. Disclosure requirements shall apply to all customer-facing AI systems including chatbots, recommendation engines, automated decision systems, and content generation tools.",
    rationale: "EU AI Act Article 52 mandates transparency obligations for AI systems interacting with natural persons. GDPR Articles 13 and 14 require disclosure of automated decision-making to data subjects."
  },
  {
    id: "cl-ai-transparency-004",
    name: "Algorithmic Impact Assessments",
    group: "Policy Requirements",
    section: 6,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "GDPR", "ISO 27001"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct Algorithmic Impact Assessments (AIAs) for all AI systems classified as High-risk or Critical prior to production deployment and no less than annually during production operation. AIAs shall evaluate the potential impact of the AI system on individuals' rights and freedoms, identify risks of discrimination or bias, assess the adequacy of transparency and explainability mechanisms, and evaluate the effectiveness of human oversight controls. AIA methodology shall incorporate stakeholder consultation with affected groups where feasible and shall document residual risks with formal risk acceptance by the AI Governance Committee. AIA results shall be maintained in the AI model inventory and shall be made available to regulators and supervisory authorities upon request.",
    rationale: "NIST AI RMF MAP 5.2 requires assessment of AI system impacts on individuals and communities. GDPR Article 35 mandates Data Protection Impact Assessments for high-risk automated processing."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — MONITORING & COMPLIANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-monitoring-001",
    name: "AI System Performance Monitoring",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement a centralized AI monitoring programme that provides ongoing visibility into the performance, reliability, fairness, and security posture of all AI systems deployed in production. The monitoring programme shall track key performance indicators including model accuracy metrics, prediction confidence distributions, error rates by demographic group, system availability, response latency, and resource utilization. Monitoring dashboards shall be accessible to Model Risk Owners, the AI Ethics Officer, and the AI Governance Committee. Monitoring alerts shall be triaged and responded to within timelines defined by the AI system's risk classification: Critical systems within one (1) hour, High-risk systems within four (4) hours, and Medium-risk systems within twenty-four (24) hours.",
    rationale: "NIST AI RMF MEASURE 3.2 mandates ongoing monitoring of deployed AI systems. ISO 27001 A.12.4.1 requires event logging and monitoring for operational systems."
  },
  {
    id: "cl-ai-monitoring-002",
    name: "Model Drift Detection",
    group: "Monitoring & Compliance",
    section: 9,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Consultant-Grade",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall implement automated model drift detection mechanisms for all AI and machine learning models deployed in production. Drift detection shall monitor for data drift (changes in input data distributions), concept drift (changes in the relationship between inputs and outputs), and prediction drift (changes in output distributions). Statistical drift detection methods shall be calibrated to the model's risk tier, with more sensitive thresholds applied to Critical and High-risk models. Drift alerts exceeding approved thresholds shall trigger mandatory investigation by the Data Science team and shall be reported to the Model Risk Owner within twenty-four (24) hours. Confirmed material drift shall initiate the model retraining and revalidation process.",
    rationale: "NIST AI RMF MEASURE 3.2 requires monitoring for changes that may affect AI system performance and trustworthiness. ISO 27001 A.12.4.1 mandates monitoring of information processing facilities for anomalous behaviour."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — REVIEW & MAINTENANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cl-ai-review-001",
    name: "AI Policy Annual Review",
    group: "Review & Maintenance",
    section: 10,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "SOC 2"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct a comprehensive review of the AI governance policy, acceptable use standards, and supporting procedures no less than annually. The annual review shall assess the continued adequacy of AI governance controls in light of changes to the organization's AI portfolio, evolving regulatory requirements, emerging AI risks, and industry best practices. The review shall be conducted by the AI Governance Committee in consultation with Legal, Compliance, Information Security, and Privacy functions. Review outcomes shall include an updated AI governance roadmap, revised risk appetite thresholds where warranted, and an action plan for addressing identified gaps approved by senior executive leadership.",
    rationale: "NIST AI RMF GOVERN 1.4 requires regular review of AI governance frameworks. ISO 27001 §9.3 mandates management review of information security policies and controls at planned intervals."
  },
  {
    id: "cl-ai-review-002",
    name: "Emerging Technology Assessment",
    group: "Review & Maintenance",
    section: 10,
    domain: "ai_gov",
    frameworks: ["NIST AI RMF", "ISO 27001", "NIST CSF"],
    jurisdiction: ["Global"],
    industry: ["Global"],
    controllerProcessor: "both",
    maturity: "Board-Ready",
    confidence: "high",
    version: "v1.0",
    text: "{{COMPANY_NAME}} shall conduct semi-annual assessments of emerging AI technologies, capabilities, and threat vectors to ensure that the organization's AI governance framework remains current and effective against evolving risks. Emerging technology assessments shall evaluate new AI model architectures, novel attack techniques targeting AI systems, advancements in explainability and fairness tooling, and changes to the regulatory landscape including proposed legislation and regulatory guidance. Assessment findings shall be presented to the AI Governance Committee and shall inform updates to the AI governance policy, acceptable use standards, prohibited applications list, and security control requirements. The AI Governance Committee shall determine whether emerging technologies require new governance categories, control modifications, or pilot evaluation programmes.",
    rationale: "NIST AI RMF GOVERN 1.5 requires ongoing monitoring of emerging AI risks and opportunities. NIST CSF ID.RA-2 mandates intelligence from threat and vulnerability analysis sources to inform risk assessments."
  }
];
