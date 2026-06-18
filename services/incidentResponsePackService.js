import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class IncidentResponsePackService {
  static getArtifactDefinitions(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting an Incident Response Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. Incident Response Policy
    artifacts.push({
      id: 'ir_policy',
      artifactType: 'Policy',
      title: 'Incident Response Policy',
      prompt: `${systemContext}\n\nDraft an Incident Response Policy.\nContext: ${contextNarrative}`,
      fallbackText: `# Incident Response Policy\n\n## 1. Purpose\nTo establish a structured approach to handling cybersecurity incidents.\n\n## 2. Scope\nApplies to all employees and third-party contractors.\n\n## 3. Roles and Responsibilities\nThe CISO is responsible for directing the CSIRT during P1 incidents.\n\n## 4. Incident Phases\nPreparation, Detection & Analysis, Containment, Eradication, Recovery, and Post-Incident Activity.`
    });

    // 2. Incident Response Standard
    artifacts.push({
      id: 'ir_standard',
      artifactType: 'Standard',
      title: 'Incident Response Standard',
      prompt: `${systemContext}\n\nDraft an Incident Response Standard.\nDefine roles, containment requirements, eradication steps, and recovery expectations.\nContext: ${contextNarrative}`,
      fallbackText: `# Incident Response Standard\n\n## 1. Containment Timelines\n- P1 (Critical): Contain within 4 hours.\n- P2 (High): Contain within 12 hours.\n- P3 (Medium): Contain within 48 hours.\n\n## 2. Eradication\nRoot cause must be identified and eliminated before systems are restored to production.`
    });

    // 3. Breach Notification Procedure
    artifacts.push({
      id: 'ir_procedure',
      artifactType: 'Procedure',
      title: 'Breach Notification Procedure',
      prompt: `${systemContext}\n\nDraft a Breach Notification Procedure.\nInclude internal escalation paths, regulatory notification timelines, and communication templates.\nContext: ${contextNarrative}`,
      fallbackText: `# Breach Notification Procedure\n\n## 1. Escalation\nThe CSIRT Lead must notify Legal and PR within 1 hour of confirming a data breach.\n\n## 2. Regulatory Timeline\nRegulators must be notified within 72 hours of becoming aware of the breach.\n\n## 3. Communication Templates\n"We are investigating a potential data security incident. Systems have been secured..."`
    });

    // 4. Severity Matrix Workbook
    artifacts.push({
      id: 'ir_severity',
      artifactType: 'Workbook',
      title: 'Severity Matrix Workbook',
      prompt: `${systemContext}\n\nDraft a Severity Matrix Workbook.\nCreate markdown tables defining incident severity levels (e.g., P1 to P4), criteria, required response times, and escalation paths.\nContext: ${contextNarrative}`,
      fallbackText: `# Severity Matrix Workbook\n\n| Level | Description | Target Response | Target Resolution | Escalation |\n|---|---|---|---|---|\n| P1 | Critical business disruption or confirmed data breach | 15 mins | 4 hours | Executive Board |\n| P2 | Major system degradation | 30 mins | 8 hours | VP IT |\n| P3 | Minor local impact | 4 hours | 3 days | IT Manager |`
    });

    // 5. Communications Playbook
    artifacts.push({
      id: 'ir_comms',
      artifactType: 'Workbook',
      title: 'Communications Playbook',
      prompt: `${systemContext}\n\nDraft a Communications Playbook.\nInclude pre-drafted statements for media, customers, regulators, and internal staff for different incident types.\nContext: ${contextNarrative}`,
      fallbackText: `# Communications Playbook\n\n## Media Holding Statement\n"We are currently experiencing technical difficulties affecting some of our services. Our teams are actively investigating..."\n\n## Employee Notification\n"Please disconnect from the VPN immediately and await further instructions from IT Security."`
    });

    // 6. Tabletop Exercise Workbook
    artifacts.push({
      id: 'ir_tabletop',
      artifactType: 'Workbook',
      title: 'Tabletop Exercise Workbook',
      prompt: `${systemContext}\n\nDraft a Tabletop Exercise Workbook.\nDesign a ransomware and data exfiltration scenario. Include injection timeline, participant instructions, and evaluation rubrics in markdown tables.\nContext: ${contextNarrative}`,
      fallbackText: `# Tabletop Exercise Workbook\n\n## Scenario: Double Extortion Ransomware\n| Time | Inject | Expected Action |\n|---|---|---|\n| 09:00 | Helpdesk reports multiple users locked out of workstations. | CSIRT activated, initial triage. |\n| 10:30 | Threat actor emails CEO demanding 50 BTC. | Escalate to legal, draft holding statements. |\n| 14:00 | Actor publishes sample data on leak site. | Execute breach notification procedure. |`
    });

    // 7. Board Incident Report Template
    artifacts.push({
      id: 'ir_board',
      artifactType: 'Board Pack',
      title: 'Board Incident Report Template',
      prompt: `${systemContext}\n\nDraft a Board Incident Report Template.\nDesign a template for reporting a major incident to the Board of Directors. Include sections for: Incident Summary, Impact Analysis, Containment Actions, Root Cause, and Remediation Plan.\nContext: ${contextNarrative}`,
      fallbackText: `# Board Incident Report Template\n\n## Incident Summary\n[Date] - [Brief description of the incident and threat actor attribution if known].\n\n## Impact Analysis\n- Financial: [$ Value]\n- Operational: [Downtime metrics]\n- Reputational: [Media coverage]\n\n## Containment Actions\n[List of actions taken to secure the environment].\n\n## Root Cause\n[Technical explanation of how the breach occurred].\n\n## Remediation Plan\n[List of strategic improvements to prevent recurrence].`
    });

    return artifacts;
  }
}
