// Navis Policy Completeness Service
// Wave 3.6: Evaluates generated policies against the institutional 12-section governance standard.
// Returns structured completeness report with governance quality classification.

export class PolicyCompletenessService {

  // ─── SEVERITY LEVELS ──────────────────────────────────────────────────────
  static SEVERITY = {
    CRITICAL: 'Critical',
    IMPORTANT: 'Important',
    ADVISORY: 'Advisory'
  };

  // ─── GOVERNANCE QUALITY RATINGS ───────────────────────────────────────────
  static QUALITY = {
    STRONG: 'Strong',
    MODERATE: 'Moderate',
    NEEDS_IMPROVEMENT: 'Needs Improvement'
  };

  // ─── CANONICAL 12-SECTION GOVERNANCE STRUCTURE ────────────────────────────
  static GOVERNANCE_SECTIONS = [
    {
      number: 1,
      name: 'Objective',
      severity: 'Critical',
      headingPatterns: [/objective/i],
      keywordPatterns: [/\bobjective\b/i, /\bestablish\w*\b.*\bframework\b/i],
      description: 'Defines what this policy achieves.'
    },
    {
      number: 2,
      name: 'Purpose',
      severity: 'Critical',
      headingPatterns: [/purpose/i],
      keywordPatterns: [/\bpurpose\b/i, /\bmitigate\b/i, /\brisks?\b/i],
      description: 'Explains why this policy exists and the risks it mitigates.'
    },
    {
      number: 3,
      name: 'Scope',
      severity: 'Critical',
      headingPatterns: [/scope/i],
      keywordPatterns: [/\bscope\b/i, /\bapplies to\b/i, /\bcovers\b/i, /\bencompasses\b/i],
      description: 'Defines the systems, processes, and environments governed by this policy.'
    },
    {
      number: 4,
      name: 'Policy Hierarchy',
      severity: 'Important',
      headingPatterns: [/policy\s+hierarchy/i, /document\s+hierarchy/i],
      keywordPatterns: [/\bhierarchy\b/i, /\bparent\s+document\b/i, /\bsupersedes\b/i, /\blevel\s+1\b/i],
      description: 'Specifies how this document relates to other standards and procedures.'
    },
    {
      number: 5,
      name: 'Applicability',
      severity: 'Important',
      headingPatterns: [/applicability/i, /applicable\s+to/i],
      keywordPatterns: [/\bemployees\b/i, /\bcontractors\b/i, /\bthird.?part/i, /\bprocessors?\b/i, /\bsub.?processors?\b/i],
      description: 'Identifies the personnel, entities, and parties subject to this policy.'
    },
    {
      number: 6,
      name: 'Definitions',
      severity: 'Critical',
      headingPatterns: [/definitions?/i, /glossary/i, /terminology/i],
      keywordPatterns: [/\bmeans\b/i, /\brefers to\b/i, /\bdefined as\b/i],
      description: 'Provides precise definitions of key terms used throughout the policy.'
    },
    {
      number: 7,
      name: 'Roles & Responsibilities',
      severity: 'Critical',
      headingPatterns: [/roles?\s*(and|&)\s*responsibilities/i, /governance\s+oversight/i, /accountability/i],
      keywordPatterns: [/\bCISO\b/i, /\bDPO\b/i, /\bpolicy\s+owner\b/i, /\bcontrol\s+owner\b/i, /\bresponsible\b/i, /\baccountable\b/i],
      description: 'Assigns ownership, accountability, and operational responsibilities.'
    },
    {
      number: 8,
      name: 'Policy Requirements',
      severity: 'Important',
      headingPatterns: [/policy\s+requirements?/i, /regulatory\s+controls?/i, /requirements?/i, /controls?\s*(and|&)\s*compliance/i],
      keywordPatterns: [/\bshall\b/i, /\bmust\b/i, /\brequired\b/i, /\bcontrols?\b/i],
      description: 'Contains the substantive regulatory and operational requirements of the policy.'
    },
    {
      number: 9,
      name: 'Exceptions',
      severity: 'Important',
      headingPatterns: [/exceptions?/i, /exemptions?/i, /waivers?/i],
      keywordPatterns: [/\bexception\b/i, /\bexemption\b/i, /\bwaiver\b/i, /\brisk\s+acceptance\b/i],
      description: 'Defines the process for requesting and approving exceptions to policy requirements.'
    },
    {
      number: 10,
      name: 'Non-compliance & Enforcement',
      severity: 'Important',
      headingPatterns: [/non.?compliance/i, /enforcement/i, /disciplin/i, /violations?/i],
      keywordPatterns: [/\bnon.?compliance\b/i, /\benforcement\b/i, /\bdisciplinary\b/i, /\bviolation\b/i, /\bescalat/i, /\bconsequences?\b/i],
      description: 'Specifies consequences for policy violations and enforcement mechanisms.'
    },
    {
      number: 11,
      name: 'Monitoring & Compliance',
      severity: 'Important',
      headingPatterns: [/monitoring/i, /compliance\s+verif/i, /audit/i],
      keywordPatterns: [/\bmonitoring\b/i, /\baudit\b/i, /\bcompliance\b/i, /\bverification\b/i, /\bKPI\b/i, /\bmetric/i],
      description: 'Describes how compliance with this policy is monitored, measured, and verified.'
    },
    {
      number: 12,
      name: 'Review & Maintenance',
      severity: 'Critical',
      headingPatterns: [/review\s*(and|&)\s*maintenance/i, /review\s+frequency/i, /revision/i, /policy\s+review/i],
      keywordPatterns: [/\bannual\s+review\b/i, /\breview\s+frequency\b/i, /\bamendment/i, /\brevision/i, /\b12\s+months?\b/i],
      description: 'Establishes the cadence and process for reviewing and updating this policy.'
    }
  ];

  // ─── ADDITIONAL GOVERNANCE CHECKS ─────────────────────────────────────────
  static ADDITIONAL_CHECKS = [
    {
      id: 'ownership',
      name: 'Policy Ownership',
      severity: 'Critical',
      patterns: [/\bpolicy\s+owner\b/i, /\bcontrol\s+owner\b/i, /\breview\s+owner\b/i],
      minMatches: 1,
      detail: 'Policy must identify at least one designated owner (Policy Owner, Control Owner, or Review Owner).'
    },
    {
      id: 'review-frequency',
      name: 'Review Frequency',
      severity: 'Critical',
      patterns: [/\bannual\b/i, /\bsemi.?annual\b/i, /\b12\s+months?\b/i, /\b6\s+months?\b/i, /\breview\s+frequency\b/i, /\breview\s+cycle\b/i],
      minMatches: 1,
      detail: 'Policy must specify a defined review frequency (annual, semi-annual, or risk-based).'
    },
    {
      id: 'approval-authority',
      name: 'Approval Authority',
      severity: 'Important',
      patterns: [/\bapproval\s+authority\b/i, /\bapproved\s+by\b/i, /\bboard\s+approval\b/i, /\bexecutive\s+approval\b/i, /\bsenior\s+management\b/i],
      minMatches: 1,
      detail: 'Policy must identify the authority responsible for approving the document.'
    },
    {
      id: 'appendix-a',
      name: 'Appendix A: Related Governance Documents',
      severity: 'Important',
      patterns: [/APPENDIX A/i, /RELATED GOVERNANCE DOCUMENTS/i],
      minMatches: 1,
      detail: 'Policy must include an Appendix for cross-referenced documents.'
    },
    {
      id: 'appendix-b',
      name: 'Appendix B: Version Control',
      severity: 'Important',
      patterns: [/APPENDIX B/i, /VERSION CONTROL/i],
      minMatches: 1,
      detail: 'Policy must include a version control log in the appendices.'
    },
    {
      id: 'appendix-c',
      name: 'Appendix C: Framework Mapping',
      severity: 'Important',
      patterns: [/APPENDIX C/i, /FRAMEWORK MAPPING/i],
      minMatches: 1,
      detail: 'Policy must include a framework control mapping appendix.'
    },
    {
      id: 'appendix-d',
      name: 'Appendix D: RACI Matrix',
      severity: 'Important',
      patterns: [/APPENDIX D/i, /RACI MATRIX/i],
      minMatches: 1,
      detail: 'Policy must include a RACI matrix appendix.'
    },
    {
      id: 'appendix-e',
      name: 'Appendix E: Acronyms & Definitions',
      severity: 'Important',
      patterns: [/APPENDIX E/i, /ACRONYMS/i],
      minMatches: 1,
      detail: 'Policy must include an acronyms appendix.'
    },
    {
      id: 'unresolved-placeholders',
      name: 'Unresolved Placeholders',
      severity: 'Critical',
      isPlaceholderCheck: true,
      detail: 'No unresolved template placeholders ({{...}}) must remain in the document.'
    }
  ];

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  /**
   * Returns the canonical 12-section governance structure with descriptions.
   */
  static getGovernanceSections() {
    return this.GOVERNANCE_SECTIONS.map(s => ({
      number: s.number,
      name: s.name,
      severity: s.severity,
      description: s.description
    }));
  }

  /**
   * Detect unresolved template placeholders in text.
   * @param {string} text
   * @returns {string[]} Array of placeholder strings found.
   */
  static detectUnresolvedPlaceholders(text) {
    if (!text) return [];
    const regex = /\{\{[^}]+\}\}/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Evaluate a policy document for completeness against the 12-section governance standard.
   * @param {string} text - The full policy document text.
   * @returns {Object} { governanceQuality, totalSections, presentSections, findings }
   */
  static evaluateCompleteness(text) {
    if (!text || text.trim().length === 0) {
      return {
        governanceQuality: this.QUALITY.NEEDS_IMPROVEMENT,
        totalSections: 12,
        presentSections: 0,
        findings: this.GOVERNANCE_SECTIONS.map(s => ({
          section: s.name,
          sectionNumber: s.number,
          severity: s.severity,
          status: 'Missing',
          detail: `Section "${s.name}" is not present in the document.`
        }))
      };
    }

    const findings = [];
    let presentCount = 0;
    let criticalMissing = 0;
    let importantMissing = 0;

    // ─── SECTION CHECKS ──────────────────────────────────────────────
    for (const section of this.GOVERNANCE_SECTIONS) {
      const hasHeading = section.headingPatterns.some(p => p.test(text));
      const keywordHits = section.keywordPatterns.filter(p => p.test(text)).length;
      const keywordThreshold = Math.ceil(section.keywordPatterns.length * 0.3);

      if (hasHeading && keywordHits >= keywordThreshold) {
        // Section is present with adequate content
        presentCount++;
        findings.push({
          section: section.name,
          sectionNumber: section.number,
          severity: section.severity,
          status: 'Present',
          detail: `Section "${section.name}" is present with adequate content coverage.`
        });
      } else if (hasHeading || keywordHits >= 2) {
        // Section heading exists but content is weak
        presentCount++;
        findings.push({
          section: section.name,
          sectionNumber: section.number,
          severity: section.severity,
          status: 'Weak',
          detail: `Section "${section.name}" has limited content. Consider expanding for institutional quality.`
        });
      } else {
        // Section is missing
        if (section.severity === 'Critical') criticalMissing++;
        if (section.severity === 'Important') importantMissing++;
        findings.push({
          section: section.name,
          sectionNumber: section.number,
          severity: section.severity,
          status: 'Missing',
          detail: `Section "${section.name}" is not present in the document.`
        });
      }
    }

    // ─── ADDITIONAL GOVERNANCE CHECKS ────────────────────────────────
    for (const check of this.ADDITIONAL_CHECKS) {
      if (check.isPlaceholderCheck) {
        const placeholders = this.detectUnresolvedPlaceholders(text);
        if (placeholders.length > 0) {
          findings.push({
            section: check.name,
            sectionNumber: null,
            severity: check.severity,
            status: 'Failed',
            detail: `${check.detail} Found: ${placeholders.join(', ')}`
          });
          criticalMissing++;
        } else {
          findings.push({
            section: check.name,
            sectionNumber: null,
            severity: check.severity,
            status: 'Passed',
            detail: 'No unresolved template placeholders detected.'
          });
        }
      } else {
        const matchCount = check.patterns.filter(p => p.test(text)).length;
        if (matchCount >= check.minMatches) {
          findings.push({
            section: check.name,
            sectionNumber: null,
            severity: check.severity,
            status: 'Passed',
            detail: `${check.name} requirement is satisfied.`
          });
        } else {
          findings.push({
            section: check.name,
            sectionNumber: null,
            severity: check.severity,
            status: 'Failed',
            detail: check.detail
          });
          if (check.severity === 'Critical') criticalMissing++;
          if (check.severity === 'Important') importantMissing++;
        }
      }
    }

    // ─── COMPUTE GOVERNANCE QUALITY ──────────────────────────────────
    let governanceQuality;
    if (criticalMissing === 0 && importantMissing <= 1 && presentCount >= 10) {
      governanceQuality = this.QUALITY.STRONG;
    } else if (criticalMissing <= 1 && importantMissing <= 3 && presentCount >= 7) {
      governanceQuality = this.QUALITY.MODERATE;
    } else {
      governanceQuality = this.QUALITY.NEEDS_IMPROVEMENT;
    }

    return {
      governanceQuality,
      totalSections: 12,
      presentSections: presentCount,
      findings
    };
  }

  /**
   * Return findings grouped by severity for display.
   * @param {Array} findings
   * @returns {Object} { critical, important, advisory }
   */
  static groupBySeverity(findings) {
    return {
      critical: findings.filter(f => f.severity === 'Critical' && (f.status === 'Missing' || f.status === 'Failed')),
      important: findings.filter(f => f.severity === 'Important' && (f.status === 'Missing' || f.status === 'Failed')),
      advisory: findings.filter(f => f.severity === 'Advisory' && (f.status === 'Missing' || f.status === 'Failed'))
    };
  }

  /**
   * Return section checklist for 12-section display.
   * @param {Array} findings
   * @returns {Array} [{ number, name, present: boolean }]
   */
  static getSectionChecklist(findings) {
    return this.GOVERNANCE_SECTIONS.map(s => {
      const finding = findings.find(f => f.sectionNumber === s.number);
      return {
        number: s.number,
        name: s.name,
        present: finding ? (finding.status === 'Present' || finding.status === 'Weak') : false,
        status: finding ? finding.status : 'Missing'
      };
    });
  }
}
