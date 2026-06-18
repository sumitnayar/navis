export class OrganizationDependencyService {
  /**
   * Returns a specific, contextual scenario string based on the organization profile.
   * If the profile has a specific cloud provider, it uses that instead of generic "Cloud outage".
   */
  static getCriticalDependencies(profile) {
    const cloudProvider = profile.cloudProvider || "AWS";
    const hostingRegion = profile.hostingRegion || "us-east-1";
    const criticalProcess = profile.criticalProcesses ? profile.criticalProcesses.split(',')[0].trim() : "core transaction processing";
    const criticalVendor = profile.criticalVendors ? profile.criticalVendors.split(',')[0].trim() : "Cloudflare";

    return {
      cloudOutageScenario: `Loss of ${cloudProvider} ${hostingRegion} Region affecting ${criticalProcess} services.`,
      supplierDisruptionScenario: `${criticalVendor} service degradation impacting customer traffic routing.`,
      cyberattackScenario: `Double extortion ransomware affecting ${criticalProcess} databases.`,
      keyPersonnelScenario: `Sudden unavailability of the core engineering team responsible for ${criticalProcess}.`
    };
  }
}
