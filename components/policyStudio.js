// Navis Policy Intelligence Studio Component
// Implements Wave 2 - Governance Workbench

import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';
import { PolicyTemplateService } from '../services/policyTemplateService.js';
import { RedlineService } from '../services/redlineService.js';
import { VersionHistoryService } from '../services/versionHistoryService.js';
import { ClauseIntelligenceService } from '../services/clauseIntelligenceService.js';
import { FrameworkReferenceService } from '../services/frameworkReferenceService.js';
import { OrganizationMemoryService } from '../services/organizationMemoryService.js';
import { PolicyLanguageService } from '../services/policyLanguageService.js';
import { PolicyCompletenessService } from '../services/policyCompletenessService.js';
import { PolicyDefinitionsService } from '../services/policyDefinitionsService.js';
import { OrganizationContextService } from '../services/organizationContextService.js';

export class PolicyStudioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;

    this.activeSubTab = 'generator'; // 'generator', 'intelligence', 'redline', 'upgrade', 'refinement', 'versions'
    
    // Generator Selections
    this.genDomain = 'privacy';
    this.genTemplate = 'pims';
    this.genPrompt = '';
    
    // Load cached framework selection or default
    const storedFws = localStorage.getItem('navis_v3_selected_frameworks');
    this.selectedFrameworks = storedFws ? JSON.parse(storedFws) : ['DPDPA', 'GDPR', 'ISO 27701'];
    this.upgradeFrameworks = storedFws ? JSON.parse(storedFws) : ['DPDPA', 'GDPR', 'ISO 27701'];

    // Initialize scaffolded GRC organization memory
    OrganizationMemoryService.getMemory();
    
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
    this.completenessResult = null;
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

    // Language Refinement State (Wave 3.5)
    this.isRefining = false;
    this.refinementSuggestions = [];
    this.refinementProfile = 'big4';
    this.refinementCategories = Object.keys(PolicyLanguageService.CATEGORIES);
    this.dismissedRefinements = new Set();

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
            <h1 class="page-title">Policy Studio</h1>
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
        <button class="subtab-btn ${this.activeSubTab === 'refinement' ? 'active' : ''}" data-subtab="refinement" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'refinement' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'refinement' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Language Refinement
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'versions' ? 'active' : ''}" data-subtab="versions" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Version History
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'packs' ? 'active' : ''}" data-subtab="packs" style="background:none;border:none;padding:10px 20px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'packs' ? 'var(--color-indigo)' : 'var(--text-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'packs' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Governance Packs
        </button>
      </div>

      <div class="policy-studio-body" id="tab-body-container">
        <!-- Rendered Dynamically -->
      </div>
    `;

    const bodyContainer = container.querySelector('#tab-body-container');
    try {
      this.renderSubTabContent(bodyContainer);
      this.bindEvents(container);
    } catch (renderError) {
      alert("RUNTIME ERROR in PolicyStudio: " + renderError.message + "\n" + renderError.stack);
      console.error(renderError);
    }
  }

  // Tab switch routing
  async selectTab(tabKey, container) {
    this.activeSubTab = tabKey;

    if (tabKey === 'redline') {
      this.isRedlineLoading = true;
      this.render(container);
      
      try {
        this.baselineText = await this.getBaselineText(this.selectedDocId);
      } catch (err) {
        console.error("Failed to load baseline:", err);
      } finally {
        this.isRedlineLoading = false;
        this.render(container);
      }
    } else {
      this.render(container);
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
    } else if (this.activeSubTab === 'refinement') {
      bodyHtml = this.renderRefinementTab();
    } else if (this.activeSubTab === 'packs') {
      bodyHtml = this.renderGovernancePacksTab();
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
            <h3 class="dashboard-card-title">Organization Context</h3>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="form-control profile-field" data-key="companyName" value="${this.genProfile.companyName || ''}" />
              </div>
              <div class="form-group">
                <label>Processing Role</label>
                <select class="form-control profile-field" data-key="processingRole">
                  <option value="Data Controller" ${this.genProfile.processingRole === 'Data Controller' ? 'selected' : ''}>Data Controller</option>
                  <option value="Data Processor" ${this.genProfile.processingRole === 'Data Processor' ? 'selected' : ''}>Data Processor</option>
                  <option value="Joint Controller" ${this.genProfile.processingRole === 'Joint Controller' ? 'selected' : ''}>Joint Controller</option>
                  <option value="Processor & Controller" ${this.genProfile.processingRole === 'Processor & Controller' ? 'selected' : ''}>Processor & Controller</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Business Model</label>
                <select class="form-control profile-field" data-key="b2bB2c">
                  <option value="B2B" ${this.genProfile.b2bB2c === 'B2B' ? 'selected' : ''}>B2B</option>
                  <option value="B2C" ${this.genProfile.b2bB2c === 'B2C' ? 'selected' : ''}>B2C</option>
                  <option value="Marketplace" ${this.genProfile.b2bB2c === 'Marketplace' ? 'selected' : ''}>Marketplace</option>
                  <option value="Hybrid" ${this.genProfile.b2bB2c === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                </select>
              </div>
              <div class="form-group">
                <label>Customer Geographies</label>
                <input type="text" class="form-control profile-field" data-key="customerGeography" placeholder="e.g. India, EU, USA" value="${this.genProfile.customerGeography || ''}" />
              </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Data Subjects</label>
                <input type="text" class="form-control profile-field" data-key="dataSubjects" placeholder="e.g. Customers, Employees" value="${this.genProfile.dataSubjects || ''}" />
              </div>
              <div class="form-group">
                <label>Special Categories</label>
                <input type="text" class="form-control profile-field" data-key="specialCategories" placeholder="e.g. Health Data, Financial" value="${this.genProfile.specialCategories || ''}" />
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Technology Stack</label>
                <input type="text" class="form-control profile-field" data-key="cloudProvider" placeholder="e.g. AWS, Azure, GCP" value="${this.genProfile.cloudProvider || ''}" />
              </div>
              <div class="form-group">
                <label>Hosting Region</label>
                <input type="text" class="form-control profile-field" data-key="hostingRegion" placeholder="e.g. ap-south-1" value="${this.genProfile.hostingRegion || ''}" />
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>Subprocessors</label>
                <input type="text" class="form-control profile-field" data-key="subprocessors" placeholder="e.g. Stripe, Twilio" value="${this.genProfile.subprocessors || ''}" />
              </div>
              <div class="form-group">
                <label>Intl. Transfers</label>
                <input type="text" class="form-control profile-field" data-key="internationalTransfers" placeholder="e.g. SCCs, BCRs" value="${this.genProfile.internationalTransfers || ''}" />
              </div>
            </div>

            <h4 style="margin-top:12px; margin-bottom:8px; font-size:10px; color:var(--text-muted); text-transform:uppercase;">Governance Roles</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label>DPO Name</label>
                <input type="text" class="form-control profile-field" data-key="dpoOfficer" value="${this.genProfile.dpoOfficer || ''}" />
              </div>
              <div class="form-group">
                <label>Grievance Officer Name</label>
                <input type="text" class="form-control profile-field" data-key="grievanceOfficer" value="${this.genProfile.grievanceOfficer || ''}" />
              </div>
              <div class="form-group">
                <label>CISO Name</label>
                <input type="text" class="form-control profile-field" data-key="cisoOfficer" value="${this.genProfile.cisoOfficer || ''}" />
              </div>
              <div class="form-group">
                <label>CRO Name</label>
                <input type="text" class="form-control profile-field" data-key="croOfficer" value="${this.genProfile.croOfficer || ''}" />
              </div>
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
                <select class="form-control" id="clause-group-filter" style="font-size:11px;padding:4px 8px;height:auto;">
                  <option value="all" ${this.clauseGroupFilter === 'all' ? 'selected' : ''}>All Groups</option>
                  ${groupsList.map(g => `<option value="${g}" ${this.clauseGroupFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Framework</label>
                <select class="form-control" id="clause-fw-filter" style="font-size:11px;padding:4px 8px;height:auto;">
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
                  <div style="display:flex;gap:6px;align-items:center;">
                    <button class="btn btn-secondary btn-small" id="btn-download-draft" style="font-size:10px;display:flex;align-items:center;">
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                      Download PDF
                    </button>
                    <button class="btn btn-secondary btn-small" id="btn-refine-draft" style="font-size:10px;border-color:var(--color-indigo);color:var(--color-indigo);">Refine Language</button>
                    <button class="btn btn-secondary btn-small" id="btn-save-draft-to-vault" style="font-size:10px;">Save Draft to Vault</button>
                  </div>
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

              ${this.genResultText && this.completenessResult ? this._renderCompletenessPanel() : ''}

            </div>

          </div>
        </div>

      </div>
    `;
  }

  _renderCompletenessPanel() {
    if (!this.completenessResult) return '';

    const { governanceQuality, totalSections, presentSections, findings } = this.completenessResult;

    // Map to expected variables
    let grade = 'F';
    if (governanceQuality === 'Institutional Grade') grade = 'A';
    else if (governanceQuality === 'Standard Grade') grade = 'C';
    
    const score = Math.round((presentSections / totalSections) * 100);
    const summary = `${governanceQuality} Document`;
    const sectionsFound = findings.filter(f => f.status !== 'Missing').map(f => f.section);
    
    const issues = {
      Critical: findings.filter(f => f.status === 'Missing' && f.severity === 'Critical').map(f => f.detail),
      Moderate: findings.filter(f => f.status === 'Missing' && f.severity === 'Important').map(f => f.detail)
    };

    // Badge styling based on grade
    let badgeColor = 'var(--text-muted)';
    let badgeBg = 'var(--bg-tertiary)';
    if (grade === 'A' || grade === 'B') { badgeColor = 'var(--color-emerald)'; badgeBg = 'rgba(16, 185, 129, 0.1)'; }
    if (grade === 'C') { badgeColor = 'var(--color-amber)'; badgeBg = 'rgba(245, 158, 11, 0.1)'; }
    if (grade === 'D' || grade === 'F') { badgeColor = 'var(--color-rose)'; badgeBg = 'rgba(244, 63, 94, 0.1)'; }

    // Section Checklist
    const allSections = [
      'Purpose & Objective', 'Scope', 'Applicability', 'Definitions',
      'Roles & Responsibilities', 'Policy Requirements', 'Exceptions',
      'Non-compliance & Enforcement', 'Monitoring & Compliance',
      'Review & Maintenance', 'Related Documents', 'Version Control'
    ];

    const checklistHtml = allSections.map(sec => {
      const isFound = sectionsFound.includes(sec);
      return `
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:${isFound ? 'var(--text-primary)' : 'var(--text-muted)'};margin-bottom:4px;">
          ${isFound 
            ? `<svg viewBox="0 0 20 20" fill="var(--color-emerald)" style="width:14px;height:14px;"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>` 
            : `<svg viewBox="0 0 20 20" fill="var(--color-rose)" style="width:14px;height:14px;"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`
          }
          ${sec}
        </div>
      `;
    }).join('');

    // Findings HTML
    const findingsHtml = Object.entries(issues).map(([severity, severitiesIssues]) => {
      if (severitiesIssues.length === 0) return '';
      let iconColor = 'var(--color-amber)';
      if (severity === 'Critical') iconColor = 'var(--color-rose)';
      if (severity === 'Moderate') iconColor = 'var(--color-indigo)';

      return `
        <div style="margin-top:12px;">
          <strong style="font-size:11px;color:${iconColor};">${severity} Findings (${severitiesIssues.length})</strong>
          <ul style="margin:4px 0 0 0;padding-left:16px;font-size:11px;color:var(--text-secondary);">
            ${severitiesIssues.map(iss => `<li style="margin-bottom:2px;">${iss}</li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');

    return `
      <div style="margin-top:16px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:16px;">
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <h4 style="font-size:13px;margin:0 0 4px 0;color:var(--text-primary);">Policy Completeness Assessment</h4>
            <p style="font-size:11px;color:var(--text-secondary);margin:0;">${summary}</p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;">
            <div style="background:${badgeBg};color:${badgeColor};padding:4px 10px;border-radius:12px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px;">
              Grade: ${grade}
              <span style="font-size:11px;font-weight:500;opacity:0.8;">(${score}/100)</span>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;border-top:1px solid var(--border-color);padding-top:16px;">
          
          <!-- Sections Checklist -->
          <div>
            <h5 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin:0 0 8px 0;letter-spacing:0.5px;">12-Section Governance Model</h5>
            <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:12px;">
              ${checklistHtml}
            </div>
          </div>

          <!-- Findings -->
          <div>
            <h5 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin:0 0 8px 0;letter-spacing:0.5px;">Completeness Findings</h5>
            ${findingsHtml || '<div style="font-size:11px;color:var(--color-emerald);margin-top:12px;">No completeness findings. Document meets all structural requirements.</div>'}
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

                      ${o.frameworkBasis && o.frameworkBasis.length > 0 ? `
                        <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">
                          <strong>Framework Basis:</strong>
                          <span style="display:inline-flex;gap:4px;flex-wrap:wrap;margin-top:2px;">
                            ${o.frameworkBasis.map(fb => `
                              <span style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;padding:1px 6px;font-size:9px;font-weight:600;color:var(--text-secondary);">${fb}</span>
                            `).join('')}
                          </span>
                        </div>
                      ` : ''}

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
    const stagedChanges = this.selectedDocId ? this.getProposedChanges(this.selectedDocId) : [];

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
              <label style="display:block;margin-bottom:8px;font-weight:600;">Target Frameworks</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;" id="upgrade-framework-checkboxes">
                ${['DPDPA', 'GDPR', 'ISO 27701', 'ISO 27001', 'SOC 2', 'NIST CSF'].map(fw => {
                  const isChecked = this.upgradeFrameworks.includes(fw);
                  return `
                    <label style="display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer;color:var(--text-primary);user-select:none;">
                      <input type="checkbox" class="upgrade-fw-check" value="${fw}" ${isChecked ? 'checked' : ''} style="cursor:pointer;" />
                      ${fw}
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <button class="btn btn-primary" id="btn-run-policy-audit" style="width:100%;justify-content:center;margin-top:12px;" ${!this.selectedDocId || this.isAnalyzing || this.upgradeFrameworks.length === 0 ? 'disabled' : ''}>
              ${this.isAnalyzing ? 'Analyzing Alignment...' : 'Analyze Policy & Gaps'}
            </button>
          </div>

          <!-- REQ PACK INSPECTOR -->
          <div class="glass-panel" style="margin-top:16px;">
            <h3 class="dashboard-card-title">Requirements</h3>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:12px;">
              Exposing requirements mapped by selected target frameworks.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px;">
              ${this.upgradeFrameworks.flatMap(fw => {
                const fwKey = fw.toLowerCase() === 'dpdpa' ? 'dpdp' : fw.toLowerCase();
                const pack = frameworks[fwKey];
                return (pack?.requirements || []).map(r => ({ ...r, fw }));
              }).map(r => `
                <div style="padding:8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="color:var(--text-primary);">${r.name}</strong>
                    <span class="profile-role-badge" style="font-size:8px;padding:1px 4px;">${r.fw}</span>
                  </div>
                  <span style="font-size:10px;color:var(--text-secondary);line-height:1.3;display:block;margin-top:2px;">${r.desc}</span>
                </div>
              `).join('')}
              ${this.upgradeFrameworks.length === 0 ? `
                <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:11px;">
                  No frameworks selected.
                </div>
              ` : ''}
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
              
              <!-- COVERAGE SUMMARY / EXECUTIVE SUMMARY -->
              <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:1fr 1.5fr;gap:20px;">
                <div style="border-right:1px solid var(--border-color);padding-right:10px;display:flex;flex-direction:column;justify-content:center;">
                  <span style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Executive Summary</span>
                  <p style="font-size:12px;color:var(--text-primary);line-height:1.45;margin-top:6px;">
                    ${results.summary}
                  </p>
                </div>
                <div>
                  <span style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;display:block;margin-bottom:8px;">Missing Areas</span>
                  <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <div style="padding:10px;background:var(--color-critical-bg);border:1px solid var(--color-critical);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-critical-text);font-size:16px;display:block;">${results.gaps.filter(g => g.severity === 'Critical').length}</strong>
                      <span style="font-size:9px;color:var(--color-critical-text);font-weight:600;text-transform:uppercase;">Critical</span>
                    </div>
                    <div style="padding:10px;background:var(--color-warning-bg);border:1px solid var(--color-warning);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-warning-text);font-size:16px;display:block;">${results.gaps.filter(g => g.severity === 'Important').length}</strong>
                      <span style="font-size:9px;color:var(--color-warning-text);font-weight:600;text-transform:uppercase;">Important</span>
                    </div>
                    <div style="padding:10px;background:rgba(100, 116, 139, 0.1);border:1px solid var(--border-color);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--text-secondary);font-size:16px;display:block;">${results.gaps.filter(g => g.severity === 'Advisory').length}</strong>
                      <span style="font-size:9px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;">Advisory</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CLAUSE RECOMMENDATIONS / IMPROVEMENT OPPORTUNITIES -->
              <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin-bottom:10px;">Improvement Opportunities</h4>
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                ${results.gaps.map(g => {
                  const decision = this.itemDecisions[g.id] || 'pending';
                  const isExpanded = this.expandedClauseId === g.id;
                  const currentText = this.editedClauses[g.id] !== undefined ? this.editedClauses[g.id] : (g.suggestedClause || g.text);

                  let borderClr = 'var(--border-color)';
                  let bgClr = 'var(--bg-secondary)';
                  let badgeClass = 'within';
                  if (g.severity === 'Critical') {
                    borderClr = 'var(--color-critical)';
                    bgClr = 'var(--color-critical-bg)';
                    badgeClass = 'above';
                  } else if (g.severity === 'Important') {
                    borderClr = 'var(--color-warning)';
                    bgClr = 'var(--color-warning-bg)';
                    badgeClass = 'near';
                  }

                  return `
                    <div style="border:1.5px solid ${borderClr};border-radius:8px;padding:12px;background:${bgClr};transition:all 0.2s;" class="clause-card" data-clause-id="${g.id}">
                      
                      <!-- Card Header -->
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            <span class="status-badge ${badgeClass}" style="font-size:9px;text-transform:uppercase;">
                              ${g.severity || 'Important'}
                            </span>
                            <span class="profile-role-badge" style="font-size:9px;color:var(--color-indigo);">${g.issueType || g.reqName}</span>
                          </div>
                          <h4 style="font-size:13px;font-weight:700;margin-top:4px;">${g.name || g.observation}</h4>
                        </div>
                        
                        <div style="display:flex;gap:6px;align-items:center;">
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
                            <strong>Why it matters:</strong> ${g.rationale}
                          </div>

                          <div style="font-size:10px;color:var(--text-muted);margin-bottom:12px;">
                            <strong>Framework Mapping:</strong> ${(g.frameworks || []).join(', ')}
                          </div>

                          ${g.frameworkBasis && g.frameworkBasis.length > 0 ? `
                            <div style="font-size:10px;color:var(--text-muted);margin-bottom:12px;">
                              <strong>Framework Basis:</strong>
                              <span style="display:inline-flex;gap:4px;flex-wrap:wrap;margin-top:2px;">
                                ${g.frameworkBasis.map(fb => `
                                  <span style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;padding:1px 6px;font-size:9px;font-weight:600;color:var(--text-secondary);">${fb}</span>
                                `).join('')}
                              </span>
                            </div>
                          ` : ''}

                          <!-- Actions Row -->
                          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <!-- Decision Actions -->
                            <div style="display:flex;gap:6px;">
                              <button class="btn btn-primary btn-small clause-action-btn" data-action="accept" data-clause-id="${g.id}">
                                Accept Suggested
                              </button>
                              <button class="btn btn-secondary btn-small clause-action-btn" data-action="dismiss" data-clause-id="${g.id}">
                                Dismiss
                              </button>
                            </div>
                            
                            <!-- Change Queue Actions -->
                            <div style="display:flex;gap:4px;">
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Control" data-clause-id="${g.id}" style="font-size:10px;">Create Control</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Risk" data-clause-id="${g.id}" style="font-size:10px;">Create Risk</button>
                            </div>
                          </div>
                        </div>
                      ` : ''}

                    </div>
                  `;
                }).join('')}
              </div>

              <!-- PROPOSED CHANGES (STAGED) -->
              ${stagedChanges.length > 0 ? `
                <div class="glass-panel" style="background:rgba(15,118,110,0.015);border-color:var(--color-indigo);padding:14px !important;margin-bottom:20px;">
                  <h4 style="font-size:10px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.5px;margin:0 0 10px;font-weight:700;">Proposed Changes Queue (Staged)</h4>
                  <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:10px;">
                    ${stagedChanges.map(sc => `
                      <div style="padding:10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                        <span style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sc.name}</span>
                        <span style="font-size:9px;color:var(--text-muted);">${sc.source}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- REVIEW & COMMIT NOTICE -->
              <div class="glass-panel" style="background:rgba(219,234,254,0.15);border-color:var(--color-indigo);display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
                <div>
                  <h4 style="font-size:13px;font-weight:700;color:var(--text-primary);">Review Staged Changes</h4>
                  <p style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                    All accepted upgrade recommendations must be reviewed and committed as a new version in Redline Review.
                  </p>
                </div>
                <button class="btn btn-primary" id="btn-go-to-redline-review" style="height:32px;">Go to Redline Review</button>
              </div>

            ` : `
              <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 12px;opacity:0.3;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Select an existing policy document and target frameworks on the left to begin gap analysis.
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

  // ─── TAB 6: LANGUAGE REFINEMENT (Wave 3.5) ─────────────────────────────
  renderRefinementTab() {
    const vaultDocs = this.state.vaultDocs || [];
    const profiles = PolicyLanguageService.getProfiles();
    const categories = PolicyLanguageService.getCategories();
    const activeProfile = PolicyLanguageService.PROFILES[this.refinementProfile] || PolicyLanguageService.PROFILES['big4'];

    // Filter out dismissed suggestions
    const activeSuggestions = this.refinementSuggestions.filter(s => !this.dismissedRefinements.has(s.id));
    const stats = PolicyLanguageService.getStatistics(activeSuggestions);

    const severityColors = {
      'Strongly Recommended': { bg: '#FDE8E8', fg: '#9B1C1C', border: '#F8B4B4' },
      'Recommended': { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
      'Optional': { bg: '#E0E7FF', fg: '#3730A3', border: '#C7D2FE' }
    };

    return `
      <div style="display:flex;gap:20px;flex-wrap:wrap;">

        <!-- LEFT: CONFIGURATION PANEL -->
        <div class="details-panel" style="flex: 1 1 280px; max-width: 320px;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Refinement Configuration</h3>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:16px;">
              Select a policy document and configure language refinement parameters.
            </p>

            <!-- DOCUMENT SELECTOR -->
            <div class="form-group">
              <label>Source Document</label>
              <select class="form-control" id="refine-doc-select" style="font-size:11px;">
                <option value="">— Select Policy —</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${this.selectedDocId === d.id ? 'selected' : ''}>
                    ${d.documentName || d.documentType || d.id}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- LANGUAGE PROFILE SELECTOR -->
            <div class="form-group" style="margin-top:12px;">
              <label>Language Profile</label>
              <select class="form-control" id="refine-profile-select" style="font-size:11px;">
                ${profiles.map(p => `
                  <option value="${p.id}" ${this.refinementProfile === p.id ? 'selected' : ''}>
                    ${p.name}
                  </option>
                `).join('')}
              </select>
              <div style="font-size:10px;color:var(--text-muted);margin-top:4px;line-height:1.3;">
                ${activeProfile.description}
              </div>
            </div>

            <!-- REFINEMENT CATEGORIES CHECKBOXES -->
            <div class="form-group" style="margin-top:14px;">
              <label>Refinement Scope</label>
              <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;">
                ${categories.map(cat => `
                  <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-primary);cursor:pointer;">
                    <input type="checkbox" class="refine-cat-checkbox" value="${cat.id}"
                      ${this.refinementCategories.includes(cat.id) ? 'checked' : ''} />
                    <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
                    ${cat.label}
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- ORG MEMORY STATUS -->
            <div style="margin-top:14px;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:10px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--color-warning);flex-shrink:0;"></span>
              Org Memory: Initialized (inactive — future wave)
            </div>

            <!-- ANALYZE BUTTON -->
            <div style="margin-top:16px;">
              <button class="btn btn-primary" id="btn-run-refinement" style="width:100%;justify-content:center;height:36px;" ${this.isRefining ? 'disabled' : ''}>
                ${this.isRefining ? 'Analyzing Document...' : 'Analyze & Suggest Refinements'}
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: RESULTS PANEL -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:580px;">
            <h3 class="dashboard-card-title">Language Refinement Results</h3>

            ${this.isRefining ? `
              <div style="text-align:center;padding:120px 0;color:var(--text-muted);">
                <svg class="spinner" viewBox="0 0 50 50" style="width:36px;height:36px;margin:0 auto 12px;animation:spin 1s linear infinite;">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="var(--color-indigo)"></circle>
                </svg>
                Scanning policy language patterns...
              </div>
            ` : activeSuggestions.length === 0 && this.refinementSuggestions.length === 0 ? `
              <div style="text-align:center;padding:100px 0;color:var(--text-muted);">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 12px;opacity:0.3;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                </svg>
                Select a policy document and click "Analyze & Suggest Refinements" to scan for language improvements.
              </div>
            ` : `
              <!-- SUMMARY BANNER -->
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
                <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:10px;text-align:center;">
                  <div style="font-size:20px;font-weight:800;color:var(--color-indigo);">${activeSuggestions.length}</div>
                  <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Total</div>
                </div>
                <div style="background:${severityColors['Strongly Recommended'].bg};border:1px solid ${severityColors['Strongly Recommended'].border};border-radius:6px;padding:10px;text-align:center;">
                  <div style="font-size:20px;font-weight:800;color:${severityColors['Strongly Recommended'].fg};">${stats.bySeverity['Strongly Recommended'] || 0}</div>
                  <div style="font-size:9px;color:${severityColors['Strongly Recommended'].fg};text-transform:uppercase;letter-spacing:0.5px;">Strongly Rec.</div>
                </div>
                <div style="background:${severityColors['Recommended'].bg};border:1px solid ${severityColors['Recommended'].border};border-radius:6px;padding:10px;text-align:center;">
                  <div style="font-size:20px;font-weight:800;color:${severityColors['Recommended'].fg};">${stats.bySeverity['Recommended'] || 0}</div>
                  <div style="font-size:9px;color:${severityColors['Recommended'].fg};text-transform:uppercase;letter-spacing:0.5px;">Recommended</div>
                </div>
                <div style="background:${severityColors['Optional'].bg};border:1px solid ${severityColors['Optional'].border};border-radius:6px;padding:10px;text-align:center;">
                  <div style="font-size:20px;font-weight:800;color:${severityColors['Optional'].fg};">${stats.bySeverity['Optional'] || 0}</div>
                  <div style="font-size:9px;color:${severityColors['Optional'].fg};text-transform:uppercase;letter-spacing:0.5px;">Optional</div>
                </div>
              </div>

              <!-- BULK ACTIONS -->
              <div style="display:flex;gap:8px;margin-bottom:14px;justify-content:flex-end;">
                <button class="btn btn-secondary btn-small" id="btn-accept-all-refinements" style="font-size:10px;">Accept All</button>
                <button class="btn btn-secondary btn-small" id="btn-dismiss-all-refinements" style="font-size:10px;border-color:var(--color-danger);color:var(--color-danger);">Dismiss All</button>
              </div>

              <!-- REFINEMENT CARDS -->
              <div style="display:flex;flex-direction:column;gap:10px;max-height:440px;overflow-y:auto;padding-right:4px;">
                ${activeSuggestions.map(s => {
                  const catMeta = PolicyLanguageService.CATEGORIES[s.category] || {};
                  const sevStyle = severityColors[s.severity] || severityColors['Optional'];
                  return `
                    <div class="glass-panel refinement-card" data-ref-id="${s.id}" style="padding:14px;background:var(--bg-secondary);border:1.5px solid var(--border-color);border-radius:8px;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                          <span style="background:${catMeta.color || '#718096'};color:#fff;font-size:9px;padding:2px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">
                            ${catMeta.label || s.category}
                          </span>
                          <span style="background:${sevStyle.bg};color:${sevStyle.fg};border:1px solid ${sevStyle.border};font-size:9px;padding:2px 8px;border-radius:999px;font-weight:600;">
                            ${s.severity}
                          </span>
                        </div>
                      </div>

                      <div style="margin-bottom:8px;">
                        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:3px;">Original</div>
                        <div style="background:#FDE8E8;color:#9B1C1C;padding:6px 10px;border-radius:4px;font-size:11px;line-height:1.5;text-decoration:line-through;font-family:var(--font-body);">
                          ${s.original}
                        </div>
                      </div>

                      <div style="margin-bottom:8px;">
                        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:3px;">Proposed</div>
                        <div style="background:#DEF7EC;color:#03543F;padding:6px 10px;border-radius:4px;font-size:11px;line-height:1.5;font-family:var(--font-body);">
                          ${s.replacement}
                        </div>
                      </div>

                      <div style="font-size:10px;color:var(--text-secondary);line-height:1.4;margin-bottom:10px;font-style:italic;">
                        ${s.rationale}
                      </div>

                      <div style="display:flex;gap:6px;justify-content:flex-end;border-top:1px solid var(--border-color);padding-top:8px;">
                        <button class="btn btn-secondary btn-small btn-accept-refinement" data-ref-id="${s.id}" style="font-size:9px;padding:3px 10px;height:24px;">Accept</button>
                        <button class="btn btn-secondary btn-small btn-edit-refinement" data-ref-id="${s.id}" style="font-size:9px;padding:3px 10px;height:24px;">Edit</button>
                        <button class="btn btn-secondary btn-small btn-dismiss-refinement" data-ref-id="${s.id}" style="font-size:9px;padding:3px 10px;height:24px;border-color:var(--color-danger);color:var(--color-danger);">Dismiss</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              ${activeSuggestions.length === 0 && this.refinementSuggestions.length > 0 ? `
                <div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:12px;">
                  All refinement suggestions have been processed. Review staged changes in the <strong>Redline Review</strong> tab.
                </div>
              ` : ''}
            `}
          </div>
        </div>

      </div>
    `;
  }

  // ─── EVENT BINDING ───────────────────────────────────────────────────────
  bindEvents(container) {
    if (!this._eventsBound) {
      this._eventsBound = true;
      
      container.addEventListener('click', async (e) => {
        // Handle View Details
        const viewDetailsBtn = e.target.closest('.btn-view-clause-details');
        if (viewDetailsBtn) {
          e.stopPropagation();
          const cid = viewDetailsBtn.dataset.clauseId;
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
                
                ${clause.guidance ? `
                  <div style="background:var(--bg-secondary);border-radius:6px;padding:10px;font-size:10px;color:var(--text-secondary);border-left:3px solid var(--primary-color);">
                    <strong>Implementation Guidance:</strong><br/>
                    ${clause.guidance}
                  </div>
                ` : ''}
              </div>
              <div class="modal-footer" style="padding:16px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:12px;">
                <button class="btn btn-secondary" id="btn-modal-close">Close</button>
                <button class="btn btn-primary" id="btn-modal-use-clause">Use Clause</button>
              </div>
            </div>
          `;
          document.body.appendChild(backdrop);

          const close = () => backdrop.remove();
          backdrop.querySelector('#btn-close-clause-modal').addEventListener('click', close);
          backdrop.querySelector('#btn-modal-close').addEventListener('click', close);
          backdrop.querySelector('#btn-modal-use-clause').addEventListener('click', () => {
            this.genPrompt = (this.genPrompt + `\nEnsure we include the following clause requirement: "${clause.name}". `).trim();
            this.render(container);
            close();
          });
          return;
        }

        // Handle Generate Policy
        const generateBtn = e.target.closest('#btn-generate-policy');
        if (generateBtn) {
          if (this.isGenerating) return;
          this.isGenerating = true;
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          
          try {
            this.genResultText = '';
            
            let systemContext = `You are a Big 4 management consultant drafting a board-quality Information Security Policy.\n`;
            systemContext += `Domain: ${this.genDomain}, Template: ${this.genTemplate}\n`;
            systemContext += `Target Frameworks: ${this.selectedFrameworks.join(', ')}\n`;
            systemContext += `Company Profile: ${JSON.stringify(this.genProfile)}\n`;
            
            let promptText = `Please draft a comprehensive ${this.genTitle}.\n`;
            if (this.genPrompt) {
              promptText += `Custom Instructions from user:\n${this.genPrompt}\n`;
            }
            
            promptText += `Output strictly in Markdown format, using professional corporate language.`;
            
            const markdownResponse = await AIService.queryGemini(promptText, systemContext);
            this.genResultText = markdownResponse;
            this.activeSubTab = 'redline';
          } catch (err) {
            console.error("Drafting failed:", err);
            this.genResultText = `Drafting execution failed. Fallback simulated output:\n\n` + PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
            this.activeSubTab = 'redline';
          } finally {
            this.isGenerating = false;
            this.render(container);
          }
          return;
        }
      });
    }

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
          
          const domains = PolicyTemplateService.getDomains();
          const contextNarrative = OrganizationContextService.generateNarrative(this.genProfile, this.selectedFrameworks);
          
          const systemPrompt = `You are an institutional-quality governance document author operating at the standard of a Big 4 consulting firm (KPMG, PwC, Deloitte, EY). Your output must be indistinguishable from a document produced by an experienced governance consulting team.

Generate a complete, board-ready governance document for: '${this.genTitle}' under the domain of '${domains[this.genDomain]?.name}'.

The document must align with the following compliance frameworks: ${this.selectedFrameworks.join(', ') || 'General Best Practices'}.

## COMPANY CONTEXT (Mandatory — use these values throughout; never use generic placeholders)
${contextNarrative}

- Organization Name: ${this.genProfile.companyName}
- Industry Sector: ${this.genProfile.industry}
- Headquarters Jurisdiction: ${this.genProfile.country}
- Customer Geographies: ${this.genProfile.customerGeography}
- Employee Count: ${this.genProfile.employeeCount}
- Business Model: ${this.genProfile.b2bB2c}
- Processing Role: ${this.genProfile.processingRole}
- Posture: ${this.genProfile.controllerProcessor}
- Data Subjects: ${this.genProfile.dataSubjects}
- Special Categories of Data: ${this.genProfile.specialCategories}
- Primary Cloud Infrastructure: ${this.genProfile.cloudProvider}
- Hosting Region: ${this.genProfile.hostingRegion}
- Subprocessors: ${this.genProfile.subprocessors}
- International Transfers: ${this.genProfile.internationalTransfers}
- Data Protection Officer (DPO): ${this.genProfile.dpoOfficer}
- Designated Grievance Officer: ${this.genProfile.grievanceOfficer}
- CISO: ${this.genProfile.cisoOfficer}
- CRO: ${this.genProfile.croOfficer}
- Core Processing Purpose: ${this.genProfile.processingPurpose}

## MANDATORY 12-SECTION GOVERNANCE STRUCTURE
The document MUST contain ALL of the following sections, numbered sequentially:

1. OBJECTIVE — Define what this policy achieves.
2. PURPOSE — Explain why this policy exists and the risks it mitigates.
3. SCOPE — Define systems, processes, data, and environments governed.
4. POLICY HIERARCHY — Specify how this document relates to other standards and procedures.
5. APPLICABILITY — Specify employees, contractors, third parties, processors, sub-processors.
6. DEFINITIONS — Include precise regulatory definitions for all key terms (Personal Data, Processing, Data Subject, Controller, Processor, Consent, Incident, Breach, etc.) with regulatory article references.
7. ROLES & RESPONSIBILITIES — Assign Policy Owner, Control Owner, Review Owner, DPO, CISO, Grievance Officer, Department Heads. Include Approval Authority.
8. POLICY REQUIREMENTS — The substantive regulatory and operational requirements. Be specific, actionable, and cite framework controls.
9. EXCEPTIONS — Define exception request process, risk acceptance criteria, temporary exemption protocol, documentation requirements.
10. NON-COMPLIANCE & ENFORCEMENT — Specify disciplinary escalation matrix, regulatory reporting obligations, contractual enforcement.
11. MONITORING & COMPLIANCE — Define internal audit procedures, KPIs, compliance verification methods, self-assessment programs.
12. REVIEW & MAINTENANCE — Specify annual/semi-annual review protocol, amendment process, stakeholder consultation, continuous improvement.

## MANDATORY APPENDICES
You must include the following appendices at the end of the document:
- APPENDIX A — RELATED GOVERNANCE DOCUMENTS
- APPENDIX B — VERSION CONTROL
- APPENDIX C — FRAMEWORK MAPPING
- APPENDIX D — RACI MATRIX
- APPENDIX E — ACRONYMS & DEFINITIONS

## METADATA BLOCK (Must appear at the top of the document as a Markdown Table)
| Property | Value |
| --- | --- |
| Document Title | [Full title] |
| Document ID | [Organization abbreviation]-POL-[domain code]-[number] |
| Version | v1.0 |
| Status | Draft (Pending Board Approval) |
| Classification | Confidential — Internal Use Only |
| Applicable Frameworks | [List selected frameworks] |
| Jurisdictions | [Customer geographies] |
| Policy Owner | [Specify from company context] |
| Control Owner | [CISO or DPO based on domain] |
| Approval Authority | Board of Directors / Executive Committee |
| Effective Date | [Use current date] |
| Review Frequency | Annual (12-month cycle) |

## LANGUAGE STANDARDS (Big 4 Tone — Mandatory)
- Use ONLY: shall, must, required, responsible, accountable
- NEVER use: should, may, attempt to, where possible, try to, is expected to
- Write in third-person institutional voice ("The Organization shall...", "The Data Protection Officer shall...")
- No first-person ("we", "our") — use the organization name or "The Organization"
- Randomize sentence starters to avoid repetitive "The Organization shall" structures.

## CRITICAL RULES
- ZERO unresolved placeholders: No {{COMPANY_NAME}}, {{DPO}}, {{COUNTRY}}, etc.
- Every reference to the organization, people, systems, and jurisdictions must use the actual values from the Company Context above.
- Ensure the Governance Roles provided in the context are mentioned by name and role where appropriate.
- Include specific regulatory article citations.
- Include non-compliance consequences.

## CUSTOM DIRECTIVES
${this.genPrompt || 'None provided.'}

Output ONLY the complete governance document. No conversational introductions. No conversational conclusions.`;
            
            const liveResult = await AIService.queryGemini(systemPrompt, apiKey);
            this.genResultText = liveResult || PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
          } catch (err) {
          console.error("Drafting failed:", err);
          this.genResultText = PolicyTemplateService.generateSimulatedDraft(this.genDomain, this.genTemplate, this.selectedFrameworks, this.genProfile);
        } finally {
          this.isGenerating = false;

          // Auto-run completeness evaluation (Wave 3.6)
          if (this.genResultText) {
            try {
              this.completenessResult = PolicyCompletenessService.evaluateCompleteness(this.genResultText);
            } catch (evalErr) {
              console.error('Completeness evaluation failed:', evalErr);
              this.completenessResult = null;
            }
          }

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

      // Download draft as PDF
      container.querySelector('#btn-download-draft')?.addEventListener('click', () => {
        if (!this.genResultText) return;

        // Change button state
        const btn = container.querySelector('#btn-download-draft');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Generating PDF...';
        btn.disabled = true;

        // Create a hidden container for the PDF print layout
        const printContainer = document.createElement('div');
        printContainer.style.padding = '40px';
        printContainer.style.fontFamily = "'Inter', system-ui, sans-serif";
        printContainer.style.color = '#1E293B';
        printContainer.style.lineHeight = '1.6';

        // Convert Markdown to HTML
        const htmlContent = marked.parse(this.genResultText);

        // Header
        const headerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #E2E8F0; padding-bottom:15px; margin-bottom:30px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="background:#0F172A; color:#FFF; font-weight:800; padding:6px 10px; border-radius:4px; font-size:16px; letter-spacing:1px;">NV</div>
              <span style="font-weight:800; font-size:18px; color:#0F172A; letter-spacing:1.5px;">NAVIS</span>
            </div>
            <div style="text-align:right;">
              <span style="display:inline-block; border:1px solid #EF4444; color:#EF4444; font-size:10px; font-weight:700; padding:4px 8px; border-radius:4px; letter-spacing:1px;">PRIVATE & CONFIDENTIAL</span>
              <div style="font-size:10px; color:#64748B; margin-top:6px; font-weight:600;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        `;

        // Footer
        const footerHTML = `
          <div style="margin-top:40px; padding-top:15px; border-top:1px solid #E2E8F0; text-align:center; font-size:10px; color:#94A3B8; font-weight:500;">
            Generated by Navis Enterprise Risk Platform &mdash; For Internal Board Review Only
          </div>
        `;

        // Apply corporate styling to the rendered HTML content
        const bodyWrapper = document.createElement('div');
        bodyWrapper.innerHTML = htmlContent;
        
        // Style headings, paragraphs, lists
        const headings = bodyWrapper.querySelectorAll('h1, h2, h3, h4');
        headings.forEach(h => {
          h.style.color = '#0F172A';
          h.style.fontWeight = '700';
          h.style.marginTop = '24px';
          h.style.marginBottom = '12px';
        });
        bodyWrapper.querySelectorAll('h1').forEach(h => { h.style.fontSize = '24px'; h.style.borderBottom = '1px solid #E2E8F0'; h.style.paddingBottom = '8px'; });
        bodyWrapper.querySelectorAll('h2').forEach(h => { h.style.fontSize = '18px'; });
        bodyWrapper.querySelectorAll('h3').forEach(h => { h.style.fontSize = '14px'; });
        
        bodyWrapper.querySelectorAll('p').forEach(p => {
          p.style.marginBottom = '12px';
          p.style.fontSize = '12px';
        });
        bodyWrapper.querySelectorAll('ul, ol').forEach(list => {
          list.style.marginBottom = '16px';
          list.style.paddingLeft = '24px';
          list.style.fontSize = '12px';
        });
        bodyWrapper.querySelectorAll('li').forEach(li => {
          li.style.marginBottom = '6px';
        });
        bodyWrapper.querySelectorAll('table').forEach(table => {
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.marginBottom = '20px';
          table.style.fontSize = '11px';
        });
        bodyWrapper.querySelectorAll('th').forEach(th => {
          th.style.backgroundColor = '#F8FAFC';
          th.style.padding = '8px';
          th.style.border = '1px solid #CBD5E1';
          th.style.textAlign = 'left';
          th.style.color = '#334155';
        });
        bodyWrapper.querySelectorAll('td').forEach(td => {
          td.style.padding = '8px';
          td.style.border = '1px solid #E2E8F0';
        });

        printContainer.innerHTML = headerHTML + bodyWrapper.outerHTML + footerHTML;

        const opt = {
          margin:       0.5,
          filename:     `${this.genTitle.replace(/\\s+/g, '_')}_Draft.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Use html2pdf
        html2pdf().set(opt).from(printContainer).save().then(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }).catch(err => {
          console.error("PDF generation failed:", err);
          btn.innerHTML = originalText;
          btn.disabled = false;
        });
      });

      // Refine Language — captures current draft and switches to refinement tab
      container.querySelector('#btn-refine-draft')?.addEventListener('click', () => {
        if (!this.genResultText) return;
        this.isRefining = true;
        this.refinementSuggestions = [];
        this.dismissedRefinements = new Set();
        this.activeSubTab = 'refinement';
        this.renderSubTabContent(container.querySelector('#tab-body-container'));
        this.bindEvents(container);

        // Run refinement analysis
        setTimeout(() => {
          try {
            this.refinementSuggestions = PolicyLanguageService.analyzeDocument(this.genResultText, {
              categories: this.refinementCategories,
              profile: this.refinementProfile
            });
          } catch (err) {
            console.error('Language refinement analysis failed:', err);
          } finally {
            this.isRefining = false;
            this.renderSubTabContent(container.querySelector('#tab-body-container'));
            this.bindEvents(container);
          }
        }, 600);
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

      docSelect?.addEventListener('change', () => {
        this.selectedDocId = docSelect.value;
        this.analysisResults = null;
        this.itemDecisions = {};
        this.editedClauses = {};
        this.render(container);
      });

      // Target Framework checkboxes change
      container.querySelectorAll('.upgrade-fw-check').forEach(chk => {
        chk.addEventListener('change', () => {
          const val = chk.value;
          if (chk.checked) {
            if (!this.upgradeFrameworks.includes(val)) {
              this.upgradeFrameworks.push(val);
            }
          } else {
            this.upgradeFrameworks = this.upgradeFrameworks.filter(x => x !== val);
          }
          this.analysisResults = null;
          this.itemDecisions = {};
          this.editedClauses = {};
          this.render(container);
        });
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
          
          // Call scanPolicy of ClauseIntelligenceService
          const gaps = await ClauseIntelligenceService.scanPolicy(text, this.upgradeFrameworks, apiKey);
          
          this.analysisResults = {
            summary: `Policy audited against target frameworks: ${this.upgradeFrameworks.join(', ')}. Identified compliance gaps and improvement opportunities.`,
            gaps: gaps,
            amendments: gaps.map(g => ({
              action: g.severity === 'Critical' ? 'Add' : 'Strengthen',
              desc: g.observation
            }))
          };
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

      // Accept / Reject Actions inside Policy Upgrade tab
      container.querySelectorAll('.clause-action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cid = btn.dataset.clauseId;
          const action = btn.dataset.action;
          const docId = this.selectedDocId;
          const gap = this.analysisResults.gaps.find(g => g.id === cid);
          if (!gap) return;

          if (action === 'accept') {
            const clauseText = this.editedClauses[cid] !== undefined ? this.editedClauses[cid] : (gap.suggestedClause || gap.text);
            
            // 1. Stage in Proposed Changes Queue
            this.addProposedChange(docId, {
              id: gap.id,
              name: gap.name || gap.observation,
              text: clauseText,
              rationale: gap.rationale,
              frameworks: gap.frameworks || this.upgradeFrameworks,
              source: gap.source || 'Policy Upgrade'
            });

            // 2. Append text to active draft
            let draftText = this.getActiveDraft(docId);
            if (!draftText) {
              draftText = this.baselineText || '';
            }
            draftText += `\n\n[Proposed Addition - ${gap.name || gap.observation}]:\n${clauseText}`;
            this.saveActiveDraft(docId, draftText);

            // 3. Remove recommended card from UI
            this.analysisResults.gaps = this.analysisResults.gaps.filter(g => g.id !== cid);
            alert("Upgrade recommendation staged to Proposed Changes Queue. Review in Redline Review.");
          } else {
            // Dismiss - remove card
            this.analysisResults.gaps = this.analysisResults.gaps.filter(g => g.id !== cid);
          }
          this.render(container);
        });
      });

      // Push to Change Queue buttons
      container.querySelectorAll('.push-cq-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const type = btn.dataset.type;
          const cid = btn.dataset.clauseId;
          const gap = this.analysisResults.gaps.find(g => g.id === cid);
          if (!gap) return;

          const clauseText = this.editedClauses[cid] !== undefined ? this.editedClauses[cid] : (gap.suggestedClause || gap.text);
          const details = {
            sourceDocument: this.state.vaultDocs.find(d => d.id === this.selectedDocId)?.documentName || 'Vault Document',
            confidence: 'high',
            deltaStatus: 'New'
          };

          if (type === 'Control') {
            await this.pushToChangeQueue('Control', `Map mitigating control: ${gap.name || gap.observation}`, clauseText, {
              ...details,
              effectiveness: 'Highly Effective',
              riskId: 'risk-001'
            });
          } else if (type === 'Risk') {
            await this.pushToChangeQueue('Risk', `Compliance Gap: ${(gap.frameworks || []).join('/')} exposure`, `Failure to address requirement: ${gap.rationale}. Recommended clause: ${clauseText}`, {
              ...details,
              category: 'Compliance',
              likelihood: 3,
              impact: 4
            });
          }
        });
      });

      // Navigation buttons to go to Redline Review tab
      container.querySelector('#btn-go-to-redline-review')?.addEventListener('click', () => {
        this.selectTab('redline', container);
      });
      container.querySelector('#btn-go-to-redline')?.addEventListener('click', () => {
        this.selectTab('redline', container);
      });

      // Remove staged changes
      container.querySelectorAll('.btn-remove-staged').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const changeId = btn.dataset.changeId;
          this.removeProposedChange(this.selectedDocId, changeId);
          this.render(container);
        });
      });
    }

    // ─── TAB 6: LANGUAGE REFINEMENT EVENTS ──────────────────────────────────
    if (this.activeSubTab === 'refinement') {
      const refDocSelect = container.querySelector('#refine-doc-select');
      const refProfileSelect = container.querySelector('#refine-profile-select');

      refDocSelect?.addEventListener('change', () => {
        this.selectedDocId = refDocSelect.value;
        this.refinementSuggestions = [];
        this.dismissedRefinements = new Set();
        this.render(container);
      });

      refProfileSelect?.addEventListener('change', () => {
        this.refinementProfile = refProfileSelect.value;
        this.render(container);
      });

      container.querySelectorAll('.refine-cat-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const checked = Array.from(container.querySelectorAll('.refine-cat-checkbox:checked')).map(el => el.value);
          this.refinementCategories = checked;
          this.render(container);
        });
      });

      // Run Refinement Analysis
      container.querySelector('#btn-run-refinement')?.addEventListener('click', async () => {
        const docId = this.selectedDocId;
        if (!docId) {
          alert('Please select a policy document first.');
          return;
        }

        this.isRefining = true;
        this.refinementSuggestions = [];
        this.dismissedRefinements = new Set();
        this.renderSubTabContent(container.querySelector('#tab-body-container'));

        try {
          const policies = await StorageService.getPolicyDocuments();
          const policyDoc = policies.find(p => p.id === docId);
          const vaultDocs = this.state.vaultDocs || [];
          const activeDoc = vaultDocs.find(d => d.id === docId);
          const text = policyDoc?.extracted_text || activeDoc?.documentSummary || '';

          if (!text) {
            alert('No document text found for analysis.');
            return;
          }

          // Simulate brief processing delay for UX
          await new Promise(r => setTimeout(r, 800));

          this.refinementSuggestions = PolicyLanguageService.analyzeDocument(text, {
            categories: this.refinementCategories,
            profile: this.refinementProfile
          });
        } catch (err) {
          console.error('Language refinement analysis failed:', err);
          alert('Language refinement analysis failed.');
        } finally {
          this.isRefining = false;
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        }
      });

      // Accept Individual Refinement — stages to Proposed Changes Queue ONLY
      container.querySelectorAll('.btn-accept-refinement').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const refId = btn.dataset.refId;
          const docId = this.selectedDocId;
          const suggestion = this.refinementSuggestions.find(s => s.id === refId);
          if (!suggestion || !docId) return;

          const catMeta = PolicyLanguageService.CATEGORIES[suggestion.category] || {};
          this.addProposedChange(docId, {
            id: `lang-${refId}`,
            name: `Language Refinement: ${catMeta.label || suggestion.category}`,
            text: `Replace "${suggestion.original}" with "${suggestion.replacement}"`,
            rationale: suggestion.rationale,
            frameworks: [],
            source: 'Language Refinement (Wave 3.5)'
          });

          this.dismissedRefinements.add(refId);
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        });
      });

      // Edit Refinement — opens modal to modify replacement text
      container.querySelectorAll('.btn-edit-refinement').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const refId = btn.dataset.refId;
          const suggestion = this.refinementSuggestions.find(s => s.id === refId);
          if (!suggestion) return;

          const newText = prompt('Edit the proposed replacement text:', suggestion.replacement);
          if (newText !== null && newText.trim() !== '') {
            suggestion.replacement = newText.trim();
            this.renderSubTabContent(container.querySelector('#tab-body-container'));
            this.bindEvents(container);
          }
        });
      });

      // Dismiss Individual Refinement
      container.querySelectorAll('.btn-dismiss-refinement').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const refId = btn.dataset.refId;
          this.dismissedRefinements.add(refId);
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
          this.bindEvents(container);
        });
      });

      // Accept All — stages ALL undismissed refinements to Proposed Changes Queue ONLY
      container.querySelector('#btn-accept-all-refinements')?.addEventListener('click', () => {
        const docId = this.selectedDocId;
        if (!docId) return;

        const active = this.refinementSuggestions.filter(s => !this.dismissedRefinements.has(s.id));
        if (active.length === 0) return;

        active.forEach(suggestion => {
          const catMeta = PolicyLanguageService.CATEGORIES[suggestion.category] || {};
          this.addProposedChange(docId, {
            id: `lang-${suggestion.id}`,
            name: `Language Refinement: ${catMeta.label || suggestion.category}`,
            text: `Replace "${suggestion.original}" with "${suggestion.replacement}"`,
            rationale: suggestion.rationale,
            frameworks: [],
            source: 'Language Refinement (Wave 3.5)'
          });
          this.dismissedRefinements.add(suggestion.id);
        });

        alert(`${active.length} refinement(s) staged to the Proposed Changes queue. Review changes in the Redline Review tab.`);
        this.renderSubTabContent(container.querySelector('#tab-body-container'));
        this.bindEvents(container);
      });

      // Dismiss All
      container.querySelector('#btn-dismiss-all-refinements')?.addEventListener('click', () => {
        const active = this.refinementSuggestions.filter(s => !this.dismissedRefinements.has(s.id));
        active.forEach(s => this.dismissedRefinements.add(s.id));
        this.renderSubTabContent(container.querySelector('#tab-body-container'));
        this.bindEvents(container);
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

    // ─── TAB: GOVERNANCE PACKS EVENTS ────────────────────────────────────
    if (this.activeSubTab === 'packs') {
      const packDomainSelect = container.querySelector('#pack-domain-select');
      packDomainSelect?.addEventListener('change', () => {
        this.packDomain = packDomainSelect.value;
        this.render(container);
      });

      const generatePackBtn = container.querySelector('#generate-pack-btn');
      generatePackBtn?.addEventListener('click', async () => {
        if (this.isGeneratingPack) return;
        this.isGeneratingPack = true;
        
        try {
          const { GovernancePackService } = await import('../services/governancePackService.js');
          const packDef = GovernancePackService.getArtifactDefinitions(this.packDomain || 'bcp', this.selectedFrameworks, this.state.settings || this.genProfile);
          
          this.generatedPack = {
            packName: packDef.packName,
            domain: packDef.domain,
            artifacts: packDef.artifacts.map(a => ({
              ...a,
              status: 'pending', // pending, generating, done, failed, fallback
              documentText: ''
            }))
          };
          
          this.render(container);
          await this.processArtifactsSequential(container);
        } catch (err) {
          console.error("Failed to initialize pack generation:", err);
          alert("Failed to initialize pack generation.");
          this.isGeneratingPack = false;
          this.render(container);
        }
      });

      const saveVaultBtn = container.querySelector('#save-pack-vault-btn');
      saveVaultBtn?.addEventListener('click', async () => {
        if (!this.generatedPack) return;
        // Only save artifacts that actually generated some text
        const validArtifacts = this.generatedPack.artifacts.filter(a => a.documentText && a.documentText.length > 0);
        if (validArtifacts.length === 0) {
          alert("No valid artifacts to save.");
          return;
        }
        try {
          const packToSave = {
            ...this.generatedPack,
            artifacts: validArtifacts
          };
          const { StorageService } = await import('../services/storageService.js');
          await StorageService.saveGovernancePack(packToSave);
          alert(`Governance Pack saved to Vault with ${validArtifacts.length} artifacts!`);
        } catch(err) {
          console.error("Failed to save pack to vault:", err);
          alert("Failed to save pack to vault.");
        }
      });

      // Artifact-specific actions
      container.querySelectorAll('.regenerate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const idx = parseInt(e.target.dataset.idx);
          if (this.isGeneratingPack) return;
          this.isGeneratingPack = true;
          this.generatedPack.artifacts[idx].status = 'generating';
          this.generatedPack.artifacts[idx].documentText = '';
          this.render(container);
          await this.generateSingleArtifact(idx, container);
          this.isGeneratingPack = false;
          this.render(container);
        });
      });

      container.querySelectorAll('.fallback-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          this.generatedPack.artifacts[idx].status = 'fallback';
          this.generatedPack.artifacts[idx].documentText = this.generatedPack.artifacts[idx].fallbackText;
          this.render(container);
        });
      });

      const retryFailedBtn = container.querySelector('#retry-failed-btn');
      retryFailedBtn?.addEventListener('click', async () => {
        if (this.isGeneratingPack) return;
        this.isGeneratingPack = true;
        this.render(container);
        
        for (let i = 0; i < this.generatedPack.artifacts.length; i++) {
          if (this.generatedPack.artifacts[i].status === 'failed') {
            this.generatedPack.artifacts[i].status = 'generating';
            this.render(container);
            await this.generateSingleArtifact(i, container);
          }
        }
        
        this.isGeneratingPack = false;
        this.render(container);
      });

      container.querySelectorAll('.pack-preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          this.packPreviewIndex = idx;
          this.render(container);
        });
      });

      container.querySelectorAll('.pack-export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          const artifact = this.generatedPack.artifacts[idx];
          const blob = new Blob([artifact.documentText], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${artifact.title.replace(/\s+/g, '_')}.md`;
          a.click();
          URL.revokeObjectURL(url);
        });
      });

      const closePackModalBtn = container.querySelector('#close-pack-modal');
      closePackModalBtn?.addEventListener('click', () => {
        this.packPreviewIndex = null;
        this.render(container);
      });
    }
  }

  async processArtifactsSequential(container) {
    for (let i = 0; i < this.generatedPack.artifacts.length; i++) {
      if (!this.isGeneratingPack) break; // If user somehow cancelled
      const artifact = this.generatedPack.artifacts[i];
      if (artifact.status === 'pending') {
        artifact.status = 'generating';
        this.render(container);
        await this.generateSingleArtifact(i, container);
      }
    }
    this.isGeneratingPack = false;
    this.render(container);
  }

  async generateSingleArtifact(index, container) {
    const artifact = this.generatedPack.artifacts[index];
    const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
    
    if (artifact.isDeterministic) {
      artifact.documentText = artifact.fallbackText;
      artifact.status = 'done';
      this.render(container);
      return;
    }

    try {
      const { AIService } = await import('../services/aiService.js');
      artifact.documentText = await AIService.queryGemini(artifact.prompt, apiKey);
      artifact.status = 'done';
    } catch (err) {
      console.warn(`Artifact ${artifact.title} failed, retrying once...`, err);
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const { AIService } = await import('../services/aiService.js');
        artifact.documentText = await AIService.queryGemini(artifact.prompt, apiKey);
        artifact.status = 'done';
      } catch (retryErr) {
        console.error(`Artifact ${artifact.title} failed on retry.`, retryErr);
        artifact.status = 'failed';
        // Auto fallback
        artifact.documentText = artifact.fallbackText;
        artifact.status = 'fallback';
      }
    }
    this.render(container);
  }

  renderGovernancePacksTab() {
    let packCards = '';
    let hasFailed = false;

    if (this.generatedPack && this.generatedPack.artifacts) {
      this.generatedPack.artifacts.forEach((artifact, index) => {
        let statusBadge = '';
        let controls = '';
        
        if (artifact.status === 'pending') {
          statusBadge = `<span style="font-size:12px; color:var(--text-muted);">⏳ Pending</span>`;
        } else if (artifact.status === 'generating') {
          statusBadge = `<span style="font-size:12px; color:var(--color-blue);"><svg class="spinner" viewBox="0 0 50 50" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"><circle></svg> Generating...</span>`;
        } else if (artifact.status === 'done') {
          statusBadge = `<span style="font-size:12px; color:var(--color-green);">✅ Done</span>`;
          controls = `
            <button class="btn btn-secondary pack-preview-btn" data-idx="${index}">Preview</button>
            <button class="btn btn-secondary pack-export-btn" data-idx="${index}">Export</button>
            <button class="btn btn-secondary regenerate-btn" data-idx="${index}">Regenerate</button>
          `;
        } else if (artifact.status === 'fallback') {
          statusBadge = `<span style="font-size:12px; color:var(--color-orange);">⚠️ Fallback Used</span>`;
          controls = `
            <button class="btn btn-secondary pack-preview-btn" data-idx="${index}">Preview</button>
            <button class="btn btn-secondary pack-export-btn" data-idx="${index}">Export</button>
            <button class="btn btn-secondary regenerate-btn" data-idx="${index}">Regenerate</button>
          `;
        } else if (artifact.status === 'failed') {
          hasFailed = true;
          statusBadge = `<span style="font-size:12px; color:var(--color-red);">❌ Failed</span>`;
          controls = `
            <button class="btn btn-secondary regenerate-btn" data-idx="${index}">Retry</button>
            <button class="btn btn-secondary fallback-btn" data-idx="${index}">Use Fallback</button>
          `;
        }

        packCards += `
          <div class="glass-panel" style="margin-bottom:15px; padding:15px; border-left:4px solid ${artifact.status === 'fallback' ? 'var(--color-orange)' : artifact.status === 'failed' ? 'var(--color-red)' : artifact.status === 'done' ? 'var(--color-green)' : 'var(--color-indigo)'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="display:flex; align-items:center; gap: 10px;">
                <h3 style="margin:0; font-size:16px;">${artifact.title}</h3>
                <span style="font-size:11px; font-weight:normal; color:var(--text-muted); background:var(--background-alt); padding:2px 6px; border-radius:4px;">${artifact.artifactType}</span>
                ${statusBadge}
              </div>
              <div style="display:flex; gap:8px;">
                ${controls}
              </div>
            </div>
            ${artifact.documentText ? `<p style="margin:0; font-size:13px; color:var(--text-secondary);">${artifact.documentText.substring(0, 120)}...</p>` : ''}
          </div>
        `;
      });
    }

    return `
      <div class="glass-panel" style="margin-bottom: 20px;">
        <h2 style="margin-bottom: 15px;">Governance Packs Orchestration</h2>
        <p style="color:var(--text-secondary); margin-bottom: 20px;">Generate a complete, interconnected governance system artifact-by-artifact to ensure maximum reliability.</p>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Select Domain Pack</label>
          <select class="form-select" id="pack-domain-select">
            <option value="bcp" ${this.packDomain === 'bcp' ? 'selected' : ''}>Business Continuity Governance Pack</option>
            <option value="ir" ${this.packDomain === 'ir' ? 'selected' : ''}>Incident Response Governance Pack</option>
            <option value="vendor" ${this.packDomain === 'vendor' ? 'selected' : ''}>Vendor Risk Governance Pack</option>
          </select>
        </div>

        <div style="display:flex; gap:10px; margin-bottom: 20px;">
          <button class="btn btn-primary" id="generate-pack-btn" ${this.isGeneratingPack ? 'disabled' : ''}>
            ${this.isGeneratingPack ? '<svg class="spinner" viewBox="0 0 50 50" style="width:16px;height:16px;vertical-align:middle;margin-right:8px;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"><circle></svg> Orchestrating Pack...' : 'Generate Full Pack'}
          </button>
          ${this.generatedPack && !this.isGeneratingPack ? `<button class="btn btn-secondary" id="save-pack-vault-btn">Save Pack to Vault</button>` : ''}
          ${hasFailed && !this.isGeneratingPack ? `<button class="btn btn-secondary" id="retry-failed-btn" style="color:var(--color-red); border-color:var(--color-red);">Regenerate Failed</button>` : ''}
        </div>
      </div>
      
      ${this.generatedPack ? `
        <div class="pack-artifacts-container">
          <h2 style="margin-bottom: 15px;">Generated Artifacts (${this.generatedPack.artifacts.length})</h2>
          ${packCards}
        </div>
      ` : ''}

      <!-- Pack Preview Modal -->
      ${this.packPreviewIndex !== undefined && this.packPreviewIndex !== null ? `
        <div class="modal" style="display:block; background:rgba(0,0,0,0.5); position:fixed; top:0; left:0; width:100%; height:100%; z-index:1000; padding:40px;">
          <div class="glass-panel" style="max-width:900px; margin:0 auto; max-height:80vh; overflow-y:auto; position:relative;">
            <button class="btn btn-secondary" id="close-pack-modal" style="position:absolute; top:20px; right:20px;">Close</button>
            <h2 style="margin-top:0;">${this.generatedPack.artifacts[this.packPreviewIndex].title} <span style="font-size:12px; font-weight:normal; color:${this.generatedPack.artifacts[this.packPreviewIndex].status === 'fallback' ? 'var(--color-orange)' : 'var(--text-muted)'}; background:var(--background-alt); padding:2px 6px; border-radius:4px; margin-left:8px;">${this.generatedPack.artifacts[this.packPreviewIndex].status === 'fallback' ? '⚠️ Fallback' : 'AI Generated'}</span></h2>
            <div style="font-family:monospace; white-space:pre-wrap; font-size:13px; color:var(--text-secondary); margin-top:20px; padding:15px; background:var(--background-alt); border-radius:6px;">${this.generatedPack.artifacts[this.packPreviewIndex].documentText}</div>
          </div>
        </div>
      ` : ''}
    `;
  }
}
