import { AIService } from './aiService.js';
import { OrganizationContextService } from './organizationContextService.js';

export class VendorRiskPackService {
  static async generate(frameworks, organizationContext) {
    const artifacts = [];
    const contextNarrative = OrganizationContextService.generateNarrative(organizationContext, frameworks);
    const systemContext = `You are a Big 4 management consultant drafting a Vendor Risk Governance Pack.\nCompany Profile: ${JSON.stringify(organizationContext)}\nFrameworks: ${frameworks.join(', ')}\n\nStrictly output in Markdown format.`;

    // 1. Vendor Risk Policy
    const policyPrompt = `Draft a Vendor Risk Policy.\nEstablish the governance framework for managing third-party risk throughout the vendor lifecycle.\nContext: ${contextNarrative}`;
    const policyText = await AIService.queryGemini(policyPrompt, systemContext);
    artifacts.push({ artifactType: 'Policy', title: 'Vendor Risk Policy', documentText: policyText });

    // 2. Third Party Standard
    const standardPrompt = `Draft a Third Party Standard.\nDefine security requirements for vendors, data protection clauses, and right-to-audit terms.\nContext: ${contextNarrative}`;
    const standardText = await AIService.queryGemini(standardPrompt, systemContext);
    artifacts.push({ artifactType: 'Standard', title: 'Third Party Security Standard', documentText: standardText });

    // 3. Due Diligence Procedure
    const procedurePrompt = `Draft a Due Diligence Procedure.\nDocument the steps for assessing new vendors, scoring risk, and onboarding.\nContext: ${contextNarrative}`;
    const procedureText = await AIService.queryGemini(procedurePrompt, systemContext);
    artifacts.push({ artifactType: 'Procedure', title: 'Vendor Due Diligence Procedure', documentText: procedureText });

    // 4. Vendor Assessment Workbook
    const assessmentPrompt = `Draft a Vendor Assessment Workbook.\nGenerate markdown tables for evaluating a vendor's security controls across domains (e.g., Access Control, Data Security, Incident Response).\nContext: ${contextNarrative}`;
    const assessmentText = await AIService.queryGemini(assessmentPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Vendor Assessment Workbook', documentText: assessmentText });

    // 5. Critical Supplier Register
    const registerPrompt = `Draft a Critical Supplier Register.\nGenerate markdown tables to track critical suppliers, risk ratings, next assessment dates, and relationship owners.\nContext: ${contextNarrative}`;
    const registerText = await AIService.queryGemini(registerPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Critical Supplier Register', documentText: registerText });

    // 6. Monitoring Calendar
    const calendarPrompt = `Draft a Monitoring Calendar.\nGenerate a schedule in markdown tables for periodic vendor reviews, contract renewals, and continuous monitoring activities.\nContext: ${contextNarrative}`;
    const calendarText = await AIService.queryGemini(calendarPrompt, systemContext);
    artifacts.push({ artifactType: 'Workbook', title: 'Vendor Monitoring Calendar', documentText: calendarText });

    // 7. Board Vendor Risk Summary
    const boardPrompt = `Draft a Board Vendor Risk Summary.\nInclude: High-Risk Vendor Overview, Concentration Risk, Recent Breaches involving third parties, and Compliance Status.\nContext: ${contextNarrative}`;
    const boardText = await AIService.queryGemini(boardPrompt, systemContext);
    artifacts.push({ artifactType: 'Board Pack', title: 'Board Vendor Risk Summary', documentText: boardText });

    return { packName: 'Vendor Risk Governance Pack', domain: 'vendor', artifacts };
  }
}
