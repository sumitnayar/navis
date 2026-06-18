import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class BcpPackService {
  static getArtifactDefinitions(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting a Business Continuity Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. BCP Policy
    artifacts.push({
      id: 'bcp_policy',
      artifactType: 'Policy',
      title: 'Business Continuity Policy',
      prompt: `${systemContext}\n\nDraft an institutional 12-section Business Continuity Policy.\nEnsure it aligns with ${frameworks.join(', ')}.\nContext: ${contextNarrative}`,
      fallbackText: `# Business Continuity Policy\n\n## 1. Purpose\nTo ensure the continuous operation of critical business functions during disruptive events.\n\n## 2. Scope\nApplies to all systems, personnel, and facilities globally.\n\n## 3. Governance\nThe Board retains ultimate accountability for BCP.\n\n## 4. BIA\nBusiness Impact Analyses must be conducted annually.\n\n## 5. Recovery Objectives\nRTO and RPO must be explicitly defined and approved.\n\n## 6. Testing\nExercises are required bi-annually.`
    });

    // 2. BCP Standard
    artifacts.push({
      id: 'bcp_standard',
      artifactType: 'Standard',
      title: 'Business Continuity Standard',
      prompt: `${systemContext}\n\nDraft a Business Continuity Standard.\nDefine Recovery tiers, RPO, RTO, Backup requirements, and Testing frequency.\nContext: ${contextNarrative}`,
      fallbackText: `# Business Continuity Standard\n\n## 1. Recovery Tiers\n- **Tier 1 (Mission Critical)**: RTO < 4 hours, RPO < 1 hour.\n- **Tier 2 (Critical)**: RTO < 24 hours, RPO < 4 hours.\n- **Tier 3 (Important)**: RTO < 72 hours, RPO < 24 hours.\n\n## 2. Backup Frequency\n- Tier 1: Continuous replication.\n- Tier 2: Daily immutable backups.`
    });

    // 3. Crisis Management Procedure
    artifacts.push({
      id: 'bcp_procedure',
      artifactType: 'Procedure',
      title: 'Crisis Management Procedure',
      prompt: `${systemContext}\n\nDraft a Crisis Management Procedure.\nDocument Activation, Escalation, Communications, Decision authority, and Return to operations.\nContext: ${contextNarrative}`,
      fallbackText: `# Crisis Management Procedure\n\n## 1. Activation\nAny employee can report a major incident to the Operations Center. The Crisis Management Team (CMT) is activated for P1/P2 incidents.\n\n## 2. Escalation\nThe CMT Director notifies the Executive Board within 2 hours of activation.\n\n## 3. Communications\nAll external communication must flow through the VP of Corporate Communications.`
    });

    // 4. BIA Workbook
    artifacts.push({
      id: 'bcp_bia',
      artifactType: 'Workbook',
      title: 'Business Impact Analysis Workbook',
      prompt: `${systemContext}\n\nDraft a Business Impact Analysis Workbook.\nGenerate editable markdown tables for: Critical functions, Dependencies, Owners, Recovery targets, and Priorities.\nContext: ${contextNarrative}`,
      fallbackText: `# BIA Workbook\n\n| Function | Owner | MTPD | RTO | RPO | Dependencies |\n|---|---|---|---|---|---|\n| Payment Processing | CFO | 4 hours | 2 hours | 15 mins | Payment Gateway API |\n| Customer Support | VP Support | 24 hours | 12 hours | 4 hours | CRM, Telephony |`
    });

    // 5. Scenario Workbook
    artifacts.push({
      id: 'bcp_scenario',
      artifactType: 'Workbook',
      title: 'Scenario Workbook',
      prompt: `${systemContext}\n\nDraft a Scenario Workbook including:\n- Cyberattack\n- Cloud outage\n- Key executive loss\n- Supplier disruption\n- Office unavailability\n- Pandemic\n\nFor each scenario, generate markdown tables with: Trigger, Impact, Detection, Response pathways, and Recovery assumptions.\nContext: ${contextNarrative}`,
      fallbackText: `# Scenario Workbook\n\n## Cyberattack Scenario\n| Trigger | Impact | Detection | Response | Recovery |\n|---|---|---|---|---|\n| Ransomware execution | High | EDR Alert | Isolate network, activate IR plan | Restore from immutable backups |\n\n## Cloud Outage\n| Trigger | Impact | Detection | Response | Recovery |\n|---|---|---|---|---|\n| AWS/Azure Region Failure | Critical | Monitoring Alerts | Failover to secondary region | Confirm data consistency post-failover |`
    });

    // 6. Testing Program
    artifacts.push({
      id: 'bcp_testing',
      artifactType: 'Testing Program',
      title: 'Business Continuity Testing Program',
      prompt: `${systemContext}\n\nDraft a Testing Program.\nGenerate markdown tables for: Tabletop schedule, Failover exercises, Simulation exercises, Success criteria, and Lessons learned register.\nContext: ${contextNarrative}`,
      fallbackText: `# Testing Program\n\n| Exercise Type | Frequency | Target Audience | Success Criteria |\n|---|---|---|---|\n| Tabletop | Bi-annually | CMT, Executives | Plan familiarity, gap identification |\n| Technical Failover | Annually | IT Operations | RTO/RPO achieved without data loss |`
    });

    // 7. Board Reporting Pack
    artifacts.push({
      id: 'bcp_board',
      artifactType: 'Board Pack',
      title: 'Business Continuity Board Report',
      prompt: `${systemContext}\n\nDraft a Board Reporting Pack.\nInclude: Executive Summary, Critical Risks, Testing Status, Recovery Capability, Open Actions, and RAG Indicators.\nContext: ${contextNarrative}`,
      fallbackText: `# Board Reporting Pack\n\n## Executive Summary\nThe organization's resilience posture remains stable (Status: GREEN). Recent tests indicate Tier 1 systems meet recovery targets.\n\n## Key Risks\n- Concentration risk with single cloud provider.\n- Key person dependencies in critical engineering roles.\n\n## Testing Status\n- 100% of required tabletop exercises completed.\n- Technical failover successful with minor RTO breaches.`
    });

    return artifacts;
  }
}
