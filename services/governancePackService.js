import { BcpPackService } from './bcpPackService.js';
import { IncidentResponsePackService } from './incidentResponsePackService.js';
import { VendorRiskPackService } from './vendorRiskPackService.js';
import { OrganizationIntelligenceService } from './organizationIntelligenceService.js';

export class GovernancePackService {
  /**
   * Orchestrates the retrieval of artifact definitions for a Governance Pack.
   *
   * @param {string} domain - Pack domain ('bcp', 'ir', 'vendor')
   * @param {Array<string>} frameworks - Selected frameworks (e.g., ['ISO 27001'])
   * @param {Object} organizationContext - User inputs from Platform Settings
   * @returns {Object} { packName, domain, artifacts }
   */
  static getArtifactDefinitions(domain, frameworks, organizationContext) {
    let domainArtifacts = [];
    
    switch (domain) {
      case 'bcp':
        domainArtifacts = BcpPackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      case 'ir':
        domainArtifacts = IncidentResponsePackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      case 'vendor':
        domainArtifacts = VendorRiskPackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      default:
        throw new Error(`Unknown pack domain: ${domain}`);
    }

    const domainNames = {
      'bcp': 'Business Continuity',
      'ir': 'Incident Response',
      'vendor': 'Vendor Risk'
    };

    const coverPageMarkdown = OrganizationIntelligenceService.generateCoverPage(domain, organizationContext, frameworks);

    // AI Prompt for the Executive Summary, relying on the cover page data
    const execSummaryPrompt = `You are a Big 4 management consultant drafting an Executive Summary for a ${domainNames[domain]} Governance Pack.
Strictly output in Markdown format.

Never fabricate dates, exercises, incidents, metrics, or quarters. Use placeholders like [Last Test Date], [Previous Quarter], [Target Completion Date], [Next Exercise Date].

Structure the document exactly as follows:
# ${domainNames[domain]} Pack: Executive Summary
## Major Assumptions
## Critical Dependencies
## Key Risks
## Recovery Philosophy / Risk Appetite
## Applicable Regulations
`;

    const coreArtifacts = [
      {
        id: 'pack_cover_page',
        artifactType: 'Cover Page',
        title: 'Governance Pack Cover Page',
        prompt: null, // Deterministic! No AI call needed.
        fallbackText: coverPageMarkdown,
        isDeterministic: true
      },
      {
        id: 'pack_exec_summary',
        artifactType: 'Executive Summary',
        title: 'Pack Executive Summary',
        prompt: execSummaryPrompt,
        fallbackText: `# ${domainNames[domain]} Pack: Executive Summary\n\n## Major Assumptions\nThe organization operates a heavily digital business model.\n\n## Critical Dependencies\nCloud infrastructure and key third-party vendors.\n\n## Key Risks\nService availability and data breach risks.\n\n## Recovery Philosophy\nAvailability-first.\n\n## Applicable Regulations\nStandard industry compliance frameworks.`
      },
      ...domainArtifacts
    ];

    return {
      packName: `${domainNames[domain] || domain.toUpperCase()} Governance Pack`,
      domain: domain,
      artifacts: coreArtifacts
    };
  }
}
