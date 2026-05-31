// Risk Relationship Network Graph Component - Visualizing Compounding Cascades

export class NetworkComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedNodeId = null;
    
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

  render(container) {
    const risks = this.state.risks;
    const settings = this.state.settings;

    // Filter out coordinates for any risks that have been deleted
    const activeNodes = risks.filter(r => this.nodePositions[r.id]);
    
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

      <div class="register-layout">
        
        <!-- LEFT SCREEN: INTERACTIVE SVG NETWORK CONTAINER -->
        <div class="details-panel">
          <div class="glass-panel" style="padding: 10px;">
            <div class="network-container">
              <svg class="network-svg" viewBox="0 0 800 360" id="risk-network-svg">
                <!-- SVG MARKER FOR LINE ARROWS -->
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(0,0,0,0.15)" />
                  </marker>
                  <marker id="arrow-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-indigo)" />
                  </marker>
                </defs>

                <!-- 1. DRAW CONNECTION LINES (LINKS) -->
                ${activeNodes.flatMap(r => {
                  const parentPos = this.nodePositions[r.id];
                  const childIds = r.childRiskIds || [];
                  const relatedIds = r.relatedRiskIds || [];

                  const childLines = childIds.map(cid => {
                    const childPos = this.nodePositions[cid];
                    if (!childPos) return '';
                    
                    const isHighlighted = this.selectedNodeId === r.id && activeChainIds.has(cid);
                    
                    return `
                      <line class="network-link ${isHighlighted ? 'active-chain' : ''}" 
                            x1="${parentPos.x}" y1="${parentPos.y}" 
                            x2="${childPos.x}" y2="${childPos.y}"
                            stroke="${isHighlighted ? 'var(--color-indigo)' : 'rgba(0,0,0,0.08)'}" 
                            stroke-width="${isHighlighted ? 2.5 : 1.2}" 
                            marker-end="${isHighlighted ? 'url(#arrow-highlight)' : 'url(#arrow)'}" />
                    `;
                  });

                  const relatedLines = relatedIds.map(rid => {
                    const relPos = this.nodePositions[rid];
                    if (!relPos) return '';
                    // Prevent duplicate double lines
                    if (r.id > rid) return ''; 

                    const isHighlighted = this.selectedNodeId === r.id || this.selectedNodeId === rid;

                    return `
                      <line class="network-link" 
                            x1="${parentPos.x}" y1="${parentPos.y}" 
                            x2="${relPos.x}" y2="${relPos.y}"
                            stroke="${isHighlighted ? 'var(--color-indigo)' : 'rgba(0,0,0,0.05)'}" 
                            stroke-width="${isHighlighted ? 1.5 : 0.8}" 
                            stroke-dasharray="2 3" />
                    `;
                  });

                  return [...childLines, ...relatedLines];
                }).join('')}

                <!-- 2. DRAW GRAPH NODES -->
                ${activeNodes.map(r => {
                  const pos = this.nodePositions[r.id];
                  
                  // Color mapped to residual score appetite status
                  let fill = 'var(--color-within-appetite)';
                  let glow = 'var(--glow-within-appetite)';
                  if (r.appetiteStatus === 'Above Appetite') {
                    fill = 'var(--color-above-appetite)';
                    glow = 'var(--glow-above-appetite)';
                  } else if (r.appetiteStatus === 'Near Appetite') {
                    fill = 'var(--color-near-appetite)';
                    glow = 'var(--glow-near-appetite)';
                  }

                  // Radius mapped to risk residual score
                  const rScore = r.residualScore || 20;
                  const radius = Math.max(10, Math.min(24, 10 + (rScore / 5)));

                  const isSelected = this.selectedNodeId === r.id;
                  const isInChain = activeChainIds.has(r.id) && this.selectedNodeId !== r.id;

                  return `
                    <g class="network-node ${isSelected ? 'selected' : ''} ${isInChain ? 'active-chain' : ''}" 
                       data-id="${r.id}"
                       transform="translate(${pos.x}, ${pos.y})">
                      <circle r="${radius}" 
                              fill="#FFFFFF" 
                              stroke="${fill}" 
                              stroke-width="${isSelected ? 3 : 1.5}"
                              style="filter: drop-shadow(0 0 6px ${glow});" />
                      <circle r="${radius - 5}" 
                              fill="${fill}" 
                              opacity="${isSelected ? 0.9 : 0.3}" />
                      
                      <!-- Node Label -->
                      <text y="${radius + 14}" text-anchor="middle" fill="${isSelected ? 'white' : 'var(--text-secondary)'}">
                        ${r.title.split(' ').slice(0, 2).join(' ')}..
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
                <h3 style="font-size:18px;line-height:1.2;margin-bottom:8px;">${selectedRisk.title}</h3>
                
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
  }
}
