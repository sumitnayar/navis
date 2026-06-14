// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';
import { AIInsightService } from '../services/aiInsightService.js';
import { RiskIntelligenceService } from '../services/riskIntelligenceService.js';
import { scenarioTemplates } from './scenarioTemplates.js';

const cleanTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/^\[demo-trk-risk-\d+\]\s*/i, '')
    .replace(/^\[DEMO Trackier SaaS\]\s*/i, '')
    .trim();
};

export class DashboardComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedHeatmapRiskIndex = null;
  }

  // Navigation Helper
  navigateToPage(url, tabKey) {
    window.history.pushState(null, '', url);
    this.onStateChange({ activeTab: tabKey });
  }

  render(container) {
    const mode = this.state.operatingMode || 'board';
    if (mode === 'board') {
      this.renderBoardMode(container);
    } else {
      this.renderStandardMode(container);
    }

    // Bind common segmented switcher events
    container.querySelectorAll('.dash-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedMode = btn.dataset.mode;
        this.state.operatingMode = selectedMode;
        localStorage.setItem('navis_operating_mode', selectedMode);
        this.render(container); // Re-render just the dashboard
      });
    });
  }

  renderStandardMode(container) {
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];

    const aboveCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const nearCount = risks.filter(r => r.appetiteStatus === 'Near Appetite').length;
    const withinCount = risks.filter(r => r.appetiteStatus === 'Within Appetite').length;
    const totalCount = aboveCount + nearCount + withinCount || 1;

    // Calculate dimensions fragility
    const dimensions = [
      { key: 'revenue', label: 'Revenue' },
      { key: 'growth', label: 'Growth' },
      { key: 'customerTrust', label: 'Customer Trust' },
      { key: 'technology', label: 'Technology' },
      { key: 'people', label: 'People' },
      { key: 'operations', label: 'Operations' },
      { key: 'reputation', label: 'Reputation' },
      { key: 'valuation', label: 'Valuation' }
    ];

    const fragilitySums = { revenue: 0, growth: 0, customerTrust: 0, technology: 0, people: 0, operations: 0, reputation: 0, valuation: 0 };
    const count = risks.length || 1;
    risks.forEach(r => {
      if (r.fragility) {
        Object.keys(fragilitySums).forEach(k => {
          fragilitySums[k] += (r.fragility[k] || 0);
        });
      }
    });

    const strategicFragilityRows = dimensions.map(dim => {
      const percent = Math.round((fragilitySums[dim.key] / count) * 20);
      let fragColor = 'var(--color-safe)';
      if (percent >= 80) fragColor = 'var(--color-critical)';
      else if (percent >= 60) fragColor = 'var(--color-warning)';

      const dimRisks = risks.filter(r => r.fragility && r.fragility[dim.key] > 0);
      let trendSum = 0;
      dimRisks.forEach(r => {
        if (r.trend === 'Deteriorating') trendSum += 1;
        else if (r.trend === 'Improving') trendSum -= 1;
      });

      let trendArrow = "→";
      let trendColor = 'var(--color-navy-secondary)';
      if (trendSum > 0) {
        trendArrow = "↑";
        trendColor = 'var(--color-critical)';
      } else if (trendSum < 0) {
        trendArrow = "↓";
        trendColor = 'var(--color-safe)';
      }

      const linkedObjIds = new Set();
      risks.forEach(r => {
        if (r.fragility && r.fragility[dim.key] > 0 && r.objectiveIds) {
          r.objectiveIds.forEach(id => {
            const obj = objectives.find(o => o.id === id);
            if (obj && (obj.status === 'Critical Gaps' || obj.status === 'At Risk')) {
              linkedObjIds.add(id);
            }
          });
        }
      });
      const objAtRisk = linkedObjIds.size;

      return `
        <tr class="fragility-row" style="border-bottom: 0.5px solid var(--border-color); transition: background-color 0.15s;">
          <td style="padding: 10px 0; font-size: 14px; font-weight: 500; color: var(--color-navy);">${dim.label}</td>
          <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: ${fragColor};">${percent}%</td>
          <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: ${trendColor};">${trendArrow}</td>
          <td style="padding: 10px 0; font-size: 14px; color: var(--color-navy-secondary);">${objAtRisk}</td>
        </tr>
      `;
    }).join('');

    // Filter risks for Active Intelligence signals
    const signalRisks = risks.filter(r => {
      const isAboveAppetite = r.appetiteStatus === 'Above Appetite';
      const hasBreachedKRI = r.kris?.some(k => k.status === 'BREACHED');
      return isAboveAppetite || hasBreachedKRI;
    });

    // Rank by residual score descending
    signalRisks.sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0));

    // Get top 5
    const topSignals = signalRisks.slice(0, 5);

    // Render signals HTML
    const insightsHTML = topSignals.length ? topSignals.map(r => {
      const objectivesCount = r.objectiveIds ? r.objectiveIds.length : 0;
      const velocityText = r.timeToImpact || r.velocity || 'N/A';
      const cleanRTitle = cleanTitle(r.title);

      return `
        <div class="insight-card clickable" data-risk-id="${r.id}" style="padding: 12px; background: #FFFFFF; border: 0.5px solid var(--border-color); border-left: 4px solid #E24B4A; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; cursor: pointer;" title="ID: ${r.id}">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${cleanRTitle}</div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--color-navy-secondary);">
              <span>Score: <strong style="color: var(--color-critical);">${r.residualScore}</strong></span>
              <span>Velocity: <strong>${velocityText}</strong></span>
              <span>Objectives: <strong>${objectivesCount}</strong></span>
            </div>
          </div>
          <span style="color: var(--color-navy-secondary); font-size: 14px;">&rarr;</span>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 40px 0; font-size: 13px;">
        ✓ No active intelligence alerts or forecast breaches detected.
      </div>
    `;

    // View all N signals link below the list
    const signalsFooterHTML = signalRisks.length > 5 ? `
      <div style="margin-top: 12px; text-align: right;">
        <a href="/risks" class="view-all-signals-link" style="font-size: 12px; font-weight: 600; color: var(--color-indigo); text-decoration: none;">View all ${signalRisks.length} signals &rarr;</a>
      </div>
    ` : '';

    // Movement panels: Top worsening / Top improving
    const worseningRisks = risks
      .filter(r => r.trend === 'Deteriorating')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3);

    const improvingRisks = risks
      .filter(r => r.trend === 'Improving')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3);

    const worseningHTML = worseningRisks.length ? worseningRisks.map(r => {
      const cleanRTitle = cleanTitle(r.title);
      const hasHistory = r.scoreHistory && r.scoreHistory.length >= 2;
      return `
        <div class="movement-row" data-risk-id="${r.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 6px; cursor: pointer; font-size: 12px;" title="${cleanRTitle}">
          <span style="color: var(--color-navy); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; min-width: 0;">${cleanRTitle}</span>
          ${hasHistory ? `
            <canvas class="sparkline-canvas" data-risk-id="${r.id}" data-type="worsening" width="48" height="24" style="width: 48px; height: 24px; flex-shrink: 0;"></canvas>
          ` : ''}
          <span style="background: var(--color-critical-bg); color: var(--color-critical); padding: 2px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0;">${r.residualScore} ↑</span>
        </div>
      `;
    }).join('') : `<div style="font-size: 11px; color: var(--color-navy-secondary); text-align: center; padding: 20px 0;">No worsening risks.</div>`;

    const improvingHTML = improvingRisks.length ? improvingRisks.map(r => {
      const cleanRTitle = cleanTitle(r.title);
      const hasHistory = r.scoreHistory && r.scoreHistory.length >= 2;
      return `
        <div class="movement-row" data-risk-id="${r.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 6px; cursor: pointer; font-size: 12px;" title="${cleanRTitle}">
          <span style="color: var(--color-navy); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; min-width: 0;">${cleanRTitle}</span>
          ${hasHistory ? `
            <canvas class="sparkline-canvas" data-risk-id="${r.id}" data-type="improving" width="48" height="24" style="width: 48px; height: 24px; flex-shrink: 0;"></canvas>
          ` : ''}
          <span style="background: var(--color-safe-bg); color: var(--color-safe); padding: 2px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0;">${r.residualScore} ↓</span>
        </div>
      `;
    }).join('') : `<div style="font-size: 11px; color: var(--color-navy-secondary); text-align: center; padding: 20px 0;">No improving risks.</div>`;

    const mode = this.state.operatingMode || 'board';
    // Render primary HTML layout
    container.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; justify-content: flex-start;">
        <!-- Segmented Mode Switcher -->
        <div class="mode-switcher-dashboard" style="display: flex; background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 3px; gap: 4px; flex-shrink: 0;">
          <button class="dash-mode-btn" data-mode="board" style="border:none; background:${mode === 'board' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'board' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'board' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Board</button>
          <button class="dash-mode-btn" data-mode="intelligence" style="border:none; background:${mode === 'intelligence' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'intelligence' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'intelligence' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Intelligence</button>
          <button class="dash-mode-btn" data-mode="builder" style="border:none; background:${mode === 'builder' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'builder' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'builder' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Builder</button>
        </div>
      </div>
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
        <div class="page-title-wrap" style="margin-bottom: 0;">
          <span class="profile-role-badge">Enterprise Risk Posture</span>
          <h1>Risk Intelligence Center</h1>
          <p class="page-subtitle">Deep-dive risk portfolio metrics and analytical indicators.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 58% 42%; gap: 20px;">
        
        <!-- LEFT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Panel 1: Active Intelligence -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">ACTIVE INTELLIGENCE</span>
                <span style="font-size: 12px; color: var(--color-navy-secondary);">Ranked signals requiring board attention</span>
              </div>
              
              <!-- Posture Progress Band (Bloomberg style stacked progress) -->
              <div class="posture-progress-band" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 500;">
                  <span style="color: var(--color-critical);">Above: <strong>${aboveCount}</strong></span>
                  <span style="color: var(--color-warning);">Near: <strong>${nearCount}</strong></span>
                  <span style="color: var(--color-safe);">Within: <strong>${withinCount}</strong></span>
                </div>
                <div style="display: flex; height: 8px; background: #E5E7EB; border-radius: var(--radius-sm); overflow: hidden; width: 100%;">
                  ${aboveCount > 0 ? `<div style="width: ${(aboveCount/totalCount)*100}%; background: var(--color-critical);"></div>` : ''}
                  ${nearCount > 0 ? `<div style="width: ${(nearCount/totalCount)*100}%; background: var(--color-warning);"></div>` : ''}
                  ${withinCount > 0 ? `<div style="width: ${(withinCount/totalCount)*100}%; background: var(--color-safe);"></div>` : ''}
                </div>
              </div>
            </div>
            <div id="active-intel-list">
              ${insightsHTML}
            </div>
            ${signalsFooterHTML}
          </div>

          <!-- Panel 2: Strategic Fragility -->
          <div class="glass-panel strategic-fragility" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">STRATEGIC FRAGILITY</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Structural vulnerability and objectives exposure</span>
            </div>
            <div class="fragility-chart-container">
              <canvas id="fragility-bar-chart" height="220"></canvas>
            </div>
            <div id="fragility-drilldown-link" style="font-size: 11px; color: #8FA3B1; margin-top: 10px; text-align: center; cursor: pointer; font-weight: 500;">
              Click any bar to drill into dimension risks &rarr;
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Panel 3: Risk Portfolio (Heatmap) -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">RISK PORTFOLIO</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Likelihood vs impact — click any point to inspect</span>
            </div>
            <div style="position: relative; height: 260px; margin-bottom: 12px; background: #FFFFFF; border: 1.5px solid var(--border-color); border-radius: 8px; padding: 10px;">
              <canvas id="heatmap-chart-canvas"></canvas>
            </div>
            <a href="#" id="link-open-full-analysis" style="font-size: 12px; color: var(--color-slate); text-decoration: none; font-weight: 500;">Open full analysis →</a>
          </div>

          <!-- Panel 4: Risk Movement -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">RISK MOVEMENT</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Leading indicators of risk vector updates</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              
              <!-- Column: Worsening -->
              <div>
                <h4 style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-critical); letter-spacing: 0.07em; margin-bottom: 10px;">Top Worsening</h4>
                <div id="dynamics-worsening-list">
                  ${worseningHTML}
                </div>
              </div>

              <!-- Column: Improving -->
              <div>
                <h4 style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-safe); letter-spacing: 0.07em; margin-bottom: 10px;">Top Improving</h4>
                <div id="dynamics-improving-list">
                  ${improvingHTML}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- RISK SLIDE-IN DRAWER -->
      <div id="risk-detail-drawer" style="position: fixed; top: 0; right: -380px; width: 380px; height: 100%; background: #FFFFFF; box-shadow: -4px 0 24px rgba(13,27,42,0.15); transition: right 0.3s ease; z-index: 2000; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div id="drawer-content-container">
          <!-- Populated dynamically on node click -->
        </div>
      </div>
    `;

    this.bindEvents(container);
    setTimeout(() => {
      this.initFragilityChart(container);
      this.initSparklines(container);
      this.initHeatmap(container);
    }, 0);
  }

  renderBoardMode(container) {
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];
    const scenarios = this.state.scenarios || [];

    const aboveCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const nearCount = risks.filter(r => r.appetiteStatus === 'Near Appetite').length;
    const withinCount = risks.filter(r => r.appetiteStatus === 'Within Appetite').length;
    const totalCount = aboveCount + nearCount + withinCount || 1;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    
    const today = new Date();
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    let postureValue = "LOW";
    let postureColor = "var(--color-safe)";
    if (aboveCount > 15 || breachedKRIs > 20 || overdueActionsCount > 10) {
      postureValue = "CRITICAL";
      postureColor = "var(--color-critical)";
    } else if (aboveCount > 0 || breachedKRIs > 0 || overdueActionsCount > 0) {
      postureValue = "ELEVATED";
      postureColor = "var(--color-warning)";
    } else if (worseningCount > 0) {
      postureValue = "MODERATE";
      postureColor = "var(--color-slate)";
    }

    const narrativeHTML = `
      The enterprise risk posture is currently <strong style="color: ${postureColor};">${postureValue}</strong>. 
      We are tracking <strong style="color: var(--color-critical);">${aboveCount}</strong> risks operating above our defined appetite levels, primarily driven by customer concentration and infrastructure vulnerabilities. 
      A total of <strong style="color: var(--color-warning);">${breachedKRIs}</strong> Key Risk Indicators are currently breached. 
      Management is executing corrective actions; however, <strong style="color: var(--color-critical);">${overdueActionsCount}</strong> critical compliance actions are overdue. 
      Immediate board attention is required on high-velocity items and the IPO timeline exposure.
    `;

    const signalRisks = risks.filter(r => {
      const isAboveAppetite = r.appetiteStatus === 'Above Appetite';
      const hasBreachedKRI = r.kris?.some(k => k.status === 'BREACHED');
      return isAboveAppetite || hasBreachedKRI;
    });
    signalRisks.sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0));
    const topSignals = signalRisks.slice(0, 5);

    const insightsHTML = topSignals.length ? topSignals.map(r => {
      const objectivesCount = r.objectiveIds ? r.objectiveIds.length : 0;
      const velocityText = r.timeToImpact || r.velocity || 'N/A';
      const cleanRTitle = cleanTitle(r.title);

      return `
        <div class="insight-card clickable" data-risk-id="${r.id}" style="padding: 12px; background: #FFFFFF; border: 0.5px solid var(--border-color); border-left: 4px solid var(--color-critical); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; cursor: pointer;" title="ID: ${r.id}">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${cleanRTitle}</div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--color-navy-secondary);">
              <span>Score: <strong style="color: var(--color-critical);">${r.residualScore}</strong></span>
              <span>Velocity: <strong>${velocityText}</strong></span>
              <span>Objectives: <strong>${objectivesCount}</strong></span>
            </div>
          </div>
          <span style="color: var(--color-navy-secondary); font-size: 14px;">&rarr;</span>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 30px 0; font-size: 13px;">
        ✓ No active intelligence alerts or forecast breaches detected.
      </div>
    `;

    const threatenedObjectives = objectives.filter(o => o.status === 'Critical Gaps' || o.status === 'At Risk');
    const objectivesHTML = threatenedObjectives.length ? threatenedObjectives.map(o => {
      const statusColor = o.status === 'Critical Gaps' ? 'var(--color-critical)' : 'var(--color-warning)';
      const statusBg = o.status === 'Critical Gaps' ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)';
      return `
        <div class="insight-card clickable" data-tab-link="objectives" style="padding: 12px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${o.title}</div>
            <span class="status-badge" style="font-size: 10px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}; padding: 2px 6px; border-radius: 12px; font-weight: 700; white-space: nowrap;">
              ${o.status}
            </span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); display: flex; justify-content: space-between;">
            <span>Owner: <strong>${o.owner}</strong></span>
            <span>Target: <strong>${o.targetDate}</strong></span>
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 30px 0; font-size: 13px;">
        ✓ All strategic objectives are currently on track.
      </div>
    `;

    const overdueActions = risks.flatMap(r => (r.actions || []).map(a => ({ ...a, riskTitle: r.title, riskId: r.id })))
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const actionsHTML = overdueActions.length ? overdueActions.map(a => {
      const formattedDate = new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div class="insight-card clickable" data-risk-id="${a.riskId}" style="padding: 12px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; cursor: pointer;">
          <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${a.title}</div>
          <div style="font-size: 11px; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
            <span>Owner: <strong>${a.owner || 'N/A'}</strong></span>
            <span style="color: var(--color-critical); font-weight: 600;">Due: ${formattedDate}</span>
          </div>
          <div style="font-size: 10px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            Risk: ${cleanTitle(a.riskTitle)}
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 30px 0; font-size: 13px;">
        ✓ No overdue governance actions.
      </div>
    `;

    const spotlightId = localStorage.getItem('spotlight_scenario_id') || 'scen-cyber';
    const spotlightTemplate = scenarioTemplates.find(t => t.id === spotlightId) || scenarioTemplates[0];

    let spotlightHTML = '';
    if (spotlightTemplate) {
      const ebitdaImpact = spotlightTemplate.responses.noIntervention.ebitda;
      const objectivesCount = spotlightTemplate.affectedObjectives.length;
      const boardActionRequired = spotlightTemplate.boardActions.decisions.length > 0 ? 'Yes' : 'No';

      spotlightHTML = `
        <div class="glass-panel" style="padding: 20px;">
          <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em; margin-bottom: 12px;">★ Scenario Spotlight</div>
          <h3 style="font-size: 14px; font-weight: 600; color: var(--color-navy); margin-bottom: 6px; margin-top:0;">${spotlightTemplate.title}</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">${spotlightTemplate.trigger}</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; font-size: 11px; margin-bottom: 12px;">
            <div>
              <span style="color: var(--text-secondary); display: block; font-size: 9px; text-transform:uppercase; font-weight:700;">EBITDA Impact</span>
              <strong style="color: var(--color-critical); font-size: 13px;">${ebitdaImpact}</strong>
            </div>
            <div>
              <span style="color: var(--text-secondary); display: block; font-size: 9px; text-transform:uppercase; font-weight:700;">Affected Goals</span>
              <strong style="color: var(--color-near-appetite); font-size: 13px;">${objectivesCount}</strong>
            </div>
            <div>
              <span style="color: var(--text-secondary); display: block; font-size: 9px; text-transform:uppercase; font-weight:700;">Board Action Required</span>
              <strong style="color: var(--color-critical); font-size: 13px;">${boardActionRequired}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <a href="/scenario?template=${spotlightTemplate.id}" id="link-spotlight-decision" style="font-size: 12px; font-weight: 600; color: var(--color-indigo); text-decoration: none;">Stress-Test Response Options &rarr;</a>
          </div>
        </div>
      `;
    }

    const mode = this.state.operatingMode || 'board';
    container.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; justify-content: flex-start;">
        <!-- Segmented Mode Switcher -->
        <div class="mode-switcher-dashboard" style="display: flex; background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 3px; gap: 4px; flex-shrink: 0;">
          <button class="dash-mode-btn" data-mode="board" style="border:none; background:${mode === 'board' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'board' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'board' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Board</button>
          <button class="dash-mode-btn" data-mode="intelligence" style="border:none; background:${mode === 'intelligence' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'intelligence' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'intelligence' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Intelligence</button>
          <button class="dash-mode-btn" data-mode="builder" style="border:none; background:${mode === 'builder' ? '#FFFFFF' : 'transparent'}; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; cursor:pointer; color: ${mode === 'builder' ? 'var(--color-navy)' : 'var(--text-secondary)'}; box-shadow: ${mode === 'builder' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease;">Builder</button>
        </div>
      </div>
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
        <div class="page-title-wrap" style="margin-bottom: 0;">
          <span class="profile-role-badge">Executive Risk Control</span>
          <h1>Enterprise Risk Dashboard</h1>
          <p class="page-subtitle">Start here for board-level risk posture and urgent governance signals.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 55% 45%; gap: 20px;">
        
        <!-- LEFT COLUMN: Posture, Alerts, Actions -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Posture Summary -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">Enterprise Risk Posture</span>
                <span class="status-badge" style="font-size: 11px; background: ${postureColor}22; color: ${postureColor}; border: 1px solid ${postureColor}; font-weight: 700; border-radius: var(--radius-sm); padding: 2px 8px; text-transform: uppercase;">
                  ${postureValue}
                </span>
              </div>
              <div class="posture-progress-band" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                <div style="display: flex; height: 8px; background: #E5E7EB; border-radius: var(--radius-sm); overflow: hidden; width: 100%;">
                  ${aboveCount > 0 ? `<div style="width: ${(aboveCount/totalCount)*100}%; background: var(--color-critical);"></div>` : ''}
                  ${nearCount > 0 ? `<div style="width: ${(nearCount/totalCount)*100}%; background: var(--color-warning);"></div>` : ''}
                  ${withinCount > 0 ? `<div style="width: ${(withinCount/totalCount)*100}%; background: var(--color-safe);"></div>` : ''}
                </div>
              </div>
            </div>
            
            <div style="border-top: 1px dashed var(--border-color); padding-top: 12px;">
              ${narrativeHTML}
            </div>
          </div>

          <!-- Top Board Issues (Active Intel) -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">Top Board Issues</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Urgent operational risk items operating above appetite boundaries</span>
            </div>
            <div id="active-intel-list">
              ${insightsHTML}
            </div>
          </div>

          <!-- Governance Action Queue -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">Governance Action Queue</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Overdue core compliance or audit actions requiring management push</span>
            </div>
            <div id="board-overdue-actions-list">
              ${actionsHTML}
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Objectives, Spotlight, Ask Navis -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Objectives threatened -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">Threatened Strategic Objectives</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">High-importance business targets currently impacted by risk exposure</span>
            </div>
            <div id="board-threatened-objectives-list">
              ${objectivesHTML}
            </div>
          </div>

          <!-- Scenario Spotlight -->
          ${spotlightHTML}

          <!-- Ask Navis Prompt -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">Ask Navis</span>
              <span style="font-size: 12px; color: var(--color-navy-secondary);">Query the boardroom risk intelligence copilot directly</span>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <input type="text" class="form-control" id="board-ask-prompt-input" style="flex-grow: 1; font-size:12px;" placeholder="Ask boardroom questions across risks, objectives, policies, and controls..." />
              <button class="btn btn-primary" id="board-ask-prompt-submit" style="font-size:12px; padding: 6px 14px;">Ask &rarr;</button>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <span style="font-size: 10px; color: var(--text-secondary); font-weight: 500;">Suggested:</span>
              <button class="btn btn-secondary btn-small suggested-ask-btn" style="padding: 3px 8px; font-size: 10px; border-radius: 4px;" data-query="Which risks are above appetite?">Appetite Bounds</button>
              <button class="btn btn-secondary btn-small suggested-ask-btn" style="padding: 3px 8px; font-size: 10px; border-radius: 4px;" data-query="What threatens our growth and revenue objectives?">Strategic Threats</button>
              <button class="btn btn-secondary btn-small suggested-ask-btn" style="padding: 3px 8px; font-size: 10px; border-radius: 4px;" data-query="Which KRIs are breached and what actions are overdue?">Breaches &amp; Actions</button>
            </div>
          </div>

        </div>

      </div>

      <!-- RISK SLIDE-IN DRAWER -->
      <div id="risk-detail-drawer" style="position: fixed; top: 0; right: -380px; width: 380px; height: 100%; border-left: 1px solid var(--border-color); transition: right 0.3s ease; z-index: 2000; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div id="drawer-content-container">
          <!-- Populated dynamically on node click -->
        </div>
      </div>
    `;

    this.bindBoardEvents(container);
  }

  bindBoardEvents(container) {
    const risks = this.state.risks || [];

    // Click on top issues
    container.querySelectorAll('#active-intel-list .insight-card').forEach(card => {
      card.addEventListener('click', () => {
        const rId = card.dataset.riskId;
        const r = risks.find(item => item.id === rId);
        if (r) this.openRiskDrawer(r);
      });
    });

    // Click on overdue actions
    container.querySelectorAll('#board-overdue-actions-list .insight-card').forEach(card => {
      card.addEventListener('click', () => {
        const rId = card.dataset.riskId;
        const r = risks.find(item => item.id === rId);
        if (r) this.openRiskDrawer(r);
      });
    });

    // Click on objectives
    container.querySelectorAll('[data-tab-link="objectives"]').forEach(card => {
      card.addEventListener('click', () => {
        this.navigateToPage('/objectives', 'objectives');
      });
    });

    // Spotlight link click
    const spotlightLink = container.querySelector('#link-spotlight-decision');
    if (spotlightLink) {
      spotlightLink.addEventListener('click', (e) => {
        e.preventDefault();
        const spotlightId = localStorage.getItem('spotlight_scenario_id') || 'scen-cyber';
        this.navigateToPage(`/scenario?template=${spotlightId}`, 'scenario');
      });
    }

    // Ask Navis handlers
    const askInput = container.querySelector('#board-ask-prompt-input');
    const askSubmit = container.querySelector('#board-ask-prompt-submit');
    
    const submitQuery = (query) => {
      if (!query) return;
      localStorage.setItem('navis_prefill_ask_query', query);
      this.navigateToPage('/ai', 'boardQA');
    };

    if (askSubmit && askInput) {
      askSubmit.addEventListener('click', () => {
        submitQuery(askInput.value.trim());
      });
      askInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          submitQuery(askInput.value.trim());
        }
      });
    }

    container.querySelectorAll('.suggested-ask-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        submitQuery(btn.dataset.query);
      });
    });
  }

  initFragilityChart(container) {
    const canvasId = 'fragility-bar-chart';
    const canvas = container.querySelector(`#${canvasId}`);
    if (!canvas) return;

    // Destroy existing instance first (Flag 2 destroy pattern)
    const existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    const risks = this.state.risks || [];
    const count = risks.length || 1;

    const dimensions = [
      { key: 'revenue', label: 'Revenue' },
      { key: 'growth', label: 'Growth' },
      { key: 'customerTrust', label: 'Customer Trust' },
      { key: 'technology', label: 'Technology' },
      { key: 'people', label: 'People' },
      { key: 'operations', label: 'Operations' },
      { key: 'reputation', label: 'Reputation' },
      { key: 'valuation', label: 'Valuation' }
    ];

    const fragilitySums = { revenue: 0, growth: 0, customerTrust: 0, technology: 0, people: 0, operations: 0, reputation: 0, valuation: 0 };
    risks.forEach(r => {
      if (r.fragility) {
        Object.keys(fragilitySums).forEach(k => {
          fragilitySums[k] += (r.fragility[k] || 0);
        });
      }
    });

    const dataPercents = dimensions.map(dim => Math.round((fragilitySums[dim.key] / count) * 20));

    const trendArrows = dimensions.map(dim => {
      const dimRisks = risks.filter(r => r.fragility && r.fragility[dim.key] > 0);
      let trendSum = 0;
      dimRisks.forEach(r => {
        if (r.trend === 'Deteriorating') trendSum += 1;
        else if (r.trend === 'Improving') trendSum -= 1;
      });
      if (trendSum > 0) return '↑';
      if (trendSum < 0) return '↓';
      return '→';
    });

    const barColors = dataPercents.map(pct => {
      if (pct >= 80) return '#E24B4A';
      if (pct >= 60) return '#EF9F27';
      return '#1D9E75';
    });

    new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: dimensions.map(d => d.label),
        datasets: [{
          data: dataPercents,
          backgroundColor: barColors,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 12
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1B2A',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const pct = context.raw;
                const arrow = trendArrows[idx];
                return ` Fragility: ${pct}% ${arrow}`;
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const idx = elements[0].index;
            const dimKey = dimensions[idx].key;
            this.navigateToPage(`/risks?dimension=${dimKey}`, 'register');
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => value + '%',
              color: '#6B7280'
            },
            grid: { display: false },
            border: { display: false }
          },
          y: {
            ticks: {
              color: '#111827'
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });

    container.querySelector('#fragility-drilldown-link')?.addEventListener('click', () => {
      this.navigateToPage('/risks', 'register');
    });
  }

  initPostureDonut(container) {
    // Replaced with horizontal progress band in HTML
  }
  initPostureDonutOld(container) {
    const canvasId = 'posture-donut-chart';
    const canvas = container.querySelector(`#${canvasId}`);
    if (!canvas) return;

    const existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    const risks = this.state.risks || [];
    const aboveCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const nearCount = risks.filter(r => r.appetiteStatus === 'Near Appetite').length;
    const withinCount = risks.filter(r => r.appetiteStatus === 'Within Appetite').length;
    const totalCount = aboveCount + nearCount + withinCount;

    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || meta.data.length === 0) return;
        const x = meta.data[0].x;
        const y = meta.data[0].y;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = '600 18px Calibri, "Segoe UI", sans-serif';
        ctx.fillStyle = '#0D1B2A';
        ctx.fillText(totalCount.toString(), x, y - 6);
        
        ctx.font = '400 11px Calibri, "Segoe UI", sans-serif';
        ctx.fillStyle = '#8FA3B1';
        ctx.fillText('risks', x, y + 10);
        
        ctx.restore();
      }
    };

    new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Above Appetite', 'Near Appetite', 'Within Appetite'],
        datasets: [{
          data: [aboveCount, nearCount, withinCount],
          backgroundColor: ['#E24B4A', '#EF9F27', '#1D9E75'],
          borderWidth: 0
        }]
      },
      plugins: [centerTextPlugin],
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1B2A',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.raw;
                const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
                return ` ${label}: ${val} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  initSparklines(container) {
    const canvases = container.querySelectorAll('.sparkline-canvas');
    const risks = this.state.risks || [];

    canvases.forEach(canvas => {
      const existing = window.Chart.getChart(canvas);
      if (existing) existing.destroy();

      const rId = canvas.dataset.riskId;
      const type = canvas.dataset.type;
      const risk = risks.find(r => r.id === rId);
      if (!risk || !risk.scoreHistory || risk.scoreHistory.length < 2) return;

      const last6Scores = risk.scoreHistory.slice(-6).map(h => h.score);
      const lineColor = type === 'worsening' ? '#E24B4A' : '#1D9E75';

      new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: ['', '', '', '', '', ''],
          datasets: [{
            data: last6Scores,
            borderColor: lineColor,
            borderWidth: 1.5,
            fill: false,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    });
  }

  // Heatmap Chart Initializer
  initHeatmap(container) {
    const risks = this.state.risks || [];
    const canvas = container.querySelector('#heatmap-chart-canvas');
    if (!canvas || risks.length === 0) return;

    const existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    const bubbleData = risks.map((r, index) => ({
      x: r.likelihoodResidual || r.likelihood || 1,
      y: r.impactResidual || r.impact || 1,
      r: Math.max(6, (r.residualScore || 1) * 0.8),
      riskObj: r,
      index: index
    }));

    const quadrantPlugin = {
      id: 'quadrantShading',
      beforeDraw(chart) {
        const { ctx, chartArea: { top, right, bottom, left }, scales: { x, y } } = chart;
        ctx.save();
        
        const x3 = x.getPixelForValue(3);
        const y3 = y.getPixelForValue(3);

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Draw horizontal divider Y=3
        ctx.beginPath();
        ctx.moveTo(left, y3);
        ctx.lineTo(right, y3);
        ctx.stroke();

        // Draw vertical divider X=3
        ctx.beginPath();
        ctx.moveTo(x3, top);
        ctx.lineTo(x3, bottom);
        ctx.stroke();

        ctx.restore();
      }
    };

    if (typeof window.Chart !== 'undefined') {
      const heatmapChartInstance = new window.Chart(canvas, {
        type: 'bubble',
        data: {
          datasets: [{
            data: bubbleData,
            backgroundColor: (context) => {
              const dataPoint = context.raw;
              if (!dataPoint) return '#1D9E75';
              const status = dataPoint.riskObj.appetiteStatus;
              return status === 'Above Appetite' ? '#E24B4A' : status === 'Near Appetite' ? '#EF9F27' : '#1D9E75';
            },
            borderColor: (context) => {
              const dataPoint = context.raw;
              if (!dataPoint) return '#0F6E56';
              const status = dataPoint.riskObj.appetiteStatus;
              return status === 'Above Appetite' ? '#A32D2D' : status === 'Near Appetite' ? '#854F0B' : '#0F6E56';
            },
            borderWidth: 0,
            hoverBorderWidth: 0
          }]
        },
        plugins: [quadrantPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (event, elements) => {
            if (elements && elements.length > 0) {
              const datasetIndex = elements[0].datasetIndex;
              const index = elements[0].index;
              const clickedPoint = heatmapChartInstance.data.datasets[datasetIndex].data[index];
              this.openRiskDrawer(clickedPoint.riskObj);
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: '#0D1B2A',
              titleColor: '#FFFFFF',
              bodyColor: '#FFFFFF',
              titleFont: { size: 12, family: 'Calibri', weight: 'bold' },
              bodyFont: { size: 11, family: 'Calibri' },
              padding: 10,
              callbacks: {
                title: (context) => cleanTitle(context[0].raw.riskObj.title),
                label: (context) => {
                  const rawPoint = context.raw;
                  return [
                    `Score: ${rawPoint.riskObj.residualScore}`,
                    `Status: ${rawPoint.riskObj.appetiteStatus}`
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                color: '#6B7280',
                font: { family: 'Inter', size: 11 }
              },
              grid: {
                display: false
              },
              border: { display: false },
              title: {
                display: true,
                text: 'Likelihood →',
                color: '#111827',
                font: { family: 'Inter', size: 12, weight: 'bold' }
              }
            },
            y: {
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                color: '#6B7280',
                font: { family: 'Inter', size: 11 }
              },
              grid: {
                display: false
              },
              border: { display: false },
              title: {
                display: true,
                text: 'Impact ↑',
                color: '#111827',
                font: { family: 'Inter', size: 12, weight: 'bold' }
              }
            }
          }
        }
      });
    }
  }

  // Open Sliding Drawer
  openRiskDrawer(risk) {
    const drawer = document.getElementById('risk-detail-drawer');
    const container = document.getElementById('drawer-content-container');
    if (!drawer || !container) return;

    let appClass = 'within';
    let appColor = 'var(--color-safe)';
    if (risk.appetiteStatus === 'Above Appetite') {
      appClass = 'above';
      appColor = 'var(--color-critical)';
    } else if (risk.appetiteStatus === 'Near Appetite') {
      appClass = 'near';
      appColor = 'var(--color-warning)';
    }

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <span class="profile-role-badge" style="font-size: 10px; color: var(--color-slate);">${risk.category}</span>
          <button id="btn-close-drawer" style="border: none; background: none; font-size: 20px; cursor: pointer; color: var(--color-navy-secondary);">&times;</button>
        </div>
        
        <h2 style="font-size: 20px; font-weight: 600; color: var(--color-navy); margin-bottom: 4px;">${cleanTitle(risk.title)}</h2>
        <div style="font-size: 11px; color: var(--color-navy-secondary); margin-bottom: 12px; font-weight: 500;">ID: ${risk.id}</div>
        <span class="status-badge ${appClass}" style="font-size: 10px; padding: 2px 8px; margin-bottom: 16px; display: inline-block;">
          ${risk.appetiteStatus} (${risk.residualScore})
        </span>

        <p style="font-size: 13px; color: var(--color-navy); line-height: 1.5; margin-bottom: 20px;">
          ${risk.description}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; margin-bottom: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <div>Owner: <strong style="color: var(--color-navy);">${risk.owner}</strong></div>
          <div>Business Unit: <strong style="color: var(--color-navy);">${risk.businessUnit || 'Unassigned'}</strong></div>
          <div>Likelihood: <strong style="color: var(--color-navy);">L${risk.likelihoodResidual || risk.likelihood}</strong></div>
          <div>Impact: <strong style="color: var(--color-navy);">I${risk.impactResidual || risk.impact}</strong></div>
        </div>

        <!-- MAPPED CONTROLS -->
        <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em; margin-bottom: 8px;">Mitigating Controls</h3>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; max-height: 120px; overflow-y: auto;">
          ${risk.controls?.length ? risk.controls.map(c => `
            <div style="padding: 6px 10px; background: var(--bg-primary); border: 0.5px solid var(--border-color); border-radius: 4px; font-size: 11px; display: flex; justify-content: space-between;">
              <span style="color: var(--color-navy); font-weight: 500;">${c.name}</span>
              <span style="color: ${c.effectiveness === 'Highly Effective' ? 'var(--color-safe)' : 'var(--color-warning)'}; font-weight: 600;">${c.effectiveness}</span>
            </div>
          `).join('') : '<span style="font-size: 11px; color: var(--color-navy-secondary); font-style: italic;">No active controls.</span>'}
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn-primary" id="btn-drawer-explain" style="width: 100%; justify-content: center; height: 36px;">Generate AI Briefing</button>
        <button class="btn btn-secondary" id="btn-drawer-action" style="width: 100%; justify-content: center; height: 36px;">Action Items (${risk.actions?.length || 0})</button>
      </div>
    `;

    drawer.style.right = '0';

    // Bind Drawer Close
    const closeBtn = document.getElementById('btn-close-drawer');
    closeBtn?.addEventListener('click', () => {
      drawer.style.right = '-380px';
    });

    // Bind AI Explain
    document.getElementById('btn-drawer-explain')?.addEventListener('click', () => {
      AIInsightService.showExplanationModal('risk', risk, this.state);
    });

    // Bind Action page redirect
    document.getElementById('btn-drawer-action')?.addEventListener('click', () => {
      this.navigateToPage('/actions', 'actions');
    });
  }

  bindEvents(container) {
    // Click triggers on Active Intelligence cards
    container.querySelectorAll('.insight-card').forEach(card => {
      card.addEventListener('click', () => {
        const rId = card.dataset.riskId;
        const targetRisk = this.state.risks.find(r => r.id === rId);
        if (targetRisk) {
          this.openRiskDrawer(targetRisk);
        }
      });
    });

    // View all N signals link click
    container.querySelector('.view-all-signals-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateToPage('/risks', 'register');
    });

    // Row Click triggers on Worsening/Improving Movement entries
    container.querySelectorAll('.movement-row').forEach(row => {
      row.addEventListener('click', () => {
        const rId = row.dataset.riskId;
        const targetRisk = this.state.risks.find(r => r.id === rId);
        if (targetRisk) {
          this.openRiskDrawer(targetRisk);
        }
      });
    });

    // Open full analysis link
    container.querySelector('#link-open-full-analysis')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateToPage('/portfolio', 'portfolio');
    });

    // Close slide-in drawer on outside clicks
    document.addEventListener('click', (e) => {
      const drawer = document.getElementById('risk-detail-drawer');
      if (drawer && drawer.style.right === '0') {
        const isClickInside = drawer.contains(e.target);
        const isClickOnCanvas = e.target.closest('#heatmap-chart-canvas');
        const isClickOnMovement = e.target.closest('.movement-row');
        const isClickOnInsight = e.target.closest('.insight-card');
        if (!isClickInside && !isClickOnCanvas && !isClickOnMovement && !isClickOnInsight) {
          drawer.style.right = '-380px';
        }
      }
    });
  }
}
