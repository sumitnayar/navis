export class OrganizationDependencyService {
  /**
   * Returns a deep, contextual intelligence object based on the organization profile.
   */
  static getCriticalDependencies(profile) {
    const cloudProvider = profile.cloudProvider || "AWS";
    const hostingRegion = profile.hostingRegion || "us-east-1";
    
    // Parse arrays
    const processes = profile.criticalProcesses ? profile.criticalProcesses.split(',').map(s => s.trim()) : ["core transaction processing"];
    const vendors = profile.criticalVendors ? profile.criticalVendors.split(',').map(s => s.trim()) : [];
    const products = profile.products ? profile.products.split(',').map(s => s.trim()) : [];
    const segments = profile.customerSegments ? profile.customerSegments.split(',').map(s => s.trim()) : [];

    const vendorIntelligence = this.mapVendors(vendors, cloudProvider, hostingRegion);
    const productIntelligence = this.mapProducts(products);
    const segmentIntelligence = this.mapSegments(segments);

    // Pick top items for generic scenarios if needed
    const criticalProcess = processes[0] || "core processing";
    const criticalVendorObj = vendorIntelligence[0] || { name: 'Third-party provider', threats: ['Service outage'] };

    return {
      vendorIntelligence,
      productIntelligence,
      segmentIntelligence,
      scenarios: {
        cloudOutageScenario: `Loss of ${cloudProvider} ${hostingRegion} Region affecting ${criticalProcess} services.`,
        supplierDisruptionScenario: `${criticalVendorObj.name} disruption leading to ${criticalVendorObj.threats[0].toLowerCase()}.`,
        cyberattackScenario: `Double extortion ransomware affecting ${profile.criticalAssets ? profile.criticalAssets.split(',')[0].trim() : criticalProcess + ' databases'}.`
      }
    };
  }

  static mapVendors(vendors, cloudProvider, hostingRegion) {
    const intel = [];
    
    // Always include cloud provider
    intel.push({
      name: cloudProvider,
      threats: [
        `${hostingRegion} region outage`,
        'Misconfiguration',
        'IAM compromise'
      ]
    });

    vendors.forEach(v => {
      const lower = v.toLowerCase();
      if (lower.includes('cloudflare')) {
        intel.push({ name: v, threats: ['Traffic disruption', 'DDoS mitigation failure', 'WAF bypass'] });
      } else if (lower.includes('mongodb') || lower.includes('atlas')) {
        intel.push({ name: v, threats: ['Data corruption', 'Backup failure', 'Cluster degradation'] });
      } else if (lower.includes('stripe')) {
        intel.push({ name: v, threats: ['Settlement interruption', 'Payment availability', 'Fraud vector'] });
      } else if (lower.includes('hubspot') || lower.includes('salesforce')) {
        intel.push({ name: v, threats: ['CRM availability', 'Marketing continuity', 'Customer data exposure'] });
      } else if (lower !== cloudProvider.toLowerCase()) {
        intel.push({ name: v, threats: ['Service degradation', 'API rate limiting', 'Data exposure'] });
      }
    });

    return intel;
  }

  static mapProducts(products) {
    const intel = [];
    products.forEach(p => {
      const lower = p.toLowerCase();
      if (lower.includes('attribution')) {
        intel.push({ name: p, risks: ['Event ingestion failure', 'Delayed attribution', 'Reporting inconsistencies'] });
      } else if (lower.includes('reward')) {
        intel.push({ name: p, risks: ['Incorrect payouts', 'Fraudulent redemptions', 'Ledger corruption'] });
      } else if (lower.includes('analytic') || lower.includes('reporting')) {
        intel.push({ name: p, risks: ['Data quality degradation', 'Dashboard unavailability', 'Pipeline latency'] });
      } else {
        intel.push({ name: p, risks: ['Feature unavailability', 'Customer SLA breach', 'Data integrity loss'] });
      }
    });
    return intel;
  }

  static mapSegments(segments) {
    const intel = [];
    segments.forEach(s => {
      const lower = s.toLowerCase();
      if (lower.includes('gaming')) {
        intel.push({ name: s, priorities: ['Uptime', 'Fraud prevention', 'Handling traffic spikes'] });
      } else if (lower.includes('fintech') || lower.includes('bank')) {
        intel.push({ name: s, priorities: ['Regulatory obligations', 'Security', 'Transaction integrity'] });
      } else if (lower.includes('health')) {
        intel.push({ name: s, priorities: ['Patient safety', 'PHI protection', 'Continuity of care'] });
      } else if (lower.includes('manufacturing') || lower.includes('industrial')) {
        intel.push({ name: s, priorities: ['Operational technology (OT) uptime', 'Supply chain resilience', 'Safety'] });
      } else {
        intel.push({ name: s, priorities: ['Customer experience', 'Service reliability', 'Data privacy'] });
      }
    });
    return intel;
  }
}
