import { AIService } from './aiService.js';
import { GovernanceHierarchyService } from './governanceHierarchyService.js';
import { DocumentCrossReferenceService } from './documentCrossReferenceService.js';
import { OwnershipService } from './ownershipService.js';
import { SentenceVariationService } from './sentenceVariationService.js';
import { OrganizationDependencyService } from './organizationDependencyService.js';
import { KeyPersonRiskService } from './keyPersonRiskService.js';

export class IncidentResponsePackService {
  static getArtifactDefinitions(frameworks, organizationContext) {
    const artifacts = [];
    
    const deps = OrganizationDependencyService.getCriticalDependencies(organizationContext);
    
    let intelligenceDirectives = `\nORGANIZATIONAL INTELLIGENCE:\n`;
    if (deps.vendorIntelligence.length > 0) {
      intelligenceDirectives += `Vendor Threat Vectors:\n${deps.vendorIntelligence.map(v => `- ${v.name}: ${v.threats.join(', ')}`).join('\n')}\n`;
    }
    if (deps.productIntelligence.length > 0) {
      intelligenceDirectives += `Product Operational Risks:\n${deps.productIntelligence.map(p => `- ${p.name}: ${p.risks.join(', ')}`).join('\n')}\n`;
    }
    if (deps.segmentIntelligence.length > 0) {
      intelligenceDirectives += `Customer Segment Priorities (Use this to influence tone and focus):\n${deps.segmentIntelligence.map(s => `- ${s.name}: ${s.priorities.join(', ')}`).join('\n')}\n`;
    }
    intelligenceDirectives += `\nAvoid generic phrasing like "System Failure" or "Cyber Attack". Explicitly use the specific vendors, threats, and products listed above to build realistic scenarios.\n`;

    const baseDirectives = `
You are a Big 4 management consultant drafting an Incident Response Governance Pack.
Strictly output in Markdown format.

${SentenceVariationService.getLinguisticInstructions()}
${OwnershipService.getRaciDistribution()}
${intelligenceDirectives}

ANTI-HALLUCINATION: NEVER fabricate dates, exercises, incidents, historical tests, quarters, or metrics. Use placeholders like [Last Test Date], [Previous Quarter], [Target Completion Date], [Next Exercise Date].

ORGANIZATION ASSUMPTIONS: Assume the reader has read the Governance Pack Cover Page. Do not summarize the company profile. Include the exact text: "ORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page."
`;

    const relatedDocs = DocumentCrossReferenceService.getRelatedDocuments('ir');

    // 1. Incident Response Policy
    const hierarchyPolicy = GovernanceHierarchyService.getHierarchyStatement('Policy');
    artifacts.push({
      id: 'ir_policy',
      artifactType: 'Policy',
      title: 'Incident Response Policy',
      prompt: `${baseDirectives}\n\nDraft an Incident Response Policy.\nInclude this exact hierarchy statement: "${hierarchyPolicy}"\nInclude a Related Documents section listing:\n${relatedDocs}`,
      fallbackText: `# Incident Response Policy\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n## 1. Purpose\nTo establish a structured approach to handling cybersecurity incidents.\n\n## 2. Scope\nApplies to all employees and third-party contractors.\n\n## 3. Governance\n${hierarchyPolicy}\n\n## 4. Roles and Responsibilities\nThe CISO is responsible for directing the CSIRT during P1 incidents.\n\n## 5. Related Documents\n${relatedDocs}`
    });

    // 2. Incident Response Standard
    const hierarchyStandard = GovernanceHierarchyService.getHierarchyStatement('Standard');
    artifacts.push({
      id: 'ir_standard',
      artifactType: 'Standard',
      title: 'Incident Response Standard',
      prompt: `${baseDirectives}\n\nDraft an Incident Response Standard.\nDefine roles, containment requirements, eradication steps, and recovery expectations.\nInclude this exact hierarchy statement: "${hierarchyStandard}"`,
      fallbackText: `# Incident Response Standard\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyStandard}\n\n## 1. Containment Timelines\n- P1 (Critical): Contain within 4 hours.\n- P2 (High): Contain within 12 hours.\n- P3 (Medium): Contain within 48 hours.\n\n## 2. Eradication\nRoot cause must be identified and eliminated before systems are restored to production.`
    });

    // 3. Breach Notification Procedure
    const hierarchyProcedure = GovernanceHierarchyService.getHierarchyStatement('Procedure');
    artifacts.push({
      id: 'ir_procedure',
      artifactType: 'Procedure',
      title: 'Breach Notification Procedure',
      prompt: `${baseDirectives}\n\nDraft a Breach Notification Procedure.\nInclude internal escalation paths, regulatory notification timelines, and communication templates.\nInclude this exact hierarchy statement: "${hierarchyProcedure}"`,
      fallbackText: `# Breach Notification Procedure\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyProcedure}\n\n## 1. Escalation\nThe CSIRT Lead must notify Legal and PR within 1 hour of confirming a data breach.\n\n## 2. Regulatory Timeline\nRegulators must be notified within 72 hours of becoming aware of the breach.\n\n## 3. Communication Templates\n"We are investigating a potential data security incident. Systems have been secured..."`
    });

    // 4. Severity Matrix Workbook
    const hierarchyWorkbook = GovernanceHierarchyService.getHierarchyStatement('Workbook');
    artifacts.push({
      id: 'ir_severity',
      artifactType: 'Workbook',
      title: 'Severity Matrix Workbook',
      prompt: `${baseDirectives}\n\nDraft a Severity Matrix Workbook.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nCreate markdown tables defining incident severity levels (e.g., P1 to P4), criteria, required response times, and escalation paths.`,
      fallbackText: `# Severity Matrix Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n| Level | Description | Target Response | Target Resolution | Escalation |\n|---|---|---|---|---|\n| P1 | Critical business disruption or confirmed data breach | 15 mins | 4 hours | Executive Board |\n| P2 | Major system degradation | 30 mins | 8 hours | VP IT |\n| P3 | Minor local impact | 4 hours | 3 days | IT Manager |`
    });

    // 5. Communications Playbook
    artifacts.push({
      id: 'ir_comms',
      artifactType: 'Workbook',
      title: 'Communications Playbook',
      prompt: `${baseDirectives}\n\nDraft a Communications Playbook.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nInclude pre-drafted statements for media, customers, regulators, and internal staff for different incident types.`,
      fallbackText: `# Communications Playbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n## Media Holding Statement\n"We are currently experiencing technical difficulties affecting some of our services. Our teams are actively investigating..."\n\n## Employee Notification\n"Please disconnect from the VPN immediately and await further instructions from IT Security."`
    });

    // 6. Tabletop Exercise Workbook
    const hierarchyTesting = GovernanceHierarchyService.getHierarchyStatement('Testing Program');
    artifacts.push({
      id: 'ir_tabletop',
      artifactType: 'Workbook',
      title: 'Tabletop Exercise Workbook',
      prompt: `${baseDirectives}\n\nDraft a Tabletop Exercise Workbook.\nInclude this exact hierarchy statement: "${hierarchyTesting}"\nDesign a ransomware and data exfiltration scenario centered around this organizational dependency: ${deps.scenarios.cyberattackScenario}\nInclude injection timeline, participant instructions, and evaluation rubrics in markdown tables.`,
      fallbackText: `# Tabletop Exercise Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyTesting}\n\n## Scenario: ${deps.scenarios.cyberattackScenario}\n| Time | Inject | Expected Action |\n|---|---|---|\n| 09:00 | Helpdesk reports multiple users locked out of workstations. | CSIRT activated, initial triage. |\n| 10:30 | Threat actor emails CEO demanding 50 BTC. | Escalate to legal, draft holding statements. |\n| 14:00 | Actor publishes sample data on leak site. | Execute breach notification procedure. |`
    });

    // 7. Board Incident Report Template
    const hierarchyBoard = GovernanceHierarchyService.getHierarchyStatement('Board Pack');
    const keyPersonRisks = KeyPersonRiskService.generateKeyPersonRisks(organizationContext);
    
    let boardIntelligence = `\nBOARD CONTEXT:\n`;
    boardIntelligence += `- Primary Objective: ${organizationContext.primaryObjective || 'Operational Resilience'}\n`;
    boardIntelligence += `- Board Sensitivities: ${organizationContext.boardSensitivities || 'Downtime, Regulatory penalties'}\n`;
    boardIntelligence += `- Key Person Risks:\n  ${keyPersonRisks.map(r => '* ' + r).join('\n  ')}\n`;
    boardIntelligence += `Prioritize the tone and investment asks around the Primary Objective and Board Sensitivities above.\n`;

    artifacts.push({
      id: 'ir_board',
      artifactType: 'Board Pack',
      title: 'Board Incident Report Template',
      prompt: `${baseDirectives}\n${boardIntelligence}\nDraft a Board Incident Report Template.\nInclude this exact hierarchy statement: "${hierarchyBoard}"\n\nThe Board Pack MUST contain EXACTLY these sections:\n### Executive Summary\n### Top Dependencies (Highlight vendors and infrastructure)\n### Vendor Concentration Risks\n### Key Person Risks (Detail the key person risks provided)\n### Trend Since Previous Quarter\n### Residual Risk Heat Map\n### Open Actions\n### Recommended Investments (Tie directly to Primary Objective)\n### Decisions Required\n### RAG Indicators\n### Emerging Concerns`,
      fallbackText: `# Board Incident Report Template\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyBoard}\n\n### Executive Summary\n[Date] - [Brief description of the incident and threat actor attribution if known].\n\n### RAG Indicators\nOverall Status: RED.\n\n### Key Risks\nData exfiltration confirmed.\n\n### Open Actions\nDeploy enhanced EDR across fleet by [Target Completion Date].`
    });

    return artifacts;
  }
}

