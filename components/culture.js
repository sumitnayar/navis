// Risk Culture Scorecard - Visualizing Corporate Risk Awareness Trends (F8 & F9)

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';

export class CultureComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.isEditing = false;
  }

  // Calculate dynamic Culture Score based on weighted metrics
  calculateDynamicCultureScore(metrics) {
    // Math logic:
    // Policy Acknowledgement: 30% weight
    // Training Completion: 30% weight
    // Reporting Velocity: 20% weight (lower days = higher score, e.g. <3 days is 100%, 15 days is 20%)
    // Near-Miss Logs: 10% weight (transparent logging is healthy, e.g. >20 logs is 100%)
    // Whistleblower active: 10% weight (0 cases is 100%, each active case subtracts 20% from this weight block)
    
    const policyWeight = (metrics.policyAcknowledgementRate || 0) * 0.3;
    const trainingWeight = (metrics.trainingCompletionRate || 0) * 0.3;
    
    const vel = metrics.incidentReportVelocityDays || 4;
    const velScore = Math.max(0, 100 - (vel - 1) * 7);
    const velWeight = velScore * 0.2;

    const near = metrics.nearMissLoggedCount || 28;
    const nearScore = Math.min(100, (near / 30) * 100);
    const nearWeight = nearScore * 0.1;

    const whistle = metrics.whistleblowerCasesActive || 0;
    const whistleScore = Math.max(0, 100 - whistle * 20);
    const whistleWeight = whistleScore * 0.1;

    return Math.round(policyWeight + trainingWeight + velWeight + nearWeight + whistleWeight);
  }

  render(container) {
    const metrics = this.state.cultureMetrics || {
      policyAcknowledgementRate: 94,
      trainingCompletionRate: 88,
      incidentReportVelocityDays: 4,
      nearMissLoggedCount: 28,
      whistleblowerCasesActive: 0,
      cultureScore: 86,
      trend: "Improving"
    };

    const calculatedScore = this.calculateDynamicCultureScore(metrics);
    metrics.cultureScore = calculatedScore;

    // Update global state
    this.state.cultureMetrics = metrics;

    let trendClass = 'within';
    if (metrics.trend === 'Deteriorating') trendClass = 'above';
    else if (metrics.trend === 'Stable') trendClass = 'near';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">HR & Security Operations</span>
          <h1>Risk Culture Scorecard</h1>
          <p class="page-subtitle">Track corporate risk awareness indices | Evaluate policy compliance and whistleblowing indicators</p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <div class="register-layout">
        
        <!-- LEFT: CURRENT INDEX GAUGES -->
        <div class="details-panel" style="flex: 1.2;">
          
          <!-- MAIN CIRCULAR SCORE RING CARD -->
          <div class="glass-panel" style="text-align: center; padding: 24px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <h3 class="dashboard-card-title" style="margin-bottom:16px;">Corporate Risk Health</h3>
            
            <!-- visual SVG circular ring -->
            <div style="position:relative; width:160px; height:160px; margin-bottom:16px;">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" stroke-width="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-indigo)" stroke-width="12" 
                        stroke-dasharray="440" 
                        stroke-dashoffset="${440 - (440 * calculatedScore) / 100}" 
                        stroke-linecap="round"
                        transform="rotate(-90 80 80)"
                        style="transition: stroke-dashoffset 0.8s ease;" />
              </svg>
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
                <span style="font-size:36px; font-weight:800; font-family:var(--font-header); color:var(--text-primary); display:block; line-height:1;">
                  ${calculatedScore}
                </span>
                <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">
                  Health Index
                </span>
              </div>
            </div>

            <div style="display:flex; gap:12px; align-items:center;">
              <span style="font-size:12px; color:var(--text-secondary);">Awareness Trend:</span>
              <span class="status-badge ${trendClass}" style="font-size:10px;">${metrics.trend}</span>
            </div>

            <p style="font-size:11px; color:var(--text-muted); line-height:1.4; margin-top:14px; max-width:260px; margin-left:auto; margin-right:auto;">
              *High culture scores decrease systemic cyber breaches and operational audit failures by up to 40%.
            </p>
          </div>

          <!-- CONNECTED CONTROLS / EDIT TOGGLE -->
          <div class="glass-panel" style="padding:16px;">
            <h4 style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Appraise Culture Ratings</h4>
            <p style="font-size:11px; color:var(--text-muted); line-height:1.4; margin-bottom:14px;">
              Publish newly aggregated quarterly training or policy acknowledgement reports directly to the board ledger.
            </p>
            <button class="btn btn-secondary" id="btn-toggle-culture-edit" style="width:100%; justify-content:center;">
              ${this.isEditing ? 'Close Appraisal Form' : 'Aggregate Appraisal Stats'}
            </button>
          </div>

        </div>

        <!-- RIGHT: THE DETAIL INDEX RATINGS GRID -->
        <div class="details-panel" style="flex: 2;">
          
          <!-- ADJUSTABLE OR RENDER ONLY STATS -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Scorecard Breakdown</h3>
            
            ${this.isEditing ? `
              <!-- APPRAISAL INPUT FORM -->
              <form id="culture-appraisal-form" onsubmit="return false;" style="display:flex; flex-direction:column; gap:16px;">
                
                <div class="form-group" style="margin:0;">
                  <label>Policy Acknowledgement Rate: <span class="slider-value" id="val-policy">${metrics.policyAcknowledgementRate}%</span></label>
                  <div class="slider-group" style="margin:0;">
                    <input type="range" id="input-culture-policy" min="50" max="100" value="${metrics.policyAcknowledgementRate}" />
                  </div>
                </div>

                <div class="form-group" style="margin:0;">
                  <label>Security Training Completion: <span class="slider-value" id="val-training">${metrics.trainingCompletionRate}%</span></label>
                  <div class="slider-group" style="margin:0;">
                    <input type="range" id="input-culture-training" min="50" max="100" value="${metrics.trainingCompletionRate}" />
                  </div>
                </div>

                <div class="form-group" style="margin:0;">
                  <label>Incident Reporting Speed (Days): <span class="slider-value" id="val-speed">${metrics.incidentReportVelocityDays} Days</span></label>
                  <div class="slider-group" style="margin:0;">
                    <input type="range" id="input-culture-speed" min="1" max="15" value="${metrics.incidentReportVelocityDays}" />
                  </div>
                </div>

                <div class="form-group" style="margin:0;">
                  <label>Near-Miss Reports Logged: <span class="slider-value" id="val-near">${metrics.nearMissLoggedCount}</span></label>
                  <div class="slider-group" style="margin:0;">
                    <input type="range" id="input-culture-near" min="0" max="50" value="${metrics.nearMissLoggedCount}" />
                  </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                  <div class="form-group">
                    <label>Active Whistleblower Cases</label>
                    <input type="number" class="form-control" id="input-culture-whistle" min="0" max="10" value="${metrics.whistleblowerCasesActive}" required />
                  </div>
                  <div class="form-group">
                    <label>Published Trend Trajectory</label>
                    <select class="form-control" id="input-culture-trend" style="font-size:12px;">
                      <option value="Improving" ${metrics.trend === 'Improving' ? 'selected' : ''}>Improving</option>
                      <option value="Stable" ${metrics.trend === 'Stable' ? 'selected' : ''}>Stable</option>
                      <option value="Deteriorating" ${metrics.trend === 'Deteriorating' ? 'selected' : ''}>Deteriorating</option>
                    </select>
                  </div>
                </div>

                <button class="btn btn-primary" id="btn-submit-appraisal" style="justify-content:center; margin-top:8px;">
                  Publish Appraisal & Recalculate
                </button>

              </form>
            ` : `
              <!-- RENDER READ ONLY METRICS -->
              <div style="display:flex; flex-direction:column; gap:16px;">
                
                <div style="padding:14px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:flex; align-items:center; gap:4px;">
                      <span>Policy Acknowledgement</span>
                      <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="culture" data-explain-id="policy" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                        </svg>
                      </button>
                    </strong>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Target: >95% employees | Weight: 30%</div>
                  </div>
                  <span class="status-badge ${metrics.policyAcknowledgementRate >= 95 ? 'within' : 'near'}" style="font-size:11px; font-weight:700;">
                    ${metrics.policyAcknowledgementRate}%
                  </span>
                </div>

                <div style="padding:14px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:flex; align-items:center; gap:4px;">
                      <span>Security Awareness Training</span>
                      <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="culture" data-explain-id="training" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                        </svg>
                      </button>
                    </strong>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Target: >90% completion | Weight: 30%</div>
                  </div>
                  <span class="status-badge ${metrics.trainingCompletionRate >= 90 ? 'within' : 'near'}" style="font-size:11px; font-weight:700;">
                    ${metrics.trainingCompletionRate}%
                  </span>
                </div>

                <div style="padding:14px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:flex; align-items:center; gap:4px;">
                      <span>Incident Reporting Velocity</span>
                      <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="culture" data-explain-id="reporting" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                        </svg>
                      </button>
                    </strong>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Target: <3 days to alert | Weight: 20%</div>
                  </div>
                  <span class="status-badge ${metrics.incidentReportVelocityDays <= 3 ? 'within' : 'near'}" style="font-size:11px; font-weight:700;">
                    ${metrics.incidentReportVelocityDays} Days
                  </span>
                </div>

                <div style="padding:14px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:flex; align-items:center; gap:4px;">
                      <span>Near-Miss Proactive Logging</span>
                      <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="culture" data-explain-id="near-miss" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                        </svg>
                      </button>
                    </strong>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Healthy transparency check | Weight: 10%</div>
                  </div>
                  <span class="status-badge within" style="font-size:11px; font-weight:700;">
                    ${metrics.nearMissLoggedCount} Cases
                  </span>
                </div>

                <div style="padding:14px; background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:flex; align-items:center; gap:4px;">
                      <span>Active Whistleblowing Disclosures</span>
                      <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="culture" data-explain-id="whistleblower" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                        </svg>
                      </button>
                    </strong>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Active corporate complaints | Weight: 10%</div>
                  </div>
                  <span class="status-badge ${metrics.whistleblowerCasesActive === 0 ? 'within' : 'above'}" style="font-size:11px; font-weight:700;">
                    ${metrics.whistleblowerCasesActive} Active
                  </span>
                </div>

              </div>
            `}

          </div>
        </div>

      </div>
    `;

    this.bindEvents(container, metrics);
  }

  bindEvents(container, metrics) {
    // 1. Toggle appraisal form
    const toggleBtn = container.querySelector('#btn-toggle-culture-edit');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isEditing = !this.isEditing;
        this.render(container);
      });
    }

    // 2. Real-time form sliders values mapping
    if (this.isEditing) {
      const inputs = ['policy', 'training', 'speed', 'near'];
      inputs.forEach(key => {
        const slider = container.querySelector(`#input-culture-${key}`);
        slider.addEventListener('input', () => {
          let suffix = '';
          if (key === 'policy' || key === 'training') suffix = '%';
          else if (key === 'speed') suffix = ' Days';
          
          container.querySelector(`#val-${key}`).textContent = slider.value + suffix;
        });
      });

      // 3. Submit appraisal
      container.querySelector('#btn-submit-appraisal').addEventListener('click', async () => {
        const form = container.querySelector('#culture-appraisal-form');
        if (!form.reportValidity()) return;

        const updated = {
          policyAcknowledgementRate: parseInt(container.querySelector('#input-culture-policy').value),
          trainingCompletionRate: parseInt(container.querySelector('#input-culture-training').value),
          incidentReportVelocityDays: parseInt(container.querySelector('#input-culture-speed').value),
          nearMissLoggedCount: parseInt(container.querySelector('#input-culture-near').value),
          whistleblowerCasesActive: parseInt(container.querySelector('#input-culture-whistle').value),
          trend: container.querySelector('#input-culture-trend').value
        };

        updated.cultureScore = this.calculateDynamicCultureScore(updated);

        await StorageService.saveCultureMetrics(updated);
        
        // Refresh state
        this.state.cultureMetrics = await StorageService.getCultureMetrics();
        this.isEditing = false;
        this.render(container);

        this.onStateChange({ cultureMetrics: this.state.cultureMetrics });
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = trigger.dataset.explainType;
        const id = trigger.dataset.explainId;
        
        let item = null;
        if (type === 'culture') {
          if (id === 'policy') {
            item = { name: 'Policy Acknowledgement Rate', score: `${metrics.policyAcknowledgementRate}%`, target: '>95%' };
          } else if (id === 'training') {
            item = { name: 'Security Awareness Training', score: `${metrics.trainingCompletionRate}%`, target: '>90%' };
          } else if (id === 'reporting') {
            item = { name: 'Incident Reporting Velocity', score: `${metrics.incidentReportVelocityDays} Days`, target: '<3 days' };
          } else if (id === 'near-miss') {
            item = { name: 'Near-Miss Proactive Logging', score: `${metrics.nearMissLoggedCount} Cases`, target: 'Continuous' };
          } else if (id === 'whistleblower') {
            item = { name: 'Active Whistleblowing Disclosures', score: `${metrics.whistleblowerCasesActive} Active`, target: '0 cases' };
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
      AIInsightService.renderPageInsightCard('culture', insightContainer, this.state);
    }
  }
}
