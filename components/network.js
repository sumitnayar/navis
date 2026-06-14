// Risk Relationship Network Graph Component - Visualizing Compounding Cascades
import { AIInsightService } from '../services/aiInsightService.js';

export class NetworkComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.isExpanded = false;
    this.trendChart = null;

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
    const paddingRight = 120;
    const paddingTop = 75;
    const paddingBottom = 32;
    const horizontalDistance = (canvasWidth - paddingLeft - paddingRight) / 3;
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
      const centeringOffset = (canvasHeight - paddingTop - paddingBottom - occupiedHeight) / 2;
      const yStart = paddingTop + Math.max(0, Math.min(40, centeringOffset));

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
  }  render(container) {
    const risks = this.state.risks;
    const dynamicData = this.calculateDynamicScores();
    const centrality = this.getNodeCentrality();

    const renderContainer = document.getElementById('page-render-container') || container;
    const containerWidth = renderContainer.getBoundingClientRect().width || 1216;
    
    // Width of the left column (the SVG network container)
    let leftColumnWidth = this.isExpanded ? containerWidth : (containerWidth - 360 - 24);
    if (leftColumnWidth < 500) leftColumnWidth = 740; // safety fallback

    // Height of the SVG network container
    const leftColumnHeight = this.isExpanded ? 580 : 440;
    const svgHeight = leftColumnHeight - 44; // subtract header bar (44px)

    const canvasWidth = leftColumnWidth;
    const canvasHeight = svgHeight;
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

    // If layout already exists and selectedNode didn't change, do in-place update!
    const existingLayout = container.querySelector('.register-layout');
    if (existingLayout && this.lastSelectedNodeId === this.selectedNodeId) {
      // 1. Update layout classes
      existingLayout.className = `register-layout ${this.isExpanded ? 'map-expanded' : ''} ${this.isBoardMode ? 'board-mode' : ''}`;
      
      // 2. Update active class on playback buttons
      container.querySelectorAll('.playback-btn').forEach(btn => {
        if (btn.dataset.step === this.timeStep) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 3. Update the SVG static network graph innerHTML
      const staticGraph = container.querySelector('#static-network-graph');
      if (staticGraph) {
        staticGraph.innerHTML = this.getSVGGraphHTML(positions, dynamicData, activeChainIds, isOverlayActive, activeLinkIds, canvasWidth, canvasHeight);
      }

      // 4. Update details panel text metrics
      if (selectedDetailNode) {
        const score = dynamicData.scores[selectedDetailNode.id];
        const status = dynamicData.statuses[selectedDetailNode.id];
        const trend = dynamicData.trends[selectedDetailNode.id];

        const scoreBadge = container.querySelector('#network-details-panel .status-badge');
        if (scoreBadge) {
          scoreBadge.textContent = selectedDetailNode.type === 'objective' ? `Exposure: ${score}` : `Score: ${score}`;
          scoreBadge.className = `status-badge ${status.includes('Above') || status.includes('Critical') ? 'above' : status.includes('Near') || status.includes('At Risk') || status.includes('Warning') ? 'near' : 'within'}`;
        }

        const trendTag = container.querySelector('#network-details-panel .trend-tag');
        if (trendTag) {
          trendTag.textContent = trend === 'Deteriorating' ? '↑ Deteriorating' : trend === 'Improving' ? '↓ Improving' : '• Stable / Mapped';
          trendTag.className = `trend-tag ${trend === 'Deteriorating' || status.includes('Critical') ? 'deteriorating' : trend === 'Improving' || status.includes('Track') ? 'improving' : 'stable'}`;
        }

        // Update the chart in place!
        if (this.trendChart && selectedDetailNode.type === 'risk') {
          const riskObj = risks.find(r => r.id === selectedDetailNode.id);
          if (riskObj) {
            const sliced = this.getSlicedHistory(riskObj.scoreHistory);
            this.trendChart.data.labels = sliced.map(h => h.date);
            this.trendChart.data.datasets[0].data = sliced.map(h => h.score);
            this.trendChart.update();
          }
        }
      }

      // Re-bind node events
      this.bindNodeEvents(container);
      return;
    }

    // Otherwise, perform full render
    this.lastSelectedNodeId = this.selectedNodeId;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">System Risk Interdependency Map</span>
          <h1>Strategic Cascade Visualizer</h1>
          <p class="page-subtitle">Visualizing systemic relationship meshes: <strong>Threat Vectors → Drivers → Strategic Objectives → Enterprise Value</strong></p>
        </div>
      </div>

      <div class="register-layout ${this.isExpanded ? 'map-expanded' : ''} ${this.isBoardMode ? 'board-mode' : ''}">
        
        <!-- LEFT SCREEN: INTERACTIVE SVG NETWORK CONTAINER -->
        <div class="details-panel" style="flex-grow: 1;">
          <div class="network-container" style="display: flex; flex-direction: column;">
            
            <!-- TOP CONTROL BAR -->
            <div class="network-header-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; border-bottom: 1px solid ${this.isBoardMode ? '#1E293B' : 'var(--border-color)'}; background: ${this.isBoardMode ? '#0A1628' : '#FAFBFD'}; height: 44px; box-sizing: border-box; flex-shrink: 0; width: 100%; position: relative; z-index: 10;">
              <div class="playback-group" style="margin: 0; display: flex; border: 1px solid ${this.isBoardMode ? '#1E293B' : 'var(--border-color)'}; background: ${this.isBoardMode ? '#0F172A' : 'var(--bg-secondary)'}; border-radius: 6px; padding: 2px;">
                <button class="playback-btn ${this.timeStep === 'today' ? 'active' : ''}" data-step="today">Today</button>
                <button class="playback-btn ${this.timeStep === '30' ? 'active' : ''}" data-step="30">30D</button>
                <button class="playback-btn ${this.timeStep === '90' ? 'active' : ''}" data-step="90">90D</button>
                <button class="playback-btn ${this.timeStep === '180' ? 'active' : ''}" data-step="180">180D</button>
              </div>

              <button id="btn-toggle-board" class="btn btn-secondary btn-small" style="padding: 0 10px; height: 28px; font-size:10px; font-weight:700; border-radius:6px; display:flex; align-items:center; gap:6px; margin: 0; background: ${this.isBoardMode ? 'rgba(255,255,255,0.05)' : ''}; border-color: ${this.isBoardMode ? '#1E293B' : ''}; color: ${this.isBoardMode ? '#FFFFFF' : ''};">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0V3m7.5 13.5V3" />
                </svg>
                <span>${this.isBoardMode ? 'Light UI' : 'Board Mode'}</span>
              </button>
            </div>

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
            <svg class="network-svg" id="risk-cascade-svg" width="100%" height="100%" viewBox="0 0 ${canvasWidth} ${canvasHeight}" preserveAspectRatio="xMidYMid meet" style="cursor: grab; flex-grow: 1; display: block; width: 100%; height: 100%; position: relative; z-index: 1;">
              <g id="network-viewport" transform="translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})">
                <g id="static-network-graph">
                  ${this.getSVGGraphHTML(positions, dynamicData, activeChainIds, isOverlayActive, activeLinkIds, canvasWidth, canvasHeight)}
                </g>
              </g>
            </svg>

            <div class="network-minimap">
              <svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" style="width:100%;height:100%;pointer-events:none;">
                <use href="#static-network-graph" />
              </svg>
            </div>

          </div>
        </div>

        <!-- RIGHT SCREEN: DYNAMIC CASCADE INTELLIGENCE PANEL -->
        <div class="details-panel no-print" style="width: 360px; flex-shrink: 0;" id="network-details-panel">
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

    setTimeout(() => {
      const trendCanvas = container.querySelector('#node-trend-chart');
      if (trendCanvas && selectedDetailNode && selectedDetailNode.type === 'risk') {
        const riskObj = risks.find(r => r.id === selectedDetailNode.id);
        if (riskObj) {
          this.initNodeTrendChart(trendCanvas, riskObj);
        }
      }
    }, 0);
  }

  getSVGGraphHTML(positions, dynamicData, activeChainIds, isOverlayActive, activeLinkIds, canvasWidth, canvasHeight) {
    const centrality = this.getNodeCentrality();
    
    const linksHTML = this.links.map((link, idx) => {
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
        ${isHighlighted ? `
          <circle r="2" fill="#00B5B5" opacity="0.8">
            <animateMotion dur="0.8s" repeatCount="indefinite" path="${pathData}" />
          </circle>
        ` : ''}
      `;
    }).join('');

    const headersHTML = [1, 2, 3, 4].map(l => {
      const horizontalDistance = (canvasWidth - 48 - 120) / 3;
      const x = 48 + (l - 1) * horizontalDistance;
      return `
        <text x="${x}" y="52" 
              text-anchor="middle"
              style="font-family: var(--font-header); font-size: 8px; font-weight: 700; fill: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px;">
          ${this.layers[l].name}
        </text>
      `;
    }).join('');

    const nodesHTML = this.layerNodes.map(node => {
      const pos = positions[node.id];
      if (!pos) return '';

      const isSelected = this.selectedNodeId === node.id;
      const isHovered = this.hoveredNodeId === node.id;
      const isInChain = activeChainIds.has(node.id) && !isSelected;
      const isFaded = isOverlayActive && !isSelected && !isInChain;

      const score = dynamicData.scores[node.id];
      const status = dynamicData.statuses[node.id];
      const trend = dynamicData.trends[node.id];

      const nodeCentrality = centrality[node.id] || 0;
      let radius = 9;
      let sizeClass = '';
      if (status === 'Above Appetite' || status === 'Critical Gaps' || status === 'Critical') {
        radius = 13;
        sizeClass = 'critical';
      } else if (nodeCentrality >= 3) {
        radius = 11;
      }

      let nodeColor = '#64748B';
      if (isSelected) {
        nodeColor = '#00B5B5';
      } else {
        if (status === 'Above Appetite' || status === 'Critical Gaps' || status === 'Critical') {
          nodeColor = '#C0392B';
        } else if (status === 'Near Appetite' || status === 'At Risk' || status === 'Warning') {
          nodeColor = '#C2610E';
        } else if (status === 'Within Appetite' || status === 'On Track' || status === 'Safe') {
          nodeColor = '#1A7A4A';
        }
      }

      const titleText = node.label;
      const truncatedTitle = titleText.length > 18 ? titleText.slice(0, 16) + '..' : titleText;

      let arrowSymbol = '•';
      if (trend === 'Deteriorating') arrowSymbol = '↑';
      else if (trend === 'Improving') arrowSymbol = '↓';

      const scoreLabel = node.type === 'risk' ? `S:${score}` : node.type === 'objective' ? `Ex:${score}` : `Val:${score}`;
      const metricText = `${scoreLabel} ${arrowSymbol}`;

      return `
        <g class="network-node ${isSelected ? 'selected cascade-active' : ''} ${isInChain ? 'active-chain cascade-active' : ''} ${isFaded ? 'cascade-faded' : ''} ${sizeClass}"
           data-id="${node.id}"
           transform="translate(${pos.x}, ${pos.y})">
          <circle r="${radius + 2}" fill="transparent" stroke="${nodeColor}" stroke-width="1.5" opacity="${isHovered || isSelected ? 0.35 : 0.0}" />
          <circle r="${radius}" fill="${this.isBoardMode ? '#1E293B' : '#FFFFFF'}" stroke="${nodeColor}" stroke-width="${isSelected ? 3 : 2}" />
          <circle r="${radius - 5}" fill="${nodeColor}" opacity="${isSelected ? 1.0 : 0.85}" />
          <text x="${radius + 8}" y="-2" class="node-label" text-anchor="start" style="fill: ${isSelected ? '#00B5B5' : this.isBoardMode ? '#FFFFFF' : '#374151'}; font-weight: ${isSelected ? '700' : '500'};">
            ${truncatedTitle}
          </text>
          <text x="${radius + 8}" y="10" class="node-metric" text-anchor="start" style="fill: ${this.isBoardMode ? '#94A3B8' : '#6B7280'};">
            ${metricText}
          </text>
        </g>
      `;
    }).join('');

    return linksHTML + headersHTML + nodesHTML;
  }

  // Render Cascade Intelligence Panel Widgets
  renderCascadeIntelPanel(node, dynamicData, risks) {
    const score = dynamicData.scores[node.id];
    const status = dynamicData.statuses[node.id];
    const trend = dynamicData.trends[node.id];
    const riskObj = node.type === 'risk' ? risks.find(r => r.id === node.id) : null;
    const hasTrend = riskObj && riskObj.scoreHistory && riskObj.scoreHistory.length >= 2;

    if (node.type === 'objective') {
      const objObj = this.state.objectives ? this.state.objectives.find(o => o.id === node.id) : null;
      
      // Mapped Upstream Threat Risks
      const upstreamRisks = risks.filter(r => r.objectiveIds && r.objectiveIds.includes(node.id));
      
      // Downstream Enterprise Value Impacts (from this.links where source === node.id)
      const downstreamValImpacts = this.layerNodes.filter(n => n.layer === 4 && this.links.some(l => l.source === node.id && l.target === n.id));

      return `
        <div style="flex-grow: 1; overflow-y: auto; max-height: 420px; padding-right:4px;">
          <span class="profile-role-badge" style="margin-bottom:6px;">Strategic Objective Details</span>
          <h3 style="font-size:16px; font-weight:700; line-height:1.2; margin-bottom:12px; color: ${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">
            ${node.label}
          </h3>

          <!-- STATUS TAGS -->
          <div style="display:flex; gap:8px; margin-bottom:16px;">
            <span class="status-badge ${status.includes('Critical') || status.includes('Above') ? 'above' : status.includes('Risk') || status.includes('Near') || status.includes('Warning') ? 'near' : 'within'}" style="font-size:10px; border-radius:12px; padding:2px 8px;">
              Exposure: ${score}
            </span>
            <span class="trend-tag ${status.includes('Critical') ? 'deteriorating' : 'stable'}" style="font-size:10px;">
              ${status}
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; border-top:1px solid ${this.isBoardMode ? '#1E293B' : 'var(--border-color)'}; padding-top:12px;">
            
            <!-- CORPORATE METRICS -->
            ${objObj ? `
              <div style="background: ${this.isBoardMode ? '#1E293B' : '#F8FAFC'}; border: 1px solid ${this.isBoardMode ? '#334155' : 'var(--border-color)'}; border-radius:10px; padding:12px;">
                <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:6px; color:#00B5B5;">Target Success Metrics</span>
                <p style="font-size:11px; line-height:1.4; margin-bottom:8px; color: ${this.isBoardMode ? '#E2E8F0' : '#374151'};">${objObj.successMetrics}</p>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); border-top:1px solid ${this.isBoardMode ? '#334155' : '#E2E8F0'}; padding-top:8px; margin-top:8px;">
                  <span>Date: <strong>${objObj.targetDate}</strong></span>
                  <span>Owner: <strong>${objObj.owner}</strong></span>
                  <span>Priority: <strong>${objObj.importance}</strong></span>
                </div>
              </div>
            ` : ''}

            <!-- UPSTREAM THREAT LEADER -->
            <div>
              <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:6px;">Active Threat Vectors (${upstreamRisks.length})</span>
              <div style="display:flex; flex-direction:column; gap:6px; max-height:140px; overflow-y:auto; padding-right:2px;">
                ${upstreamRisks.length ? upstreamRisks.map(r => `
                  <div style="font-size:11px; display:flex; justify-content:space-between; align-items:center; background:${this.isBoardMode ? '#1E293B' : '#F1F5F9'}; padding:6px 8px; border-radius:4px;">
                    <span style="font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px; color:${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${r.title}</span>
                    <span class="status-badge ${r.appetiteStatus === 'Above Appetite' ? 'above' : r.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:9px; padding:1px 6px;">
                      Score: ${r.residualScore}
                    </span>
                  </div>
                `).join('') : `<div style="font-size:10px; color:#64748B; font-style:italic;">No active risks mapped.</div>`}
              </div>
            </div>

            <!-- DOWNSTREAM VALUE IMPACT -->
            <div>
              <span class="cascade-section-label" style="font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom:6px;">Enterprise Value Impact Mapped</span>
              <div style="display:flex; flex-direction:column; gap:4px;">
                ${downstreamValImpacts.length ? downstreamValImpacts.map(v => {
                  const s = dynamicData.statuses[v.id];
                  const color = s === 'Critical' ? 'var(--color-critical)' : s === 'Warning' ? 'var(--color-warning)' : 'var(--color-safe)';
                  return `
                    <div style="font-size:11px; display:flex; justify-content:space-between; align-items:center; background:${this.isBoardMode ? '#1E293B' : '#F8FAFC'}; padding:4px 8px; border-radius:4px;">
                      <span style="font-weight:500; color:${this.isBoardMode ? '#FFFFFF' : '#0A1628'};">${v.label}</span>
                      <span style="font-weight:700; font-size:9px; color:${color};">${s}</span>
                    </div>
                  `;
                }).join('') : `<div style="font-size:10px; color:#64748B; font-style:italic;">No enterprise value impact mapped.</div>`}
              </div>
            </div>

          </div>
        </div>
        
        <button class="btn btn-secondary btn-small" id="btn-inspect-objective" style="margin-top:16px; width:100%; justify-content:center; border-radius:6px; font-weight:700; height:32px;">
          Inspect Objective Details
        </button>
      `;
    }

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

        <!-- Node Trend Chart -->
        ${node.type === 'risk' ? `
        <div class="node-trend-container" style="margin-bottom: 16px; width: 100%;">
          ${hasTrend ? `
            <div style="height: 80px; width: 100%; position: relative;">
              <canvas id="node-trend-chart" style="width: 100%; height: 80px;"></canvas>
            </div>
          ` : `
            <div style="font-size: 11px; color: var(--color-navy-secondary); font-style: italic; padding: 10px 0; text-align: center; border: 1px dashed var(--border-color); border-radius: 6px;">
              Insufficient history for trend view
            </div>
          `}
        </div>
        ` : ''}

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
                <div style="height:100%; width:${fragilityScore}%; background: ${fragilityScore >= 70 ? 'var(--color-critical)' : fragilityScore >= 45 ? 'var(--color-warning)' : 'var(--color-safe)'};"></div>
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
                const color = s.includes('Critical') ? 'var(--color-critical)' : s.includes('Risk') ? 'var(--color-warning)' : 'var(--color-safe)';
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
                const color = s === 'Critical' ? 'var(--color-critical)' : s === 'Warning' ? 'var(--color-warning)' : 'var(--color-safe)';
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
                  <span style="color:${c.rating === 'Effective' ? 'var(--color-safe)' : 'var(--color-warning)'}; font-weight:700; font-size:9px;">${c.rating}</span>
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
    this.bindNodeEvents(container);

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

    // --- INSPECT OBJECTIVE DIRECT LINK ---
    const inspectObjBtn = container.querySelector('#btn-inspect-objective');
    if (inspectObjBtn && this.selectedNodeId) {
      inspectObjBtn.addEventListener('click', () => {
        this.onStateChange({
          activeTab: 'objectives',
          editingObjectiveId: this.selectedNodeId
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
  }

  bindNodeEvents(container) {
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
  }

  getSlicedHistory(scoreHistory) {
    if (!scoreHistory) return [];
    let sliceCount = 7;
    if (this.timeStep === '30') sliceCount = 30;
    else if (this.timeStep === '90') sliceCount = 90;
    else if (this.timeStep === '180') sliceCount = 180;
    return scoreHistory.slice(-sliceCount);
  }

  initNodeTrendChart(canvas, riskObj) {
    if (!canvas || !riskObj || !riskObj.scoreHistory) return;

    // Destroy existing instance first (Flag 2 destroy pattern)
    const existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    const sliced = this.getSlicedHistory(riskObj.scoreHistory);

    this.trendChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: sliced.map(h => h.date),
        datasets: [{
          label: 'Score',
          data: sliced.map(h => h.score),
          borderColor: '#00B89C',
          backgroundColor: 'rgba(0, 184, 156, 0.08)',
          fill: true,
          borderWidth: 1.5,
          tension: 0.3,
          pointRadius: 1,
          pointHoverRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1B2A',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            callbacks: {
              label: (context) => ` Score: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            display: false,
            grid: { display: false }
          },
          y: {
            position: 'right',
            min: 0,
            max: 25,
            border: { display: false },
            grid: {
              color: 'rgba(13,27,42,0.06)'
            },
            ticks: {
              maxTicksLimit: 3,
              stepSize: 10
            }
          }
        }
      }
    });
  }
}
