// acronymService.js
// Generates Appendix E: Acronyms & Definitions

export class AcronymService {
  static generateAppendix(text, domainKey, profile) {
    let md = `### APPENDIX E — ACRONYMS & DEFINITIONS\n\n`;
    md += `| Acronym | Definition |\n`;
    md += `| --- | --- |\n`;
    
    const acronyms = [];
    
    // Auto-detect acronyms from profile
    if (profile) {
      if (profile.dpoOfficer) acronyms.push({ key: "DPO", def: "Data Protection Officer" });
      if (profile.grievanceOfficer) acronyms.push({ key: "GO", def: "Grievance Officer" });
    }

    // Default by domain
    if (domainKey === 'privacy') {
      acronyms.push({ key: "PII", def: "Personally Identifiable Information" });
      acronyms.push({ key: "DSAR", def: "Data Subject Access Request" });
      acronyms.push({ key: "DPIA", def: "Data Privacy Impact Assessment" });
      acronyms.push({ key: "SCC", def: "Standard Contractual Clauses" });
    } else if (domainKey === 'infosec') {
      acronyms.push({ key: "CISO", def: "Chief Information Security Officer" });
      acronyms.push({ key: "ISMS", def: "Information Security Management System" });
      acronyms.push({ key: "BCP", def: "Business Continuity Plan" });
      acronyms.push({ key: "DR", def: "Disaster Recovery" });
      acronyms.push({ key: "MFA", def: "Multi-Factor Authentication" });
    }

    // Common acronyms
    acronyms.push({ key: "ARR", def: "Annual Recurring Revenue" });
    acronyms.push({ key: "B2B", def: "Business to Business" });

    // Deduplicate
    const unique = [];
    const seen = new Set();
    acronyms.forEach(a => {
      if (!seen.has(a.key)) {
        seen.add(a.key);
        unique.push(a);
      }
    });

    unique.forEach(a => {
      md += `| ${a.key} | ${a.def} |\n`;
    });

    return md;
  }
}
