import { BcpPackService } from './bcpPackService.js';
import { IncidentResponsePackService } from './incidentResponsePackService.js';
import { VendorRiskPackService } from './vendorRiskPackService.js';

export class GovernancePackService {
  /**
   * Orchestrates the retrieval of artifact definitions for a Governance Pack.
   *
   * @param {string} domain - Pack domain ('bcp', 'ir', 'vendor')
   * @param {Array<string>} frameworks - Selected frameworks (e.g., ['ISO 27001'])
   * @param {Object} organizationContext - Company profile context
   * @returns {Object} { packName, domain, artifacts }
   */
  static getArtifactDefinitions(domain, frameworks, organizationContext) {
    let artifacts = [];
    
    switch (domain) {
      case 'bcp':
        artifacts = BcpPackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      case 'ir':
        artifacts = IncidentResponsePackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      case 'vendor':
        artifacts = VendorRiskPackService.getArtifactDefinitions(frameworks, organizationContext);
        break;
      default:
        throw new Error(`Unknown pack domain: ${domain}`);
    }

    const domainNames = {
      'bcp': 'Business Continuity',
      'ir': 'Incident Response',
      'vendor': 'Vendor Risk'
    };

    return {
      packName: `${domainNames[domain] || domain.toUpperCase()} Governance Pack`,
      domain: domain,
      artifacts: artifacts
    };
  }
}
