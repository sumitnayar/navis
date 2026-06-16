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

const cleanDescription = (desc) => {
  if (!desc) return '';
  let cleaned = desc;
  const markerIdx = cleaned.indexOf('Demo marker:');
  if (markerIdx !== -1) {
    cleaned = cleaned.substring(0, markerIdx).trim();
  }
  const demoIdx = cleaned.indexOf('[DEMO');
  if (demoIdx !== -1) {
    const endIdx = cleaned.indexOf(']', demoIdx);
    if (endIdx !== -1) {
      cleaned = cleaned.substring(0, demoIdx) + cleaned.substring(endIdx + 1);
    } else {
      cleaned = cleaned.substring(0, demoIdx);
    }
  }
  return cleaned.trim();
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
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];

    const aboveCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const nearCount = risks.filter(r => r.appetiteStatus === 'Near Appetite').length;
    const withinCount = risks.filter(r => r.appetiteStatus === 'Within Appetite').length;
    const totalCount = aboveCount + nearCount + withinCount || 1;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    
    const today = new Date();
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      warning: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#D97706',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626',
      slate: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748B'
    };

    let postureValue = "LOW";
    let postureColor = tokens.safe;
    if (aboveCount > 15 || breachedKRIs > 20 || overdueActionsCount > 10) {
      postureValue = "CRITICAL";
      postureColor = tokens.critical;
    } else if (aboveCount > 0 || breachedKRIs > 0 || overdueActionsCount > 0) {
      postureValue = "ELEVATED";
      postureColor = tokens.warning;
    } else if (worseningCount > 0) {
      postureValue = "MODERATE";
      postureColor = tokens.slate;
    }

    // Shortened narrative text (50% reduction)
    const narrativeHTML = `
      Posture is <strong style="color: ${postureColor};">${postureValue}</strong>. 
      <strong style="color: var(--color-critical);">${aboveCount}</strong> risks are above appetite. 
      <strong style="color: var(--color-warning);">${breachedKRIs}</strong> KRIs are breached and <strong style="color: var(--color-critical);">${overdueActionsCount}</strong> actions are overdue.
    `;

    // Top Issues (up to 5)
    const signalRisks = risks.filter(r => {
      return r.appetiteStatus === 'Above Appetite' || r.kris?.some(k => k.status === 'BREACHED');
    });
    signalRisks.sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0));
    const topSignals = signalRisks.slice(0, 5);

    const insightsHTML = topSignals.length ? topSignals.map(r => {
      const cleanRTitle = cleanTitle(r.title);
      return `
        <div class="insight-card clickable" data-risk-id="${r.id}" style="padding: 10px 12px; background: #FFFFFF; border: 0.5px solid var(--border-color); border-left: 3px solid var(--color-critical); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; cursor: pointer;" title="ID: ${r.id}">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${cleanRTitle}</div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--color-navy-secondary);">
              <span>Score: <strong style="color: var(--color-critical);">${r.residualScore}</strong></span>
              <span>Velocity: <strong>${r.timeToImpact || r.velocity || 'N/A'}</strong></span>
            </div>
          </div>
          <span style="color: var(--color-navy-secondary); font-size: 14px;">&rarr;</span>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 20px 0; font-size: 12px;">
        ✓ No active alerts.
      </div>
    `;

    // Objectives at Risk
    const threatenedObjectives = objectives.filter(o => o.status === 'Critical Gaps' || o.status === 'At Risk');
    const objectivesHTML = threatenedObjectives.length ? threatenedObjectives.map(o => {
      const statusColor = o.status === 'Critical Gaps' ? 'var(--color-critical)' : 'var(--color-warning)';
      const statusBg = o.status === 'Critical Gaps' ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)';
      return `
        <div class="insight-card clickable" data-tab-link="objectives" style="padding: 10px 12px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="font-size: 13px; font-weight: 500; color: var(--color-navy);">${o.title}</div>
            <span class="status-badge" style="font-size: 9px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}; padding: 1px 4px; border-radius: 4px; font-weight: 600; white-space: nowrap;">
              ${o.status}
            </span>
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 20px 0; font-size: 12px;">
        ✓ All objectives on track.
      </div>
    `;

    // Scenario Spotlight
    const spotlightId = localStorage.getItem('spotlight_scenario_id') || 'scen-cyber';
    const spotlightTemplate = scenarioTemplates.find(t => t.id === spotlightId) || scenarioTemplates[0];
    let spotlightHTML = '';
    if (spotlightTemplate) {
      spotlightHTML = `
        <div class="glass-panel" style="padding: 16px;">
          <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em; margin-bottom: 8px;">Scenario Spotlight</div>
          <h3 style="font-size: 13px; font-weight: 600; color: var(--color-navy); margin-bottom: 4px; margin-top:0;">${spotlightTemplate.title}</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 10px;">${spotlightTemplate.trigger || ''}</p>
          <div style="text-align: right;">
            <a href="/scenario?template=${spotlightTemplate.id}" id="link-spotlight-decision" style="font-size: 12px; font-weight: 600; color: var(--color-indigo); text-decoration: none;">Stress-Test Response &rarr;</a>
          </div>
        </div>
      `;
    }

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
      return `
        <div class="movement-row" data-risk-id="${r.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 4px; cursor: pointer; font-size: 12px; min-width: 0;" title="${cleanRTitle}">
          <span style="color: var(--color-navy); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; min-width: 0;">${cleanRTitle}</span>
          <canvas class="sparkline-canvas" data-risk-id="${r.id}" data-type="worsening" width="48" height="20" style="width: 48px; height: 20px; flex-shrink: 0;"></canvas>
          <span style="background: var(--color-critical-bg); color: var(--color-critical); padding: 1px 4px; border-radius: 4px; font-weight: 600; flex-shrink: 0;">${r.residualScore} ↑</span>
        </div>
      `;
    }).join('') : `<div style="font-size: 11px; color: var(--color-navy-secondary); text-align: center; padding: 10px 0;">No worsening risks.</div>`;

    const improvingHTML = improvingRisks.length ? improvingRisks.map(r => {
      const cleanRTitle = cleanTitle(r.title);
      return `
        <div class="movement-row" data-risk-id="${r.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 4px; cursor: pointer; font-size: 12px; min-width: 0;" title="${cleanRTitle}">
          <span style="color: var(--color-navy); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; min-width: 0;">${cleanRTitle}</span>
          <canvas class="sparkline-canvas" data-risk-id="${r.id}" data-type="improving" width="48" height="20" style="width: 48px; height: 20px; flex-shrink: 0;"></canvas>
          <span style="background: var(--color-safe-bg); color: var(--color-safe); padding: 1px 4px; border-radius: 4px; font-weight: 600; flex-shrink: 0;">${r.residualScore} ↓</span>
        </div>
      `;
    }).join('') : `<div style="font-size: 11px; color: var(--color-navy-secondary); text-align: center; padding: 10px 0;">No improving risks.</div>`;

    // Action Queue
    const overdueActions = risks.flatMap(r => (r.actions || []).map(a => ({ ...a, riskTitle: r.title, riskId: r.id })))
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const actionsHTML = overdueActions.length ? overdueActions.map(a => {
      const formattedDate = new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <div class="insight-card clickable" data-risk-id="${a.riskId}" style="padding: 8px 10px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 2px; margin-bottom: 4px; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 500; color: var(--color-navy);">${a.title}</span>
            <span style="color: var(--color-critical); font-weight: 600; font-size: 10px;">Due: ${formattedDate}</span>
          </div>
          <div style="font-size: 10px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${cleanTitle(a.riskTitle)}
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; color: var(--color-navy-secondary); padding: 20px 0; font-size: 12px;">
        ✓ No overdue actions.
      </div>
    `;

    // Main Unified Dashboard Markup
    container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
        <div class="page-title-wrap" style="margin-bottom: 0;">
          <span class="profile-role-badge">Institutional Console</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      <!-- ================= TOP ROW: Posture + Ask Navis ================= -->
      <div style="display: grid; grid-template-columns: 55% 45%; gap: 20px; margin-bottom: 24px;">
        
        <!-- Risk Posture Card -->
        <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Risk Posture</span>
            <span class="status-badge" style="font-size: 11px; background: ${postureColor}15; color: ${postureColor}; border: 1px solid ${postureColor}; font-weight: 700; border-radius: var(--radius-sm); padding: 1px 6px; text-transform: uppercase;">
              ${postureValue}
            </span>
          </div>
          <div class="posture-progress-band" style="width: 100%;">
            <div style="display: flex; height: 6px; background: #E5E7EB; border-radius: var(--radius-sm); overflow: hidden; width: 100%;">
              ${aboveCount > 0 ? `<div style="width: ${(aboveCount/totalCount)*100}%; background: var(--color-critical);"></div>` : ''}
              ${nearCount > 0 ? `<div style="width: ${(nearCount/totalCount)*100}%; background: var(--color-warning);"></div>` : ''}
              ${withinCount > 0 ? `<div style="width: ${(withinCount/totalCount)*100}%; background: var(--color-safe);"></div>` : ''}
            </div>
          </div>
          <div style="font-size: 12.5px; color: var(--text-primary); line-height: 1.4;">
            ${narrativeHTML}
          </div>
        </div>

        <!-- Ask Navis Quick Card -->
        <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <div style="display: flex; gap: 8px;">
            <input type="text" class="form-control" id="board-ask-prompt-input" style="flex-grow: 1; font-size:12px; height: 32px;" placeholder="Query risk, objective, policy, and control context..." />
            <button class="btn btn-primary" id="board-ask-prompt-submit" style="font-size:12px; padding: 4px 12px; height: 32px;">Ask &rarr;</button>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-secondary btn-small suggested-ask-btn" style="padding: 2px 6px; font-size: 10px; border-radius: 4px;" data-query="Which risks are above appetite?">Appetite Bounds</button>
            <button class="btn btn-secondary btn-small suggested-ask-btn" style="padding: 2px 6px; font-size: 10px; border-radius: 4px;" data-query="What threatens our growth objectives?">Strategic Threats</button>
          </div>
        </div>

      </div>

      <!-- ================= BODY: Telemetry (60%) & Operational Feed (40%) ================= -->
      <div style="display: grid; grid-template-columns: 60% 40%; gap: 20px; align-items: start;">
        
        <!-- LEFT COLUMN: Telemetry Core (Graphs + Spotlight/Movement) -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Charts Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            
            <!-- Fragility Card -->
            <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column;">
              <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Fragility</span>
              </div>
              <div class="fragility-chart-container" style="height: 180px; position: relative;">
                <canvas id="fragility-bar-chart"></canvas>
              </div>
              <div id="fragility-drilldown-link" style="font-size: 11px; color: var(--color-indigo); margin-top: 8px; text-align: right; cursor: pointer; font-weight: 600;">
                Drill down &rarr;
              </div>
            </div>

            <!-- Portfolio Card -->
            <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column;">
              <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Portfolio</span>
              </div>
              <div style="position: relative; height: 180px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px; flex-grow: 1;">
                <canvas id="heatmap-chart-canvas"></canvas>
              </div>
              <div style="margin-top: 8px; text-align: right;">
                <a href="#" id="link-open-full-analysis" style="font-size: 11px; color: var(--color-indigo); text-decoration: none; font-weight: 600;">Full analysis &rarr;</a>
              </div>
            </div>

          </div>

          <!-- Spotlight & Movement Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            
            <!-- Scenario Spotlight Card -->
            ${spotlightHTML}

            <!-- Movement Card -->
            <div class="glass-panel" style="padding: 16px;">
              <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Movement</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <h4 style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--color-critical); letter-spacing: 0.05em; margin-bottom: 8px; margin-top:0;">Worsening</h4>
                  <div id="dynamics-worsening-list">
                    ${worseningHTML}
                  </div>
                </div>
                <div>
                  <h4 style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--color-safe); letter-spacing: 0.05em; margin-bottom: 8px; margin-top:0;">Improving</h4>
                  <div id="dynamics-improving-list">
                    ${improvingHTML}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- RIGHT COLUMN: Operational Feed -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Top Issues Card -->
          <div class="glass-panel" style="padding: 16px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Top Issues</span>
            </div>
            <div id="active-intel-list">
              ${insightsHTML}
            </div>
          </div>

          <!-- Objectives at Risk Card -->
          <div class="glass-panel" style="padding: 16px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Objectives at Risk</span>
            </div>
            <div id="board-threatened-objectives-list">
              ${objectivesHTML}
            </div>
          </div>

          <!-- Collapsible Action Queue Card -->
          <div class="glass-panel" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em;">Action Queue</span>
              <button id="action-queue-toggle" class="btn btn-secondary" style="font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-color); height: auto;">Collapse</button>
            </div>
            <div id="board-overdue-actions-list">
              ${actionsHTML}
            </div>
          </div>

        </div>

      </div>

      <!-- RISK SLIDE-IN DRAWER -->
      <div id="risk-detail-drawer" style="position: fixed; top: 0; right: -380px; width: 380px; height: 100%; border-left: 1px solid var(--border-color); transition: right 0.3s ease; z-index: 9995; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; background: #FFFFFF; box-shadow: -4px 0 24px rgba(15,23,42,0.08);">
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

  bindEvents(container) {
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

    // Open full analysis link
    container.querySelector('#link-open-full-analysis')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateToPage('/portfolio', 'portfolio');
    });

    // Drill down link
    container.querySelector('#fragility-drilldown-link')?.addEventListener('click', () => {
      this.navigateToPage('/risks', 'register');
    });

    // Action queue collapse toggle (progressive disclosure inline toggle)
    const toggleBtn = container.querySelector('#action-queue-toggle');
    const queueContent = container.querySelector('#board-overdue-actions-list');
    if (toggleBtn && queueContent) {
      toggleBtn.addEventListener('click', () => {
        const isCollapsed = queueContent.classList.toggle('is-hidden');
        toggleBtn.textContent = isCollapsed ? 'Expand' : 'Collapse';
      });
    }

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

  initFragilityChart(container) {
    const canvasId = 'fragility-bar-chart';
    const canvas = container.querySelector(`#${canvasId}`);
    if (!canvas) return;

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

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      warning: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#D97706',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626',
      navy: getComputedStyle(document.documentElement).getPropertyValue('--color-navy').trim() || '#0F172A',
      slate: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748B'
    };

    const barColors = dataPercents.map(pct => {
      if (pct >= 80) return tokens.critical;
      if (pct >= 60) return tokens.warning;
      return tokens.safe;
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
          barThickness: 10
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
            backgroundColor: tokens.navy,
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
              stepSize: 25,
              callback: (value) => value + '%',
              color: tokens.slate,
              font: { family: 'Inter', size: 10 }
            },
            grid: { display: false },
            border: { display: false }
          },
          y: {
            ticks: {
              color: tokens.navy,
              font: { family: 'Inter', size: 11 }
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  initSparklines(container) {
    const canvases = container.querySelectorAll('.sparkline-canvas');
    const risks = this.state.risks || [];

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626'
    };

    canvases.forEach(canvas => {
      const existing = window.Chart.getChart(canvas);
      if (existing) existing.destroy();

      const rId = canvas.dataset.riskId;
      const type = canvas.dataset.type;
      const risk = risks.find(r => r.id === rId);
      if (!risk || !risk.scoreHistory || risk.scoreHistory.length < 2) return;

      const last6Scores = risk.scoreHistory.slice(-6).map(h => h.score);
      const lineColor = type === 'worsening' ? tokens.critical : tokens.safe;

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

  initHeatmap(container) {
    const risks = this.state.risks || [];
    const canvas = container.querySelector('#heatmap-chart-canvas');
    if (!canvas || risks.length === 0) return;

    const existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    const bubbleData = risks.map((r, index) => ({
      x: r.likelihoodResidual || r.likelihood || 1,
      y: r.impactResidual || r.impact || 1,
      r: Math.max(5, (r.residualScore || 1) * 0.6),
      riskObj: r,
      index: index
    }));

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      warning: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#D97706',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626',
      navy: getComputedStyle(document.documentElement).getPropertyValue('--color-navy').trim() || '#0F172A',
      slate: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748B'
    };

    if (typeof window.Chart !== 'undefined') {
      const heatmapChartInstance = new window.Chart(canvas, {
        type: 'bubble',
        data: {
          datasets: [{
            data: bubbleData,
            backgroundColor: (context) => {
              const dataPoint = context.raw;
              if (!dataPoint) return `${tokens.safe}d8`; // ~85% opacity fill
              const status = dataPoint.riskObj.appetiteStatus;
              return status === 'Above Appetite' 
                ? `${tokens.critical}d8` 
                : status === 'Near Appetite' 
                  ? `${tokens.warning}d8` 
                  : `${tokens.safe}d8`;
            },
            hoverBackgroundColor: (context) => {
              const dataPoint = context.raw;
              if (!dataPoint) return tokens.safe;
              const status = dataPoint.riskObj.appetiteStatus;
              return status === 'Above Appetite' ? tokens.critical : status === 'Near Appetite' ? tokens.warning : tokens.safe;
            },
            borderColor: 'transparent',
            borderWidth: 0,
            hoverBorderWidth: 0
          }]
        },
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
              backgroundColor: tokens.navy,
              titleColor: '#FFFFFF',
              bodyColor: '#FFFFFF',
              titleFont: { size: 12, family: 'Inter', weight: 'bold' },
              bodyFont: { size: 11, family: 'Inter' },
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
                color: tokens.slate,
                font: { family: 'Inter', size: 10 }
              },
              grid: { display: false },
              border: { display: false },
              title: {
                display: true,
                text: 'Likelihood →',
                color: tokens.navy,
                font: { family: 'Inter', size: 11, weight: 'bold' }
              }
            },
            y: {
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                color: tokens.slate,
                font: { family: 'Inter', size: 10 }
              },
              grid: { display: false },
              border: { display: false },
              title: {
                display: true,
                text: 'Impact ↑',
                color: tokens.navy,
                font: { family: 'Inter', size: 11, weight: 'bold' }
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
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span class="profile-role-badge" style="font-size: 10px; color: var(--color-slate);">${risk.category}</span>
          <button id="btn-close-drawer" style="border: none; background: none; font-size: 20px; cursor: pointer; color: var(--color-navy-secondary);">&times;</button>
        </div>
        
        <h2 style="font-size: 18px; font-weight: 600; color: var(--color-navy); margin-bottom: 4px;" title="ID: ${risk.id}">${cleanTitle(risk.title)}</h2>
        <span class="status-badge ${appClass}" style="font-size: 10px; padding: 2px 6px; margin-bottom: 12px; display: inline-block;">
          ${risk.appetiteStatus} (${risk.residualScore})
        </span>

        <p style="font-size: 12.5px; color: var(--color-navy); line-height: 1.5; margin-bottom: 16px;">
          ${cleanDescription(risk.description)}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-bottom: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <div>Owner: <strong style="color: var(--color-navy);">${risk.owner}</strong></div>
          <div>Unit: <strong style="color: var(--color-navy);">${risk.businessUnit || 'Unassigned'}</strong></div>
          <div>Likelihood: <strong style="color: var(--color-navy);">L${risk.likelihoodResidual || risk.likelihood}</strong></div>
          <div>Impact: <strong style="color: var(--color-navy);">I${risk.impactResidual || risk.impact}</strong></div>
        </div>

        <h3 style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.05em; margin-bottom: 6px;">Controls</h3>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; max-height: 120px; overflow-y: auto;">
          ${risk.controls?.length ? risk.controls.map(c => `
            <div style="padding: 4px 8px; background: var(--bg-primary); border: 0.5px solid var(--border-color); border-radius: 4px; font-size: 11px; display: flex; justify-content: space-between;">
              <span style="color: var(--color-navy); font-weight: 500;">${c.name}</span>
              <span style="color: ${c.effectiveness === 'Highly Effective' ? 'var(--color-safe)' : 'var(--color-warning)'}; font-weight: 600;">${c.effectiveness}</span>
            </div>
          `).join('') : '<span style="font-size: 11px; color: var(--color-navy-secondary); font-style: italic;">No active controls.</span>'}
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
        <button class="btn btn-primary" id="btn-drawer-explain" style="width: 100%; justify-content: center; height: 32px; font-size: 12px; padding: 4px;">Generate AI Briefing</button>
        <button class="btn btn-secondary" id="btn-drawer-action" style="width: 100%; justify-content: center; height: 32px; font-size: 12px; padding: 4px;">Action Items (${risk.actions?.length || 0})</button>
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
}
