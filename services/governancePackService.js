import { BcpPackService } from './bcpPackService.js';
import { IncidentResponsePackService } from './incidentResponsePackService.js';
import { VendorRiskPackService } from './vendorRiskPackService.js';

export class GovernancePackService {
  /**
   * Orchestrates the sequential generation of a full Governance Pack.
   *
   * @param {string} domain - Pack domain ('bcp', 'ir', 'vendor')
   * @param {Array<string>} frameworks - Selected frameworks (e.g., ['ISO 27001'])
   * @param {Object} organizationContext - Company profile context
   * @returns {Object} { packName, artifacts: [{ artifactType, title, documentText }] }
   */
  static async generatePack(domain, frameworks, organizationContext) {
    if (domain === 'bcp') {
      return await BcpPackService.generate(frameworks, organizationContext);
    } else if (domain === 'ir') {
      return await IncidentResponsePackService.generate(frameworks, organizationContext);
    } else if (domain === 'vendor') {
      return await VendorRiskPackService.generate(frameworks, organizationContext);
    } else {
      throw new Error(`Unknown pack domain: ${domain}`);
    }
  }
}
