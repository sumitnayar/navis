// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';
import { AIInsightService } from '../services/aiInsightService.js';

export class DashboardComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedHeatmapRiskIndex = null;
  }

  // ─── Navigation Helper ────────────────────────────────────────────────────
  navigateToPage(url, tabKey) {
    window.history.pushState(null, '', url);
    this.onStateChange({ activeTab: tabKey });
  }

  // ─── Clear Filters ────────────────────────────────────────────────────────
  clearFilters() {
    window.history.pushState(null, '', window.location.pathname);
  }

  // ─── Calculate Dynamic Metrics ───────────────────────────────────────────
  calculateMetrics(risks) {
    const today = new Date();
    const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const improvingCount = risks.filter(r => r.trend === 'Improving').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    return {
      aboveAppetiteCount,
      worseningCount,
      improvingCount,
      breachedKRIs,
      overdueActionsCount
    };
  }

  // ─── Zone 1: Status Bar Renderer ──────────────────────────────────────────
  renderStatusBar(risks) {
    const metrics = this.calculateMetrics(risks);

    let postureValue = "LOW";
    let postureClass = "low";
    if (metrics.aboveAppetiteCount > 15 || metrics.breachedKRIs > 20 || metrics.overdueActionsCount > 10) {
      postureValue = "CRITICAL";
      postureClass = "critical";
    } else if (metrics.aboveAppetiteCount > 0 || metrics.breachedKRIs > 0 || metrics.overdueActionsCount > 0) {
      postureValue = "ELEVATED";
      postureClass = ""; // default elevated style (amber #D97706)
    } else if (metrics.worseningCount > 0) {
      postureValue = "MODERATE";
      postureClass = "moderate";
    }

    const postureBadge = document.getElementById('posture-value-badge');
    if (postureBadge) {
      postureBadge.textContent = postureValue;
      postureBadge.className = `dash-posture-value ${postureClass}`.trim();
    }

    const setMetric = (id, val, critLimit) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = val;
        el.className = 'dash-metric-value';
        if (critLimit !== undefined && val > critLimit) {
          el.classList.add('red');
        } else if (val > 0) {
          el.classList.add('amber');
        }
      }
    };

    setMetric('metric-above-appetite', metrics.aboveAppetiteCount, 15);
    setMetric('metric-kri-breaches', metrics.breachedKRIs, 20);
    setMetric('metric-worsening', metrics.worseningCount, 0); // only has amber warning threshold
    setMetric('metric-overdue-actions', metrics.overdueActionsCount, 10);
  }

  // ─── Panel B: Strategic Fragility Table Renderer ──────────────────────────
  renderFragilityTable(risks) {
    const objectives = this.state.objectives || [];
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

    const tbody = document.getElementById('fragility-table-body');
    if (!tbody) return;

    tbody.innerHTML = dimensions.map(dim => {
      const percent = Math.round((fragilitySums[dim.key] / count) * 20);

      let fragClass = "frag-green";
      if (percent >= 80) fragClass = "frag-red";
      else if (percent >= 60) fragClass = "frag-amber";

      const dimRisks = risks.filter(r => r.fragility && r.fragility[dim.key] > 0);
      let trendSum = 0;
      dimRisks.forEach(r => {
        if (r.trend === 'Deteriorating') trendSum += 1;
        else if (r.trend === 'Improving') trendSum -= 1;
      });

      let trendArrow = "→";
      let trendClass = "trend-flat";
      if (trendSum > 0) {
        trendArrow = "↑";
        trendClass = "trend-up";
      } else if (trendSum < 0) {
        trendArrow = "↓";
        trendClass = "trend-down";
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
        <tr>
          <td><strong>${dim.label}</strong></td>
          <td class="${fragClass}">${percent}%</td>
          <td class="${trendClass}">${trendArrow}</td>
          <td>${objAtRisk}</td>
        </tr>
      `;
    }).join('');
  }

  // ─── Panel C: Risk Dynamics Renderer ──────────────────────────────────────
  renderDynamics(risks) {
    const worseningRisks = risks
      .filter(r => r.trend === 'Deteriorating')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3);

    const improvingRisks = risks
      .filter(r => r.trend === 'Improving')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3);

    const worseningList = document.getElementById('dynamics-worsening-list');
    if (worseningList) {
      if (worseningRisks.length === 0) {
        worseningList.innerHTML = `<div class="dash-dynamics-row"><span class="dash-dynamics-name" style="color:#64748B;">No worsening trends</span></div>`;
      } else {
        worseningList.innerHTML = worseningRisks.map(r => `
          <div class="dash-dynamics-row" data-risk-id="${r.id}" style="cursor: pointer;">
            <span class="dash-dynamics-name" title="${r.title}">${r.title}</span>
            <span class="dash-dynamics-score">${r.residualScore || 0}</span>
            <span class="dash-dynamics-arrow trend-up">↑</span>
          </div>
        `).join('');
      }
    }

    const improvingList = document.getElementById('dynamics-improving-list');
    if (improvingList) {
      if (improvingRisks.length === 0) {
        improvingList.innerHTML = `<div class="dash-dynamics-row"><span class="dash-dynamics-name" style="color:#64748B;">No improving trends</span></div>`;
      } else {
        improvingList.innerHTML = improvingRisks.map(r => `
          <div class="dash-dynamics-row" data-risk-id="${r.id}" style="cursor: pointer;">
            <span class="dash-dynamics-name" title="${r.title}">${r.title}</span>
            <span class="dash-dynamics-score">${r.residualScore || 0}</span>
            <span class="dash-dynamics-arrow trend-down">↓</span>
          </div>
        `).join('');
      }
    }

    // Bind click triggers to show AI explanation modal
    const dynamicsRows = document.querySelectorAll('.dash-dynamics-row[data-risk-id]');
    dynamicsRows.forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const riskId = row.getAttribute('data-risk-id');
        const riskItem = risks.find(r => r.id === riskId);
        if (riskItem) {
          AIInsightService.showExplanationModal('risk', riskItem, this.state);
        }
      });
    });
  }

  // ─── Panel A: Active Intelligence Feed (Async) ───────────────────────────
  async renderInsights(risks) {
    const listContainer = document.getElementById('active-intel-list');
    if (!listContainer) return;

    try {
      const { RiskIntelligenceService } = await import('../services/riskIntelligenceService.js');
      const insights = await RiskIntelligenceService.generateInsights(risks, null);

      if (!insights || insights.length === 0) {
        listContainer.innerHTML = `
          <div class="dash-insight-empty">
            <span style="font-size:14px;">✓</span>
            <span>No active intelligence alerts or forecast breaches detected.</span>
          </div>
        `;
        return;
      }

      const getDaysSinceReview = (r) => {
        const lastReviewedStr = r.last_reviewed_date || r.lastReviewedDate || r.created_at || new Date().toISOString();
        const lastReviewed = new Date(lastReviewedStr);
        return Math.ceil(Math.abs(new Date() - lastReviewed) / 86400000);
      };

      const staleRisks = risks.filter(r => {
        const days = getDaysSinceReview(r);
        return (r.appetiteStatus === 'Above Appetite' && days > 7) || days > 30 || (r.appetiteStatus === 'Within Appetite' && days > 60);
      });
      const maxStaleDays = staleRisks.length > 0 ? Math.max(...staleRisks.map(getDaysSinceReview)) : 0;

      const activeInsights = insights.slice(0, 8);

      listContainer.innerHTML = activeInsights.map(ins => {
        let sevClass = 'advisory';
        if (ins.severity === 'Critical') {
          sevClass = 'critical';
        } else if (ins.severity === 'Warning') {
          sevClass = 'warning';
        }

        let detailContext = '';
        if (ins.insight_type === 'KRI Trajectory') {
          const days = ins.source_data?.daysToBreach;
          detailContext = days ? `(Breach in ${days}d)` : '';
        } else if (ins.insight_type === 'Register Staleness') {
          detailContext = maxStaleDays > 0 ? `(Max stale: ${maxStaleDays}d)` : '';
        }

        return `
          <div class="dash-insight-row">
            <span class="dash-severity ${sevClass}">${ins.severity.toUpperCase()}</span>
            <span class="dash-insight-text" title="${ins.insight_text}">${ins.insight_text}</span>
            ${detailContext ? `<span class="dash-insight-detail">${detailContext}</span>` : ''}
            <span class="dash-insight-link btn-insight-review" 
                  data-type="${ins.insight_type}" 
                  data-risk-id="${ins.source_data?.riskId || ''}" 
                  data-filter="${ins.source_data?.filter || ''}">Review &rarr;</span>
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.btn-insight-review').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const type = link.dataset.type;
          const filter = link.dataset.filter;

          if (type === 'KRI Trajectory') {
            this.navigateToPage('/controls', 'controls');
          } else if (type === 'Register Staleness' && filter === 'stale') {
            this.navigateToPage('/risks?staleness=true', 'register');
          }
        });
      });

    } catch (err) {
      console.error("Failed to generate intelligence feed:", err);
      listContainer.innerHTML = `
        <div class="dash-insight-empty" style="color: #EF4444;">
          <span>⚠️</span>
          <span>Failed to generate intelligence feed.</span>
        </div>
      `;
    }
  }

  // ─── Heatmap Shading and Drilldown Renderer ────────────────────────────────
  renderHeatmapDrilldown(risk) {
    if (!risk) {
      return `<p style="font-size:10px; color:#64748B; text-align:center; line-height: 1.4; margin: 12px 0;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>`;
    }

    return `
      <div class="dashboard-fade-in" style="padding: 12px; background: rgba(0, 181, 181, 0.03); border: 1px solid rgba(0, 181, 181, 0.15); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:12px; color:#0A1628; font-weight:700; margin:0;">${risk.title}</h4>
          <button class="dash-print-btn" id="btn-clear-heatmap" style="padding:2px 8px; font-size:10px; margin: 0;">Clear Pin</button>
        </div>
        <div style="font-size:11px; color:#64748B; line-height:1.5; margin-bottom:8px;">
          ${risk.description}
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:10px; border-top: 1px solid #E2E8F0; padding-top:8px; margin-top:8px;">
          <div>Owner: <strong>${risk.owner}</strong></div>
          <div>Category: <strong>${risk.category}</strong></div>
          <div>Likelihood: <strong>L${risk.likelihoodResidual || risk.likelihood}</strong></div>
          <div>Impact: <strong>I${risk.impactResidual || risk.impact}</strong></div>
          <div>Residual Score: <strong style="padding: 2px 6px; font-size:10px; border-radius:4px; font-weight:bold; background: ${risk.appetiteStatus === 'Above Appetite' ? '#FCA5A5' : '#6EE7B7'};">${risk.residualScore}</strong></div>
          <div>Appetite Status: <strong style="color: ${risk.appetiteStatus === 'Above Appetite' ? '#EF4444' : risk.appetiteStatus === 'Near Appetite' ? '#D97706' : '#059669'}">${risk.appetiteStatus}</strong></div>
        </div>
      </div>
    `;
  }

  bindHeatmapClearEvent(container, heatmapChartInstance) {
    const clearBtn = container.querySelector('#btn-clear-heatmap');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedHeatmapRiskIndex = null;
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

  // ─── Heatmap Chart Initializer ───────────────────────────────────────────
  initHeatmap(container) {
    const risks = this.state.risks || [];
    const canvas = container.querySelector('#heatmap-chart-canvas');
    if (!canvas || risks.length === 0) return;

    const bubbleData = risks.map((r, index) => ({
      x: r.likelihoodResidual || r.likelihood || 1,
      y: r.impactResidual || r.impact || 1,
      r: Math.max(6, (r.residualScore || 1) * 0.8),
      riskObj: r,
      index: index
    }));

    const xVals = risks.map(r => r.likelihoodResidual || r.likelihood || 1);
    const yVals = risks.map(r => r.impactResidual || r.impact || 1);
    const xMin = Math.min(...xVals, 1);
    const xMax = Math.max(...xVals, 5);
    const yMin = Math.min(...yVals, 1);
    const yMax = Math.max(...yVals, 5);

    const scaleMinX = Math.max(0.5, xMin - 0.5);
    const scaleMaxX = Math.min(5.5, xMax + 0.5);
    const scaleMinY = Math.max(0.5, yMin - 0.5);
    const scaleMaxY = Math.min(5.5, yMax + 0.5);

    const quadrantPlugin = {
      id: 'quadrantShading',
      beforeDraw(chart) {
        const { ctx: chartCtx, chartArea: { top, right, bottom, left }, scales: { x, y } } = chart;
        chartCtx.save();
        const xPixel = x.getPixelForValue(3);
        const yPixel = y.getPixelForValue(3);
        const xMaxVal = Math.max(3, x.max);
        const yMaxVal = Math.max(3, y.max);
        const xMaxPixel = x.getPixelForValue(xMaxVal);
        const yMaxPixel = y.getPixelForValue(yMaxVal);

        chartCtx.fillStyle = 'rgba(239, 68, 68, 0.02)';
        chartCtx.fillRect(
          Math.max(left, xPixel),
          Math.max(top, yMaxPixel),
          Math.max(0, xMaxPixel - xPixel),
          Math.max(0, yPixel - yMaxPixel)
        );
        chartCtx.restore();
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
              if (!dataPoint) return '#6EE7B7';
              const status = dataPoint.riskObj.appetiteStatus;
              return status === 'Above Appetite' ? '#FCA5A5' : status === 'Near Appetite' ? '#FCD34D' : '#6EE7B7';
            },
            borderColor: '#FFFFFF',
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
              min: scaleMinX,
              max: scaleMaxX,
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
                text: 'Likelihood →',
                color: '#64748B',
                font: { family: 'Outfit', size: 11, weight: 'bold' }
              }
            },
            y: {
              min: scaleMinY,
              max: scaleMaxY,
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
    } else {
      console.warn("Chart.js is not loaded. Skipping heatmap scatter chart initialization.");
    }
  }

  // ─── Main Render Entry ───────────────────────────────────────────────────
  render(container) {
    const risks = this.state.risks || [];

    // Shell HTML with specified classes
    container.innerHTML = `
      <div class="dashboard-wrap">
        <!-- ZONE 1: Status Bar -->
        <div class="dash-status-bar">
          <span class="dash-posture-label">Enterprise Risk Posture</span>
          <span class="dash-posture-value low" id="posture-value-badge">LOW</span>

          <div class="dash-sb-divider"></div>
          <span class="dash-metric-label">Above Appetite</span>
          <span class="dash-metric-value" id="metric-above-appetite">0</span>

          <div class="dash-sb-divider"></div>
          <span class="dash-metric-label">KRI Breaches</span>
          <span class="dash-metric-value" id="metric-kri-breaches">0</span>

          <div class="dash-sb-divider"></div>
          <span class="dash-metric-label">Worsening</span>
          <span class="dash-metric-value" id="metric-worsening">0</span>

          <div class="dash-sb-divider"></div>
          <span class="dash-metric-label">Overdue Actions</span>
          <span class="dash-metric-value" id="metric-overdue-actions">0</span>

          <button class="dash-print-btn" id="btn-print-pack">Print Board Pack</button>
        </div>

        <!-- ZONE 2 & 3: Two Column Dashboard Layout -->
        <div class="dash-body">
          <!-- Left Column (Zone 2) -->
          <div class="dash-left">
            <!-- Panel A: Active Intelligence -->
            <div class="dash-panel" id="panel-active-intel">
              <div class="dash-panel-label">Active Intelligence</div>
              <div class="dash-panel-sub">Ranked signals requiring board attention</div>
              <div class="dash-insight-list" id="active-intel-list">
                <div class="dash-skeleton-row"></div>
                <div class="dash-skeleton-row"></div>
                <div class="dash-skeleton-row"></div>
              </div>
            </div>

            <div class="dash-panel-divider"></div>

            <!-- Panel B: Strategic Fragility -->
            <div class="dash-panel" id="panel-fragility">
              <div class="dash-panel-label">Strategic Fragility</div>
              <div class="dash-panel-sub">Structural vulnerability and objectives exposure</div>
              <table class="dash-fragility-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Fragility</th>
                    <th>Trend</th>
                    <th>Objectives at Risk</th>
                  </tr>
                </thead>
                <tbody id="fragility-table-body">
                  <!-- Dynamic rows go here -->
                </tbody>
              </table>
            </div>

            <div class="dash-panel-divider"></div>

            <!-- Panel C: Risk Dynamics -->
            <div class="dash-panel" id="panel-dynamics">
              <div class="dash-panel-label">Risk Movement</div>
              <div class="dash-panel-sub">Leading indicators of risk vector updates</div>
              <div class="dash-dynamics">
                <!-- Top Worsening -->
                <div class="dash-dynamics-col">
                  <div class="dash-dynamics-header">Top Worsening</div>
                  <div id="dynamics-worsening-list">
                    <!-- Dynamic rows go here -->
                  </div>
                </div>

                <div class="dash-dynamics-divider"></div>

                <!-- Top Improving -->
                <div class="dash-dynamics-col">
                  <div class="dash-dynamics-header">Top Improving</div>
                  <div id="dynamics-improving-list">
                    <!-- Dynamic rows go here -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column (Zone 3) -->
          <div class="dash-right">
            <div class="dash-panel-label">Risk Portfolio</div>
            <div class="dash-panel-sub">Likelihood vs impact — click any point to inspect</div>
            <div class="dash-heatmap-card">
              <div style="position: relative; height: 260px; margin-bottom: 12px;">
                <canvas id="heatmap-chart-canvas"></canvas>
              </div>
              <div id="heatmap-drilldown-container">
                <!-- Drilldown details -->
              </div>
            </div>
            <div style="margin-top: 8px;">
              <a class="dash-open-link" id="link-open-full-analysis" href="#">Open full analysis →</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // 1. Render sync sections
    this.renderStatusBar(risks);
    this.renderFragilityTable(risks);
    this.renderDynamics(risks);

    // 2. Initialize Heatmap
    this.initHeatmap(container);

    // 3. Render async insights
    this.renderInsights(risks);

    // 4. Bind event listeners
    const printBtn = container.querySelector('#btn-print-pack');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const openFullAnalysis = container.querySelector('#link-open-full-analysis');
    if (openFullAnalysis) {
      openFullAnalysis.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToPage('/portfolio', 'portfolio');
      });
    }

    // Initialize Drilldown Container to default empty message
    const ddContainer = container.querySelector('#heatmap-drilldown-container');
    if (ddContainer) {
      ddContainer.innerHTML = this.renderHeatmapDrilldown(null);
    }
  }
}
