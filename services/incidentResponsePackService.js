import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class IncidentResponsePackService {
  static async generate(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting an Incident Response Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. Incident Response Policy
    const policyPrompt = `Draft an Incident Response Policy.\nContext: ${contextNarrative}`;
    const policyText = await AIService.queryGemini(policyPrompt, systemContext);
    artifacts.push({ artifactType: 'Policy', title: 'Incident Response Policy', documentText: policyText });

    // 2. Incident Response Standard
    const standardPrompt = `Draft an Incident Response Standard.\nDefine roles, containment requirements, eradication steps, and recovery expectations.\nContext: ${contextNarrative}`;
    const standardText = await AIService.queryGemini(standardPrompt, systemContext);
    artifacts.push({ artifactType: 'Standard', title: 'Incident Response Standard', documentText: standardText });

    // 3. Breach Notification Procedure
    const procedurePrompt = `Draft a Breach Notification Procedure.\nInclude internal escalation paths, regulatory notification timelines, and communication templates.\nContext: ${contextNarrative}`;
    const procedureText = await AIService.queryGemini(procedurePrompt, systemContext);
    artifacts.push({ artifactType: 'Procedure', title: 'Breach Notification Procedure', documentText: procedureText });

    // 4. Severity Matrix Workbook
    const severityPrompt = `Draft a Severity Matrix Workbook.\nCreate markdown tables defining incident severity levels (e.g., P1 to P4), criteria, required response times, and escalation paths.\nContext: ${contextNarrative}`;
    const severityText = await AIService.queryGemini(severityPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Severity Matrix Workbook', documentText: severityText });

    // 5. Communications Playbook
    const commsPrompt = `Draft a Communications Playbook.\nInclude pre-drafted statements for media, customers, regulators, and internal staff for different incident types.\nContext: ${contextNarrative}`;
    const commsText = await AIService.queryGemini(commsPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Communications Playbook', documentText: commsText });

    // 6. Tabletop Exercise Workbook
    const tabletopPrompt = `Draft a Tabletop Exercise Workbook.\nDesign a ransomware and data exfiltration scenario. Include injection timeline, participant instructions, and evaluation rubrics in markdown tables.\nContext: ${contextNarrative}`;
    const tabletopText = await AIService.queryGemini(tabletopPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Tabletop Exercise Workbook', documentText: tabletopText });

    // 7. Board Incident Report Template
    const boardPrompt = `Draft a Board Incident Report Template.\nDesign a template for reporting a major incident to the Board of Directors. Include sections for: Incident Summary, Impact Analysis, Containment Actions, Root Cause, and Remediation Plan.\nContext: ${contextNarrative}`;
    const boardText = await AIService.queryGemini(boardPrompt, systemContext);
    artifacts.push({ artifactType: 'Board Pack', title: 'Board Incident Report Template', documentText: boardText });

    return { packName: 'Incident Response Governance Pack', domain: 'ir', artifacts };
  }
}
