// Risk Relationship Network Graph Component - Visualizing Compounding Cascades
import { AIInsightService } from '../services/aiInsightService.js';

export class NetworkComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.isExpanded = false;

    // Zoom/Pan/Drag coordinates
    this.zoomScale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Time Playback
    this.timeStep = 'today'; // 'today', '30', '90', '180'

    // Boardroom presentation mode
    this.isBoardMode = false;

    // Parse deep-link param
    const _params = new URLSearchParams(window.location.search);
    const _riskId = _params.get('riskId');
    if (_riskId) {
      this.selectedNodeId = _riskId;
      this._fromDashboard = true;
    } else {
      this._fromDashboard = false;
    }

    // Four layer definition
    this.layers = {
      1: { name: 'Threat Vector', color: '#C0392B' },
      2: { name: 'Operational Drivers', color: '#C2610E' },
      3: { name: 'Strategic Objectives', color: '#00B5B5' }, // Blue/Teal Objective nodes
      4: { name: 'Enterprise Value', color: '#1A7A4A' }
    };

    // Node classifications and layers
    this.layerNodes = [
      // Layer 1: Threat Vectors
      { id: 'risk-002', type: 'risk', layer: 1, label: 'Founder Dependency' },
      { id: 'risk-003', type: 'risk', layer: 1, label: 'Platform Dependency' },
      { id: 'risk-004', type: 'risk', layer: 1, label: 'Cyber Security Breach' },
      { id: 'risk-010', type: 'risk', layer: 1, label: 'AI Governance' },
      { id: 'risk-011', type: 'risk', layer: 1, label: 'Regulatory Shocks' },
      
      // Layer 2: Operational Drivers
      { id: 'risk-001', type: 'risk', layer: 2, label: 'Customer Concentration' },
      { id: 'risk-008', type: 'risk', layer: 2, label: 'Pricing Vulnerability' },
      { id: 'risk-009', type: 'risk', layer: 2, label: 'Talent Attrition' },
      { id: 'risk-007', type: 'risk', layer: 2, label: 'Vendor Lock-in' },
      { id: 'risk-006', type: 'risk', layer: 2, label: 'SOC 2 Gaps' },
      { id: 'risk-005', type: 'risk', layer: 2, label: 'DPDPA Compliance' },
      
      // Layer 3: Strategic Objectives
      { id: 'obj-growth', type: 'objective', layer: 3, label: '₹500 Cr ARR' },
      { id: 'obj-retention', type: 'objective', layer: 3, label: 'Churn Prevention' },
      { id: 'obj-ebitda', type: 'objective', layer: 3, label: 'EBITDA Margin' },
      { id: 'obj-cyber', type: 'objective', layer: 3, label: 'InfoSec Trust' },
      { id: 'obj-ipo', type: 'objective', layer: 3, label: 'IPO Readiness' },
      
      // Layer 4: Enterprise Value
      { id: 'val-revenue', type: 'value', layer: 4, label: 'Revenue' },
      { id: 'val-reputation', type: 'value', layer: 4, label: 'Reputation' },
      { id: 'val-valuation', type: 'value', layer: 4, label: 'Valuation' },
      { id: 'val-compliance', type: 'value', layer: 4, label: 'Compliance' }
    ];

    // Causal links definition (from left to right propagation)
    this.links = [
      // Layer 1 -> Layer 2
      { source: 'risk-002', target: 'risk-009', type: 'direct' },
      { source: 'risk-002', target: 'risk-001', type: 'direct' },
      { source: 'risk-003', target: 'risk-007', type: 'direct' },
      { source: 'risk-004', target: 'risk-006', type: 'direct' },
      { source: 'risk-011', target: 'risk-005', type: 'direct' },
      { source: 'risk-001', target: 'risk-008', type: 'direct' },
      { source: 'risk-002', target: 'risk-001', type: 'indirect' },
      { source: 'risk-010', target: 'risk-006', type: 'direct' },

      // Layer 2 -> Layer 3
      { source: 'risk-001', target: 'obj-growth', type: 'direct' },
      { source: 'risk-001', target: 'obj-retention', type: 'direct' },
      { source: 'risk-008', target: 'obj-growth', type: 'direct' },
      { source: 'risk-008', target: 'obj-ebitda', type: 'direct' },
      { source: 'risk-009', target: 'obj-ebitda', type: 'direct' },
      { source: 'risk-006', target: 'obj-ipo', type: 'direct' },
      { source: 'risk-006', target: 'obj-cyber', type: 'direct' },
      { source: 'risk-005', target: 'obj-ipo', type: 'direct' },
      { source: 'risk-002', target: 'obj-ipo', type: 'direct' },
      { source: 'risk-007', target: 'obj-cyber', type: 'direct' },

      // Layer 3 -> Layer 4
      { source: 'obj-growth', target: 'val-revenue', type: 'direct' },
      { source: 'obj-retention', target: 'val-revenue', type: 'direct' },
      { source: 'obj-retention', target: 'val-reputation', type: 'direct' },
      { source: 'obj-cyber', target: 'val-reputation', type: 'direct' },
      { source: 'obj-cyber', target: 'val-compliance', type: 'direct' },
      { source: 'obj-ipo', target: 'val-valuation', type: 'direct' },
      { source: 'obj-ipo', target: 'val-compliance', type: 'direct' },
      { source: 'obj-ebitda', target: 'val-valuation', type: 'direct' }
    ];
  }

  clearFilters() {
    this.selectedNodeId = null;
    this._fromDashboard = false;
  }

  // Calculate downstream propagation chain from starting node
  getDownstreamChain(nodeId, visited = new Set()) {
    if (!nodeId || visited.has(nodeId)) return [];
    visited.add(nodeId);

    let chain = [nodeId];
    const children = this.links
      .filter(link => link.source === nodeId)
      .map(link => link.target);

    children.forEach(childId => {
      chain = [...chain, ...this.getDownstreamChain(childId, visited)];
    });
    return chain;
  }

  // Calculate upstream root cause ancestors
  getUpstreamAncestors(nodeId, visited = new Set()) {
    if (!nodeId || visited.has(nodeId)) return [];
    visited.add(nodeId);

    let ancestors = [nodeId];
    const parents = this.links
      .filter(link => link.target === nodeId)
      .map(link => link.source);

    parents.forEach(parentId => {
      ancestors = [...ancestors, ...this.getUpstreamAncestors(parentId, visited)];
    });
    return ancestors;
  }

  // Node Positions: strictly vertical layout per column layer
  getNodePositions(canvasWidth = 720, canvasHeight = 380) {
    const paddingLeft = 48;
    const paddingRight = 48;
    const paddingTop = 32;
    const paddingBottom = 32;
    const horizontalDistance = 180;
    const verticalDistance = 60;

    const positions = {};

    // Group nodes by layer
    const layerGroups = { 1: [], 2: [], 3: [], 4: [] };
    this.layerNodes.forEach(node => {
      layerGroups[node.layer].push(node);
    });

    // Calculate layer horizontal columns and vertical centering
    for (let l = 1; l <= 4; l++) {
      const group = layerGroups[l];
      const count = group.length;
      const x = paddingLeft + (l - 1) * horizontalDistance;
      
      const occupiedHeight = (count - 1) * verticalDistance;
      const yStart = paddingTop + (canvasHeight - paddingTop - paddingBottom - occupiedHeight) / 2;

      group.forEach((node, index) => {
        positions[node.id] = {
          x: x,
          y: yStart + index * verticalDistance
        };
      });
    }

    return positions;
  }

  // Dynamic score calculator based on current time playback step
  calculateDynamicScores() {
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];

    const scores = {};
    const statuses = {};
    const trends = {};

    // 1. Process Risks
    this.layerNodes.filter(n => n.type === 'risk').forEach(node => {
      const risk = risks.find(r => r.id === node.id);
      let baseScore = risk ? risk.residualScore : 30;
      let trendVal = risk ? risk.trend : 'Stable';

      if (this.timeStep === '30') {
        if (trendVal === 'Deteriorating') baseScore += 5;
        if (trendVal === 'Improving') baseScore -= 3;
      } else if (this.timeStep === '90') {
        if (trendVal === 'Deteriorating') baseScore += 10;
        if (trendVal === 'Improving') baseScore -= 6;
      } else if (this.timeStep === '180') {
        if (trendVal === 'Deteriorating') baseScore += 16;
        if (trendVal === 'Improving') baseScore -= 9;
      }

      baseScore = Math.max(10, Math.min(95, baseScore));
      scores[node.id] = baseScore;
      trends[node.id] = trendVal;

      if (baseScore >= 45) {
        statuses[node.id] = 'Above Appetite';
      } else if (baseScore >= 25) {
        statuses[node.id] = 'Near Appetite';
      } else {
        statuses[node.id] = 'Within Appetite';
      }
    });

    // 2. Process Strategic Objectives (threat exposure mapped from connected risks)
    this.layerNodes.filter(n => n.type === 'objective').forEach(node => {
      const obj = objectives.find(o => o.id === node.id);
      
      // Determine threatened exposure score from connected inputs
      const incomingRiskIds = this.links
        .filter(l => l.target === node.id && l.type === 'direct')
        .map(l => l.source);
      
      const maxScore = incomingRiskIds.reduce((max, rid) => {
        return Math.max(max, scores[rid] || 0);
      }, 20);

      scores[node.id] = maxScore;
      trends[node.id] = obj ? obj.status : 'On Track';

      if (maxScore >= 45) {
        statuses[node.id] = 'Critical Gaps';
      } else if (maxScore >= 25) {
        statuses[node.id] = 'At Risk';
      } else {
        statuses[node.id] = 'On Track';
      }
    });

    // 3. Process Enterprise Value Categories (exposure average of connected objectives)
    this.layerNodes.filter(n => n.type === 'value').forEach(node => {
      const incomingObjIds = this.links
        .filter(l => l.target === node.id)
        .map(l => l.source);

      const avgScore = incomingObjIds.reduce((sum, oid) => sum + (scores[oid] || 0), 0) / (incomingObjIds.length || 1);
      const finalScore = Math.round(avgScore);
      scores[node.id] = finalScore;

      if (finalScore >= 45) {
        statuses[node.id] = 'Critical';
      } else if (finalScore >= 25) {
        statuses[node.id] = 'Warning';
      } else {
        statuses[node.id] = 'Safe';
      }
    });

    return { scores, statuses, trends };
  }

  // Calculate Node Centrality (number of input + output connections)
  getNodeCentrality() {
    const centrality = {};
    this.layerNodes.forEach(n => {
      centrality[n.id] = 0;
    });

    this.links.forEach(l => {
      if (centrality[l.source] !== undefined) centrality[l.source]++;
      if (centrality[l.target] !== undefined) centrality[l.target]++;
    });

    return centrality;
  }

  render(container) {
    const risks = this.state.risks;
    const dynamicData = this.calculateDynamicScores();
    const centrality = this.getNodeCentrality();

    const canvasWidth = 740;
    const canvasHeight = 400;
    const positions = this.getNodePositions(canvasWidth, canvasHeight);

    // Active Highlight calculations
    const activeChainIds = new Set(this.getDownstreamChain(this.selectedNodeId || this.hoveredNodeId));
    const isOverlayActive = (this.selectedNodeId !== null || this.hoveredNodeId !== null);

    // Identify active links inside highlight chain
    const activeLinkIds = new Set();
    this.links.forEach((link, idx) => {
      const parentId = link.source;
      const childId = link.target;
      const anchorNode = this.selectedNodeId || this.hoveredNodeId;
      
      if (anchorNode && activeChainIds.has(parentId) && activeChainIds.has(childId)) {
        // Must trace from root/anchor node
        const downstreamFromAnchor = new Set(this.getDownstreamChain(anchorNode));
        if (downstreamFromAnchor.has(parentId) && downstreamFromAnchor.has(childId)) {
          activeLinkIds.add(idx);
        }
      }
    });

    // Find selected node detail object
    const selectedDetailNode = this.layerNodes.find(n => n.id === this.selectedNodeId);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">System Risk Interdependency Map</span>
          <h1>Strategic Cascade Visualizer</h1>
          <p class="page-subtitle">Visualizing systemic relationship meshes: <strong>Threat Vectors → Drivers → Strategic Objectives → Enterprise Value</strong></p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <div class="register-layout ${this.isExpanded ? 'map-expanded' : ''} ${this.isBoardMode ? 'board-mode' : ''}">
        
        <!-- LEFT SCREEN: INTERACTIVE SVG NETWORK CONTAINER -->
        <div class="details-panel" style="flex-grow: 1;">
          <div class="network-container">
            
            <!-- PLAYBACK TOOLBAR (LEFT) -->
            <div class="network-toolbar">
              <div class="playback-group">
                <button class="playback-btn ${this.timeStep === 'today' ? 'active' : ''}" data-step="today">Today</button>
                <button class="playback-btn ${this.timeStep === '30' ? 'active' : ''}" data-step="30">30D</button>
                <button class="playback-btn ${this.timeStep === '90' ? 'active' : ''}" data-step="90">90D</button>
                <button class="playback-btn ${this.timeStep === '180' ? 'active' : ''}" data-step="180">180D</button>
              </div>
            </div>

            <!-- BOARD MODE TOGGLE BUTTON (RIGHT) -->
            <button id="btn-toggle-board" class="btn btn-secondary btn-small board-mode-toggle-btn" style="padding: 0 10px; height: 32px; font-size:10px; font-weight:700; border-radius:6px; display:flex; align-items:center; gap:6px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0V3m7.5 13.5V3" />
              </svg>
              <span>${this.isBoardMode ? 'Light UI' : 'Board Mode'}</span>
            </button>

            <!-- CANVAS CONTROLS (ZOOM/PAN/FIT) -->
            <div class="canvas-controls">
              <button class="control-btn" id="btn-zoom-in" title="Zoom In">+</button>
              <button class="control-btn" id="btn-zoom-out" title="Zoom Out">-</button>
              <button class="control-btn" id="btn-zoom-fit" title="Fit Screen" style="font-size:10px;">Fit</button>
              <button id="btn-toggle-expand" class="control-btn" title="${this.isExpanded ? 'Collapse Map' : 'Expand Map'}" style="font-size: 10px;">
                ${this.isExpanded ? '⛶' : '⤢'}
              </button>
            </div>

            <!-- SVG CANVAS -->
            <svg class="network-svg" id="risk-cascade-svg" style="cursor: grab;">
              
              <!-- GLOW DEFS AND CLONE BASE -->
              <g id="network-viewport" transform="translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})">
                
                <!-- GROUP HOLDS ALL NODES AND EDGES TO CLONE IN MINIMAP -->
                <g id="static-network-graph">
                  
                  <!-- 1. DRAW CONNECTION LINES (CUBIC BEZIER S-CURVES) -->
                  ${this.links.map((link, idx) => {
                    const parentPos = positions[link.source];
                    const childPos = positions[link.target];
                    if (!parentPos || !childPos) return '';

                    const isHighlighted = activeLinkIds.has(idx);
                    const isFaded = isOverlayActive && !isHighlighted;
                    
                    const dx = childPos.x - parentPos.x;
                    const pathData = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x + dx * 0.4} ${parentPos.y}, ${childPos.x - dx * 0.4} ${childPos.y}, ${childPos.x} ${childPos.y}`;

                    let edgeClass = 'strong';
                    if (link.type === 'indirect') {
                      edgeClass = 'indirect';
                    } else {
                      const parentScore = dynamicData.scores[link.source] || 0;
                      if (parentScore >= 45) edgeClass = 'strong';
                      else if (parentScore >= 25) edgeClass = 'moderate';
                      else edgeClass = 'weak';
                    }

                    return `
                      <path class="network-link ${edgeClass} ${isHighlighted ? 'active-chain cascade-active' : ''} ${isFaded ? 'cascade-faded' : ''}"
                            id="edge-${idx}"
                            d="${pathData}" />
                      
                      <!-- Moving flow particles along active paths -->
                      ${isHighlighted ? `
                        <circle r="2" fill="#00B5B5" opacity="0.8">
                          <animateMotion dur="0.8s" repeatCount="indefinite" path="${pathData}" />
                        </circle>
                      ` : ''}
                    `;
                  }).join('')}

                  <!-- 2. DRAW COLUMN LAYER BACKGROUNDS AND LABELS -->
                  ${[1, 2, 3, 4].map(l => {
                    const x = 48 + (l - 1) * 180;
                    return `
                      <text x="${x}" y="20" 
                            text-anchor="middle"
                            style="font-family: var(--font-header); font-size: 8px; font-weight: 700; fill: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px;">
                        ${this.layers[l].name}
                      </text>
                    `;
                  }).join('')}

                  <!-- 3. DRAW GRAPH NODES -->
                  ${this.layerNodes.map(node => {
                    const pos = positions[node.id];
                    if (!pos) return '';

                    const isSelected = this.selectedNodeId === node.id;
                    const isHovered = this.hoveredNodeId === node.id;
                    const isInChain = activeChainIds.has(node.id) && !isSelected;
                    const isFaded = isOverlayActive && !isSelected && !isInChain;

                    const score = dynamicData.scores[node.id];
                    const status = dynamicData.statuses[node.id];
                    const trend = dynamicData.trends[node.id];

                    // Determine Node Size dynamically based on centrality and criticality
                    const nodeCentrality = centrality[node.id] || 0;
                    let radius = 9; // default 18px diameter
                    let sizeClass = '';
                    if (status === 'Above Appetite' || status === 'Critical Gaps' || status === 'Critical') {
                      radius = 13; // 26px diameter critical
                      sizeClass = 'critical';
                    } else if (nodeCentrality >= 3) {
                      radius = 11; // 22px diameter high centrality
                    }

                    // Strict color mapping matching specifications
                    let nodeColor = '#64748B'; // Default neutral
                    if (isSelected) {
                      nodeColor = '#00B5B5'; // Selected Active teal
                    } else {
                      if (status === 'Above Appetite' || status === 'Critical Gaps' || status === 'Critical') {
                        nodeColor = '#C0392B'; // Critical Crimson
                      } else if (status === 'Near Appetite' || status === 'At Risk' || status === 'Warning') {
                        nodeColor = '#C2610E'; // Warning Burnt Orange
                      } else if (status === 'Within Appetite' || status === 'On Track' || status === 'Safe') {
                        nodeColor = '#1A7A4A'; // Safe forest green
                      }
                    }

                    // Truncate name to 18 characters maximum with ellipsis
                    const titleText = node.label;
                    const truncatedTitle = titleText.length > 18 ? titleText.slice(0, 16) + '..' : titleText;

                    // Direction arrow
                    let arrowSymbol = '•';
                    if (trend === 'Deteriorating') arrowSymbol = '↑';
                    else if (trend === 'Improving') arrowSymbol = '↓';

                    // Node metric subtitle string
                    const scoreLabel = node.type === 'risk' ? `S:${score}` : node.type === 'objective' ? `Ex:${score}` : `Val:${score}`;
                    const metricText = `${scoreLabel} ${arrowSymbol}`;

                    return `
                      <g class="network-node ${isSelected ? 'selected cascade-active' : ''} ${isInChain ? 'active-chain cascade-active' : ''} ${isFaded ? 'cascade-faded' : ''} ${sizeClass}"
                         data-id="${node.id}"
                         transform="translate(${pos.x}, ${pos.y})">
                        
                        <!-- Glow outline circle -->
                        <circle r="${radius + 2}" 
                                fill="transparent" 
                                stroke="${nodeColor}" 
                                stroke-width="1.5"
                                opacity="${isHovered || isSelected ? 0.35 : 0.0}" />

                        <!-- Core circle -->
                        <circle r="${radius}" 
                                fill="${this.isBoardMode ? '#1E293B' : '#FFFFFF'}" 
                                stroke="${nodeColor}" 
                                stroke-width="${isSelected ? 3 : 2}" />
                        
                        <!-- Core color dot -->
                        <circle r="${radius - 5}" 
                                fill="${nodeColor}" 
                                opacity="${isSelected ? 1.0 : 0.85}" />

                        <!-- Node Name Text label -->
                        <text x="${radius + 8}" y="-2"
                              class="node-label"
                              text-anchor="start"
                              style="fill: ${isSelected ? '#00B5B5' : this.isBoardMode ? '#FFFFFF' : '#374151'}; font-weight: ${isSelected ? '700' : '500'};">
                          ${truncatedTitle}
                        </text>

                        <!-- Node Secondary Metrics text -->
                        <text x="${radius + 8}" y="10"
                              class="node-metric"
                              text-anchor="start"
                              style="fill: ${this.isBoardMode ? '#94A3B8' : '#6B7280'};">
                          ${metricText}
                        </text>
                      </g>
                    `;
                  }).join('')}

                </g>
              </g>
            </svg>

            <!-- CANVAS MINI-MAP IN THE BOTTOM-LEFT CORNER -->
            <div class="network-minimap">
              <svg viewBox="0 0 740 400" style="width:100%;height:100%;pointer-events:none;">
                <use href="#static-network-graph" />
              </svg>
            </div>

          </div>
        </div>

        <!-- RIGHT SCREEN: DYNAMIC CASCADE INTELLIGENCE PANEL -->
        <div class="details-panel no-print" style="width: 360px; flex-shrink: 0;">
          <div class="glass-panel" style="min-height:440px; display:flex; flex-direction:column; justify-content:space-between; padding:20px;">
            ${selectedDetailNode ? this.renderCascadeIntelPanel(selectedDetailNode, dynamicData, risks) : `
              <div style="text-align:center; color:#64748B; padding-top:140px; font-size:11px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" style="width:40px; height:40px; margin:0 auto 12px; opacity:0.4; color:#00B5B5;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5" />
                </svg>
                <div style="font-weight:600; margin-bottom:4px; color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">Causality Analysis active</div>
                Select any node in the left cascade layers to track propagating corporate fragility and objective threats.
              </div>
            `}
          </div>
        </div>

      </div>
    `;

    if (this._fromDashboard) {
      AIInsightService.renderBackToDashboardBanner(this, container, `Risk Cascade Network — Risk ${this.selectedNodeId}`);
    }

    this.bindEvents(container);
  }

  // Render Cascade Intelligence Panel Widgets
  renderCascadeIntelPanel(node, dynamicData, risks) {
    const score = dynamicData.scores[node.id];
    const status = dynamicData.statuses[node.id];
    const trend = dynamicData.trends[node.id];

    // Compute chain metrics
    const downstreamChain = this.getDownstreamChain(node.id);
    const pathLength = downstreamChain.length;

    // Find Root Cause (first node in Layer 1 that feeds this node)
    const upstreamAncestors = this.getUpstreamAncestors(node.id);
    const rootCauseId = upstreamAncestors.find(aid => {
      const parentNode = this.layerNodes.find(n => n.id === aid);
      return parentNode && parentNode.layer === 1;
    }) || node.id;
    const rootCauseNode = this.layerNodes.find(n => n.id === rootCauseId);
    const rootCauseLabel = rootCauseNode ? rootCauseNode.label : 'None';

    // Find Threatened Objectives (Layer 3 nodes involved in downstream chain)
    const threatenedObjs = this.layerNodes.filter(n => n.layer === 3 && downstreamChain.includes(n.id));

    // Mapped Enterprise Value Impacts (Layer 4 nodes involved in downstream chain)
    const valueImpacts = this.layerNodes.filter(n => n.layer === 4 && downstreamChain.includes(n.id));

    // Calculate Fragility Score (based on the density and scores of active downstream nodes)
    const activeRiskScores = downstreamChain
      .map(id => dynamicData.scores[id] || 0);
    const avgScore = activeRiskScores.reduce((sum, s) => sum + s, 0) / (activeRiskScores.length || 1);
    const fragilityScore = Math.min(100, Math.round(avgScore * 1.15));

    // Critical Amplifiers (nodes in the cascade with Above Appetite/Critical status)
    const amplifiers = this.layerNodes.filter(n => {
      if (!downstreamChain.includes(n.id) || n.id === node.id) return false;
      const s = dynamicData.statuses[n.id];
      return s === 'Above Appetite' || s === 'Critical Gaps' || s === 'Critical';
    });

    // Mitigating Controls (controls mapped to risks in downstream chain)
    const mappedControls = [];
    downstreamChain.forEach(cid => {
      const risk = risks.find(r => r.id === cid);
      if (risk && risk.controls) {
        risk.controls.forEach(c => {
          if (!mappedControls.some(existing => existing.name === c.name)) {
            mappedControls.push(c);
          }
        });
      }
    });

    // Suggested action narrative generated dynamically
    let actionNarrative = "Establish operational check guardrails and run targeted internal audits on intermediate drivers.";
    if (status === 'Above Appetite' || status === 'Critical Gaps' || status === 'Critical') {
      actionNarrative = `Urgent board-level review recommended. Immediate mitigation controls must be deployed at the root source (${rootCauseLabel}) to halt further value loss.`;
    } else if (status === 'Near Appetite' || status === 'At Risk' || status === 'Warning') {
      actionNarrative = `Proactive review suggested. Operational thresholds must be monitored weekly to prevent this trend from compounding.`;
    } else {
      actionNarrative = `Cascade path remains stable within standard tolerance bounds. Continuous automated logging is active.`;
    }

    const panelBgClass = this.isBoardMode ? 'board-mode-panel' : '';

    return `
      <div style="flex-grow: 1; overflow-y: auto; max-height: 420px; padding-right:4px;">
        <span class="profile-role-badge" style="margin-bottom:6px;">Cascade Layer ${node.layer}</span>
        <h3 style="font-size:16px; font-weight:700; line-height:1.2; margin-bottom:12px; display:flex; align-items:center; gap:6px; color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">
          <span>${node.label}</span>
          ${node.type === 'risk' ? `
            <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="risk" data-explain-id="${node.id}" aria-label="AI Explain" style="border:none; background:none; cursor:pointer; color:#00B5B5; padding:0; display:flex; align-items:center;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
              </svg>
            </button>
          ` : ''}
        </h3>

        <!-- STATUS TAGS -->
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <span class="status-badge ${status.includes('Above') || status.includes('Critical') ? 'above' : status.includes('Near') || status.includes('At Risk') || status.includes('Warning') ? 'near' : 'within'}" style="font-size:10px; border-radius:12px; padding:2px 8px;">
            Score: ${score}
          </span>
          <span class="trend-tag ${trend === 'Deteriorating' || status.includes('Critical') ? 'deteriorating' : trend === 'Improving' || status.includes('Track') ? 'improving' : 'stable'}" style="font-size:10px;">
            ${trend === 'Deteriorating' ? '↑ Deteriorating' : trend === 'Improving' ? '↓ Improving' : '• Stable / Mapped'}
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; border-top:1px solid ${this.isBoardMode ? '#1E293B' : 'var(--border-color)'}; padding-top:12px;">
          
          <!-- ROOT CAUSE & PATH LENGTH -->
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <div>
              <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:2px;">Root Cause Threat</span>
              <strong style="color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${rootCauseLabel}</strong>
            </div>
            <div style="text-align:right;">
              <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:2px;">Chain Size</span>
              <strong style="color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${pathLength} Nodes Mapped</strong>
            </div>
          </div>

          <!-- FRAGILITY RATING -->
          <div>
            <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Fragility Score</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="flex-grow:1; height:6px; background:${this.isBoardMode ? '#1E293B' : '#E2E8F0'}; border-radius:3px; overflow:hidden;">
                <div style="height:100%; width:${fragilityScore}%; background: ${fragilityScore >= 70 ? '#C0392B' : fragilityScore >= 45 ? '#C2610E' : '#1A7A4A'};"></div>
              </div>
              <span style="font-size:11px; font-weight:700; color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${fragilityScore}/100</span>
            </div>
          </div>

          <!-- THREATENED STRATEGIC OBJECTIVES -->
          <div>
            <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Threatened Objectives</span>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${threatenedObjs.length ? threatenedObjs.map(o => {
                const s = dynamicData.statuses[o.id];
                const color = s.includes('Critical') ? '#C0392B' : s.includes('Risk') ? '#C2610E' : '#1A7A4A';
                return `
                  <div style="font-size:11px; display:flex; justify-content:space-between; align-items:center; background:${this.isBoardMode ? '#1E293B' : '#F8FAFC'}; padding:4px 8px; border-radius:4px;">
                    <span style="font-weight:500; color:${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${o.label}</span>
                    <span style="font-weight:700; font-size:9px; color:${color};">${s}</span>
                  </div>
                `;
              }).join('') : `<div style="font-size:10px; color:#64748B; font-style:italic;">No strategic objectives threatened.</div>`}
            </div>
          </div>

          <!-- ENTERPRISE VALUE IMPACT -->
          <div>
            <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Enterprise Value Impact</span>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${valueImpacts.length ? valueImpacts.map(v => {
                const s = dynamicData.statuses[v.id];
                const color = s === 'Critical' ? '#C0392B' : s === 'Warning' ? '#C2610E' : '#1A7A4A';
                return `
                  <div style="font-size:11px; display:flex; justify-content:space-between; align-items:center; background:${this.isBoardMode ? '#1E293B' : '#F8FAFC'}; padding:4px 8px; border-radius:4px;">
                    <span style="font-weight:500; color:${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${v.label}</span>
                    <span style="font-weight:700; font-size:9px; color:${color};">${s}</span>
                  </div>
                `;
              }).join('') : `<div style="font-size:10px; color:#64748B; font-style:italic;">No enterprise value impact.</div>`}
            </div>
          </div>

          <!-- CRITICAL AMPLIFIERS -->
          ${amplifiers.length ? `
            <div>
              <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Critical Amplifiers</span>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                ${amplifiers.map(a => `
                  <span style="background:rgba(192,57,43,0.1); border:1px solid rgba(192,57,43,0.25); color:#C0392B; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;">
                    ⚠️ ${a.label}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- PROTECTIVE CONTROLS -->
          <div>
            <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Protective Controls</span>
            <div style="display:flex; flex-direction:column; gap:4px; max-height:85px; overflow-y:auto; padding-right:2px;">
              ${mappedControls.length ? mappedControls.map(c => `
                <div style="font-size:10px; padding:4px 6px; background:${this.isBoardMode ? '#1E293B' : '#F1F5F9'}; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px; color:${this.isBoardMode ? '#E2E8F0' : '#475569'};">${c.name}</span>
                  <span style="color:${c.rating === 'Effective' ? '#1A7A4A' : '#C2610E'}; font-weight:700; font-size:9px;">${c.rating}</span>
                </div>
              `).join('') : `<div style="font-size:10px; color:#64748B; font-style:italic;">No specific controls mapped.</div>`}
            </div>
          </div>

          <!-- SUGGESTED ACTIONS -->
          <div>
            <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:4px;">Suggested Actions</span>
            <div style="font-size:11px; line-height:1.4; color: ${this.isBoardMode ? '#E2E8F0' : '#475569'}; padding:8px 10px; border-radius:6px; background: ${this.isBoardMode ? 'rgba(0, 181, 181, 0.05)' : 'rgba(0,181,181,0.03)'}; border-left: 3px solid #00B5B5;">
              ${actionNarrative}
            </div>
          </div>

        </div>
      </div>

      <!-- FOOTER BUTTON -->
      ${node.type === 'risk' ? `
        <button class="btn btn-secondary btn-small" id="btn-inspect-register" style="margin-top:16px; width:100%; justify-content:center; border-radius:6px; font-weight:700; height:32px;">
          Inspect in Risk Register
        </button>
      ` : ''}
    `;
  }

  bindEvents(container) {
    const svg = container.querySelector('#risk-cascade-svg');
    const viewport = container.querySelector('#network-viewport');

    // --- ZOOM AND DRAG FUNCTIONALITY ---
    if (svg && viewport) {
      // 1. Mouse Dragging
      svg.addEventListener('mousedown', (e) => {
        // Only drag if click was directly on background, not on a node circle/text
        if (e.target.closest('.network-node')) return;
        this.isDragging = true;
        svg.style.cursor = 'grabbing';
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
      });

      svg.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})`);
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          if (svg) svg.style.cursor = 'grab';
        }
      });

      // 2. Scroll Wheel Zoom
      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY * -0.001;
        this.zoomScale = Math.min(2.0, Math.max(0.5, this.zoomScale + zoomFactor));
        viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})`);
      });

      // 3. Zoom Button Toolbar
      container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
        this.zoomScale = Math.min(2.0, this.zoomScale + 0.15);
        viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})`);
      });

      container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
        this.zoomScale = Math.max(0.5, this.zoomScale - 0.15);
        viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})`);
      });

      container.querySelector('#btn-zoom-fit')?.addEventListener('click', () => {
        this.zoomScale = 1.0;
        this.panX = 0;
        this.panY = 0;
        viewport.setAttribute('transform', `translate(0, 0) scale(1)`);
      });
    }

    // --- NODE HOVER / CLICK CASCADE ---
    const nodes = container.querySelectorAll('.network-node');
    nodes.forEach(nodeElement => {
      const id = nodeElement.dataset.id;

      // Click: Toggle selection
      nodeElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedNodeId = (this.selectedNodeId === id) ? null : id;
        this.render(container);
      });

      // Hover In
      nodeElement.addEventListener('mouseenter', () => {
        this.hoveredNodeId = id;
        
        // Dynamic hover highlight CSS classing
        const activeChain = new Set(this.getDownstreamChain(id));
        const activeLinkIds = new Set();
        this.links.forEach((link, idx) => {
          if (activeChain.has(link.source) && activeChain.has(link.target)) {
            const downstreamFromAnchor = new Set(this.getDownstreamChain(id));
            if (downstreamFromAnchor.has(link.source) && downstreamFromAnchor.has(link.target)) {
              activeLinkIds.add(idx);
            }
          }
        });

        // Fade non-related nodes/edges
        nodes.forEach(n => {
          const nid = n.dataset.id;
          if (nid !== id && !activeChain.has(nid)) {
            n.classList.add('cascade-faded');
          } else {
            n.classList.remove('cascade-faded');
            n.classList.add('cascade-active');
          }
        });

        container.querySelectorAll('.network-link').forEach((linkEl, idx) => {
          if (activeLinkIds.has(idx)) {
            linkEl.classList.add('active-chain', 'cascade-active');
            linkEl.classList.remove('cascade-faded');
          } else {
            linkEl.classList.add('cascade-faded');
            linkEl.classList.remove('active-chain', 'cascade-active');
          }
        });
      });

      // Hover Out
      nodeElement.addEventListener('mouseleave', () => {
        this.hoveredNodeId = null;
        this.render(container); // Reset opacity and overlays
      });
    });

    // --- TIME PLAYBACK SELECTOR ---
    container.querySelectorAll('.playback-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.timeStep = btn.dataset.step;
        this.render(container);
      });
    });

    // --- BOARD MODE TOGGLE ---
    container.querySelector('#btn-toggle-board')?.addEventListener('click', () => {
      this.isBoardMode = !this.isBoardMode;
      this.render(container);
    });

    // --- MAP EXPAND / COLLAPSE ---
    container.querySelector('#btn-toggle-expand')?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render(container);
    });

    // --- INSPECT IN REGISTER DIRECT LINK ---
    const inspectBtn = container.querySelector('#btn-inspect-register');
    if (inspectBtn && this.selectedNodeId) {
      inspectBtn.addEventListener('click', () => {
        this.onStateChange({
          activeTab: 'register',
          editingRiskId: this.selectedNodeId
        });
      });
    }

    // --- AI EXPLAIN INCIDENT ACTIONS ---
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

    // --- RENDER DYNAMIC AI PAGE INSIGHTS ---
    const insightContainer = container.querySelector('#ai-insight-container');
    if (insightContainer) {
      AIInsightService.renderPageInsightCard('network', insightContainer, this.state);
    }
  }
}
