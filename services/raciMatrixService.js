// raciMatrixService.js
// Generates Appendix D: RACI Matrix

export class RaciMatrixService {
  static getRaciData(domainKey) {
    if (domainKey === 'privacy') {
      return [
        { activity: "Data Privacy Impact Assessment (DPIA)", roles: { dpo: "A", legal: "C", it: "R", hr: "I" } },
        { activity: "Data Subject Access Request (DSAR)", roles: { dpo: "R", legal: "C", it: "I", hr: "I" } },
        { activity: "Data Breach Incident Notification", roles: { dpo: "C", legal: "A", it: "R", hr: "I" } },
        { activity: "Vendor Due Diligence", roles: { dpo: "C", legal: "C", it: "A", hr: "I" } },
        { activity: "Consent Mechanism Configuration", roles: { dpo: "C", legal: "I", it: "A", hr: "R" } },
      ];
    } else if (domainKey === 'infosec') {
      return [
        { activity: "Access Control Review", roles: { ciso: "A", hr: "C", it: "R", legal: "I" } },
        { activity: "Vulnerability Scanning", roles: { ciso: "A", hr: "I", it: "R", legal: "I" } },
        { activity: "Security Incident Response", roles: { ciso: "A", hr: "I", it: "R", legal: "C" } },
        { activity: "Vendor Security Assessment", roles: { ciso: "R", hr: "I", it: "C", legal: "A" } },
      ];
    } else {
      // Default / Resilience / Third Party
      return [
        { activity: "Policy Annual Review", roles: { owner: "A", hr: "C", it: "C", legal: "I" } },
        { activity: "Control Implementation", roles: { owner: "R", hr: "I", it: "A", legal: "I" } },
        { activity: "Audit and Verification", roles: { owner: "I", hr: "I", it: "C", legal: "A" } },
      ];
    }
  }

  static getHeaders(domainKey) {
    if (domainKey === 'privacy') return ["Activity", "DPO", "Legal", "IT", "HR"];
    if (domainKey === 'infosec') return ["Activity", "CISO", "HR", "IT", "Legal"];
    return ["Activity", "Control Owner", "HR", "IT", "Legal"];
  }

  static generateAppendix(domainKey) {
    const data = this.getRaciData(domainKey);
    const headers = this.getHeaders(domainKey);

    let md = `### APPENDIX D — RACI MATRIX\n\n`;
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    data.forEach(row => {
      const vals = Object.values(row.roles);
      md += `| ${row.activity} | ${vals.join(' | ')} |\n`;
    });

    md += `\n*R = Responsible, A = Accountable, C = Consulted, I = Informed*\n`;
    return md;
  }
}
