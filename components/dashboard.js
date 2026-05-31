// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';

export class DashboardComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedHeatmapCell = null; // {l, i}
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

  // Pre-generate matrix counts for 5x5 heatmap
  getHeatmapMatrix() {
    const matrix = Array(5).fill(0).map(() => Array(5).fill(0));
    const risks = this.state.risks;
    
    risks.forEach(r => {
      // Sliders are 1-5, matrix is 0-4 (0 index corresponds to Slider value 5 down to 1)
      const lIdx = 5 - (r.likelihoodResidual || r.likelihood || 1); // Likelihood Y axis (5 is top)
      const iIdx = (r.impactResidual || r.impact || 1) - 1; // Impact X axis (1 is left)
      if (lIdx >= 0 && lIdx < 5 && iIdx >= 0 && iIdx < 5) {
        matrix[lIdx][iIdx]++;
      }
    });
    
    return matrix;
  }

  render(container) {
    const risks = this.state.risks;
    const metrics = this.calculateMetrics();
    const matrix = this.getHeatmapMatrix();
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
        
        <!-- LEFT COLUMN: CRITICAL THREATS & OBJ IMPACT -->
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

        <!-- RIGHT COLUMN: HEATMAP MATRIX & ONE-CLICK BRIEF -->
        <div class="details-panel">
          
          <!-- INTERACTIVE HEATMAP MATRIX -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">
              <span>Risk Heatmap (Residual)</span>
              <span style="font-size:11px;color:var(--text-muted);font-weight:normal;">Filter by Likelihood x Impact</span>
            </h3>
            
            <div class="heatmap-container">
              ${matrix.map((row, rIdx) => {
                const likelihoodVal = 5 - rIdx;
                return `
                  <div class="heatmap-row">
                    <div class="heatmap-label-y">L${likelihoodVal}</div>
                    ${row.map((count, cIdx) => {
                      const impactVal = cIdx + 1;
                      const scoreMultiplier = likelihoodVal * impactVal;
                      let cellClass = "cell-1";
                      if (scoreMultiplier >= 16) cellClass = "cell-5"; // High / Above Appetite
                      else if (scoreMultiplier >= 10) cellClass = "cell-4";
                      else if (scoreMultiplier >= 6) cellClass = "cell-3";
                      else if (scoreMultiplier >= 3) cellClass = "cell-2";

                      const isSelected = this.selectedHeatmapCell && this.selectedHeatmapCell.l === likelihoodVal && this.selectedHeatmapCell.i === impactVal;

                      // Check for high velocity elements in this quadrant (F3)
                      const cellRisks = risks.filter(r => 
                        (r.likelihoodResidual || r.likelihood || 1) === likelihoodVal && 
                        (r.impactResidual || r.impact || 1) === impactVal
                      );
                      const hasHighVelocity = cellRisks.some(r => r.velocityResidual >= 4 || r.timeToImpact === 'Immediate' || r.timeToImpact === 'Fast');
                      const glowClass = hasHighVelocity ? 'velocity-glow' : '';

                      return `
                        <div class="heatmap-cell ${cellClass} ${isSelected ? 'selected' : ''} ${glowClass}" 
                             data-l="${likelihoodVal}" 
                             data-i="${impactVal}">
                          ${count > 0 ? `<span>${count}</span>` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                `;
              }).join('')}
              <div class="heatmap-row-x">
                <div class="heatmap-label-x">I1</div>
                <div class="heatmap-label-x">I2</div>
                <div class="heatmap-label-x">I3</div>
                <div class="heatmap-label-x">I4</div>
                <div class="heatmap-label-x">I5</div>
              </div>
            </div>

            <!-- Heatmap Drill-down View -->
            <div id="heatmap-drilldown-container" style="margin-top:12px;">
              ${this.renderHeatmapDrilldown()}
            </div>
          </div>

          <!-- ONE-CLICK BOARD NARRATIVE BRIEF -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">
              <span>AI Board Narrative Brief</span>
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
  }

  renderHeatmapDrilldown() {
    if (!this.selectedHeatmapCell) {
      return `<p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any cell in the heatmap grid containing risks to drill down into item specifics.</p>`;
    }

    const { l, i } = this.selectedHeatmapCell;
    const matchingRisks = this.state.risks.filter(r => 
      (r.likelihoodResidual || r.likelihood || 1) === l && 
      (r.impactResidual || r.impact || 1) === i
    );

    return `
      <div style="border-top:1px solid var(--border-color);padding-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h4 style="font-size:12px;color:var(--text-primary);font-weight:600;">Drill-down: Likelihood L${l} × Impact I${i}</h4>
          <button class="btn btn-secondary btn-small" id="btn-clear-heatmap" style="padding:2px 8px;font-size:10px;">Clear Filter</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:150px;overflow-y:auto;">
          ${matchingRisks.length ? matchingRisks.map(r => `
            <div class="heatmap-drilldown-row" style="padding:8px;background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:6px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span class="profile-role-badge" style="font-size:8px;color:var(--color-indigo);margin-bottom:2px;">${r.category}</span>
                <div style="font-weight:600;color:var(--text-primary);">${r.title}</div>
              </div>
              <span class="status-badge ${r.appetiteStatus === 'Above Appetite' ? 'above' : r.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:9px;padding:2px 6px;">
                Score: ${r.residualScore}
              </span>
            </div>
          `).join('') : `<p style="font-size:11px;color:var(--text-muted);text-align:center;">No risks in this specific scoring quadrant.</p>`}
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

  bindEvents(container) {
    // Print button
    const printBtn = container.querySelector('#btn-print-pack');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Heatmap cell click
    const cells = container.querySelectorAll('.heatmap-cell');
    cells.forEach(c => {
      c.addEventListener('click', () => {
        const l = parseInt(c.dataset.l);
        const i = parseInt(c.dataset.i);
        this.selectedHeatmapCell = { l, i };
        
        // Re-render only drill down area to maintain scroll
        const ddContainer = container.querySelector('#heatmap-drilldown-container');
        if (ddContainer) {
          ddContainer.innerHTML = this.renderHeatmapDrilldown();
          this.bindDrilldownEvents(container);
        }
        
        // Highlight cell
        cells.forEach(cell => cell.classList.remove('selected'));
        c.classList.add('selected');
      });
    });

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

    this.bindDrilldownEvents(container);
  }

  bindDrilldownEvents(container) {
    const clearBtn = container.querySelector('#btn-clear-heatmap');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedHeatmapCell = null;
        
        // Re-render drilldown area
        const ddContainer = container.querySelector('#heatmap-drilldown-container');
        if (ddContainer) {
          ddContainer.innerHTML = this.renderHeatmapDrilldown();
        }
        
        // Remove highlighting
        const cells = container.querySelectorAll('.heatmap-cell');
        cells.forEach(c => c.classList.remove('selected'));
      });
    }
  }
}
