import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';
import { DocumentExtractionService } from '../services/documentExtractionService.js';
import { PolicyTemplateService } from '../services/policyTemplateService.js';

const RISK_CATEGORIES = [
  'Strategic', 'Operational', 'Financial', 'Technology', 'Compliance',
  'Reputational', 'People', 'Legal', 'Cyber', 'Market'
];

export class IntelligencePolicyComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;

    // Sub-tab coordinator: 'upload' | 'queue' | 'vault' | 'ask' | 'generator' | 'upgrade' | 'versions'
    this.activeSubTab = 'upload'; 

    // Intake/Upload State
    this.uploadState = 'idle'; // 'idle' | 'reading' | 'extracting' | 'review' | 'applying' | 'done' | 'error'
    this.currentFile = null;
    this.extractedText = '';
    this.segmentCount = 1;
    this.extractionResult = null;
    this.extractionError = null;
    this.itemDecisions = {}; // id -> 'accepted' | 'dismissed' | 'editing' | 'pending'
    this.editValues = {}; // id -> { title, likelihood, impact, category, owner }

    // Change Queue State
    this.changeQueue = [];
    this.queueFilter = 'All';

    // Vault State
    this.vaultEntries = [];
    this.vaultSearch = '';

    // Ask Documents State
    this.selectedDocIds = [];
    this.allDocsSelected = true;
    this.policyQuery = '';
    this.policyQALoading = false;
    this.sessionQuestions = [];
    this.activeQuestion = null;
    this.debugMode = false;
    this.evidenceExpanded = false;
    this.sessionMetrics = {
      questionsAsked: 0,
      questionsBypassed: 0,
      questionsAnswered: 0,
      noEvidenceResponses: 0,
      weakRetrievals: 0
    };

    // Policy Generator State
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
    this.selectedDocId = ''; // selected doc for gap audit
    this.targetFramework = 'dpdp';
    this.isAnalyzing = false;
    this.analysisResults = null;
    this.expandedClauseId = null;
    this.policyStudioDecisions = {}; // clauseId -> 'pending'|'accepted'|'dismissed'
    this.editedClauses = {}; // clauseId -> text

    // Publishing / Version State
    this.reviewSummary = '';
    this.isPublishing = false;

    // Loaded datasets
    this.policyDocs = [];
    this.policyChunks = [];
    this._container = null;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ─── DATA LOADING ─────────────────────────────────────────────────────────
  async loadData() {
    try {
      this.changeQueue = await StorageService.getChangeQueue();
    } catch (e) {
      this.changeQueue = [];
    }
    try {
      this.vaultEntries = await StorageService.getDocumentVault();
    } catch (e) {
      this.vaultEntries = [];
    }
    try {
      this.policyDocs = await StorageService.getPolicyDocuments();
    } catch (e) {
      this.policyDocs = [];
    }
    try {
      this.policyChunks = await StorageService.getPolicyChunks();
    } catch (e) {
      this.policyChunks = [];
    }
    this.resyncSelection();
  }

  resyncSelection() {
    const activeDocs = this.getActiveWorkspaceDocs();
    const activeDocIds = activeDocs.map(d => d.id);
    if (!this.selectedDocIds || this.selectedDocIds.length === 0) {
      this.selectedDocIds = activeDocIds;
      this.allDocsSelected = true;
    } else {
      this.selectedDocIds = this.selectedDocIds.filter(id => activeDocIds.includes(id));
      if (this.selectedDocIds.length === 0 && activeDocIds.length > 0) {
        this.selectedDocIds = activeDocIds;
        this.allDocsSelected = true;
      } else {
        this.allDocsSelected = this.selectedDocIds.length === activeDocIds.length;
      }
    }
  }

  getActiveWorkspaceDocs() {
    const processedVaultDocs = (this.vaultEntries || []).filter(d => 
      d.status === 'fully_processed' || d.status === 'partially_processed' || d.status === 'Ready'
    );

    const filteredDocs = processedVaultDocs.filter(d => {
      const matchedPolicy = (this.policyDocs || []).find(p => p.id === d.id);
      if (!matchedPolicy) return false;
      
      const hasChunks = (this.policyChunks || []).some(c => c.document_id === d.id);
      return hasChunks;
    });

    const hasRealDocs = filteredDocs.some(d => !d.is_demo);
    const docs = hasRealDocs ? filteredDocs.filter(d => !d.is_demo) : filteredDocs;

    return docs.map(d => {
      let title = d.documentName || 'Untitled Document';
      if (!hasRealDocs && d.is_demo) {
        title = `[Demo] ${title}`;
      }
      
      let status = 'Ready';
      if (d.status === 'Processing' || d.status === 'Failed') {
        status = d.status;
      }

      let tags = [];
      if (d.documentType) {
        const matchedPolicy = (this.policyDocs || []).find(p => p.id === d.id);
        if (matchedPolicy && matchedPolicy.framework_tags) {
          tags = matchedPolicy.framework_tags;
        } else if (d.extractedCounts) {
          tags = Object.keys(d.extractedCounts).filter(k => d.extractedCounts[k] > 0);
        }
      }

      return {
        id: d.id,
        title,
        document_type: d.documentType || 'Other',
        status,
        created_at: d.uploadDate,
        framework_tags: tags,
        is_demo: !!d.is_demo
      };
    });
  }

  getActiveWorkspaceChunksCount() {
    const activeDocs = this.getActiveWorkspaceDocs();
    const activeDocIds = activeDocs.map(d => d.id);
    return (this.policyChunks || []).filter(c => activeDocIds.includes(c.document_id)).length;
  }

  getSelectedDocNamesSummary() {
    const activeDocs = this.getActiveWorkspaceDocs();
    if (activeDocs.length === 0) return 'None';
    if (this.selectedDocIds.length === activeDocs.length) return 'All Documents';
    if (this.selectedDocIds.length === 1) {
      const doc = activeDocs.find(d => d.id === this.selectedDocIds[0]);
      return doc ? doc.title : '1 Document';
    }
    return `${this.selectedDocIds.length} Documents`;
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

  // ─── RENDER COORDINATION ──────────────────────────────────────────────────
  render(container) {
    this._container = container;
    container.innerHTML = this.renderShell();
    this.loadData().then(() => {
      this.renderBody();
      this.bindEvents(container);
    });
  }

  renderShell() {
    const pendingCount = this.changeQueue.filter(i => i.decision === 'pending' || !i.decision).length;
    
    return `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Governance Control Desk</span>
          <h1>Policy Intelligence Studio</h1>
          <p class="page-subtitle">Ingest, audit, draft, query, and enforce alignment of corporate policies against GRC frameworks and risk registers.</p>
        </div>
      </div>

      <!-- HORIZONTAL SUB-TAB NAVIGATION -->
      <div class="subtab-strip no-print" style="display:flex;gap:4px;border-bottom:1px solid var(--border-color);margin-bottom:20px;padding-bottom:1px;flex-wrap:nowrap;overflow-x:auto;">
        <button class="subtab-btn ${this.activeSubTab === 'upload' ? 'active' : ''}" data-subtab="upload" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'upload' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'upload' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Upload &amp; Extract
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'queue' ? 'active' : ''}" data-subtab="queue" id="tab-btn-queue" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'queue' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'queue' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;display:flex;align-items:center;gap:6px;">
          Change Queue ${pendingCount > 0 ? `<span class="status-badge above" style="font-size:9px;padding:1px 5px;border-radius:10px;line-height:1;">${pendingCount}</span>` : ''}
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'vault' ? 'active' : ''}" data-subtab="vault" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'vault' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'vault' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Document Vault
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'ask' ? 'active' : ''}" data-subtab="ask" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'ask' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'ask' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Ask Documents
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'generator' ? 'active' : ''}" data-subtab="generator" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'generator' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Policy Library &amp; Generator
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'upgrade' ? 'active' : ''}" data-subtab="upgrade" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'upgrade' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Upgrade Wizard &amp; Gaps
        </button>
        <button class="subtab-btn ${this.activeSubTab === 'versions' ? 'active' : ''}" data-subtab="versions" style="background:none;border:none;padding:10px 16px;font-size:12px;font-weight:600;color:${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'var(--color-navy-secondary)'};border-bottom:2px solid ${this.activeSubTab === 'versions' ? 'var(--color-indigo)' : 'transparent'};cursor:pointer;">
          Approved Versions
        </button>
      </div>

      <!-- MAIN DISPLAY AREA -->
      <div id="intelligence-policy-body" class="policy-studio-body"></div>
    `;
  }

  renderBody() {
    const body = this._container.querySelector('#intelligence-policy-body');
    if (!body) return;

    let currentInputVal = '';
    if (this.activeSubTab === 'ask') {
      const input = body.querySelector('#policy-qa-input');
      if (input) currentInputVal = input.value;
    }

    if (this.activeSubTab === 'upload') {
      body.innerHTML = this.renderUploadTab();
    } else if (this.activeSubTab === 'queue') {
      body.innerHTML = this.renderQueueTab();
    } else if (this.activeSubTab === 'vault') {
      body.innerHTML = this.renderVaultTab();
    } else if (this.activeSubTab === 'ask') {
      body.innerHTML = this.renderAskTab();
    } else if (this.activeSubTab === 'generator') {
      body.innerHTML = this.renderGeneratorTab();
    } else if (this.activeSubTab === 'upgrade') {
      body.innerHTML = this.renderUpgradeTab();
    } else if (this.activeSubTab === 'versions') {
      body.innerHTML = this.renderVersionsTab();
    }

    if (this.activeSubTab === 'ask' && currentInputVal) {
      const input = body.querySelector('#policy-qa-input');
      if (input) input.value = currentInputVal;
    }
  }

  // ─── EMPTY STATE RENDERER ─────────────────────────────────────────────────
  renderEmptyState(icon, title, desc, ctaLabel = '', ctaActionId = '') {
    return `
      <div class="empty-state-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; margin: 20px 0;">
        <div class="empty-state-icon" style="font-size: 44px; margin-bottom: 16px; color: var(--color-indigo);">${icon}</div>
        <h3 style="font-size: 16px; font-weight: 700; color: var(--color-navy); margin-bottom: 8px;">${title}</h3>
        <p style="font-size: 13px; color: var(--color-navy-secondary); max-width: 400px; margin-bottom: 20px; line-height: 1.5;">${desc}</p>
        ${ctaLabel ? `<button class="btn btn-primary" id="${ctaActionId}">${ctaLabel}</button>` : ''}
      </div>
    `;
  }

  // ─── TAB 1: UPLOAD & EXTRACT ──────────────────────────────────────────────
  renderUploadTab() {
    if (this.uploadState === 'idle') return this.renderDropzone();
    if (this.uploadState === 'reading') return this.renderProcessing('Reading document...', 'Parsing file contents before sending to AI');
    if (this.uploadState === 'extracting') return this.renderProcessing('Extracting risk intelligence...', `Analysing with Gemini AI${this.segmentCount > 1 ? ` · Large document: processing in ${this.segmentCount} segments` : ''}`);
    if (this.uploadState === 'review') return this.renderReview();
    if (this.uploadState === 'applying') return this.renderProcessing('Writing to register...', 'Saving approved items to the risk register');
    if (this.uploadState === 'done') return this.renderDone();
    if (this.uploadState === 'error') return this.renderError();
    return this.renderDropzone();
  }

  renderDropzone() {
    return `
      <div class="glass-panel" style="padding: 40px 20px; text-align: center;">
        <div class="intake-dropzone" id="intake-dropzone" style="border: 2px dashed var(--color-indigo); background: var(--color-indigo-light); border-radius: 8px; padding: 40px 20px; cursor: pointer; transition: all 0.2s;">
          <div class="dropzone-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:48px;height:48px;color:var(--color-indigo);margin:0 auto 16px;display:block;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 style="font-size:16px;font-weight:700;color:var(--color-navy);margin-bottom:8px;">Drag &amp; drop a policy document here</h3>
            <p style="font-size:13px;color:var(--color-navy-secondary);margin-bottom:20px;">or click to browse your files</p>
            <input type="file" id="intake-file-input" accept=".pdf,.xlsx,.xls,.csv,.docx" style="display:none;">
            <label for="intake-file-input" class="btn btn-primary" style="cursor:pointer;">Choose File</label>
            <p style="font-size:11px;color:var(--color-navy-secondary);margin-top:16px;">Supported formats: PDF (text-based), Word (.docx), Excel (.xlsx, .xls), CSV</p>
            <p style="font-size:11px;color:var(--color-navy-secondary);opacity:0.8;">Note: Scanned PDFs require selectable text overlay to extract.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderProcessing(title, subtitle) {
    return `
      <div class="glass-panel" style="padding:60px 20px;text-align:center;">
        <div class="intake-spinner" style="border: 4px solid var(--color-indigo-light); border-top: 4px solid var(--color-indigo); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 style="font-size:16px;font-weight:700;color:var(--color-navy);margin:20px 0 8px;">${title}</h3>
        <p style="font-size:13px;color:var(--color-navy-secondary);">${subtitle}</p>
      </div>
    `;
  }

  renderError() {
    return `
      <div class="glass-panel" style="padding:40px 20px;text-align:center;">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--color-critical-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:24px;height:24px;color:var(--color-critical);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:var(--color-critical);margin-bottom:8px;">Extraction Failed</h3>
        <p style="font-size:13px;color:var(--color-navy-secondary);max-width:440px;margin:0 auto 20px;">${this.extractionError || 'An unknown error occurred.'}</p>
        <button class="btn btn-secondary" id="btn-reset-upload">Try Another Document</button>
      </div>
    `;
  }

  renderDone() {
    const accepted = Object.values(this.itemDecisions).filter(d => d === 'accepted').length;
    const dismissed = Object.values(this.itemDecisions).filter(d => d === 'dismissed').length;
    return `
      <div class="glass-panel" style="padding:40px 20px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(0,184,156,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:28px;height:28px;color:var(--color-indigo);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:var(--color-navy);margin-bottom:8px;">Changes Applied Successfully</h3>
        <div style="display:flex;gap:20px;justify-content:center;margin:16px 0;">
          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--color-indigo);">${accepted}</div>
            <div style="font-size:11px;color:var(--color-navy-secondary);">Items Accepted</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--color-navy-secondary);">${dismissed}</div>
            <div style="font-size:11px;color:var(--color-navy-secondary);">Items Dismissed</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--color-navy-secondary);margin-bottom:20px;">Document saved to vault. Unreviewed items added to Change Queue.</p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button class="btn btn-primary" id="btn-reset-upload">Upload Another Document</button>
          <button class="btn btn-secondary" id="btn-go-queue">View Change Queue</button>
          <button class="btn btn-secondary" id="btn-go-vault">View Document Vault</button>
        </div>
      </div>
    `;
  }

  renderReview() {
    const result = this.extractionResult;
    if (!result) return this.renderDropzone();

    const risks = result.extracted_risks || [];
    const controls = result.extracted_controls || [];
    const policies = result.extracted_policies || [];
    const actions = result.extracted_actions || [];
    const gaps = result.gaps_detected || [];

    const allItems = [
      ...risks.map(r => ({ ...r, itemType: 'Risk' })),
      ...controls.map(c => ({ ...c, itemType: 'Control' })),
      ...policies.map(p => ({ ...p, title: p.policy_name, itemType: 'Policy' })),
      ...actions.map(a => ({ ...a, itemType: 'Action' })),
      ...gaps.map(g => ({ ...g, title: g.description, itemType: 'Gap' }))
    ];

    const counts = { New: 0, Update: 0, Duplicate: 0, Conflict: 0 };
    allItems.forEach(i => { if (counts[i.deltaStatus] !== undefined) counts[i.deltaStatus]++; });

    const acceptedCount = Object.values(this.itemDecisions).filter(d => d === 'accepted').length;

    const segNote = this.segmentCount > 1
      ? `<div style="background:var(--color-indigo-light);border:1px solid rgba(0,184,156,0.2);border-radius:6px;padding:8px 12px;font-size:11px;color:var(--color-indigo-hover);margin-bottom:12px;">⚡ Large document — processed in ${this.segmentCount} segments. Results merged and deduplicated.</div>`
      : '';

    return `
      ${segNote}

      <!-- Summary Card -->
      <div class="glass-panel" style="margin-bottom:16px;padding:18px 20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="status-badge within" style="font-size:10px;">${result.document_type || 'Unknown'}</span>
              <span style="font-size:11px;color:var(--color-navy-secondary);">from: <strong>${this.currentFile?.name || 'Document'}</strong></span>
            </div>
            <p style="font-size:12px;color:var(--color-navy-secondary);line-height:1.5;max-width:500px;margin:0;">${result.document_summary || 'No summary available.'}</p>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--color-navy);">${risks.length}</div><div style="font-size:10px;color:var(--color-navy-secondary);">Risks</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--color-navy);">${controls.length}</div><div style="font-size:10px;color:var(--color-navy-secondary);">Controls</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--color-navy);">${actions.length}</div><div style="font-size:10px;color:var(--color-navy-secondary);">Actions</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--color-navy);">${gaps.length}</div><div style="font-size:10px;color:var(--color-navy-secondary);">Gaps</div></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);flex-wrap:wrap;">
          <span style="background:var(--color-indigo-light);color:var(--color-indigo-hover);border:1px solid rgba(0,184,156,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟢 ${counts.New} New</span>
          <span style="background:var(--color-warning-bg);color:var(--color-warning);border:1px solid rgba(239,159,39,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟡 ${counts.Update} Updates</span>
          <span style="background:var(--bg-tertiary);color:var(--color-navy-secondary);border:1px solid var(--border-color);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">⚪ ${counts.Duplicate} Duplicates</span>
          <span style="background:var(--color-critical-bg);color:var(--color-critical);border:1px solid rgba(226,75,74,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🔴 ${counts.Conflict} Conflicts</span>
        </div>
      </div>

      <!-- Batch Actions Bar -->
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
        <button class="btn btn-secondary btn-small" id="btn-select-all">Select All</button>
        <button class="btn btn-secondary btn-small" id="btn-accept-high">Accept All High Confidence</button>
        <button class="btn btn-secondary btn-small" id="btn-dismiss-dupes">Dismiss All Duplicates</button>
        <div style="flex:1;"></div>
        <span style="font-size:11px;color:var(--color-navy-secondary);">${acceptedCount} items accepted</span>
      </div>

      <!-- Review Table -->
      <div class="glass-panel" style="padding:0;overflow:hidden;margin-bottom:16px;">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);background:rgba(0,0,0,0.02);">
                <th style="padding:10px 12px;text-align:left;width:32px;"><input type="checkbox" id="chk-all" /></th>
                <th style="padding:10px 12px;text-align:left;width:80px;">Type</th>
                <th style="padding:10px 12px;text-align:left;">Item</th>
                <th style="padding:10px 12px;text-align:left;width:100px;">Delta</th>
                <th style="padding:10px 12px;text-align:left;width:90px;">Confidence</th>
                <th style="padding:10px 12px;text-align:right;width:200px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${allItems.map(item => this.renderReviewRow(item)).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Apply Button -->
      <div style="text-align:right;">
        <button class="btn btn-primary" id="btn-apply-changes" ${acceptedCount === 0 ? 'disabled' : ''}>
          Apply Approved Changes (${acceptedCount} item${acceptedCount !== 1 ? 's' : ''})
        </button>
      </div>
    `;
  }

  renderReviewRow(item) {
    const decision = this.itemDecisions[item.id] || 'pending';
    const isEditing = decision === 'editing';
    const isAccepted = decision === 'accepted';
    const isDismissed = decision === 'dismissed';
    const isConflict = item.deltaStatus === 'Conflict';

    const deltaBadge = {
      New: '<span style="background:var(--color-indigo-light);color:var(--color-indigo-hover);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">New</span>',
      Update: '<span style="background:var(--color-warning-bg);color:var(--color-warning);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:var(--bg-tertiary);color:var(--color-navy-secondary);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:var(--color-critical-bg);color:var(--color-critical);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Conflict</span>'
    }[item.deltaStatus] || '';

    const confColor = { high: 'var(--color-indigo-hover)', medium: 'var(--color-warning)', low: 'var(--color-navy-secondary)' }[item.confidence] || 'var(--color-navy-secondary)';

    const editValues = this.editValues[item.id] || {};
    const displayTitle = editValues.title || item.title || '—';
    const displayDesc = item.description || item.linked_risk_hint || (item.appetite_statements || []).join('; ') || item.source_reference || '';

    const rowStyle = isDismissed ? 'opacity:0.4;' : isAccepted ? 'background:rgba(0,184,156,0.03);' : '';

    const editForm = isEditing ? this.renderEditForm(item) : '';

    const actionBtns = isConflict
      ? `<span style="font-size:10px;color:var(--color-critical);font-weight:600;">Resolve Required</span>
         <button class="btn btn-secondary btn-small" style="font-size:10px;" data-action="accept" data-id="${item.id}">Accept Anyway</button>
         <button class="btn btn-secondary btn-small" style="font-size:10px;" data-action="dismiss" data-id="${item.id}">Dismiss</button>`
      : `<button class="btn btn-secondary btn-small ${isAccepted ? 'active' : ''}" style="font-size:10px;" data-action="accept" data-id="${item.id}">${isAccepted ? '✓ Accepted' : 'Accept'}</button>
         ${item.itemType !== 'Gap' ? `<button class="btn btn-secondary btn-small" style="font-size:10px;" data-action="edit" data-id="${item.id}">${isEditing ? 'Cancel Edit' : 'Edit'}</button>` : ''}
         <button class="btn btn-secondary btn-small" style="font-size:10px;" data-action="dismiss" data-id="${item.id}">${isDismissed ? 'Restore' : 'Dismiss'}</button>`;

    return `
      <tr style="border-bottom:1px solid var(--border-color);${rowStyle}" data-row-id="${item.id}">
        <td style="padding:10px 12px;">
          <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${isAccepted ? 'checked' : ''} ${isDismissed ? 'disabled' : ''} />
        </td>
        <td style="padding:10px 12px;">
          <span style="background:var(--color-slate-light);color:var(--color-slate);padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;">${item.itemType}</span>
        </td>
        <td style="padding:10px 12px;">
          <div style="font-weight:600;color:var(--color-navy);margin-bottom:2px;">${displayTitle}</div>
          ${displayDesc ? `<div style="font-size:11px;color:var(--color-navy-secondary);line-height:1.4;">${displayDesc.slice(0, 120)}${displayDesc.length > 120 ? '...' : ''}</div>` : ''}
          ${item.source_reference && item.itemType !== 'Gap' ? `<div style="font-size:10px;color:var(--color-navy-secondary);opacity:0.8;margin-top:2px;">📄 Ref: ${item.source_reference}</div>` : ''}
          ${editForm}
        </td>
        <td style="padding:10px 12px;">${deltaBadge}</td>
        <td style="padding:10px 12px;">
          <span style="font-size:11px;font-weight:600;color:${confColor};text-transform:capitalize;">${item.confidence || 'low'}</span>
        </td>
        <td style="padding:10px 12px;text-align:right;">
          <div style="display:flex;gap:4px;justify-content:flex-end;flex-wrap:wrap;">${actionBtns}</div>
        </td>
      </tr>
    `;
  }

  renderEditForm(item) {
    const vals = this.editValues[item.id] || {};
    const isRisk = item.itemType === 'Risk';
    if (isRisk) {
      return `
        <div style="margin-top:10px;padding:12px;background:var(--bg-tertiary);border-radius:6px;border:1px solid var(--border-color);" data-edit-form="${item.id}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div>
              <label style="font-size:10px;color:var(--color-navy-secondary);display:block;margin-bottom:3px;">Title</label>
              <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="title" data-id="${item.id}" value="${vals.title || item.title || ''}">
            </div>
            <div>
              <label style="font-size:10px;color:var(--color-navy-secondary);display:block;margin-bottom:3px;">Owner</label>
              <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="owner" data-id="${item.id}" value="${vals.owner || item.owner || ''}">
            </div>
            <div>
              <label style="font-size:10px;color:var(--color-navy-secondary);display:block;margin-bottom:3px;">Category</label>
              <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="category" data-id="${item.id}">
                ${RISK_CATEGORIES.map(c => `<option value="${c}" ${(vals.category || item.category) === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <label style="font-size:10px;color:var(--color-navy-secondary);display:block;margin-bottom:3px;">Likelihood (1-5)</label>
                <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="likelihood" data-id="${item.id}">
                  ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(vals.likelihood || item.likelihood) === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px;color:var(--color-navy-secondary);display:block;margin-bottom:3px;">Impact (1-5)</label>
                <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="impact" data-id="${item.id}">
                  ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(vals.impact || item.impact) === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div style="margin-top:8px;" data-edit-form="${item.id}">
        <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="title" data-id="${item.id}" value="${vals.title || item.title || ''}">
      </div>
    `;
  }

  // ─── TAB 2: CHANGE QUEUE ──────────────────────────────────────────────────
  renderQueueTab() {
    const filters = ['All', 'New Risks', 'Updates', 'Conflicts', 'Gaps', 'High Confidence Only'];
    let items = this.changeQueue || [];

    if (this.queueFilter === 'New Risks') items = items.filter(i => i.deltaStatus === 'New' && i.itemType === 'Risk');
    else if (this.queueFilter === 'Updates') items = items.filter(i => i.deltaStatus === 'Update');
    else if (this.queueFilter === 'Conflicts') items = items.filter(i => i.deltaStatus === 'Conflict');
    else if (this.queueFilter === 'Gaps') items = items.filter(i => i.itemType === 'Gap');
    else if (this.queueFilter === 'High Confidence Only') items = items.filter(i => i.confidence === 'high');

    const conflicts = items.filter(i => i.deltaStatus === 'Conflict');
    const rest = items.filter(i => i.deltaStatus !== 'Conflict');
    const sorted = [...conflicts, ...rest];
    const pending = sorted.filter(i => !i.decision || i.decision === 'pending');

    if (this.changeQueue.length === 0) {
      return this.renderEmptyState(
        '📂',
        'Your change queue is empty',
        'All AI-extracted entities and policy recommendations have been successfully integrated or dismissed.',
        'Upload a policy document to extract more',
        'btn-go-upload-subtab'
      );
    }

    return `
      <!-- Filter Bar -->
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
        ${filters.map(f => `
          <button class="btn btn-secondary btn-small queue-filter-btn ${this.queueFilter === f ? 'active' : ''}" data-filter="${f}" style="font-size:10px;">${f}</button>
        `).join('')}
        <div style="flex:1;"></div>
        <button class="btn btn-primary btn-small" id="btn-apply-queue" ${pending.filter(i => i.decision === 'accepted').length === 0 ? 'disabled' : ''}>
          Apply All Accepted
        </button>
      </div>

      <!-- Batch Actions -->
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <button class="btn btn-secondary btn-small" id="btn-queue-accept-selected">Accept Selected</button>
        <button class="btn btn-secondary btn-small" id="btn-queue-dismiss-selected">Dismiss Selected</button>
      </div>

      <!-- Items -->
      ${sorted.length === 0 ? `<div class="glass-panel" style="padding:30px;text-align:center;"><p style="color:var(--color-navy-secondary);font-size:13px;">No items match the selected filter.</p></div>` : ''}
      ${this.renderQueueGroups(sorted)}
    `;
  }

  renderQueueGroups(items) {
    const groups = {};
    for (const item of items) {
      const src = item.sourceDocument || 'Unknown Document';
      if (!groups[src]) groups[src] = [];
      groups[src].push(item);
    }

    return Object.entries(groups).map(([docName, groupItems]) => `
      <div class="glass-panel" style="padding:0;overflow:hidden;margin-bottom:16px;">
        <div style="padding:12px 16px;background:var(--bg-tertiary);border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="font-size:12px;font-weight:700;color:var(--color-navy);">${docName}</span>
            <span style="font-size:11px;color:var(--color-navy-secondary);margin-left:8px;">${groupItems.length} recommendation${groupItems.length !== 1 ? 's' : ''}</span>
          </div>
          <span style="font-size:10px;color:var(--color-navy-secondary);">${groupItems[0]?.uploadDate ? new Date(groupItems[0].uploadDate).toLocaleDateString('en-IN') : ''}</span>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);">
                <th style="padding:8px 12px;text-align:left;width:32px;"><input type="checkbox" class="queue-select-all" /></th>
                <th style="padding:8px 12px;text-align:left;width:80px;">Type</th>
                <th style="padding:8px 12px;text-align:left;">Item</th>
                <th style="padding:8px 12px;text-align:left;width:100px;">Delta</th>
                <th style="padding:8px 12px;text-align:left;width:90px;">Confidence</th>
                <th style="padding:8px 12px;text-align:right;width:160px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${groupItems.map(item => this.renderQueueRow(item)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('');
  }

  renderQueueRow(item) {
    const decision = item.decision || 'pending';
    const isAccepted = decision === 'accepted';
    const isDismissed = decision === 'dismissed';
    const isConflict = item.deltaStatus === 'Conflict';
    const deltaBadge = {
      New: '<span style="background:var(--color-indigo-light);color:var(--color-indigo-hover);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">New</span>',
      Update: '<span style="background:var(--color-warning-bg);color:var(--color-warning);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:var(--bg-tertiary);color:var(--color-navy-secondary);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:var(--color-critical-bg);color:var(--color-critical);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">⚠ Conflict</span>'
    }[item.deltaStatus] || '';
    const confColor = { high: 'var(--color-indigo-hover)', medium: 'var(--color-warning)', low: 'var(--color-navy-secondary)' }[item.confidence] || 'var(--color-navy-secondary)';
    const rowStyle = isDismissed ? 'opacity:0.4;' : isAccepted ? 'background:rgba(0,184,156,0.03);' : isConflict ? 'background:rgba(226,75,74,0.02);' : '';
    const actionBtns = isConflict
      ? `<button class="btn btn-secondary btn-small" data-queue-action="accept" data-id="${item.id}" style="font-size:10px;">Accept Anyway</button>
         <button class="btn btn-secondary btn-small" data-queue-action="dismiss" data-id="${item.id}" style="font-size:10px;">Dismiss</button>`
      : `<button class="btn btn-secondary btn-small" data-queue-action="accept" data-id="${item.id}" style="font-size:10px;">${isAccepted ? '✓ Accepted' : 'Accept'}</button>
         <button class="btn btn-secondary btn-small" data-queue-action="dismiss" data-id="${item.id}" style="font-size:10px;">${isDismissed ? 'Restore' : 'Dismiss'}</button>`;
    return `
      <tr style="border-bottom:1px solid var(--border-color);${rowStyle}">
        <td style="padding:8px 12px;"><input type="checkbox" class="queue-item-chk" data-id="${item.id}" ${isDismissed ? 'disabled' : ''} ${isAccepted ? 'checked' : ''} /></td>
        <td style="padding:8px 12px;"><span style="background:var(--color-slate-light);color:var(--color-slate);padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;">${item.itemType}</span></td>
        <td style="padding:8px 12px;"><div style="font-weight:600;color:var(--color-navy);">${item.title || '—'}</div>${item.description ? `<div style="font-size:11px;color:var(--color-navy-secondary);">${item.description.slice(0,80)}...</div>` : ''}</td>
        <td style="padding:8px 12px;">${deltaBadge}</td>
        <td style="padding:8px 12px;"><span style="font-size:11px;font-weight:600;color:${confColor};text-transform:capitalize;">${item.confidence || 'low'}</span></td>
        <td style="padding:8px 12px;text-align:right;"><div style="display:flex;gap:4px;justify-content:flex-end;">${actionBtns}</div></td>
      </tr>
    `;
  }

  // ─── TAB 3: DOCUMENT VAULT ────────────────────────────────────────────────
  renderVaultTab() {
    const entries = this.vaultEntries.filter(e =>
      !this.vaultSearch ||
      e.documentName?.toLowerCase().includes(this.vaultSearch.toLowerCase()) ||
      e.documentType?.toLowerCase().includes(this.vaultSearch.toLowerCase())
    );

    if (this.vaultEntries.length === 0) {
      return this.renderEmptyState(
        '🛡️',
        'No documents indexed in your vault',
        'Your organizational policy corpus is empty. Upload documents to construct an active governance structure.',
        'Upload a policy document to vault',
        'btn-go-upload-subtab'
      );
    }

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <input type="text" id="vault-search" class="form-control" placeholder="Search by document name or type..." value="${this.vaultSearch}" style="max-width:320px;font-size:12px;padding:6px 10px;" />
      </div>

      ${entries.length === 0 ? `
        <div class="glass-panel" style="padding:30px;text-align:center;"><p style="color:var(--color-navy-secondary);font-size:13px;">No documents match the search criteria.</p></div>
      ` : `
        <div class="vault-card-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
          ${entries.map(e => this.renderVaultCard(e)).join('')}
        </div>
      `}
    `;
  }

  renderVaultCard(entry) {
    const counts = entry.extractedCounts || {};
    const statusColors = {
      fully_processed: { bg: 'var(--color-safe-bg)', color: 'var(--color-safe)', label: 'Fully Processed' },
      partially_processed: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: 'Partially Processed' },
      pending_review: { bg: 'var(--color-slate-light)', color: 'var(--color-slate)', label: 'Pending Review' }
    };
    const sc = statusColors[entry.status] || statusColors.pending_review;
    const uploadDate = entry.uploadDate ? new Date(entry.uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return `
      <div class="vault-card" data-vault-id="${entry.id}" style="border: 1px solid var(--border-color); border-radius:8px; padding:16px; background:#FFFFFF; display:flex; flex-direction:column; justify-content:space-between; transition: box-shadow 0.2s;">
        <div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;gap:10px;">
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:700;color:var(--color-navy);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${entry.documentName}">${entry.documentName || 'Unknown'}</div>
              <span style="background:var(--color-slate-light);color:var(--color-slate);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">${entry.documentType || 'unknown'}</span>
            </div>
            <span style="background:${sc.bg};color:${sc.color};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0;">${sc.label}</span>
          </div>
          <p style="font-size:11px;color:var(--color-navy-secondary);line-height:1.4;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;height:46px;">${entry.documentSummary || 'No summary available.'}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding-top:10px;border-top:1px solid var(--border-color);font-size:10px;color:var(--color-navy-secondary);">
          <div style="display:flex;justify-content:space-between;color:var(--color-navy-secondary);opacity:0.8;">
            <span>📅 Ingested: ${uploadDate}</span>
            <span>${entry.is_demo ? '[Demo Standard]' : ''}</span>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-weight:600;">
            <span style="color:var(--color-critical);">⚠️ ${counts.risks || 0} risks</span>
            <span style="color:var(--color-indigo-hover);">🔧 ${counts.controls || 0} controls</span>
            <span style="color:var(--color-safe);">✓ ${entry.changesAccepted || 0} accepted</span>
          </div>
        </div>
      </div>
    `;
  }

  // ─── TAB 4: ASK DOCUMENTS (NO UPLOAD FUNCTIONALITY HERE) ─────────────────
  renderAskTab() {
    const activeDocs = this.getActiveWorkspaceDocs();
    const hasDocs = activeDocs.length > 0;

    if (!hasDocs) {
      return this.renderEmptyState(
        '🔍',
        'No approved knowledge sources available',
        'You must upload and process policy documents before asking questions. Preseeded standard policies can also be reloaded.',
        'Go to Upload & Extract',
        'btn-go-upload-subtab'
      );
    }

    return `
      <div class="ask-docs-container" style="display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 240px); min-height: 580px;">
        
        <!-- Main Workspace Grid -->
        <div style="display: grid; grid-template-columns: 280px 1.2fr 1.5fr; gap: 16px; flex-grow: 1; min-height: 0;">
          
          <!-- LEFT PANEL: Selected Documents -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: #FFFFFF; border: 1px solid var(--border-color);">
            <div style="display: flex; flex-direction: column; margin-bottom: 12px; flex-shrink:0;">
              <h3 style="font-size:11px; font-weight:700; color:var(--color-navy); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 6px 0;">
                Knowledge Sources (${activeDocs.length})
              </h3>
              <div style="font-size: 9px; color: var(--color-navy-secondary); display: flex; flex-direction: column; gap: 2px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                <div>Selected sources: <strong>${this.selectedDocIds.length}</strong></div>
                <div>Available chunks: <strong>${this.getActiveWorkspaceChunksCount()}</strong></div>
              </div>
            </div>

            <!-- Document List Selection Checkbox list -->
            <div style="display: flex; align-items: center; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px; flex-shrink:0;">
              <input type="checkbox" id="chk-all-docs" ${this.allDocsSelected ? 'checked' : ''} style="cursor: pointer;" />
              <label for="chk-all-docs" style="font-size: 11px; font-weight: 600; color: var(--color-navy); cursor: pointer; user-select: none;">Select All Sources</label>
            </div>
            
            <div class="policy-docs-list-scrollable" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
              ${activeDocs.map(d => {
                const isChecked = this.selectedDocIds.includes(d.id);
                const statusClass = { Ready: 'within', Processing: 'near', Failed: 'above' }[d.status] || 'near';
                const displayDate = d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
                
                return `
                  <div style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); display: flex; gap: 8px; align-items: flex-start; transition: all 0.2s;" class="policy-doc-list-item">
                    <input type="checkbox" class="policy-doc-checkbox" data-id="${d.id}" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;" />
                    <div style="flex-grow:1; min-width:0;">
                      <div style="font-size: 11px; font-weight: 600; color: var(--color-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${d.title}">${d.title}</div>
                      <div style="font-size: 9px; color: var(--color-navy-secondary); margin-top: 2px;">
                        ${d.document_type} ${d.framework_tags?.length ? `· ${d.framework_tags.join(', ')}` : ''}
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 8px; color: var(--color-navy-secondary);">
                        <span>Ingested: ${displayDate}</span>
                        <span class="status-badge ${statusClass}" style="font-size: 8px; padding: 0px 4px; border-radius:3px;">${d.status}</span>
                      </div>
                    </div>
                    <button class="btn-delete-policy-doc" data-policy-delete-id="${d.id}" style="background: none; border: none; color: var(--color-critical); padding: 0 4px; font-size: 11px; cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" title="Delete Document">✕</button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <!-- CENTER PANEL: Query Form -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: #FFFFFF; border: 1px solid var(--border-color);">
            <h3 style="font-size:11px; font-weight:700; color:var(--color-navy); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 12px 0; flex-shrink:0;">
              Ask Intelligence Engine
            </h3>
            
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px; flex-shrink:0;">
              <textarea id="policy-qa-input" class="form-control" rows="3" placeholder="Enter a governance or policy question..." style="font-size:12px; line-height: 1.4; resize: none; width: 100%; border-radius: 6px; padding: 8px 10px;" ${this.selectedDocIds.length === 0 ? 'disabled' : ''}>${this.policyQuery || ''}</textarea>
              <button id="btn-policy-qa-submit" class="btn btn-primary" style="width: 100%; font-size:12px; padding: 8px;" ${this.selectedDocIds.length === 0 ? 'disabled' : ''}>
                Query Core Policy Chunks
              </button>
            </div>
            
            <!-- Quick Suggestions -->
            <div style="margin-bottom: 16px; flex-shrink:0;">
              <div style="font-size: 9px; font-weight: 700; color: var(--color-navy-secondary); text-transform: uppercase; margin-bottom: 6px;">Suggested Queries</div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="What access control provisioning guidelines are active?" style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${this.selectedDocIds.length === 0 ? 'disabled' : ''}>
                  "What access control provisioning guidelines are active?"
                </button>
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="Define the Recovery Time (RTO) and Recovery Point (RPO) objectives." style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${this.selectedDocIds.length === 0 ? 'disabled' : ''}>
                  "Define the Recovery Time (RTO) and Recovery Point (RPO) objectives."
                </button>
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="Explain personal data rights under GDPR and DPDP." style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${this.selectedDocIds.length === 0 ? 'disabled' : ''}>
                  "Explain personal data rights under GDPR and DPDP."
                </button>
              </div>
            </div>
            
            <!-- Session History -->
            <div style="flex-grow: 1; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <div style="font-size: 9px; font-weight: 700; color: var(--color-navy-secondary); text-transform: uppercase; margin-bottom: 6px; flex-shrink:0;">Session History</div>
              
              <div style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px;">
                ${this.sessionQuestions.length === 0 ? `
                  <div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding: 10px;">
                    <span style="font-size:10px; color:var(--color-navy-secondary); font-style:italic; opacity:0.8;">No queries executed in this session.</span>
                  </div>
                ` : this.sessionQuestions.map((q, idx) => {
                  const isActive = this.activeQuestion && this.activeQuestion.id === q.id;
                  const timeStr = q.timestamp ? new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return `
                    <div class="session-history-item ${isActive ? 'active' : ''}" data-history-idx="${idx}" style="padding: 8px; border: 1px solid ${isActive ? 'var(--color-indigo)' : 'var(--border-color)'}; border-radius: 6px; background: ${isActive ? 'var(--color-indigo-light)' : 'rgba(255,255,255,0.01)'}; cursor: pointer; transition: all 0.2s;">
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--color-navy-secondary); margin-bottom:4px;">
                        <span>⏱️ ${timeStr}</span>
                        <span style="background:var(--color-indigo-light); color:var(--color-indigo-hover); padding: 0 4px; border-radius:3px; font-size:8px; font-weight:700;">${q.selectedDocNames || 'All'}</span>
                      </div>
                      <div style="font-size: 11px; font-weight: 600; color: var(--color-navy); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${q.question}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Diagnostics Checkbox -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 6px; flex-shrink:0;">
              <input type="checkbox" id="chk-policy-debug" ${this.debugMode ? 'checked' : ''} style="cursor: pointer;" />
              <label for="chk-policy-debug" style="font-size: 10px; font-weight: 600; color: var(--color-navy-secondary); cursor: pointer; user-select: none;">Show Retrieval Diagnostics</label>
            </div>
          </div>
          
          <!-- RIGHT PANEL: Findings & Evidence -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: #FFFFFF; border: 1px solid var(--border-color);">
            <h3 style="font-size:11px; font-weight:700; color:var(--color-navy); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 12px 0; flex-shrink:0;">
              Findings &amp; Intelligence
            </h3>
            
            <div id="policy-qa-right-content" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; min-height:0; padding-right: 4px;">
              ${this.renderRightPanelContent()}
            </div>
          </div>
          
        </div>
      </div>
    `;
  }

  renderRightPanelContent() {
    if (this.policyQALoading) {
      return `
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; text-align:center;">
          <div class="intake-spinner" style="border: 4px solid var(--color-indigo-light); border-top: 4px solid var(--color-indigo); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom:16px;"></div>
          <h4 style="font-size:13px; font-weight:700; color:var(--color-navy); margin:0 0 4px 0;">Analyzing active GRC sources...</h4>
          <p style="font-size:11px; color:var(--color-navy-secondary); margin:0;">Performing keyword lookup and executing model checks...</p>
        </div>
      `;
    }

    if (!this.activeQuestion) {
      return `
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px; color:var(--color-navy-secondary);">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px;height:40px;margin-bottom:12px;opacity:0.6;color:var(--color-indigo);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.982-8.983m-9 0L15 3l-1.813 7.504" />
          </svg>
          <span style="font-size:11px; font-style:italic;">Configure sources and type your question to trigger GRC audit checks.</span>
        </div>
      `;
    }

    const q = this.activeQuestion;
    const aiResponse = q.answer;
    const hasEvidence = aiResponse.citations && aiResponse.citations.length > 0;
    const isNoEvidence = !hasEvidence && (!aiResponse.direct_answer || aiResponse.direct_answer.toLowerCase().includes("no evidence") || aiResponse.direct_answer.toLowerCase().includes("no relevant evidence"));
    
    if (isNoEvidence) {
      return `
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--color-warning-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:24px;height:24px;color:var(--color-warning);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h4 style="font-size:13px; font-weight:700; color:var(--color-navy); margin-bottom:6px;">No matching evidence</h4>
          <p style="font-size:11px; color:var(--color-navy-secondary); max-width:280px; margin:0;">No direct statements matching this query were located in selected policy records.</p>
        </div>
      `;
    }

    const confLevel = (aiResponse.confidence || 'Low').trim();
    const confColor = { High: 'var(--color-safe-text)', Medium: 'var(--color-warning-text)', Low: 'var(--color-critical-text)' }[confLevel] || 'var(--color-navy-secondary)';
    const confBg = { High: 'var(--color-safe-bg)', Medium: 'var(--color-warning-bg)', Low: 'var(--color-critical-bg)' }[confLevel] || 'rgba(0,0,0,0.02)';
    const confBorder = { High: 'rgba(26,122,74,0.2)', Medium: 'rgba(194,97,14,0.2)', Low: 'rgba(192,57,43,0.2)' }[confLevel] || 'var(--border-color)';

    const formattedAnswer = this.formatPoliciesMarkdown(aiResponse.direct_answer || aiResponse.directAnswer);

    let html = `
      <!-- Provenance Summary -->
      <div class="glass-panel" style="padding: 10px 12px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 8px; margin-bottom: 12px; font-size: 11px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-size: 8px; color: var(--color-navy-secondary); text-transform: uppercase; font-weight: 700;">Selected</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--color-navy); margin-top: 2px;">${q.documentsSelected || 0}</div>
          </div>
          <div>
            <div style="font-size: 8px; color: var(--color-navy-secondary); text-transform: uppercase; font-weight: 700;">Used</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--color-navy); margin-top: 2px;">${q.documentsUsed || 0}</div>
          </div>
          <div>
            <div style="font-size: 8px; color: var(--color-navy-secondary); text-transform: uppercase; font-weight: 700;">Chunks</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--color-navy); margin-top: 2px;">${q.chunksRetrieved || 0}</div>
          </div>
          <div>
            <div style="font-size: 8px; color: var(--color-navy-secondary); text-transform: uppercase; font-weight: 700;">Strength</div>
            <div style="margin-top: 2px;">
              <span class="status-badge" style="font-size: 8px; padding: 0px 4px; border-radius: 3px; font-weight: 600; 
                background: ${q.evidenceStrength === 'High' ? 'var(--color-safe-bg)' : q.evidenceStrength === 'Medium' ? 'var(--color-warning-bg)' : 'var(--color-critical-bg)'}; 
                color: ${q.evidenceStrength === 'High' ? 'var(--color-safe-text)' : q.evidenceStrength === 'Medium' ? 'var(--color-warning-text)' : 'var(--color-critical-text)'};">
                ${q.evidenceStrength || 'Low'}
              </span>
            </div>
          </div>
        </div>
        <div style="font-size: 10px; color: var(--color-navy-secondary); line-height: 1.3;">
          <strong>Sources Checked:</strong> ${q.usedDocNames && q.usedDocNames.length > 0 ? q.usedDocNames.join(', ') : 'None'}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:8px;">
        <div style="font-size:11px; color:var(--color-navy-secondary);">Audited Response</div>
        <span class="status-badge" style="background:${confBg}; color:${confColor}; border:1px solid ${confBorder}; font-size:9px; padding:1px 6px; border-radius:3px; text-transform:uppercase; font-weight: 600;">
          ${confLevel} Confidence
        </span>
      </div>

      <!-- Direct Answer Box -->
      <div class="glass-panel" style="padding:12px 14px; border:1px solid var(--border-color); background:#FFFFFF; border-radius:8px; margin-bottom:16px;">
        <div style="font-size:12px; color:var(--color-navy); line-height:1.5;">${formattedAnswer}</div>
      </div>

      <!-- Evidence & Excerpts -->
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--color-navy-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Excerpts &amp; Citations</h4>
        ${!hasEvidence ? `
          <div style="font-size:11px; color:var(--color-navy-secondary); font-style:italic;">No direct citations found.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${aiResponse.citations.map(c => `
              <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:6px; padding:8px 10px; font-size:11px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-weight:600; color:var(--color-navy);">
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">📄 ${c.document_title || c.documentTitle}</span>
                  <span style="color:var(--color-navy-secondary); font-size:9px;">${c.section_title || c.sectionTitle || 'General'} ${c.page_number || c.pageNumber ? `· Page ${c.page_number || c.pageNumber}` : ''}</span>
                </div>
                <div style="color:var(--color-navy-secondary); font-style:italic; line-height:1.4;">"${c.excerpt}"</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    const gaps = aiResponse.gaps_detected || aiResponse.gaps || [];
    html += `
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--color-navy-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Identified Gaps</h4>
        ${gaps.length === 0 ? `
          <div style="font-size:11px; color:var(--color-safe-text); background:var(--color-safe-bg); border:1px solid rgba(26,122,74,0.1); border-radius:6px; padding:8px 10px;">
            ✓ No critical policy gaps detected in reference to this query.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${gaps.map(g => {
              const isAdded = this.changeQueue.some(i => i.title === g.title && i.itemType === 'Risk' && i.decision === 'pending');
              return `
                <div style="background:var(--color-critical-bg); border:1px solid rgba(226,75,74,0.1); border-left: 4px solid var(--color-critical); border-radius:6px; padding:10px; font-size:11px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                  <div style="flex-grow:1; min-width:0;">
                    <strong style="color:var(--color-critical); display:block; margin-bottom:2px;">${g.title}</strong>
                    <span style="color:var(--color-navy-secondary); font-size:10px; line-height:1.4; display:block;">${g.description}</span>
                  </div>
                  <button class="btn btn-secondary btn-small rec-queue-btn" style="font-size:9px; padding:2px 6px; white-space:nowrap; margin-top:2px; ${isAdded ? 'background:var(--color-indigo-light); color:var(--color-indigo-hover); border-color:rgba(0,184,156,0.2);' : ''}" 
                          data-rec-type="Risk" data-rec-title="${g.title}" data-rec-desc="${g.description}" data-rec-source="${aiResponse.citations?.[0]?.document_title || aiResponse.citations?.[0]?.documentTitle || 'Policy Intelligence'}" ${isAdded ? 'disabled' : ''}>
                    ${isAdded ? '✓ Added' : 'Create Risk'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    const recs = aiResponse.recommended_actions || aiResponse.recommendedActions || [];
    html += `
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--color-navy-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Mitigation Proposals</h4>
        ${recs.length === 0 ? `
          <div style="font-size:11px; color:var(--color-navy-secondary); font-style:italic;">No GRC actions proposed.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${recs.map(r => {
              const recType = r.type === 'control' ? 'Control' : 'Action';
              const isAdded = this.changeQueue.some(i => i.title === r.title && i.itemType === recType && i.decision === 'pending');
              return `
                <div style="background:var(--color-indigo-light); border:1px solid rgba(0,184,156,0.1); border-left: 4px solid var(--color-indigo); border-radius:6px; padding:10px; font-size:11px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                  <div style="flex-grow:1; min-width:0;">
                    <strong style="color:var(--color-indigo-hover); display:block; margin-bottom:2px;">${r.title}</strong>
                    <span style="color:var(--color-navy-secondary); font-size:10px; line-height:1.4; display:block;">${r.description}</span>
                  </div>
                  <button class="btn btn-secondary btn-small rec-queue-btn" style="font-size:9px; padding:2px 6px; white-space:nowrap; margin-top:2px; ${isAdded ? 'background:var(--color-indigo-light); color:var(--color-indigo-hover); border-color:rgba(0,184,156,0.2);' : ''}" 
                          data-rec-type="${recType}" data-rec-title="${r.title}" data-rec-desc="${r.description}" data-rec-source="${aiResponse.citations?.[0]?.document_title || aiResponse.citations?.[0]?.documentTitle || 'Policy Intelligence'}" ${isAdded ? 'disabled' : ''}>
                    ${isAdded ? '✓ Added' : `Create ${recType}`}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    const chunksSupplied = q.chunksSupplied || [];
    html += `
      <div class="glass-panel" style="margin-top: 16px; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 8px;">
        <div id="btn-toggle-evidence" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
          <h4 style="font-size: 10px; font-weight: 700; color: var(--color-navy-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Retrieved Evidence</h4>
          <span style="font-size: 10px; color: var(--color-navy-secondary); font-weight: 600;">${this.evidenceExpanded ? 'Collapse ▴' : 'Expand ▾'}</span>
        </div>
        <div id="evidence-panel-content" style="display: ${this.evidenceExpanded ? 'flex' : 'none'}; flex-direction: column; gap: 8px; margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          ${chunksSupplied.length === 0 ? `
            <div style="font-size:11px; color:var(--color-navy-secondary); font-style:italic;">No explicit source chunk retrieved above matching threshold.</div>
          ` : chunksSupplied.map((c, idx) => `
            <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 10px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-weight: 600; color: var(--color-navy); flex-wrap: wrap; gap: 4px;">
                <span>📄 ${c.document_title || c.documentName || 'Policy Document'} (Chunk #${c.chunk_index !== undefined ? c.chunk_index + 1 : idx + 1})</span>
                <span class="status-badge" style="font-size: 9px; padding: 1px 5px; background: var(--color-indigo-light); color: var(--color-indigo-hover); border: 1px solid rgba(0,184,156,0.15);">Score: ${c.score !== undefined ? c.score.toFixed(1) : '0.0'}</span>
              </div>
              <div style="color: var(--color-navy-secondary); line-height: 1.4; font-style: italic;">"${c.chunk_text}"</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (this.debugMode) {
      html += `
        <div class="glass-panel" style="margin-top: 16px; padding: 12px; border: 1px solid rgba(194, 97, 14, 0.3); background: rgba(194, 97, 14, 0.02); border-radius: 8px;">
          <h4 style="font-size: 9px; font-weight: 800; color: var(--color-warning); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 8px;">Debug Diagnostics</h4>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; font-family: monospace; color: var(--color-navy-secondary); line-height: 1.4;">
            <div><strong>Query:</strong> ${q.question}</div>
            <div><strong>Selected Doc IDs:</strong> ${JSON.stringify(this.selectedDocIds)}</div>
            <div><strong>Retrieved Doc IDs:</strong> ${JSON.stringify(q.retrievedDocIds || [])}</div>
            <div><strong>Used Chunks:</strong> ${JSON.stringify(q.retrievedChunkIds || [])}</div>
            <div><strong>Diagnostics Stats:</strong> Checked: ${this.sessionMetrics.questionsAsked} | Answered: ${this.sessionMetrics.questionsAnswered} | Bypassed: ${this.sessionMetrics.questionsBypassed}</div>
          </div>
        </div>
      `;
    }

    return html;
  }

  // ─── TAB 5: POLICY LIBRARY & GENERATOR ────────────────────────────────────
  renderGeneratorTab() {
    const domains = PolicyTemplateService.getDomains();
    const activeDomain = domains[this.genDomain];
    const subPolicies = activeDomain ? activeDomain.templates : {};
    const clauses = PolicyTemplateService.getClauseLibrary();

    return `
      <div class="register-layout" style="display:flex;gap:20px;flex-wrap:wrap;margin-top:10px;">
        
        <!-- LEFT: OPTIONS & PROFILE -->
        <div class="details-panel" style="flex: 1 1 320px; max-width: 380px; display:flex; flex-direction:column; gap:16px;">
          <div class="glass-panel" style="padding:16px;">
            <h3 class="dashboard-card-title" style="margin-bottom:12px;">Policy Settings</h3>
            
            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Policy Domain</label>
              <select class="form-control" id="gen-domain-select">
                ${Object.entries(domains).map(([k, d]) => `
                  <option value="${k}" ${this.genDomain === k ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Target Template</label>
              <select class="form-control" id="gen-template-select">
                ${Object.entries(subPolicies).map(([k, t]) => `
                  <option value="${k}" ${this.genTemplate === k ? 'selected' : ''}>${t.title}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Industry Profile</label>
              <select class="form-control" id="gen-industry-select">
                <option value="SaaS" ${this.genIndustry === 'SaaS' ? 'selected' : ''}>SaaS</option>
                <option value="FinTech" ${this.genIndustry === 'FinTech' ? 'selected' : ''}>FinTech</option>
                <option value="Healthcare" ${this.genIndustry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                <option value="EdTech" ${this.genIndustry === 'EdTech' ? 'selected' : ''}>EdTech</option>
                <option value="Manufacturing" ${this.genIndustry === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
              </select>
            </div>
          </div>

          <div class="glass-panel" style="padding:16px;">
            <h3 class="dashboard-card-title" style="margin-bottom:12px;">Company Metadata</h3>
            
            <div class="form-group" style="margin-bottom:10px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Operating Countries</label>
              <input type="text" class="form-control profile-field" data-key="countries" value="${this.genProfile.countries}" />
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Cloud Host</label>
                <input type="text" class="form-control profile-field" data-key="cloudProvider" value="${this.genProfile.cloudProvider}" />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Employees</label>
                <input type="text" class="form-control profile-field" data-key="employeeCount" value="${this.genProfile.employeeCount}" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom:10px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Client Types</label>
              <input type="text" class="form-control profile-field" data-key="customerTypes" value="${this.genProfile.customerTypes}" />
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Data Scopes Processed</label>
              <textarea class="form-control profile-field" data-key="dataCategories" rows="2" style="font-size:11px;">${this.genProfile.dataCategories}</textarea>
            </div>
          </div>

          <div class="glass-panel" style="padding:16px; background:var(--color-indigo-light); border-color:rgba(0,184,156,0.25);">
            <h3 class="dashboard-card-title" style="color:var(--color-indigo-hover);margin-bottom:6px;">Clause Library Moat</h3>
            <p style="font-size:11px;color:var(--color-navy-secondary);line-height:1.4;margin-bottom:10px;">
              Click consultant-drafted clauses below to inject them as directives in your prompt workspace.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto;padding-right:4px;">
              ${clauses.map(c => `
                <div class="clause-pill" style="padding:8px;background:#FFFFFF;border:1px solid var(--border-color);border-radius:6px;font-size:11px;cursor:pointer;transition:background 0.2s;" data-clause-id="${c.id}" onmouseover="this.style.background='var(--color-indigo-light)'" onmouseout="this.style.background='#FFFFFF'">
                  <strong style="color:var(--color-navy);display:block;margin-bottom:2px;">${c.name}</strong>
                  <span style="font-size:9px;color:var(--color-navy-secondary);">${c.frameworks.join(', ')} | ${c.confidence} Confidence</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: WORKSPACE -->
        <div class="details-panel" style="flex: 2 1 500px; display:flex; flex-direction:column; gap:16px;">
          <div class="glass-panel" style="min-height:580px;display:flex;flex-direction:column;justify-content:space-between;padding:20px;">
            
            <div>
              <h3 class="dashboard-card-title" style="margin-bottom:12px;">Drafting Workspace</h3>
              
              <div class="form-group" style="margin-bottom:12px;">
                <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Custom Directives / Context Prompts</label>
                <textarea class="form-control" id="gen-prompt-input" rows="3" placeholder="e.g. Add specifications for least-privilege engineering checkouts and ISO 27001 data residency..." style="font-size:11px;width:100%;resize:none;">${this.genPrompt}</textarea>
              </div>

              <button class="btn btn-primary" id="btn-generate-policy" style="width:100%;justify-content:center;height:38px;" ${this.isGenerating ? 'disabled' : ''}>
                ${this.isGenerating ? 'Generating Policy...' : 'Compile &amp; Generate Policy'}
              </button>
            </div>

            <!-- PREVIEW AREA -->
            <div style="flex-grow:1;margin-top:20px;display:flex;flex-direction:column;min-height:300px;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:8px;margin-bottom:10px;">
                <h4 style="font-size:11px;text-transform:uppercase;color:var(--color-navy-secondary);letter-spacing:0.5px;">
                  Draft: <span style="color:var(--color-navy);font-weight:700;">${this.genTitle}</span>
                </h4>
                ${this.genResultText ? `
                  <button class="btn btn-secondary btn-small" id="btn-save-draft-to-vault" style="font-size:10px;">Save Draft to Vault</button>
                ` : ''}
              </div>

              <div id="gen-result-container" style="flex-grow:1;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;font-size:12px;line-height:1.6;color:var(--color-navy);overflow-y:auto;max-height:380px;white-space:pre-wrap;font-family:var(--font-body);">
                ${this.isGenerating ? `
                  <div style="text-align:center;padding:80px 0;color:var(--color-navy-secondary);">
                    <div class="intake-spinner" style="border: 4px solid var(--color-indigo-light); border-top: 4px solid var(--color-indigo); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
                    GRC AI engine drafting standard policies...
                  </div>
                ` : this.genResultText ? this.genResultText : `
                  <div style="text-align:center;padding:100px 0;color:var(--color-navy-secondary);opacity:0.8;">
                    <span style="font-size:32px;display:block;margin-bottom:10px;">📝</span>
                    Configure settings on the left and click Compile to construct your policy draft.
                  </div>
                `}
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 6: UPGRADE WIZARD & GAP AUDIT ─────────────────────────────────────
  renderUpgradeTab() {
    const vaultDocs = this.vaultEntries || [];
    const frameworks = PolicyTemplateService.getRequirementPacks();
    const results = this.analysisResults;

    return `
      <div class="register-layout" style="display:flex;gap:20px;flex-wrap:wrap;margin-top:10px;">
        
        <!-- LEFT: AUDIT WORKFLOW CONFIG -->
        <div class="details-panel" style="flex: 1 1 320px; max-width:380px; display:flex; flex-direction:column; gap:16px;">
          <div class="glass-panel" style="padding:16px;">
            <h3 class="dashboard-card-title" style="margin-bottom:12px;">Audit Settings</h3>
            
            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Select Policy Document</label>
              <select class="form-control" id="audit-doc-select">
                <option value="">-- Choose Ingested Vault Policy --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${this.selectedDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Target Audit Framework</label>
              <select class="form-control" id="audit-framework-select">
                ${Object.entries(frameworks).map(([k, f]) => `
                  <option value="${k}" ${this.targetFramework === k ? 'selected' : ''}>${f.name}</option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-primary" id="btn-run-policy-audit" style="width:100%;justify-content:center;margin-top:12px;" ${!this.selectedDocId || this.isAnalyzing ? 'disabled' : ''}>
              ${this.isAnalyzing ? 'Running GRC Audit...' : 'Audit Policy &amp; Gap Analysis'}
            </button>
          </div>

          <!-- REQ PACK INSPECTOR -->
          <div class="glass-panel" style="padding:16px;">
            <h3 class="dashboard-card-title" style="margin-bottom:8px;">Framework Controls</h3>
            <p style="font-size:11px;color:var(--color-navy-secondary);line-height:1.4;margin-bottom:12px;">
              Audit checklist required under ${frameworks[this.targetFramework]?.name || 'Target Framework'}.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px;">
              ${(frameworks[this.targetFramework]?.requirements || []).map(r => `
                <div style="padding:8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;font-size:11px;">
                  <strong style="color:var(--color-navy);display:block;">${r.name}</strong>
                  <span style="font-size:10px;color:var(--color-navy-secondary);line-height:1.3;display:block;margin-top:2px;">${r.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: AUDIT WORKSPACE -->
        <div class="details-panel" style="flex: 2 1 500px;">
          <div class="glass-panel" style="min-height:580px;padding:20px;">
            <h3 class="dashboard-card-title" style="margin-bottom:16px;">Upgrade Analysis Workspace</h3>

            ${this.isAnalyzing ? `
              <div style="text-align:center;padding:120px 0;color:var(--color-navy-secondary);">
                <div class="intake-spinner" style="border: 4px solid var(--color-indigo-light); border-top: 4px solid var(--color-indigo); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin:0 auto 12px;"></div>
                Executing structural checks &amp; comparative mapping...
              </div>
            ` : results ? `
              
              <!-- COVERAGE CARD -->
              <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:1fr 2fr;gap:20px;">
                <div style="border-right:1px solid var(--border-color);padding-right:10px;display:flex;flex-direction:column;justify-content:center;">
                  <span style="font-size:10px;text-transform:uppercase;color:var(--color-navy-secondary);font-weight:700;">GRC Summary</span>
                  <p style="font-size:11px;color:var(--color-navy);line-height:1.45;margin-top:6px;">
                    ${results.summary}
                  </p>
                </div>
                <div>
                  <span style="font-size:10px;text-transform:uppercase;color:var(--color-navy-secondary);font-weight:700;display:block;margin-bottom:8px;">Compliance Status Check</span>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <div style="padding:10px;background:var(--color-safe-bg);border:1px solid var(--color-safe);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-safe-text);font-size:16px;display:block;">${results.strong.length}</strong>
                      <span style="font-size:9px;color:var(--color-safe-text);font-weight:600;text-transform:uppercase;display:block;margin-top:2px;">Satisfied</span>
                    </div>
                    <div style="padding:10px;background:var(--color-warning-bg);border:1px solid var(--color-warning);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-warning-text);font-size:16px;display:block;">${results.weak.length}</strong>
                      <span style="font-size:9px;color:var(--color-warning-text);font-weight:600;text-transform:uppercase;display:block;margin-top:2px;">Weak Checks</span>
                    </div>
                    <div style="padding:10px;background:var(--color-critical-bg);border:1px solid var(--color-critical);border-radius:6px;flex:1;text-align:center;">
                      <strong style="color:var(--color-critical-text);font-size:16px;display:block;">${results.missing.length}</strong>
                      <span style="font-size:9px;color:var(--color-critical-text);font-weight:600;text-transform:uppercase;display:block;margin-top:2px;">Missing</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CLAUSE SUGGESTIONS -->
              <h4 style="font-size:11px;text-transform:uppercase;color:var(--color-navy-secondary);letter-spacing:0.5px;margin-bottom:10px;">Clause Upgrades &amp; Suggestions</h4>
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                ${results.gaps.map(g => {
                  const decision = this.policyStudioDecisions[g.id] || 'pending';
                  const isExpanded = this.expandedClauseId === g.id;
                  const currentText = this.editedClauses[g.id] !== undefined ? this.editedClauses[g.id] : g.text;

                  let borderClr = 'var(--border-color)';
                  if (decision === 'accepted') borderClr = 'var(--color-safe)';
                  else if (decision === 'dismissed') borderClr = 'var(--color-critical)';

                  return `
                    <div style="border:1.5px solid ${borderClr};border-radius:8px;padding:12px;background:#FFFFFF;transition:all 0.2s;" class="clause-card" data-clause-id="${g.id}">
                      
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                        <div>
                          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            <span class="status-badge ${g.status === 'Missing' ? 'above' : 'near'}" style="font-size:9px;">
                              ${g.status}
                            </span>
                            <span class="profile-role-badge" style="font-size:9px;color:var(--color-indigo-hover);">${g.reqName}</span>
                          </div>
                          <h4 style="font-size:13px;font-weight:700;margin-top:4px;color:var(--color-navy);">${g.name}</h4>
                        </div>
                        
                        <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
                          <span class="status-badge within" style="font-size:9px;padding:2px 6px;">
                            ${g.confidence} Conf
                          </span>
                          <button class="btn btn-secondary btn-small toggle-clause-btn" style="font-size:9px;padding:2px 6px;" data-clause-id="${g.id}">
                            ${isExpanded ? 'Collapse' : 'Audit Clause'}
                          </button>
                        </div>
                      </div>

                      ${isExpanded ? `
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
                          <div class="form-group" style="margin-bottom:10px;">
                            <label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px;">Drafted Clause Insertion</label>
                            <textarea class="form-control clause-textarea" rows="4" style="font-family:var(--font-body);font-size:11px;line-height:1.5;width:100%;" data-clause-id="${g.id}">${currentText}</textarea>
                          </div>
                          
                          <div style="background:var(--bg-primary);border-radius:6px;padding:8px 12px;font-size:11px;color:var(--color-navy-secondary);line-height:1.4;margin-bottom:12px;">
                            <strong>Why is this required?</strong> ${g.rationale}
                          </div>

                          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;gap:6px;">
                              <button class="btn btn-secondary btn-small clause-action-btn" data-action="accept" data-clause-id="${g.id}" style="${decision === 'accepted' ? 'background:var(--color-safe-bg);color:var(--color-safe);border-color:var(--color-safe);' : ''}">
                                ${decision === 'accepted' ? '✓ Accepted' : 'Accept Upgrade'}
                              </button>
                              <button class="btn btn-secondary btn-small clause-action-btn" data-action="dismiss" data-clause-id="${g.id}" style="${decision === 'dismissed' ? 'background:var(--color-critical-bg);color:var(--color-critical);border-color:var(--color-critical);' : ''}">
                                ${decision === 'dismissed' ? '✕ Dismissed' : 'Dismiss'}
                              </button>
                            </div>
                            
                            <div style="display:flex;gap:4px;">
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Control" data-clause-id="${g.id}" style="font-size:10px;">Map Control</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Risk" data-clause-id="${g.id}" style="font-size:10px;">Map Risk</button>
                              <button class="btn btn-secondary btn-small push-cq-btn" data-type="Action" data-clause-id="${g.id}" style="font-size:10px;">Create Action</button>
                            </div>
                          </div>
                        </div>
                      ` : ''}

                    </div>
                  `;
                }).join('')}
              </div>

              <!-- AMENDMENTS LIST -->
              <h4 style="font-size:11px;text-transform:uppercase;color:var(--color-navy-secondary);letter-spacing:0.5px;margin-bottom:8px;">Audit Findings Ledger</h4>
              <div class="glass-panel" style="padding:12px;margin-bottom:20px;background:var(--bg-primary);">
                <ul style="padding-left:16px;font-size:11px;color:var(--color-navy-secondary);line-height:1.6;margin:0;">
                  ${results.amendments.map(a => `
                    <li><strong>${a.action}</strong>: ${a.desc}</li>
                  `).join('')}
                </ul>
              </div>

              <!-- COMMIT UPGRADES -->
              <div class="glass-panel" style="border-color:var(--color-indigo);background:var(--color-indigo-light);display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <h4 style="font-size:13px;font-weight:700;color:var(--color-navy);">Approve Policy Amendments</h4>
                  <p style="font-size:11px;color:var(--color-navy-secondary);margin-top:2px;">
                    Stages accepted clauses and updates policy version.
                  </p>
                </div>
                <button class="btn btn-primary" id="btn-approve-and-stage" style="height:34px;">Commit Amendments</button>
              </div>

            ` : `
              <div style="text-align:center;padding:120px 0;color:var(--color-navy-secondary);opacity:0.8;">
                <span style="font-size:32px;display:block;margin-bottom:10px;">🔍</span>
                Select a policy on the left and click Audit to check coverage and missing clauses.
              </div>
            `}
          </div>
        </div>

      </div>
    `;
  }

  // ─── TAB 7: APPROVED VERSIONS ─────────────────────────────────────────────
  renderVersionsTab() {
    const vaultDocs = this.vaultEntries || [];
    const activeDocId = this.selectedDocId;
    const doc = vaultDocs.find(d => d.id === activeDocId);
    const versions = activeDocId ? this.getPolicyVersions(activeDocId) : [];

    return `
      <div class="register-layout" style="display:flex;gap:20px;flex-wrap:wrap;margin-top:10px;">
        
        <!-- LEFT: SELECTOR -->
        <div class="details-panel" style="flex: 1 1 320px; max-width:380px;">
          <div class="glass-panel" style="padding:16px;">
            <h3 class="dashboard-card-title" style="margin-bottom:12px;">Choose Policy</h3>
            <div class="form-group" style="margin-bottom:12px;">
              <select class="form-control" id="ver-doc-select">
                <option value="">-- Choose Policy --</option>
                ${vaultDocs.map(d => `
                  <option value="${d.id}" ${activeDocId === d.id ? 'selected' : ''}>${d.documentName}</option>
                `).join('')}
              </select>
            </div>
            ${doc ? `
              <div style="margin-top:12px;font-size:11px;color:var(--color-navy-secondary);line-height:1.4;display:flex;flex-direction:column;gap:6px;">
                <div>Ingested Status: <strong class="status-badge within" style="font-size:9px;padding:2px 6px;">${doc.status}</strong></div>
                <div>Type: <strong>${doc.documentType}</strong></div>
                <div>Created: <strong>${new Date(doc.uploadDate).toLocaleDateString('en-IN')}</strong></div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- RIGHT: LEDGER -->
        <div class="details-panel" style="flex: 2 1 500px;">
          
          <!-- PUBLISHING FORM -->
          ${this.isPublishing ? `
            <div class="glass-panel" style="border-color:var(--color-indigo);margin-bottom:16px;padding:16px;">
              <h3 class="dashboard-card-title" style="color:var(--color-indigo-hover);margin-bottom:8px;">Submit Revision</h3>
              
              <div class="form-group" style="margin-top:12px;">
                <label style="font-size:11px; font-weight:600; display:block; margin-bottom:4px;">Revision Summary / Audit Comments</label>
                <textarea class="form-control" id="pub-summary-input" rows="3" placeholder="e.g. Added clause 3.2 for DPDP data subject consent and withdrew legacy access terms." style="font-size:11px;width:100%;resize:none;">${this.reviewSummary}</textarea>
              </div>

              <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn btn-primary" id="btn-submit-publication" style="flex-grow:1;justify-content:center;">Commit version</button>
                <button class="btn btn-secondary" id="btn-cancel-publication">Cancel</button>
              </div>
            </div>
          ` : ''}

          <!-- VERSION LIST -->
          <div class="glass-panel" style="min-height:460px;padding:20px;">
            <h3 class="dashboard-card-title" style="margin-bottom:16px;">Version Ledger History</h3>
            
            ${!activeDocId ? `
              <div style="text-align:center;padding:100px 0;color:var(--color-navy-secondary);opacity:0.8;">
                <span style="font-size:32px;display:block;margin-bottom:10px;">📜</span>
                Select a document on the left to inspect its version lifecycle logs.
              </div>
            ` : versions.length === 0 ? `
              ${this.renderEmptyState(
                '📝',
                'No revisions recorded yet',
                'Establish an initial baseline and approve gaps to compile version updates for this policy.',
                'Analyze Gaps &amp; Upgrade',
                'btn-go-upgrade-subtab'
              )}
            ` : `
              <div style="display:flex;flex-direction:column;gap:12px;">
                ${versions.map((v, idx) => `
                  <div class="glass-panel" style="padding:12px;background:var(--bg-primary);border:1.5px solid var(--border-color);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                      <div>
                        <span class="status-badge within" style="font-size:10px;background:var(--color-indigo-light);color:var(--color-indigo-hover);font-weight:700;">
                          ${v.version}
                        </span>
                        <h4 style="font-size:13px;font-weight:700;display:inline-block;margin-left:8px;color:var(--color-navy);">
                          Approved Revision
                        </h4>
                      </div>
                      <span style="font-size:10px;color:var(--color-navy-secondary);">
                        ${new Date(v.date).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style="margin-top:8px;font-size:11px;color:var(--color-navy-secondary);line-height:1.45;display:flex;flex-direction:column;gap:4px;">
                      <div><strong>Review Summary:</strong> ${v.summary}</div>
                      <div><strong>Frameworks Mapped:</strong> ${v.frameworks.join(', ') || 'Internal Governance'}</div>
                      <div><strong>Owner:</strong> ${v.owner} | <strong>Approver:</strong> ${v.approver}</div>
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

  // ─── EVENT BINDING ────────────────────────────────────────────────────────
  bindEvents(container) {
    // 1. Horizontal Sub-tab Switches
    container.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubTab = btn.dataset.subtab;
        this.render(container);
      });
    });

    // Empty state CTA switches
    container.querySelectorAll('#btn-go-upload-subtab, #btn-go-upload-workflow').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubTab = 'upload';
        this.render(container);
      });
    });

    container.querySelectorAll('#btn-go-upgrade-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubTab = 'upgrade';
        this.render(container);
      });
    });

    // ─── TAB 1: UPLOAD & EXTRACT EVENTS ───
    if (this.activeSubTab === 'upload') {
      const dropzone = container.querySelector('#intake-dropzone');
      if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.background = 'rgba(0,184,156,0.08)'; });
        dropzone.addEventListener('dragleave', () => dropzone.style.background = 'var(--color-indigo-light)');
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.style.background = 'var(--color-indigo-light)';
          const file = e.dataTransfer.files[0];
          if (file) this.handleFileUpload(file);
        });
        dropzone.addEventListener('click', () => {
          container.querySelector('#intake-file-input')?.click();
        });
      }

      container.querySelector('#intake-file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });

      container.querySelector('#btn-reset-upload')?.addEventListener('click', () => {
        this.uploadState = 'idle';
        this.extractionResult = null;
        this.extractionError = null;
        this.itemDecisions = {};
        this.editValues = {};
        this.renderBody();
      });

      container.querySelector('#btn-go-queue')?.addEventListener('click', () => {
        this.activeSubTab = 'queue';
        this.render(container);
      });

      container.querySelector('#btn-go-vault')?.addEventListener('click', () => {
        this.activeSubTab = 'vault';
        this.render(container);
      });

      // Review batch select
      container.querySelector('#btn-select-all')?.addEventListener('click', () => {
        this.getAllReviewItems().forEach(item => {
          if (item.deltaStatus !== 'Conflict') this.itemDecisions[item.id] = 'accepted';
        });
        this.renderBody();
      });

      container.querySelector('#btn-accept-high')?.addEventListener('click', () => {
        this.getAllReviewItems().filter(i => i.confidence === 'high' && i.deltaStatus !== 'Conflict').forEach(i => {
          this.itemDecisions[i.id] = 'accepted';
        });
        this.renderBody();
      });

      container.querySelector('#btn-dismiss-dupes')?.addEventListener('click', () => {
        this.getAllReviewItems().filter(i => i.deltaStatus === 'Duplicate').forEach(i => {
          this.itemDecisions[i.id] = 'dismissed';
        });
        this.renderBody();
      });

      // Review actions
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (action === 'accept') {
            this.itemDecisions[id] = this.itemDecisions[id] === 'accepted' ? 'pending' : 'accepted';
          } else if (action === 'dismiss') {
            this.itemDecisions[id] = this.itemDecisions[id] === 'dismissed' ? 'pending' : 'dismissed';
          } else if (action === 'edit') {
            this.itemDecisions[id] = this.itemDecisions[id] === 'editing' ? 'pending' : 'editing';
          }
          this.renderBody();
        });
      });

      // Individual checkbox click
      container.querySelectorAll('.item-checkbox').forEach(chk => {
        chk.addEventListener('change', () => {
          const id = chk.dataset.id;
          this.itemDecisions[id] = chk.checked ? 'accepted' : 'pending';
          const count = Object.values(this.itemDecisions).filter(d => d === 'accepted').length;
          const applyBtn = container.querySelector('#btn-apply-changes');
          if (applyBtn) {
            applyBtn.textContent = `Apply Approved Changes (${count} item${count !== 1 ? 's' : ''})`;
            applyBtn.disabled = count === 0;
          }
        });
      });

      container.querySelectorAll('.edit-field').forEach(input => {
        input.addEventListener('change', () => {
          const id = input.dataset.id;
          const field = input.dataset.field;
          if (!this.editValues[id]) this.editValues[id] = {};
          this.editValues[id][field] = input.value;
        });
      });

      container.querySelector('#btn-apply-changes')?.addEventListener('click', () => this.handleApplyChanges());
    }

    // ─── TAB 2: CHANGE QUEUE EVENTS ───
    if (this.activeSubTab === 'queue') {
      container.querySelectorAll('.queue-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.queueFilter = btn.dataset.filter;
          this.renderBody();
        });
      });

      container.querySelectorAll('[data-queue-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const action = btn.dataset.queueAction;
          const id = btn.dataset.id;
          const idx = this.changeQueue.findIndex(i => i.id === id);
          if (idx > -1) {
            this.changeQueue[idx].decision = action === 'accept' ? (this.changeQueue[idx].decision === 'accepted' ? 'pending' : 'accepted') : (this.changeQueue[idx].decision === 'dismissed' ? 'pending' : 'dismissed');
            await StorageService.saveChangeQueue(this.changeQueue);
            this.renderBody();
          }
        });
      });

      container.querySelector('#btn-apply-queue')?.addEventListener('click', () => this.handleApplyQueue());

      // Batch accept/dismiss selected in queue
      container.querySelector('#btn-queue-accept-selected')?.addEventListener('click', async () => {
        container.querySelectorAll('.queue-item-chk:checked').forEach(chk => {
          const id = chk.dataset.id;
          const item = this.changeQueue.find(i => i.id === id);
          if (item) item.decision = 'accepted';
        });
        await StorageService.saveChangeQueue(this.changeQueue);
        this.renderBody();
      });

      container.querySelector('#btn-queue-dismiss-selected')?.addEventListener('click', async () => {
        container.querySelectorAll('.queue-item-chk:checked').forEach(chk => {
          const id = chk.dataset.id;
          const item = this.changeQueue.find(i => i.id === id);
          if (item) item.decision = 'dismissed';
        });
        await StorageService.saveChangeQueue(this.changeQueue);
        this.renderBody();
      });

      // Toggle select all inside group
      container.querySelectorAll('.queue-select-all').forEach(allChk => {
        allChk.addEventListener('change', () => {
          const table = allChk.closest('table');
          table.querySelectorAll('.queue-item-chk').forEach(chk => {
            if (!chk.disabled) chk.checked = allChk.checked;
          });
        });
      });
    }

    // ─── TAB 3: DOCUMENT VAULT EVENTS ───
    if (this.activeSubTab === 'vault') {
      container.querySelector('#vault-search')?.addEventListener('input', (e) => {
        this.vaultSearch = e.target.value;
        // Search filter directly updates body
        this.renderBody();
      });
    }

    // ─── TAB 4: ASK DOCUMENTS EVENTS ───
    if (this.activeSubTab === 'ask') {
      const chkAllDocs = container.querySelector('#chk-all-docs');
      if (chkAllDocs) {
        chkAllDocs.addEventListener('change', () => {
          this.allDocsSelected = chkAllDocs.checked;
          const activeDocs = this.getActiveWorkspaceDocs();
          if (chkAllDocs.checked) {
            this.selectedDocIds = activeDocs.map(d => d.id);
          } else {
            this.selectedDocIds = [];
          }
          this.renderBody();
        });
      }

      container.querySelectorAll('.policy-doc-checkbox').forEach(chk => {
        chk.addEventListener('change', () => {
          const docId = chk.dataset.id;
          if (chk.checked) {
            if (!this.selectedDocIds.includes(docId)) this.selectedDocIds.push(docId);
          } else {
            this.selectedDocIds = this.selectedDocIds.filter(id => id !== docId);
          }
          const activeDocs = this.getActiveWorkspaceDocs();
          this.allDocsSelected = this.selectedDocIds.length === activeDocs.length;
          this.renderBody();
        });
      });

      container.querySelectorAll('.policy-suggest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const query = btn.dataset.query;
          this.policyQuery = query;
          const input = container.querySelector('#policy-qa-input');
          if (input) input.value = query;
          this.handlePolicyQAQuery(query);
        });
      });

      container.querySelectorAll('[data-history-idx]').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.historyIdx);
          this.activeQuestion = this.sessionQuestions[idx];
          this.policyQuery = this.activeQuestion.question;
          this.renderBody();
        });
      });

      const qaSubmitBtn = container.querySelector('#btn-policy-qa-submit');
      const qaInput = container.querySelector('#policy-qa-input');
      if (qaSubmitBtn && qaInput) {
        qaInput.addEventListener('input', (e) => {
          this.policyQuery = e.target.value;
        });

        qaSubmitBtn.addEventListener('click', () => {
          const query = qaInput.value.trim();
          if (query) this.handlePolicyQAQuery(query);
        });

        qaInput.addEventListener('keyup', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const query = qaInput.value.trim();
            if (query) this.handlePolicyQAQuery(query);
          }
        });
      }

      container.querySelector('#chk-policy-debug')?.addEventListener('change', (e) => {
        this.debugMode = e.target.checked;
        this.renderBody();
      });

      container.querySelector('#btn-toggle-evidence')?.addEventListener('click', () => {
        this.evidenceExpanded = !this.evidenceExpanded;
        const content = container.querySelector('#evidence-panel-content');
        const arrow = container.querySelector('#btn-toggle-evidence span');
        if (content) content.style.display = this.evidenceExpanded ? 'flex' : 'none';
        if (arrow) arrow.textContent = this.evidenceExpanded ? 'Collapse ▴' : 'Expand ▾';
      });

      container.querySelectorAll('.btn-delete-policy-doc').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const docId = btn.dataset.policyDeleteId;
          if (confirm('Are you sure you want to delete this policy document? This will also remove its extracted chunks.')) {
            await this.handleDeletePolicy(docId);
          }
        });
      });

      // Right panel recommendation creators
      container.querySelectorAll('.rec-queue-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const type = btn.dataset.recType;
          const title = btn.dataset.recTitle;
          const desc = btn.dataset.recDesc;
          const sourceDoc = btn.dataset.recSource;
          
          await this.handleCreateChangeQueueItem(type, title, desc, sourceDoc);
          btn.disabled = true;
          btn.textContent = '✓ Added';
          btn.style.background = 'var(--color-indigo-light)';
          btn.style.color = 'var(--color-indigo-hover)';
          btn.style.borderColor = 'rgba(0,184,156,0.2)';
        });
      });
    }

    // ─── TAB 5: POLICY LIBRARY & GENERATOR EVENTS ───
    if (this.activeSubTab === 'generator') {
      const domSelect = container.querySelector('#gen-domain-select');
      const tempSelect = container.querySelector('#gen-template-select');
      const indSelect = container.querySelector('#gen-industry-select');
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

      indSelect?.addEventListener('change', () => {
        this.genIndustry = indSelect.value;
      });

      promptInput?.addEventListener('input', () => {
        this.genPrompt = promptInput.value;
      });

      container.querySelectorAll('.profile-field').forEach(field => {
        field.addEventListener('input', () => {
          this.genProfile[field.dataset.key] = field.value;
        });
      });

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

      container.querySelector('#btn-generate-policy')?.addEventListener('click', () => this.handleGeneratePolicy(container));
      container.querySelector('#btn-save-draft-to-vault')?.addEventListener('click', () => this.handleSaveDraftToVault(container));
    }

    // ─── TAB 6: UPGRADE WIZARD & GAP AUDIT EVENTS ───
    if (this.activeSubTab === 'upgrade') {
      const docSelect = container.querySelector('#audit-doc-select');
      const fwSelect = container.querySelector('#audit-framework-select');

      docSelect?.addEventListener('change', () => {
        this.selectedDocId = docSelect.value;
        this.analysisResults = null;
        this.policyStudioDecisions = {};
        this.editedClauses = {};
        this.render(container);
      });

      fwSelect?.addEventListener('change', () => {
        this.targetFramework = fwSelect.value;
        this.analysisResults = null;
        this.policyStudioDecisions = {};
        this.editedClauses = {};
        this.render(container);
      });

      container.querySelector('#btn-run-policy-audit')?.addEventListener('click', () => this.handleRunPolicyAudit(container));

      container.querySelectorAll('.toggle-clause-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.clauseId;
          this.expandedClauseId = this.expandedClauseId === cid ? null : cid;
          this.render(container);
        });
      });

      container.querySelectorAll('.clause-textarea').forEach(txt => {
        txt.addEventListener('change', () => {
          const cid = txt.dataset.clauseId;
          this.editedClauses[cid] = txt.value;
        });
      });

      container.querySelectorAll('.clause-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const cid = btn.dataset.clauseId;
          if (action === 'accept') {
            this.policyStudioDecisions[cid] = this.policyStudioDecisions[cid] === 'accepted' ? 'pending' : 'accepted';
          } else {
            this.policyStudioDecisions[cid] = this.policyStudioDecisions[cid] === 'dismissed' ? 'pending' : 'dismissed';
          }
          this.render(container);
        });
      });

      container.querySelectorAll('.push-cq-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const type = btn.dataset.type;
          const cid = btn.dataset.clauseId;
          const gap = this.analysisResults?.gaps.find(g => g.id === cid);
          if (!gap) return;

          const activeDoc = this.vaultEntries.find(d => d.id === this.selectedDocId);
          const sourceDoc = activeDoc ? activeDoc.documentName : 'Upgrade Wizard';
          const clauseText = this.editedClauses[cid] !== undefined ? this.editedClauses[cid] : gap.text;

          btn.disabled = true;
          btn.textContent = 'Mapping...';

          try {
            await this.pushToChangeQueue(type, gap.name, clauseText, {
              confidence: gap.confidence || 'high',
              sourceDocument: sourceDoc,
              framework: this.targetFramework,
              clauseId: cid
            });
            btn.textContent = '✓ Mapped';
            btn.style.background = 'var(--color-indigo-light)';
            btn.style.color = 'var(--color-indigo-hover)';
          } catch (e) {
            console.error('Queue push failed:', e);
            btn.disabled = false;
            btn.textContent = 'Retry Mapping';
          }
        });
      });

      container.querySelector('#btn-approve-and-stage')?.addEventListener('click', () => {
        this.isPublishing = true;
        this.activeSubTab = 'versions';
        this.render(container);
      });
    }

    // ─── TAB 7: APPROVED VERSIONS EVENTS ───
    if (this.activeSubTab === 'versions') {
      const verDocSelect = container.querySelector('#ver-doc-select');
      verDocSelect?.addEventListener('change', () => {
        this.selectedDocId = verDocSelect.value;
        this.render(container);
      });

      container.querySelector('#btn-submit-publication')?.addEventListener('click', () => this.handlePublishVersion(container));
      container.querySelector('#btn-cancel-publication')?.addEventListener('click', () => {
        this.isPublishing = false;
        this.reviewSummary = '';
        this.render(container);
      });

      container.querySelectorAll('.view-ver-text-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.verIdx);
          const versions = this.getPolicyVersions(this.selectedDocId);
          const v = versions[idx];
          if (v) {
            alert(`--- Version ${v.version} Text ---\n\n${v.content}`);
          }
        });
      });
    }
  }

  // ─── FILE UPLOAD HANDLER ──────────────────────────────────────────────────
  async handleFileUpload(file) {
    this.currentFile = file;
    this.uploadState = 'reading';
    this.renderBody();

    const { text, error: extractError } = await DocumentExtractionService.extractText(file);
    if (extractError) {
      this.uploadState = 'error';
      this.extractionError = extractError;
      this.renderBody();
      return;
    }

    this.extractedText = text;
    const chunks = DocumentExtractionService.chunkText(text);
    this.segmentCount = chunks.length;
    this.uploadState = 'extracting';
    this.renderBody();

    const settings = this.state.settings || {};
    const { result, segments, error: geminiError } = await DocumentExtractionService.extractWithGemini(
      text,
      this.state.risks || [],
      settings
    );

    if (geminiError || !result) {
      this.uploadState = 'error';
      this.extractionError = geminiError || 'AI extraction failed. Please try a cleaner version of this document.';
      this.renderBody();
      return;
    }

    const withDelta = DocumentExtractionService.applyDeltaToExtraction(result, this.state.risks || []);
    this.extractionResult = withDelta;
    this.segmentCount = segments;

    const allItems = this.getAllReviewItems();
    allItems.forEach(item => {
      if (!this.itemDecisions[item.id]) this.itemDecisions[item.id] = 'pending';
    });

    this.uploadState = 'review';
    this.renderBody();
  }

  getAllReviewItems() {
    const result = this.extractionResult;
    if (!result) return [];
    return [
      ...(result.extracted_risks || []).map(r => ({ ...r, itemType: 'Risk' })),
      ...(result.extracted_controls || []).map(c => ({ ...c, itemType: 'Control' })),
      ...(result.extracted_policies || []).map(p => ({ ...p, title: p.policy_name, itemType: 'Policy' })),
      ...(result.extracted_actions || []).map(a => ({ ...a, itemType: 'Action' })),
      ...(result.gaps_detected || []).map(g => ({ ...g, title: g.description, itemType: 'Gap' }))
    ];
  }

  async handleApplyChanges() {
    this.uploadState = 'applying';
    this.renderBody();

    const allItems = this.getAllReviewItems();
    let accepted = 0;
    let dismissed = 0;
    const unreviewed = [];

    for (const item of allItems) {
      const decision = this.itemDecisions[item.id] || 'pending';
      if (decision === 'accepted') {
        if (item.itemType === 'Risk') {
          const edits = this.editValues[item.id] || {};
          const merged = { ...item, ...edits };
          const risk = DocumentExtractionService.extractedRiskToRegisterRisk(merged);
          try {
            await StorageService.saveRisk(risk, 'Imported via GRC Intake');
          } catch (e) {
            console.error('Failed to save risk:', e);
          }
        }
        accepted++;
      } else if (decision === 'dismissed') {
        dismissed++;
      } else {
        unreviewed.push({
          ...item,
          decision: 'pending',
          sourceDocument: this.currentFile?.name || 'Unknown',
          uploadDate: new Date().toISOString()
        });
      }
    }

    const existingQueue = await StorageService.getChangeQueue();
    await StorageService.saveChangeQueue([...existingQueue, ...unreviewed]);

    const result = this.extractionResult;
    const docId = this.generateUUID();
    const vaultEntry = {
      id: docId,
      documentName: this.currentFile?.name || 'Unknown',
      documentType: result?.document_type || 'other',
      documentSummary: result?.document_summary || '',
      uploadDate: new Date().toISOString(),
      extractedCounts: {
        risks: (result?.extracted_risks || []).length,
        controls: (result?.extracted_controls || []).length,
        policies: (result?.extracted_policies || []).length,
        actions: (result?.extracted_actions || []).length,
        gaps: (result?.gaps_detected || []).length
      },
      status: unreviewed.length === 0 ? 'fully_processed' : 'partially_processed',
      changesAccepted: accepted,
      changesDismissed: dismissed,
      rawExtraction: result
    };
    await StorageService.saveVaultEntry(vaultEntry);

    if (this.extractedText) {
      const newDoc = {
        id: docId,
        title: vaultEntry.documentName.replace(/\.[^/.]+$/, ""),
        document_type: vaultEntry.documentType,
        framework_tags: result?.framework_tags || (vaultEntry.documentType ? [vaultEntry.documentType] : ['Internal Governance']),
        file_name: vaultEntry.documentName,
        file_url: '',
        mime_type: 'application/octet-stream',
        status: 'Ready',
        extracted_text: this.extractedText,
        summary: vaultEntry.documentSummary,
        created_at: vaultEntry.uploadDate,
        updated_at: new Date().toISOString()
      };
      await StorageService.savePolicyDocument(newDoc);

      const chunks = DocumentExtractionService.chunkPolicyText(this.extractedText);
      const mappedChunks = chunks.map(c => ({
        ...c,
        id: this.generateUUID(),
        document_id: docId
      }));
      await StorageService.savePolicyChunks(mappedChunks);
    }

    this.state.risks = await StorageService.getRisks();
    this.onStateChange({ risks: this.state.risks });

    await this.loadData();
    this.uploadState = 'done';
    this.renderBody();
  }

  // ─── CHANGE QUEUE APPLY ───────────────────────────────────────────────────
  async handleApplyQueue() {
    const accepted = this.changeQueue.filter(i => i.decision === 'accepted');
    for (const item of accepted) {
      try {
        if (item.itemType === 'Risk') {
          const risk = DocumentExtractionService.extractedRiskToRegisterRisk(item);
          await StorageService.saveRisk(risk, 'Imported via GRC Queue');
        } else if (item.itemType === 'Control') {
          const riskId = item.metadata?.riskId || 'risk-001';
          const targetRisk = this.state.risks.find(r => r.id === riskId);
          if (targetRisk) {
            const controls = targetRisk.controls || [];
            controls.push({
              name: item.title.replace('Map mitigating control: ', ''),
              effectiveness: item.metadata?.effectiveness || 'Highly Effective',
              status: 'Active'
            });
            targetRisk.controls = controls;
            await StorageService.saveRisk(targetRisk);
          }
        } else if (item.itemType === 'Action') {
          const riskId = item.metadata?.riskId || 'risk-001';
          const targetRisk = this.state.risks.find(r => r.id === riskId);
          if (targetRisk) {
            const actions = targetRisk.actions || [];
            actions.push({
              title: item.title,
              owner: item.metadata?.owner || 'CISO',
              dueDate: item.metadata?.dueDate || new Date().toISOString().split('T')[0],
              status: 'Not Started'
            });
            targetRisk.actions = actions;
            await StorageService.saveRisk(targetRisk);
          }
        } else if (item.itemType === 'ObjectiveLink') {
          const riskId = item.metadata?.riskId || 'risk-001';
          const targetRisk = this.state.risks.find(r => r.id === riskId);
          if (targetRisk) {
            const objectiveIds = targetRisk.objectiveIds || [];
            const objId = item.metadata?.objectiveId || 'obj-cyber';
            if (!objectiveIds.includes(objId)) {
              objectiveIds.push(objId);
              targetRisk.objectiveIds = objectiveIds;
              await StorageService.saveRisk(targetRisk);
            }
          }
        }
      } catch (e) {
        console.error('Queue apply failed:', e);
      }
    }

    const remaining = this.changeQueue.filter(i => i.decision !== 'accepted');
    await StorageService.saveChangeQueue(remaining);
    
    // Sync vault statuses
    const affectedDocs = [...new Set(accepted.map(i => i.sourceDocument).filter(Boolean))];
    for (const docName of affectedDocs) {
      const remainingForDoc = remaining.filter(i => i.sourceDocument === docName);
      if (remainingForDoc.length === 0) {
        const vaultEntry = (this.vaultEntries || []).find(v => v.documentName === docName);
        if (vaultEntry && vaultEntry.status !== 'fully_processed') {
          vaultEntry.status = 'fully_processed';
          await StorageService.saveVaultEntry(vaultEntry);
        }
      }
    }

    this.state.risks = await StorageService.getRisks();
    this.onStateChange({ risks: this.state.risks });

    await this.loadData();
    this.renderBody();
  }

  // ─── ASK DOCUMENTS Q&A METHOD ─────────────────────────────────────────────
  async handlePolicyQAQuery(query) {
    if (!query) return;
    
    this.sessionMetrics.questionsAsked++;
    this.policyQALoading = true;
    this.activeQuestion = null;
    this.renderBody(); 
    
    try {
      const selectedDocIds = this.selectedDocIds || [];
      const matchingChunks = await StorageService.retrieveRelevantChunks(query, selectedDocIds, 4);
      
      const settings = {
        ...this.state.settings,
        selectedDocIds: this.selectedDocIds
      };
      
      const aiResponse = await AIService.answerPolicyQuestion(query, matchingChunks, settings);
      
      const directAnswer = aiResponse.direct_answer || "";
      const isBypassed = directAnswer.toLowerCase().includes("no evidence") ||
                         directAnswer.toLowerCase().includes("no relevant evidence");
      
      if (isBypassed) {
        if (aiResponse.metadata && aiResponse.metadata.chunksRetrieved === 0) {
          this.sessionMetrics.questionsBypassed++;
        }
        this.sessionMetrics.noEvidenceResponses++;
      } else {
        this.sessionMetrics.questionsAnswered++;
      }

      if (aiResponse.metadata && aiResponse.metadata.evidenceStrength !== 'High') {
        this.sessionMetrics.weakRetrievals++;
      }
      
      const newQuestion = {
        id: `q-session-${Date.now()}`,
        question: query,
        answer: aiResponse,
        timestamp: new Date().toISOString(),
        selectedDocNames: this.getSelectedDocNamesSummary(),
        documentsSelected: selectedDocIds.length,
        documentsUsed: aiResponse.metadata?.documentsUsed || 0,
        chunksRetrieved: aiResponse.metadata?.chunksRetrieved || 0,
        evidenceStrength: aiResponse.metadata?.evidenceStrength || 'Low',
        usedDocNames: aiResponse.metadata?.usedDocIds?.map(id => {
          const doc = this.vaultEntries.find(d => d.id === id);
          return doc ? doc.documentName : 'Unknown';
        }) || [],
        averageScore: aiResponse.metadata?.averageScore || 0,
        retrievedDocIds: aiResponse.metadata?.retrievedDocIds || [],
        retrievedChunkIds: aiResponse.metadata?.retrievedChunkIds || [],
        chunkScores: aiResponse.metadata?.chunkScores || [],
        contextLength: aiResponse.metadata?.contextLength || 0,
        chunksSupplied: aiResponse.metadata?.chunksSupplied || []
      };
      
      this.sessionQuestions.push(newQuestion);
      this.activeQuestion = newQuestion;
    } catch (err) {
      console.error('Q&A analysis error:', err);
      this.sessionMetrics.questionsBypassed++;
      this.sessionMetrics.noEvidenceResponses++;
      
      const failedQuestion = {
        id: `q-session-fail-${Date.now()}`,
        question: query,
        answer: {
          direct_answer: "No relevant evidence was found in the selected documents.",
          citations: [],
          gaps_detected: [],
          recommended_actions: [],
          confidence: "Low",
          evidence_strength: "Low"
        },
        timestamp: new Date().toISOString(),
        selectedDocNames: this.getSelectedDocNamesSummary(),
        documentsSelected: this.selectedDocIds.length,
        documentsUsed: 0,
        chunksRetrieved: 0,
        evidenceStrength: 'Low',
        usedDocNames: [],
        averageScore: 0,
        retrievedDocIds: [],
        retrievedChunkIds: [],
        chunkScores: [],
        contextLength: 0,
        chunksSupplied: []
      };
      this.sessionQuestions.push(failedQuestion);
      this.activeQuestion = failedQuestion;
    } finally {
      this.policyQALoading = false;
      this.policyQuery = ''; 
      this.renderBody();
    }
  }

  async handleDeletePolicy(docId) {
    await StorageService.deletePolicyDocument(docId);
    this.selectedDocIds = this.selectedDocIds.filter(id => id !== docId);
    await this.loadData();
    this.renderBody();
  }

  async handleCreateChangeQueueItem(type, title, desc, sourceDoc) {
    const newItem = {
      id: `ext-${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemType: type,
      title: title,
      description: desc,
      deltaStatus: 'New',
      confidence: 'high',
      sourceDocument: sourceDoc || 'Policy Intelligence',
      uploadDate: new Date().toISOString(),
      decision: 'pending'
    };
    
    const existing = await StorageService.getChangeQueue();
    await StorageService.saveChangeQueue([...existing, newItem]);
    this.changeQueue = await StorageService.getChangeQueue();
  }

  // ─── POLICY GENERATOR METHODS ─────────────────────────────────────────────
  async handleGeneratePolicy(container) {
    this.isGenerating = true;
    this.render(container);

    try {
      const baseText = PolicyTemplateService.customizeTemplate(this.genDomain, this.genTemplate, this.genIndustry, {
        companyName: this.state.settings?.companyName,
        ...this.genProfile
      });

      const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      
      if (apiKey || this.state.serverGeminiConfigured) {
        const systemPrompt = `You are a professional corporate GRC officer.
Generate a policy draft for '${this.genTitle}' for an industry of type '${this.genIndustry}'.
Baseline reference:
${baseText}

Company Profile metadata:
- Operating Countries: ${this.genProfile.countries}
- Cloud Host: ${this.genProfile.cloudProvider}
- Employee Count: ${this.genProfile.employeeCount}
- Customer Target: ${this.genProfile.customerTypes}
- Data Categories: ${this.genProfile.dataCategories}

Specific directives:
${this.genPrompt || 'None.'}

Format cleanly with headers. Return only policy document text.`;
        
        const liveResult = await AIService.queryGemini(systemPrompt, apiKey);
        this.genResultText = liveResult || baseText;
      } else {
        await new Promise(r => setTimeout(r, 1200));
        let simulatedText = `[SIMULATED BASELINE] ${this.genTitle}\n\n` + baseText;
        if (this.genPrompt) {
          simulatedText += `\n\nDirectives mapping:\n- ${this.genPrompt}`;
        }
        this.genResultText = simulatedText;
      }
    } catch (err) {
      console.error("Drafting failed:", err);
      this.genResultText = `Drafting failed. Baseline template: \n\n` + PolicyTemplateService.customizeTemplate(this.genDomain, this.genTemplate, this.genIndustry, this.genProfile);
    } finally {
      this.isGenerating = false;
      this.render(container);
    }
  }

  async handleSaveDraftToVault(container) {
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

    this.savePolicyVersion(docId, {
      summary: 'Initial draft version generated via Policy Intelligence Studio.',
      frameworks: [this.genIndustry],
      content: this.genResultText
    });

    await this.loadData();
    alert("Draft policy saved successfully to vault and initialized in version history.");
    
    this.selectedDocId = docId;
    this.activeSubTab = 'upgrade';
    this.render(container);
  }

  // ─── AUDIT & UPGRADE METHODS ──────────────────────────────────────────────
  async handleRunPolicyAudit(container) {
    const activeDoc = this.policyDocs.find(d => d.id === this.selectedDocId);
    if (!activeDoc) return;

    this.isAnalyzing = true;
    this.render(container);

    try {
      const apiKey = this.state.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      const packs = PolicyTemplateService.getRequirementPacks();
      const pack = packs[this.targetFramework];
      
      const reqText = (pack?.requirements || []).map(r => `- ${r.name}: ${r.desc}`).join('\n');

      if (apiKey || this.state.serverGeminiConfigured) {
        const auditPrompt = `You are a compliance officer. Compare the policy '${activeDoc.title}' to these framework requirements:\n${reqText}\n\nPolicy Text:\n${activeDoc.extracted_text}\n\nAssess coverage. Return JSON schema exactly matching this structure:\n{
          "summary": "Compliance summary",
          "coverage": 75,
          "strong": ["Requirement Name"],
          "weak": ["Requirement Name"],
          "missing": ["Requirement Name"],
          "gaps": [
            {
              "id": "gap-1",
              "reqName": "Requirement Name",
              "name": "Clause Name",
              "status": "Missing"|"Weak",
              "text": "Suggested Clause Text",
              "rationale": "Justification",
              "confidence": "High"
            }
          ],
          "amendments": [
            { "action": "Add/Modify", "desc": "amendment details" }
          ]
        }`;

        const raw = await AIService.queryGemini(auditPrompt, apiKey);
        let cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        this.analysisResults = JSON.parse(cleanJson);
      } else {
        await new Promise(r => setTimeout(r, 1400));
        
        // Seed mockup results
        const strong = [];
        const weak = [];
        const missing = [];
        const gaps = [];
        const requirements = pack?.requirements || [];
        
        requirements.forEach((r, idx) => {
          if (idx === 0) {
            strong.push(r.name);
          } else if (idx === 1) {
            weak.push(r.name);
            gaps.push({
              id: `gap-${idx}`,
              reqName: r.name,
              name: `Mitigate ${r.name}`,
              status: 'Weak',
              text: `To satisfy ${r.name}, the organization will review access permissions every 90 days and automatically expire inactive accounts.`,
              rationale: `Existing controls do not log periodic access cleanups.`,
              confidence: 'High'
            });
          } else {
            missing.push(r.name);
            gaps.push({
              id: `gap-${idx}`,
              reqName: r.name,
              name: `Establish ${r.name}`,
              status: 'Missing',
              text: `The CISO will audit logging compliance logs annually, ensuring all authorization checks are retained for 365 days.`,
              rationale: `Policy document makes no reference to retention timeline rules.`,
              confidence: 'High'
            });
          }
        });

        this.analysisResults = {
          summary: `The policy has strong controls for access request registration, but fails to define formal revocation timelines and periodic logs audits required for ${pack.name}.`,
          coverage: Math.round((strong.length / requirements.length) * 100),
          strong,
          weak,
          missing,
          gaps,
          amendments: gaps.map(g => ({ action: g.status === 'Missing' ? 'Add Section' : 'Modify Clause', desc: g.text }))
        };
      }
    } catch (e) {
      console.error('Audit failed:', e);
      alert('Audit failed. Falling back to default simulation.');
    } finally {
      this.isAnalyzing = false;
      this.render(container);
    }
  }

  async handlePublishVersion(container) {
    const activeDoc = this.policyDocs.find(d => d.id === this.selectedDocId);
    if (!activeDoc) return;

    this.isPublishing = true;
    this.render(container);

    let updatedText = activeDoc.extracted_text;

    // Apply accepted amendments to text
    const results = this.analysisResults;
    if (results && results.gaps) {
      results.gaps.forEach(g => {
        const decision = this.policyStudioDecisions[g.id] || 'pending';
        if (decision === 'accepted') {
          const insertText = this.editedClauses[g.id] !== undefined ? this.editedClauses[g.id] : g.text;
          updatedText += `\n\nAmendment [${g.reqName}]:\n${insertText}`;
        }
      });
    }

    const summaryNotes = container.querySelector('#pub-summary-input')?.value || 'Amended version approved via Upgrade Wizard.';
    
    // Save version
    const newVer = this.savePolicyVersion(this.selectedDocId, {
      summary: summaryNotes,
      frameworks: [this.targetFramework],
      content: updatedText
    });

    // Save policy document content updates
    activeDoc.extracted_text = updatedText;
    activeDoc.updated_at = new Date().toISOString();
    await StorageService.savePolicyDocument(activeDoc);

    // Save vault entry log details
    const vault = this.vaultEntries.find(d => d.id === this.selectedDocId);
    if (vault) {
      const accepted = Object.values(this.policyStudioDecisions).filter(d => d === 'accepted').length;
      const dismissed = Object.values(this.policyStudioDecisions).filter(d => d === 'dismissed').length;
      vault.changesAccepted = (vault.changesAccepted || 0) + accepted;
      vault.changesDismissed = (vault.changesDismissed || 0) + dismissed;
      await StorageService.saveVaultEntry(vault);
    }

    // Reset status
    this.isPublishing = false;
    this.reviewSummary = '';
    this.analysisResults = null;
    this.policyStudioDecisions = {};
    this.editedClauses = {};
    
    await this.loadData();
    alert(`Success: Version ${newVer.version} successfully committed to ledger.`);
    this.render(container);
  }

  // ─── HELPERS ───
  formatPoliciesMarkdown(text) {
    if (!text) return "";
    let html = text;
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:12px;font-weight:700;color:var(--color-navy);margin-top:8px;margin-bottom:4px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:10px;font-weight:700;color:var(--color-navy-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;margin-bottom:2px;">$1</h5>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:6px 0;" />');
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;list-style:decimal;">$1</li>');
    return html;
  }
}
