import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class VendorRiskPackService {
  static getArtifactDefinitions(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting a Third-Party Risk Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. Third-Party Risk Policy
    artifacts.push({
      id: 'vr_policy',
      artifactType: 'Policy',
      title: 'Third-Party Risk Policy',
      prompt: `${systemContext}\n\nDraft a Third-Party Risk Management Policy.\nContext: ${contextNarrative}`,
      fallbackText: `# Third-Party Risk Policy\n\n## 1. Purpose\nTo ensure third-party vendors do not introduce unacceptable risk to the organization.\n\n## 2. Scope\nApplies to all vendors, suppliers, and contractors.\n\n## 3. Governance\nThe Vendor Risk Committee oversees the TPRM program.\n\n## 4. Lifecycle\nOnboarding, Due Diligence, Continuous Monitoring, and Offboarding.`
    });

    // 2. Vendor Risk Standard
    artifacts.push({
      id: 'vr_standard',
      artifactType: 'Standard',
      title: 'Vendor Risk Standard',
      prompt: `${systemContext}\n\nDraft a Vendor Risk Standard.\nDefine risk tiering (High, Medium, Low), due diligence requirements per tier, and continuous monitoring frequency.\nContext: ${contextNarrative}`,
      fallbackText: `# Vendor Risk Standard\n\n## 1. Risk Tiering\n- **High Risk**: Access to PII, critical business function.\n- **Medium Risk**: Access to internal systems, non-critical function.\n- **Low Risk**: No system access.\n\n## 2. Due Diligence\nHigh Risk vendors require an onsite audit or SOC 2 Type II review annually.`
    });

    // 3. Due Diligence Procedure
    artifacts.push({
      id: 'vr_procedure',
      artifactType: 'Procedure',
      title: 'Due Diligence Procedure',
      prompt: `${systemContext}\n\nDraft a Due Diligence Procedure.\nDocument steps for sending questionnaires, reviewing SOC2 reports, scoring risks, and exception handling.\nContext: ${contextNarrative}`,
      fallbackText: `# Due Diligence Procedure\n\n## 1. Questionnaire Dispatch\nProcurement triggers the SIG Lite or SIG Core based on vendor tier.\n\n## 2. SOC 2 Review\nSecurity team reviews SOC 2 reports for qualified opinions or relevant exceptions.\n\n## 3. Exception Handling\nBusiness sponsors must formally accept risks for vendors failing due diligence.`
    });

    // 4. Vendor Assessment Workbook
    artifacts.push({
      id: 'vr_assessment',
      artifactType: 'Workbook',
      title: 'Vendor Assessment Workbook',
      prompt: `${systemContext}\n\nDraft a Vendor Assessment Workbook.\nCreate markdown tables for: Control domains (InfoSec, BCP, Privacy), standard questions, expected evidence, and scoring rubrics.\nContext: ${contextNarrative}`,
      fallbackText: `# Vendor Assessment Workbook\n\n| Domain | Question | Expected Evidence | Risk Weight |\n|---|---|---|---|\n| InfoSec | Is data encrypted at rest? | Encryption Policy, Architecture Diagram | High |\n| Privacy | Do you comply with GDPR/CCPA? | Privacy Notice, DPA | High |\n| BCP | Do you have a tested BCP? | BCP Summary, Test Results | Medium |`
    });

    // 5. Contractual Clauses Library
    artifacts.push({
      id: 'vr_clauses',
      artifactType: 'Workbook',
      title: 'Contractual Clauses Library',
      prompt: `${systemContext}\n\nDraft a Contractual Clauses Library.\nInclude standard security addendum clauses for: Right to audit, Data breach notification (24 hours), Data return/destruction, and Cyber insurance requirements.\nContext: ${contextNarrative}`,
      fallbackText: `# Contractual Clauses Library\n\n## Right to Audit\n"The Company reserves the right to audit the Vendor's security controls annually upon 30 days written notice..."\n\n## Breach Notification\n"Vendor shall notify the Company within 24 hours of discovering any unauthorized access to Company Data..."`
    });

    // 6. Concentration Risk Workbook
    artifacts.push({
      id: 'vr_concentration',
      artifactType: 'Workbook',
      title: 'Concentration Risk Workbook',
      prompt: `${systemContext}\n\nDraft a Concentration Risk Workbook.\nDesign markdown tables to map critical business services to 4th-party dependencies (e.g., AWS, Azure) to identify systemic risks.\nContext: ${contextNarrative}`,
      fallbackText: `# Concentration Risk Workbook\n\n| Vendor | Primary Service | 4th Party Dependency | Concentration Risk Level |\n|---|---|---|---|\n| CRM SaaS | Sales Operations | AWS (us-east-1) | High |\n| HRIS | Payroll | AWS (us-east-1) | High |\n| Marketing Tool | Email Campaigns | AWS (us-east-1) | Medium |`
    });

    // 7. TPRM Board Report
    artifacts.push({
      id: 'vr_board',
      artifactType: 'Board Pack',
      title: 'TPRM Board Report',
      prompt: `${systemContext}\n\nDraft a Third-Party Risk Management Board Report.\nInclude sections for: TPRM Program Status, High-Risk Vendor Overview, Critical Exceptions Approved, and Concentration Risks.\nContext: ${contextNarrative}`,
      fallbackText: `# TPRM Board Report\n\n## Program Status\n95% of High-Risk vendors have completed annual assessments.\n\n## High-Risk Overview\nCurrently managing 42 High-Risk vendors. No critical breaches reported in Q3.\n\n## Critical Exceptions\nOne exception approved for Legacy CRM vendor lacking MFA, compensating controls in place.\n\n## Concentration Risk\nSignificant reliance on AWS across 60% of our SaaS supply chain.`
    });

    return artifacts;
  }
}
