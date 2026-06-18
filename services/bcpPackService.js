import { AIService } from './aiService.js';
import { GovernanceHierarchyService } from './governanceHierarchyService.js';
import { DocumentCrossReferenceService } from './documentCrossReferenceService.js';
import { OwnershipService } from './ownershipService.js';
import { SentenceVariationService } from './sentenceVariationService.js';
import { OrganizationDependencyService } from './organizationDependencyService.js';
import { KeyPersonRiskService } from './keyPersonRiskService.js';

export class BcpPackService {
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
    intelligenceDirectives += `\nAvoid generic phrasing like "Cloud Outage" or "System Failure". Explicitly use the specific vendors, threats, and products listed above.\n`;

    const baseDirectives = `
You are a Big 4 management consultant drafting a Business Continuity Governance Pack.
Strictly output in Markdown format.

${SentenceVariationService.getLinguisticInstructions()}
${OwnershipService.getRaciDistribution()}
${intelligenceDirectives}

ANTI-HALLUCINATION: NEVER fabricate dates, exercises, incidents, historical tests, quarters, or metrics. Use placeholders like [Last Test Date], [Previous Quarter], [Target Completion Date], [Next Exercise Date].

ORGANIZATION ASSUMPTIONS: Assume the reader has read the Governance Pack Cover Page. Do not summarize the company profile. Include the exact text: "ORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page."
`;

    const relatedDocs = DocumentCrossReferenceService.getRelatedDocuments('bcp');

    // 1. BCP Policy
    const hierarchyPolicy = GovernanceHierarchyService.getHierarchyStatement('Policy');
    artifacts.push({
      id: 'bcp_policy',
      artifactType: 'Policy',
      title: 'Business Continuity Policy',
      prompt: `${baseDirectives}\n\nDraft an institutional Business Continuity Policy.\nEnsure it aligns with ${frameworks.join(', ')}.\nInclude this exact hierarchy statement: "${hierarchyPolicy}"\nInclude a Related Documents section listing:\n${relatedDocs}`,
      fallbackText: `# Business Continuity Policy\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n## 1. Purpose\nTo ensure the continuous operation of critical business functions during disruptive events.\n\n## 2. Scope\nApplies to all systems, personnel, and facilities globally.\n\n## 3. Governance\n${hierarchyPolicy}\n\nThe Board retains ultimate accountability for BCP.\n\n## 4. Related Documents\n${relatedDocs}`
    });

    // 2. BCP Standard
    const hierarchyStandard = GovernanceHierarchyService.getHierarchyStatement('Standard');
    artifacts.push({
      id: 'bcp_standard',
      artifactType: 'Standard',
      title: 'Business Continuity Standard',
      prompt: `${baseDirectives}\n\nDraft a Business Continuity Standard.\nDefine Recovery tiers, RPO, RTO, Backup requirements, and Testing frequency.\nInclude this exact hierarchy statement: "${hierarchyStandard}"`,
      fallbackText: `# Business Continuity Standard\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyStandard}\n\n## 1. Recovery Tiers\n- **Tier 1 (Mission Critical)**: RTO < 4 hours, RPO < 1 hour.\n- **Tier 2 (Critical)**: RTO < 24 hours, RPO < 4 hours.\n- **Tier 3 (Important)**: RTO < 72 hours, RPO < 24 hours.\n\n## 2. Backup Frequency\n- Tier 1: Continuous replication.\n- Tier 2: Daily immutable backups.`
    });

    // 3. Crisis Management Procedure
    const hierarchyProcedure = GovernanceHierarchyService.getHierarchyStatement('Procedure');
    artifacts.push({
      id: 'bcp_procedure',
      artifactType: 'Procedure',
      title: 'Crisis Management Procedure',
      prompt: `${baseDirectives}\n\nDraft a Crisis Management Procedure.\nInclude this exact hierarchy statement: "${hierarchyProcedure}"\n\nStrictly use the following 5 sections only: Activation, Escalation, Communications, Authority, Return to operations.\nLimit table column widths to prevent malformed markdown tables.`,
      fallbackText: `# Crisis Management Procedure\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyProcedure}\n\n## 1. Activation\nAny employee can report a major incident to the Operations Center. The Crisis Management Team (CMT) is activated for P1/P2 incidents.\n\n## 2. Escalation\nThe CMT Director notifies the Executive Board within 2 hours of activation.\n\n## 3. Communications\nAll external communication must flow through the VP of Corporate Communications.\n\n## 4. Authority\nThe CEO retains ultimate authority to declare a disaster.\n\n## 5. Return to Operations\nOperations resume normal state once the primary site is verified safe.`
    });

    // 4. BIA Workbook
    const hierarchyWorkbook = GovernanceHierarchyService.getHierarchyStatement('Workbook');
    artifacts.push({
      id: 'bcp_bia',
      artifactType: 'Workbook',
      title: 'Business Impact Analysis Workbook',
      prompt: `${baseDirectives}\n\nDraft a Business Impact Analysis Workbook.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\nGenerate editable markdown tables for: Critical functions, Dependencies, Owners, Recovery targets, and Priorities.`,
      fallbackText: `# BIA Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n| Function | Owner | MTPD | RTO | RPO | Dependencies |\n|---|---|---|---|---|---|\n| Payment Processing | CFO | 4 hours | 2 hours | 15 mins | Payment Gateway API |\n| Customer Support | VP Support | 24 hours | 12 hours | 4 hours | CRM, Telephony |`
    });

    // 5. Scenario Workbook
    artifacts.push({
      id: 'bcp_scenario',
      artifactType: 'Workbook',
      title: 'Scenario Workbook',
      prompt: `${baseDirectives}\n\nDraft a Scenario Workbook for tabletop exercises.\nInclude this exact hierarchy statement: "${hierarchyWorkbook}"\n\nDo not use generic scenarios like "Cloud Outage". Instead, build scenarios around these specific organizational dependencies:\n1. ${deps.scenarios.cloudOutageScenario}\n2. ${deps.scenarios.supplierDisruptionScenario}\n3. ${deps.scenarios.cyberattackScenario}\n\nFor each scenario, generate markdown tables with: Trigger, Impact, Detection, Response pathways, and Recovery assumptions.`,
      fallbackText: `# Scenario Workbook\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyWorkbook}\n\n## 1. ${deps.scenarios.cloudOutageScenario}\n| Trigger | Impact | Detection | Response | Recovery |\n|---|---|---|---|---|\n| Region Failure | Critical | Monitoring Alerts | Failover to secondary region | Confirm data consistency post-failover |`
    });

    // 6. Testing Program
    const hierarchyTesting = GovernanceHierarchyService.getHierarchyStatement('Testing Program');
    artifacts.push({
      id: 'bcp_testing',
      artifactType: 'Testing Program',
      title: 'Business Continuity Testing Program',
      prompt: `${baseDirectives}\n\nDraft a Testing Program.\nInclude this exact hierarchy statement: "${hierarchyTesting}"\nGenerate markdown tables for: Tabletop schedule, Failover exercises, Simulation exercises, Success criteria, and Lessons learned register.`,
      fallbackText: `# Testing Program\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyTesting}\n\n| Exercise Type | Frequency | Target Audience | Success Criteria |\n|---|---|---|---|\n| Tabletop | Bi-annually | CMT, Executives | Plan familiarity, gap identification |\n| Technical Failover | Annually | IT Operations | RTO/RPO achieved without data loss |`
    });

    // 7. Board Reporting Pack
    const hierarchyBoard = GovernanceHierarchyService.getHierarchyStatement('Board Pack');
    const keyPersonRisks = KeyPersonRiskService.generateKeyPersonRisks(organizationContext);
    
    let boardIntelligence = `\nBOARD CONTEXT:\n`;
    boardIntelligence += `- Primary Objective: ${organizationContext.primaryObjective || 'Operational Resilience'}\n`;
    boardIntelligence += `- Board Sensitivities: ${organizationContext.boardSensitivities || 'Downtime, Regulatory penalties'}\n`;
    boardIntelligence += `- Key Person Risks:\n  ${keyPersonRisks.map(r => '* ' + r).join('\n  ')}\n`;
    boardIntelligence += `Prioritize the tone and investment asks around the Primary Objective and Board Sensitivities above.\n`;

    artifacts.push({
      id: 'bcp_board',
      artifactType: 'Board Pack',
      title: 'Business Continuity Board Report',
      prompt: `${baseDirectives}\n${boardIntelligence}\nDraft a Board Reporting Pack.\nInclude this exact hierarchy statement: "${hierarchyBoard}"\n\nThe Board Pack MUST contain EXACTLY these sections:\n### Executive Summary\n### Top Dependencies (Highlight vendors and infrastructure)\n### Vendor Concentration Risks\n### Key Person Risks (Detail the key person risks provided)\n### Trend Since Previous Quarter\n### Residual Risk Heat Map\n### Open Actions\n### Recommended Investments (Tie directly to Primary Objective)\n### Decisions Required\n### RAG Indicators\n### Emerging Concerns`,
      fallbackText: `# Board Reporting Pack\n\nORGANIZATION ASSUMPTIONS: Refer to Governance Pack Cover Page.\n\n${hierarchyBoard}\n\n### Executive Summary\nThe organization's resilience posture remains stable.\n\n### RAG Indicators\nOverall Status: GREEN.\n\n### Key Risks\nConcentration risk with primary cloud provider.\n\n### Open Actions\nComplete secondary region failover test by [Target Completion Date].`
    });

    return artifacts;
  }
}

