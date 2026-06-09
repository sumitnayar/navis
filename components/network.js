// Risk Relationship Network Graph Component - Visualizing Compounding Cascades

import { AIInsightService } from '../services/aiInsightService.js';

export class NetworkComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedNodeId = null;
    this.isExpanded = false;
    
    // Explicit hierarchical screen coordinates (width: 800, height: 380) for seed data
    // Strategic (Top) -> Operational (Middle) -> Tactical (Bottom)
    this.nodePositions = {
      "risk-013": { x: 400, y: 50 },  // IPO Readiness Gaps (Parent Strategic Hub)
      "risk-002": { x: 220, y: 120 }, // Founder Dependency
      "risk-001": { x: 380, y: 180 }, // Customer Concentration
      "risk-003": { x: 520, y: 120 }, // Platform & API Dependency
      "risk-004": { x: 650, y: 180 }, // Cyber Security Breach
      "risk-011": { x: 150, y: 50 },  // Regulatory Compliance Payments
      "risk-008": { x: 380, y: 300 }, // Pricing Vulnerability
      "risk-009": { x: 220, y: 250 }, // Talent Attrition
      "risk-005": { x: 120, y: 180 }, // DPDPA Non-compliance
      "risk-006": { x: 550, y: 250 }, // SOC 2 Gaps
      "risk-007": { x: 520, y: 250 }, // Vendor Lock-in
      "risk-010": { x: 720, y: 120 }  // AI Hallucination
    };
  }

  // Calculate downstream dependency cascades
  getDownstreamChain(nodeId, risks, visited = new Set()) {
    if (!nodeId || visited.has(nodeId)) return [];
    visited.add(nodeId);

    const risk = risks.find(r => r.id === nodeId);
    if (!risk) return [];

    let chain = [nodeId];
    const children = risk.childRiskIds || [];
    children.forEach(childId => {
      chain = [...chain, ...this.getDownstreamChain(childId, risks, visited)];
    });
    return chain;
  }

  getGraphRisks(risks) {
    const demoRisks = risks.filter(r => String(r.id || '').startsWith('demo-trk-risk-'));
    return demoRisks.length ? demoRisks : risks;
  }

  getNodePositions(risks) {
    const positions = {};
    const useGeneratedLayout = risks.length > 16 || risks.some(r => String(r.id || '').startsWith('demo-trk-risk-'));

    if (!useGeneratedLayout) {
      risks.forEach((risk) => {
        if (this.nodePositions[risk.id]) {
          positions[risk.id] = this.nodePositions[risk.id];
        }
      });
    }

    const dynamicRisks = useGeneratedLayout ? risks : risks.filter(r => !positions[r.id]);
    const sorted = [...dynamicRisks].sort((a, b) => {
      const scoreDelta = (b.residualScore || 0) - (a.residualScore || 0);
      if (scoreDelta) return scoreDelta;
      return String(a.title).localeCompare(String(b.title));
    });

    const columns = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(sorted.length || 1))));
    const rows = Math.max(1, Math.ceil((sorted.length || 1) / columns));
    const xStep = columns === 1 ? 0 : 660 / (columns - 1);
    const yStep = rows === 1 ? 0 : 270 / (rows - 1);

    sorted.forEach((risk, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      positions[risk.id] = {
        x: 70 + (col * xStep),
        y: 44 + (row * yStep)
      };
    });

    return positions;
  }

  render(container) {
    const risks = this.state.risks;
    const settings = this.state.settings;
    const graphRisks = this.getGraphRisks(risks);
    const graphPositions = this.getNodePositions(graphRisks);

    // Filter out coordinates for any risks that have been deleted
    const activeNodes = graphRisks.filter(r => graphPositions[r.id]);
    
    // Find selected risk details
    const selectedRisk = risks.find(r => r.id === this.selectedNodeId);

    // Calculate active chain highlights if a node is selected
    const activeChainIds = new Set(this.getDownstreamChain(this.selectedNodeId, risks));

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">System Risk Interdependency Map</span>
          <h1>Strategic Cascade Visualizer</h1>
          <p class="page-subtitle">Visualizing systemic relationship meshes: <strong>Parent → Related → Downstream Child Chains</strong></p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <div class="register-layout ${this.isExpanded ? 'map-expanded' : ''}">
        
        <!-- LEFT SCREEN: INTERACTIVE SVG NETWORK CONTAINER -->
        <div class="details-panel">
          <div class="glass-panel" style="padding: 10px;">
            <div class="network-container">
              <!-- ABSOLUTE EXPAND / COLLAPSE TOGGLE BUTTON -->
              <button id="btn-toggle-expand" class="btn btn-secondary btn-small" style="position: absolute; top: 12px; right: 12px; z-index: 10; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border-radius: 50%; background: var(--bg-secondary); border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.05); color: var(--text-secondary);" title="${this.isExpanded ? 'Collapse Map' : 'Expand Map'}">
                ${this.isExpanded ? `
                  <!-- Collapse Cross-out Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:16px;height:16px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ` : `
                  <!-- Expand Arrow Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:16px;height:16px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                  </svg>
                `}
              </button>

              <svg class="network-svg" viewBox="0 0 800 360" id="risk-network-svg">
                <!-- SVG MARKER FOR LINE ARROWS -->
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(71, 85, 105, 0.25)" />
                  </marker>
                  <marker id="arrow-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-indigo)" />
                  </marker>
                </defs>

                <!-- 1. DRAW CONNECTION LINES (LINKS) -->
                ${activeNodes.flatMap(r => {
                  const parentPos = graphPositions[r.id];
                  const childIds = r.childRiskIds || [];
                  const relatedIds = r.relatedRiskIds || [];

                  const childLines = childIds.map(cid => {
                    const childPos = graphPositions[cid];
                    if (!childPos) return '';
                    
                    const isHighlighted = this.selectedNodeId === r.id && activeChainIds.has(cid);
                    
                    if (isHighlighted) {
                      return `
                        <!-- Glowing path behind -->
                        <line x1="${parentPos.x}" y1="${parentPos.y}" 
                              x2="${childPos.x}" y2="${childPos.y}" 
                              stroke="rgba(0, 181, 181, 0.28)" 
                              stroke-width="7" 
                              stroke-linecap="round" />
                        <!-- Primary active path (SOLID and prominent!) -->
                        <line class="network-link active-chain" 
                              x1="${parentPos.x}" y1="${parentPos.y}" 
                              x2="${childPos.x}" y2="${childPos.y}"
                              stroke="var(--color-indigo)" 
                              stroke-width="3" 
                              marker-end="url(#arrow-highlight)" />
                      `;
                    }

                    return `
                      <line class="network-link direct" 
                            x1="${parentPos.x}" y1="${parentPos.y}" 
                            x2="${childPos.x}" y2="${childPos.y}"
                            stroke="rgba(71, 85, 105, 0.22)" 
                            stroke-width="1.1" 
                            marker-end="url(#arrow)" />
                    `;
                  });

                  const relatedLines = relatedIds.map(rid => {
                    const relPos = graphPositions[rid];
                    if (!relPos) return '';
                    // Prevent duplicate double lines
                    if (r.id > rid) return ''; 

                    const isHighlighted = this.selectedNodeId === r.id || this.selectedNodeId === rid;

                    if (isHighlighted) {
                      return `
                        <!-- Glowing path behind -->
                        <line x1="${parentPos.x}" y1="${parentPos.y}" 
                              x2="${relPos.x}" y2="${relPos.y}" 
                              stroke="rgba(0, 181, 181, 0.2)" 
                              stroke-width="5.5" 
                              stroke-linecap="round" />
                        <!-- Primary active dashed path -->
                        <line class="network-link related active-chain" 
                              x1="${parentPos.x}" y1="${parentPos.y}" 
                              x2="${relPos.x}" y2="${relPos.y}"
                              stroke="var(--color-indigo)" 
                              stroke-width="2.2" />
                      `;
                    }

                    return `
                      <line class="network-link related" 
                            x1="${parentPos.x}" y1="${parentPos.y}" 
                            x2="${relPos.x}" y2="${relPos.y}"
                            stroke="rgba(148, 163, 184, 0.22)" 
                            stroke-width="1.0" />
                    `;
                  });

                  return [...childLines, ...relatedLines];
                }).join('')}

                <!-- 2. DRAW GRAPH NODES -->
                ${activeNodes.map(r => {
                  const pos = graphPositions[r.id];
                  
                  // Color mapped to residual score appetite status with prominent glows
                  let fill = 'var(--color-within-appetite)';
                  let glow = 'rgba(5, 150, 105, 0.35)';
                  if (r.appetiteStatus === 'Above Appetite') {
                    fill = 'var(--color-above-appetite)';
                    glow = 'rgba(225, 29, 72, 0.4)';
                  } else if (r.appetiteStatus === 'Near Appetite') {
                    fill = 'var(--color-near-appetite)';
                    glow = 'rgba(217, 119, 6, 0.35)';
                  }

                  // Radius mapped to risk residual score
                  const rScore = r.residualScore || 20;
                  const radius = Math.max(10, Math.min(24, 10 + (rScore / 5)));

                  const isSelected = this.selectedNodeId === r.id;
                  const isInChain = activeChainIds.has(r.id) && this.selectedNodeId !== r.id;

                  // Extract cleaned and stacked descriptive label lines to prevent horizontal overlap
                  const getLines = () => {
                    const cleanTitle = r.title.replace(/^\[DEMO\s+[^\]]+\]\s*/i, '').trim();
                    const words = cleanTitle.split(' ');
                    let line1 = '';
                    let line2 = '';
                    if (words.length <= 2) {
                      line1 = words.join(' ');
                    } else {
                      if (words[0].length + words[1].length < 13) {
                        line1 = words[0] + ' ' + words[1];
                        line2 = words.slice(2, 4).join(' ') + (words.length > 4 ? '..' : '');
                      } else {
                        line1 = words[0];
                        line2 = words.slice(1, 3).join(' ') + (words.length > 3 ? '..' : '');
                      }
                    }
                    return { line1, line2 };
                  };
                  const { line1, line2 } = getLines();

                  return `
                    <g class="network-node ${isSelected ? 'selected' : ''} ${isInChain ? 'active-chain' : ''}" 
                       data-id="${r.id}"
                       transform="translate(${pos.x}, ${pos.y})">
                      <circle r="${radius}" 
                              fill="#FFFFFF" 
                              stroke="${fill}" 
                              stroke-width="${isSelected ? 3.5 : 2.2}"
                              style="filter: drop-shadow(0 0 6px ${glow});" />
                      <circle r="${radius - 5}" 
                              fill="${fill}" 
                              opacity="${isSelected ? 0.95 : 0.55}" />
                      
                      <!-- Text Background Halo Outline (For ultimate 100% readability) -->
                      <text y="${radius + 15}" 
                            text-anchor="middle" 
                            stroke="#FFFFFF" 
                            stroke-width="3.5px" 
                            stroke-linejoin="round" 
                            fill="none" 
                            opacity="0.95"
                            style="font-weight: ${isSelected ? '700' : '600'}; font-size: 10px; font-family: var(--font-header); line-height: 1.2;">
                        <tspan x="0" dy="0">${line1}</tspan>
                        ${line2 ? `<tspan x="0" dy="10">${line2}</tspan>` : ''}
                      </text>

                      <!-- Node Label Solid Text -->
                      <text y="${radius + 15}" 
                            text-anchor="middle" 
                            fill="${isSelected ? 'var(--color-indigo)' : 'var(--text-primary)'}"
                            style="font-weight: ${isSelected ? '700' : '600'}; font-size: 10px; font-family: var(--font-header); line-height: 1.2;">
                        <tspan x="0" dy="0">${line1}</tspan>
                        ${line2 ? `<tspan x="0" dy="10">${line2}</tspan>` : ''}
                      </text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
          </div>
        </div>

        <!-- RIGHT SCREEN: SELECTED CASCADE RISK DETAILS -->
        <div class="details-panel no-print">
          <div class="glass-panel" style="min-height:380px;display:flex;flex-direction:column;justify-content:space-between;">
            ${selectedRisk ? `
              <div>
                <span class="profile-role-badge" style="margin-bottom:6px;">${selectedRisk.category}</span>
                <h3 style="font-size:18px;line-height:1.2;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
                  <span>${selectedRisk.title}</span>
                  <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="risk" data-explain-id="${selectedRisk.id}" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                    </svg>
                  </button>
                </h3>
                
                <div style="display:flex;gap:10px;margin-bottom:12px;">
                  <span class="status-badge ${selectedRisk.appetiteStatus === 'Above Appetite' ? 'above' : selectedRisk.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:10px;">
                    Score: ${selectedRisk.residualScore}
                  </span>
                  <span class="trend-tag ${selectedRisk.trend === 'Deteriorating' ? 'deteriorating' : selectedRisk.trend === 'Improving' ? 'improving' : 'stable'}" style="font-size:11px;">
                    ${selectedRisk.trend === 'Deteriorating' ? '↑ Deteriorating' : selectedRisk.trend === 'Improving' ? '↓ Improving' : '• Stable'}
                  </span>
                </div>

                <p style="font-size:12px;color:var(--text-secondary);line-height:1.4;margin-bottom:16px;">
                  ${selectedRisk.description}
                </p>

                <!-- Compounding Cascades Panel -->
                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:16px;">
                  <h4 style="font-size:11px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Compound System Chain</h4>
                  
                  <div style="font-size:11px;line-height:1.4;">
                    ${selectedRisk.parentRiskId ? `
                      <div style="color:var(--text-secondary);">
                        <strong style="color:var(--text-primary);">Feeds From (Parent):</strong> 
                        ${risks.find(r => r.id === selectedRisk.parentRiskId)?.title || 'N/A'}
                      </div>
                      <div style="margin:4px 0;color:var(--text-muted);">↓</div>
                    ` : ''}
                    
                    <div style="color:var(--color-indigo);font-weight:600;">
                      Active Risk Node: ${selectedRisk.title}
                    </div>
                    
                    ${selectedRisk.childRiskIds?.length ? `
                      <div style="margin:4px 0;color:var(--text-muted);">↓</div>
                      <div style="color:var(--text-secondary);">
                        <strong style="color:var(--text-primary);">Triggers (Downstream Children):</strong> 
                        <ul style="margin-top:2px;padding-left:14px;color:var(--color-above-appetite);">
                          ${selectedRisk.childRiskIds.map(cid => `
                            <li>${risks.find(r => r.id === cid)?.title || 'N/A'}</li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Controls Mapped -->
                ${selectedRisk.controls?.length ? `
                  <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:6px;">Mitigating Controls</h4>
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    ${selectedRisk.controls.map(c => `
                      <div style="font-size:11px;padding:4px 8px;background:var(--bg-tertiary);border-radius:4px;display:flex;justify-content:space-between;">
                        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">${c.name}</span>
                        <span style="color:var(--color-within-appetite);font-weight:600;">${c.effectiveness}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <!-- Drill-down register detail page link -->
              <button class="btn btn-secondary btn-small" id="btn-inspect-register" style="margin-top:16px;width:100%;justify-content:center;">
                Inspect in Risk Register
              </button>
            ` : `
              <div style="text-align:center;color:var(--text-muted);padding-top:120px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:48px;height:48px;margin:0 auto 12px;opacity:0.3;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Select a risk node in the network to inspect cascading triggers and mitigating controls.
              </div>
            `}
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const nodes = container.querySelectorAll('.network-node');
    nodes.forEach(n => {
      n.addEventListener('click', () => {
        const id = n.dataset.id;
        // If clicked again, deselect
        this.selectedNodeId = (this.selectedNodeId === id) ? null : id;
        this.render(container);
      });
    });

    // Toggle Expand/Collapse Map
    const toggleExpandBtn = container.querySelector('#btn-toggle-expand');
    if (toggleExpandBtn) {
      toggleExpandBtn.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        this.render(container);
      });
    }

    // Inspect in Register link
    const inspectBtn = container.querySelector('#btn-inspect-register');
    if (inspectBtn && this.selectedNodeId) {
      inspectBtn.addEventListener('click', () => {
        // Change tab to Risk Register
        this.onStateChange({
          activeTab: 'register',
          editingRiskId: this.selectedNodeId // Seed active edit in register
        });
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
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
      AIInsightService.renderPageInsightCard('network', insightContainer, this.state);
    }
  }
}
