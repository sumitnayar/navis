// crossReferenceService.js
// Generates Appendix A: Related Governance Documents

export class CrossReferenceService {
  static generateAppendix(domainKey) {
    let md = `### 11. RELATED GOVERNANCE DOCUMENTS\n\n`;
    md += `This document should be read in conjunction with the following corporate policies and standards:\n\n`;
    
    if (domainKey === 'privacy') {
      md += `*   **POL-SEC-001**: Information Security Policy\n`;
      md += `*   **POL-SEC-004**: Data Classification & Handling Standard\n`;
      md += `*   **POL-SEC-009**: Data Breach Incident Response Plan\n`;
      md += `*   **POL-HR-002**: Acceptable Use Policy\n`;
      md += `*   **POL-VEN-001**: Third-Party Risk Management Policy\n`;
    } else if (domainKey === 'infosec') {
      md += `*   **POL-PRI-001**: Enterprise Data Privacy Policy\n`;
      md += `*   **POL-SEC-002**: Access Control Policy\n`;
      md += `*   **POL-SEC-005**: Cryptography & Key Management Standard\n`;
      md += `*   **POL-SEC-008**: Business Continuity & Disaster Recovery Plan\n`;
      md += `*   **POL-VEN-001**: Vendor Security Assessment Standard\n`;
    } else {
      md += `*   **POL-SEC-001**: Information Security Policy\n`;
      md += `*   **POL-PRI-001**: Enterprise Data Privacy Policy\n`;
      md += `*   **POL-GOV-001**: Enterprise Risk Management Framework\n`;
    }
    
    return md;
  }
}
