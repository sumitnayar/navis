// organizationContextService.js
// Converts organization profile information into a rich organizational narrative

export class OrganizationContextService {
  /**
   * Generates a narrative block describing the organization's context based on the profile data.
   */
  static generateNarrative(profile, selectedFrameworks) {
    if (!profile) return "";
    
    const company = profile.companyName || "The Organization";
    
    // Processing Context
    let processingContext = "";
    if (profile.processingRole) {
      processingContext += `${company} operates as a ${profile.processingRole}`;
      if (profile.b2bB2c) {
        processingContext += ` utilizing a ${profile.b2bB2c} business model`;
      }
      processingContext += ". ";
    } else {
      processingContext += `${company} operates globally. `;
    }
    
    if (profile.customerGeography) {
      processingContext += `It provides services to customers primarily located in ${profile.customerGeography}. `;
    }
    
    if (profile.dataSubjects) {
      processingContext += `Core processing activities involve data subjects including: ${profile.dataSubjects}. `;
    }
    
    if (profile.specialCategories) {
      processingContext += `This includes the processing of special category data such as: ${profile.specialCategories}. `;
    }

    // Regulatory Context
    let regulatoryContext = "";
    if (selectedFrameworks && selectedFrameworks.length > 0) {
      regulatoryContext += `The operational footprint mandates strict adherence to the following regulatory frameworks: ${selectedFrameworks.join(', ')}. `;
    }

    // Technical Context
    let technicalContext = "";
    if (profile.cloudProvider || profile.hostingRegion) {
      technicalContext += `Production workloads are hosted `;
      if (profile.cloudProvider) technicalContext += `via ${profile.cloudProvider} `;
      if (profile.hostingRegion) technicalContext += `in ${profile.hostingRegion} region(s). `;
    }
    
    if (profile.subprocessors) {
      technicalContext += `Critical subprocessors include: ${profile.subprocessors}. `;
    }
    
    if (profile.internationalTransfers) {
      technicalContext += `International data transfers are governed by mechanisms such as ${profile.internationalTransfers}. `;
    }

    // Governance Context
    let governanceContext = "";
    if (profile.dpoOfficer || profile.grievanceOfficer || profile.cisoOfficer || profile.croOfficer) {
      governanceContext += `Key accountability roles include `;
      const roles = [];
      if (profile.dpoOfficer) roles.push(`Data Protection Officer (${profile.dpoOfficer})`);
      if (profile.grievanceOfficer) roles.push(`Grievance Officer (${profile.grievanceOfficer})`);
      if (profile.cisoOfficer) roles.push(`CISO (${profile.cisoOfficer})`);
      if (profile.croOfficer) roles.push(`CRO (${profile.croOfficer})`);
      governanceContext += roles.join(', ') + `.`;
    }

    return `
### ORGANIZATION CONTEXT
**Processing Context:** ${processingContext.trim() || 'Standard processing operations.'}
**Regulatory Context:** ${regulatoryContext.trim() || 'General industry standards.'}
**Technical Context:** ${technicalContext.trim() || 'Standard cloud infrastructure.'}
**Governance Context:** ${governanceContext.trim() || 'Executive oversight committee.'}
`.trim();
  }
}
