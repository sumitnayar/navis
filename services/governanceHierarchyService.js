export class GovernanceHierarchyService {
  /**
   * Generates a formal hierarchy statement for the artifact.
   */
  static getHierarchyStatement(artifactType) {
    switch (artifactType) {
      case 'Policy':
        return `This policy establishes the mandate for this domain. It is operationalized through the associated Standard, and executed via the corresponding Procedures.`;
      case 'Standard':
        return `This standard supports the domain Policy by defining mandatory baseline controls. It is implemented through associated Procedures and Workbooks.`;
      case 'Procedure':
        return `This procedure provides tactical execution steps to fulfill the requirements defined in the domain Standard.`;
      case 'Workbook':
        return `This workbook serves as the operational register and quantification tool supporting the domain Procedure.`;
      case 'Testing Program':
        return `This program validates the efficacy of the controls defined in the Standard and Procedure.`;
      case 'Board Pack':
        return `This report summarizes outcomes arising from the Testing Program, Workbooks, and Policy adherence metrics for Board oversight.`;
      default:
        return `This document supports the broader Governance Pack ecosystem.`;
    }
  }
}
