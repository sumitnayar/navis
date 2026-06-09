// Controls Library and KRI Engine Component - Operational Security Mesh

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';

export class ControlsComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.isAddingControl = false;
    this.isAddingKRI = false;
    this.selectedRiskId = "";
    this.filterToBreachedKRIs = false;
  }

  clearFilters() {
    this.filterToBreachedKRIs = false;
  }

  render(container) {
    const risks = this.state.risks;
    
    // Check search query parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('kriStatus') === 'breached') {
      this.filterToBreachedKRIs = true;
    }
    
    // Extract list of all controls currently mapped across risks
    const allControls = risks.flatMap(r => 
      (r.controls || []).map(c => ({ ...c, riskId: r.id, riskTitle: r.title }))
    );

    // Extract list of all KRIs currently mapped and apply filter if active
    let allKRIs = risks.flatMap(r => 
      (r.kris || []).map(k => ({ ...k, riskId: r.id, riskTitle: r.title }))
    );

    if (this.filterToBreachedKRIs) {
      allKRIs = allKRIs.filter(k => k.status === 'BREACHED');
    }

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Governance Control Registry</span>
          <h1>Controls & Key Risk Indicators (KRI)</h1>
          <p class="page-subtitle">Map risk mitigation controls | Track threshold metrics and operational breaches</p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <div class="register-layout">
        
        <!-- LEFT: CONTROLS LIBRARY -->
        <div class="details-panel">
          <div class="glass-panel" style="min-height:500px;">
            <h3 class="dashboard-card-title">
              <span>Mitigating Controls Library</span>
              <button class="btn btn-primary btn-small no-print" id="btn-add-control">
                ${this.isAddingControl ? 'Close Form' : 'Map New Control'}
              </button>
            </h3>

            <!-- ADD CONTROL FORM -->
            ${this.isAddingControl ? `
              <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:16px;">
                <form id="control-form" onsubmit="return false;">
                  <div class="form-group">
                    <label>Target Board Risk</label>
                    <select class="form-control" id="control-risk-id" required>
                      ${risks.map(r => `<option value="${r.id}">[${r.id}] ${r.title}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Control Name</label>
                    <input type="text" class="form-control" id="control-name" placeholder="e.g. Quarterly Independent Board Nominations Audit" required />
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                      <label>Effectiveness</label>
                      <select class="form-control" id="control-effectiveness">
                        <option value="Highly Effective">Highly Effective</option>
                        <option value="Partially Effective">Partially Effective</option>
                        <option value="Ineffective">Ineffective</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Active Status</label>
                      <select class="form-control" id="control-status">
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                  </div>
                  <button class="btn btn-primary btn-small" id="btn-save-control" style="width:100%;justify-content:center;margin-top:8px;">Save Control</button>
                </form>
              </div>
            ` : ''}

            <!-- CONTROLS TABLE -->
            <div style="overflow-x:auto;">
              <table class="custom-table" style="font-size:12px;">
                <thead>
                  <tr>
                    <th>Control Name</th>
                    <th>Mitigates</th>
                    <th>Effectiveness</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${allControls.length ? allControls.map(c => `
                    <tr>
                      <td style="font-weight:600;color:var(--text-primary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">
                        <span>${c.name}</span>
                        <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="control" data-explain-name="${c.name}" data-explain-risk="${c.riskId}" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:inline-flex;align-items:center;">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                          </svg>
                        </button>
                      </td>
                      <td>
                        <span class="profile-role-badge" style="font-size:9px;">[${c.riskId}]</span>
                      </td>
                      <td>
                        <span style="font-weight:600;color:${c.effectiveness === 'Highly Effective' ? 'var(--color-within-appetite)' : c.effectiveness === 'Partially Effective' ? 'var(--color-near-appetite)' : 'var(--color-above-appetite)'}">
                          ${c.effectiveness}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge ${c.status === 'Active' ? 'within' : 'near'}" style="font-size:9px;padding:2px 6px;">
                          ${c.status}
                        </span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="4" style="text-align:center;color:var(--text-muted);padding:30px;">
                        No controls mapped yet. Add them to risks in the register or above.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <!-- RIGHT: KRI ENGINE -->
        <div class="details-panel">
          <div class="glass-panel" style="min-height:500px;">
            <h3 class="dashboard-card-title">
              <span>Key Risk Indicators (KRI)</span>
              <button class="btn btn-primary btn-small no-print" id="btn-add-kri">
                ${this.isAddingKRI ? 'Close Form' : 'Map New KRI'}
              </button>
            </h3>

            <!-- ADD KRI FORM -->
            ${this.isAddingKRI ? `
              <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:16px;">
                <form id="kri-form" onsubmit="return false;">
                  <div class="form-group">
                    <label>Target Board Risk</label>
                    <select class="form-control" id="kri-risk-id" required>
                      ${risks.map(r => `<option value="${r.id}">[${r.id}] ${r.title}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Indicator Name</label>
                    <input type="text" class="form-control" id="kri-name" placeholder="e.g. Top 3 Accounts Revenue Share" required />
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                      <label>Current Value</label>
                      <input type="text" class="form-control" id="kri-current" placeholder="e.g. 48%" required />
                    </div>
                    <div class="form-group">
                      <label>Breach Boundary</label>
                      <input type="text" class="form-control" id="kri-threshold" placeholder="e.g. 35%" required />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>KRI Trigger Status</label>
                    <select class="form-control" id="kri-status">
                      <option value="OK">OK (Safe)</option>
                      <option value="BREACHED">BREACHED (Red Alert)</option>
                    </select>
                  </div>
                  <button class="btn btn-primary btn-small" id="btn-save-kri" style="width:100%;justify-content:center;margin-top:8px;">Save KRI Metric</button>
                </form>
              </div>
            ` : ''}

            <!-- KRIS LIST -->
            <div style="overflow-x:auto;">
              <table class="custom-table" style="font-size:12px;">
                <thead>
                  <tr>
                    <th>Indicator Name</th>
                    <th>Current</th>
                    <th>Limit</th>
                    <th style="text-align:center;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${allKRIs.length ? allKRIs.map(k => `
                    <tr style="${this.filterToBreachedKRIs ? 'outline: 1.5px dashed var(--color-above-appetite); background: rgba(255,42,84,0.03);' : ''}">
                      <td style="font-weight:600;color:var(--text-primary);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        <div style="display:flex;align-items:center;gap:4px;">
                          <span>${k.name}</span>
                          <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="kri" data-explain-name="${k.name}" data-explain-risk="${k.riskId}" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:inline-flex;align-items:center;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                            </svg>
                          </button>
                        </div>
                        <div style="font-size:9px;color:var(--text-secondary);margin-top:2px;">Risk: [${k.riskId}]</div>
                      </td>
                      <td>${k.current}</td>
                      <td>${k.threshold}</td>
                      <td style="text-align:center;">
                        <span class="status-badge ${k.status === 'BREACHED' ? 'above' : 'within'}" style="font-size:9px;padding:2px 6px;">
                          ${k.status}
                        </span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="4" style="text-align:center;color:var(--text-muted);padding:30px;">
                        No Key Risk Indicators active in the register.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Add Control toggle
    const addCtrlBtn = container.querySelector('#btn-add-control');
    if (addCtrlBtn) {
      addCtrlBtn.addEventListener('click', () => {
        this.isAddingControl = !this.isAddingControl;
        this.isAddingKRI = false; // Mutually exclusive
        this.render(container);
      });
    }

    // Add KRI toggle
    const addKriBtn = container.querySelector('#btn-add-kri');
    if (addKriBtn) {
      addKriBtn.addEventListener('click', () => {
        this.isAddingKRI = !this.isAddingKRI;
        this.isAddingControl = false; // Mutually exclusive
        this.render(container);
      });
    }

    // Save Control
    const saveCtrlBtn = container.querySelector('#btn-save-control');
    if (saveCtrlBtn) {
      saveCtrlBtn.addEventListener('click', async () => {
        const form = container.querySelector('#control-form');
        if (!form.reportValidity()) return;

        const targetId = container.querySelector('#control-risk-id').value;
        const targetRisk = this.state.risks.find(r => r.id === targetId);
        
        if (targetRisk) {
          const controls = targetRisk.controls || [];
          controls.push({
            name: container.querySelector('#control-name').value,
            effectiveness: container.querySelector('#control-effectiveness').value,
            status: container.querySelector('#control-status').value
          });
          
          targetRisk.controls = controls;
          await StorageService.saveRisk(targetRisk);
          
          // Refresh global state
          this.state.risks = await StorageService.getRisks();
          this.isAddingControl = false;
          this.render(container);
          this.onStateChange({ risks: this.state.risks });
        }
      });
    }

    // Save KRI
    const saveKriBtn = container.querySelector('#btn-save-kri');
    if (saveKriBtn) {
      saveKriBtn.addEventListener('click', async () => {
        const form = container.querySelector('#kri-form');
        if (!form.reportValidity()) return;

        const targetId = container.querySelector('#kri-risk-id').value;
        const targetRisk = this.state.risks.find(r => r.id === targetId);
        
        if (targetRisk) {
          const kris = targetRisk.kris || [];
          kris.push({
            name: container.querySelector('#kri-name').value,
            current: container.querySelector('#kri-current').value,
            threshold: container.querySelector('#kri-threshold').value,
            status: container.querySelector('#kri-status').value
          });
          
          targetRisk.kris = kris;
          await StorageService.saveRisk(targetRisk);
          
          // Refresh global state
          this.state.risks = await StorageService.getRisks();
          this.isAddingKRI = false;
          this.render(container);
          this.onStateChange({ risks: this.state.risks });
        }
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = trigger.dataset.explainType;
        const name = trigger.dataset.explainName;
        const riskId = trigger.dataset.explainRisk;
        
        let item = null;
        if (type === 'control') {
          const risk = this.state.risks.find(r => r.id === riskId);
          const ctrl = risk?.controls?.find(c => c.name === name);
          if (ctrl) {
            item = { ...ctrl, riskTitle: risk.title, riskId: risk.id };
          } else {
            item = { name, effectiveness: 'Active', status: 'Active', riskTitle: risk?.title || 'Unknown Risk', riskId };
          }
        } else if (type === 'kri') {
          const risk = this.state.risks.find(r => r.id === riskId);
          const kri = risk?.kris?.find(k => k.name === name);
          if (kri) {
            item = { ...kri, riskTitle: risk.title, riskId: risk.id };
          } else {
            item = { name, current: 'N/A', threshold: 'N/A', status: 'OK', riskTitle: risk?.title || 'Unknown Risk', riskId };
          }
        }
        
        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });

    // Render page-level AI insights card
    const insightContainer = container.querySelector('#ai-insight-container');
    if (insightContainer) {
      AIInsightService.renderPageInsightCard('controls', insightContainer, this.state);
    }

    // Render Back to Dashboard banner if filtered
    if (this.filterToBreachedKRIs) {
      AIInsightService.renderBackToDashboardBanner(this, container, 'Breached Key Risk Indicators (KRIs)');
    }
  }
}
