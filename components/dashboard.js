// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';
import { AIInsightService } from '../services/aiInsightService.js';
import { RiskIntelligenceService } from '../services/riskIntelligenceService.js';

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
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];

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

    // Render primary HTML layout
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 58% 42%; gap: 20px;">
        
        <!-- LEFT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Panel 1: Active Intelligence -->
          <div class="glass-panel" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--color-navy-secondary); letter-spacing: 0.07em;">ACTIVE INTELLIGENCE</span>
                <span style="font-size: 12px; color: var(--color-navy-secondary);">Ranked signals requiring board attention</span>
              </div>
              <div class="posture-donut-wrapper" style="margin-top: -10px; margin-bottom: -10px;">
                <canvas id="posture-donut-chart" width="120" height="120"></canvas>
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              
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
      this.initPostureDonut(container);
      this.initSparklines(container);
      this.initHeatmap(container);
    }, 0);
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
              callback: (value) => value + '%'
            },
            grid: {
              color: 'rgba(13,27,42,0.06)'
            },
            border: { display: false }
          },
          y: {
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

        // Bottom-Left: Low zone (#E6F5F0)
        ctx.fillStyle = '#E6F5F0';
        ctx.fillRect(left, y3, x3 - left, bottom - y3);

        // Top-Left: Elevated (#FEF6E7)
        ctx.fillStyle = '#FEF6E7';
        ctx.fillRect(left, top, x3 - left, y3 - top);

        // Bottom-Right: Elevated (#FEF6E7)
        ctx.fillStyle = '#FEF6E7';
        ctx.fillRect(x3, y3, right - x3, bottom - y3);

        // Top-Right: Critical (#FDECEC)
        ctx.fillStyle = '#FDECEC';
        ctx.fillRect(x3, top, right - x3, y3 - top);

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
            borderWidth: 2,
            hoverBorderWidth: 2
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
                color: 'var(--color-navy)',
                font: { family: 'Calibri', size: 11 }
              },
              grid: {
                color: 'rgba(13, 27, 42, 0.05)',
                drawTicks: false
              },
              border: { color: 'var(--border-color)' },
              title: {
                display: true,
                text: 'Likelihood →',
                color: 'var(--color-navy)',
                font: { family: 'Calibri', size: 12, weight: 'bold' }
              }
            },
            y: {
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                color: 'var(--color-navy)',
                font: { family: 'Calibri', size: 11 }
              },
              grid: {
                color: 'rgba(13, 27, 42, 0.05)',
                drawTicks: false
              },
              border: { color: 'var(--border-color)' },
              title: {
                display: true,
                text: 'Impact ↑',
                color: 'var(--color-navy)',
                font: { family: 'Calibri', size: 12, weight: 'bold' }
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
