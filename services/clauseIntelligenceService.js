// Navis Clause Intelligence Service
// Scans policy text across 7 categories to detect compliance gaps and quality issues.
// Labels severities as Advisory, Important, and Critical.

import { AIService } from './aiService.js';
import { CLAUSE_LIBRARY } from './policyTemplateService.js';

export class ClauseIntelligenceService {
  static async scanPolicy(policyText, selectedFrameworks = [], apiKey = '') {
    if (!policyText) policyText = "";

    // 1. If Gemini API Key is configured, run AI analysis
    if (apiKey) {
      try {
        const prompt = `You are a consultant-grade GRC compliance auditor.
Audit the following policy text:
\"\"\"
${policyText.substring(0, 5000)}
\"\"\"

Assess the policy against these 7 categories:
1. Ownership (Missing policy owner, roles unclear)
2. Review (Missing review frequency, missing approval authority)
3. Privacy (Missing DSAR, missing grievance redressal, missing consent withdrawal)
4. Retention (Missing retention schedule, missing destruction requirements)
5. Third Party (Missing processor obligations, missing supplier controls)
6. Cross-Border (Missing transfer safeguards)
7. Wording Quality (Weak language like 'should' instead of 'must', ambiguous terms)

Return a JSON array of observations. For severity, use ONLY: 'Advisory', 'Important', 'Critical'.
For source, use 'Gemini'.
Format your response ONLY as a valid JSON array:
[
  {
    "id": "uniq-id-1",
    "issueType": "Category Name (e.g. Privacy)",
    "severity": "Critical",
    "observation": "Description of the gap...",
    "rationale": "Why this matters in terms of compliance...",
    "frameworks": ["GDPR", "DPDPA"],
    "source": "Gemini",
    "suggestedClause": "Proposed clause text..."
  }
]`;

        const response = await AIService.queryGemini(prompt, apiKey);
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn("AI clause intelligence scan failed, falling back to rule engine", err);
      }
    }

    // 2. Simulated/Rules fallback engine (scans keywords & maps to Wave 1 clause library)
    const observations = [];
    const lowerText = policyText.toLowerCase();

    // Helper to extract a clause from library safely
    const getLibClause = (id, fallback) => {
      const match = CLAUSE_LIBRARY.find(c => c.id === id);
      return match ? match.text : fallback;
    };

    // Category 1: Ownership
    if (!lowerText.includes("owner:") && !lowerText.includes("chief information security officer") && !lowerText.includes("ciso") && !lowerText.includes("data protection officer")) {
      observations.push({
        id: "issue-ownership-1",
        issueType: "Ownership",
        severity: "Important",
        observation: "Policy ownership structure and explicit administrative roles are not defined.",
        rationale: "Clearly assigned ownership is required under ISO 27001 A.5.3 to ensure policies are actively updated and enforced.",
        frameworks: ["ISO 27001", "SOC 2"],
        source: "Simulation Rule",
        suggestedClause: getLibClause("cl-roles-generic", "Operational oversight is delegated to the Chief Information Security Officer (CISO) for security controls, and the Data Protection Officer (DPO) (Sumit Nayar) for privacy impact tasks.")
      });
    }

    // Category 2: Review
    if (!lowerText.includes("review frequency") && !lowerText.includes("annual review") && !lowerText.includes("reviewed every 12 months")) {
      observations.push({
        id: "issue-review-1",
        issueType: "Review",
        severity: "Advisory",
        observation: "Mandatory annual review frequency or approval protocol is missing.",
        rationale: "ISO 27001 A.5.1.2 mandates periodic reviews of policies to ensure continued suitability, adequacy, and effectiveness.",
        frameworks: ["ISO 27001", "SOC 2"],
        source: "Simulation Rule",
        suggestedClause: getLibClause("cl-review-frequency", "This policy document is subject to mandatory annual review and approval by the CISO and DPO at least once every 12 months.")
      });
    }

    // Category 3: Privacy (Consent, Grievance, DSAR)
    const hasDpdpaOrGdpr = selectedFrameworks.includes("DPDPA") || selectedFrameworks.includes("GDPR");
    if (hasDpdpaOrGdpr) {
      if (!lowerText.includes("withdraw consent") && !lowerText.includes("consent withdrawal")) {
        observations.push({
          id: "issue-privacy-withdrawal",
          issueType: "Privacy",
          severity: "Critical",
          observation: "Missing explicit consent withdrawal protocol.",
          rationale: "DPDPA Section 6 and GDPR Article 7 mandate that individuals must hold the right to withdraw consent as easily as it was given.",
          frameworks: ["DPDPA", "GDPR"],
          source: "Clause Library",
          suggestedClause: getLibClause("cl-consent-gdpr-dpdpa", "Consent to collect and process personal data can be withdrawn by the user at any time. Withdrawal requests are processed within 14 days.")
        });
      }

      if (!lowerText.includes("grievance officer") && !lowerText.includes("grievance mechanism")) {
        observations.push({
          id: "issue-privacy-grievance",
          issueType: "Privacy",
          severity: "Critical",
          observation: "Absence of a designated Grievance Redressal mechanism.",
          rationale: "DPDPA Section 12 requires every data fiduciary to establish a designated grievance officer to address data principal complaints.",
          frameworks: ["DPDPA"],
          source: "Clause Library",
          suggestedClause: "Data subjects may address grievances regarding processing to our Grievance Officer at grievance@trackier.com. We acknowledge receipt within 48 hours and resolve it within 30 days."
        });
      }

      if (!lowerText.includes("dsar") && !lowerText.includes("data subject rights") && !lowerText.includes("data subject access request")) {
        observations.push({
          id: "issue-privacy-dsar",
          issueType: "Privacy",
          severity: "Important",
          observation: "Data Subject Access Request (DSAR) identity verification and handling rules are undefined.",
          rationale: "Fails to support data portability, access, or erasure obligations under GDPR Chapter III and DPDPA.",
          frameworks: ["GDPR", "DPDPA", "ISO 27701"],
          source: "Simulation Rule",
          suggestedClause: getLibClause("cl-dsar-standard", "Individuals hold the right to request access, correction, porting, or complete deletion of their personal data. Verification occurs within 48 hours.")
        });
      }
    }

    // Category 4: Retention
    if (!lowerText.includes("retention schedule") && !lowerText.includes("secure deletion") && !lowerText.includes("retention limits")) {
      observations.push({
        id: "issue-retention-1",
        issueType: "Retention",
        severity: "Important",
        observation: "Missing data retention schedules or secure destruction timelines.",
        rationale: "Personal data retained without clear business justification exposes the organization to massive storage limitation compliance fines.",
        frameworks: ["GDPR", "DPDPA", "ISO 27701"],
        source: "Clause Library",
        suggestedClause: getLibClause("cl-retention-secure", "Personal data is retained only for as long as necessary to fulfill the processing purpose. Upon contract termination, data is wiped within 30 days.")
      });
    }

    // Category 5: Third Party
    if (!lowerText.includes("sub-processor") && !lowerText.includes("third-party due diligence") && !lowerText.includes("supplier compliance")) {
      observations.push({
        id: "issue-thirdparty-1",
        issueType: "Third Party",
        severity: "Important",
        observation: "Supplier security screening and sub-processor SLA monitoring controls are absent.",
        rationale: "Fails supply chain risk management standards required for ISO 27001 Annex A.15 and SOC 2 CC9.2 controls.",
        frameworks: ["ISO 27001", "SOC 2"],
        source: "Clause Library",
        suggestedClause: getLibClause("cl-vendor-due-diligence", "All third-party SaaS vendors and sub-processors with access to customer data must undergo security due diligence screenings annually.")
      });
    }

    // Category 6: Cross-Border
    if (!lowerText.includes("cross-border transfer") && !lowerText.includes("data localization") && !lowerText.includes("adequacy")) {
      observations.push({
        id: "issue-crossborder-1",
        issueType: "Cross-Border",
        severity: "Important",
        observation: "Cross-border data transfer safeguards and localization requirements are unstated.",
        rationale: "GDPR Chapter V prohibits personal data transfers outside the EEA unless backed by approved adequacy or Standard Contractual Clauses (SCCs).",
        frameworks: ["GDPR", "DPDPA", "ISO 27701"],
        source: "Clause Library",
        suggestedClause: getLibClause("cl-crossborder-transfer", "International data transfers shall only occur under Standard Contractual Clauses (SCCs). We host client data in regional zones on AWS.")
      });
    }

    // Category 7: Wording Quality
    if (lowerText.includes("should check") || lowerText.includes("employees should VPN") || lowerText.includes("try to implement")) {
      observations.push({
        id: "issue-wording-1",
        issueType: "Wording Quality",
        severity: "Advisory",
        observation: "Non-mandatory phrasing ('should', 'try to') detected in security controls.",
        rationale: "Policies should use clear compliance imperatives ('must', 'shall') to satisfy audit scrutiny and avoid ambiguity.",
        frameworks: ["Global"],
        source: "Simulation Rule",
        suggestedClause: "All systems must enforce logical access controls. All remote connections shall route exclusively through secure VPNs."
      });
    }

    return observations;
  }
}
