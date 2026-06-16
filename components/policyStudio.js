// Navis Policy Intelligence Studio Component
// Implements Wave 2 - Governance Workbench

import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';
import { PolicyTemplateService } from '../services/policyTemplateService.js';
import { RedlineService } from '../services/redlineService.js';
import { VersionHistoryService } from '../services/versionHistoryService.js';
import { ClauseIntelligenceService } from '../services/clauseIntelligenceService.js';

export class PolicyStudioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;

    this.activeSubTab = 'generator'; // 'generator', 'intelligence', 'redline', 'upgrade', 'versions'
    
    // Generator Selections
    this.genDomain = 'privacy';
    this.genTemplate = 'pims';
    this.genPrompt = '';
    
    // Load cached framework selection or default
    const storedFws = localStorage.getItem('navis_v3_selected_frameworks');
    this.selectedFrameworks = storedFws ? JSON.parse(storedFws) : ['DPDPA', 'GDPR', 'ISO 27701'];
    
    // Load cached profile or default to Trackier SaaS configuration
    const storedProfile = localStorage.getItem('navis_v3_company_profile');
    this.genProfile = storedProfile ? JSON.parse(storedProfile) : {
      companyName: 'Trackier',
      industry: 'SaaS',
      country: 'India',
      customerGeography: 'India + EU',
      employeeCount: '150',
      b2bB2c: 'B2B',
      controllerProcessor: 'Processor + Fiduciary',
      cloudProvider: 'AWS',
      specialCategories: 'None',
      dpoOfficer: 'Sumit Nayar',
      grievanceOfficer: 'Sumit Nayar',
      processingPurpose: 'Enterprise SaaS tracking analytics and event attribution metadata operations'
    };
    
    // Clause lists & filters
    this.clauseGroupFilter = 'all';
    this.clauseFwFilter = 'all';

    this.isGenerating = false;
    this.genResultText = '';
    this.genTitle = 'PIMS Policy';

    // Upgrade Wizard / Gap Analysis State
    this.selectedDocId = '';
    this.targetFramework = 'dpdp';
    this.isAnalyzing = false;
    this.analysisResults = null;
    
    // Clause Intelligence State
    this.isScanning = false;
    this.observations = {}; // docId -> observations list
    this.itemDecisions = {}; // clauseId -> decision
    this.editedClauses = {}; // clauseId -> edited text
    this.expandedClauseId = null;

    // Staging / Redline Review State
    this.redlineMode = 'inline'; // 'inline' or 'sbs'
    this.isRedlineLoading = false;
    this.baselineText = "";
    this.isPublishing = false;
    this.reviewSummary = '';
  }

  // --- LOCAL DRAFTS AND PROPOSED CHANGES STORAGE HELPERS ---
  getActiveDraft(docId) {
    const data = localStorage.getItem('navis_v3_active_drafts');
    const drafts = data ? JSON.parse(data) : {};
    return drafts[docId] || null;
  }

  saveActiveDraft(docId, text) {
    const data = localStorage.getItem('navis_v3_active_drafts');
    const drafts = data ? JSON.parse(data) : {};
    drafts[docId] = text;
    localStorage.setItem('navis_v3_active_drafts', JSON.stringify(drafts));
  }

  clearActiveDraft(docId) {
    const data = localStorage.getItem('navis_v3_active_drafts');
    const drafts = data ? JSON.parse(data) : {};
    delete drafts[docId];
    localStorage.setItem('navis_v3_active_drafts', JSON.stringify(drafts));
  }

  getProposedChanges(docId) {
    const data = localStorage.getItem('navis_v3_proposed_changes');
    const queue = data ? JSON.parse(data) : {};
    return queue[docId] || [];
  }

  saveProposedChanges(docId, list) {
    const data = localStorage.getItem('navis_v3_proposed_changes');
    const queue = data ? JSON.parse(data) : {};
    queue[docId] = list;
    localStorage.setItem('navis_v3_proposed_changes', JSON.stringify(queue));
  }

  addProposedChange(docId, changeObj) {
    const list = this.getProposedChanges(docId);
    if (!list.some(c => c.id === changeObj.id)) {
      list.push(changeObj);
      this.saveProposedChanges(docId, list);
    }
  }

  clearProposedChanges(docId) {
    const data = localStorage.getItem('navis_v3_proposed_changes');
    const queue = data ? JSON.parse(data) : {};
    delete queue[docId];
    localStorage.setItem('navis_v3_proposed_changes', JSON.stringify(queue));
  }

  // Fetch the baseline text of a vault document
  async getBaselineText(docId) {
    try {
      const policies = await StorageService.getPolicyDocuments();
      const policyDoc = policies.find(p => p.id === docId);
      if (policyDoc) {
        return policyDoc.extracted_text || "";
      }
      const vaultDocs = this.state.vaultDocs || [];
      const activeDoc = vaultDocs.find(d => d.id === docId);
      return activeDoc ? (activeDoc.documentSummary || "") : "";
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  // Version History list
  getPolicyVersions(docId) {
    return VersionHistoryService.getVersionHistory(docId);
  }

  // Push recommendation to Change Queue
  async pushToChangeQueue(type, title, description, metadata = {}) {
    const queue = await StorageService.getChangeQueue();
    const newItem = {
      id: `cq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: type,
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
    
    alert(`Change request created in global queue: [${type}] ${title}`);
  }

  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Governance Control Desk</span>
          <h1>Policy Studio</h1>
          <p class="page-subtitle">Generate, upgrade, and govern policy documents.</p>
        </div>
      </div>

      <!-- SUBTAB STRIP -->
      <div class="subtab-strip no-print" style="display:flex;gap:4px;border-bottom:1px solid var(--border-color);margin-bottom:20px;padding-bottom:1px;">
        <button class="subtab-btn ${this.activeSubTab === 'generator' ? 'active' : ''}" data-subtab="generator" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Library & Generator
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'intelligence' ? 'active' : ''}" data-subtab="intelligence" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'intelligence' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'intelligence' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Clause Intelligence
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'redline' ? 'active' : ''}" data-subtab="redline" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'redline' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'redline' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Redline Review
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'upgrade' ? 'active' : ''}" data-subtab="upgrade" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Policy Upgrade
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'versions' ? 'active' : ''}" data-subtab="versions" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Version History
        </button>
      </div>

      <div class="policy-studio-body" id="tab-body-container">
        <!-- Rendered Dynamically -->
      </div>
    `;

    const bodyContainer = container.querySelector('#tab-body-container');
    this.renderSubTabContent(bodyContainer);
  }

  // Tab switch routing
  async selectTab(tabKey, container) {
    this.activeSubTab = tabKey;
    
    const bodyContainer = container.querySelector('#tab-body-container');
    if (!bodyContainer) return;

    if (tabKey === 'redline') {
      this.isRedlineLoading = true;
      this.renderSubTabContent(bodyContainer);
      
      try {
        this.baselineText = await this.getBaselineText(this.selectedDocId);
      } catch (err) {
        console.error("Failed to load baseline:", err);
      } finally {
        this.isRedlineLoading = false;
        this.renderSubTabContent(bodyContainer);
        this.bindEvents(container);
      }
    } else {
      this.renderSubTabContent(bodyContainer);
      this.bindEvents(container);
    }
  }

  renderSubTabContent(bodyContainer) {
    if (!bodyContainer) return;

    // Calculate dynamic workflow state for Lifecycle Banner
    let lifecycleStatus = 'Draft';
    if (this.selectedDocId) {
      const versions = this.getPolicyVersions(this.selectedDocId);
      const staged = this.getProposedChanges(this.selectedDocId);
      const draftText = this.getActiveDraft(this.selectedDocId);
      const baselineText = this.baselineText || "";

      if (versions.length > 0) {
        if (staged.length > 0) {
          lifecycleStatus = 'Review';
        } else if (draftText && draftText !== baselineText) {
          lifecycleStatus = 'Approved';
        } else {
          lifecycleStatus = 'Published';
        }
      } else {
        if (staged.length > 0) {
          lifecycleStatus = 'Review';
        } else if (draftText && draftText !== baselineText) {
          lifecycleStatus = 'Approved';
        } else {
          lifecycleStatus = 'Draft';
        }
      }
    }

    const bannerHtml = this.selectedDocId ? this.renderLifecycleBanner(lifecycleStatus) : "";

    let bodyHtml = "";
    if (this.activeSubTab === 'generator') {
      bodyHtml = this.renderGeneratorTab();
    } else if (this.activeSubTab === 'intelligence') {
      bodyHtml = this.renderIntelligenceTab();
    } else if (this.activeSubTab === 'redline') {
      if (this.isRedlineLoading) {
        bodyHtml = `
          <div class="glass-panel" style="min-height:400px;text-align:center;padding:120px 0;color:var(--text-muted);">
            <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
            </svg>
            Fetching baseline policy data...
          </div>
        `;
      } else {
        bodyHtml = this.renderRedlineTab();
      }
    } else if (this.activeSubTab === 'upgrade') {
      bodyHtml = this.renderUpgradeTab();
    } else {
      bodyHtml = this.renderVersionsTab();
    }

    bodyContainer.innerHTML = bannerHtml + bodyHtml;
  }

  // Policy Lifecycle Workflow Banner
  renderLifecycleBanner(status) {
    const stages = [
      { key: 'Draft', label: 'Draft' },
      { key: 'Review', label: 'Review' },
      { key: 'Approved', label: 'Approved' },
      { key: 'Published', label: 'Published' },
      { key: 'Retired', label: 'Retired' }
    ];

    return `
      <div class="lifecycle-banner no-print" style="display:flex;align-items:center;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:8px 16px;margin-bottom:20px;justify-content:space-between;font-size:11px;">
        <div style="font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">Document Lifecycle:</div>
        <div style="display:flex;align-items:center;gap:12px;">
          ${stages.map((st, idx) => {
            const isActive = st.key === status;
            const bg = isActive ? 'var(--color-indigo)' : 'transparent';
            const fg = isActive ? '#FFFFFF' : 'var(--text-secondary)';
            const border = isActive ? 'none' : '1px solid var(--border-color)';
            const connector = idx < stages.length - 1 ? `<span style="color:var(--text-muted);font-weight:bold;">&rarr;</span>` : '';
            
            return `
              <div style="display:flex;align-items:center;gap:12px;">
                <span class="status-badge" style="background:${bg};color:${fg};border:${border};padding:4px 10px;font-size:10px;font-weight:700;border-radius:999px;">
                  ${st.label}
                </span>
                ${connector}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ─── TAB 1: GENERATOR & LIBRARY ──────────────────────────────────────────
  renderGeneratorTab() {
    const domains = PolicyTemplateService.getDomains();
    const activeDomain = domains[this.genDomain];
    const subPolicies = activeDomain ? activeDomain.templates : {};
    const clauses = PolicyTemplateService.getClauseLibrary();

    const groupsList = ["Purpose", "Scope", "Definitions", "Roles and Responsibilities", "Consent", "DSAR", "Retention", "Incident Response", "Third Party Management", "Cross-Border Transfers", "Audit Rights", "Training", "Review Frequency"];
    const frameworksList = ["ISO 27001", "ISO 27701", "SOC 2", "DPDPA", "GDPR", "NIST CSF"];

    // Filter logic for Clause Library
    let filteredClauses = clauses;
    if (this.clauseGroupFilter !== 'all') {
      filteredClauses = filteredClauses.filter(c => c.group === this.clauseGroupFilter);
    }
    if (this.clauseFwFilter !== 'all') {
      filteredClauses = filteredClauses.filter(c => {
        const alias = this.clauseFwFilter === 'DPDPA' ? 'DPDP' : this.clauseFwFilter;
        return c.frameworks.includes(this.clauseFwFilter) || c.frameworks.includes(alias);
      });
    }

    return `
      <div class="register-layout">
        
        <!-- LEFT: SELECTION & COMPANY PROFILE -->
        <div class="details-panel" style="flex: 1 1 340px;">
          
          <!-- SELECTION BOX -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Selection</h3>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Domain</label>
                <select class="form-control" id="gen-domain-select">
                  ${Object.entries(domains).map(([k, d]) => `
                    <option value="${k}" ${this.genDomain === k ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Template</label>
                <select class="form-control" id="gen-template-select">
                  ${Object.entries(subPolicies).map(([k, t]) => `
                    <option value="${k}" ${this.genTemplate === k ? 'selected' : ''}>${t.title}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top:12px;">
              <label style="margin-bottom: 6px; display:block;">Target Frameworks</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:11px;">
                ${frameworksList.map(fw => {
                  const checked = this.selectedFrameworks.includes(fw) ? 'checked' : '';
                  return `
                    <label style="display:flex;align-items:center;gap:6px;font-weight:normal;cursor:pointer;user-select:none;">
                      <input type="checkbox" class="gen-fw-checkbox" value="${fw}" ${checked} />
                      ${fw}
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- COMPANY PROFILE BOX -->
          <div class="glass-panel" style="margin-top:16px;">
            <h3 class="dashboard-card-title">Company Profile</h3>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="form-control profile-field" data-key="companyName" value="${this.genProfile.companyName || ''}" />
              </div>
              <div class="form-group">
                <label>Industry</label>
                <select class="form-control profile-field" data-key="industry">
                  <option value="SaaS" ${this.genProfile.industry === 'SaaS' ? 'selected' : ''}>SaaS</option>
                  <option value="FinTech" ${this.genProfile.industry === 'FinTech' ? 'selected' : ''}>FinTech</option>
                  <option value="Healthcare" ${this.genProfile.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                  <option value="EdTech" ${this.genProfile.industry === 'EdTech' ? 'selected' : ''}>EdTech</option>
                  <option value="Manufacturing" ${this.genProfile.industry === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Origin Country</label>
                <input type="text" class="form-control profile-field" data-key="country" value="${this.genProfile.country || ''}" />
              </div>
              <div class="form-group">
                <label>Customer Geographies</label>
                <input type="text" class="form-control profile-field" data-key="customerGeography" value="${this.genProfile.customerGeography || ''}" />
              </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Cloud Provider</label>
                <input type="text" class="form-control profile-field" data-key="cloudProvider" value="${this.genProfile.cloudProvider || ''}" />
              </div>
              <div class="form-group">
                <label>Employees</label>
                <input type="number" class="form-control profile-field" data-key="employeeCount" value="${this.genProfile.employeeCount || ''}" />
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Model (B2B/B2C)</label>
                <select class="form-control profile-field" data-key="b2bB2c">
                  <option value="B2B" ${this.genProfile.b2bB2c === 'B2B' ? 'selected' : ''}>B2B</option>
                  <option value="B2C" ${this.genProfile.b2bB2c === 'B2C' ? 'selected' : ''}>B2C</option>
                  <option value="Both" ${this.genProfile.b2bB2c === 'Both' ? 'selected' : ''}>Both</option>
                </select>
              </div>
              <div class="form-group">
                <label>Posture</label>
                <select class="form-control profile-field" data-key="controllerProcessor">
                  <option value="Processor" ${this.genProfile.controllerProcessor === 'Processor' ? 'selected' : ''}>Processor</option>
                  <option value="Fiduciary" ${this.genProfile.controllerProcessor === 'Fiduciary' ? 'selected' : ''}>Fiduciary</option>
                  <option value="Processor + Fiduciary" ${this.genProfile.controllerProcessor === 'Processor + Fiduciary' ? 'selected' : ''}>Processor + Fiduciary</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>DPO / Privacy Officer</label>
                <input type="text" class="form-control profile-field" data-key="dpoOfficer" value="${this.genProfile.dpoOfficer || ''}" />
              </div>
              <div class="form-group">
                <label>Grievance Officer</label>
                <input type="text" class="form-control profile-field" data-key="grievanceOfficer" value="${this.genProfile.grievanceOfficer || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label>Processing Purpose Summary</label>
              <textarea class="form-control profile-field" data-key="processingPurpose" rows="2" style="font-size:11px;">${this.genProfile.processingPurpose || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Special Categories of Data</label>
              <input type="text" class="form-control profile-field" data-key="specialCategories" value="${this.genProfile.specialCategories || ''}" />
            </div>
          </div>

          <!-- CLAUSE LIBRARY BOX -->
          <div class="glass-panel" style="margin-top:16px;">
            <h3 class="dashboard-card-title">Clause Library</h3>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:12px;">
              Consultant-grade building blocks. Use filters to browse clauses.
            </p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
              <div>
                <label style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Group</label>
                <select class="form-control" id="clause-group-filter" style="font-size:10px;height:26px;padding:2px 6px;">
                  <option value="all" ${this.clauseGroupFilter === 'all' ? 'selected' : ''}>All Groups</option>
                  ${groupsList.map(g => `<option value="${g}" ${this.clauseGroupFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Framework</label>
                <select class="form-control" id="clause-fw-filter" style="font-size:10px;height:26px;padding:2px 6px;">
                  <option value="all" ${this.clauseFwFilter === 'all' ? 'selected' : ''}>All Frameworks</option>
                  ${frameworksList.map(f => `<option value="${f}" ${this.clauseFwFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px;" id="clause-list-container">
              ${filteredClauses.length === 0 ? `
                <div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:11px;">No matching clauses.</div>
              ` : filteredClauses.map(c => `
                <div class="clause-item" style="padding:8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
                  <div style="flex-grow:1;margin-right:8px;overflow:hidden;">
                    <strong style="color:var(--text-primary);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</strong>
                    <span style="font-size:9px;color:var(--text-muted);">${c.group} | ${c.maturity || 'Consultant-Grade'}</span>
                  </div>
                  <button class="btn btn-secondary btn-small btn-view-clause-details" style="font-size:9px;padding:2px 6px;flex-shrink:0;height:22px;" data-clause-id="${c.id}">
                    View details
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: PROMPT INPUT & GENERATED DRAFT -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:580px;display:flex;flex-direction:column;justify-content:space-between;">
            
            <div>
              <h3 class="dashboard-card-title">Drafting</h3>
              
              <div class="form-group">
                <label>Custom Prompt Directives</label>
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

              <div id="gen-result-container" style="flex-grow:1;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;font-family:var(--font-body);font-size:12px;line-height:1.6;color:var(--text-primary);overflow-y:auto;max-height:460px;white-space:pre-wrap;">
                ${this.isGenerating ? `
                  <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                    <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
                      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
                    </svg>
                    Executing real-time analysis & drafting...
                  </div>
                ` : this.genResultText ? this.genResultText : `
                  <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 12px;opacity:0.3;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Configure selections and company profile on the left, then click Generate.
                  </div>
                `}
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 2: CLAUSE INTELLIGENCE ──────────────────────────────────────────
  renderIntelligenceTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const activeDocId = this.selectedDocId;
    const doc = vaultDocs.find(d => d.id === activeDocId);
    const obs = activeDocId ? (this.observations[activeDocId] || []) : [];
    const hasScan = this.observations[activeDocId] !== undefined;

    return `
      <div class="register-layout">
        
        <!-- LEFT: AUDIT/SCAN DETAILS -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Configuration</h3>
            
            <div class="form-group">
              <label>Select Policy</label>
              <select class="form-control" id="intel-doc-select">
                <option value="">-- Choose Policy --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${activeDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>

            ${doc ? `
              <button class="btn btn-primary" id="btn-scan-intel" style="width:100%;justify-content:center;margin-top:12px;" ${this.isScanning ? 'disabled' : ''}>
                ${this.isScanning ? 'Scanning Compliance Gaps...' : 'Run Clause Intelligence'}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- RIGHT: OBSERVATIONS -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:500px;">
            <h3 class="dashboard-card-title">Compliance Observations</h3>

            ${this.isScanning ? `
              <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
                </svg>
                Scanning policy draft against regulatory rules...
              </div>
            ` : !activeDocId ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                Select a policy on the left to analyze compliance.
              </div>
            ` : !hasScan ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                Click "Run Clause Intelligence" to scan this policy document.
              </div>
            ` : obs.length === 0 ? `
              <div style="text-align:center;padding:100px 0;color:var(--color-safe-text);font-weight:600;">
                ✓ No compliance issues detected. This policy meets selected framework baselines.
              </div>
            ` : `
              <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                ${obs.map(o => {
                  let borderClr = 'var(--border-color)';
                  let bgClr = 'var(--bg-secondary)';
                  let badgeClass = 'within';
                  if (o.severity === 'Critical') {
                    borderClr = 'var(--color-critical)';
                    bgClr = 'var(--color-critical-bg)';
                    badgeClass = 'above';
                  } else if (o.severity === 'Important') {
                    borderClr = 'var(--color-warning)';
                    bgClr = 'var(--color-warning-bg)';
                    badgeClass = 'near';
                  }
                  
                  return `
                    <div style="border:1.5px solid ${borderClr};border-radius:8px;padding:16px;background:${bgClr};" class="observation-card" data-obs-id="${o.id}">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                          <span class="status-badge ${badgeClass}" style="font-size:9px;text-transform:uppercase;">
                            ${o.severity}
                          </span>
                          <span class="profile-role-badge" style="font-size:9px;margin-left:6px;">${o.issueType}</span>
                        </div>
                        <span style="font-size:9px;color:var(--text-muted);">Source: <strong>${o.source}</strong></span>
                      </div>

                      <h4 style="font-size:13px;font-weight:700;margin-top:8px;color:var(--text-primary);">${o.observation}</h4>
                      <p style="font-size:11px;color:var(--text-secondary);line-height:1.45;margin-top:4px;">
                        <strong>Why it matters:</strong> ${o.rationale}
                      </p>
                      
                      <div style="font-size:10px;color:var(--text-muted);margin-top:8px;">
                        <strong>Framework Mapping:</strong> ${o.frameworks.join(', ')}
                      </div>

                      <div style="margin-top:12px;background:var(--panel-bg);border:1px solid var(--border-color);border-radius:6px;padding:12px;font-family:var(--font-body);font-size:11px;line-height:1.5;color:var(--text-primary);white-space:pre-wrap;">
                        <strong>Suggested Clause:</strong>\n${o.suggestedClause}
                      </div>

                      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
                        <button class="btn btn-secondary btn-small btn-reject-obs" data-obs-id="${o.id}">Reject</button>
                        <button class="btn btn-secondary btn-small btn-edit-obs" data-obs-id="${o.id}">Edit</button>
                        <button class="btn btn-primary btn-small btn-accept-obs" data-obs-id="${o.id}">Accept</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 3: REDLINE REVIEW ───────────────────────────────────────────────
  renderRedlineTab() {
    const activeDocId = this.selectedDocId;
    if (!activeDocId) {
      return `
        <div class="glass-panel" style="min-height:400px;text-align:center;padding:120px 0;color:var(--text-muted);">
          Select a policy document in Clause Intelligence or Generator to stage drafts and view redlines.
        </div>
      `;
    }

    const baseline = this.baselineText || "";
    const draft = this.getActiveDraft(activeDocId) || baseline;
    const stagedChanges = this.getProposedChanges(activeDocId);

    // Compute diff views
    const inlineHtml = RedlineService.renderInlineRedline(baseline, draft);
    const { leftHtml, rightHtml } = RedlineService.renderSideBySide(baseline, draft);

    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        
        <!-- TOP CONTROLS CARD -->
        <div class="glass-panel" style="padding:14px !important;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <h3 style="font-size:14px;font-weight:700;margin:0;">Redline Staging & Compare</h3>
              <p style="font-size:11px;color:var(--text-secondary);margin:2px 0 0;">
                Staged modifications: <strong>${stagedChanges.length} clauses</strong>. Verify revisions before approval.
              </p>
            </div>
            
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="font-size:11px;color:var(--text-secondary);">View Mode:</span>
              <button class="btn btn-secondary btn-small ${this.redlineMode === 'inline' ? 'active' : ''}" id="btn-mode-inline" style="font-size:10px;height:24px;${this.redlineMode === 'inline' ? 'border-color:var(--color-indigo);color:var(--color-indigo);' : ''}">Inline</button>
              <button class="btn btn-secondary btn-small ${this.redlineMode === 'sbs' ? 'active' : ''}" id="btn-mode-sbs" style="font-size:10px;height:24px;${this.redlineMode === 'sbs' ? 'border-color:var(--color-indigo);color:var(--color-indigo);' : ''}">Side-by-Side</button>
            </div>
          </div>
        </div>

        <!-- PROPOSED CHANGES QUEUE PANEL -->
        ${stagedChanges.length > 0 ? `
          <div class="glass-panel" style="background:rgba(15,118,110,0.015);border-color:var(--color-indigo);padding:14px !important;">
            <h4 style="font-size:10px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin:0 0 10px;font-weight:700;">Proposed Changes Queue (Staged)</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:10px;">
              ${stagedChanges.map(sc => `
                <div style="padding:10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                  <div style="overflow:hidden;">
                    <strong style="display:block;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sc.name}</strong>
                    <span style="font-size:9px;color:var(--text-muted);">Source: ${sc.source}</span>
                  </div>
                  <button class="btn-remove-staged" data-change-id="${sc.id}" style="background:none;border:none;color:var(--color-critical);cursor:pointer;font-size:16px;font-weight:bold;line-height:1;padding:0;">&times;</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- DIFF DISPLAY VIEWPORT -->
        <div class="glass-panel" style="min-height:420px;display:flex;flex-direction:column;justify-content:space-between;">
          
          <div style="flex-grow:1;margin-bottom:20px;">
            ${this.redlineMode === 'inline' ? `
              <!-- Inline View -->
              <div id="inline-diff-box" style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:20px;font-family:var(--font-body);font-size:12px;line-height:1.6;color:var(--text-primary);overflow-y:auto;max-height:480px;white-space:pre-wrap;">
                ${inlineHtml || '<div style="color:var(--text-muted);text-align:center;padding:100px 0;">No edits staged. Active draft matches baseline.</div>'}
              </div>
            ` : `
              <!-- Side-by-Side View -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                  <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;margin-bottom:6px;">Baseline Policy</div>
                  <div id="sbs-left-box" style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;font-family:var(--font-body);font-size:11px;line-height:1.65;color:var(--text-primary);overflow-y:auto;max-height:450px;white-space:pre-wrap;">
                    ${baseline || '<div style="color:var(--text-muted);text-align:center;padding:100px 0;">Empty document.</div>'}
                  </div>
                </div>
                <div>
                  <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;margin-bottom:6px;">Proposed Draft</div>
                  <div id="sbs-right-box" style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;font-family:var(--font-body);font-size:11px;line-height:1.65;color:var(--text-primary);overflow-y:auto;max-height:450px;white-space:pre-wrap;">
                    ${draft || '<div style="color:var(--text-muted);text-align:center;padding:100px 0;">Empty document.</div>'}
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- ACTIONS PANEL -->
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:16px;flex-wrap:wrap;gap:12px;">
            <button class="btn btn-secondary" id="btn-reject-draft" style="border-color:var(--color-critical);color:var(--color-critical);height:32px;">
              ✕ Discard Draft
            </button>
            
            <div style="display:flex;gap:10px;">
              <button class="btn btn-secondary" id="btn-edit-draft-text" style="height:32px;">
                ✎ Edit Draft
              </button>
              <button class="btn btn-primary" id="btn-approve-draft-notes" style="height:32px;" ${baseline === draft ? 'disabled' : ''}>
                ✓ Approve & Commit Draft
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // ─── TAB 4: ORIGINAL UPGRADE WIZARD & GAPS ──────────────────────────────
  renderUpgradeTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const frameworks = PolicyTemplateService.getRequirementPacks();
    const results = this.analysisResults;

    return `
      <div class="register-layout">
        
        <!-- LEFT: AUDIT WORKFLOW TRIGGERS -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Configuration</h3>
            
            <div class="form-group">
              <label>Select Policy</label>
              <select class="form-control" id="audit-doc-select">
                <option value="">-- Choose from Vault --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${this.selectedDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Framework</label>
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
            <h3 class="dashboard-card-title">Requirements</h3>
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
            <h3 class="dashboard-card-title">Analysis</h3>

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

              <!-- CLAUSE RECOMMENDATIONS -->
              <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin-bottom:10px;">Clause Recommendations</h4>
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
                            ${g.confidence || 'High'} Conf
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

  // ─── TAB 5: VERSION HISTORY ──────────────────────────────────────────────
  renderVersionsTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const activeDocId = this.selectedDocId;
    const doc = vaultDocs.find(d => d.id === activeDocId);
    
    // Fetch version history via Service
    const versions = activeDocId ? VersionHistoryService.getVersionHistory(activeDocId) : [];

    return `
      <div class="register-layout">
        
        <!-- LEFT: POLICY SELECTOR -->
        <div class="details-panel" style="flex: 1 1 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Selection</h3>
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

        <!-- RIGHT: VERSION LEDGER -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:460px;">
            <h3 class="dashboard-card-title">Versions Ledger</h3>
            
            ${!activeDocId ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                Select a policy on the left to review its version lifecycle.
              </div>
            ` : versions.length === 0 ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                <p>No revisions recorded for this document yet.</p>
                <p style="font-size:11px;margin-top:4px;">Approve drafts in Redline Review to establish new version histories.</p>
              </div>
            ` : `
              <div style="display:flex;flex-direction:column;gap:12px;">
                ${versions.map((v, idx) => `
                  <div class="glass-panel" style="padding:14px;background:var(--bg-secondary);border:1.5px solid var(--border-color);border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                      <div>
                        <span class="status-badge within" style="font-size:10px;background:var(--color-safe-bg);color:var(--color-safe);font-weight:700;">
                          ${v.version}
                        </span>
                        <h4 style="font-size:13px;font-weight:700;display:inline-block;margin-left:8px;color:var(--text-primary);">
                          Approved Revision
                        </h4>
                      </div>
                      <span style="font-size:10px;color:var(--text-muted);">
                        ${new Date(v.date).toLocaleString('en-GB')}
                      </span>
                    </div>

                    <div style="margin-top:10px;font-size:11px;color:var(--text-secondary);line-height:1.5;">
                      <div><strong>Change Summary:</strong> ${v.summary}</div>
                      <div style="margin-top:4px;"><strong>Revision Reason:</strong> <span class="status-badge near" style="font-size:9px;padding:2px 6px;">${v.reason || 'Routine Update'}</span></div>
                      <div style="margin-top:4px;"><strong>Frameworks Mapped:</strong> ${v.frameworks.join(', ') || 'Internal Governance'}</div>
                      <div style="margin-top:4px;"><strong>Editor:</strong> ${v.editor}</div>
                    </div>

                    <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:8px;">
                      <button class="btn btn-secondary btn-small view-ver-text-btn" data-ver-idx="${idx}">Inspect Text</button>
                      <button class="btn btn-secondary btn-small compare-ver-btn" data-ver-idx="${idx}">Compare</button>
                      <button class="btn btn-secondary btn-small rollback-ver-btn" data-ver-idx="${idx}" style="border-color:var(--color-warning);color:var(--color-warning);">Rollback</button>
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
    // Subtab Strip Buttons
    container.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTab(btn.dataset.subtab, container);
      });
    });

    // ─── TAB 1: GENERATOR EVENTS ───────────────────────────────────────────
    if (this.activeSubTab === 'generator') {
      const domSelect = container.querySelector('#gen-domain-select');
      const tempSelect = container.querySelector('#gen-template-select');
      const promptInput = container.querySelector('#gen-prompt-input');

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

      promptInput?.addEventListener('input', () => {
        this.genPrompt = promptInput.value;
      });

      container.querySelectorAll('.gen-fw-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const checked = Array.from(container.querySelectorAll('.gen-fw-checkbox:checked')).map(el => el.value);
          this.selectedFrameworks = checked;
          localStorage.setItem('navis_v3_selected_frameworks', JSON.stringify(this.selectedFrameworks));
          this.render(container);
        });
      });

      container.querySelectorAll('.profile-field').forEach(field => {
        field.addEventListener('input', () => {
          this.genProfile[field.dataset.key] = field.value;
          localStorage.setItem('navis_v3_company_profile', JSON.stringify(this.genProfile));
        });
      });

      const groupFilter = container.querySelector('#clause-group-filter');
      const fwFilter = container.querySelector('#clause-fw-filter');

      groupFilter?.addEventListener('change', () => {
        this.clauseGroupFilter = groupFilter.value;
        this.render(container);
      });

      fwFilter?.addEventListener('change', () => {
        this.clauseFwFilter = fwFilter.value;
        this.render(container);
      });

      container.querySelectorAll('.btn-view-clause-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.dataset.clauseId;
          const lib = PolicyTemplateService.getClauseLibrary();
          const clause = lib.find(c => c.id === cid);
          if (!clause) return;

          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.innerHTML = `
            <div class="modal-container" style="max-width: 540px;">
              <button class="modal-close-btn" id="btn-close-clause-modal">&times;</button>
              <div class="modal-content">
                <span class="profile-role-badge" style="text-transform: uppercase;">${clause.group}</span>
                <h2 class="modal-heading" style="margin-top:6px;font-size:16px;">${clause.name}</h2>
                
                <div style="margin: 12px 0; font-size:11px; color:var(--text-secondary); line-height:1.45;">
                  <div style="margin-bottom:4px;"><strong>Draft Strength (Maturity):</strong> <span class="status-badge within" style="font-size:9px;padding:2px 6px;">${clause.maturity || 'Consultant-Grade'}</span></div>
                  <div style="margin-bottom:4px;"><strong>Frameworks Mapped:</strong> <span>${clause.frameworks.join(', ')}</span></div>
                  <div style="margin-bottom:4px;"><strong>Jurisdiction:</strong> <span>${clause.jurisdiction ? clause.jurisdiction.join(', ') : 'Global'}</span></div>
                  <div style="margin-bottom:4px;"><strong>Industry Fit:</strong> <span>${clause.industry ? clause.industry.join(', ') : 'Global'}</span></div>
                  <div style="margin-bottom:4px;"><strong>Clause Version:</strong> <span>${clause.version || 'v1.0'}</span></div>
                </div>

                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;padding:12px;font-family:var(--font-body);font-size:11px;line-height:1.5;white-space:pre-wrap;color:var(--text-primary);margin-bottom:12px;">
                  ${clause.text}
                </div>

                <div style="background:var(--color-safe-bg);color:var(--color-safe-text);border:1px solid var(--color-safe);border-radius:6px;padding:10px;font-size:11px;line-height:1.4;margin-bottom:16px;">
                  <strong>GRC Consultant Rationale:</strong> ${clause.rationale}
                </div>

                <div style="display:flex;gap:8px;justify-content:flex-end;">
                  <button class="btn btn-secondary btn-small" id="btn-modal-close">Close</button>
                  <button class="btn btn-primary btn-small" id="btn-modal-use-clause">Inject Directives</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);

          const close = () => backdrop.remove();
          backdrop.querySelector('#btn-close-clause-modal').addEventListener('click', close);
          backdrop.querySelector('#btn-modal-close').addEventListener('click', close);
          backdrop.querySelector('#btn-modal-use-clause').addEventListener('click', () => {
            const insertText = `\nInclude clause details: ${clause.text}\n`;
            this.genPrompt = (this.genPrompt + insertText).trim();
            const promptArea = container.querySelector('#gen-prompt-input');
            if (promptArea) promptArea.value = this.genPrompt;
            backdrop.remove();
          });
          backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) backdrop.remove(); });
        });
      });

      // Click Generate Policy
      container.querySelector('#btn-generate-policy')?.addEventListener('click', async () => {
        this.isGenerating = true;
        this.renderSubTabContent(container.querySelector('#tab-body-container'));

        try {
          const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
          
          if (apiKey || this.state.serverGeminiConfigured) {
            const systemPrompt = `You are a consultant-grade GRC policy intelligence assistant.
Generate a professional, board-ready draft for the policy '${this.genTitle}' under the domain of '${domains[this.genDomain]?.name}'.
The policy must explicitly align with the following selected compliance frameworks: ${this.selectedFrameworks.join(', ') || 'General Best Practices'}.

Company Profile Context:
- Company Name: ${this.genProfile.companyName}
- Industry: ${this.genProfile.industry}
- Country of Origin: ${this.genProfile.country}
- Customer Geographies: ${this.genProfile.customerGeography}
- Employee Count: ${this.genProfile.employeeCount}
- Business Model: ${this.genProfile.b2bB2c}
- Controller/Processor Posture: ${this.genProfile.controllerProcessor}
- Primary Cloud Infrastructure: ${this.genProfile.cloudProvider}
- Data Protection Officer / Privacy Officer: ${this.genProfile.dpoOfficer}
- Designated Grievance Officer: ${this.genProfile.grievanceOfficer}
- Core Personal Data Processing Purpose: ${this.genProfile.processingPurpose}
- Special Categories of Data Handled: ${this.genProfile.specialCategories}

Make sure that this company context and selected frameworks are woven deeply into the language of the policy clauses. Do not use generic placeholders.

Use the following specific drafting directives:
${this.genPrompt || 'None provided.'}

Output ONLY the complete policy draft document. Do not add conversational introductions or conversational conclusions. Use clear headings.`;
            
            const liveResult = await AIService.queryGemini(systemPrompt, apiKey);
            this.genResultText = liveResult || PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
          } else {
            // Simulated generator fallback
            await new Promise(r => setTimeout(r, 1500));
            this.genResultText = PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
          }
        } catch (err) {
          console.error("Drafting failed:", err);
          this.genResultText = `Drafting execution failed. Fallback simulated output:\n\n` + PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
        } finally {
          this.isGenerating = false;
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        }
      });

      // Save draft to vault
      container.querySelector('#btn-save-draft-to-vault')?.addEventListener('click', async () => {
        const docId = `doc-${Date.now()}`;
        const newDoc = {
          id: docId,
          title: this.genTitle,
          document_type: this.genTitle,
          framework_tags: this.selectedFrameworks.concat([this.genProfile.industry, 'Draft']),
          file_name: `${this.genTitle.toLowerCase().replace(/\s+/g, '_')}_draft.txt`,
          file_url: '',
          mime_type: 'text/plain',
          status: 'Ready',
          extracted_text: this.genResultText,
          summary: `AI Generated ${this.genTitle} draft customized for ${this.genProfile.companyName} (${this.genProfile.industry}). Mapped Frameworks: ${this.selectedFrameworks.join(', ')}.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await StorageService.savePolicyDocument(newDoc);
        
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

        // Seed initial v1 revision history
        VersionHistoryService.saveVersion(docId, {
          editor: this.state.settings?.activeUserRole || 'CRO (Chief Risk Officer)',
          frameworks: this.selectedFrameworks,
          summary: 'Initial draft version generated via Policy Intelligence Studio.',
          reason: 'Initial Draft Creation',
          documentText: this.genResultText
        });

        this.state.vaultDocs = await StorageService.getDocumentVault();
        alert("Draft policy saved successfully to vault and initialized in version ledger.");
        
        this.selectedDocId = docId;
        this.activeSubTab = 'intelligence';
        this.render(container);
      });
    }

    // ─── TAB 2: CLAUSE INTELLIGENCE EVENTS ──────────────────────────────────
    if (this.activeSubTab === 'intelligence') {
      const intelDocSelect = container.querySelector('#intel-doc-select');

      intelDocSelect?.addEventListener('change', () => {
        this.selectedDocId = intelDocSelect.value;
        this.isScanning = false;
        this.render(container);
      });

      // Click Scan Compliance
      container.querySelector('#btn-scan-intel')?.addEventListener('click', async () => {
        const docId = this.selectedDocId;
        const vaultDocs = this.state.vaultDocs || [];
        const activeDoc = vaultDocs.find(d => d.id === docId);
        if (!activeDoc) return;

        this.isScanning = true;
        this.renderSubTabContent(container.querySelector('#tab-body-container'));

        try {
          const policies = await StorageService.getPolicyDocuments();
          const policyDoc = policies.find(p => p.id === docId);
          const text = policyDoc?.extracted_text || activeDoc.documentSummary || '';
          const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';

          const scanResults = await ClauseIntelligenceService.scanPolicy(text, this.selectedFrameworks, apiKey);
          this.observations[docId] = scanResults;
        } catch (err) {
          console.error("Scan failed:", err);
          alert("Compliance scan execution failed.");
        } finally {
          this.isScanning = false;
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        }
      });

      // Accept Recommendation -> Stages in Proposed Changes Queue
      container.querySelectorAll('.btn-accept-obs').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const obsId = btn.dataset.obsId;
          const docId = this.selectedDocId;
          const obsList = this.observations[docId] || [];
          const matched = obsList.find(o => o.id === obsId);
          if (!matched) return;

          // 1. Move observation clause metadata into Proposed Changes Queue
          this.addProposedChange(docId, {
            id: matched.id,
            name: matched.observation,
            text: matched.suggestedClause,
            rationale: matched.rationale,
            frameworks: matched.frameworks,
            source: matched.source
          });

          // 2. Append text to active draft (does NOT modify baseline active policy)
          let draftText = this.getActiveDraft(docId);
          if (!draftText) {
            draftText = await this.getBaselineText(docId);
          }
          draftText += `\n\n[Proposed Addition - ${matched.observation}]:\n${matched.suggestedClause}`;
          this.saveActiveDraft(docId, draftText);

          // 3. Remove observation card from screen list
          this.observations[docId] = obsList.filter(o => o.id !== obsId);

          alert("Recommendation staged to the Proposed Changes queue. Review changes in the Redline Review tab.");
          this.render(container);
        });
      });

      // Reject Recommendation -> Dismisses card
      container.querySelectorAll('.btn-reject-obs').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const obsId = btn.dataset.obsId;
          const docId = this.selectedDocId;
          const obsList = this.observations[docId] || [];

          this.observations[docId] = obsList.filter(o => o.id !== obsId);
          this.render(container);
        });
      });

      // Edit Recommendation -> Modal
      container.querySelectorAll('.btn-edit-obs').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const obsId = btn.dataset.obsId;
          const docId = this.selectedDocId;
          const obsList = this.observations[docId] || [];
          const matched = obsList.find(o => o.id === obsId);
          if (!matched) return;

          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.innerHTML = `
            <div class="modal-container" style="max-width: 500px;">
              <button class="modal-close-btn" id="btn-close-edit-obs-modal">&times;</button>
              <div class="modal-content">
                <span class="profile-role-badge">${matched.issueType}</span>
                <h2 class="modal-heading" style="margin-top:6px;font-size:16px;">Edit Suggested Clause</h2>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">
                  Tweak the recommended wording before staging.
                </div>
                
                <div class="form-group">
                  <label>Clause Text</label>
                  <textarea class="form-control" id="edit-obs-clause-text" rows="6" style="font-family:var(--font-body);font-size:11px;line-height:1.5;">${matched.suggestedClause}</textarea>
                </div>

                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
                  <button class="btn btn-secondary btn-small" id="btn-edit-obs-cancel">Cancel</button>
                  <button class="btn btn-primary btn-small" id="btn-edit-obs-save">Save Changes</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);

          const close = () => backdrop.remove();
          backdrop.querySelector('#btn-close-edit-obs-modal').addEventListener('click', close);
          backdrop.querySelector('#btn-edit-obs-cancel').addEventListener('click', close);
          backdrop.querySelector('#btn-edit-obs-save').addEventListener('click', () => {
            const newText = backdrop.querySelector('#edit-obs-clause-text').value;
            matched.suggestedClause = newText;
            matched.source = "User Edited";
            backdrop.remove();
            this.render(container);
          });
          backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) backdrop.remove(); });
        });
      });
    }

    // ─── TAB 3: REDLINE REVIEW EVENTS ──────────────────────────────────────
    if (this.activeSubTab === 'redline') {
      const docId = this.selectedDocId;

      // Toggle diff sub-modes
      container.querySelector('#btn-mode-inline')?.addEventListener('click', () => {
        this.redlineMode = 'inline';
        this.render(container);
      });
      container.querySelector('#btn-mode-sbs')?.addEventListener('click', () => {
        this.redlineMode = 'sbs';
        this.render(container);
      });

      // Remove specific staged change from queue & update draft
      container.querySelectorAll('.btn-remove-staged').forEach(btn => {
        btn.addEventListener('click', async () => {
          const changeId = btn.dataset.changeId;
          const staged = this.getProposedChanges(docId);
          const matched = staged.find(s => s.id === changeId);
          if (!matched) return;

          // Remove from list
          const updatedStaged = staged.filter(s => s.id !== changeId);
          this.saveProposedChanges(docId, updatedStaged);

          // Tweak the active draft to remove that specific block
          let draftText = this.getActiveDraft(docId) || "";
          const targetBlock = `\n\n[Proposed Addition - ${matched.name}]:\n${matched.text}`;
          draftText = draftText.replace(targetBlock, "");
          this.saveActiveDraft(docId, draftText);

          this.render(container);
        });
      });

      // Discard proposed draft entirely
      container.querySelector('#btn-reject-draft')?.addEventListener('click', () => {
        if (confirm("Discard all staged proposed revisions? This will reset the draft back to baseline.")) {
          this.clearActiveDraft(docId);
          this.clearProposedChanges(docId);
          this.render(container);
        }
      });

      // Manual Edit Draft pane
      container.querySelector('#btn-edit-draft-text')?.addEventListener('click', () => {
        const draftText = this.getActiveDraft(docId) || this.baselineText || "";

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
          <div class="modal-container" style="max-width: 680px;">
            <button class="modal-close-btn" id="btn-close-edit-draft-modal">&times;</button>
            <div class="modal-content">
              <span class="profile-role-badge">Editor Pane</span>
              <h2 class="modal-heading" style="margin-top:6px;font-size:16px;">Manual Policy Draft Editor</h2>
              
              <div class="form-group" style="margin-top:12px;">
                <label>Draft Content</label>
                <textarea class="form-control" id="edit-draft-text-content" rows="18" style="font-family:var(--font-body);font-size:11px;line-height:1.6;white-space:pre-wrap;">${draftText}</textarea>
              </div>

              <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
                <button class="btn btn-secondary btn-small" id="btn-edit-draft-cancel">Cancel</button>
                <button class="btn btn-primary btn-small" id="btn-edit-draft-save">Save Draft</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);

        const close = () => backdrop.remove();
        backdrop.querySelector('#btn-close-edit-draft-modal').addEventListener('click', close);
        backdrop.querySelector('#btn-edit-draft-cancel').addEventListener('click', close);
        backdrop.querySelector('#btn-edit-draft-save').addEventListener('click', () => {
          const updatedContent = backdrop.querySelector('#edit-draft-text-content').value;
          this.saveActiveDraft(docId, updatedContent);
          backdrop.remove();
          this.render(container);
        });
        backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) backdrop.remove(); });
      });

      // Approve & Commit revision modal
      container.querySelector('#btn-approve-draft-notes')?.addEventListener('click', () => {
        const staged = this.getProposedChanges(docId);
        const defaultSummary = staged.length > 0 
          ? "Integrated compliance clauses: " + staged.map(s => s.name).join(", ") 
          : "Standard manual revision update.";

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
          <div class="modal-container" style="max-width: 500px;">
            <button class="modal-close-btn" id="btn-close-commit-modal">&times;</button>
            <div class="modal-content">
              <span class="profile-role-badge">Commit Ledger</span>
              <h2 class="modal-heading" style="margin-top:6px;font-size:16px;">Approve & Commit Revision</h2>
              
              <div class="form-group" style="margin-top:12px;">
                <label>Change Notes (Summary)</label>
                <textarea class="form-control" id="commit-summary" rows="2" style="font-size:11px;">${defaultSummary}</textarea>
              </div>

              <div class="form-group">
                <label>Revision Reason</label>
                <select class="form-control" id="commit-reason">
                  <option value="Annual review">Annual review</option>
                  <option value="DPDPA alignment">DPDPA alignment</option>
                  <option value="Added grievance mechanism">Added grievance mechanism</option>
                  <option value="Strengthened retention">Strengthened retention</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Editor Role</label>
                <input type="text" class="form-control" id="commit-editor" value="${this.state.settings?.activeUserRole || 'DPO / Privacy Officer'}" />
              </div>

              <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
                <button class="btn btn-secondary btn-small" id="btn-commit-cancel">Cancel</button>
                <button class="btn btn-primary btn-small" id="btn-commit-save">Commit & Publish</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);

        const close = () => backdrop.remove();
        backdrop.querySelector('#btn-close-commit-modal').addEventListener('click', close);
        backdrop.querySelector('#btn-commit-cancel').addEventListener('click', close);
        backdrop.querySelector('#btn-commit-save').addEventListener('click', async () => {
          const summaryText = backdrop.querySelector('#commit-summary').value;
          const reasonVal = backdrop.querySelector('#commit-reason').value;
          const editorVal = backdrop.querySelector('#commit-editor').value;

          const draftText = this.getActiveDraft(docId);

          // 1. Save version history entry
          const newVer = VersionHistoryService.saveVersion(docId, {
            editor: editorVal,
            frameworks: this.selectedFrameworks,
            summary: summaryText,
            reason: reasonVal,
            documentText: draftText
          });

          // 2. Save/Update active document text in StorageService
          const policies = await StorageService.getPolicyDocuments();
          const policyDoc = policies.find(p => p.id === docId);
          if (policyDoc) {
            const updatedDoc = {
              ...policyDoc,
              extracted_text: draftText,
              updated_at: new Date().toISOString()
            };
            await StorageService.savePolicyDocument(updatedDoc);
          }

          // 3. Clear Staging Queue and drafts
          this.clearActiveDraft(docId);
          this.clearProposedChanges(docId);
          this.baselineText = draftText;

          backdrop.remove();
          alert(`Successfully committed revision ${newVer.version}!`);
          this.selectTab('versions', container);
        });
        backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) backdrop.remove(); });
      });
    }

    // ─── TAB 4: ORIGINAL UPGRADE EVENTS ────────────────────────────────────
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

        const policies = await StorageService.getPolicyDocuments();
        const policyDoc = policies.find(p => p.id === this.selectedDocId);
        const text = policyDoc?.extracted_text || activeDoc.documentSummary || '';

        this.isAnalyzing = true;
        this.renderSubTabContent(container.querySelector('#tab-body-container'));

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
            
            const gaps = [];
            const amendments = [];
            let updatedDraft = text;

            const library = PolicyTemplateService.getClauseLibrary();

            const gapReqs = [...sim.missing, ...sim.weak];
            gapReqs.forEach((req, idx) => {
              const match = library.find(c => {
                const searchFw = this.targetFramework === 'dpdp' ? 'DPDPA' : this.targetFramework.toUpperCase();
                return c.frameworks.includes(searchFw) || c.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]);
              });
              
              const gapItem = {
                id: `gap-${idx}-${Date.now()}`,
                reqName: req.name,
                status: sim.missing.includes(req) ? 'Missing' : 'Partially Addressed',
                name: match ? match.name : `${req.name} Clause`,
                text: match ? match.text : `[Simulated Clause] Mandates control requirements for ${req.name} under ${this.targetFramework.toUpperCase()} regulations.`,
                rationale: match ? match.rationale : `Directly fulfills compliance requirement: ${req.desc}`,
                confidence: match ? match.maturity : 'Medium'
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
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        }
      });

      container.querySelectorAll('.toggle-clause-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const clauseId = btn.dataset.clauseId;
          this.expandedClauseId = this.expandedClauseId === clauseId ? null : clauseId;
          this.render(container);
        });
      });

      container.querySelectorAll('.clause-textarea').forEach(tx => {
        tx.addEventListener('input', () => {
          const cid = tx.dataset.clauseId;
          this.editedClauses[cid] = tx.value;
        });
      });

      container.querySelectorAll('.clause-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.dataset.clauseId;
          const action = btn.dataset.action;
          
          const current = this.itemDecisions[cid];
          if (action === 'accept') {
            this.itemDecisions[cid] = current === 'accepted' ? 'pending' : 'accepted';
          } else {
            this.itemDecisions[cid] = current === 'dismissed' ? 'pending' : 'dismissed';
          }

          this.render(container);
        });
      });

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
            confidence: 'high',
            deltaStatus: 'New'
          };

          if (type === 'Control') {
            await this.pushToChangeQueue('Control', `Map mitigating control: ${gap.name}`, clauseText, {
              ...details,
              effectiveness: 'Highly Effective',
              riskId: 'risk-001'
            });
          } else if (type === 'Risk') {
            await this.pushToChangeQueue('Risk', `Compliance Gap: ${gap.reqName} exposure`, `Failure to address requirement: ${gap.rationale}. Recommended clause: ${clauseText}`, {
              ...details,
              category: 'Compliance',
              likelihood: 3,
              impact: 4
            });
          } else if (type === 'Action') {
            await this.pushToChangeQueue('Action', `Draft implementation: ${gap.name}`, `Action task to implement the clause: ${clauseText}`, {
              ...details,
              owner: 'CISO',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          } else if (type === 'ObjectiveLink') {
            await this.pushToChangeQueue('ObjectiveLink', `Link Policy to Strategic Objectives`, `Verify compliance alignment between policy and IPO/Cyber objectives. Mapped: ${gap.reqName}`, {
              ...details,
              objectiveId: 'obj-cyber'
            });
          }
        });
      });

      container.querySelector('#btn-approve-and-stage')?.addEventListener('click', () => {
        this.isPublishing = true;
        this.activeSubTab = 'versions';
        this.reviewSummary = `Approved amendments checklist for ${PolicyTemplateService.getRequirementPacks()[this.targetFramework]?.name || this.targetFramework}. Added accepted clauses.`;
        this.render(container);
      });
    }

    // ─── TAB 5: VERSION HISTORY EVENTS ─────────────────────────────────────
    if (this.activeSubTab === 'versions') {
      const verDocSelect = container.querySelector('#ver-doc-select');

      verDocSelect?.addEventListener('change', () => {
        this.selectTab('versions', container);
      });

      // Inspect Text
      container.querySelectorAll('.view-ver-text-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.verIdx);
          const versions = this.getPolicyVersions(this.selectedDocId);
          const ver = versions[idx];
          if (!ver) return;

          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.innerHTML = `
            <div class="modal-container" style="max-width: 680px;">
              <button class="modal-close-btn" id="btn-close-ver-modal">&times;</button>
              <div class="modal-content">
                <span class="profile-role-badge">${ver.version} | ${ver.owner || ver.editor}</span>
                <h2 class="modal-heading" style="margin-top:6px;">Version Text Preview</h2>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">
                  Approved on ${new Date(ver.date).toLocaleString('en-GB')}
                </div>
                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;padding:16px;font-family:var(--font-body);font-size:11px;line-height:1.6;white-space:pre-wrap;max-height:380px;overflow-y:auto;color:var(--text-primary);">
                  ${ver.documentText || ver.content}
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);
          
          backdrop.querySelector('#btn-close-ver-modal').addEventListener('click', () => backdrop.remove());
          backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
        });
      });

      // Compare Revision Modal
      container.querySelectorAll('.compare-ver-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.verIdx);
          const history = this.getPolicyVersions(this.selectedDocId);
          const verObj = history[idx];
          if (!verObj) return;

          const inlineHtml = RedlineService.renderInlineRedline(this.baselineText, verObj.documentText);

          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.innerHTML = `
            <div class="modal-container" style="max-width: 680px;">
              <button class="modal-close-btn" id="btn-close-compare-modal">&times;</button>
              <div class="modal-content">
                <span class="profile-role-badge">Revision Compare</span>
                <h2 class="modal-heading" style="margin-top:6px;font-size:16px;">Comparing Baseline vs ${verObj.version}</h2>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">
                  Legend: <span style="background-color:#DEF7EC;color:#03543F;padding:1px 3px;">Green: Added</span> | <span style="background-color:#FDE8E8;color:#9B1C1C;text-decoration:line-through;padding:1px 3px;">Red: Deleted</span>
                </div>

                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;padding:16px;font-family:var(--font-body);font-size:11px;line-height:1.6;white-space:pre-wrap;max-height:380px;overflow-y:auto;color:var(--text-primary);">
                  ${inlineHtml}
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);

          backdrop.querySelector('#btn-close-compare-modal').addEventListener('click', () => backdrop.remove());
          backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
        });
      });

      // Rollback Confirmation & Actions
      container.querySelectorAll('.rollback-ver-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.verIdx);
          const history = this.getPolicyVersions(this.selectedDocId);
          const verObj = history[idx];
          if (!verObj) return;

          if (confirm(`Are you sure you want to rollback to revision ${verObj.version}? This will append a new version entry to the immutable ledger and restage its content as the active policy text.`)) {
            const editorRole = this.state.settings?.activeUserRole || 'DPO / Privacy Officer';
            const nextVer = await VersionHistoryService.rollbackVersion(this.selectedDocId, idx, editorRole);
            
            this.baselineText = nextVer.documentText;
            alert(`Rollback complete! Stage reverted. New revision committed as ${nextVer.version}.`);
            
            // Re-render
            this.selectTab('versions', container);
          }
        });
      });
    }
  }
}
