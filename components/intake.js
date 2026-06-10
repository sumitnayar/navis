// Risk Intelligence Desk Component — Document Upload, AI Extraction, Change Queue, Document Vault

import { AIInsightService } from '../services/aiInsightService.js';
import { StorageService } from '../services/storageService.js';
import { DocumentExtractionService } from '../services/documentExtractionService.js';

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
      </div>

      <div id="intake-body"></div>
    `;
  }

  renderBody() {
    const body = this._container.querySelector('#intake-body');
    if (!body) return;
    if (this.activeTab === 'upload') body.innerHTML = this.renderUploadTab();
    else if (this.activeTab === 'queue') body.innerHTML = this.renderQueueTab();
    else if (this.activeTab === 'vault') body.innerHTML = this.renderVaultTab();
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:24px;height:24px;color:#EF4444;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:#EF4444;margin-bottom:8px;">Extraction Failed</h3>
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
          <span style="background:rgba(245,158,11,0.08);color:#D97706;border:1px solid rgba(245,158,11,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟡 ${counts.Update} Updates</span>
          <span style="background:rgba(107,114,128,0.08);color:var(--text-muted);border:1px solid rgba(107,114,128,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">⚪ ${counts.Duplicate} Duplicates</span>
          <span style="background:rgba(239,68,68,0.08);color:#EF4444;border:1px solid rgba(239,68,68,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🔴 ${counts.Conflict} Conflicts</span>
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
      Update: '<span style="background:rgba(245,158,11,0.1);color:#D97706;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:rgba(107,114,128,0.1);color:var(--text-muted);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:rgba(239,68,68,0.1);color:#EF4444;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Conflict</span>'
    }[item.deltaStatus] || '';

    const confColor = { high: 'var(--color-teal)', medium: '#D97706', low: 'var(--text-muted)' }[item.confidence] || 'var(--text-muted)';

    const editValues = this.editValues[item.id] || {};
    const displayTitle = editValues.title || item.title || '—';
    const displayDesc = item.description || item.linked_risk_hint || (item.appetite_statements || []).join('; ') || item.source_reference || '';

    const rowStyle = isDismissed ? 'opacity:0.4;' : isAccepted ? 'background:rgba(0,181,181,0.03);' : '';

    const editForm = isEditing ? this.renderEditForm(item) : '';

    const actionBtns = isConflict
      ? `<span style="font-size:10px;color:#EF4444;font-weight:600;">Resolve Required</span>
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
      Update: '<span style="background:rgba(245,158,11,0.1);color:#D97706;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Update</span>',
      Duplicate: '<span style="background:rgba(107,114,128,0.1);color:var(--text-muted);padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">Duplicate</span>',
      Conflict: '<span style="background:rgba(239,68,68,0.1);color:#EF4444;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:600;">⚠ Conflict</span>'
    }[item.deltaStatus] || '';
    const confColor = { high: 'var(--color-teal)', medium: '#D97706', low: 'var(--text-muted)' }[item.confidence] || 'var(--text-muted)';
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
      partially_processed: { bg: 'rgba(245,158,11,0.1)', color: '#D97706', label: 'Partially Processed' },
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
}
