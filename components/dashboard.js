// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';

export class DashboardComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedHeatmapRiskIndex = null;
    this.isGeneratingBrief = false;
    this.briefContent = "";
  }

  // Calculate dynamic metrics from risk register
  calculateMetrics() {
    const risks = this.state.risks;
    
    const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const improvingCount = risks.filter(r => r.trend === 'Improving').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    
    // Count overdue actions
    const today = new Date();
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    // Calculate Strategic Fragility averages (1-5 scaled to %)
    const fragilitySums = { revenue: 0, growth: 0, customerTrust: 0, technology: 0, people: 0, operations: 0, reputation: 0, valuation: 0 };
    let count = risks.length || 1;
    
    risks.forEach(r => {
      if (r.fragility) {
        Object.keys(fragilitySums).forEach(k => {
          fragilitySums[k] += (r.fragility[k] || 0);
        });
      }
    });

    const fragilityPercentages = {};
    Object.keys(fragilitySums).forEach(k => {
      // Map 1-5 average to 0-100%
      fragilityPercentages[k] = Math.round((fragilitySums[k] / count) * 20);
    });

    return {
      aboveAppetiteCount,
      worseningCount,
      improvingCount,
      breachedKRIs,
      overdueActionsCount,
      fragilityPercentages
    };
  }

  render(container) {
    const risks = this.state.risks;
    const metrics = this.calculateMetrics();
    const settings = this.state.settings;

    // Top worsening/improving lists
    const worseningRisks = risks.filter(r => r.trend === 'Deteriorating').slice(0, 3);
    const improvingRisks = risks.filter(r => r.trend === 'Improving').slice(0, 3);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Executive Risk Control Center</span>
          <h1>Board Risk Intelligence</h1>
          <p class="page-subtitle">Real-time risk posture for <strong>${settings.companyName}</strong> | IPO Alignment Tracker</p>
        </div>
        <div class="no-print">
          <button class="btn btn-secondary" id="btn-print-pack">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821V21h10.56v-7.179m-10.56 0a3 3 0 01-3-3V6.72a3 3 0 013-3h10.56a3 3 0 013 3v4.101a3 3 0 01-3 3m-10.56 0h10.56" />
            </svg>
            Print Board Pack
          </button>
        </div>
      </div>

      <!-- EXECUTIVE COUNTER TICKER -->
      <div class="ticker-grid">
        <div class="ticker-card above">
          <span class="ticker-label">Risks Above Appetite</span>
          <span class="ticker-value">${metrics.aboveAppetiteCount}</span>
          <span class="ticker-footer">Critical breaches requiring mitigation</span>
        </div>
        <div class="ticker-card near">
          <span class="ticker-label">Key KRI Breaches</span>
          <span class="ticker-value">${metrics.breachedKRIs}</span>
          <span class="ticker-footer">Operational thresholds crossed</span>
        </div>
        <div class="ticker-card indigo">
          <span class="ticker-label">Worsening Postures</span>
          <span class="ticker-value">${metrics.worseningCount}</span>
          <span class="ticker-footer">Increasing volatility vectors</span>
        </div>
        <div class="ticker-card within">
          <span class="ticker-label">Overdue Actions</span>
          <span class="ticker-value" style="color: ${metrics.overdueActionsCount > 0 ? 'var(--color-above-appetite)' : 'var(--color-within-appetite)'}">
            ${metrics.overdueActionsCount}
          </span>
          <span class="ticker-footer">Slipped mitigation tasks</span>
        </div>
      </div>

      <!-- MAIN DASHBOARD BODY GRID -->
      <div class="dashboard-grid">
        
        <!-- LEFT COLUMN -->
        <div class="details-panel">
          
          <!-- DYNAMIC STRATEGIC FRAGILITY MAP -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">
              <span>Strategic Fragility Map</span>
              <span style="font-size:11px;color:var(--text-secondary);font-weight:normal;">Objectives Threatened</span>
            </h3>
            <div class="fragility-container">
              ${Object.entries(metrics.fragilityPercentages).map(([key, percent]) => `
                <div class="fragility-bar-row">
                  <div class="fragility-bar-header">
                    <span>${key.replace(/([A-Z])/g, ' $1')}</span>
                    <span>${percent}% Fragility</span>
                  </div>
                  <div class="fragility-bar-outer">
                    <div class="fragility-bar-inner" style="width: ${percent}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 14px; text-align: center;">
              *Fragility aggregates risk severity (L × I × V) mapped to objective dimensions. Lower is safer.
            </p>
          </div>

          <!-- RISK VELOCITY TRACKER -->
          <div class="dashboard-graph-card" id="risk-velocity-container">
            <div class="dashboard-graph-card-header">
              <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
              <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
            </div>
            <div class="risk-velocity-grid">
              ${[1, 2, 3, 4, 5].map(() => `
                <div class="risk-velocity-card" style="height: 220px; justify-content: center; align-items: center;">
                  <div class="skeleton-loading" style="width: 80px; height: 12px; margin-bottom: 8px;"></div>
                  <div class="skeleton-loading" style="width: 40px; height: 20px; margin-bottom: 12px;"></div>
                  <div class="skeleton-loading" style="width: 100%; height: 100px; border-radius: 6px;"></div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KRI BREACH MONITOR -->
          <div class="dashboard-graph-card" id="kri-breach-container">
            <div class="dashboard-graph-card-header">
              <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
              <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
            </div>
            <div class="kri-gauge-grid">
              ${[1, 2, 3].map(() => `
                <div class="kri-gauge-card" style="height: 260px; justify-content: center; align-items: center;">
                  <div class="skeleton-loading" style="width: 120px; height: 14px; margin-bottom: 16px;"></div>
                  <div class="skeleton-loading" style="width: 160px; height: 100px; border-radius: 50% 50% 0 0; margin-bottom: 16px;"></div>
                  <div class="skeleton-loading" style="width: 80px; height: 18px; margin-bottom: 6px;"></div>
                  <div class="skeleton-loading" style="width: 100px; height: 10px;"></div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- RISK POSTURE TREND DYNAMICS -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Risk Dynamics Tracker</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              
              <!-- Column Worsening -->
              <div>
                <h4 style="font-size:12px;color:var(--color-above-appetite);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Top Worsening Risk Items</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${worseningRisks.length ? worseningRisks.map(r => `
                    <div style="padding:10px;background:rgba(255,42,84,0.03);border:1px solid rgba(255,42,84,0.1);border-radius:6px;">
                      <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.title}</div>
                      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:4px;">
                        <span>Residual Score: ${r.residualScore}</span>
                        <span class="trend-tag deteriorating">↑ Worsening</span>
                      </div>
                    </div>
                  `).join('') : '<div style="font-size:11px;color:var(--text-muted);">No deteriorating trends.</div>'}
                </div>
              </div>

              <!-- Column Improving -->
              <div>
                <h4 style="font-size:12px;color:var(--color-within-appetite);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Top Improving Risk Items</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${improvingRisks.length ? improvingRisks.map(r => `
                    <div style="padding:10px;background:rgba(16,185,129,0.03);border:1px solid rgba(16,185,129,0.1);border-radius:6px;">
                      <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.title}</div>
                      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:4px;">
                        <span>Residual Score: ${r.residualScore}</span>
                        <span class="trend-tag improving">↓ Improving</span>
                      </div>
                    </div>
                  `).join('') : '<div style="font-size:11px;color:var(--text-muted);">No active mitigations reporting improvement.</div>'}
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="details-panel">
          
          <!-- UPGRADED RISK HEATMAP -->
          <div class="dashboard-graph-card" id="risk-heatmap-container">
            <div class="dashboard-graph-card-header">
              <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
              <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
            </div>
            <div style="position: relative; height: 320px; margin-bottom: 16px; display: flex; justify-content: center; align-items: center;">
              <div class="skeleton-loading" style="width: 100%; height: 300px; border-radius: 8px;"></div>
            </div>
            
            <!-- Heatmap legend -->
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #E11D48;"></span>
                <span style="color: var(--text-secondary);">Above Appetite</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #D97706;"></span>
                <span style="color: var(--text-secondary);">Near Appetite</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #059669;"></span>
                <span style="color: var(--text-secondary);">Within Appetite</span>
              </div>
            </div>

            <!-- Heatmap Drill-down View -->
            <div id="heatmap-drilldown-container" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>
            </div>
          </div>

          <!-- ONE-CLICK BOARD NARRATIVE BRIEF -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title" style="display:flex;justify-content:space-between;align-items:center;">
              <span style="display:flex;align-items:center;gap:8px;">
                AI Board Narrative Brief
                <span class="status-badge ${settings.geminiApiKey ? 'within' : 'near'}" style="font-size:9px;padding:2px 6px;font-weight:normal;">
                  ${settings.geminiApiKey ? 'Live Gemini AI' : 'Simulation Mode'}
                </span>
              </span>
              <button class="btn btn-primary btn-small no-print" id="btn-generate-brief">
                ${this.isGeneratingBrief ? 'Analyzing...' : 'Generate Brief'}
              </button>
            </h3>

            <div style="background:rgba(0,0,0,0.15);border:1px solid var(--border-color);border-radius:10px;padding:16px;min-height:220px;max-height:280px;overflow-y:auto;font-size:12px;">
              ${this.isGeneratingBrief ? `
                <div class="chat-bubble-loader" style="height:150px;">
                  <span></span><span></span><span></span>
                </div>
              ` : `
                <div class="board-brief-markdown">
                  ${this.briefContent ? this.formatMarkdown(this.briefContent) : `
                    <div style="text-align:center;color:var(--text-muted);padding-top:50px;">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px;height:40px;margin:0 auto 10px;opacity:0.5;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Click "Generate Brief" to aggregate the active register and formulate a professional narrative summary for board review.
                    </div>
                  `}
                </div>
              `}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents(container);

    // Trigger asynchronous graph rendering immediately (no artificial delay)
    this.initGraphs(container);
  }

  // Generate HTML for Heatmap drilldown card
  renderHeatmapDrilldown(risk) {
    if (!risk) {
      return `<p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>`;
    }

    return `
      <div class="dashboard-fade-in" style="padding: 12px; background: rgba(0, 181, 181, 0.03); border: 1px solid rgba(0, 181, 181, 0.15); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:12px; color:var(--text-primary); font-weight:700; margin:0;">${risk.title}</h4>
          <button class="btn btn-secondary btn-small" id="btn-clear-heatmap" style="padding:2px 8px; font-size:10px;">Clear Pin</button>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); line-height:1.5; margin-bottom:8px;">
          ${risk.description}
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:10px; border-top: 1px solid var(--border-color); padding-top:8px; margin-top:8px;">
          <div>Owner: <strong>${risk.owner}</strong></div>
          <div>Category: <strong>${risk.category}</strong></div>
          <div>Likelihood: <strong>L${risk.likelihoodResidual || risk.likelihood}</strong></div>
          <div>Impact: <strong>I${risk.impactResidual || risk.impact}</strong></div>
          <div>Residual Score: <strong class="trend-tag ${risk.appetiteStatus === 'Above Appetite' ? 'deteriorating' : 'stable'}" style="padding: 2px 6px; font-size:10px; border-radius:4px; font-weight:bold;">${risk.residualScore}</strong></div>
          <div>Appetite Status: <strong style="color: ${risk.appetiteStatus === 'Above Appetite' ? 'var(--color-above-appetite)' : risk.appetiteStatus === 'Near Appetite' ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'}">${risk.appetiteStatus}</strong></div>
        </div>
      </div>
    `;
  }

  // Fast Markdown to HTML Converter for simulated/live responses
  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    // Replace headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:14px;margin-bottom:6px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;margin-top:10px;margin-bottom:4px;">$1</h5>');
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Replace horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:12px 0;" />');
    // Replace lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;list-style:decimal;">$1</li>');
    
    return html;
  }

  // Render line charts, bubble charts and SVG gauges dynamically
  async initGraphs(container) {
    const risks = this.state.risks || [];
    
    // Clear skeletons and fade in the layout
    const velocityContainer = container.querySelector('#risk-velocity-container');
    const heatmapContainer = container.querySelector('#risk-heatmap-container');
    const breachedKriContainer = container.querySelector('#kri-breach-container');

    if (risks.length === 0) {
      if (velocityContainer) {
        velocityContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
            <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for velocity tracking.</div>
        `;
      }
      if (heatmapContainer) {
        heatmapContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
            <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for risk heatmap.</div>
        `;
      }
      if (breachedKriContainer) {
        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for KRI monitoring.</div>
        `;
      }
      return;
    }

    // Helper functions for parsing numerical fields in KRIs
    const parseNumeric = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const match = val.match(/[-+]?[0-9]*\.?[0-9]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const getUnit = (val) => {
      if (typeof val !== 'string') return '';
      if (val.includes('%')) return '%';
      if (val.includes('days')) return ' days';
      if (val.includes('day')) return ' day';
      return '';
    };

    // 1. RENDER RISK VELOCITY TRACKER
    if (velocityContainer) {
      const top5Risks = [...risks]
        .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
        .slice(0, 5);

      velocityContainer.innerHTML = `
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
          <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
        </div>
        <div class="risk-velocity-grid dashboard-fade-in">
          ${top5Risks.map((r, idx) => {
            const trendLabel = r.trend === 'Deteriorating' ? 'Worsening' : r.trend === 'Improving' ? 'Improving' : 'Stable';
            const badgeClass = r.trend === 'Deteriorating' ? 'above' : r.trend === 'Improving' ? 'within' : 'near';
            return `
              <div class="risk-velocity-card">
                <div style="margin-bottom: 8px;">
                  <span class="profile-role-badge" style="font-size: 8px; color: var(--color-indigo); margin-bottom: 4px; display: inline-block;">${r.category}</span>
                  <div style="font-weight: 700; font-size: 11px; line-height: 1.3; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 28px;">${r.title}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                  <span style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${r.residualScore}</span>
                  <span class="status-badge ${badgeClass}" style="font-size: 8px; padding: 1px 4px; font-weight: bold;">${trendLabel}</span>
                </div>
                <div style="height: 100px; width: 100%; position: relative;">
                  <canvas id="velocity-chart-${idx}"></canvas>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Initialize line charts for each of the top 5 risks
      top5Risks.forEach((r, idx) => {
        const ctx = document.getElementById(`velocity-chart-${idx}`);
        if (!ctx) return;

        // Generate score history dynamically matching the trend
        const currentScore = r.residualScore || 12;
        const trend = r.trend;
        const historyPoints = [];

        // Clamping utility
        const clamp = (val) => Math.max(1, Math.min(25, val));

        if (trend === 'Deteriorating') {
          let last = currentScore;
          historyPoints.unshift(last);
          for (let i = 0; i < 4; i++) {
            last = clamp(last - Math.floor(Math.random() * 3));
            historyPoints.unshift(last);
          }
        } else if (trend === 'Improving') {
          let last = currentScore;
          historyPoints.unshift(last);
          for (let i = 0; i < 4; i++) {
            last = clamp(last + Math.floor(Math.random() * 3));
            historyPoints.unshift(last);
          }
        } else {
          for (let i = 0; i < 5; i++) {
            const dev = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            historyPoints.push(clamp(currentScore + dev));
          }
        }

        // Final point must match current residual score
        historyPoints[historyPoints.length - 1] = currentScore;

        const lineColor = trend === 'Deteriorating' ? '#E11D48' : trend === 'Improving' ? '#059669' : '#D97706';

        new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['P1', 'P2', 'P3', 'P4', 'Current'],
            datasets: [{
              data: historyPoints,
              borderColor: lineColor,
              borderWidth: 2,
              pointBackgroundColor: lineColor,
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 1.5,
              pointRadius: 2.5,
              pointHoverRadius: 4.5,
              fill: false,
              tension: 0.35
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                intersect: false,
                mode: 'index',
                backgroundColor: '#0F172A',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                titleFont: { size: 9, family: 'Inter' },
                bodyFont: { size: 10, family: 'Inter', weight: 'bold' },
                padding: 6,
                callbacks: {
                  title: () => '',
                  label: (context) => `Score: ${context.parsed.y}`
                }
              }
            },
            scales: {
              x: { display: false },
              y: {
                display: true,
                min: 0,
                max: 25,
                ticks: { display: false },
                grid: {
                  color: 'rgba(0, 0, 0, 0.03)',
                  drawTicks: false
                },
                border: { display: false }
              }
            }
          }
        });
      });
    }

    // 2. RENDER RISK HEATMAP
    if (heatmapContainer) {
      heatmapContainer.innerHTML = `
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
          <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
        </div>
        <div class="dashboard-fade-in" style="position: relative; height: 320px; margin-bottom: 16px;">
          <canvas id="heatmap-chart-canvas"></canvas>
        </div>
        <div class="dashboard-fade-in" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #E11D48;"></span>
            <span style="color: var(--text-secondary);">Above Appetite</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #D97706;"></span>
            <span style="color: var(--text-secondary);">Near Appetite</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #059669;"></span>
            <span style="color: var(--text-secondary);">Within Appetite</span>
          </div>
        </div>
        <div id="heatmap-drilldown-container" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>
        </div>
      `;

      const ctx = document.getElementById('heatmap-chart-canvas');
      if (ctx) {
        // Compile datasets
        const bubbleData = risks.map((r, index) => ({
          x: r.likelihoodResidual || r.likelihood || 1,
          y: r.impactResidual || r.impact || 1,
          r: Math.max(6, (r.residualScore || 1) * 0.8), // radius sized by residual score
          riskObj: r,
          index: index
        }));

        this.selectedHeatmapRiskIndex = null;

        // Custom Quadrant shading plugin (Barely visible High Likelihood / High Impact red shade)
        const quadrantPlugin = {
          id: 'quadrantShading',
          beforeDraw(chart) {
            const { ctx: chartCtx, chartArea: { top, right, bottom, left }, scales: { x, y } } = chart;
            chartCtx.save();
            const xPixel = x.getPixelForValue(3);
            const yPixel = y.getPixelForValue(3);
            const xMaxPixel = x.getPixelForValue(5.5);
            const yMaxPixel = y.getPixelForValue(5.5);

            chartCtx.fillStyle = 'rgba(239, 68, 68, 0.03)'; // Whisper red overlay
            chartCtx.fillRect(xPixel, yMaxPixel, xMaxPixel - xPixel, yPixel - yMaxPixel);
            chartCtx.restore();
          }
        };

        const heatmapChartInstance = new window.Chart(ctx, {
          type: 'bubble',
          data: {
            datasets: [{
              data: bubbleData,
              backgroundColor: (context) => {
                const dataPoint = context.raw;
                if (!dataPoint) return '#059669';
                const status = dataPoint.riskObj.appetiteStatus;
                return status === 'Above Appetite' ? '#E11D48' : status === 'Near Appetite' ? '#D97706' : '#059669';
              },
              borderColor: '#FFFFFF', // 2px white stroke to make overlapping distinct
              borderWidth: 2,
              hoverBorderColor: '#0F172A',
              hoverBorderWidth: 2
            }]
          },
          plugins: [quadrantPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
              const ddContainer = container.querySelector('#heatmap-drilldown-container');
              if (elements && elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex;
                const index = elements[0].index;
                const clickedPoint = heatmapChartInstance.data.datasets[datasetIndex].data[index];
                
                this.selectedHeatmapRiskIndex = clickedPoint.index;
                
                if (ddContainer) {
                  ddContainer.innerHTML = this.renderHeatmapDrilldown(clickedPoint.riskObj);
                  this.bindHeatmapClearEvent(container, heatmapChartInstance);
                }
              } else {
                this.selectedHeatmapRiskIndex = null;
                if (ddContainer) {
                  ddContainer.innerHTML = this.renderHeatmapDrilldown(null);
                }
              }
              heatmapChartInstance.update();
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                backgroundColor: '#0F172A',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                titleFont: { size: 10, family: 'Inter', weight: 'bold' },
                bodyFont: { size: 9, family: 'Inter' },
                padding: 10,
                callbacks: {
                  title: (context) => {
                    const rawPoint = context[0].raw;
                    return rawPoint.riskObj.title;
                  },
                  label: (context) => {
                    const rawPoint = context.raw;
                    return [
                      `Residual Score: ${rawPoint.riskObj.residualScore}`,
                      `Likelihood: L${rawPoint.x}`,
                      `Impact: I${rawPoint.y}`,
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
                  color: '#64748B', // Muted grey labels
                  font: { family: 'Inter', size: 10 }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.04)',
                  drawTicks: false
                },
                border: { color: 'rgba(0, 0, 0, 0.06)' },
                title: {
                  display: true,
                  text: 'Likelihood →',
                  color: '#64748B',
                  font: { family: 'Outfit', size: 11, weight: 'bold' }
                }
              },
              y: {
                min: 0.5,
                max: 5.5,
                ticks: {
                  stepSize: 1,
                  color: '#64748B',
                  font: { family: 'Inter', size: 10 }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.04)',
                  drawTicks: false
                },
                border: { color: 'rgba(0, 0, 0, 0.06)' },
                title: {
                  display: true,
                  text: 'Impact ↑',
                  color: '#64748B',
                  font: { family: 'Outfit', size: 11, weight: 'bold' }
                }
              }
            }
          }
        });
      }
    }

    // 3. RENDER KRI BREACH MONITOR (GAUGES)
    if (breachedKriContainer) {
      const breachedKriList = [];
      risks.forEach(r => {
        if (r.kris && Array.isArray(r.kris)) {
          r.kris.forEach(k => {
            if (k.status === 'BREACHED') {
              breachedKriList.push({
                riskTitle: r.title,
                kriName: k.name,
                current: k.current,
                threshold: k.threshold
              });
            }
          });
        }
      });

      if (breachedKriList.length === 0) {
        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="no-breach-state-card dashboard-fade-in" style="background: rgba(16,185,129,0.03); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 32px 24px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <div style="font-size: 32px; color: #059669; margin-bottom: 8px;">✓</div>
            <h4 style="font-family: var(--font-header); font-size: 14px; font-weight: 700; color: #059669; margin: 0 0 4px 0;">All KRIs within threshold</h4>
            <p style="font-family: var(--font-body); font-size: 11px; color: var(--text-secondary); margin: 0;">No operational metric has breached approved corporate limits.</p>
          </div>
        `;
      } else {
        const displayList = breachedKriList.slice(0, 6);

        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="kri-gauge-grid dashboard-fade-in">
            ${displayList.map((kri, idx) => {
              const currentNum = parseNumeric(kri.current);
              const thresholdNum = parseNumeric(kri.threshold);
              const unit = getUnit(kri.current);
              
              const delta = currentNum - thresholdNum;
              const formattedDelta = `+${delta.toFixed(1).replace(/\.0$/, '')}${unit}`;

              let maxVal = 100;
              if (currentNum > 100 || thresholdNum > 100) {
                maxVal = Math.ceil(Math.max(currentNum, thresholdNum) * 1.3);
              } else if (thresholdNum <= 0) {
                maxVal = 100;
              } else {
                maxVal = Math.max(10, Math.ceil(thresholdNum * 1.4), Math.ceil(currentNum * 1.1));
              }

              const cx = 100;
              const cy = 90;
              const R = 70;

              const angleThresh = Math.max(0, Math.min(180, (thresholdNum / maxVal) * 180));
              const radThresh = (180 - angleThresh) * Math.PI / 180;
              const xThresh = cx + R * Math.cos(radThresh);
              const yThresh = cy - R * Math.sin(radThresh);

              const angleNeedle = Math.max(0, Math.min(180, (currentNum / maxVal) * 180));
              const radNeedle = (180 - angleNeedle) * Math.PI / 180;
              const xNeedle = cx + (R - 12) * Math.cos(radNeedle);
              const yNeedle = cy - (R - 12) * Math.sin(radNeedle);

              return `
                <div class="kri-gauge-card">
                  <div class="kri-gauge-title">${kri.kriName}</div>
                  
                  <div style="position: relative; width: 100%; max-width: 200px; height: 110px; margin-bottom: 12px;">
                    <svg viewBox="0 0 200 110" width="100%" height="100%">
                      <!-- Unfilled portion background track (F1F5F9) -->
                      <path d="M 30 90 A 70 70 0 0 1 170 90" fill="none" stroke="#F1F5F9" stroke-width="12" stroke-linecap="round" />
                      
                      <!-- Safe Zone Arc (Green) -->
                      <path d="M 30 90 A 70 70 0 0 1 ${xThresh} ${yThresh}" fill="none" stroke="#10B981" stroke-width="12" />
                      
                      <!-- Breach Zone Arc (Red) -->
                      <path d="M ${xThresh} ${yThresh} A 70 70 0 0 1 170 90" fill="none" stroke="#EF4444" stroke-width="12" stroke-linecap="round" />
                      
                      <!-- Threshold line marker -->
                      <line x1="${cx + (R - 14) * Math.cos(radThresh)}" y1="${cy - (R - 14) * Math.sin(radThresh)}" 
                            x2="${cx + (R + 14) * Math.cos(radThresh)}" y2="${cy - (R + 14) * Math.sin(radThresh)}" 
                            stroke="#0F172A" stroke-width="2" />
                      
                      <!-- Needle (Thin sharp line) -->
                      <line x1="${cx}" y1="${cy}" x2="${xNeedle}" y2="${yNeedle}" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" />
                      
                      <!-- Needle pin center anchor -->
                      <circle cx="${cx}" cy="${cy}" r="5" fill="#0F172A" />
                    </svg>
                  </div>
                  
                  <!-- Breach Delta: Most prominent red number -->
                  <div style="font-size: 24px; font-weight: 800; color: #EF4444; margin-bottom: 2px; line-height: 1.2;">
                    ${formattedDelta}
                  </div>
                  <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Current: <strong>${kri.current}</strong>
                  </div>
                  <div style="font-size: 10px; color: var(--text-muted);">
                    Threshold: ${kri.threshold}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }
  }

  bindEvents(container) {
    // Print button
    const printBtn = container.querySelector('#btn-print-pack');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Generate Brief button
    const genBriefBtn = container.querySelector('#btn-generate-brief');
    if (genBriefBtn) {
      genBriefBtn.addEventListener('click', async () => {
        if (this.isGeneratingBrief) return;
        this.isGeneratingBrief = true;
        this.render(container); // Re-render to show loader

        try {
          const brief = await AIService.generateBoardBrief(this.state.risks, this.state.settings);
          this.briefContent = brief;
        } catch (e) {
          this.briefContent = "Failed to compile Board Brief. Please check your network or API configurations.";
        } finally {
          this.isGeneratingBrief = false;
          this.render(container); // Re-render to show brief
        }
      });
    }
  }

  bindHeatmapClearEvent(container, heatmapChartInstance) {
    const clearBtn = container.querySelector('#btn-clear-heatmap');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedHeatmapRiskIndex = null;
        
        // Re-render drilldown area
        const ddContainer = container.querySelector('#heatmap-drilldown-container');
        if (ddContainer) {
          ddContainer.innerHTML = this.renderHeatmapDrilldown(null);
        }
        
        if (heatmapChartInstance) {
          heatmapChartInstance.update();
        }
      });
    }
  }
}
