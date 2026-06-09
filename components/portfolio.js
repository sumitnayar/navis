// Portfolio Aggregator & Value Mapper - Strategic EV Cascade Mapping (F5 & F6)

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';


export class PortfolioComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedPortfolioKey = 'cyber'; // cyber, strategic, financial, regulatory
    this.selectedRiskId = null;
  }

  // Pre-configured Portfolio aggregations
  getPortfolios(risks) {
    return {
      cyber: {
        title: "Cyber, Tech & Infrastructure Portfolio",
        description: "Aggregated risk posture of SaaS datastore bypasses, third-party API dependencies, and SOC 2 Type II audit readiness logs.",
        categories: ["Cyber", "Technology", "AI"],
        risks: risks.filter(r => ["Cyber", "Technology", "AI"].includes(r.category))
      },
      strategic: {
        title: "Strategic & Growth Portfolio",
        description: "Aggregated risk posture of key person founder dependencies, IPO SEBI compliance milestones, and talent retention indices.",
        categories: ["Strategic", "People"],
        risks: risks.filter(r => ["Strategic", "People"].includes(r.category))
      },
      financial: {
        title: "Financial & Revenue Portfolio",
        description: "Aggregated risk posture of enterprise customer concentration, pricing seat models, and tax billing shocks.",
        categories: ["Financial"],
        risks: risks.filter(r => ["Financial"].includes(r.category))
      },
      regulatory: {
        title: "Legal & Regulatory Compliance Portfolio",
        description: "Aggregated risk posture of Indian DPDPA compliance, cross-border payments gateway limitations, and GST filings.",
        categories: ["Privacy", "Compliance", "Legal"],
        risks: risks.filter(r => ["Privacy", "Compliance", "Legal"].includes(r.category))
      }
    };
  }

  // Calculate portfolio metrics
  calculatePortfolioStats(portRisks) {
    if (!portRisks.length) return { score: 0, status: 'Within Appetite', class: 'within', aboveCount: 0 };

    const aboveCount = portRisks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const avgScore = Math.round(portRisks.reduce((sum, r) => sum + (r.residualScore || 0), 0) / portRisks.length);

    let status = 'Within Appetite';
    let statusClass = 'within';
    if (avgScore >= 16) {
      status = 'Above Appetite';
      statusClass = 'above';
    } else if (avgScore >= 11) {
      status = 'Near Appetite';
      statusClass = 'near';
    }

    return { score: avgScore, status, class: statusClass, aboveCount };
  }

  // Visual cascade data mapping: Risk -> Driver -> Objective -> EV Impact
  getCascadePath(risk) {
    if (!risk) return null;

    // Define standard mappings for seeded risks or fallback dynamically
    const mappings = {
      "risk-001": {
        driver: "Net Revenue Retention (NRR) / VIP accounts expansion",
        objective: "₹500 Cr ARR Revenue Milestones Expansion",
        evImpact: "Valuation multiple erosion during IPO | Sudden cash runway compression"
      },
      "risk-002": {
        driver: "Professional C-Suite operational delegation",
        objective: "IPO Readiness & Listing SEBI Alignment",
        evImpact: "Founder key person discount in Series C valuation | Institutional investor backing delay"
      },
      "risk-003": {
        driver: "Lead acquisition conversion & marketing API uptime",
        objective: "₹500 Cr ARR Revenue Milestones Expansion",
        evImpact: "Sudden sales pipeline freeze | Operational cash flow instability"
      },
      "risk-004": {
        driver: "Production multitenant DB encryption / Intrusion protection",
        objective: "Zero-Downtime InfoSec & SOC 2 Trust Assurance",
        evImpact: "Loss of customer trust & high churn | Massive regulatory fines & legal lawsuits"
      },
      "risk-005": {
        driver: "PII consent log auditor app integrations",
        objective: "Enterprise Customer Churn Prevention (<0.5%)",
        evImpact: "DPDPA regulatory fine of up to ₹250 Cr | Board reputation degradation"
      },
      "risk-006": {
        driver: "Weekly change management controls and SOC 2 automated checks",
        objective: "IPO Readiness & Listing SEBI Alignment",
        evImpact: "Enterprise sales pipeline bottleneck | Delayed IPO Sequence"
      }
    };

    const target = mappings[risk.id] || {
      driver: `SaaS core delivery & ${risk.category} operational continuity`,
      objective: "₹500 Cr ARR Revenue Milestones Expansion",
      evImpact: `Degradation of EBITDA target margins | Impairment of ${risk.category} enterprise value`
    };

    return {
      risk: `[${risk.id}] ${risk.title}`,
      ...target
    };
  }

  render(container) {
    const risks = this.state.risks || [];
    const portfolios = this.getPortfolios(risks);
    const activePort = portfolios[this.selectedPortfolioKey];
    
    // Default risk selection for value mapper
    if (!this.selectedRiskId && activePort.risks.length > 0) {
      this.selectedRiskId = activePort.risks[0].id;
    }
    
    const activeRisk = risks.find(r => r.id === this.selectedRiskId) || activePort.risks[0];
    const cascade = this.getCascadePath(activeRisk);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Macro Strategic View</span>
          <h1>Portfolio Aggregator & Value Mapper</h1>
          <p class="page-subtitle">Group enterprise risks into macro portfolios | Track cascading impacts from local risk elements to Enterprise Value</p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <!-- PORTFOLIO COUNTER CARDS -->
      <div class="ticker-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr; margin-bottom: 24px;">
        ${Object.entries(portfolios).map(([key, port]) => {
          const stats = this.calculatePortfolioStats(port.risks);
          const isSelected = this.selectedPortfolioKey === key;
          
          return `
            <div class="ticker-card clickable-portfolio ${isSelected ? 'selected-port-card' : ''}" 
                 data-key="${key}"
                 style="cursor: pointer; border-left: 4px solid var(--border-color); ${isSelected ? 'border-color: var(--color-indigo); background: rgba(0, 181, 181, 0.04);' : ''}">
              <span class="ticker-label" style="font-weight: 700; color: var(--text-primary); font-size:12px;">${key.toUpperCase()} Portfolio</span>
              <span class="ticker-value" style="font-size: 20px; font-family: var(--font-header); margin: 6px 0;">
                Avg: ${stats.score}
              </span>
              <span style="font-size: 10px; color: var(--text-secondary); display:flex; justify-content:space-between; width:100%;">
                <span>Risks: <strong>${port.risks.length}</strong></span>
                <span class="status-badge ${stats.class}" style="font-size: 8px; padding:1px 5px;">${stats.status}</span>
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="register-layout">
        
        <!-- LEFT: PORTFOLIO LEDGER LIST -->
        <div class="details-panel" style="flex: 1.2;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">${activePort.title}</h3>
            <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
              ${activePort.description}
            </p>

            <div style="display:flex; flex-direction:column; gap:8px;">
              ${activePort.risks.map(r => {
                const isSelected = r.id === this.selectedRiskId;
                return `
                  <div class="glass-panel clickable-risk ${isSelected ? 'selected' : ''}" 
                       data-id="${r.id}"
                       style="cursor:pointer; padding: 12px; border:1px solid ${isSelected ? 'var(--color-indigo)' : 'var(--border-color)'};">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 4px;">
                      <strong style="font-size:12px; color:var(--text-primary);">[${r.id}] ${r.title}</strong>
                      <span class="status-badge ${r.appetiteStatus === 'Above Appetite' ? 'above' : r.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:8px; padding: 1px 4px;">
                        ${r.residualScore}
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-secondary);">
                      <span>Owner: ${r.owner}</span>
                      <span style="font-weight:600;">Velocity: ${r.timeToImpact || 'Moderate'}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: THE ENTERPRISE VALUE CASCADE MAP (F5) -->
        <div class="details-panel" style="flex: 2;">
          <div class="glass-panel" style="min-height: 380px;">
            <h3 class="dashboard-card-title">Enterprise Value (EV) Impact Map</h3>
            <p style="font-size:11px; color:var(--text-secondary); line-height:1.3; margin-bottom:20px;">
              Visualize how this specific local risk element filters up, threatens operational drivers, objectives, and finally, damages Enterprise Value.
            </p>

            ${cascade ? `
              <!-- CASCADE FLOWCHART PANELS -->
              <div class="cascade-flow-wrap" style="display:flex; flex-direction:column; gap:20px; position:relative;">
                
                <!-- Step 1: Risk Node -->
                <div class="cascade-step-card ai-explain-trigger" data-explain-type="risk" data-explain-id="${activeRisk.id}" style="position:relative; padding:16px; border:1px solid var(--color-above-appetite); background: rgba(225,29,72,0.01); border-radius:10px; cursor:pointer;">
                  <span class="profile-role-badge above" style="font-size: 8px; margin-bottom: 4px;">1. Threat Vector Element <span style="font-size:9px;margin-left:4px;">(Click to Explain)</span></span>
                  <strong style="color:var(--text-primary); font-size:13px; display:block;">${cascade.risk}</strong>
                  <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                    Residual Score: <strong>${activeRisk.residualScore}</strong> | Status: <strong style="color:var(--color-above-appetite);">${activeRisk.appetiteStatus}</strong>
                  </div>
                  
                  <!-- Connector Arrow -->
                  <div style="position:absolute; left:50%; transform: translateX(-50%); bottom:-32px; width:2px; height:32px; background:var(--color-indigo); z-index: 2;">
                    <div style="position:absolute; bottom:0; left:50%; transform: translateX(-50%) rotate(45deg); border: solid var(--color-indigo); border-width: 0 2px 2px 0; padding: 3px;"></div>
                  </div>
                </div>

                <!-- Step 2: Business Driver -->
                <div class="cascade-step-card" style="position:relative; padding:16px; border:1px solid var(--color-near-appetite); background: rgba(217,119,6,0.01); border-radius:10px; margin-top:12px;">
                  <span class="profile-role-badge near" style="font-size: 8px; margin-bottom: 4px;">2. Operational Business Driver Threatened</span>
                  <strong style="color:var(--text-primary); font-size:13px; display:block;">${cascade.driver}</strong>
                  
                  <!-- Connector Arrow -->
                  <div style="position:absolute; left:50%; transform: translateX(-50%); bottom:-32px; width:2px; height:32px; background:var(--color-indigo); z-index: 2;">
                    <div style="position:absolute; bottom:0; left:50%; transform: translateX(-50%) rotate(45deg); border: solid var(--color-indigo); border-width: 0 2px 2px 0; padding: 3px;"></div>
                  </div>
                </div>

                <!-- Step 3: Strategic Objective -->
                <div class="cascade-step-card" style="position:relative; padding:16px; border:1px solid var(--color-indigo); background: rgba(0, 181, 181, 0.01); border-radius:10px; margin-top:12px;">
                  <span class="profile-role-badge indigo" style="font-size: 8px; margin-bottom: 4px;">3. Vulnerable Corporate Goal Alignment</span>
                  <strong style="color:var(--text-primary); font-size:13px; display:block;">${cascade.objective}</strong>
                  
                  <!-- Connector Arrow -->
                  <div style="position:absolute; left:50%; transform: translateX(-50%); bottom:-32px; width:2px; height:32px; background:var(--color-indigo); z-index: 2;">
                    <div style="position:absolute; bottom:0; left:50%; transform: translateX(-50%) rotate(45deg); border: solid var(--color-indigo); border-width: 0 2px 2px 0; padding: 3px;"></div>
                  </div>
                </div>

                <!-- Step 4: Enterprise Value Impact -->
                <div class="cascade-step-card" style="padding:16px; border:1px solid #1E293B; background: rgba(30,41,59,0.01); border-radius:10px; margin-top:12px;">
                  <span class="profile-role-badge" style="font-size: 8px; margin-bottom: 4px; background: #1E293B; color:white;">4. Ultimate Enterprise Value Impact</span>
                  <strong style="color:#1E293B; font-size:13px; display:block; font-weight:700;">${cascade.evImpact}</strong>
                </div>

              </div>
            ` : `
              <div style="text-align:center; color:var(--text-muted); padding-top: 100px;">
                Select a portfolio risk on the left to map its cascading impact path to Enterprise Value.
              </div>
            `}

          </div>
        </div>

      </div>
    `;

    this.bindEvents(container, portfolios);
  }

  bindEvents(container, portfolios) {
    // 1. Click portfolio counter card
    const cards = container.querySelectorAll('.clickable-portfolio');
    cards.forEach(c => {
      c.addEventListener('click', () => {
        this.selectedPortfolioKey = c.dataset.key;
        // Reset selected risk to first in new portfolio
        const risks = portfolios[this.selectedPortfolioKey].risks;
        this.selectedRiskId = risks.length ? risks[0].id : null;
        this.render(container);
      });
    });

    // 2. Click individual risk in ledger
    const riskPills = container.querySelectorAll('.clickable-risk');
    riskPills.forEach(p => {
      p.addEventListener('click', () => {
        this.selectedRiskId = p.dataset.id;
        this.render(container);
      });
    });

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const type = trigger.dataset.explainType;
        const id = trigger.dataset.explainId;
        
        let item = null;
        if (type === 'risk') {
          item = this.state.risks.find(r => r.id === id);
        }
        
        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });

    // Render page-level AI insights card
    const insightContainer = container.querySelector('#ai-insight-container');
    if (insightContainer) {
      AIInsightService.renderPageInsightCard('portfolio', insightContainer, this.state);
    }
  }
}
