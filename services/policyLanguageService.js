// Navis Policy Language Service
// Wave 3.5: Post-processing language refinement layer
// Elevates generated policy drafts to consultant-grade quality.
// Organization Memory is read/initialized only — does NOT influence suggestions in this wave.

export class PolicyLanguageService {

  // ─── SEVERITY LABELS ──────────────────────────────────────────────────────
  static SEVERITY = {
    STRONGLY_RECOMMENDED: 'Strongly Recommended',
    RECOMMENDED: 'Recommended',
    OPTIONAL: 'Optional'
  };

  // ─── REFINEMENT CATEGORIES ────────────────────────────────────────────────
  static CATEGORIES = {
    'weak-imperative':       { id: 'weak-imperative',       label: 'Weak Imperative',             color: '#e53e3e' },
    'passive-voice':         { id: 'passive-voice',         label: 'Passive Voice',               color: '#dd6b20' },
    'hedge-removal':         { id: 'hedge-removal',         label: 'Hedge Removal',               color: '#d69e2e' },
    'consistency':           { id: 'consistency',           label: 'Consistency',                 color: '#3182ce' },
    'structural':            { id: 'structural',            label: 'Structural Enhancement',      color: '#805ad5' },
    'governance-maturity':   { id: 'governance-maturity',   label: 'Governance Maturity',         color: '#319795' },
    'cross-reference':       { id: 'cross-reference',       label: 'Cross-reference Improvement', color: '#718096' }
  };

  // ─── LANGUAGE PROFILES ────────────────────────────────────────────────────
  static PROFILES = {
    'big4': {
      id: 'big4',
      name: 'Big 4 Tone',
      description: 'Professional, authoritative, consultant-grade language typical of Big 4 advisory outputs.',
      imperative: 'shall',
      strongImperative: 'must',
      entity: 'the Organization',
      passiveEntity: 'The Organization',
      style: 'institutional'
    },
    'conservative-legal': {
      id: 'conservative-legal',
      name: 'Conservative Legal Tone',
      description: 'Maximum formality with traditional legal phrasing and hedging precision.',
      imperative: 'shall',
      strongImperative: 'shall',
      entity: 'the Data Controller',
      passiveEntity: 'The Data Controller',
      style: 'legal'
    },
    'board': {
      id: 'board',
      name: 'Board Tone',
      description: 'Executive-level strategic language focused on accountability and governance oversight.',
      imperative: 'must',
      strongImperative: 'must',
      entity: 'Management',
      passiveEntity: 'Management',
      style: 'executive'
    },
    'operational': {
      id: 'operational',
      name: 'Operational Tone',
      description: 'Practical, action-oriented language with clear responsibilities and timelines.',
      imperative: 'must',
      strongImperative: 'must',
      entity: 'the responsible team',
      passiveEntity: 'The responsible team',
      style: 'procedural'
    },
    'technical': {
      id: 'technical',
      name: 'Technical Tone',
      description: 'Precise, specification-grade language with technical accuracy and structured requirements.',
      imperative: 'shall',
      strongImperative: 'shall',
      entity: 'the system',
      passiveEntity: 'The system',
      style: 'specification'
    }
  };

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  static getProfiles() {
    return Object.values(this.PROFILES);
  }

  static getCategories() {
    return Object.values(this.CATEGORIES);
  }

  /**
   * Analyze a policy document and return an array of refinement suggestions.
   * @param {string} text - The full policy text to analyze.
   * @param {Object} options - { categories: string[], profile: string }
   * @returns {Array} Array of refinement suggestion objects.
   */
  static analyzeDocument(text, options = {}) {
    const profileId = options.profile || 'big4';
    const enabledCategories = options.categories || Object.keys(this.CATEGORIES);
    const profile = this.PROFILES[profileId] || this.PROFILES['big4'];

    const suggestions = [];
    let idCounter = 0;

    const enabledSet = new Set(enabledCategories);

    if (enabledSet.has('weak-imperative')) {
      this._scanWeakImperatives(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('passive-voice')) {
      this._scanPassiveVoice(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('hedge-removal')) {
      this._scanHedges(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('consistency')) {
      this._scanConsistency(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('structural')) {
      this._scanStructural(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('governance-maturity')) {
      this._scanGovernanceMaturity(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }
    if (enabledSet.has('cross-reference')) {
      this._scanCrossReferences(text, profile, suggestions, idCounter);
      idCounter = suggestions.length;
    }

    return suggestions;
  }

  /**
   * Apply a single refinement to the text.
   * @param {string} text - Source text.
   * @param {Object} refinement - A suggestion object with original & replacement.
   * @returns {string} Modified text.
   */
  static applyRefinement(text, refinement) {
    if (!refinement || !refinement.original || !refinement.replacement) return text;
    const idx = text.indexOf(refinement.original);
    if (idx === -1) return text;
    return text.substring(0, idx) + refinement.replacement + text.substring(idx + refinement.original.length);
  }

  /**
   * Apply multiple refinements in sequence, processing from end to start to preserve positions.
   * @param {string} text - Source text.
   * @param {Array} refinements - Array of suggestion objects.
   * @returns {string} Modified text.
   */
  static applyAllRefinements(text, refinements) {
    // Sort by position descending to avoid offset issues
    const sorted = [...refinements].sort((a, b) => {
      const posA = text.indexOf(a.original);
      const posB = text.indexOf(b.original);
      return posB - posA;
    });
    let result = text;
    for (const ref of sorted) {
      result = this.applyRefinement(result, ref);
    }
    return result;
  }

  /**
   * Return summary statistics for a set of refinement suggestions.
   * @param {Array} refinements
   * @returns {Object}
   */
  static getStatistics(refinements) {
    const stats = {
      total: refinements.length,
      byCategory: {},
      bySeverity: {}
    };

    for (const cat of Object.values(this.CATEGORIES)) {
      stats.byCategory[cat.id] = refinements.filter(r => r.category === cat.id).length;
    }

    stats.bySeverity[this.SEVERITY.STRONGLY_RECOMMENDED] = refinements.filter(r => r.severity === this.SEVERITY.STRONGLY_RECOMMENDED).length;
    stats.bySeverity[this.SEVERITY.RECOMMENDED] = refinements.filter(r => r.severity === this.SEVERITY.RECOMMENDED).length;
    stats.bySeverity[this.SEVERITY.OPTIONAL] = refinements.filter(r => r.severity === this.SEVERITY.OPTIONAL).length;

    return stats;
  }

  // ─── CATEGORY SCANNERS ────────────────────────────────────────────────────

  static _scanWeakImperatives(text, profile, suggestions, startId) {
    const rules = [
      {
        pattern: /\bshould try to\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Replaces vague permissive phrase with mandatory imperative to strengthen enforceability.'
      },
      {
        pattern: /\bshould attempt to\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Eliminates tentative phrasing that undermines compliance obligations.'
      },
      {
        pattern: /\bmay consider\b/gi,
        getReplacement: (p) => `${p.strongImperative} evaluate`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Converts optional consideration into mandatory evaluation to enforce due diligence.'
      },
      {
        pattern: /\bis expected to\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Replaces expectation-based phrasing with definitive obligation.'
      },
      {
        pattern: /\bis encouraged to\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Upgrades encouragement language to mandatory requirement.'
      },
      {
        pattern: /\bshould ensure\b/gi,
        getReplacement: (p) => `${p.imperative} ensure`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Strengthens assurance obligation from advisory to mandatory.'
      },
      {
        pattern: /\bshould be\b/gi,
        getReplacement: (p) => `${p.imperative} be`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Converts advisory statement to enforceable obligation.'
      },
      {
        pattern: /\bought to\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Replaces informal moral obligation with formal governance imperative.'
      },
      {
        pattern: /\bcould\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Converts possibility language to definitive directive where contextually appropriate.'
      },
      {
        pattern: /\bmight\b/gi,
        getReplacement: (p) => p.imperative,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Replaces speculative language with deterministic governance phrasing.'
      }
    ];

    this._runPatternRules(text, rules, 'weak-imperative', profile, suggestions, startId);
  }

  static _scanPassiveVoice(text, profile, suggestions, startId) {
    const rules = [
      {
        pattern: /\bdata is processed by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} processes data as directed by`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Converts passive construction to active voice for clearer accountability.'
      },
      {
        pattern: /\bdata is collected by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} collects data from`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Assigns clear collection responsibility through active voice.'
      },
      {
        pattern: /\baccess is granted by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} grants access pursuant to`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Establishes active authorization accountability.'
      },
      {
        pattern: /\brecords are maintained by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} maintains records in accordance with`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Clarifies record-keeping responsibility through active construction.'
      },
      {
        pattern: /\bis managed by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} manages`,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Strengthens management accountability through active voice.'
      },
      {
        pattern: /\bwill be conducted by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} will conduct`,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Converts passive future tense to active for clearer operational responsibility.'
      },
      {
        pattern: /\bis performed by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} performs`,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Assigns clear execution responsibility through active construction.'
      },
      {
        pattern: /\bshall be reviewed by\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} review`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Strengthens review obligation through active voice and clear accountability.'
      }
    ];

    this._runPatternRules(text, rules, 'passive-voice', profile, suggestions, startId);
  }

  static _scanHedges(text, profile, suggestions, startId) {
    const rules = [
      {
        pattern: /\bwhere reasonably practicable\b/gi,
        getReplacement: () => 'in all cases',
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Eliminates practicability escape clause that weakens mandatory compliance obligations.'
      },
      {
        pattern: /\bto the extent possible\b/gi,
        getReplacement: () => 'without exception',
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Removes ambiguous limitation that permits discretionary non-compliance.'
      },
      {
        pattern: /\bas far as practicable\b/gi,
        getReplacement: () => 'in all operational circumstances',
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Replaces discretionary language with comprehensive obligation.'
      },
      {
        pattern: /\bwhenever feasible\b/gi,
        getReplacement: () => 'at all times',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Eliminates feasibility qualification that undermines consistent enforcement.'
      },
      {
        pattern: /\bif deemed necessary\b/gi,
        getReplacement: () => 'as required by this Policy',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Replaces subjective necessity determination with policy-anchored obligation.'
      },
      {
        pattern: /\bas appropriate\b/gi,
        getReplacement: () => 'as defined in this Policy',
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Replaces vague appropriateness qualifier with specific policy reference.'
      },
      {
        pattern: /\bif and when\b/gi,
        getReplacement: () => 'upon',
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Replaces conditional hedging with definitive trigger language.'
      },
      {
        pattern: /\bsubject to availability\b/gi,
        getReplacement: () => 'as a standing operational requirement',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Eliminates resource-availability escape clause.'
      },
      {
        pattern: /\bwhere applicable\b/gi,
        getReplacement: () => 'as prescribed by applicable regulatory frameworks',
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Anchors applicability to specific regulatory context rather than leaving it open to interpretation.'
      }
    ];

    this._runPatternRules(text, rules, 'hedge-removal', profile, suggestions, startId);
  }

  static _scanConsistency(text, profile, suggestions, startId) {
    // Detect inconsistent terminology usage
    const termGroups = [
      {
        variants: [/\bpersonal information\b/gi, /\bPII\b/g, /\bpersonally identifiable information\b/gi],
        canonical: 'Personal Data',
        rationale: 'Standardizes data terminology to "Personal Data" for regulatory consistency across GDPR and DPDPA.'
      },
      {
        variants: [/\bthe company\b/gi, /\bour company\b/gi, /\bwe\b/g],
        canonical: profile.passiveEntity,
        rationale: `Standardizes entity references to "${profile.passiveEntity}" for institutional consistency.`
      },
      {
        variants: [/\bdata fiduciary\b/gi],
        canonical: 'Data Fiduciary',
        rationale: 'Standardizes controller/fiduciary terminology per DPDPA nomenclature.'
      }
    ];

    let id = startId;
    for (const group of termGroups) {
      for (const variantPattern of group.variants) {
        const matches = [...text.matchAll(variantPattern)];
        for (const match of matches) {
          // Skip if the match is already the canonical form
          if (match[0].toLowerCase() === group.canonical.toLowerCase()) continue;

          suggestions.push({
            id: `ref-${id++}`,
            category: 'consistency',
            severity: this.SEVERITY.OPTIONAL,
            original: match[0],
            replacement: group.canonical,
            rationale: group.rationale,
            location: match.index
          });
          break; // Only flag the first instance of each variant to avoid noise
        }
      }
    }
  }

  static _scanStructural(text, profile, suggestions, startId) {
    // Detect very long paragraphs (>500 chars without line breaks) that could benefit from sub-clause structuring
    const paragraphs = text.split(/\n\n+/);
    let id = startId;
    let charOffset = 0;

    for (const para of paragraphs) {
      if (para.length > 500 && !para.includes('\n') && !para.match(/^\d+\.\s/)) {
        const preview = para.substring(0, 80) + '...';
        suggestions.push({
          id: `ref-${id++}`,
          category: 'structural',
          severity: this.SEVERITY.OPTIONAL,
          original: preview,
          replacement: '[Restructure into numbered sub-clauses for improved readability and auditability]',
          rationale: 'Long unstructured paragraphs reduce auditability. Breaking into numbered sub-clauses improves regulatory traceability and board review efficiency.',
          location: charOffset
        });
      }
      charOffset += para.length + 2;
    }

    // Detect missing section numbering
    const lines = text.split('\n');
    let hasNumberedSections = false;
    let hasUnNumberedHeadings = false;
    for (const line of lines) {
      if (line.match(/^\d+[\.\)]\s/)) hasNumberedSections = true;
      if (line.match(/^[A-Z][A-Za-z\s]{5,}$/) && !line.match(/^\d/)) hasUnNumberedHeadings = true;
    }

    if (hasUnNumberedHeadings && !hasNumberedSections) {
      suggestions.push({
        id: `ref-${id++}`,
        category: 'structural',
        severity: this.SEVERITY.RECOMMENDED,
        original: '[Document sections lack numbered clause identifiers]',
        replacement: '[Apply sequential clause numbering (1.0, 1.1, 1.2, ...) for regulatory traceability]',
        rationale: 'Clause numbering is essential for policy cross-referencing, audit trails, and regulatory citation. Board-ready policies require structured numbering.',
        location: 0
      });
    }
  }

  static _scanGovernanceMaturity(text, profile, suggestions, startId) {
    const rules = [
      {
        pattern: /\bwe will protect\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} implement and maintain appropriate technical and organizational measures to safeguard`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Elevates informal promise to institutional governance commitment with specific obligation language.'
      },
      {
        pattern: /\bwe keep data safe\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} ensure the confidentiality, integrity, and availability of`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Replaces colloquial safety assurance with CIA triad governance language.'
      },
      {
        pattern: /\busers can ask for their data\b/gi,
        getReplacement: (p) => `Data Subjects ${p.imperative} have the right to request access to their Personal Data in accordance with applicable data protection legislation`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Transforms informal access statement into formal rights-based governance obligation.'
      },
      {
        pattern: /\bwe handle data carefully\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} process Personal Data in accordance with the principles of lawfulness, fairness, and transparency`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Replaces vague care language with GDPR/DPDPA processing principles.'
      },
      {
        pattern: /\bour team makes sure\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} ensure that designated personnel`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Replaces informal team reference with institutional accountability language.'
      },
      {
        pattern: /\bwe will try to\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative}`,
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Eliminates tentative first-person phrasing and replaces with formal institutional obligation.'
      },
      {
        pattern: /\bwe will\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative}`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Replaces informal first-person future tense with formal institutional imperative.'
      },
      {
        pattern: /\bwe ensure\b/gi,
        getReplacement: (p) => `${p.passiveEntity} ${p.imperative} ensure`,
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Elevates first-person assurance to institutional governance commitment.'
      }
    ];

    this._runPatternRules(text, rules, 'governance-maturity', profile, suggestions, startId);
  }

  static _scanCrossReferences(text, profile, suggestions, startId) {
    const rules = [
      {
        pattern: /\bas described in Section (\d+)\b/gi,
        getReplacementFn: (match) => `as described in Section ${match[1]} ([Section Title])`,
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Cross-references should include section titles to improve navigability and reduce ambiguity for auditors.'
      },
      {
        pattern: /\bin accordance with this Policy\b/gi,
        getReplacement: () => 'in accordance with this Policy ([Document Reference])',
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Adding document reference identifiers strengthens traceability in multi-policy governance frameworks.'
      },
      {
        pattern: /\bpursuant to applicable requirements\b/gi,
        getReplacement: () => 'pursuant to [specify applicable regulatory framework and article]',
        severity: this.SEVERITY.STRONGLY_RECOMMENDED,
        rationale: 'Vague regulatory references weaken audit defensibility. Specific framework citations are required for consultant-grade output.'
      },
      {
        pattern: /\bsubject to the requirements defined herein\b/gi,
        getReplacement: () => 'subject to the requirements defined in Section [X] ([Section Title])',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Specific section references improve cross-referencing integrity and support regulatory audit workflows.'
      },
      {
        pattern: /\bas mentioned above\b/gi,
        getReplacement: () => 'as defined in Section [X] ([Section Title])',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Directional references ("above") are fragile in versioned documents. Specific section numbers are required.'
      },
      {
        pattern: /\bas mentioned below\b/gi,
        getReplacement: () => 'as defined in Section [X] ([Section Title])',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Directional references ("below") are fragile in versioned documents. Specific section numbers are required.'
      },
      {
        pattern: /\bthe relevant provisions\b/gi,
        getReplacement: () => 'the provisions set forth in [specify clause or regulatory article]',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Vague provision references undermine audit precision. Specific clause references are expected in governance-grade documents.'
      },
      {
        pattern: /\bas per the guidelines\b/gi,
        getReplacement: () => 'as per [specify guideline reference or standard]',
        severity: this.SEVERITY.OPTIONAL,
        rationale: 'Unnamed guideline references lack traceability. Specific guideline or standard references improve defensibility.'
      },
      {
        pattern: /\brefer to the appendix\b/gi,
        getReplacement: () => 'refer to Appendix [X] ([Appendix Title])',
        severity: this.SEVERITY.RECOMMENDED,
        rationale: 'Appendix references should include identifiers and titles for document integrity.'
      }
    ];

    // Cross-reference rules use a slightly different pattern to handle capture groups
    let id = startId;
    for (const rule of rules) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const original = match[0];
        let replacement;
        if (rule.getReplacementFn) {
          replacement = rule.getReplacementFn(match);
        } else {
          replacement = typeof rule.getReplacement === 'function' ? rule.getReplacement(profile) : rule.getReplacement;
        }

        suggestions.push({
          id: `ref-${id++}`,
          category: 'cross-reference',
          severity: rule.severity,
          original: original,
          replacement: replacement,
          rationale: rule.rationale,
          location: match.index
        });
      }
    }
  }

  // ─── INTERNAL HELPERS ─────────────────────────────────────────────────────

  static _runPatternRules(text, rules, category, profile, suggestions, startId) {
    let id = startId;
    for (const rule of rules) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const original = match[0];
        const replacement = rule.getReplacement(profile);

        suggestions.push({
          id: `ref-${id++}`,
          category: category,
          severity: rule.severity,
          original: original,
          replacement: replacement,
          rationale: rule.rationale,
          location: match.index
        });
      }
    }
  }
}
