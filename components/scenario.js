// Board Scenario Planner Lab - Interactive simulations of major enterprise threats (F4)

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';


export class ScenarioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedScenarioId = null;
    this.simulatedSeverity = 100; // severity slider: 50% to 200%

    // Parse deep-link param
    const _sParams = new URLSearchParams(window.location.search);
    const _template = _sParams.get('template');
    if (_template) {
      this.selectedScenarioId = _template;
      this._fromDashboard = true;
    } else {
      this._fromDashboard = false;
    }
  }

  clearFilters() {
    this._fromDashboard = false;
  }

  // Parse cash/revenue strings (e.g., "-₹1.8Cr" or "-₹60L") to numeric values for scaling
  parseValue(valStr) {
    const isNegative = valStr.includes('-');
    let clean = valStr.replace(/[-₹L]/g, '').trim();
    let num = parseFloat(clean);
    
    if (valStr.includes('Cr')) {
      num = num * 100; // Normalize everything to Lakhs
    }
    return isNegative ? -num : num;
  }

  // Format normalized Lakhs back to pretty INR formatting
  formatValue(lakhs) {
    const abs = Math.abs(lakhs);
    let str = "";
    if (abs >= 100) {
      str = `₹${(abs / 100).toFixed(1)}Cr`;
    } else {
      str = `₹${abs.toFixed(0)}L`;
    }
    return lakhs < 0 ? `-${str}` : str;
  }

  // Scale percent strings (e.g. "-12%") by severity factor
  scalePercent(percentStr, factor) {
    const val = parseFloat(percentStr.replace(/[-%]/g, ''));
    const scaled = val * factor;
    return `-${scaled.toFixed(1)}%`;
  }

  render(container) {
    // Get scenarios from app state or database
    const scenarios = this.state.scenarios || [];
    const objectives = this.state.objectives || [];

    if (!this.selectedScenarioId && scenarios.length > 0) {
      this.selectedScenarioId = scenarios[0].id;
    }

    const currentScenario = scenarios.find(s => s.id === this.selectedScenarioId);
    const linkedObj = currentScenario ? objectives.find(o => o.id === currentScenario.objectiveId) : null;

    // Severity factor calculation
    const factor = this.simulatedSeverity / 100;

    // Precalculate scaled impacts
    let scaledRevenue = { best: '0', expected: '0', worst: '0' };
    let scaledEbitda = { best: '0', expected: '0', worst: '0' };
    let scaledCash = { best: '0', expected: '0', worst: '0' };

    if (currentScenario) {
      const rev = currentScenario.revenueImpact;
      scaledRevenue = {
        best: this.formatValue(this.parseValue(rev.best) * factor),
        expected: this.formatValue(this.parseValue(rev.expected) * factor),
        worst: this.formatValue(this.parseValue(rev.worst) * factor)
      };

      const ebi = currentScenario.ebitdaImpact;
      scaledEbitda = {
        best: this.scalePercent(ebi.best, factor),
        expected: this.scalePercent(ebi.expected, factor),
        worst: this.scalePercent(ebi.worst, factor)
      };

      const cash = currentScenario.cashImpact;
      scaledCash = {
        best: this.formatValue(this.parseValue(cash.best) * factor),
        expected: this.formatValue(this.parseValue(cash.expected) * factor),
        worst: this.formatValue(this.parseValue(cash.worst) * factor)
      };
    }

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Board Decision Room</span>
          <h1>Board Scenario Lab</h1>
          <p class="page-subtitle">Stress-test corporate resilience against major systemic shocks | Project Best, Expected, & Worst cases</p>
        </div>
      </div>

      <div class="register-layout">
        
        <!-- LEFT: SELECTION & STRESS CONTROLS -->
        <div class="details-panel" style="flex: 1.2;">
          
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Simulation Configurations</h3>
            
            <div class="form-group">
              <label>Select Threat Scenario Template</label>
              <select class="form-control" id="select-scenario-template" style="font-size: 13px;">
                ${scenarios.map(s => `<option value="${s.id}" ${this.selectedScenarioId === s.id ? 'selected' : ''}>${s.title}</option>`).join('')}
              </select>
            </div>

            <!-- DYNAMIC RESILIENCE ADJUSTER -->
            <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                <label style="font-weight: 700; font-size:11px; text-transform:uppercase; color:var(--text-secondary); margin:0;">
                  Stress Severity Multiplier
                </label>
                <span class="status-badge ${this.simulatedSeverity > 130 ? 'above' : this.simulatedSeverity > 80 ? 'near' : 'within'}" style="font-size:11px; font-weight:700;">
                  ${this.simulatedSeverity}% Scale
                </span>
              </div>
              <p style="font-size: 11px; color:var(--text-muted); line-height: 1.3; margin-bottom:14px;">
                Slide to scale the scale and threat vectors. Scales direct operational expenses and regulatory penalties accordingly.
              </p>
              
              <div class="slider-group">
                <input type="range" id="resilience-severity-slider" min="50" max="200" value="${this.simulatedSeverity}" step="10" style="accent-color: var(--color-indigo);" />
              </div>
              
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-secondary);">
                <span>50% (Low Stress)</span>
                <span>100% (Baseline Case)</span>
                <span>200% (Extreme Stress)</span>
              </div>
            </div>

          </div>

          <!-- CONNECTED CONTROLS & MITIGATION VECTORS -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Targeted Governance Strategy</h3>
            <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin-bottom: 12px;">
              Enterprise controls mapped to secure the threatened objective: <strong>${linkedObj?.title || 'None'}</strong>
            </p>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="padding:10px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:6px; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Enterprise Business Continuity Plan (BCP)</strong>
                  <div style="font-size: 9px; color: var(--text-muted);">Frequency: Annually | Type: Preventive</div>
                </div>
                <span class="status-badge within" style="font-size: 8px;">Effective</span>
              </div>

              <div style="padding:10px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:6px; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Regulatory Action Response Framework</strong>
                  <div style="font-size: 9px; color: var(--text-muted);">Frequency: Continuous | Type: Corrective</div>
                </div>
                <span class="status-badge near" style="font-size: 8px;">Partially Effective</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT: THE DECISION MATRIX (CASE PROJECTIONS) -->
        <div class="details-panel" style="flex: 2;">
          
          <!-- THREE SCENARIOS COMPARISON CARDS -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            
            <!-- Best Case Card -->
            <div class="glass-panel ai-explain-trigger" data-explain-type="scenario" data-explain-id="best" style="border-top: 4px solid var(--color-within-appetite); padding: 16px; cursor: pointer;">
              <span class="profile-role-badge within" style="font-size: 9px; margin-bottom: 6px;">Best Case</span>
              <h3 style="font-size: 20px; font-weight:800; font-family: var(--font-header); margin-bottom: 8px; color: var(--color-within-appetite);">
                ${scaledRevenue.best}
              </h3>
              <p style="font-size:11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                Rapid recovery, zero net customer loss, and minimal brand damage.
              </p>
              <div style="border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 11px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span style="color:var(--text-muted);">EBITDA Margin:</span>
                  <span style="font-weight: 600; color: var(--color-within-appetite);">${scaledEbitda.best}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Cash impact:</span>
                  <span style="font-weight: 600; color: var(--color-within-appetite);">${scaledCash.best}</span>
                </div>
              </div>
            </div>

            <!-- Expected Case Card -->
            <div class="glass-panel ai-explain-trigger" data-explain-type="scenario" data-explain-id="expected" style="border-top: 4px solid var(--color-near-appetite); padding: 16px; background: rgba(217, 119, 6, 0.02); cursor: pointer;">
              <span class="profile-role-badge near" style="font-size: 9px; margin-bottom: 6px;">Expected Case</span>
              <h3 style="font-size: 20px; font-weight:800; font-family: var(--font-header); margin-bottom: 8px; color: var(--color-near-appetite);">
                ${scaledRevenue.expected}
              </h3>
              <p style="font-size:11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                Baseline operational disruption, standard customer SLA payouts.
              </p>
              <div style="border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 11px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span style="color:var(--text-muted);">EBITDA Margin:</span>
                  <span style="font-weight: 600; color: var(--color-near-appetite);">${scaledEbitda.expected}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Cash impact:</span>
                  <span style="font-weight: 600; color: var(--color-near-appetite);">${scaledCash.expected}</span>
                </div>
              </div>
            </div>

            <!-- Worst Case Card -->
            <div class="glass-panel ai-explain-trigger" data-explain-type="scenario" data-explain-id="worst" style="border-top: 4px solid var(--color-above-appetite); padding: 16px; background: rgba(225, 29, 72, 0.02); cursor: pointer;">
              <span class="profile-role-badge above" style="font-size: 9px; margin-bottom: 6px;">Worst Case</span>
              <h3 style="font-size: 20px; font-weight:800; font-family: var(--font-header); margin-bottom: 8px; color: var(--color-above-appetite);">
                ${scaledRevenue.worst}
              </h3>
              <p style="font-size:11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                Severe penalty, key account churn, and major system blackout.
              </p>
              <div style="border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 11px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span style="color:var(--text-muted);">EBITDA Margin:</span>
                  <span style="font-weight: 600; color: var(--color-above-appetite);">${scaledEbitda.worst}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Cash impact:</span>
                  <span style="font-weight: 600; color: var(--color-above-appetite);">${scaledCash.worst}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- STRATEGIC OBJECTIVE DESTRUCTIVE TRAJECTORY -->
          <div class="glass-panel" style="padding: 20px; margin-top: 16px;">
            <h3 class="dashboard-card-title">Threatened Objective Cascade Path</h3>
            
            <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; display:flex; gap:16px; align-items:center;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(225,29,72,0.08); display:flex; justify-content:center; align-items:center; flex-shrink:0;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--color-above-appetite)" style="width:24px;height:24px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <span class="profile-role-badge above" style="font-size: 8px; margin-bottom: 2px;">Threat to Goal Alignment</span>
                <strong style="font-size: 14px; color: var(--text-primary); display:block; margin-bottom:2px;">
                  ${linkedObj ? linkedObj.title : 'No objective linked'}
                </strong>
                <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                  ${currentScenario ? currentScenario.objectiveImpact : 'No simulation run.'}
                </p>
              </div>
            </div>

            <!-- INTERACTIVE STRATEGIC BRIEF GENERATED -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px; font-size:12px; line-height:1.4; color: var(--text-secondary);">
              <strong>*CRO Boardroom Advisory:</strong> An expected EBITDA shock of <strong style="color:var(--color-near-appetite);">${scaledEbitda.expected}</strong> coupled with cash drain of <strong style="color:var(--color-near-appetite);">${scaledCash.expected}</strong> directly breaches the corporate risk tolerance models. The board is advised to prioritize the validation of the corresponding IT backup architectures and redundant cloud integrations.
            </div>

          </div>

        </div>

      </div>
    `;

    if (this._fromDashboard) {
      AIInsightService.renderBackToDashboardBanner(this, container, `Scenario Planner — Template ${this.selectedScenarioId}`);
    }

    this.bindEvents(container);
  }

  bindEvents(container) {
    // 1. Select template change
    const select = container.querySelector('#select-scenario-template');
    if (select) {
      select.addEventListener('change', () => {
        this.selectedScenarioId = select.value;
        this.render(container);
      });
    }

    // 2. Resilience severity slider input
    const slider = container.querySelector('#resilience-severity-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        this.simulatedSeverity = parseInt(slider.value);
        
        // Re-render template dynamic values without doing a complete redraw
        // to prevent slider focus glitch, let's just do a normal render for simplicity:
        this.render(container);
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const type = trigger.dataset.explainType;
        const id = trigger.dataset.explainId;
        
        let item = null;
        if (type === 'scenario') {
          item = this.state.scenarios.find(s => s.id === this.selectedScenarioId);
          if (item) {
            item = { ...item, selectedCase: id, simulatedSeverity: this.simulatedSeverity };
          }
        }
        
        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });
  }
}

