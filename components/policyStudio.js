// Navis Policy Intelligence Studio Component
// Implements Modules 1 to 11

import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';
import { PolicyTemplateService } from '../services/policyTemplateService.js';

export class PolicyStudioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;

    this.activeSubTab = 'generator'; // 'generator', 'upgrade', 'versions'
    
    // Generator State
    this.genDomain = 'infosec';
    this.genTemplate = 'access_control';
    this.genIndustry = 'SaaS';
    this.genPrompt = '';
    
    this.genProfile = {
      countries: 'India, USA',
      cloudProvider: 'AWS',
      customerTypes: 'B2B Enterprise',
      employeeCount: '150',
      dataCategories: 'User Accounts, Event Tracking, Payment Details'
    };
    
    this.isGenerating = false;
    this.genResultText = '';
    this.genTitle = 'Access Control Policy';

    // Upgrade Wizard / Gap Analysis State
    this.selectedDocId = '';
    this.targetFramework = 'dpdp';
    this.isAnalyzing = false;
    this.analysisResults = null; // { missing, weak, strong, coverage, amendments, summary, updatedDraft }
    
    // Clause Intelligence Actions
    this.itemDecisions = {}; // { clauseId: 'pending'|'accepted'|'dismissed' }
    this.editedClauses = {}; // { clauseId: 'edited text' }
    this.expandedClauseId = null;

    // Staging / Version State
    this.reviewSummary = '';
    this.isPublishing = false;
  }

  // Helper: Get versions map from localStorage
  getPolicyVersions(docId) {
    const data = localStorage.getItem('navis_v3_policy_versions');
    const versions = data ? JSON.parse(data) : {};
    return versions[docId] || [];
  }

  // Helper: Save version to localStorage
  savePolicyVersion(docId, versionObj) {
    const data = localStorage.getItem('navis_v3_policy_versions');
    const versions = data ? JSON.parse(data) : {};
    if (!versions[docId]) versions[docId] = [];
    
    // Determine next version number
    const nextVer = `v${versions[docId].length + 1}`;
    const newVer = {
      version: nextVer,
      owner: this.state.settings?.activeUserRole || 'CRO (Chief Risk Officer)',
      approver: 'Board Risk Committee',
      date: new Date().toISOString(),
      summary: versionObj.summary || 'Policy update approved',
      frameworks: versionObj.frameworks || [],
      content: versionObj.content
    };
    
    versions[docId].push(newVer);
    localStorage.setItem('navis_v3_policy_versions', JSON.stringify(versions));
    return newVer;
  }

  // Push recommendation to Change Queue
  async pushToChangeQueue(type, title, description, metadata = {}) {
    const queue = await StorageService.getChangeQueue();
    const newItem = {
      id: `cq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: type, // 'Risk', 'Control', 'Action', 'ObjectiveLink', 'PolicyUpdate'
      title: title,
      description: description,
      confidence: metadata.confidence || 'high',
      deltaStatus: metadata.deltaStatus || 'New',
      sourceDocument: metadata.sourceDocument || 'Policy Intelligence Studio',
      uploadDate: new Date().toISOString(),
      decision: 'pending',
      metadata: metadata
    };
    queue.push(newItem);
    await StorageService.saveChangeQueue(queue);
    
    // Notify user with small alert
    alert(`Change request created in global queue: [${type}] ${title}`);
  }

  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Governance Control Desk</span>
          <h1>Policy Intelligence Studio</h1>
          <p class="page-subtitle">Draft, compare, audit, and upgrade corporate policies against internal requirements and compliance frameworks.</p>
        </div>
      </div>

      <!-- SUBTAB STRIP -->
      <div class="subtab-strip no-print" style="display:flex;gap:4px;border-bottom:1px solid var(--border-color);margin-bottom:20px;padding-bottom:1px;">
        <button class="subtab-btn ${this.activeSubTab === 'generator' ? 'active' : ''}" data-subtab="generator" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Library & Generator
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'upgrade' ? 'active' : ''}" data-subtab="upgrade" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Upgrade Wizard & Gaps
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'versions' ? 'active' : ''}" data-subtab="versions" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Approved Updates & Versions
        </button>
      </div>

      <div class="policy-studio-body">
        ${this.renderSubTabContent()}
      </div>
    `;

    this.bindEvents(container);
  }

  renderSubTabContent() {
    if (this.activeSubTab === 'generator') {
      return this.renderGeneratorTab();
    } else if (this.activeSubTab === 'upgrade') {
      return this.renderUpgradeTab();
    } else {
      return this.renderVersionsTab();
    }
  }

  // ─── TAB 1: GENERATOR & LIBRARY ──────────────────────────────────────────
  renderGeneratorTab() {
    const domains = PolicyTemplateService.getDomains();
    const activeDomain = domains[this.genDomain];
    const subPolicies = activeDomain ? activeDomain.templates : {};
    const clauses = PolicyTemplateService.getClauseLibrary();

    return `
      <div class="register-layout">
        
        <!-- LEFT: SELECTION & COMPANY PROFILE -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Policy Selection</h3>
            
            <div class="form-group">
              <label>Policy Domain</label>
              <select class="form-control" id="gen-domain-select">
                ${Object.entries(domains).map(([k, d]) => `
                  <option value="${k}" ${this.genDomain === k ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Target Policy Document</label>
              <select class="form-control" id="gen-template-select">
                ${Object.entries(subPolicies).map(([k, t]) => `
                  <option value="${k}" ${this.genTemplate === k ? 'selected' : ''}>${t.title}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Industry Variant</label>
              <select class="form-control" id="gen-industry-select">
                <option value="SaaS" ${this.genIndustry === 'SaaS' ? 'selected' : ''}>SaaS</option>
                <option value="FinTech" ${this.genIndustry === 'FinTech' ? 'selected' : ''}>FinTech</option>
                <option value="Healthcare" ${this.genIndustry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                <option value="EdTech" ${this.genIndustry === 'EdTech' ? 'selected' : ''}>EdTech</option>
                <option value="Manufacturing" ${this.genIndustry === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
              </select>
            </div>
          </div>

          <div class="glass-panel" style="margin-top:16px;">
            <h3 class="dashboard-card-title">Company Profile</h3>
            
            <div class="form-group">
              <label>Operating Countries</label>
              <input type="text" class="form-control profile-field" data-key="countries" value="${this.genProfile.countries}" />
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Cloud Provider</label>
                <input type="text" class="form-control profile-field" data-key="cloudProvider" value="${this.genProfile.cloudProvider}" />
              </div>
              <div class="form-group">
                <label>Employee Count</label>
                <input type="text" class="form-control profile-field" data-key="employeeCount" value="${this.genProfile.employeeCount}" />
              </div>
            </div>

            <div class="form-group">
              <label>Customer Types</label>
              <input type="text" class="form-control profile-field" data-key="customerTypes" value="${this.genProfile.customerTypes}" />
            </div>

            <div class="form-group">
              <label>Data Categories Processed</label>
              <textarea class="form-control profile-field" data-key="dataCategories" rows="2" style="font-size:11px;">${this.genProfile.dataCategories}</textarea>
            </div>
          </div>

          <div class="glass-panel" style="margin-top:16px; background:rgba(0,181,181,0.02);">
            <h3 class="dashboard-card-title" style="color:var(--color-indigo);">Clause Library Moat</h3>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:10px;">
              Browse consultant-grade clauses to use as reusable building blocks.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto;padding-right:4px;">
              ${clauses.map(c => `
                <div class="clause-pill" style="padding:8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;cursor:pointer;" data-clause-id="${c.id}">
                  <strong style="color:var(--text-primary);display:block;">${c.name}</strong>
                  <span style="font-size:9px;color:var(--text-muted);">${c.frameworks.join(', ')} | ${c.confidence} Confidence</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: PROMPT INPUT & GENERATED DRAFT -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:580px;display:flex;flex-direction:column;justify-content:space-between;">
            
            <div>
              <h3 class="dashboard-card-title">Drafting Workspace</h3>
              
              <div class="form-group">
                <label>Custom Drafting Prompts (Optional)</label>
                <textarea class="form-control" id="gen-prompt-input" rows="3" placeholder="e.g. Include specific guidelines for Indian data residency and ISO 27001 logging controls..." style="font-size:11px;">${this.genPrompt}</textarea>
              </div>

              <div style="margin-top:12px;">
                <button class="btn btn-primary" id="btn-generate-policy" style="width:100%;justify-content:center;height:36px;" ${this.isGenerating ? 'disabled' : ''}>
                  ${this.isGenerating ? 'Drafting Policy Document...' : 'Generate Board-Quality Draft'}
                </button>
              </div>
            </div>

            <!-- RESULT AREA -->
            <div style="flex-grow:1;margin-top:20px;display:flex;flex-direction:column;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:8px;margin-bottom:10px;">
                <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;">
                  Draft Preview: <span style="color:var(--text-primary);font-weight:700;">${this.genTitle}</span>
                </h4>
                ${this.genResultText ? `
                  <button class="btn btn-secondary btn-small" id="btn-save-draft-to-vault" style="font-size:10px;">Save Draft to Vault</button>
                ` : ''}
              </div>

              <div id="gen-result-container" style="flex-grow:1;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;font-family:var(--font-body);font-size:12px;line-height:1.6;color:var(--text-primary);overflow-y:auto;max-height:360px;white-space:pre-wrap;">
                ${this.isGenerating ? `
                  <div style="text-align:center;padding:80px 0;color:var(--text-muted);">
                    <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
                      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
                    </svg>
                    Executing real-time analysis & drafting...
                  </div>
                ` : this.genResultText ? this.genResultText : `
                  <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 12px;opacity:0.3;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Configure selections on the left and click Generate to begin.
                  </div>
                `}
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 2: UPGRADE WIZARD & GAP ANALYSIS ────────────────────────────────
  renderUpgradeTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const frameworks = PolicyTemplateService.getRequirementPacks();
    const results = this.analysisResults;

    return `
      <div class="register-layout">
        
        <!-- LEFT: AUDIT WORKFLOW TRIGGERS -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Upgrade Wizard Configuration</h3>
            
            <div class="form-group">
              <label>Select Ingested Policy</label>
              <select class="form-control" id="audit-doc-select">
                <option value="">-- Choose from Vault --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${this.selectedDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Target Framework</label>
              <select class="form-control" id="audit-framework-select">
                ${Object.entries(frameworks).map(([k, f]) => `
                  <option value="${k}" ${this.targetFramework === k ? 'selected' : ''}>${f.name}</option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-primary" id="btn-run-policy-audit" style="width:100%;justify-content:center;margin-top:12px;" ${!this.selectedDocId || this.isAnalyzing ? 'disabled' : ''}>
              ${this.isAnalyzing ? 'Analyzing Alignment...' : 'Analyze Policy & Gaps'}
            </button>
          </div>

          <!-- REQ PACK INSPECTOR -->
          <div class="glass-panel" style="margin-top:16px;">
            <h3 class="dashboard-card-title">Requirement Pack Preview</h3>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:12px;">
              Exposing requirements mapped by ${frameworks[this.targetFramework]?.name || 'Target Framework'}.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px;">
              ${(frameworks[this.targetFramework]?.requirements || []).map(r => `
                <div style="padding:8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;">
                  <strong style="color:var(--text-primary);display:block;">${r.name}</strong>
                  <span style="font-size:10px;color:var(--text-secondary);line-height:1.3;display:block;margin-top:2px;">${r.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: RESULTS PANEL -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:580px;">
            <h3 class="dashboard-card-title">Analysis Workspace</h3>

            ${this.isAnalyzing ? `
              <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
                </svg>
                Comparing policy content to requirement controls...
              </div>
            ` : results ? `
              
              <!-- COVERAGE SUMMARY -->
              <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:1fr 2fr;gap:20px;">
                <div style="border-right:1px solid var(--border-color);padding-right:10px;display:flex;flex-direction:column;justify-content:center;">
                  <span style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Executive Summary</span>
                  <p style="font-size:12px;color:var(--text-primary);line-height:1.45;margin-top:6px;">
                    ${results.summary}
                  </p>
                </div>
                <div>
                  <span style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;display:block;margin-bottom:8px;">Coverage Analysis</span>
                  <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <div style="padding:10px;background:var(--color-safe-bg);border:1px solid var(--color-safe);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-safe-text);font-size:16px;display:block;">${results.strong.length}</strong>
                      <span style="font-size:9px;color:var(--color-safe-text);font-weight:600;text-transform:uppercase;">Strongly Addressed</span>
                    </div>
                    <div style="padding:10px;background:var(--color-warning-bg);border:1px solid var(--color-warning);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-warning-text);font-size:16px;display:block;">${results.weak.length}</strong>
                      <span style="font-size:9px;color:var(--color-warning-text);font-weight:600;text-transform:uppercase;">Partially Addressed</span>
                    </div>
                    <div style="padding:10px;background:var(--color-critical-bg);border:1px solid var(--color-critical);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-critical-text);font-size:16px;display:block;">${results.missing.length}</strong>
                      <span style="font-size:9px;color:var(--color-critical-text);font-weight:600;text-transform:uppercase;">Missing Requirements</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CLAUSE INTELLIGENCE & SUGGESTIONS -->
              <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin-bottom:10px;">Clause Intelligence & Recommendations</h4>
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                ${results.gaps.map(g => {
                  const decision = this.itemDecisions[g.id] || 'pending';
                  const isExpanded = this.expandedClauseId === g.id;
                  const currentText = this.editedClauses[g.id] !== undefined ? this.editedClauses[g.id] : g.text;

                  let borderClr = 'var(--border-color)';
                  if (decision === 'accepted') borderClr = 'var(--color-safe)';
                  else if (decision === 'dismissed') borderClr = 'var(--color-critical)';

                  return `
                    <div style="border:1.5px solid ${borderClr};border-radius:8px;padding:12px;background:var(--bg-secondary);transition:all 0.2s;" class="clause-card" data-clause-id="${g.id}">
                      
                      <!-- Card Header -->
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            <span class="status-badge ${g.status === 'Missing' ? 'above' : 'near'}" style="font-size:9px;">
                              ${g.status}
                            </span>
                            <span class="profile-role-badge" style="font-size:9px;color:var(--color-indigo);">${g.reqName}</span>
                          </div>
                          <h4 style="font-size:13px;font-weight:700;margin-top:4px;">${g.name}</h4>
                        </div>
                        
                        <div style="display:flex;gap:6px;align-items:center;">
                          <span class="status-badge within" style="font-size:9px;padding:2px 6px;">
                            ${g.confidence} Conf
                          </span>
                          <button class="btn btn-secondary btn-small toggle-clause-btn" style="font-size:9px;padding:2px 6px;" data-clause-id="${g.id}">
                            ${isExpanded ? 'Collapse' : 'Review & Edit'}
                          </button>
                        </div>
                      </div>

                      <!-- Expanded Section -->
                      ${isExpanded ? `
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
                          <div class="form-group">
                            <label>Suggested Clause Text</label>
                            <textarea class="form-control clause-textarea" rows="4" style="font-family:var(--font-body);font-size:11px;line-height:1.5;margin-bottom:8px;" data-clause-id="${g.id}">${currentText}</textarea>
                          </div>
                          
                          <div style="background:var(--bg-primary);border-radius:6px;padding:8px 12px;font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:12px;">
                            <strong>Rationale:</strong> ${g.rationale}
                          </div>

                          <!-- Actions Row -->
                          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <!-- Decision Actions -->
                            <div style="display:flex;gap:6px;">
                              <button class="btn btn-secondary btn-small clause-action-btn" data-action="accept" data-clause-id="${g.id}" style="${decision === 'accepted' ? 'background:var(--color-safe-bg);color:var(--color-safe);border-color:var(--color-safe);' : ''}">
                                ${decision === 'accepted' ? '✓ Accepted' : 'Accept Suggested'}
                              </button>
                              <button class="btn btn-secondary btn-small clause-action-btn" data-action="dismiss" data-clause-id="${g.id}" style="${decision === 'dismissed' ? 'background:var(--color-critical-bg);color:var(--color-critical);border-color:var(--color-critical);' : ''}">
                                ${decision === 'dismissed' ? '✕ Dismissed' : 'Dismiss'}
                              </button>
                            </div>
                            
                            <!-- Change Queue Actions -->
                            <div style="display:flex;gap:4px;">
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Control" data-clause-id="${g.id}" style="font-size:10px;">Create Control</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Risk" data-clause-id="${g.id}" style="font-size:10px;">Create Risk</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Action" data-clause-id="${g.id}" style="font-size:10px;">Create Action</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="ObjectiveLink" data-clause-id="${g.id}" style="font-size:10px;">Link Objective</button>
                            </div>
                          </div>
                        </div>
                      ` : ''}

                    </div>
                  `;
                }).join('')}
              </div>

              <!-- PROPOSED AMENDMENTS -->
              <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin-bottom:8px;">Proposed Amendments Summary</h4>
              <div class="glass-panel" style="padding:12px;margin-bottom:20px;background:rgba(255,255,255,0.2);">
                <ul style="padding-left:16px;font-size:11px;color:var(--text-secondary);line-height:1.6;">
                  ${results.amendments.map(a => `
                    <li><strong>${a.action}</strong>: ${a.desc}</li>
                  `).join('')}
                </ul>
              </div>

              <!-- APPROVAL BOX -->
              <div class="glass-panel" style="border-color:var(--color-indigo);background:rgba(0,181,181,0.015);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <h4 style="font-size:13px;font-weight:700;">Approve & Create New Version</h4>
                  <p style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                    Stages the accepted clauses and increments the policy version.
                  </p>
                </div>
                <button class="btn btn-primary" id="btn-approve-and-stage" style="height:32px;">Approve Amendments</button>
              </div>

            ` : `
              <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 12px;opacity:0.3;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Select an existing policy document and target framework on the left to begin gap analysis.
              </div>
            `}
          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 3: APPROVED UPDATES & VERSION HISTORY ───────────────────────────
  renderVersionsTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const activeDocId = this.selectedDocId;
    const doc = vaultDocs.find(d => d.id === activeDocId);
    
    // Fetch version history
    const versions = activeDocId ? this.getPolicyVersions(activeDocId) : [];

    return `
      <div class="register-layout">
        
        <!-- LEFT: POLICY SELECTOR -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Policy Selection</h3>
            <div class="form-group">
              <label>Choose Policy</label>
              <select class="form-control" id="ver-doc-select">
                <option value="">-- Select Policy --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${activeDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>
            ${doc ? `
              <div style="margin-top:12px;font-size:11px;color:var(--text-secondary);line-height:1.4;">
                <div>Status: <strong class="status-badge within" style="font-size:9px;">${doc.status}</strong></div>
                <div style="margin-top:6px;">Upload Date: <strong>${new Date(doc.uploadDate).toLocaleDateString('en-GB')}</strong></div>
                <div style="margin-top:6px;">Document Type: <strong>${doc.documentType}</strong></div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- RIGHT: VERSION LOGS & STAGING -->
        <div class="details-panel" style="flex: 2 1 500px;">
          
          <!-- STAGING WORKFLOW -->
          ${this.isPublishing ? `
            <div class="glass-panel" style="border-color:var(--color-indigo);margin-bottom:16px;">
              <h3 class="dashboard-card-title" style="color:var(--color-indigo);">Approval Workflow & Publication</h3>
              
              <div class="form-group" style="margin-top:12px;">
                <label>Review Summary / Change Notes</label>
                <textarea class="form-control" id="pub-summary-input" rows="3" placeholder="e.g. Added consent withdrawal clause to satisfy DPDP criteria, and verified least-privilege logging parameters." style="font-size:11px;">${this.reviewSummary}</textarea>
              </div>

              <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn btn-primary" id="btn-submit-publication" style="flex-grow:1;justify-content:center;">Commit & Publish New Version</button>
                <button class="btn btn-secondary" id="btn-cancel-publication">Cancel</button>
              </div>
            </div>
          ` : ''}

          <!-- VERSION LEDGER -->
          <div class="glass-panel" style="min-height:460px;">
            <h3 class="dashboard-card-title">Version History ledger</h3>
            
            ${!activeDocId ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                Select a policy on the left to review its version lifecycle.
              </div>
            ` : versions.length === 0 ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                <p>No revisions recorded for this document yet.</p>
                <p style="font-size:11px;margin-top:4px;">Approve gaps in the Upgrade Wizard to establish new versions.</p>
              </div>
            ` : `
              <div style="display:flex;flex-direction:column;gap:12px;">
                ${versions.map((v, idx) => `
                  <div class="glass-panel" style="padding:12px;background:var(--bg-secondary);border:1.5px solid var(--border-color);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                      <div>
                        <span class="status-badge within" style="font-size:10px;background:var(--color-safe-bg);color:var(--color-safe);">
                          ${v.version}
                        </span>
                        <h4 style="font-size:13px;font-weight:700;display:inline-block;margin-left:8px;color:var(--text-primary);">
                          Approved Revision
                        </h4>
                      </div>
                      <span style="font-size:10px;color:var(--text-muted);">
                        ${new Date(v.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style="margin-top:8px;font-size:11px;color:var(--text-secondary);line-height:1.45;">
                      <div><strong>Review Summary:</strong> ${v.summary}</div>
                      <div style="margin-top:4px;"><strong>Frameworks Mapped:</strong> ${v.frameworks.join(', ') || 'Internal Governance'}</div>
                      <div style="margin-top:4px;"><strong>Owner:</strong> ${v.owner} | <strong>Approver:</strong> ${v.approver}</div>
                    </div>

                    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;">
                      <button class="btn btn-secondary btn-small view-ver-text-btn" data-ver-idx="${idx}">Inspect Version Text</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

      </div>
    `;
  }

  // ─── EVENT BINDING ───────────────────────────────────────────────────────
  bindEvents(container) {
    // Subtab Buttons
    container.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubTab = btn.dataset.subtab;
        this.render(container);
      });
    });

    // ─── TAB 1 EVENTS ──────────────────────────────────────────────────────
    if (this.activeSubTab === 'generator') {
      const domSelect = container.querySelector('#gen-domain-select');
      const tempSelect = container.querySelector('#gen-template-select');
      const indSelect = container.querySelector('#gen-industry-select');
      const promptInput = container.querySelector('#gen-prompt-input');

      // Sync Selection Changes
      domSelect?.addEventListener('change', () => {
        this.genDomain = domSelect.value;
        const subPols = PolicyTemplateService.getDomains()[this.genDomain]?.templates || {};
        this.genTemplate = Object.keys(subPols)[0] || '';
        this.genTitle = subPols[this.genTemplate]?.title || 'Policy';
        this.render(container);
      });

      tempSelect?.addEventListener('change', () => {
        this.genTemplate = tempSelect.value;
        const subPols = PolicyTemplateService.getDomains()[this.genDomain]?.templates || {};
        this.genTitle = subPols[this.genTemplate]?.title || 'Policy';
        this.render(container);
      });

      indSelect?.addEventListener('change', () => {
        this.genIndustry = indSelect.value;
      });

      promptInput?.addEventListener('input', () => {
        this.genPrompt = promptInput.value;
      });

      // Sync Profile Field Changes
      container.querySelectorAll('.profile-field').forEach(field => {
        field.addEventListener('input', () => {
          this.genProfile[field.dataset.key] = field.value;
        });
      });

      // Click Clause Pill to Inject Clause
      container.querySelectorAll('.clause-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const clauseId = pill.dataset.clauseId;
          const lib = PolicyTemplateService.getClauseLibrary();
          const clause = lib.find(c => c.id === clauseId);
          if (clause) {
            const promptArea = container.querySelector('#gen-prompt-input');
            const insertText = `\nInclude clause details: ${clause.text}\n`;
            this.genPrompt = (this.genPrompt + insertText).trim();
            if (promptArea) promptArea.value = this.genPrompt;
          }
        });
      });

      // Generate Button
      container.querySelector('#btn-generate-policy')?.addEventListener('click', async () => {
        this.isGenerating = true;
        this.render(container);

        try {
          const baseText = PolicyTemplateService.customizeTemplate(this.genDomain, this.genTemplate, this.genIndustry, {
            companyName: this.state.settings?.companyName,
            ...this.genProfile
          });

          const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
          
          if (apiKey || this.state.serverGeminiConfigured) {
            // Live Gemini Call
            const systemPrompt = `You are a consultant-grade GRC policy intelligence assistant.
Generate a professional, board-ready draft for the policy '${this.genTitle}' for an industry of type '${this.genIndustry}'.
Use the following baseline text for context:
${baseText}

Company Profile details:
- Operating Countries: ${this.genProfile.countries}
- Cloud Provider: ${this.genProfile.cloudProvider}
- Employee Count: ${this.genProfile.employeeCount}
- Customer Types: ${this.genProfile.customerTypes}
- Data Categories Processed: ${this.genProfile.dataCategories}

Specific Drafting Directives:
${this.genPrompt || 'None provided.'}

Output ONLY the complete policy draft document. Do not add conversational introductions or conversational conclusions. Use clear headings.`;
            
            const liveResult = await AIService.queryGemini(systemPrompt, apiKey);
            this.genResultText = liveResult || baseText;
          } else {
            // Simulation Mode Fallback
            await new Promise(r => setTimeout(r, 1500)); // Simulate delay
            let simulatedText = `[DEMO DRAFT] ${this.genTitle}\n\n` + baseText;
            if (this.genPrompt) {
              simulatedText += `\n\nCustom Directives Incorporated:\n- ${this.genPrompt}`;
            }
            this.genResultText = simulatedText;
          }
        } catch (err) {
          console.error("Drafting failed:", err);
          this.genResultText = `Drafting execution failed. Fallback template output:\n\n` + PolicyTemplateService.customizeTemplate(this.genDomain, this.genTemplate, this.genIndustry, this.genProfile);
        } finally {
          this.isGenerating = false;
          this.render(container);
        }
      });

      // Save generated draft to Vault
      container.querySelector('#btn-save-draft-to-vault')?.addEventListener('click', async () => {
        const docId = `doc-${Date.now()}`;
        const newDoc = {
          id: docId,
          title: this.genTitle,
          document_type: this.genTitle,
          framework_tags: [this.genIndustry, 'Draft'],
          file_name: `${this.genTitle.toLowerCase().replace(/\s+/g, '_')}_draft.txt`,
          file_url: '',
          mime_type: 'text/plain',
          status: 'Ready',
          extracted_text: this.genResultText,
          summary: `AI Generated ${this.genTitle} draft customized for ${this.genIndustry}.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Save policy doc
        await StorageService.savePolicyDocument(newDoc);
        
        // Save vault entry
        const vaultEntry = {
          id: docId,
          documentName: newDoc.file_name,
          documentType: newDoc.document_type,
          documentSummary: newDoc.summary,
          uploadDate: newDoc.created_at,
          extractedCounts: { risks: 0, controls: 0, policies: 1, actions: 0, gaps: 0 },
          status: 'fully_processed',
          changesAccepted: 0,
          changesDismissed: 0,
          rawExtraction: null
        };
        await StorageService.saveVaultEntry(vaultEntry);

        // Seed initial v1 version history entry
        this.savePolicyVersion(docId, {
          summary: 'Initial draft version generated via Policy Intelligence Studio.',
          frameworks: [this.genIndustry],
          content: this.genResultText
        });

        // Sync local components state
        this.state.vaultDocs = await StorageService.getDocumentVault();
        alert("Draft policy saved successfully to vault and initialized in version ledger.");
        
        // Redirect to upgrade tab to analyze it
        this.selectedDocId = docId;
        this.activeSubTab = 'upgrade';
        this.render(container);
      });
    }

    // ─── TAB 2 EVENTS ──────────────────────────────────────────────────────
    if (this.activeSubTab === 'upgrade') {
      const docSelect = container.querySelector('#audit-doc-select');
      const fwSelect = container.querySelector('#audit-framework-select');

      docSelect?.addEventListener('change', () => {
        this.selectedDocId = docSelect.value;
        this.analysisResults = null;
        this.itemDecisions = {};
        this.editedClauses = {};
        this.render(container);
      });

      fwSelect?.addEventListener('change', () => {
        this.targetFramework = fwSelect.value;
        this.analysisResults = null;
        this.itemDecisions = {};
        this.editedClauses = {};
        this.render(container);
      });

      // Run Audit Analysis
      container.querySelector('#btn-run-policy-audit')?.addEventListener('click', async () => {
        const vaultDocs = this.state.vaultDocs || [];
        const activeDoc = vaultDocs.find(d => d.id === this.selectedDocId);
        if (!activeDoc) return;

        // Fetch the full text
        const policies = await StorageService.getPolicyDocuments();
        const policyDoc = policies.find(p => p.id === this.selectedDocId);
        const text = policyDoc?.extracted_text || activeDoc.documentSummary || '';

        this.isAnalyzing = true;
        this.render(container);

        try {
          const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
          const fwPacks = PolicyTemplateService.getRequirementPacks();
          const targetFwName = fwPacks[this.targetFramework]?.name || this.targetFramework;

          if (apiKey || this.state.serverGeminiConfigured) {
            // Live Gemini Call
            const systemPrompt = `You are an expert GRC policy auditor.
Analyze the following policy text:
\"\"\"
${text}
\"\"\"

Audit against target framework: '${targetFwName}'.
You must assess each requirement of the framework. Compare the text and identify:
1. Strongly Addressed Requirements (fully present in policy)
2. Partially Addressed Requirements (present but weak language or missing details)
3. Missing Requirements (totally absent)

Propose specific clauses from your internal knowledge pack for each gap.
Format your response as a valid JSON object with the following schema:
{
  "summary": "Brief executive summary of findings.",
  "strong": ["Requirement Name 1", "Requirement Name 2"],
  "weak": ["Requirement Name 3"],
  "missing": ["Requirement Name 4"],
  "gaps": [
    {
      "id": "unique-gap-id-1",
      "reqName": "Requirement Name 4",
      "status": "Missing",
      "name": "Suggested Clause Title",
      "text": "Proposed clause text...",
      "rationale": "Why this clause is needed to meet the requirement.",
      "confidence": "High"
    }
  ],
  "amendments": [
    { "action": "Add", "desc": "Grievance redressal mechanism clause" }
  ],
  "updatedDraft": "The complete rewritten draft containing all proposed additions."
}`;
            const liveResult = await AIService.queryGemini(systemPrompt, apiKey);
            let parsed;
            try {
              // Clean json wrapper markdown code fences if any
              const cleanJson = liveResult.replace(/```json/g, '').replace(/```/g, '').trim();
              parsed = JSON.parse(cleanJson);
            } catch (e) {
              console.warn("JSON parsing failed, falling back to simulated engine", e);
              throw e;
            }

            this.analysisResults = parsed;
          } else {
            // Simulation Fallback Mode
            await new Promise(r => setTimeout(r, 1500));
            const sim = PolicyTemplateService.getSimulationAnalysis(text, this.targetFramework);
            
            // Map requirements to clause library items
            const gaps = [];
            const amendments = [];
            let updatedDraft = text;

            const library = PolicyTemplateService.getClauseLibrary();

            // Handle missing / weak items
            const gapReqs = [...sim.missing, ...sim.weak];
            gapReqs.forEach((req, idx) => {
              // Try to find matching clause
              const match = library.find(c => c.frameworks.includes(this.targetFramework.toUpperCase()) || c.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]));
              
              const gapItem = {
                id: `gap-${idx}-${Date.now()}`,
                reqName: req.name,
                status: sim.missing.includes(req) ? 'Missing' : 'Partially Addressed',
                name: match ? match.name : `${req.name} Clause`,
                text: match ? match.text : `[Simulated Clause] Mandates control requirements for ${req.name} under ${this.targetFramework.toUpperCase()} regulations.`,
                rationale: match ? match.rationale : `Directly fulfills the compliance requirement: ${req.desc}`,
                confidence: match ? match.confidence : 'Medium'
              };

              gaps.push(gapItem);
              amendments.push({
                action: sim.missing.includes(req) ? 'Add' : 'Strengthen',
                desc: `${req.name} parameter implementation.`
              });

              updatedDraft += `\n\n[Amendment Added - ${gapItem.name}]:\n${gapItem.text}`;
            });

            this.analysisResults = {
              summary: `Policy audited against ${targetFwName}. Identified ${sim.missing.length} missing and ${sim.weak.length} partially addressed requirements.`,
              strong: sim.strong,
              weak: sim.weak,
              missing: sim.missing,
              gaps: gaps,
              amendments: amendments,
              updatedDraft: updatedDraft
            };
          }
        } catch (err) {
          console.error("Gap analysis failed:", err);
          alert("Error executing gap analysis. Ensure your API key is correct or try again.");
        } finally {
          this.isAnalyzing = false;
          this.render(container);
        }
      });

      // Expand/Collapse Clause
      container.querySelectorAll('.toggle-clause-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const clauseId = btn.dataset.clauseId;
          this.expandedClauseId = this.expandedClauseId === clauseId ? null : clauseId;
          this.render(container);
        });
      });

      // Bind text changes in Clause textareas
      container.querySelectorAll('.clause-textarea').forEach(tx => {
        tx.addEventListener('input', () => {
          const cid = tx.dataset.clauseId;
          this.editedClauses[cid] = tx.value;
        });
      });

      // Accept / Dismiss actions
      container.querySelectorAll('.clause-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.dataset.clauseId;
          const action = btn.dataset.action; // 'accept' or 'dismiss'
          
          const current = this.itemDecisions[cid];
          if (action === 'accept') {
            this.itemDecisions[cid] = current === 'accepted' ? 'pending' : 'accepted';
          } else {
            this.itemDecisions[cid] = current === 'dismissed' ? 'pending' : 'dismissed';
          }

          this.render(container);
        });
      });

      // Create Risk/Control/Action/ObjectiveLink in Change Queue
      container.querySelectorAll('.push-cq-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const type = btn.dataset.type;
          const cid = btn.dataset.clauseId;
          const gap = this.analysisResults.gaps.find(g => g.id === cid);
          if (!gap) return;

          const clauseText = this.editedClauses[cid] !== undefined ? this.editedClauses[cid] : gap.text;
          const details = {
            sourceDocument: this.state.vaultDocs.find(d => d.id === this.selectedDocId)?.documentName || 'Vault Document',
            confidence: gap.confidence.toLowerCase(),
            deltaStatus: 'New'
          };

          if (type === 'Control') {
            // Propose a control
            await this.pushToChangeQueue('Control', `Map mitigating control: ${gap.name}`, clauseText, {
              ...details,
              effectiveness: 'Highly Effective',
              riskId: 'risk-001' // Attach to default risk for staging demo
            });
          } else if (type === 'Risk') {
            // Propose a risk
            await this.pushToChangeQueue('Risk', `Compliance Gap: ${gap.reqName} exposure`, `Failure to address the requirement: ${gap.rationale}. Recommended clause: ${clauseText}`, {
              ...details,
              category: 'Compliance',
              likelihood: 3,
              impact: 4
            });
          } else if (type === 'Action') {
            // Propose an action
            await this.pushToChangeQueue('Action', `Draft implementation: ${gap.name}`, `Action task to implement the clause: ${clauseText}`, {
              ...details,
              owner: 'CISO',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          } else if (type === 'ObjectiveLink') {
            // Link to strategic objective
            await this.pushToChangeQueue('ObjectiveLink', `Link Policy to Strategic Objectives`, `Verify compliance alignment between policy and IPO/Cyber objectives. Mapped: ${gap.reqName}`, {
              ...details,
              objectiveId: 'obj-cyber' // default obj
            });
          }
        });
      });

      // Approve Amendments - Stages new versions
      container.querySelector('#btn-approve-and-stage')?.addEventListener('click', () => {
        this.isPublishing = true;
        this.activeSubTab = 'versions';
        this.reviewSummary = `Approved amendments checklist for ${PolicyTemplateService.getRequirementPacks()[this.targetFramework]?.name || 'Target Framework'}. Added accepted clauses.`;
        this.render(container);
      });
    }

    // ─── TAB 3 EVENTS ──────────────────────────────────────────────────────
    if (this.activeSubTab === 'versions') {
      const verDocSelect = container.querySelector('#ver-doc-select');
      const pubSummary = container.querySelector('#pub-summary-input');

      verDocSelect?.addEventListener('change', () => {
        this.selectedDocId = verDocSelect.value;
        this.isPublishing = false;
        this.render(container);
      });

      pubSummary?.addEventListener('input', () => {
        this.reviewSummary = pubSummary.value;
      });

      // Cancel Publishing
      container.querySelector('#btn-cancel-publication')?.addEventListener('click', () => {
        this.isPublishing = false;
        this.render(container);
      });

      // Commit & Publish New Version
      container.querySelector('#btn-submit-publication')?.addEventListener('click', async () => {
        const docId = this.selectedDocId;
        const vaultDocs = this.state.vaultDocs || [];
        const activeDoc = vaultDocs.find(d => d.id === docId);
        if (!activeDoc) return;

        // Apply edits & accepted clauses to build the new policy content
        const policies = await StorageService.getPolicyDocuments();
        const policyDoc = policies.find(p => p.id === docId);
        
        let originalText = policyDoc?.extracted_text || activeDoc.documentSummary || '';
        let newText = originalText;

        // Append only accepted clauses
        const acceptedGaps = [];
        if (this.analysisResults?.gaps) {
          this.analysisResults.gaps.forEach(g => {
            const decision = this.itemDecisions[g.id];
            if (decision === 'accepted') {
              const text = this.editedClauses[g.id] !== undefined ? this.editedClauses[g.id] : g.text;
              newText += `\n\n[Amendment Approved - ${g.name}]:\n${text}`;
              acceptedGaps.push(g.reqName);
            }
          });
        }

        // Save new policy document content
        const updatedDoc = {
          ...policyDoc,
          id: docId,
          title: activeDoc.documentName.replace(/\.[^/.]+$/, ""),
          extracted_text: newText,
          updated_at: new Date().toISOString()
        };
        await StorageService.savePolicyDocument(updatedDoc);

        // Save new version history record
        const nextVer = this.savePolicyVersion(docId, {
          summary: this.reviewSummary,
          frameworks: [this.targetFramework ? this.targetFramework.toUpperCase() : 'General Update'],
          content: newText
        });

        // Trigger Change Queue Integration to log Policy Update
        await this.pushToChangeQueue('PolicyUpdate', `Policy Version Published: ${activeDoc.documentName} (${nextVer.version})`, `Summary of changes committed: ${this.reviewSummary}`, {
          sourceDocument: activeDoc.documentName,
          confidence: 'high',
          deltaStatus: 'Update',
          version: nextVer.version
        });

        // Sync components state
        this.state.vaultDocs = await StorageService.getDocumentVault();
        this.isPublishing = false;
        this.analysisResults = null;
        this.itemDecisions = {};
        this.editedClauses = {};
        
        alert(`Successfully published version ${nextVer.version}!`);
        this.render(container);
      });

      // View full version text modal
      container.querySelectorAll('.view-ver-text-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.verIdx);
          const versions = this.getPolicyVersions(this.selectedDocId);
          const ver = versions[idx];
          if (!ver) return;

          // Open a modal showing version content
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.innerHTML = `
            <div class="modal-container" style="max-width: 680px;">
              <button class="modal-close-btn" id="btn-close-ver-modal">&times;</button>
              <div class="modal-content">
                <span class="profile-role-badge">${ver.version} | ${ver.owner}</span>
                <h2 class="modal-heading" style="margin-top:6px;">Version Text Preview</h2>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">
                  Approved on ${new Date(ver.date).toLocaleString('en-GB')}
                </div>
                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;padding:16px;font-family:var(--font-body);font-size:11px;line-height:1.6;white-space:pre-wrap;max-height:380px;overflow-y:auto;color:var(--text-primary);">
                  ${ver.content}
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);
          
          backdrop.querySelector('#btn-close-ver-modal').addEventListener('click', () => backdrop.remove());
          backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
        });
      });
    }
  }
}
