import { AIService } from './aiService.js';
import { GovernanceHierarchyService } from './governanceHierarchyService.js';
import { DocumentCrossReferenceService } from './documentCrossReferenceService.js';
import { OwnershipService } from './ownershipService.js';
import { SentenceVariationService } from './sentenceVariationService.js';
import { OrganizationDependencyService } from './organizationDependencyService.js';

export class VendorRiskPackService {
  static getArtifactDefinitions(frameworks, organizationContext) {
    const artifacts = [];
    
    const baseDirectives = `
You are a Big 4 management consultant drafting a Third-Party Risk Governance Pack.
Strictly output in Markdown format.

${SentenceVariationService.getLinguisticInstructions()}
${OwnershipService.getRaciDistribution()}

ANTI-HALLUCINATION: NEVER fabricate dates, exercises, incidents, historical tests, quarters, or metrics. Use placeholders like [Last Test Date], [Previous Quarter], [Target Completion Date], [Next Exercise Date].

ORGANIZATION ASSUMPTIONS: Assume the reader has read the Governance Pack Cover Page. Do not summarize the company profile. Include the exact text: "ORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page."
`;

    const relatedDocs = DocumentCrossReferenceService.getRelatedDocuments('vendor');

    // 1. Third-Party Risk Policy
    const hierarchyPolicy = GovernanceHierarchyService.getHierarchyStatement('Policy');
    artifacts.push({
      id: 'vr_policy',
      artifactType: 'Policy',
      title: 'Third-Party Risk Policy',
      prompt: `${baseDirectives}\n\nDraft a Third-Party Risk Management Policy.\nInclude this exact hierarchy statement: "${hierarchyPolicy}"\nInclude a Related Documents section listing:\n${relatedDocs}`,
      fallbackText: `# Third-Party Risk Policy\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n## 1. Purpose\nTo ensure third-party vendors do not introduce unacceptable risk to the organization.\n\n## 2. Scope\nApplies to all vendors, suppliers, and contractors.\n\n## 3. Governance\n${hierarchyPolicy}\n\nThe Vendor Risk Committee oversees the TPRM program.\n\n## 4. Lifecycle\nOnboarding, Due Diligence, Continuous Monitoring, and Offboarding.\n\n## 5. Related Documents\n${relatedDocs}`
    });

    // 2. Vendor Risk Standard
    const hierarchyStandard = GovernanceHierarchyService.getHierarchyStatement('Standard');
    artifacts.push({
      id: 'vr_standard',
      artifactType: 'Standard',
      title: 'Vendor Risk Standard',
      prompt: `${baseDirectives}\n\nDraft a Vendor Risk Standard.\nDefine risk tiering (High, Medium, Low), due diligence requirements per tier, and continuous monitoring frequency.\nInclude this exact hierarchy statement: "${hierarchyStandard}"`,
      fallbackText: `# Vendor Risk Standard\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyStandard}\n\n## 1. Risk Tiering\n- **High Risk**: Access to PII, critical business function.\n- **Medium Risk**: Access to internal systems, non-critical function.\n- **Low Risk**: No system access.\n\n## 2. Due Diligence\nHigh Risk vendors require an onsite audit or SOC 2 Type II review annually.`
    });

    // 3. Due Diligence Procedure
    const hierarchyProcedure = GovernanceHierarchyService.getHierarchyStatement('Procedure');
    artifacts.push({
      id: 'vr_procedure',
      artifactType: 'Procedure',
      title: 'Due Diligence Procedure',
      prompt: `${baseDirectives}\n\nDraft a Due Diligence Procedure.\nDocument steps for sending questionnaires, reviewing SOC2 reports, scoring risks, and exception handling.\nInclude this exact hierarchy statement: "${hierarchyProcedure}"`,
      fallbackText: `# Due Diligence Procedure\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyProcedure}\n\n## 1. Questionnaire Dispatch\nProcurement triggers the SIG Lite or SIG Core based on vendor tier.\n\n## 2. SOC 2 Review\nSecurity team reviews SOC 2 reports for qualified opinions or relevant exceptions.\n\n## 3. Exception Handling\nBusiness sponsors must formally accept risks for vendors failing due diligence.`
    });

    // 4. Vendor Assessment Workbook
    const hierarchyWorkbook = GovernanceHierarchyService.getHierarchyStatement('Workbook');
    artifacts.push({
      id: 'vr_assessment',
      artifactType: 'Workbook',
      title: 'Vendor Assessment Workbook',
      prompt: `${baseDirectives}\n\nDraft a Vendor Assessment Workbook.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nCreate markdown tables for: Control domains (InfoSec, BCP, Privacy), standard questions, expected evidence, and scoring rubrics.`,
      fallbackText: `# Vendor Assessment Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n| Domain | Question | Expected Evidence | Risk Weight |\n|---|---|---|---|\n| InfoSec | Is data encrypted at rest? | Encryption Policy, Architecture Diagram | High |\n| Privacy | Do you comply with GDPR/CCPA? | Privacy Notice, DPA | High |\n| BCP | Do you have a tested BCP? | BCP Summary, Test Results | Medium |`
    });

    // 5. Contractual Clauses Library
    artifacts.push({
      id: 'vr_clauses',
      artifactType: 'Workbook',
      title: 'Contractual Clauses Library',
      prompt: `${baseDirectives}\n\nDraft a Contractual Clauses Library.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nInclude standard security addendum clauses for: Right to audit, Data breach notification (24 hours), Data return/destruction, and Cyber insurance requirements.`,
      fallbackText: `# Contractual Clauses Library\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n## Right to Audit\n"The Company reserves the right to audit the Vendor's security controls annually upon 30 days written notice..."\n\n## Breach Notification\n"Vendor shall notify the Company within 24 hours of discovering any unauthorized access to Company Data..."`
    });

    // 6. Concentration Risk Workbook
    const dependencies = OrganizationDependencyService.getCriticalDependencies(organizationContext);
    artifacts.push({
      id: 'vr_concentration',
      artifactType: 'Workbook',
      title: 'Concentration Risk Workbook',
      prompt: `${baseDirectives}\n\nDraft a Concentration Risk Workbook.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nDesign markdown tables to map critical business services to 4th-party dependencies. Ensure you specifically analyze concentration risk around this dependency: ${dependencies.cloudOutageScenario}\nInclude systemic risk analysis.`,
      fallbackText: `# Concentration Risk Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n| Vendor | Primary Service | 4th Party Dependency | Concentration Risk Level |\n|---|---|---|---|\n| CRM SaaS | Sales Operations | AWS | High |\n| HRIS | Payroll | AWS | High |\n| Marketing Tool | Email Campaigns | AWS | Medium |`
    });

    // 7. TPRM Board Report
    const hierarchyBoard = GovernanceHierarchyService.getHierarchyStatement('Board Pack');
    artifacts.push({
      id: 'vr_board',
      artifactType: 'Board Pack',
      title: 'TPRM Board Report',
      prompt: `${baseDirectives}\n\nDraft a Third-Party Risk Management Board Report.\nInclude this exact hierarchy statement: "${hierarchyBoard}"\n\nThe Board Pack MUST contain EXACTLY these sections:\n### Executive Summary\n### Key Risks\n### Trend Since Previous Quarter\n### Residual Risk Heat Map\n### Open Actions\n### Investment Requirements\n### Decisions Requested From The Board\n### Key Dependencies\n### RAG Indicators\n### Emerging Concerns`,
      fallbackText: `# TPRM Board Report\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyBoard}\n\n### Executive Summary\n95% of High-Risk vendors have completed annual assessments.\n\n### RAG Indicators\nOverall Status: AMBER.\n\n### Key Risks\nOne critical exception approved for Legacy CRM vendor lacking MFA.\n\n### Key Dependencies\nSignificant reliance on AWS across 60% of our SaaS supply chain.`
    });

    return artifacts;
  }
}

