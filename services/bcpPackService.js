import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class BcpPackService {
  static async generate(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting a Business Continuity Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. BCP Policy
    const policyPrompt = `Draft an institutional 12-section Business Continuity Policy.\nEnsure it aligns with ${frameworks.join(', ')}.\nContext: ${contextNarrative}`;
    const policyText = await AIService.queryGemini(policyPrompt, systemContext);
    artifacts.push({ artifactType: 'Policy', title: 'Business Continuity Policy', documentText: policyText });

    // 2. BCP Standard
    const standardPrompt = `Draft a Business Continuity Standard.\nDefine Recovery tiers, RPO, RTO, Backup requirements, and Testing frequency.\nContext: ${contextNarrative}`;
    const standardText = await AIService.queryGemini(standardPrompt, systemContext);
    artifacts.push({ artifactType: 'Standard', title: 'Business Continuity Standard', documentText: standardText });

    // 3. Crisis Management Procedure
    const procedurePrompt = `Draft a Crisis Management Procedure.\nDocument Activation, Escalation, Communications, Decision authority, and Return to operations.\nContext: ${contextNarrative}`;
    const procedureText = await AIService.queryGemini(procedurePrompt, systemContext);
    artifacts.push({ artifactType: 'Procedure', title: 'Crisis Management Procedure', documentText: procedureText });

    // 4. BIA Workbook
    const biaPrompt = `Draft a Business Impact Analysis Workbook.\nGenerate editable markdown tables for: Critical functions, Dependencies, Owners, Recovery targets, and Priorities.\nContext: ${contextNarrative}`;
    const biaText = await AIService.queryGemini(biaPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Business Impact Analysis Workbook', documentText: biaText });

    // 5. Scenario Workbook
    const scenarioPrompt = `Draft a Scenario Workbook including:\n- Cyberattack\n- Cloud outage\n- Key executive loss\n- Supplier disruption\n- Office unavailability\n- Pandemic\n\nFor each scenario, generate markdown tables with: Trigger, Impact, Detection, Response pathways, and Recovery assumptions.\nContext: ${contextNarrative}`;
    const scenarioText = await AIService.queryGemini(scenarioPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Scenario Workbook', documentText: scenarioText });

    // 6. Testing Program
    const testingPrompt = `Draft a Testing Program.\nGenerate markdown tables for: Tabletop schedule, Failover exercises, Simulation exercises, Success criteria, and Lessons learned register.\nContext: ${contextNarrative}`;
    const testingText = await AIService.queryGemini(testingPrompt, systemContext);
    artifacts.push({ artifactType: 'Testing Program', title: 'Business Continuity Testing Program', documentText: testingText });

    // 7. Board Reporting Pack
    const boardPrompt = `Draft a Board Reporting Pack.\nInclude: Executive Summary, Critical Risks, Testing Status, Recovery Capability, Open Actions, and RAG Indicators.\nContext: ${contextNarrative}`;
    const boardText = await AIService.queryGemini(boardPrompt, systemContext);
    artifacts.push({ artifactType: 'Board Pack', title: 'Business Continuity Board Report', documentText: boardText });

    return { packName: 'Business Continuity Governance Pack', domain: 'bcp', artifacts };
  }
}
