export class DocumentCrossReferenceService {
  /**
   * Generates the "RELATED DOCUMENTS" section mapping.
   */
  static getRelatedDocuments(domain) {
    const commonDocs = [
      "- Information Security Policy",
      "- Acceptable Use Policy"
    ];

    switch (domain) {
      case 'bcp':
        return [
          "- Disaster Recovery Standard",
          "- Incident Response Policy",
          "- Data Backup Standard",
          ...commonDocs
        ].join('\n');
      case 'ir':
        return [
          "- Business Continuity Policy",
          "- Vendor Risk Policy",
          "- Data Breach Notification Procedure",
          ...commonDocs
        ].join('\n');
      case 'vendor':
        return [
          "- Data Classification Standard",
          "- Access Control Standard",
          "- Incident Response Policy",
          ...commonDocs
        ].join('\n');
      default:
        return commonDocs.join('\n');
    }
  }
}
