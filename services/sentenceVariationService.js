// sentenceVariationService.js
// Provides dynamic sentence starters and ownership language formatting

export class SentenceVariationService {
  static starters = [
    "The Organization shall",
    "Management shall ensure that",
    "Appropriate controls shall be established to",
    "Responsible functions shall",
    "Relevant stakeholders shall",
    "It is mandatory that",
    "The designated owner must",
    "Procedural safeguards shall dictate that"
  ];

  static privacyStarters = [
    "The Privacy Team shall",
    "The Data Protection Officer shall oversee that",
    "Data processing activities must ensure"
  ];

  static securityStarters = [
    "The Information Security Function shall",
    "The CISO must guarantee that",
    "Security architectures shall enforce that"
  ];

  /**
   * Returns a random sentence starter based on domain context.
   */
  static getStarter(domainKey = 'general') {
    let pool = [...this.starters];
    if (domainKey === 'privacy') pool = pool.concat(this.privacyStarters);
    if (domainKey === 'infosec') pool = pool.concat(this.securityStarters);
    
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Formats the ownership language separating Role and Person.
   * e.g. formatOwner("Data Protection Officer", "Sumit Nayar") -> "The Data Protection Officer (currently Sumit Nayar)"
   */
  static formatOwner(role, personName) {
    if (!personName || personName.trim() === '') return `The ${role}`;
    return `The ${role} (currently ${personName})`;
  }

  /**
   * Processes a raw string and replaces static subjects with varied starters.
   */
  static applyVariation(text, domainKey = 'general', companyName = "The Organization") {
    if (!text) return "";
    
    // Replace repetitive "{{COMPANY_NAME}} shall" or "The organization shall" with varied starters
    const repetitivePattern = new RegExp(`(${companyName} shall|The organization shall|We shall|The company shall|{{COMPANY_NAME}} shall)`, "gi");
    
    return text.replace(repetitivePattern, () => {
      return this.getStarter(domainKey);
    });
  }
}
