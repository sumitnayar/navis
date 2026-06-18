export class OrganizationIntelligenceService {
  /**
   * Deterministically generates the Governance Pack Cover Page in Markdown.
   * This forms the absolute truth for the rest of the pack.
   */
  static generateCoverPage(domain, profile, frameworks) {
    const company = profile.companyName || "The Organization";
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Fallbacks for profile data if not fully filled out yet
    const industry = profile.industry || "[Industry]";
    const products = profile.products || "[Products/Services]";
    const businessModel = profile.businessModel || (profile.b2bB2c ? profile.b2bB2c : "[B2B/B2C Model]");
    const customerSegments = profile.customerSegments || "[Customer Segments]";
    const criticalProcesses = profile.criticalProcesses || "[Critical Processes]";

    const applicableFrameworks = frameworks && frameworks.length ? frameworks.join(", ") : "Industry Best Practices";
    const jurisdictions = profile.customerGeography || "[Primary Jurisdictions]";
    const processingRole = profile.processingRole || "[Controller / Processor]";
    const specialCategories = profile.specialCategories || "None identified";

    const cloudProviders = profile.cloudProvider || "[Cloud Provider]";
    const hostingRegions = profile.hostingRegion || "[Hosting Region]";
    const criticalVendors = profile.criticalVendors || profile.subprocessors || "[Critical Vendors]";
    const architectureDependencies = profile.architectureDependencies || "[Key Architecture Dependencies]";

    const dpo = profile.dpoOfficer || "[DPO Name/Role]";
    const ciso = profile.cisoOfficer || "[CISO Name/Role]";
    const cro = profile.croOfficer || "[CRO Name/Role]";

    const riskAppetite = profile.riskAppetite || "Moderate / Balanced";
    const recoveryPhilosophy = profile.recoveryPhilosophy || "Availability-first";
    const criticalDependencies = profile.criticalDependencies || "[Critical Dependencies]";

    const domainNames = {
      'bcp': 'Business Continuity',
      'ir': 'Incident Response',
      'vendor': 'Third-Party Risk'
    };

    return `
<div class="cover-page-header">
  <h1>${domainNames[domain] || domain.toUpperCase()} GOVERNANCE PACK</h1>
  <h2>Enterprise Resilience & Governance Program</h2>
  <div class="doc-meta">
    <p><strong>Document ID:</strong> ${domain.toUpperCase()}-GP-001</p>
    <p><strong>Version:</strong> 1.0 (Final)</p>
    <p><strong>Classification:</strong> Internal Use Only</p>
    <p><strong>Generated Date:</strong> ${date}</p>
    <p><strong>Organization:</strong> ${company}</p>
  </div>
</div>

---

## 1. Executive Summary

This Governance Pack establishes the definitive operating model and control environment for ${domainNames[domain] || 'the domain'} at ${company}. It is designed to meet the rigorous requirements of ${applicableFrameworks} and provides the Board of Directors, Audit Committees, and Regulators with a transparent view of the organization's risk posture.

---

## 2. Business Context

| Attribute | Detail |
| :--- | :--- |
| **Industry** | ${industry} |
| **Products/Services** | ${products} |
| **Business Model** | ${businessModel} |
| **Customer Segments** | ${customerSegments} |
| **Critical Processes** | ${criticalProcesses} |

---

## 3. Regulatory Context

| Attribute | Detail |
| :--- | :--- |
| **Applicable Frameworks** | ${applicableFrameworks} |
| **Jurisdictions** | ${jurisdictions} |
| **Data Role** | ${processingRole} |
| **Special Categories** | ${specialCategories} |

---

## 4. Technology Context

| Attribute | Detail |
| :--- | :--- |
| **Cloud Providers** | ${cloudProviders} |
| **Hosting Regions** | ${hostingRegions} |
| **Critical Vendors** | ${criticalVendors} |
| **Architecture Dependencies** | ${architectureDependencies} |

---

## 5. Governance Context

| Role | Designation |
| :--- | :--- |
| **Chief Executive Officer (CEO)** | Ultimate accountability |
| **Chief Information Security Officer (CISO)** | ${ciso} |
| **Data Protection Officer (DPO)** | ${dpo} |
| **Chief Risk Officer (CRO)** | ${cro} |

---

## 6. Risk Context

| Attribute | Detail |
| :--- | :--- |
| **Risk Appetite** | ${riskAppetite} |
| **Recovery Philosophy** | ${recoveryPhilosophy} |
| **Critical Dependencies** | ${criticalDependencies} |

---

## 7. Artifact Hierarchy

This Governance Pack operates as an interconnected system rather than isolated documents. The hierarchy of authority is as follows:

1. **Policy**: Establishes executive intent and Board mandates.
2. **Standard**: Defines mandatory baseline controls.
3. **Procedure**: Details operational execution steps.
4. **Workbook / Register**: Operational tracking and risk quantification.
5. **Testing Program**: Validation of control efficacy.
6. **Board Reporting**: Aggregated metrics and risk visibility for oversight.

<br>
<div class="callout callout-info">
<strong>ORGANIZATION ASSUMPTIONS</strong><br>
All subsequent artifacts in this pack implicitly inherit the assumptions defined in this Cover Page. Artifacts will not repeat this baseline context.
</div>
`.trim();
  }
}
