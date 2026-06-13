// Three Lines of Defense Assurance Gap Map (F7 & F8)

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';

const cleanTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/^\[demo-trk-risk-\d+\]\s*/i, '')
    .replace(/^\[DEMO Trackier SaaS\]\s*/i, '')
    .trim();
};

export class AssuranceComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    
    // UI state
    this.isResolvingGap = false;
    this.resolvingRiskId = null;

    // Parse deep-link params
    const _aParams = new URLSearchParams(window.location.search);
    this._deepLinkRiskId = _aParams.get('riskId') || null;
    this._deepLinkGap = _aParams.get('gap') === 'true';
    this._fromDashboard = !!this._deepLinkRiskId || this._deepLinkGap;
  }

  clearFilters() {
    this._deepLinkRiskId = null;
    this._deepLinkGap = false;
    this._fromDashboard = false;
  }

  // Calculate overall assurance metrics
  calculateMetrics(risks) {
    const totalRisks = risks.length;
    const gapsCount = risks.filter(r => r.assurance?.gapDetected || !r.assurance?.thirdLine || r.assurance?.thirdLine.includes('None')).length;
    const securedCount = totalRisks - gapsCount;
    const coveragePercent = totalRisks > 0 ? Math.round((securedCount / totalRisks) * 100) : 100;

    return { totalRisks, gapsCount, securedCount, coveragePercent };
  }

  async resolveAssuranceGap(riskId, auditorName) {
    const target = this.state.risks.find(r => r.id === riskId);
    if (target) {
      target.assurance = {
        firstLine: target.assurance?.firstLine || `${target.owner || 'CRO'} (Ownership)`,
        secondLine: target.assurance?.secondLine || "Risk & Compliance Committee (Monitoring)",
        thirdLine: `${auditorName} Independent Audit (Assurance)`,
        gapDetected: false
      };
      
      await StorageService.saveRisk(target);
      this.state.risks = await StorageService.getRisks();
      this.onStateChange({ risks: this.state.risks });
    }
  }

  render(container) {
    const risks = this.state.risks || [];
    const metrics = this.calculateMetrics(risks);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Corporate Governance standard</span>
          <h1>Three Lines of Defense Assurance</h1>
          <p class="page-subtitle">Verify coverage across Business Ownership, Compliance Monitoring, and Independent Audits | Rectify compliance gaps</p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <!-- ASSURANCE METRICS TICKER -->
      <div class="ticker-grid" style="grid-template-columns: 1fr 1fr 1fr 1.2fr; margin-bottom: 24px;">
        <div class="ticker-card indigo">
          <span class="ticker-label">Total Classified Risks</span>
          <span class="ticker-value">${metrics.totalRisks}</span>
          <span class="ticker-footer">Active ledger risks evaluated</span>
        </div>
        <div class="ticker-card within">
          <span class="ticker-label">Fully Secured Layers</span>
          <span class="ticker-value" style="color:var(--color-within-appetite);">${metrics.securedCount}</span>
          <span class="ticker-footer">All 3 lines of defense present</span>
        </div>
        <div class="ticker-card above">
          <span class="ticker-label">Active Gaps Detected</span>
          <span class="ticker-value" style="color:${metrics.gapsCount > 0 ? 'var(--color-above-appetite)' : 'var(--color-within-appetite)'};">
            ${metrics.gapsCount}
          </span>
          <span class="ticker-footer">Missing 3rd Line independent audits</span>
        </div>
        <div class="ticker-card near" style="background:rgba(99,102,241,0.03);border-color:rgba(99,102,241,0.15);">
          <span class="ticker-label">Assurance Coverage Index</span>
          <span class="ticker-value" style="color:var(--color-indigo);">${metrics.coveragePercent}%</span>
          
          <div class="fragility-bar-outer" style="height:6px; margin-top:8px; background:rgba(0,0,0,0.05);">
            <div class="fragility-bar-inner" style="width: ${metrics.coveragePercent}%; background:var(--color-indigo);"></div>
          </div>
        </div>
      </div>

      <div class="register-layout" style="grid-template-columns: 1fr;">
        
        <!-- MAIN ASSURANCE MATRIX PANEL -->
        <div class="glass-panel" style="padding:0; overflow:hidden;">
          
          <div style="padding:20px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <h3 class="dashboard-card-title" style="margin:0;">Compliance & Audit Matrix</h3>
            <span style="font-size:12px; color:var(--text-secondary);">
              *Gaps are highlighted in <strong style="color:var(--color-above-appetite);">Crimson Rose</strong>.
            </span>
          </div>

          <div style="overflow-x:auto;">
            <table class="custom-table" style="font-size:12px;">
              <thead>
                <tr>
                  <th style="width:180px;">Risk Element</th>
                  <th>1st Line (Ownership)</th>
                  <th>2nd Line (Monitoring)</th>
                  <th>3rd Line (Assurance)</th>
                  <th style="text-align:center; width:150px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${risks.map(r => {
                  const hasGap = r.assurance?.gapDetected || !r.assurance?.thirdLine || r.assurance?.thirdLine.includes('None');
                  const first = r.assurance?.firstLine || `${r.owner || 'CRO'} (Ownership)`;
                  const second = r.assurance?.secondLine || "Risk & Compliance Committee (Monitoring)";
                  const third = r.assurance?.thirdLine || "None (GAP DETECTED)";

                  return `
                    <tr data-risk-id="${r.id}" style="${hasGap ? 'background:rgba(225,29,72,0.01);' : ''}">
                      <td>
                        <strong style="color:var(--text-primary); cursor:pointer; display:inline-flex; align-items:center; gap:4px;" class="ai-explain-trigger" data-explain-type="risk" data-explain-id="${r.id}" title="ID: ${r.id}">
                          <span>${cleanTitle(r.title)}</span>
                          <button class="ai-explain-icon-btn" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                            </svg>
                          </button>
                        </strong>
                        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Category: ${r.category}</div>
                      </td>
                      <td style="color:var(--text-secondary); font-weight:500;">
                        ${first}
                      </td>
                      <td style="color:var(--text-secondary); font-weight:500;">
                        ${second}
                      </td>
                      <td style="color:${hasGap ? 'var(--color-above-appetite)' : 'var(--text-secondary)'}; font-weight:${hasGap ? '600' : '500'};">
                        ${third}
                      </td>
                      <td style="text-align:center;">
                        ${hasGap ? `
                          <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                            <span class="status-badge above" style="font-size:9px; padding:2px 8px;">GAP DETECTED</span>
                            <button class="btn btn-primary btn-small btn-resolve-gap no-print" 
                                    style="padding:2px 8px; font-size:10px; height:20px; line-height:1;" 
                                    data-id="${r.id}">
                              Appoint Auditor
                            </button>
                          </div>
                        ` : `
                          <span class="status-badge within" style="font-size:9px; padding:2px 8px;">SECURED LAYER</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      <!-- AUDITOR APPOINTMENT DIALOG MODAL -->
      ${this.isResolvingGap ? `
        <div class="no-print" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:1000;">
          <div class="glass-panel" style="width:400px; padding:24px; background:white; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
            <h3 style="font-size:16px; margin-bottom:8px;">Appoint Independent Auditor</h3>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin-bottom:16px;">
              Appoint an external auditing agency or independent internal squad to perform quarterly assurance reviews on this risk vector.
            </p>

            <div class="form-group">
              <label>Auditing Body Name</label>
              <select class="form-control" id="select-resolving-auditor" style="font-size:12px;">
                <option value="Big 4 (PwC/EY/KPMG)">Big 4 Agency (PwC/EY/KPMG)</option>
                <option value="Internal Audit Team">Internal Board Auditing Squad</option>
                <option value="SOC 2 CPA Compliance Team">Independent SOC 2 CPA Firm</option>
                <option value="Data Privacy External Auditor">Specialized Data Protection Auditor</option>
              </select>
            </div>

            <div style="display:flex; gap:12px; margin-top:20px;">
              <button class="btn btn-primary" id="btn-submit-resolution" style="flex:1; justify-content:center;">Appoint & Secure</button>
              <button class="btn btn-secondary" id="btn-cancel-resolution" style="flex:1; justify-content:center;">Cancel</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    if (this._fromDashboard) {
      AIInsightService.renderBackToDashboardBanner(this, container, this._deepLinkGap ? 'Filtered: Assurance Gaps' : `Assurance: Risk ${this._deepLinkRiskId}`);
    }

    // Highlight targeted row
    if (this._deepLinkRiskId) {
      const targetRow = container.querySelector(`tr[data-risk-id="${this._deepLinkRiskId}"]`);
      if (targetRow) {
        targetRow.style.outline = '2px solid var(--color-above-appetite)';
        targetRow.style.boxShadow = '0 0 8px rgba(239,68,68,0.25)';
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    this.bindEvents(container);
  }

  bindEvents(container) {
    // 1. Click Appoint Auditor
    const btns = container.querySelectorAll('.btn-resolve-gap');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        this.isResolvingGap = true;
        this.resolvingRiskId = b.dataset.id;
        this.render(container);
      });
    });

    // 2. Submit resolution
    const submitBtn = container.querySelector('#btn-submit-resolution');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const auditor = container.querySelector('#select-resolving-auditor').value;
        if (this.resolvingRiskId && auditor) {
          await this.resolveAssuranceGap(this.resolvingRiskId, auditor);
          this.isResolvingGap = false;
          this.resolvingRiskId = null;
          this.render(container);
        }
      });
    }

    // 3. Cancel resolution modal
    const cancelBtn = container.querySelector('#btn-cancel-resolution');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.isResolvingGap = false;
        this.resolvingRiskId = null;
        this.render(container);
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = trigger.dataset.explainType;
        const id = trigger.dataset.explainId;
        
        let item = null;
        if (type === 'risk') {
          item = this.state.risks.find(r => r.id === id);
        }
        
        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });

    // Render page-level AI insights card
    const insightContainer = container.querySelector('#ai-insight-container');
    if (insightContainer) {
      AIInsightService.renderPageInsightCard('assurance', insightContainer, this.state);
    }
  }
}
