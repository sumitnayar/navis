import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class IncidentResponsePackService {
  static async generate(frameworks, organizationContext, apiKey) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting an Incident Response Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. Incident Response Policy
    const policyPrompt = `${systemContext}\n\nDraft an Incident Response Policy.\nContext: ${contextNarrative}`;
    const policyText = await AIService.queryGemini(policyPrompt, apiKey);
    artifacts.push({ artifactType: 'Policy', title: 'Incident Response Policy', documentText: policyText });

    // 2. Incident Response Standard
    const standardPrompt = `${systemContext}\n\nDraft an Incident Response Standard.\nDefine roles, containment requirements, eradication steps, and recovery expectations.\nContext: ${contextNarrative}`;
    const standardText = await AIService.queryGemini(standardPrompt, apiKey);
    artifacts.push({ artifactType: 'Standard', title: 'Incident Response Standard', documentText: standardText });

    // 3. Breach Notification Procedure
    const procedurePrompt = `${systemContext}\n\nDraft a Breach Notification Procedure.\nInclude internal escalation paths, regulatory notification timelines, and communication templates.\nContext: ${contextNarrative}`;
    const procedureText = await AIService.queryGemini(procedurePrompt, apiKey);
    artifacts.push({ artifactType: 'Procedure', title: 'Breach Notification Procedure', documentText: procedureText });

    // 4. Severity Matrix Workbook
    const severityPrompt = `${systemContext}\n\nDraft a Severity Matrix Workbook.\nCreate markdown tables defining incident severity levels (e.g., P1 to P4), criteria, required response times, and escalation paths.\nContext: ${contextNarrative}`;
    const severityText = await AIService.queryGemini(severityPrompt, apiKey);
    artifacts.push({ artifactType: 'Workbook', title: 'Severity Matrix Workbook', documentText: severityText });

    // 5. Communications Playbook
    const commsPrompt = `${systemContext}\n\nDraft a Communications Playbook.\nInclude pre-drafted statements for media, customers, regulators, and internal staff for different incident types.\nContext: ${contextNarrative}`;
    const commsText = await AIService.queryGemini(commsPrompt, apiKey);
    artifacts.push({ artifactType: 'Workbook', title: 'Communications Playbook', documentText: commsText });

    // 6. Tabletop Exercise Workbook
    const tabletopPrompt = `${systemContext}\n\nDraft a Tabletop Exercise Workbook.\nDesign a ransomware and data exfiltration scenario. Include injection timeline, participant instructions, and evaluation rubrics in markdown tables.\nContext: ${contextNarrative}`;
    const tabletopText = await AIService.queryGemini(tabletopPrompt, apiKey);
    artifacts.push({ artifactType: 'Workbook', title: 'Tabletop Exercise Workbook', documentText: tabletopText });

    // 7. Board Incident Report Template
    const boardPrompt = `${systemContext}\n\nDraft a Board Incident Report Template.\nDesign a template for reporting a major incident to the Board of Directors. Include sections for: Incident Summary, Impact Analysis, Containment Actions, Root Cause, and Remediation Plan.\nContext: ${contextNarrative}`;
    const boardText = await AIService.queryGemini(boardPrompt, apiKey);
    artifacts.push({ artifactType: 'Board Pack', title: 'Board Incident Report Template', documentText: boardText });

    return { packName: 'Incident Response Governance Pack', domain: 'ir', artifacts };
  }
}
