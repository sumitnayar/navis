// Board Decision Room - Interactive strategic threat simulations (Phase 3)
import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';
import { scenarioTemplates } from './scenarioTemplates.js';

export class ScenarioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;

    // Retrieve pinned spotlight scenario or default to 'scen-cyber'
    const pinnedId = localStorage.getItem('spotlight_scenario_id') || 'scen-cyber';
    this.selectedScenarioId = pinnedId;

    // Parse deep-link param if redirected from dashboard spotlight
    const _sParams = new URLSearchParams(window.location.search);
    const _template = _sParams.get('template');
    if (_template) {
      this.selectedScenarioId = _template;
      this._fromDashboard = true;
    } else {
      this._fromDashboard = false;
    }

    this.activeTimelineTab = 'day1';
    this.selectedResponse = 'strong'; // Default selected management response
    this.enginesExpanded = false;
  }

  clearFilters() {
    this._fromDashboard = false;
  }

  // Helper: check if this scenario is the current dashboard spotlight
  isPinned() {
    const pinnedId = localStorage.getItem('spotlight_scenario_id') || 'scen-cyber';
    return this.selectedScenarioId === pinnedId;
  }

  // Helpers for visual progress bands
  getPercentageWidth(valueStr) {
    if (!valueStr) return '0%';
    const val = valueStr.replace(/[ -₹L]/g, '').trim();
    let num = parseFloat(val);
    if (isNaN(num)) return '50%';
    if (valueStr.includes('Cr')) {
      num = num * 10; // scale Cr up to match visual proportions
    }
    // Max scale is 10 Cr (100%)
    const pct = Math.min(100, Math.max(8, num * 10));
    return `${pct}%`;
  }

  getColorForImpact(valueStr) {
    if (!valueStr) return 'var(--color-within-appetite)';
    if (valueStr.includes('Cr')) {
      const val = parseFloat(valueStr.replace(/[ -₹]/g, ''));
      if (val > 3) return 'var(--color-above-appetite)'; // Red
      return 'var(--color-near-appetite)'; // Yellow/Orange
    }
    return 'var(--color-within-appetite)'; // Green/Blue
  }

  getEbitdaPercentageWidth(ebitdaStr) {
    if (!ebitdaStr) return '0%';
    const val = parseFloat(ebitdaStr.replace(/[-%]/g, ''));
    if (isNaN(val)) return '0%';
    // Max ebitda drag is 35%
    const pct = Math.min(100, Math.max(8, (val / 35) * 100));
    return `${pct}%`;
  }

  getEbitdaColor(ebitdaStr) {
    if (!ebitdaStr) return 'var(--color-within-appetite)';
    const val = parseFloat(ebitdaStr.replace(/[-%]/g, ''));
    if (val > 15) return 'var(--color-above-appetite)';
    if (val > 5) return 'var(--color-near-appetite)';
    return 'var(--color-within-appetite)';
  }

  getBadgeClass(statusText) {
    if (!statusText) return 'within';
    const text = statusText.toLowerCase();
    if (text.includes('critical') || text.includes('severe') || text.includes('out of') || text.includes('level 4') || text.includes('damage') || text.includes('breach')) {
      return 'status-badge above';
    }
    if (text.includes('elevated') || text.includes('moderate') || text.includes('near') || text.includes('level 3') || text.includes('managed')) {
      return 'status-badge near';
    }
    return 'status-badge within';
  }

  render(container) {
    const currentTemplate = scenarioTemplates.find(t => t.id === this.selectedScenarioId) || scenarioTemplates[0];
    const isPinned = this.isPinned();

    const activeTimeline = currentTemplate.timeline[this.activeTimelineTab];
    const activeResponse = currentTemplate.responses[this.selectedResponse];
    const noResponse = currentTemplate.responses['noIntervention'];
    const strongResponse = currentTemplate.responses['strong'];

    container.innerHTML = `
      <style>
        .decision-room-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 24px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          margin-top: 15px;
        }
        .room-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .scenario-meta-box {
          background: rgba(0,0,0,0.01);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
        }
        .meta-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .pinned-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .pinned-status.yes {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .pinned-status.no {
          background: rgba(107, 114, 128, 0.1);
          color: #6B7280;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }
        .timeline-nav {
          display: flex;
          background: rgba(0,0,0,0.02);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 3px;
          margin-bottom: 14px;
        }
        .timeline-tab {
          flex: 1;
          text-align: center;
          padding: 6px 2px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }
        .timeline-tab.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .timeline-card-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .timeline-detail-card {
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          border-radius: 6px;
          padding: 12px;
        }
        .timeline-detail-card h4 {
          margin: 0 0 4px 0;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .timeline-detail-card p {
          margin: 0;
          font-size: 12px;
          color: var(--text-primary);
          line-height: 1.4;
        }
        .response-selectors {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .response-btn {
          text-align: center;
          padding: 8px 4px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }
        .response-btn.active {
          background: var(--color-indigo);
          color: #fff;
          border-color: var(--color-indigo);
        }
        .response-btn:hover:not(.active) {
          background: rgba(0,0,0,0.02);
        }
        .dimension-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .dimension-card {
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dimension-card h4 {
          margin: 0 0 6px 0;
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .dimension-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .progress-band-bg {
          height: 5px;
          background: rgba(0,0,0,0.05);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-band-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.25s ease;
        }
        .side-by-side-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .compare-col {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          background: var(--bg-primary);
        }
        .compare-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-color);
        }
        .compare-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(0,0,0,0.03);
        }
        .compare-row span {
          color: var(--text-secondary);
        }
        .compare-row strong {
          color: var(--text-primary);
        }
        .narrative-paper {
          background: #fbfbfb;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-indigo);
          border-radius: 6px;
          padding: 14px;
          font-family: 'Georgia', serif;
          color: #2d3748;
          line-height: 1.55;
        }
        .narrative-paper h3 {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--color-indigo);
          margin-top: 0;
          margin-bottom: 10px;
          letter-spacing: 0.05em;
        }
        .narrative-item {
          margin-bottom: 12px;
          font-size: 12.5px;
        }
        .narrative-item strong {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 2px;
          letter-spacing: 0.03em;
        }
        .board-action-list {
          padding-left: 16px;
          margin: 6px 0;
          font-size: 12px;
          color: var(--text-primary);
        }
        .board-action-list li {
          margin-bottom: 5px;
          line-height: 1.4;
        }
        .engine-pulsator {
          width: 6px;
          height: 6px;
          background-color: #10B981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 1.6s infinite;
          margin-right: 6px;
          vertical-align: middle;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        .engine-overlay-bar {
          background: rgba(0,0,0,0.02);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .engine-details-box {
          border: 1px solid var(--border-color);
          border-top: none;
          background: var(--bg-primary);
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          padding: 12px;
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .engine-indicator-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
        }
      </style>

      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Executive Strategy & Governance</span>
          <h1>Board Decision Room</h1>
          <p class="page-subtitle">Stress-test corporate response strategies under critical risk conditions.</p>
        </div>
      </div>

      <div class="decision-room-layout">
        
        <!-- LEFT COLUMN: SCENARIO SELECTOR, TIMELINE, RESPONSES -->
        <div class="room-column">
          
          <!-- Scenario Configuration Panel -->
          <div class="glass-panel" style="padding: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 class="dashboard-card-title" style="margin:0;">Active Threat Scenario</h3>
              ${isPinned 
                ? `<span class="pinned-status yes">★ Spotlight Scenario</span>`
                : `<button class="btn btn-secondary btn-small" id="btn-pin-spotlight" style="font-size:10px; padding:3px 8px;">Pin to Spotlight</button>`
              }
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label style="font-size:10px; text-transform:uppercase; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">Select Scenario Template</label>
              <select class="form-control" id="select-scenario-template" style="font-size: 13px; font-weight:600; padding:8px;">
                ${scenarioTemplates.map(t => `<option value="${t.id}" ${this.selectedScenarioId === t.id ? 'selected' : ''}>[${t.category}] ${t.title}</option>`).join('')}
              </select>
            </div>

            <div class="scenario-meta-box">
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-navy); margin-bottom:4px;">Trigger Event</div>
              <p style="font-size:12px; color:var(--text-primary); line-height:1.4; margin:0 0 10px 0;">${currentTemplate.trigger}</p>
              
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-navy); margin-bottom:4px;">Immediate Impact</div>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0 0 10px 0;">${currentTemplate.immediateImpact}</p>
              
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-navy); margin-bottom:4px;">Affected Objectives</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:2px;">
                ${currentTemplate.affectedObjectives.map(o => `<span class="status-badge near" style="font-size:9px; font-weight:600;">${o}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Timeline Explorer -->
          <div class="glass-panel" style="padding: 16px;">
            <h3 class="dashboard-card-title">Timeline Progression</h3>
            <p style="font-size:11px; color:var(--text-muted); line-height:1.3; margin-top: -6px; margin-bottom: 12px;">Track operational and financial impacts through different timeline gates.</p>
            
            <div class="timeline-nav">
              <button class="timeline-tab ${this.activeTimelineTab === 'day1' ? 'active' : ''}" data-timeline="day1">Day 1</button>
              <button class="timeline-tab ${this.activeTimelineTab === 'week1' ? 'active' : ''}" data-timeline="week1">Week 1</button>
              <button class="timeline-tab ${this.activeTimelineTab === 'month1' ? 'active' : ''}" data-timeline="month1">Month 1</button>
              <button class="timeline-tab ${this.activeTimelineTab === 'quarter1' ? 'active' : ''}" data-timeline="quarter1">Qtr 1</button>
              <button class="timeline-tab ${this.activeTimelineTab === 'year1' ? 'active' : ''}" data-timeline="year1">Year 1</button>
            </div>

            <div class="timeline-card-grid">
              <div class="timeline-detail-card" style="border-left: 3px solid var(--color-indigo);">
                <h4>Operational Effects</h4>
                <p>${activeTimeline.operational}</p>
              </div>
              <div class="timeline-detail-card" style="border-left: 3px solid var(--color-near-appetite);">
                <h4>Financial Effects</h4>
                <p>${activeTimeline.financial}</p>
              </div>
              <div class="timeline-detail-card" style="border-left: 3px solid var(--color-above-appetite);">
                <h4>Reputation Effects</h4>
                <p>${activeTimeline.reputation}</p>
              </div>
              <div class="timeline-detail-card" style="border-left: 3px solid #6b7280;">
                <h4>Control Breakdown & Key Vulnerabilities</h4>
                <p>${activeTimeline.controls}</p>
              </div>
              <div class="timeline-detail-card" style="border-left: 3px solid #10b981;">
                <h4>Recovery Action In Progress</h4>
                <p>${activeTimeline.recovery}</p>
              </div>
            </div>
          </div>

          <!-- Management Response Option Selection -->
          <div class="glass-panel" style="padding: 16px;">
            <h3 class="dashboard-card-title">Management Response Options</h3>
            <p style="font-size:11px; color:var(--text-muted); line-height:1.3; margin-top: -6px; margin-bottom: 12px;">Toggle different intervention levels to modify outcome metrics.</p>

            <div class="response-selectors">
              <button class="response-btn ${this.selectedResponse === 'noIntervention' ? 'active' : ''}" data-response="noIntervention">No Intervention</button>
              <button class="response-btn ${this.selectedResponse === 'basic' ? 'active' : ''}" data-response="basic">Basic Response</button>
              <button class="response-btn ${this.selectedResponse === 'strong' ? 'active' : ''}" data-response="strong">Strong Response</button>
              <button class="response-btn ${this.selectedResponse === 'aggressive' ? 'active' : ''}" data-response="aggressive">Aggressive Response</button>
            </div>

            <div style="background:rgba(0,0,0,0.015); border:1px solid var(--border-color); border-radius:6px; padding:12px; font-size:12px; line-height:1.4; color:var(--text-primary);">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                <span style="font-weight:700; text-transform:uppercase; font-size:10px; color:var(--text-secondary);">Selected Level Characteristics</span>
                <span class="status-badge within" style="font-size:9px; font-weight:700; background:rgba(99,102,241,0.1); color:var(--color-indigo);">
                  ${this.selectedResponse === 'noIntervention' ? 'Level 0' : this.selectedResponse === 'basic' ? 'Level 1' : this.selectedResponse === 'strong' ? 'Level 2' : 'Level 3'}
                </span>
              </div>
              <div style="margin-bottom:6px;"><strong>Outcome:</strong> ${activeResponse.outcome}</div>
              <div style="margin-bottom:6px;"><strong>Controls that Matter:</strong> ${activeResponse.controls}</div>
              <div style="margin-bottom:6px;"><strong>Insurance Cover:</strong> ${activeResponse.insurance}</div>
              <div style="margin-bottom:6px;"><strong>Comms Quality:</strong> ${activeResponse.comms}</div>
              <div><strong>Recovery Effectiveness:</strong> <span style="font-weight:600; color:var(--color-indigo);">${activeResponse.recovery}</span></div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: IMPACT DIMENSIONS, SIDE-BY-SIDE COMPARE, NARRATIVE & ACTIONS -->
        <div class="room-column">
          
          <!-- Dynamic Impact Dimensions under Selected Response -->
          <div class="glass-panel" style="padding: 16px;">
            <h3 class="dashboard-card-title">Impact Dimensions (Current Response)</h3>
            
            <div class="dimension-card-grid">
              
              <div class="dimension-card">
                <h4>Revenue Impact</h4>
                <div class="dimension-value" style="color: ${this.getColorForImpact(activeResponse.revenue)};">${activeResponse.revenue}</div>
                <div class="progress-band-bg">
                  <div class="progress-band-fill" style="width: ${this.getPercentageWidth(activeResponse.revenue)}; background: ${this.getColorForImpact(activeResponse.revenue)};"></div>
                </div>
              </div>

              <div class="dimension-card">
                <h4>Cash Impact</h4>
                <div class="dimension-value" style="color: ${this.getColorForImpact(activeResponse.cash)};">${activeResponse.cash}</div>
                <div class="progress-band-bg">
                  <div class="progress-band-fill" style="width: ${this.getPercentageWidth(activeResponse.cash)}; background: ${this.getColorForImpact(activeResponse.cash)};"></div>
                </div>
              </div>

              <div class="dimension-card">
                <h4>EBITDA Impact</h4>
                <div class="dimension-value" style="color: ${this.getEbitdaColor(activeResponse.ebitda)};">${activeResponse.ebitda}</div>
                <div class="progress-band-bg">
                  <div class="progress-band-fill" style="width: ${this.getEbitdaPercentageWidth(activeResponse.ebitda)}; background: ${this.getEbitdaColor(activeResponse.ebitda)};"></div>
                </div>
              </div>

              <div class="dimension-card">
                <h4>Board Escalation Level</h4>
                <div class="dimension-value" style="font-size:13px; padding-top:4px;">${activeResponse.escalation}</div>
                <span class="${this.getBadgeClass(activeResponse.escalation)}" style="margin-top:4px; font-size:9px; width:fit-content;">${activeResponse.escalation.includes('Level 4') ? 'Immediate Alert' : activeResponse.escalation.includes('Level 3') ? 'Executive Action' : 'Standard Watch'}</span>
              </div>

              <div class="dimension-card">
                <h4>Reputation Exposure</h4>
                <div class="dimension-value" style="font-size:14px; padding-top:4px;">${activeResponse.reputation}</div>
                <span class="${this.getBadgeClass(activeResponse.reputation)}" style="font-size:9px; width:fit-content;">${activeResponse.reputation}</span>
              </div>

              <div class="dimension-card">
                <h4>Customer Trust</h4>
                <div class="dimension-value" style="font-size:14px; padding-top:4px;">${activeResponse.trust}</div>
                <span class="${this.getBadgeClass(activeResponse.trust)}" style="font-size:9px; width:fit-content;">${activeResponse.trust}</span>
              </div>

              <div class="dimension-card">
                <h4>Risk Appetite Impact</h4>
                <div class="dimension-value" style="font-size:14px; padding-top:4px;">${activeResponse.appetite}</div>
                <span class="${this.getBadgeClass(activeResponse.appetite)}" style="font-size:9px; width:fit-content;">${activeResponse.appetite}</span>
              </div>

              <div class="dimension-card">
                <h4>Recovery Duration</h4>
                <div class="dimension-value" style="font-size:15px; padding-top:4px;">${activeResponse.duration}</div>
                <span class="status-badge within" style="font-size:9px; width:fit-content; background:rgba(0,0,0,0.04); color:var(--text-primary); border:none;">Target Limit: 12m</span>
              </div>

            </div>
          </div>

          <!-- Side-by-Side Comparison: No Intervention vs. Strong Response -->
          <div class="glass-panel" style="padding: 16px;">
            <h3 class="dashboard-card-title">Intervention Trade-off Comparison</h3>
            
            <div class="side-by-side-grid">
              
              <!-- No Response Col -->
              <div class="compare-col" style="border-top: 4px solid var(--color-above-appetite);">
                <div class="compare-header" style="color: var(--color-above-appetite);">Without Intervention</div>
                
                <div class="compare-row">
                  <span>Revenue Impact</span>
                  <strong style="color:var(--color-above-appetite);">${noResponse.revenue}</strong>
                </div>
                <div class="compare-row">
                  <span>Cash Impact</span>
                  <strong>${noResponse.cash}</strong>
                </div>
                <div class="compare-row">
                  <span>EBITDA Shock</span>
                  <strong style="color:var(--color-above-appetite);">${noResponse.ebitda}</strong>
                </div>
                <div class="compare-row">
                  <span>Reputation</span>
                  <span class="${this.getBadgeClass(noResponse.reputation)}" style="font-size:8px;">${noResponse.reputation}</span>
                </div>
                <div class="compare-row">
                  <span>Escalation</span>
                  <strong>Level 4</strong>
                </div>
                <div class="compare-row" style="border:none;">
                  <span>Recovery Time</span>
                  <strong>${noResponse.duration}</strong>
                </div>
              </div>

              <!-- Strong Response Col -->
              <div class="compare-col" style="border-top: 4px solid var(--color-within-appetite);">
                <div class="compare-header" style="color: var(--color-within-appetite);">With Strong Response</div>
                
                <div class="compare-row">
                  <span>Revenue Impact</span>
                  <strong style="color:var(--color-within-appetite);">${strongResponse.revenue}</strong>
                </div>
                <div class="compare-row">
                  <span>Cash Impact</span>
                  <strong>${strongResponse.cash}</strong>
                </div>
                <div class="compare-row">
                  <span>EBITDA Shock</span>
                  <strong style="color:var(--color-within-appetite);">${strongResponse.ebitda}</strong>
                </div>
                <div class="compare-row">
                  <span>Reputation</span>
                  <span class="${this.getBadgeClass(strongResponse.reputation)}" style="font-size:8px;">${strongResponse.reputation}</span>
                </div>
                <div class="compare-row">
                  <span>Escalation</span>
                  <strong>Level 2</strong>
                </div>
                <div class="compare-row" style="border:none;">
                  <span>Recovery Time</span>
                  <strong>${strongResponse.duration}</strong>
                </div>
              </div>

            </div>
          </div>

          <!-- Narrative Engine Paper & Board Actions -->
          <div class="glass-panel" style="padding: 16px;">
            <h3 class="dashboard-card-title">Executive Briefing Paper</h3>
            
            <div class="narrative-paper">
              <h3>Board Narrative Briefing</h3>
              
              <div class="narrative-item">
                <strong>Executive Summary</strong>
                ${currentTemplate.narratives[this.selectedResponse].summary}
              </div>

              <div class="narrative-item">
                <strong>Expected Outcome</strong>
                ${currentTemplate.narratives[this.selectedResponse].expected}
              </div>

              <div class="narrative-item">
                <strong>Worst Case Trajectory</strong>
                ${currentTemplate.narratives[this.selectedResponse].worst}
              </div>

              <div class="narrative-item">
                <strong>Recovery Path</strong>
                ${currentTemplate.narratives[this.selectedResponse].recovery}
              </div>

              <div class="narrative-item" style="margin-bottom:0;">
                <strong>Board Oversight Note</strong>
                ${currentTemplate.narratives[this.selectedResponse].boardNote}
              </div>
            </div>

            ${currentTemplate.narratives.executiveBrief ? `
            <div style="border-top:1px solid var(--border-color); padding-top:14px; margin-top:14px;">
              <h4 style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--color-navy); margin:0 0 8px 0;">Executive Briefs</h4>
              
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:rgba(0,0,0,0.02); border-left:3px solid var(--color-indigo); padding:10px 12px; border-radius:4px;">
                  <strong style="font-size:10px; color:var(--color-indigo); text-transform:uppercase; font-weight:700; display:block; margin-bottom:6px;">CEO Memo to Board</strong>
                  <div style="font-size:11px; color:var(--text-primary); line-height:1.5; white-space:pre-wrap; font-family:'Georgia', serif;">${currentTemplate.narratives.executiveBrief.ceoMemo}</div>
                </div>

                <div style="background:rgba(0,0,0,0.02); border-left:3px solid var(--color-above-appetite); padding:10px 12px; border-radius:4px;">
                  <strong style="font-size:10px; color:var(--color-above-appetite); text-transform:uppercase; font-weight:700; display:block; margin-bottom:6px;">General Counsel Assessment</strong>
                  <div style="font-size:11px; color:var(--text-primary); line-height:1.5; white-space:pre-wrap; font-family:'Georgia', serif;">${currentTemplate.narratives.executiveBrief.legalCounsel}</div>
                </div>
              </div>
            </div>
            ` : ''}

            <div style="border-top:1px solid var(--border-color); padding-top:14px; margin-top:14px;">
              <h4 style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--color-navy); margin:0 0 8px 0;">Board Actions Panel</h4>
              
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div>
                  <strong style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Questions the Board Should Ask:</strong>
                  <ul class="board-action-list">
                    ${currentTemplate.boardActions.questions.map(q => `<li>${q}</li>`).join('')}
                  </ul>
                </div>

                <div>
                  <strong style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Decisions Required:</strong>
                  <ul class="board-action-list">
                    ${currentTemplate.boardActions.decisions.map(d => `<li>${d}</li>`).join('')}
                  </ul>
                </div>

                <div>
                  <strong style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Committees Involved:</strong>
                  <div style="display:flex; gap:6px; margin-top:4px;">
                    ${currentTemplate.boardActions.committees.map(c => `<span class="status-badge within" style="font-size:9px; font-weight:600; background:rgba(0,0,0,0.04); color:var(--text-primary); border:none;">${c}</span>`).join('')}
                  </div>
                </div>

                <div>
                  <strong style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Escalation Requirements:</strong>
                  <ul class="board-action-list">
                    ${currentTemplate.boardActions.escalations.map(e => `<li>${e}</li>`).join('')}
                  </ul>
                </div>

                <div>
                  <strong style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Suggested Immediate Actions:</strong>
                  <ul class="board-action-list">
                    ${currentTemplate.boardActions.immediateActions.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Future-Ready hidden analytical engines status bar -->
          <div>
            <div class="engine-overlay-bar" id="engine-overlay-toggle">
              <div>
                <span class="engine-pulsator"></span>
                <strong>Analytical Overlay Engines: Active (Hidden)</strong>
              </div>
              <span id="engine-chevron" style="font-size: 10px;">${this.enginesExpanded ? '▲' : '▼'}</span>
            </div>
            
            ${this.enginesExpanded ? `
              <div class="engine-details-box">
                <div class="engine-indicator-row">
                  <span>Monte Carlo Engine</span>
                  <span class="pinned-status yes" style="font-size:8px; padding:1px 6px;">Standby (Overlay active)</span>
                </div>
                <div class="engine-indicator-row">
                  <span>Bayesian Updating Registry</span>
                  <span class="pinned-status yes" style="font-size:8px; padding:1px 6px;">Standby</span>
                </div>
                <div class="engine-indicator-row">
                  <span>Risk Gravity Matrix</span>
                  <span class="pinned-status yes" style="font-size:8px; padding:1px 6px;">Standby</span>
                </div>
                <div class="engine-indicator-row">
                  <span>Fragility Indexer</span>
                  <span class="pinned-status yes" style="font-size:8px; padding:1px 6px;">Standby</span>
                </div>
                <div class="engine-indicator-row" style="border:none;">
                  <span>Entropy Tracking Protocol</span>
                  <span class="pinned-status yes" style="font-size:8px; padding:1px 6px;">Standby</span>
                </div>
                <div style="font-size:9px; color:var(--text-muted); line-height:1.3; border-top:1px dashed var(--border-color); padding-top:6px; margin-top:4px;">
                  All analytical math engines process simulation variables in background threads to protect board executive comprehension from statistics jargon.
                </div>
              </div>
            ` : ''}
          </div>

        </div>

      </div>
    `;

    if (this._fromDashboard) {
      AIInsightService.renderBackToDashboardBanner(this, container, `Decision Room — ${currentTemplate.title}`);
    }

    this.bindEvents(container);
  }

  bindEvents(container) {
    // 1. Template dropdown change
    const select = container.querySelector('#select-scenario-template');
    if (select) {
      select.addEventListener('change', () => {
        this.selectedScenarioId = select.value;
        this.activeTimelineTab = 'day1';
        this.selectedResponse = 'strong';
        this.render(container);
        
        // Notify state changes if needed
        if (this.onStateChange) {
          this.onStateChange({ activeScenarioId: this.selectedScenarioId });
        }
      });
    }

    // 2. Timeline tab switcher click
    container.querySelectorAll('.timeline-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTimelineTab = tab.dataset.timeline;
        this.render(container);
      });
    });

    // 3. Management response level selector click
    container.querySelectorAll('.response-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedResponse = btn.dataset.response;
        this.render(container);
      });
    });

    // 4. Pin to spotlight button click
    const btnPin = container.querySelector('#btn-pin-spotlight');
    if (btnPin) {
      btnPin.addEventListener('click', () => {
        localStorage.setItem('spotlight_scenario_id', this.selectedScenarioId);
        this.render(container);
        
        // Force header re-render on parent if state is synced
        if (this.onStateChange) {
          this.onStateChange({ spotlightUpdated: true });
        }
      });
    }

    // 5. Expandable analytical overlay toggle
    const toggle = container.querySelector('#engine-overlay-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        this.enginesExpanded = !this.enginesExpanded;
        this.render(container);
      });
    }
  }
}
