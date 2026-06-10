// Risk Register Component - Intelligent CRUD & real-time AI suggestions

import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';

export class RegisterComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.isEditing = false;
    this.currentRisk = null; // Risk being created/edited
    this.aiSuggestion = null; // AI Copilot suggestions holder
    this.activeFilterCategory = 'All';
    this.activeFilterAppetite = 'All';

    // Check if we were passed an editing ID from another component
    if (this.state.editingRiskId) {
      const target = this.state.risks.find(r => r.id === this.state.editingRiskId);
      if (target) {
        this.isEditing = true;
        this.currentRisk = { ...target };
      }
      // Reset the parameter so it doesn't trigger on subsequent loads
      this.state.editingRiskId = null;
    }

    // Parse deep-link params from dashboard
    const _rParams = new URLSearchParams(window.location.search);
    const _appetiteStatus = _rParams.get('appetiteStatus');
    if (_appetiteStatus === 'above') {
      this.activeFilterAppetite = 'Above Appetite';
      this._fromDashboard = true;
    } else if (_appetiteStatus === 'near') {
      this.activeFilterAppetite = 'Near Appetite';
      this._fromDashboard = true;
    } else {
      this._fromDashboard = false;
    }
    const _staleness = _rParams.get('staleness');
    if (_staleness === 'true') {
      this.filterStale = true;
      this._fromDashboard = true;
    } else {
      this.filterStale = false;
    }
    const _riskId = _rParams.get('riskId');
    this._deepLinkRiskId = _riskId || null;
  }

  clearFilters() {
    this.activeFilterCategory = 'All';
    this.activeFilterAppetite = 'All';
    this.filterStale = false;
    this._fromDashboard = false;
    this._deepLinkRiskId = null;
  }

  exportToCSV() {
    const risks = this.state.risks;
    const headers = ['ID', 'Title', 'Category', 'Subcategory', 'Owner', 'BU', 'Inherent Score', 'Residual Score', 'Appetite Status', 'Trend', 'Description'];
    const rows = risks.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.subcategory || '',
      r.owner || '',
      r.businessUnit || '',
      r.inherentScore,
      r.residualScore,
      r.appetiteStatus,
      r.trend,
      `"${r.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RiskOS_Risk_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render(container) {
    if (this.isEditing) {
      this.renderForm(container);
    } else {
      this.renderTable(container);
    }
  }

  renderTable(container) {
    const risks = this.state.risks;
    
    // Filter Categories
    const categories = ['All', 'Strategic', 'Financial', 'Technology', 'Cyber', 'Privacy', 'Compliance', 'Vendor', 'People', 'AI', 'Legal'];

    // Apply Filter Actions
    let filteredRisks = risks;
    if (this.activeFilterCategory !== 'All') {
      filteredRisks = filteredRisks.filter(r => r.category === this.activeFilterCategory);
    }
    if (this.activeFilterAppetite !== 'All') {
      filteredRisks = filteredRisks.filter(r => r.appetiteStatus === this.activeFilterAppetite);
    }

    if (this.filterStale) {
      const today = new Date();
      filteredRisks = filteredRisks.filter(r => {
        const lastReviewedStr = r.last_reviewed_date || r.lastReviewedDate || r.created_at || new Date().toISOString();
        const lastReviewed = new Date(lastReviewedStr);
        const diffDays = Math.ceil(Math.abs(today - lastReviewed) / 86400000);
        if (r.appetiteStatus === 'Above Appetite') return diffDays > 7;
        if (r.appetiteStatus === 'Near Appetite') return diffDays > 21;
        return diffDays > 60;
      }).sort((a, b) => {
        const lastReviewedA = new Date(a.last_reviewed_date || a.lastReviewedDate || a.created_at || new Date().toISOString());
        const lastReviewedB = new Date(b.last_reviewed_date || b.lastReviewedDate || b.created_at || b.created_at || new Date().toISOString());
        return lastReviewedA - lastReviewedB; // oldest date first (descending days since review)
      });
    }

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Enterprise Risk Ledger</span>
          <h1>Intelligent Risk Register</h1>
          <p class="page-subtitle">Add, edit, and link risks | AI Copilot form assistance</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary no-print" id="btn-export-csv">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <button class="btn btn-primary no-print" id="btn-add-risk">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Board Risk
          </button>
        </div>
      </div>

      <!-- FILTERS PANEL -->
      <div class="glass-panel no-print" style="padding:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Category:</span>
          <select class="form-control" id="filter-category" style="width:160px;padding:6px 12px;font-size:12px;">
            ${categories.map(c => `<option value="${c}" ${this.activeFilterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Appetite Status:</span>
          <select class="form-control" id="filter-appetite" style="width:160px;padding:6px 12px;font-size:12px;">
            <option value="All" ${this.activeFilterAppetite === 'All' ? 'selected' : ''}>All</option>
            <option value="Above Appetite" ${this.activeFilterAppetite === 'Above Appetite' ? 'selected' : ''}>Above Appetite</option>
            <option value="Near Appetite" ${this.activeFilterAppetite === 'Near Appetite' ? 'selected' : ''}>Near Appetite</option>
            <option value="Within Appetite" ${this.activeFilterAppetite === 'Within Appetite' ? 'selected' : ''}>Within Appetite</option>
          </select>
        </div>
      </div>

      <!-- MAIN TABLE GLASS CONTAINER -->
      <div class="glass-panel" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width:70px;">ID</th>
                <th>Risk Element</th>
                <th>Category</th>
                <th style="text-align:center;">Score</th>
                <th>Appetite Boundary</th>
                <th>Trend</th>
                <th>Owner</th>
                <th style="width:100px;" class="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRisks.length ? filteredRisks.map(r => {
                let appetiteClass = 'within';
                if (r.appetiteStatus === 'Above Appetite') appetiteClass = 'above';
                else if (r.appetiteStatus === 'Near Appetite') appetiteClass = 'near';

                return `
                  <tr data-id="${r.id}" data-risk-id="${r.id}">
                    <td style="font-family:var(--font-header);font-weight:700;color:var(--text-secondary);">${r.id}</td>
                    <td>
                      <div style="font-weight:600;color:var(--text-primary);">${r.title}</div>
                      <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;">
                        ${r.description}
                      </div>
                    </td>
                    <td>
                      <span class="profile-role-badge" style="font-size:9px;color:var(--color-indigo);">${r.category}</span>
                    </td>
                    <td style="text-align:center;font-weight:700;font-family:var(--font-header);">
                      <span style="font-size:13px;color:${r.appetiteStatus === 'Above Appetite' ? 'var(--color-above-appetite)' : r.appetiteStatus === 'Near Appetite' ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'}">
                        ${r.residualScore}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge ${appetiteClass}">${r.appetiteStatus}</span>
                    </td>
                    <td>
                      <span class="trend-tag ${r.trend === 'Deteriorating' ? 'deteriorating' : r.trend === 'Improving' ? 'improving' : 'stable'}">
                        ${r.trend === 'Deteriorating' ? '↑ Deteriorating' : r.trend === 'Improving' ? '↓ Improving' : '• Stable'}
                      </span>
                    </td>
                    <td style="font-size:12px;color:var(--text-secondary);">${r.owner || 'N/A'}</td>
                    <td class="no-print">
                      <div style="display:flex;gap:6px;">
                        <button class="btn btn-secondary btn-small btn-edit-risk" style="padding:4px 8px;" data-id="${r.id}">Edit</button>
                        <button class="btn btn-danger btn-small btn-delete-risk" style="padding:4px 8px;" data-id="${r.id}">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:12px;height:12px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" style="text-align:center;color:var(--text-muted);padding:40px;">
                    No risks match your filter parameters.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Inject dashboard banner if navigated from dashboard
    if (this._fromDashboard) {
      const filterDesc = this.filterStale
        ? 'Filtered: Stale governance risks'
        : this.activeFilterAppetite !== 'All'
        ? `Filtered: ${this.activeFilterAppetite} risks`
        : 'Risk Register';
      // Dynamic import to avoid adding a static import for AIInsightService
      import('../services/aiInsightService.js').then(({ AIInsightService }) => {
        AIInsightService.renderBackToDashboardBanner(this, container, filterDesc);
      });
    }

    // Highlight a specific risk row if deeplink id provided
    if (this._deepLinkRiskId) {
      setTimeout(() => {
        const targetRow = container.querySelector(`tr[data-risk-id="${this._deepLinkRiskId}"]`);
        if (targetRow) {
          targetRow.style.outline = '2px solid rgba(99,102,241,0.6)';
          targetRow.style.boxShadow = '0 0 8px rgba(99,102,241,0.2)';
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    this.bindTableEvents(container);
  }

  renderForm(container) {
    const r = this.currentRisk || {
      id: '',
      title: '',
      category: 'Strategic',
      subcategory: '',
      description: '',
      owner: '',
      businessUnit: '',
      location: '',
      likelihood: 3,
      impact: 3,
      velocity: 3,
      likelihoodResidual: 2,
      impactResidual: 2,
      velocityResidual: 2,
      appetiteStatus: 'Within Appetite',
      trend: 'Stable',
      parentRiskId: '',
      childRiskIds: [],
      relatedRiskIds: [],
      controls: [],
      kris: [],
      actions: []
    };

    // Precalculate temporary visual scores for display (V3 1-25 math)
    const inScore = (r.likelihood || 3) * (r.impact || 3);
    const resScore = (r.likelihoodResidual || 2) * (r.impactResidual || 2);
    let appStatus = 'Within Appetite';
    if (resScore >= 16) appStatus = 'Above Appetite';
    else if (resScore >= 11) appStatus = 'Near Appetite';

    const risks = this.state.risks.filter(o => o.id !== r.id); // For relationships dropdown

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Risk Mesh Compiler</span>
          <h1>${r.id ? `Modify Board Risk [${r.id}]` : 'Create Board Risk Element'}</h1>
          <p class="page-subtitle">Configure multi-dimensional scores, dependency cascades, and AI suggested controls.</p>
        </div>
        <div>
          <button class="btn btn-secondary" id="btn-cancel-edit">Back to Ledger</button>
        </div>
      </div>

      <div class="register-layout">
        
        <!-- LEFT: FORM DATA PANEL -->
        <div class="glass-panel">
          <form id="risk-form" onsubmit="return false;">
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div class="form-group">
                <label>Corporate Category</label>
                <select class="form-control" id="risk-category" required>
                  <option value="Strategic" ${r.category === 'Strategic' ? 'selected' : ''}>Strategic</option>
                  <option value="Financial" ${r.category === 'Financial' ? 'selected' : ''}>Financial</option>
                  <option value="Technology" ${r.category === 'Technology' ? 'selected' : ''}>Technology</option>
                  <option value="Cyber" ${r.category === 'Cyber' ? 'selected' : ''}>Cyber</option>
                  <option value="Privacy" ${r.category === 'Privacy' ? 'selected' : ''}>Privacy</option>
                  <option value="Compliance" ${r.category === 'Compliance' ? 'selected' : ''}>Compliance</option>
                  <option value="Vendor" ${r.category === 'Vendor' ? 'selected' : ''}>Vendor</option>
                  <option value="People" ${r.category === 'People' ? 'selected' : ''}>People</option>
                  <option value="AI" ${r.category === 'AI' ? 'selected' : ''}>AI</option>
                  <option value="Legal" ${r.category === 'Legal' ? 'selected' : ''}>Legal</option>
                </select>
              </div>
              <div class="form-group">
                <label>Specific Subcategory</label>
                <input type="text" class="form-control" id="risk-subcategory" value="${r.subcategory || ''}" placeholder="e.g. Infrastructure redundancy" required />
              </div>
            </div>

            <div class="form-group">
              <label>Risk Element Title</label>
              <input type="text" class="form-control" id="risk-title" value="${r.title || ''}" placeholder="e.g. Founder Dependency on Deal Closure" required />
            </div>

            <div class="form-group">
              <label>Risk Description (Type to trigger AI Copilot!)</label>
              <textarea class="form-control" id="risk-description" rows="3" placeholder="Explain the systemic threat... e.g. We rely heavily on Meta Graph APIs for product delivery." required>${r.description || ''}</textarea>
              
              <!-- AI Suggestion Box Container -->
              <div id="ai-suggestion-box"></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div class="form-group">
                <label>Accountable Owner</label>
                <input type="text" class="form-control" id="risk-owner" value="${r.owner || ''}" placeholder="e.g. VP of Product" required />
              </div>
              <div class="form-group">
                <label>Business Unit</label>
                <select class="form-control" id="risk-bu">
                  ${this.state.settings.businessUnits?.map(bu => `<option value="${bu}" ${r.businessUnit === bu ? 'selected' : ''}>${bu}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- MULTI-DIMENSIONAL SCORING ENGINES -->
            <div style="margin:20px 0;border-top:1px solid var(--border-color);padding-top:20px;">
              <h3 style="font-size:14px;margin-bottom:14px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;">Multi-Dimensional Matrix Slider Scoring</h3>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                
                <!-- Inherent Column -->
                <div>
                  <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:10px;">Inherent Risk (Uncontrolled)</h4>
                  <div class="form-group">
                    <label>Likelihood: <span class="slider-value" id="val-l">${r.likelihood || 3}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-l" min="1" max="5" value="${r.likelihood || 3}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Impact: <span class="slider-value" id="val-i">${r.impact || 3}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-i" min="1" max="5" value="${r.impact || 3}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Velocity: <span class="slider-value" id="val-v">${r.velocity || 3}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-v" min="1" max="5" value="${r.velocity || 3}" />
                    </div>
                  </div>
                </div>

                <!-- Residual Column -->
                <div>
                  <h4 style="font-size:11px;color:var(--color-indigo);text-transform:uppercase;margin-bottom:10px;">Residual Risk (Mitigated)</h4>
                  <div class="form-group">
                    <label>Residual Likelihood: <span class="slider-value" id="val-lr">${r.likelihoodResidual || 2}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-lr" min="1" max="5" value="${r.likelihoodResidual || 2}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Residual Impact: <span class="slider-value" id="val-ir">${r.impactResidual || 2}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-ir" min="1" max="5" value="${r.impactResidual || 2}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Residual Velocity: <span class="slider-value" id="val-vr">${r.velocityResidual || 2}</span></label>
                    <div class="slider-group">
                      <input type="range" id="risk-vr" min="1" max="5" value="${r.velocityResidual || 2}" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- VELOCITY TIMESCALES ENGINE (F3) -->
            <div style="margin:20px 0;border-top:1px solid var(--border-color);padding-top:20px;">
              <h3 style="font-size:14px;margin-bottom:14px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;">Velocity Timescales (F3)</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Time to Impact</label>
                  <select class="form-control" id="risk-time-to-impact" style="font-size:11px;">
                    ${['Very Slow', 'Slow', 'Moderate', 'Fast', 'Immediate'].map(t => `<option value="${t}" ${r.timeToImpact === t ? 'selected' : ''}>${t}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Time to Detection</label>
                  <select class="form-control" id="risk-time-to-detection" style="font-size:11px;">
                    ${['Very Slow', 'Slow', 'Moderate', 'Fast', 'Immediate'].map(t => `<option value="${t}" ${r.timeToDetection === t ? 'selected' : ''}>${t}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Time to Recovery</label>
                  <select class="form-control" id="risk-time-to-recovery" style="font-size:11px;">
                    ${['Very Slow', 'Slow', 'Moderate', 'Fast', 'Immediate'].map(t => `<option value="${t}" ${r.timeToRecovery === t ? 'selected' : ''}>${t}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>

            <!-- CASCADE RELATIONSHIP CHANNELS -->
            <div style="margin:20px 0;border-top:1px solid var(--border-color);padding-top:20px;">
              <h3 style="font-size:14px;margin-bottom:14px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;">Strategic Cascade Links</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Parent Risk (Triggers us)</label>
                  <select class="form-control" id="risk-parent">
                    <option value="">None</option>
                    ${risks.map(o => `<option value="${o.id}" ${r.parentRiskId === o.id ? 'selected' : ''}>[${o.id}] ${o.title}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Postural Direction (Trend)</label>
                  <select class="form-control" id="risk-trend">
                    <option value="Stable" ${r.trend === 'Stable' ? 'selected' : ''}>Stable</option>
                    <option value="Improving" ${r.trend === 'Improving' ? 'selected' : ''}>Improving</option>
                    <option value="Deteriorating" ${r.trend === 'Deteriorating' ? 'selected' : ''}>Deteriorating</option>
                  </select>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:12px;margin-top:24px;border-top:1px solid var(--border-color);padding-top:20px;">
              <button class="btn btn-primary" id="btn-save-risk" style="flex-grow:1;justify-content:center;">Save Risk Elements</button>
              <button class="btn btn-secondary" id="btn-cancel-edit-form">Cancel</button>
            </div>

          </form>
        </div>

        <!-- RIGHT: LIVE APPETITE CALCULATOR & SEEDED STATS -->
        <div class="details-panel">
          
          <!-- LIVE APPETITE CALC CARD -->
          <div class="glass-panel" style="background:rgba(99,102,241,0.03);border-color:rgba(99,102,241,0.2);">
            <h4 style="font-size:11px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Live Appetite Boundary Calculator</h4>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span style="font-size:12px;color:var(--text-secondary);">Inherent Score (Initial):</span>
              <span style="font-size:18px;font-weight:700;font-family:var(--font-header);" id="live-inh-score">${inScore}</span>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <span style="font-size:12px;color:var(--text-secondary);">Residual Score (Mitigated):</span>
              <span style="font-size:24px;font-weight:800;font-family:var(--font-header);color:${appStatus === 'Above Appetite' ? 'var(--color-above-appetite)' : appStatus === 'Near Appetite' ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'}" id="live-res-score">${resScore}</span>
            </div>

            <div style="text-align:center;padding:8px;border-radius:6px;background:rgba(0,0,0,0.2);" id="live-appetite-badge">
              <span class="status-badge ${appStatus === 'Above Appetite' ? 'above' : appStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:12px;">
                ${appStatus}
              </span>
            </div>

            <div style="font-size:11px;color:var(--text-muted);margin-top:14px;line-height:1.4;">
              *Thresholds: Residual Score &ge; 16 registers as <strong>Above Appetite</strong> (glowing Crimson). Score 11-15 is <strong>Near Appetite</strong> (Amber). &le; 10 is <strong>Within Appetite</strong> (Emerald).
            </div>
          </div>

          <!-- STRATEGIC FRAGILITY IMPACT PROFILE -->
          <div class="glass-panel">
            <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Objective Fragility Mapping</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${['revenue', 'growth', 'customerTrust', 'technology', 'people', 'operations', 'reputation', 'valuation'].map(k => `
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
                  <span style="text-transform:capitalize;color:var(--text-secondary);">${k.replace(/([A-Z])/g, ' $1')}</span>
                  <select class="form-control" id="fragility-${k}" style="width:70px;padding:2px 6px;font-size:11px;height:24px;">
                    ${[1,2,3,4,5].map(v => `<option value="${v}" ${(r.fragility?.[k] || 1) === v ? 'selected' : ''}>${v}</option>`).join('')}
                  </select>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindFormEvents(container);
  }

  // AI Copilot trigger on input description
  triggerAICopilot(text, container) {
    if (text.length < 8) {
      this.aiSuggestion = null;
      container.querySelector('#ai-suggestion-box').innerHTML = '';
      return;
    }

    const sug = AIService.suggestRiskDetails(text);
    this.aiSuggestion = sug;

    container.querySelector('#ai-suggestion-box').innerHTML = `
      <div class="copilot-suggestion">
        <div class="copilot-title">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          AI Risk Copilot: Sugggested Mappings
        </div>
        <div class="copilot-body">
          <strong>Suggested Title:</strong> ${sug.title}<br/>
          <strong>Suggested Category:</strong> ${sug.category}<br/>
          <strong>Suggested Controls:</strong> ${sug.suggestedControls.join(', ')}
        </div>
        <button class="btn btn-primary btn-small copilot-apply-btn" id="btn-apply-ai-sug">Apply AI Suggestions</button>
      </div>
    `;

    // Bind suggestion apply button
    container.querySelector('#btn-apply-ai-sug').addEventListener('click', () => {
      this.applyAISuggestion(container);
    });
  }

  applyAISuggestion(container) {
    if (!this.aiSuggestion) return;
    
    container.querySelector('#risk-title').value = this.aiSuggestion.title;
    container.querySelector('#risk-category').value = this.aiSuggestion.category;
    container.querySelector('#risk-description').value = this.aiSuggestion.description;
    
    // Animate and clear suggestion box
    const box = container.querySelector('.copilot-suggestion');
    if (box) {
      box.style.borderStyle = 'solid';
      box.style.borderColor = 'var(--color-within-appetite)';
      box.innerHTML = `<div style="color:var(--color-within-appetite);font-weight:600;font-size:11px;">✓ AI suggestions successfully integrated! Mapped controls preloaded.</div>`;
      setTimeout(() => {
        container.querySelector('#ai-suggestion-box').innerHTML = '';
      }, 1500);
    }
  }

  bindTableEvents(container) {
    // Export CSV click
    const csvBtn = container.querySelector('#btn-export-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        this.exportToCSV();
      });
    }

    // Add risk click
    container.querySelector('#btn-add-risk').addEventListener('click', () => {
      this.isEditing = true;
      this.currentRisk = null;
      this.render(container);
    });

    // Edit button click
    container.querySelectorAll('.btn-edit-risk').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const target = this.state.risks.find(r => r.id === id);
        if (target) {
          this.isEditing = true;
          this.currentRisk = { ...target };
          this.render(container);
        }
      });
    });

    // Delete button click
    container.querySelectorAll('.btn-delete-risk').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.id;
        if (confirm(`Are you sure you want to delete risk element [${id}]? This will remove all parent/child relationships linking to this node.`)) {
          await StorageService.deleteRisk(id);
          this.state.risks = await StorageService.getRisks();
          this.render(container);
        }
      });
    });

    // Filter selectors changes
    const filterCat = container.querySelector('#filter-category');
    if (filterCat) {
      filterCat.addEventListener('change', () => {
        this.activeFilterCategory = filterCat.value;
        this.renderTable(container);
      });
    }

    const filterApp = container.querySelector('#filter-appetite');
    if (filterApp) {
      filterApp.addEventListener('change', () => {
        this.activeFilterAppetite = filterApp.value;
        this.renderTable(container);
      });
    }
  }

  bindFormEvents(container) {
    // Back button
    container.querySelector('#btn-cancel-edit').addEventListener('click', () => {
      this.isEditing = false;
      this.currentRisk = null;
      this.aiSuggestion = null;
      this.render(container);
    });

    container.querySelector('#btn-cancel-edit-form').addEventListener('click', () => {
      this.isEditing = false;
      this.currentRisk = null;
      this.aiSuggestion = null;
      this.render(container);
    });

    // Trigger AI copilot on description keyup
    const descTextarea = container.querySelector('#risk-description');
    let debounceTimer;
    descTextarea.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.triggerAICopilot(descTextarea.value, container);
      }, 500);
    });

    // Recalculator logic for sliders
    const sliders = ['l', 'i', 'v', 'lr', 'ir', 'vr'];
    sliders.forEach(key => {
      const slider = container.querySelector(`#risk-${key}`);
      slider.addEventListener('input', () => {
        container.querySelector(`#val-${key}`).textContent = slider.value;
        
        // Recalculate Live Metrics (V3 1-25 math)
        const lVal = parseInt(container.querySelector('#risk-l').value);
        const iVal = parseInt(container.querySelector('#risk-i').value);
        const lrVal = parseInt(container.querySelector('#risk-lr').value);
        const irVal = parseInt(container.querySelector('#risk-ir').value);

        const inhScore = lVal * iVal;
        const resScore = lrVal * irVal;

        let status = 'Within Appetite';
        let statusClass = 'within';
        let statusColor = 'var(--color-within-appetite)';
        if (resScore >= 16) {
          status = 'Above Appetite';
          statusClass = 'above';
          statusColor = 'var(--color-above-appetite)';
        } else if (resScore >= 11) {
          status = 'Near Appetite';
          statusClass = 'near';
          statusColor = 'var(--color-near-appetite)';
        }

        container.querySelector('#live-inh-score').textContent = inhScore;
        container.querySelector('#live-res-score').textContent = resScore;
        container.querySelector('#live-res-score').style.color = statusColor;
        container.querySelector('#live-appetite-badge').innerHTML = `
          <span class="status-badge ${statusClass}" style="font-size:12px;">${status}</span>
        `;
      });
    });

    // Save risk elements
    container.querySelector('#btn-save-risk').addEventListener('click', async () => {
      // Validate HTML inputs
      const form = container.querySelector('#risk-form');
      if (!form.reportValidity()) return;

      const editedRisk = {
        id: this.currentRisk?.id || '',
        title: container.querySelector('#risk-title').value,
        category: container.querySelector('#risk-category').value,
        subcategory: container.querySelector('#risk-subcategory').value,
        description: container.querySelector('#risk-description').value,
        owner: container.querySelector('#risk-owner').value,
        businessUnit: container.querySelector('#risk-bu').value,
        trend: container.querySelector('#risk-trend').value,
        parentRiskId: container.querySelector('#risk-parent').value,
        
        likelihood: parseInt(container.querySelector('#risk-l').value),
        impact: parseInt(container.querySelector('#risk-impact').value ? container.querySelector('#risk-impact').value : container.querySelector('#risk-i').value),
        velocity: parseInt(container.querySelector('#risk-v').value),
        
        likelihoodResidual: parseInt(container.querySelector('#risk-lr').value),
        impactResidual: parseInt(container.querySelector('#risk-ir').value),
        velocityResidual: parseInt(container.querySelector('#risk-vr').value),

        // Velocity Timescales (F3)
        timeToImpact: container.querySelector('#risk-time-to-impact').value,
        timeToDetection: container.querySelector('#risk-time-to-detection').value,
        timeToRecovery: container.querySelector('#risk-time-to-recovery').value,

        // Mapped strategic objective fragility
        fragility: {
          revenue: parseInt(container.querySelector('#fragility-revenue').value),
          growth: parseInt(container.querySelector('#fragility-growth').value),
          customerTrust: parseInt(container.querySelector('#fragility-customerTrust').value),
          technology: parseInt(container.querySelector('#fragility-technology').value),
          people: parseInt(container.querySelector('#fragility-people').value),
          operations: parseInt(container.querySelector('#fragility-operations').value),
          reputation: parseInt(container.querySelector('#fragility-reputation').value),
          valuation: parseInt(container.querySelector('#fragility-valuation').value)
        },

        // Maintain controls/KRIs if editing
        controls: this.currentRisk?.controls || [],
        kris: this.currentRisk?.kris || [],
        actions: this.currentRisk?.actions || [],
        childRiskIds: this.currentRisk?.childRiskIds || [],
        relatedRiskIds: this.currentRisk?.relatedRiskIds || []
      };

      // If AI suggestion was applied, seed suggested controls & KRIs
      if (this.aiSuggestion && this.aiSuggestion.title === editedRisk.title) {
        editedRisk.controls = this.aiSuggestion.suggestedControls.map(cName => ({
          name: cName, status: 'Active', effectiveness: 'Highly Effective'
        }));
        editedRisk.kris = this.aiSuggestion.suggestedKRIs.map(kName => ({
          name: kName, current: 'Audit Seeded', threshold: 'Target Margin', status: 'OK'
        }));
      }

      // If a parent risk is selected, link parent -> child
      if (editedRisk.parentRiskId) {
        const parent = this.state.risks.find(r => r.id === editedRisk.parentRiskId);
        if (parent) {
          const children = parent.childRiskIds || [];
          if (editedRisk.id && !children.includes(editedRisk.id)) {
            // Wait, we need to save the parent risk with the child ID linked.
            // We will save it in the background or during StorageService save.
            // In the storage service, we can implement relationship mapping updates, but let's handle it simply:
            // Since parent already exists in database, let's update parent childRiskIds list.
            if (this.currentRisk?.id) {
              if (!children.includes(this.currentRisk.id)) {
                children.push(this.currentRisk.id);
                parent.childRiskIds = children;
                await StorageService.saveRisk(parent);
              }
            }
          }
        }
      }

      await StorageService.saveRisk(editedRisk);
      
      // Refresh global state
      this.state.risks = await StorageService.getRisks();
      
      // Close form
      this.isEditing = false;
      this.currentRisk = null;
      this.aiSuggestion = null;
      this.render(container);
      
      // Let app.js know state changed
      this.onStateChange({ risks: this.state.risks });
    });
  }
}
