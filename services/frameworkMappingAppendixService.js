// frameworkMappingAppendixService.js
// Generates Appendix C: Framework Mapping

export class FrameworkMappingAppendixService {
  static generateAppendix(selectedFrameworks) {
    if (!selectedFrameworks || selectedFrameworks.length === 0) {
      return `### APPENDIX C — FRAMEWORK MAPPING\n\nNo specific frameworks selected. This document aligns with general industry best practices.\n`;
    }

    let md = `### APPENDIX C — FRAMEWORK MAPPING\n\n`;
    md += `| Control Domain | Framework Requirement | Applicability |\n`;
    md += `| --- | --- | --- |\n`;

    if (selectedFrameworks.includes('GDPR')) {
      md += `| Data Minimization | GDPR Article 5(1)(c) | Mandatory |\n`;
      md += `| Consent Management | GDPR Article 7 | Mandatory |\n`;
      md += `| Data Breach Notification | GDPR Article 33 | Mandatory |\n`;
    }
    
    if (selectedFrameworks.includes('DPDPA')) {
      md += `| Notice & Consent | DPDPA Section 5 & 6 | Mandatory |\n`;
      md += `| Data Fiduciary Obligations | DPDPA Section 8 | Mandatory |\n`;
      md += `| Cross-border Transfer | DPDPA Section 16 | Restricted |\n`;
    }

    if (selectedFrameworks.includes('ISO 27001')) {
      md += `| Access Control | ISO 27001 A.9.1 | Mandatory |\n`;
      md += `| Cryptography | ISO 27001 A.10.1 | Mandatory |\n`;
      md += `| Incident Management | ISO 27001 A.16.1 | Mandatory |\n`;
    }

    if (selectedFrameworks.includes('SOC 2')) {
      md += `| Security | SOC 2 CC1-CC9 | Mandatory |\n`;
      md += `| Availability | SOC 2 A1.1-A1.3 | Optional |\n`;
      md += `| Confidentiality | SOC 2 C1.1-C1.2 | Mandatory |\n`;
    }

    return md;
  }
}
