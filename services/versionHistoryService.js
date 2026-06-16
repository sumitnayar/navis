// Navis Version History Service
// Manages the immutable local-first ledger for policy document revisions.

import { StorageService } from './storageService.js';

export class VersionHistoryService {
  // Fetch revision logs for a policy document
  static getVersionHistory(docId) {
    const data = localStorage.getItem('navis_v3_policy_versions');
    const versions = data ? JSON.parse(data) : {};
    return versions[docId] || [];
  }

  // Commit a new revision to history
  static saveVersion(docId, { editor, frameworks, summary, reason, documentText }) {
    const data = localStorage.getItem('navis_v3_policy_versions');
    const versions = data ? JSON.parse(data) : {};
    if (!versions[docId]) versions[docId] = [];

    const nextVerNum = versions[docId].length + 1;
    const newVer = {
      version: `v${nextVerNum}`,
      date: new Date().toISOString(),
      editor: editor || 'CRO (Chief Risk Officer)',
      frameworks: frameworks || [],
      summary: summary || 'Policy draft approved.',
      reason: reason || 'Routine Update',
      documentText: documentText
    };

    versions[docId].push(newVer);
    localStorage.setItem('navis_v3_policy_versions', JSON.stringify(versions));
    return newVer;
  }

  // Rollback to an older version (Creates a new revision entry)
  static async rollbackVersion(docId, versionIndex, editorRole) {
    const history = this.getVersionHistory(docId);
    const targetVer = history[versionIndex];
    if (!targetVer) throw new Error("Target revision not found.");

    // 1. Rollback creates a new version, preserving previous history
    const rollbackRevision = {
      editor: editorRole || 'CRO (Chief Risk Officer)',
      frameworks: targetVer.frameworks,
      summary: `Rollback to ${targetVer.version} baseline state.`,
      reason: `Rollback to ${targetVer.version}`,
      documentText: targetVer.documentText
    };

    const nextVer = this.saveVersion(docId, rollbackRevision);

    // 2. Update the active document text in StorageService
    const policies = await StorageService.getPolicyDocuments();
    const policyDoc = policies.find(p => p.id === docId);
    if (policyDoc) {
      const updatedDoc = {
        ...policyDoc,
        extracted_text: targetVer.documentText,
        updated_at: new Date().toISOString()
      };
      await StorageService.savePolicyDocument(updatedDoc);
    }

    return nextVer;
  }
}
