// Risk Intelligence Desk Component — Document Upload, AI Extraction, Change Queue, Document Vault

import { AIInsightService } from '../services/aiInsightService.js';
import { StorageService } from '../services/storageService.js';
import { DocumentExtractionService } from '../services/documentExtractionService.js';
import { AIService } from '../services/aiService.js';

const RISK_CATEGORIES = [
  'Strategic', 'Operational', 'Financial', 'Technology', 'Compliance',
  'Reputational', 'People', 'Legal', 'Cyber', 'Market'
];

export class IntakeComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.activeTab = 'upload'; // 'upload' | 'queue' | 'vault'
    this.uploadState = 'idle'; // 'idle' | 'reading' | 'extracting' | 'review' | 'applying' | 'done' | 'error'
    this.extractionResult = null;
    this.extractionError = null;
    this.segmentCount = 1;
    this.currentFile = null;
    this.itemDecisions = {};  // id -> 'accepted' | 'dismissed' | 'editing' | 'pending'
    this.editValues = {};     // id -> { title, likelihood, impact, category, owner }
    this.changeQueue = [];
    this.vaultEntries = [];
    this.queueFilter = 'All';
    this.vaultSearch = '';
    this.selectedDocIds = [];
    this.sessionQuestions = [];
    this.activeQuestion = null;
    this.allDocsSelected = true;
    this.policyQALoading = false;
    this.showPolicyUploadDrawer = false;
    this._container = null;
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
      if ((!this.selectedDocIds || this.selectedDocIds.length === 0) && this.policyDocs && this.policyDocs.length > 0) {
        this.selectedDocIds = this.policyDocs.map(d => d.id);
        this.allDocsSelected = true;
      }
    } catch (e) {
      this.policyDocs = [];
    }
  }

  // ─── RENDER ENTRY POINT ───────────────────────────────────────────────────

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
          <span class="profile-role-badge">Data Ingestion Layer</span>
          <h1>Risk Intelligence Desk</h1>
          <p class="page-subtitle">Upload documents, extract risk intelligence with AI, review before saving. Nothing writes without your approval.</p>
        </div>
      </div>

      <div class="intake-tab-bar" id="intake-tab-bar">
        <button class="intake-tab ${this.activeTab === 'upload' ? 'active' : ''}" data-tab="upload" id="tab-btn-upload">Upload &amp; Extract</button>
        <button class="intake-tab ${this.activeTab === 'queue' ? 'active' : ''}" data-tab="queue" id="tab-btn-queue">
          Change Queue
          ${pendingCount > 0 ? `<span class="queue-badge">${pendingCount}</span>` : ''}
        </button>
        <button class="intake-tab ${this.activeTab === 'vault' ? 'active' : ''}" data-tab="vault" id="tab-btn-vault">Document Vault</button>
        <button class="intake-tab ${this.activeTab === 'policies' ? 'active' : ''}" data-tab="policies" id="tab-btn-policies">Ask Documents</button>
      </div>

      <div id="intake-body"></div>
    `;
  }

  renderBody() {
    const body = this._container.querySelector('#intake-body');
    if (!body) return;
    
    let currentInputVal = '';
    if (this.activeTab === 'policies') {
      const input = body.querySelector('#policy-qa-input');
      if (input) currentInputVal = input.value;
    }
    
    if (this.activeTab === 'upload') body.innerHTML = this.renderUploadTab();
    else if (this.activeTab === 'queue') body.innerHTML = this.renderQueueTab();
    else if (this.activeTab === 'vault') body.innerHTML = this.renderVaultTab();
    else if (this.activeTab === 'policies') body.innerHTML = this.renderPoliciesTab();
    
    if (this.activeTab === 'policies' && currentInputVal) {
      const input = body.querySelector('#policy-qa-input');
      if (input) input.value = currentInputVal;
    }
    
    this.bindBodyEvents(body);
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
        <div class="intake-dropzone" id="intake-dropzone">
          <div class="dropzone-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:48px;height:48px;color:var(--color-teal);margin:0 auto 16px;display:block;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Drag &amp; drop a document here</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">or click to browse your files</p>
            <input type="file" id="intake-file-input" accept=".pdf,.xlsx,.xls,.csv,.docx" style="display:none;">
            <label for="intake-file-input" class="btn btn-primary" style="cursor:pointer;">Choose File</label>
            <p style="font-size:11px;color:var(--text-muted);margin-top:16px;">Supported: PDF (text-based), Excel (.xlsx, .xls), CSV, Word (.docx)</p>
            <p style="font-size:11px;color:var(--text-muted);">Scanned image PDFs are not supported — please use a text-based PDF.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderProcessing(title, subtitle) {
    return `
      <div class="glass-panel" style="padding:60px 20px;text-align:center;">
        <div class="intake-spinner"></div>
        <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin:20px 0 8px;">${title}</h3>
        <p style="font-size:13px;color:var(--text-secondary);">${subtitle}</p>
      </div>
    `;
  }

  renderError() {
    return `
      <div class="glass-panel" style="padding:40px 20px;text-align:center;">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:24px;height:24px;color:var(--color-critical);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:var(--color-critical);margin-bottom:8px;">Extraction Failed</h3>
        <p style="font-size:13px;color:var(--text-secondary);max-width:440px;margin:0 auto 20px;">${this.extractionError || 'An unknown error occurred.'}</p>
        <button class="btn btn-secondary" id="btn-reset-upload">Try Another Document</button>
      </div>
    `;
  }

  renderDone() {
    const accepted = Object.values(this.itemDecisions).filter(d => d === 'accepted').length;
    const dismissed = Object.values(this.itemDecisions).filter(d => d === 'dismissed').length;
    return `
      <div class="glass-panel" style="padding:40px 20px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(0,181,181,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:28px;height:28px;color:var(--color-teal);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Changes Applied Successfully</h3>
        <div style="display:flex;gap:20px;justify-content:center;margin:16px 0;">
          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--color-teal);">${accepted}</div>
            <div style="font-size:11px;color:var(--text-secondary);">Items Accepted</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--text-muted);">${dismissed}</div>
            <div style="font-size:11px;color:var(--text-secondary);">Items Dismissed</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:20px;">Document saved to vault. Unreviewed items added to Change Queue.</p>
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
      ? `<div style="background:rgba(0,181,181,0.06);border:1px solid rgba(0,181,181,0.2);border-radius:6px;padding:8px 12px;font-size:11px;color:var(--color-teal);margin-bottom:12px;">⚡ Large document — processed in ${this.segmentCount} segments. Results have been merged and deduplicated.</div>`
      : '';

    return `
      ${segNote}

      <!-- Summary Card -->
      <div class="glass-panel" style="margin-bottom:16px;padding:18px 20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="status-badge within" style="font-size:10px;">${result.document_type || 'Unknown'}</span>
              <span style="font-size:11px;color:var(--text-muted);">from: <strong>${this.currentFile?.name || 'Document'}</strong></span>
            </div>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;max-width:500px;margin:0;">${result.document_summary || 'No summary available.'}</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--text-primary);">${risks.length}</div><div style="font-size:10px;color:var(--text-secondary);">Risks</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--text-primary);">${controls.length}</div><div style="font-size:10px;color:var(--text-secondary);">Controls</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--text-primary);">${actions.length}</div><div style="font-size:10px;color:var(--text-secondary);">Actions</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--text-primary);">${gaps.length}</div><div style="font-size:10px;color:var(--text-secondary);">Gaps</div></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);flex-wrap:wrap;">
          <span style="background:rgba(0,181,181,0.08);color:var(--color-teal);border:1px solid rgba(0,181,181,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟢 ${counts.New} New</span>
          <span style="background:rgba(245,158,11,0.08);color:var(--color-warning);border:1px solid rgba(245,158,11,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟡 ${counts.Update} Updates</span>
          <span style="background:rgba(107,114,128,0.08);color:var(--text-muted);border:1px solid rgba(107,114,128,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">⚪ ${counts.Duplicate} Duplicates</span>
          <span style="background:rgba(239,68,68,0.08);color:var(--color-critical);border:1px solid rgba(239,68,68,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🔴 ${counts.Conflict} Conflicts</span>
        </div>
      </div>

      <!-- Batch Actions Bar -->
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
        <button class="btn btn-secondary btn-small" id="btn-select-all">Select All</button>
        <button class="btn btn-secondary btn-small" id="btn-accept-high">Accept All High Confidence</button>
        <button class="btn btn-secondary btn-small" id="btn-dismiss-dupes">Dismiss All Duplicates</button>
        <div style="flex:1;"></div>
        <span style="font-size:11px;color:var(--text-muted);">${acceptedCount} items accepted</span>
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
      New: '<span style="background:rgba(0,181,181,0.1);color:var(--color-teal);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">New</span>',
      Update: '<span style="background:rgba(245,158,11,0.1);color:var(--color-warning);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:rgba(107,114,128,0.1);color:var(--text-muted);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:rgba(239,68,68,0.1);color:var(--color-critical);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Conflict</span>'
    }[item.deltaStatus] || '';

    const confColor = { high: 'var(--color-teal)', medium: 'var(--color-warning)', low: 'var(--text-muted)' }[item.confidence] || 'var(--text-muted)';

    const editValues = this.editValues[item.id] || {};
    const displayTitle = editValues.title || item.title || '—';
    const displayDesc = item.description || item.linked_risk_hint || (item.appetite_statements || []).join('; ') || item.source_reference || '';

    const rowStyle = isDismissed ? 'opacity:0.4;' : isAccepted ? 'background:rgba(0,181,181,0.03);' : '';

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
          <span style="background:rgba(99,102,241,0.1);color:var(--color-indigo);padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;">${item.itemType}</span>
        </td>
        <td style="padding:10px 12px;">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:2px;">${displayTitle}</div>
          ${displayDesc ? `<div style="font-size:11px;color:var(--text-secondary);line-height:1.4;">${displayDesc.slice(0, 120)}${displayDesc.length > 120 ? '...' : ''}</div>` : ''}
          ${item.source_reference && item.itemType !== 'Gap' ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">📄 ${item.source_reference}</div>` : ''}
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
        <div style="margin-top:10px;padding:12px;background:rgba(0,0,0,0.03);border-radius:6px;border:1px solid var(--border-color);" data-edit-form="${item.id}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div>
              <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Title</label>
              <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="title" data-id="${item.id}" value="${vals.title || item.title || ''}">
            </div>
            <div>
              <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Owner</label>
              <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="owner" data-id="${item.id}" value="${vals.owner || item.owner || ''}">
            </div>
            <div>
              <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Category</label>
              <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="category" data-id="${item.id}">
                ${RISK_CATEGORIES.map(c => `<option value="${c}" ${(vals.category || item.category) === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Likelihood (1-5)</label>
                <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="likelihood" data-id="${item.id}">
                  ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(vals.likelihood || item.likelihood) === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Impact (1-5)</label>
                <select class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="impact" data-id="${item.id}">
                  ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(vals.impact || item.impact) === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Non-risk items: title edit only
      return `
        <div style="margin-top:8px;" data-edit-form="${item.id}">
          <input type="text" class="form-control edit-field" style="font-size:11px;padding:4px 8px;" data-field="title" data-id="${item.id}" value="${vals.title || item.title || ''}">
        </div>
      `;
    }
  }

  // ─── TAB 2: CHANGE QUEUE ──────────────────────────────────────────────────

  renderQueueTab() {
    const filters = ['All', 'New Risks', 'Updates', 'Conflicts', 'Gaps', 'High Confidence Only'];
    let items = this.changeQueue || [];

    // Apply filter
    if (this.queueFilter === 'New Risks') items = items.filter(i => i.deltaStatus === 'New' && i.itemType === 'Risk');
    else if (this.queueFilter === 'Updates') items = items.filter(i => i.deltaStatus === 'Update');
    else if (this.queueFilter === 'Conflicts') items = items.filter(i => i.deltaStatus === 'Conflict');
    else if (this.queueFilter === 'Gaps') items = items.filter(i => i.itemType === 'Gap');
    else if (this.queueFilter === 'High Confidence Only') items = items.filter(i => i.confidence === 'high');

    // Conflicts always pinned to top
    const conflicts = items.filter(i => i.deltaStatus === 'Conflict');
    const rest = items.filter(i => i.deltaStatus !== 'Conflict');
    const sorted = [...conflicts, ...rest];

    const pending = sorted.filter(i => !i.decision || i.decision === 'pending');

    if (this.changeQueue.length === 0) {
      return `
        <div class="glass-panel" style="padding:60px 20px;text-align:center;">
          <p style="font-size:14px;color:var(--text-muted);">Your change queue is empty.</p>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Upload a document to begin.</p>
        </div>
      `;
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
      ${sorted.length === 0 ? `<div class="glass-panel" style="padding:30px;text-align:center;"><p style="color:var(--text-muted);font-size:13px;">No items match the selected filter.</p></div>` : ''}
      ${this.renderQueueGroups(sorted)}
    `;
  }

  renderQueueGroups(items) {
    // Group by source document
    const groups = {};
    for (const item of items) {
      const src = item.sourceDocument || 'Unknown Document';
      if (!groups[src]) groups[src] = [];
      groups[src].push(item);
    }

    return Object.entries(groups).map(([docName, groupItems]) => `
      <div class="glass-panel" style="padding:0;overflow:hidden;margin-bottom:16px;">
        <div style="padding:12px 16px;background:rgba(0,0,0,0.02);border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="font-size:12px;font-weight:700;color:var(--text-primary);">${docName}</span>
            <span style="font-size:11px;color:var(--text-muted);margin-left:8px;">${groupItems.length} item${groupItems.length !== 1 ? 's' : ''}</span>
          </div>
          <span style="font-size:10px;color:var(--text-muted);">${groupItems[0]?.uploadDate ? new Date(groupItems[0].uploadDate).toLocaleDateString('en-GB') : ''}</span>
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
      New: '<span style="background:rgba(0,181,181,0.1);color:var(--color-teal);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">New</span>',
      Update: '<span style="background:rgba(245,158,11,0.1);color:var(--color-warning);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:rgba(107,114,128,0.1);color:var(--text-muted);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:rgba(239,68,68,0.1);color:var(--color-critical);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">⚠ Conflict</span>'
    }[item.deltaStatus] || '';
    const confColor = { high: 'var(--color-teal)', medium: 'var(--color-warning)', low: 'var(--text-muted)' }[item.confidence] || 'var(--text-muted)';
    const rowStyle = isDismissed ? 'opacity:0.4;' : isAccepted ? 'background:rgba(0,181,181,0.03);' : isConflict ? 'background:rgba(239,68,68,0.02);' : '';
    const actionBtns = isConflict
      ? `<button class="btn btn-secondary btn-small" data-queue-action="accept" data-id="${item.id}" style="font-size:10px;">Accept Anyway</button>
         <button class="btn btn-secondary btn-small" data-queue-action="dismiss" data-id="${item.id}" style="font-size:10px;">Dismiss</button>`
      : `<button class="btn btn-secondary btn-small" data-queue-action="accept" data-id="${item.id}" style="font-size:10px;">${isAccepted ? '✓ Accepted' : 'Accept'}</button>
         <button class="btn btn-secondary btn-small" data-queue-action="dismiss" data-id="${item.id}" style="font-size:10px;">${isDismissed ? 'Restore' : 'Dismiss'}</button>`;
    return `
      <tr style="border-bottom:1px solid var(--border-color);${rowStyle}">
        <td style="padding:8px 12px;"><input type="checkbox" class="queue-item-chk" data-id="${item.id}" ${isDismissed ? 'disabled' : ''} ${isAccepted ? 'checked' : ''} /></td>
        <td style="padding:8px 12px;"><span style="background:rgba(99,102,241,0.1);color:var(--color-indigo);padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;">${item.itemType}</span></td>
        <td style="padding:8px 12px;"><div style="font-weight:600;color:var(--text-primary);">${item.title || '—'}</div>${item.description ? `<div style="font-size:11px;color:var(--text-secondary);">${item.description.slice(0,80)}...</div>` : ''}</td>
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

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <input type="text" id="vault-search" class="form-control" placeholder="Search by document name or type..." value="${this.vaultSearch}" style="max-width:320px;font-size:12px;padding:6px 10px;" />
      </div>

      ${entries.length === 0 ? `
        <div class="glass-panel" style="padding:60px 20px;text-align:center;">
          <p style="font-size:14px;color:var(--text-muted);">No documents uploaded yet.</p>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Processed documents appear here with their full audit trail.</p>
        </div>
      ` : `
        <div class="vault-card-grid">
          ${entries.map(e => this.renderVaultCard(e)).join('')}
        </div>
      `}
    `;
  }

  renderVaultCard(entry) {
    const counts = entry.extractedCounts || {};
    const statusColors = {
      fully_processed: { bg: 'rgba(0,181,181,0.1)', color: 'var(--color-teal)', label: 'Fully Processed' },
      partially_processed: { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', label: 'Partially Processed' },
      pending_review: { bg: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', label: 'Pending Review' }
    };
    const sc = statusColors[entry.status] || statusColors.pending_review;
    const uploadDate = entry.uploadDate ? new Date(entry.uploadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return `
      <div class="vault-card" data-vault-id="${entry.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">${entry.documentName || 'Unknown'}</div>
            <span style="background:rgba(99,102,241,0.1);color:var(--color-indigo);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">${entry.documentType || 'unknown'}</span>
          </div>
          <span style="background:${sc.bg};color:${sc.color};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;">${sc.label}</span>
        </div>
        <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:10px;">${entry.documentSummary ? entry.documentSummary.slice(0,120) + '...' : 'No summary.'}</p>
        <div style="display:flex;gap:12px;padding-top:10px;border-top:1px solid var(--border-color);font-size:10px;color:var(--text-muted);flex-wrap:wrap;">
          <span>📅 ${uploadDate}</span>
          <span>⚠️ ${counts.risks || 0} risks</span>
          <span>🔧 ${counts.controls || 0} controls</span>
          <span>✅ ${entry.changesAccepted || 0} accepted</span>
          <span>❌ ${entry.changesDismissed || 0} dismissed</span>
        </div>
      </div>
    `;
  }

  // ─── EVENT BINDING ────────────────────────────────────────────────────────

  bindEvents(container) {
    // Tab switching
    container.querySelectorAll('.intake-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        container.innerHTML = this.renderShell();
        this.loadData().then(() => {
          this.renderBody();
          this.bindEvents(container);
        });
      });
    });
  }

  bindBodyEvents(body) {
    // Dropzone drag-and-drop
    const dropzone = body.querySelector('#intake-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    // File input
    const fileInput = body.querySelector('#intake-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    // Reset upload
    const resetBtn = body.querySelector('#btn-reset-upload');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.uploadState = 'idle';
        this.extractionResult = null;
        this.extractionError = null;
        this.itemDecisions = {};
        this.editValues = {};
        this.renderBody();
      });
    }

    // Go to queue/vault
    const goQueue = body.querySelector('#btn-go-queue');
    if (goQueue) goQueue.addEventListener('click', () => { this.activeTab = 'queue'; this._container.innerHTML = this.renderShell(); this.loadData().then(() => { this.renderBody(); this.bindEvents(this._container); }); });
    const goVault = body.querySelector('#btn-go-vault');
    if (goVault) goVault.addEventListener('click', () => { this.activeTab = 'vault'; this._container.innerHTML = this.renderShell(); this.loadData().then(() => { this.renderBody(); this.bindEvents(this._container); }); });

    // Review batch actions
    body.querySelector('#btn-select-all')?.addEventListener('click', () => {
      const allItems = this.getAllReviewItems();
      allItems.forEach(item => {
        if (item.deltaStatus !== 'Conflict') this.itemDecisions[item.id] = 'accepted';
      });
      this.renderBody();
      this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
    });

    body.querySelector('#btn-accept-high')?.addEventListener('click', () => {
      const allItems = this.getAllReviewItems();
      allItems.filter(i => i.confidence === 'high' && i.deltaStatus !== 'Conflict').forEach(i => { this.itemDecisions[i.id] = 'accepted'; });
      this.renderBody();
      this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
    });

    body.querySelector('#btn-dismiss-dupes')?.addEventListener('click', () => {
      const allItems = this.getAllReviewItems();
      allItems.filter(i => i.deltaStatus === 'Duplicate').forEach(i => { this.itemDecisions[i.id] = 'dismissed'; });
      this.renderBody();
      this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
    });

    // Individual action buttons
    body.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!id) return;
        if (action === 'accept') {
          this.itemDecisions[id] = this.itemDecisions[id] === 'accepted' ? 'pending' : 'accepted';
        } else if (action === 'dismiss') {
          this.itemDecisions[id] = this.itemDecisions[id] === 'dismissed' ? 'pending' : 'dismissed';
        } else if (action === 'edit') {
          this.itemDecisions[id] = this.itemDecisions[id] === 'editing' ? 'pending' : 'editing';
        }
        this.renderBody();
        this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
      });
    });

    // Edit field changes
    body.querySelectorAll('.edit-field').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.id;
        const field = input.dataset.field;
        if (!this.editValues[id]) this.editValues[id] = {};
        this.editValues[id][field] = input.value;
      });
    });

    // Checkbox individual
    body.querySelectorAll('.item-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.dataset.id;
        this.itemDecisions[id] = chk.checked ? 'accepted' : 'pending';
        // Update apply button count
        const applyBtn = body.querySelector('#btn-apply-changes');
        if (applyBtn) {
          const count = Object.values(this.itemDecisions).filter(d => d === 'accepted').length;
          applyBtn.textContent = `Apply Approved Changes (${count} item${count !== 1 ? 's' : ''})`;
          applyBtn.disabled = count === 0;
        }
      });
    });

    // Apply changes
    const applyBtn = body.querySelector('#btn-apply-changes');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.handleApplyChanges());
    }

    // Queue filters
    body.querySelectorAll('.queue-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.queueFilter = btn.dataset.filter;
        this.renderBody();
        this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
      });
    });

    // Queue item actions
    body.querySelectorAll('[data-queue-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.queueAction;
        const id = btn.dataset.id;
        const idx = this.changeQueue.findIndex(i => i.id === id);
        if (idx > -1) {
          this.changeQueue[idx].decision = action === 'accept' ? (this.changeQueue[idx].decision === 'accepted' ? 'pending' : 'accepted') : (this.changeQueue[idx].decision === 'dismissed' ? 'pending' : 'dismissed');
          await StorageService.saveChangeQueue(this.changeQueue);
          this.renderBody();
          this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
        }
      });
    });

    // Apply queue
    body.querySelector('#btn-apply-queue')?.addEventListener('click', () => this.handleApplyQueue());

    // Vault search
    const vaultSearch = body.querySelector('#vault-search');
    if (vaultSearch) {
      vaultSearch.addEventListener('input', (e) => {
        this.vaultSearch = e.target.value;
        this.renderBody();
        this.bindBodyEvents(body.parentElement.querySelector('#intake-body'));
      });
    }

    // --- POLICY TAB BINDINGS ---
    
    // Collapsible upload drawer
    body.querySelector('#btn-show-upload-drawer')?.addEventListener('click', () => {
      this.showPolicyUploadDrawer = true;
      this.renderBody();
    });

    body.querySelector('#btn-close-upload-drawer')?.addEventListener('click', () => {
      this.showPolicyUploadDrawer = false;
      this.renderBody();
    });

    body.querySelector('#btn-trigger-upload-empty')?.addEventListener('click', () => {
      this.showPolicyUploadDrawer = true;
      this.renderBody();
    });

    // Policy Dropzone
    const policyDropzone = body.querySelector('#policy-dropzone');
    if (policyDropzone) {
      policyDropzone.addEventListener('dragover', (e) => { e.preventDefault(); policyDropzone.classList.add('dragover'); });
      policyDropzone.addEventListener('dragleave', () => policyDropzone.classList.remove('dragover'));
      policyDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        policyDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) this.setupPolicyMetadataForm(file);
      });
    }

    // Policy File Input
    const policyFileInput = body.querySelector('#policy-file-input');
    if (policyFileInput) {
      policyFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.setupPolicyMetadataForm(file);
      });
    }

    // Cancel Policy Upload
    const cancelUploadBtn = body.querySelector('#btn-cancel-policy-upload');
    if (cancelUploadBtn) {
      cancelUploadBtn.addEventListener('click', () => {
        this.pendingPolicyFile = null;
        const metaSection = body.querySelector('#policy-upload-meta');
        if (metaSection) metaSection.style.display = 'none';
      });
    }

    // Submit Policy Upload
    const submitUploadBtn = body.querySelector('#btn-submit-policy-upload');
    if (submitUploadBtn) {
      submitUploadBtn.addEventListener('click', () => {
        const docType = body.querySelector('#policy-upload-type').value;
        const framework = body.querySelector('#policy-upload-framework').value;
        if (this.pendingPolicyFile) {
          this.handlePolicyUpload(this.pendingPolicyFile, docType, framework);
        }
      });
    }

    // All Documents Checkbox
    const chkAllDocs = body.querySelector('#chk-all-docs');
    if (chkAllDocs) {
      chkAllDocs.addEventListener('change', () => {
        this.allDocsSelected = chkAllDocs.checked;
        if (chkAllDocs.checked) {
          this.selectedDocIds = this.policyDocs.map(d => d.id);
        } else {
          this.selectedDocIds = [];
        }
        this.renderBody();
      });
    }

    // Individual Document Checkboxes
    body.querySelectorAll('.policy-doc-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const docId = chk.dataset.id;
        if (chk.checked) {
          if (!this.selectedDocIds.includes(docId)) {
            this.selectedDocIds.push(docId);
          }
        } else {
          this.selectedDocIds = this.selectedDocIds.filter(id => id !== docId);
        }
        this.allDocsSelected = this.selectedDocIds.length === this.policyDocs.length;
        this.renderBody();
      });
    });

    // Suggestions Query buttons
    body.querySelectorAll('.policy-suggest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        const input = body.querySelector('#policy-qa-input');
        if (input) input.value = query;
        this.handlePolicyQAQuery(query);
      });
    });

    // Session History click
    body.querySelectorAll('[data-history-idx]').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.historyIdx);
        this.activeQuestion = this.sessionQuestions[idx];
        this.renderBody();
      });
    });

    // Policy Q&A Submit
    const qaSubmitBtn = body.querySelector('#btn-policy-qa-submit');
    const qaInput = body.querySelector('#policy-qa-input');
    if (qaSubmitBtn && qaInput) {
      qaSubmitBtn.addEventListener('click', () => {
        const query = qaInput.value.trim();
        if (query) {
          this.handlePolicyQAQuery(query);
        }
      });

      qaInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const query = qaInput.value.trim();
          if (query) {
            this.handlePolicyQAQuery(query);
          }
        }
      });
    }

    // Bind row action buttons (Delete and Recommended Actions)
    body.addEventListener('click', async (e) => {
      // Delete document
      const deleteBtn = e.target.closest('[data-policy-delete-id]');
      if (deleteBtn) {
        e.stopPropagation();
        const docId = deleteBtn.dataset.policyDeleteId;
        if (confirm('Are you sure you want to delete this policy document? This will also remove its extracted chunks.')) {
          await this.handleDeletePolicy(docId);
        }
        return;
      }

      // Create action item from Q&A recommendations
      const recBtn = e.target.closest('[data-rec-type]');
      if (recBtn) {
        e.stopPropagation();
        const type = recBtn.dataset.recType;
        const title = recBtn.dataset.recTitle;
        const desc = recBtn.dataset.recDesc;
        const sourceDoc = recBtn.dataset.recSource;
        
        await this.handleCreateChangeQueueItem(type, title, desc, sourceDoc);
        recBtn.disabled = true;
        recBtn.textContent = '✓ Added';
        recBtn.style.background = 'rgba(0,181,181,0.1)';
        recBtn.style.color = 'var(--color-teal)';
        recBtn.style.borderColor = 'rgba(0,181,181,0.2)';
        
        // Refresh change queue badge count
        const pendingCount = this.changeQueue.filter(i => i.decision === 'pending' || !i.decision).length;
        const badge = document.querySelector('#tab-btn-queue .queue-badge');
        if (badge) {
          badge.textContent = pendingCount;
        } else if (pendingCount > 0) {
          const tabBtn = document.querySelector('#tab-btn-queue');
          if (tabBtn) {
            tabBtn.innerHTML = `Change Queue <span class="queue-badge">${pendingCount}</span>`;
          }
        }
      }
    });
  }

  // ─── FILE UPLOAD HANDLER ──────────────────────────────────────────────────

  async handleFileUpload(file) {
    this.currentFile = file;
    this.uploadState = 'reading';
    this.renderBody();

    // Extract text
    const { text, error: extractError } = await DocumentExtractionService.extractText(file);
    if (extractError) {
      this.uploadState = 'error';
      this.extractionError = extractError;
      this.renderBody();
      return;
    }

    // Determine chunk count
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
      this.extractionError = geminiError || 'Extraction encountered an issue. Please try again or upload a different version of this document.';
      this.renderBody();
      return;
    }

    // Apply delta detection
    const withDelta = DocumentExtractionService.applyDeltaToExtraction(result, this.state.risks || []);
    this.extractionResult = withDelta;
    this.segmentCount = segments;

    // Initialize decisions
    const allItems = this.getAllReviewItems();
    allItems.forEach(item => {
      if (!this.itemDecisions[item.id]) this.itemDecisions[item.id] = 'pending';
    });

    this.uploadState = 'review';
    this.renderBody();
    const newBody = this._container.querySelector('#intake-body');
    if (newBody) this.bindBodyEvents(newBody);
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

  // ─── APPLY CHANGES ────────────────────────────────────────────────────────

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
          // Apply edit values if any
          const edits = this.editValues[item.id] || {};
          const merged = { ...item, ...edits };
          const risk = DocumentExtractionService.extractedRiskToRegisterRisk(merged);
          try {
            await StorageService.saveRisk(risk, 'Imported via Risk Intelligence Desk');
            // Update local state
            this.state.risks = await StorageService.getRisks();
          } catch (e) {
            console.error('Failed to save risk:', e);
          }
        }
        accepted++;
      } else if (decision === 'dismissed') {
        dismissed++;
      } else {
        // Unreviewed → add to change queue
        unreviewed.push({
          ...item,
          decision: 'pending',
          sourceDocument: this.currentFile?.name || 'Unknown',
          uploadDate: new Date().toISOString()
        });
      }
    }

    // Save unreviewed to change queue
    const existingQueue = await StorageService.getChangeQueue();
    await StorageService.saveChangeQueue([...existingQueue, ...unreviewed]);
    this.changeQueue = await StorageService.getChangeQueue();

    // Save vault entry
    const result = this.extractionResult;
    const vaultEntry = {
      id: `vault-${Date.now()}`,
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
    this.vaultEntries = await StorageService.getDocumentVault();

    // Update app state
    this.onStateChange({ risks: this.state.risks });

    this.uploadState = 'done';
    this.renderBody();
    const newBody = this._container.querySelector('#intake-body');
    if (newBody) this.bindBodyEvents(newBody);
  }

  async handleApplyQueue() {
    const accepted = this.changeQueue.filter(i => i.decision === 'accepted' && i.itemType === 'Risk');
    for (const item of accepted) {
      try {
        const risk = DocumentExtractionService.extractedRiskToRegisterRisk(item);
        await StorageService.saveRisk(risk, 'Imported via Change Queue');
      } catch (e) {
        console.error('Queue apply failed:', e);
      }
    }
    // Remove applied items from queue
    const remaining = this.changeQueue.filter(i => i.decision !== 'accepted');
    await StorageService.saveChangeQueue(remaining);
    this.changeQueue = remaining;
    this.state.risks = await StorageService.getRisks();
    this.onStateChange({ risks: this.state.risks });
    this.renderBody();
    const newBody = this._container.querySelector('#intake-body');
    if (newBody) this.bindBodyEvents(newBody);
  }

  // --- POLICY INTELLIGENCE METHODS ---

  renderPoliciesTab() {
    const hasDocs = this.policyDocs && this.policyDocs.length > 0;
    const showUploadDrawer = this.showPolicyUploadDrawer || false;
    
    return `
      <div class="ask-docs-container" style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 240px); min-height: 600px;">
        
        <!-- Collapsible Upload Drawer -->
        <div id="policy-upload-drawer" class="glass-panel" style="display: ${showUploadDrawer ? 'block' : 'none'}; padding: 16px; margin-bottom: 8px; border: 1px solid var(--border-color); background: var(--panel-bg);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="font-size:12px; font-weight:700; color:var(--text-primary); text-transform:uppercase; margin:0;">Upload New Policy Document</h4>
            <button id="btn-close-upload-drawer" class="btn btn-secondary btn-small" style="font-size:9px; padding:2px 8px;">✕ Close</button>
          </div>
          
          <div class="intake-dropzone" id="policy-dropzone" style="padding: 24px; border: 1px dashed var(--border-color); border-radius: 8px; text-align: center; background: rgba(0,0,0,0.02);">
            <div class="dropzone-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px;height:40px;color:var(--color-teal);margin:0 auto 12px;display:block;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span style="font-size:12px; font-weight:600; color:var(--text-primary); display:block; margin-bottom:4px;" id="policy-upload-filename-display">Drag document here or click to browse</span>
              <input type="file" id="policy-file-input" accept=".pdf,.docx,.txt,.md" style="display:none;">
              <label for="policy-file-input" class="btn btn-secondary btn-small" style="cursor:pointer; padding:4px 12px; font-size:10px; margin-top:4px;">Choose File</label>
            </div>
          </div>

          <!-- Metadata parameters -->
          <div id="policy-upload-meta" style="margin-top: 12px; display: none; border-top: 1px solid var(--border-color); padding-top: 12px; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Document Type</label>
              <select id="policy-upload-type" class="form-control" style="font-size:11px;padding:4px;height:28px;">
                <option value="Access Control Policy">Access Control Policy</option>
                <option value="BCP/DR Policy">BCP/DR Policy</option>
                <option value="Privacy Policy">Privacy Policy</option>
                <option value="Information Security Policy">Information Security Policy</option>
                <option value="Vendor Risk Policy">Vendor Risk Policy</option>
                <option value="Incident Response Policy">Incident Response Policy</option>
                <option value="Audit Report">Audit Report</option>
                <option value="SOP">SOP</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Framework / Category</label>
              <select id="policy-upload-framework" class="form-control" style="font-size:11px;padding:4px;height:28px;">
                <option value="SOC 2">SOC 2</option>
                <option value="ISO 27001">ISO 27001</option>
                <option value="GDPR">GDPR</option>
                <option value="DPDP">DPDP</option>
                <option value="ISO 27701">ISO 27701</option>
                <option value="CCPA">CCPA</option>
                <option value="Internal Governance">Internal Governance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
              <button id="btn-cancel-policy-upload" class="btn btn-secondary btn-small" style="font-size:10px;padding:4px 10px;">Cancel</button>
              <button id="btn-submit-policy-upload" class="btn btn-primary btn-small" style="font-size:10px;padding:4px 10px;">Extract &amp; Process</button>
            </div>
          </div>
        </div>

        <!-- Main Workspace: 3 Columns -->
        <div style="display: grid; grid-template-columns: 280px 1.2fr 1.5fr; gap: 16px; flex-grow: 1; min-height: 0;">
          
          <!-- LEFT PANEL: Available Documents -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink:0;">
              <h3 style="font-size:11px; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.5px; margin:0;">
                Documents (${this.policyDocs.length})
              </h3>
              <button id="btn-show-upload-drawer" class="btn btn-secondary btn-small" style="font-size:9px; padding:2px 8px; display: ${showUploadDrawer ? 'none' : 'block'};">
                ＋ Add
              </button>
            </div>
            
            ${!hasDocs ? `
              <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 20px;">
                <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Upload documents to begin policy intelligence analysis.</p>
                <button id="btn-trigger-upload-empty" class="btn btn-primary btn-small" style="font-size:11px;">Upload Document</button>
              </div>
            ` : `
              <!-- Document List Content -->
              <div style="display: flex; align-items: center; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px; flex-shrink:0;">
                <input type="checkbox" id="chk-all-docs" ${this.allDocsSelected ? 'checked' : ''} style="cursor: pointer;" />
                <label for="chk-all-docs" style="font-size: 11px; font-weight: 600; color: var(--text-primary); cursor: pointer; user-select: none;">All Documents</label>
              </div>
              
              <div class="policy-docs-list-scrollable" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
                ${this.policyDocs.map(d => {
                  const isChecked = this.selectedDocIds.includes(d.id);
                  const statusClass = {
                    Ready: 'within',
                    Processing: 'near',
                    Failed: 'above'
                  }[d.status] || 'near';
                  
                  const displayDate = d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
                  
                  return `
                    <div style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(255,255,255,0.01); display: flex; gap: 8px; align-items: flex-start; transition: all 0.2s;" class="policy-doc-list-item">
                      <input type="checkbox" class="policy-doc-checkbox" data-id="${d.id}" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;" />
                      <div style="flex-grow:1; min-width:0;">
                        <div style="font-size: 11px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${d.title}">${d.title}</div>
                        <div style="font-size: 9px; color: var(--text-secondary); margin-top: 2px;">
                          ${d.document_type} ${d.framework_tags?.length ? `· ${d.framework_tags.join(', ')}` : ''}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 8px; color: var(--text-muted);">
                          <span>📅 ${displayDate}</span>
                          <span class="status-badge ${statusClass}" style="font-size: 8px; padding: 0px 4px; border-radius:3px;">${d.status}</span>
                        </div>
                      </div>
                      <button class="btn-delete-policy-doc" data-policy-delete-id="${d.id}" style="background: none; border: none; color: var(--color-critical); padding: 0 4px; font-size: 11px; cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Delete Document">✕</button>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
          
          <!-- CENTER PANEL: Question & History -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--border-color);">
            <h3 style="font-size:11px; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 12px 0; flex-shrink:0;">
              Ask Intelligence Engine
            </h3>
            
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px; flex-shrink:0;">
              <textarea id="policy-qa-input" class="form-control" rows="3" placeholder="Enter a governance or policy question..." style="font-size:12px; line-height: 1.4; resize: none; width: 100%; border-radius: 6px; padding: 8px 10px;" ${!hasDocs ? 'disabled' : ''}></textarea>
              <button id="btn-policy-qa-submit" class="btn btn-primary" style="width: 100%; font-size:12px; padding: 8px;" ${!hasDocs || this.selectedDocIds.length === 0 ? 'disabled' : ''}>
                Ask Analyst
              </button>
            </div>
            
            <!-- Quick Suggestions -->
            <div style="margin-bottom: 16px; flex-shrink:0;">
              <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Suggested Questions</div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="Does this BCP define recovery objectives?" style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${!hasDocs ? 'disabled' : ''}>
                  "Does this BCP define recovery objectives?"
                </button>
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="What gaps exist in the Access Control Policy?" style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${!hasDocs ? 'disabled' : ''}>
                  "What gaps exist in the Access Control Policy?"
                </button>
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="Which policies discuss incident reporting?" style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${!hasDocs ? 'disabled' : ''}>
                  "Which policies discuss incident reporting?"
                </button>
                <button class="btn btn-secondary btn-small policy-suggest-btn" data-query="Summarise the major weaknesses across all uploaded documents." style="text-align: left; font-size: 10px; width: 100%; white-space: normal; line-height:1.3; padding: 5px 8px;" ${!hasDocs ? 'disabled' : ''}>
                  "Summarise the major weaknesses across all uploaded documents."
                </button>
              </div>
            </div>
            
            <!-- Session History -->
            <div style="flex-grow: 1; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; flex-shrink:0;">Session History</div>
              
              <div style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px;">
                ${this.sessionQuestions.length === 0 ? `
                  <div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding: 10px;">
                    <span style="font-size:10px; color:var(--text-muted); font-style:italic;">No questions asked in this session.</span>
                  </div>
                ` : this.sessionQuestions.map((q, idx) => {
                  const isActive = this.activeQuestion && this.activeQuestion.id === q.id;
                  const timeStr = q.timestamp ? new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return `
                    <div class="session-history-item ${isActive ? 'active' : ''}" data-history-idx="${idx}" style="padding: 8px; border: 1px solid ${isActive ? 'var(--color-teal)' : 'var(--border-color)'}; border-radius: 6px; background: ${isActive ? 'rgba(0,181,181,0.03)' : 'rgba(255,255,255,0.01)'}; cursor: pointer; transition: all 0.2s;">
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--text-muted); margin-bottom:4px;">
                        <span>⏱️ ${timeStr}</span>
                        <span style="background:rgba(0,181,181,0.08); color:var(--color-teal); padding: 0 4px; border-radius:3px; font-size:8px;">${q.selectedDocNames || 'All'}</span>
                      </div>
                      <div style="font-size: 11px; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${q.question}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
          
          <!-- RIGHT PANEL: Findings & Evidence -->
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 16px; min-height: 0; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--border-color);">
            <h3 style="font-size:11px; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 12px 0; flex-shrink:0;">
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
          <div class="intake-spinner" style="margin-bottom:16px;"></div>
          <h4 style="font-size:13px; font-weight:700; color:var(--text-primary); margin:0 0 4px 0;">Analyzing policy documents...</h4>
          <p style="font-size:11px; color:var(--text-secondary); margin:0;">Retrieving keyword-matched chunks and consulting Gemini AI model.</p>
        </div>
      `;
    }

    if (!this.activeQuestion) {
      const hasDocs = this.policyDocs && this.policyDocs.length > 0;
      if (!hasDocs) {
        return `
          <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
            <p style="font-size:12px; color:var(--text-secondary);">Upload documents to begin policy intelligence analysis.</p>
          </div>
        `;
      }
      return `
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px; color:var(--text-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px;height:40px;margin-bottom:12px;opacity:0.6;color:var(--color-teal);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.982-8.983m-9 0L15 3l-1.813 7.504" />
          </svg>
          <span style="font-size:11px; font-style:italic;">Select documents and submit a question in the center panel to begin analysis.</span>
        </div>
      `;
    }

    const q = this.activeQuestion;
    const aiResponse = q.answer;
    
    // Check for matching evidence empty state
    const hasEvidence = aiResponse.citations && aiResponse.citations.length > 0;
    if (!hasEvidence && (!aiResponse.direct_answer || aiResponse.direct_answer.toLowerCase().includes("no relevant evidence") || aiResponse.direct_answer.toLowerCase().includes("insufficient data") || aiResponse.direct_answer.toLowerCase().includes("do not find any matching"))) {
      return `
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(245,158,11,0.06);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:24px;height:24px;color:var(--color-warning);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h4 style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">No matching evidence</h4>
          <p style="font-size:11px; color:var(--text-secondary); max-width:280px; margin:0;">No relevant evidence was found in the selected documents.</p>
        </div>
      `;
    }

    // Map confidence values to CSS variables
    const confLevel = (aiResponse.confidence || 'Medium').trim();
    const confColor = { High: 'var(--color-safe-text)', Medium: 'var(--color-warning-text)', Low: 'var(--color-critical-text)' }[confLevel] || 'var(--text-muted)';
    const confBg = { High: 'var(--color-safe-bg)', Medium: 'var(--color-warning-bg)', Low: 'var(--color-critical-bg)' }[confLevel] || 'rgba(255,255,255,0.05)';
    const confBorder = { High: 'rgba(26,122,74,0.2)', Medium: 'rgba(194,97,14,0.2)', Low: 'rgba(192,57,43,0.2)' }[confLevel] || 'rgba(255,255,255,0.05)';

    const formattedAnswer = this.formatPoliciesMarkdown(aiResponse.direct_answer || aiResponse.directAnswer);

    let html = `
      <!-- Question Header info -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:8px;">
        <div style="font-size:11px; color:var(--text-muted);">
          Queried: <strong style="color:var(--text-secondary);">${q.selectedDocNames || 'Selected Documents'}</strong>
        </div>
        <span class="status-badge" style="background:${confBg}; color:${confColor}; border:1px solid ${confBorder}; font-size:9px; padding:1px 6px; border-radius:3px; text-transform:uppercase; font-weight: 600;">
          ${confLevel} Confidence
        </span>
      </div>

      <!-- Section 1: Direct Answer -->
      <div class="glass-panel" style="padding:12px 14px; border:1px solid var(--border-color); background:rgba(255,255,255,0.015); border-radius:8px; margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Direct Answer</h4>
        <div style="font-size:12px; color:var(--text-primary); line-height:1.5;">${formattedAnswer}</div>
      </div>

      <!-- Section 2: Evidence & Citations -->
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Evidence &amp; Citations</h4>
        ${!hasEvidence ? `
          <div style="font-size:11px; color:var(--text-secondary); font-style:italic;">No explicit source citations provided.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${aiResponse.citations.map(c => `
              <div style="background:rgba(0,0,0,0.02); border:1px solid var(--border-color); border-radius:6px; padding:8px 10px; font-size:11px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-weight:600; color:var(--text-primary);">
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">📄 ${c.document_title || c.documentTitle}</span>
                  <span style="color:var(--text-muted); font-size:9px;">${c.section_title || c.sectionTitle || 'General'} ${c.page_number || c.pageNumber ? `· Page ${c.page_number || c.pageNumber}` : ''}</span>
                </div>
                <div style="color:var(--text-secondary); font-style:italic; line-height:1.4;">"${c.excerpt}"</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Section 3: Gaps & Weaknesses
    const gaps = aiResponse.gaps_detected || aiResponse.gaps || [];
    html += `
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Gaps &amp; Weaknesses</h4>
        ${gaps.length === 0 ? `
          <div style="font-size:11px; color:var(--color-safe-text); background:var(--color-safe-bg); border:1px solid rgba(26,122,74,0.1); border-radius:6px; padding:8px 10px;">
            ✅ No critical policy gaps or weaknesses were identified.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${gaps.map(g => {
              const isAdded = this.changeQueue.some(i => i.title === g.title && i.itemType === 'Risk' && i.decision === 'pending');
              return `
                <div style="background:rgba(192,57,43,0.01); border:1px solid rgba(192,57,43,0.1); border-left: 4px solid var(--color-critical); border-radius:6px; padding:10px; font-size:11px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                  <div style="flex-grow:1; min-width:0;">
                    <strong style="color:var(--color-critical); display:block; margin-bottom:2px;">${g.title}</strong>
                    <span style="color:var(--text-secondary); font-size:10px; line-height:1.4; display:block;">${g.description}</span>
                  </div>
                  <button class="btn btn-secondary btn-small rec-queue-btn" style="font-size:9px; padding:2px 6px; white-space:nowrap; margin-top:2px; ${isAdded ? 'background:rgba(0,181,181,0.1); color:var(--color-teal); border-color:rgba(0,181,181,0.2);' : ''}" 
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

    // Section 4: Recommendations
    const recs = aiResponse.recommended_actions || aiResponse.recommendedActions || [];
    html += `
      <div style="margin-bottom:16px;">
        <h4 style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:0; margin-bottom:8px;">Recommendations</h4>
        ${recs.length === 0 ? `
          <div style="font-size:11px; color:var(--text-secondary); font-style:italic;">No recommendations generated.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${recs.map(r => {
              const recType = r.type === 'control' ? 'Control' : 'Action';
              const isAdded = this.changeQueue.some(i => i.title === r.title && i.itemType === recType && i.decision === 'pending');
              return `
                <div style="background:rgba(0,181,181,0.01); border:1px solid rgba(0,181,181,0.1); border-left: 4px solid var(--color-teal); border-radius:6px; padding:10px; font-size:11px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                  <div style="flex-grow:1; min-width:0;">
                    <strong style="color:var(--color-teal); display:block; margin-bottom:2px;">${r.title}</strong>
                    <span style="color:var(--text-secondary); font-size:10px; line-height:1.4; display:block;">${r.description}</span>
                  </div>
                  <button class="btn btn-secondary btn-small rec-queue-btn" style="font-size:9px; padding:2px 6px; white-space:nowrap; margin-top:2px; ${isAdded ? 'background:rgba(0,181,181,0.1); color:var(--color-teal); border-color:rgba(0,181,181,0.2);' : ''}" 
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

    return html;
  }

  getSelectedDocNamesSummary() {
    if (!this.policyDocs || this.policyDocs.length === 0) return 'None';
    if (this.selectedDocIds.length === this.policyDocs.length) return 'All Documents';
    if (this.selectedDocIds.length === 1) {
      const doc = this.policyDocs.find(d => d.id === this.selectedDocIds[0]);
      return doc ? doc.title : '1 Document';
    }
    return `${this.selectedDocIds.length} Documents`;
  }

  setupPolicyMetadataForm(file) {
    this.pendingPolicyFile = file;
    const body = this._container.querySelector('#intake-body');
    if (body) {
      const filenameDisplay = body.querySelector('#policy-upload-filename-display');
      if (filenameDisplay) filenameDisplay.textContent = `Selected: ${file.name}`;
      
      const metaSection = body.querySelector('#policy-upload-meta');
      if (metaSection) metaSection.style.display = 'grid';
    }
  }

  async handlePolicyUpload(file, docType, framework) {
    this.pendingPolicyFile = null;
    const body = this._container.querySelector('#intake-body');
    
    const metaSection = body.querySelector('#policy-upload-meta');
    if (metaSection) metaSection.style.display = 'none';

    const filenameDisplay = body.querySelector('#policy-upload-filename-display');
    if (filenameDisplay) filenameDisplay.textContent = 'Extracting and parsing text...';

    const docId = `policy-${Date.now()}`;
    const newDoc = {
      id: docId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      document_type: docType,
      framework_tags: [framework],
      file_name: file.name,
      file_url: '',
      mime_type: file.type || 'application/octet-stream',
      status: 'Processing',
      extracted_text: '',
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await StorageService.savePolicyDocument(newDoc);
    await this.loadData();
    this.renderBody();

    try {
      const { text, error } = await DocumentExtractionService.extractText(file);
      if (error) {
        throw new Error(error);
      }

      newDoc.extracted_text = text;
      newDoc.summary = text.slice(0, 150) + (text.length > 150 ? '...' : '');
      newDoc.status = 'Ready';
      
      await StorageService.savePolicyDocument(newDoc);

      const chunks = DocumentExtractionService.chunkPolicyText(text);
      const mappedChunks = chunks.map(c => ({
        ...c,
        id: `chunk-${docId}-${c.chunk_index}`,
        document_id: docId
      }));
      await StorageService.savePolicyChunks(mappedChunks);

      if (filenameDisplay) filenameDisplay.textContent = 'Policy processed successfully!';
    } catch (err) {
      console.error('Policy processing error:', err);
      newDoc.status = 'Failed';
      newDoc.summary = `Failed to process document: ${err.message}`;
      await StorageService.savePolicyDocument(newDoc);
      if (filenameDisplay) filenameDisplay.textContent = `Processing failed: ${err.message}`;
    }

    await this.loadData();
    // Auto-select newly uploaded document
    if (!this.selectedDocIds.includes(docId)) {
      this.selectedDocIds.push(docId);
    }
    this.allDocsSelected = this.selectedDocIds.length === this.policyDocs.length;
    this.renderBody();
  }

  async handleDeletePolicy(docId) {
    await StorageService.deletePolicyDocument(docId);
    this.selectedDocIds = this.selectedDocIds.filter(id => id !== docId);
    await this.loadData();
    this.allDocsSelected = this.selectedDocIds.length === this.policyDocs.length;
    this.renderBody();
  }

  async handlePolicyQAQuery(query) {
    if (!query) return;
    
    this.policyQALoading = true;
    this.activeQuestion = null;
    this.renderBody(); // Re-render immediately to show spinner loader
    
    try {
      const selectedDocIds = this.selectedDocIds || [];
      const matchingChunks = await StorageService.retrieveRelevantChunks(query, selectedDocIds, 4);
      const settings = this.state.settings || {};
      
      let aiResponse;
      if (matchingChunks.length === 0) {
        aiResponse = {
          direct_answer: "No relevant evidence was found in the selected documents.",
          citations: [],
          gaps_detected: [],
          recommended_actions: [],
          confidence: "Low"
        };
      } else {
        aiResponse = await AIService.answerPolicyQuestion(query, matchingChunks, settings);
      }
      
      const newQuestion = {
        id: `q-session-${Date.now()}`,
        question: query,
        answer: aiResponse,
        timestamp: new Date().toISOString(),
        selectedDocNames: this.getSelectedDocNamesSummary()
      };
      
      this.sessionQuestions.push(newQuestion);
      this.activeQuestion = newQuestion;
    } catch (err) {
      console.error('Q&A analysis error:', err);
      const failedQuestion = {
        id: `q-session-fail-${Date.now()}`,
        question: query,
        answer: {
          direct_answer: "No relevant evidence was found in the selected documents.",
          citations: [],
          gaps_detected: [],
          recommended_actions: [],
          confidence: "Low"
        },
        timestamp: new Date().toISOString(),
        selectedDocNames: this.getSelectedDocNamesSummary()
      };
      this.sessionQuestions.push(failedQuestion);
      this.activeQuestion = failedQuestion;
    } finally {
      this.policyQALoading = false;
      this.renderBody();
    }
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

  formatPoliciesMarkdown(text) {
    if (!text) return "";
    let html = text;
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:12px;font-weight:700;color:var(--text-primary);margin-top:8px;margin-bottom:4px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:10px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;margin-bottom:2px;">$1</h5>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:6px 0;" />');
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:10px;margin-bottom:2px;list-style:decimal;">$1</li>');
    return html;
  }
}
