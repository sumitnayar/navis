export class KeyPersonRiskService {
  /**
   * Generates dynamic key person dependency statements based on executive roles and critical processes.
   */
  static generateKeyPersonRisks(profile) {
    const roles = profile.executiveRoles || {};
    const risks = [];

    if (roles.cto) {
      risks.push(`CTO dependency (${roles.cto}) on architecture decisions and core platform stability.`);
    } else {
      risks.push(`CTO dependency on architecture decisions and core platform stability.`);
    }

    if (roles.engineeringHead) {
      risks.push(`Engineering Head dependency (${roles.engineeringHead}) on day-to-day engineering operations.`);
    }

    if (roles.bcmLead) {
      risks.push(`Single points of failure in BCM Lead role (${roles.bcmLead}) during critical incidents.`);
    }

    const cloudProvider = profile.cloudProvider || "AWS";
    risks.push(`Vendor knowledge concentration around ${cloudProvider} infrastructure.`);

    const criticalProcess = profile.criticalProcesses ? profile.criticalProcesses.split(',')[0].trim() : "core transaction processing";
    risks.push(`Concentration of knowledge regarding ${criticalProcess} among early engineering team members.`);

    return risks;
  }
}
