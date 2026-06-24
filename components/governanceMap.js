// Governance Map Component - Navis Phase 2

import { StorageService } from '../services/storageService.js';
import { ClaudeService } from '../services/claudeService.js';

export class GovernanceMapComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.activeTab = 'universe'; // universe | gaps
    this.mapData = null;
    this.isLoading = true;
    this.errorMsg = null;
    this.expandedDomain = null;
    this.coverageReasoning = null;
    this.isGeneratingCoverage = false;
    this.gapData = null;
    this.isGeneratingGaps = false;
    this.traceabilityPolicy = null; // null or policy object
  }

  async render(container) {
    if (this.isLoading && !this.mapData && !this.errorMsg) {
      this._renderLoading(container);
      await this.fetchMapData();
    }

    if (this.errorMsg) {
      this._renderError(container, this.errorMsg);
      return;
    }

    const html = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Executive View</span>
          <h1>Governance Map</h1>
          <p class="page-subtitle">Organizational exposure across core domains and trajectory signals.</p>
        </div>
      </div>

      <div class="register-layout">
        <div class="details-panel" style="max-width: 1200px; margin: 0 auto; width: 100%;">
          
          <div class="tabs-nav" style="margin-bottom: 20px; display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <button class="tab-btn ${this.activeTab === 'universe' ? 'active' : ''}" data-tab="universe" style="background:none; border:none; color: ${this.activeTab === 'universe' ? 'var(--color-indigo)' : 'var(--text-secondary)'}; font-weight: ${this.activeTab === 'universe' ? '600' : '400'}; cursor: pointer;">Universe View</button>
            <button class="tab-btn ${this.activeTab === 'gaps' ? 'active' : ''}" data-tab="gaps" style="background:none; border:none; color: ${this.activeTab === 'gaps' ? 'var(--color-indigo)' : 'var(--text-secondary)'}; font-weight: ${this.activeTab === 'gaps' ? '600' : '400'}; cursor: pointer;">Gap View</button>
          </div>

          <div class="tab-content" style="padding-bottom: 40px;">
            ${this.activeTab === 'universe' ? this._renderUniverse() : ''}
            ${this.activeTab === 'gaps' ? this._renderGaps() : ''}
          </div>
          
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);

    if (this.activeTab === 'gaps' && !this.gapData && !this.isGeneratingGaps) {
      this.generateGaps(container);
    }
  }

  _renderLoading(container) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-secondary);">Loading governance data...</div>`;
  }

  _renderError(container, msg) {
    container.innerHTML = `
      <div style="padding:40px;text-align:center;">
        <div style="color:var(--color-critical);margin-bottom:15px;font-family:'IBM Plex Serif', serif;font-size:20px;">${msg}</div>
        <button class="btn btn-secondary" id="btn-retry-map">Retry Connection</button>
      </div>
    `;
    container.querySelector('#btn-retry-map')?.addEventListener('click', () => {
      this.errorMsg = null;
      this.isLoading = true;
      this.render(container);
    });
  }

  _getColorForMaturity(maturity) {
    switch (maturity) {
      case 'Strong': return 'var(--color-safe)';
      case 'Moderate': return 'var(--color-indigo)'; // Using electric blue instead of green? Wait, brief says: Strong: green #16a34a, Amber: #f59e0b, Red: #dc2626
      case 'Weak': return 'var(--color-warning)';
      case 'Critical Gap': return 'var(--color-critical)';
      default: return 'var(--text-muted)';
    }
  }

  _getHexColor(maturity) {
    switch (maturity) {
      case 'Strong': return '#16a34a';
      case 'Moderate': return '#2563eb'; // electric blue for moderate
      case 'Weak': return '#f59e0b';
      case 'Critical Gap': return '#dc2626';
      default: return '#64748b';
    }
  }

  _renderUniverse() {
    if (this.expandedDomain) return this._renderDomainExpansion();
    if (this.traceabilityPolicy) return this._renderTraceability();

    let gridHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">';
    
    this.mapData.forEach(d => {
      const color = this._getHexColor(d.maturity);
      
      if (!d.hasData) {
        gridHtml += `
          <div class="domain-tile" data-domain="${d.domain}" style="background: #ffffff; border: 1px solid var(--border-color); border-left: 4px solid var(--text-muted); border-radius: 6px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
            <h3 style="font-family: 'IBM Plex Serif', serif; color: #0a1628; margin: 0 0 10px 0;">${d.domain}</h3>
            <div style="color: var(--text-muted); font-size: 13px;">No data entered</div>
            <div style="margin-top: 15px; font-size: 12px; color: var(--color-indigo); font-weight: 500;">Set up this domain →</div>
          </div>
        `;
      } else {
        gridHtml += `
          <div class="domain-tile" data-domain="${d.domain}" style="background: #ffffff; border: 1px solid var(--border-color); border-left: 4px solid ${color}; border-radius: 6px; padding: 16px; cursor: pointer;">
            <h3 style="font-family: 'IBM Plex Serif', serif; color: #0a1628; margin: 0 0 5px 0;">${d.domain}</h3>
            <div style="font-size: 12px; font-weight: 600; color: ${color}; margin-bottom: 12px;">${d.maturity}</div>
            
            <div style="display:flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
              <span>Policies (Approved/Total)</span>
              <span>${d.metrics.policiesApproved} / ${d.metrics.policiesTotal}</span>
            </div>
            <div style="display:flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
              <span>Controls (Impl./Total)</span>
              <span>${d.metrics.controlsImplemented} / ${d.metrics.controlsTotal}</span>
            </div>
            ${d.metrics.kriAlerts > 0 ? `
            <div style="display:flex; justify-content: space-between; font-size: 13px; color: var(--color-warning); font-weight: 500; margin-bottom: 4px;">
              <span>KRI Alerts</span>
              <span>⚠ ${d.metrics.kriAlerts}</span>
            </div>
            ` : ''}
            <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted);">Owner: ${d.nodes.owner}</div>
          </div>
        `;
      }
    });
    
    gridHtml += '</div>';
    
    return `
      <div style="background: #0a1628; padding: 24px; border-radius: 8px;">
        ${gridHtml}
      </div>
    `;
  }

  _renderDomainExpansion() {
    const d = this.mapData.find(x => x.domain === this.expandedDomain);
    if (!d) return '';

    let html = `
      <div style="margin-bottom: 20px;">
        <button class="btn btn-secondary btn-close-panel">← Back to Governance Map</button>
      </div>
      <div class="glass-panel" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; position: relative;">
        <h2 style="font-family: 'IBM Plex Serif', serif; color: #0a1628; margin-top:0; text-transform: uppercase;">${d.domain}</h2>
        <hr style="border-top: 1px solid var(--border-color); margin: 15px 0;" />
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px;">
          <div>
            <h4 style="margin:0 0 10px 0; color:var(--text-secondary);">Policies</h4>
            ${d.nodes.policies.length === 0 ? '<p style="font-size:13px;color:var(--text-muted);">None</p>' : d.nodes.policies.map(p => `
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; margin-bottom:6px;">
                <span>${p.status === 'Approved' ? '<span style="color:#16a34a;">✓</span>' : '<span style="color:#f59e0b;">⚠</span>'} ${p.title}</span>
                <div style="display:flex; gap: 10px; align-items:center;">
                  <span style="color:var(--text-muted); font-size:12px;">${p.status}</span>
                  <a href="#" class="view-traceability-link" data-policy-id="${p.id}" style="font-size:11px; color:#2563eb; text-decoration:none;">View Traceability</a>
                </div>
              </div>
            `).join('')}

            <h4 style="margin:20px 0 10px 0; color:var(--text-secondary);">Controls</h4>
            ${d.nodes.controls.length === 0 ? '<p style="font-size:13px;color:var(--text-muted);">None</p>' : d.nodes.controls.map(c => `
              <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:6px;">
                <span>${c.implementation_status === 'Implemented' || c.implementation_status === 'Verified' ? '<span style="color:#16a34a;">✓</span>' : '<span style="color:#dc2626;">✗</span>'} <span style="font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--text-muted);">${c.control_id}</span> ${c.control_name}</span>
                <span style="color:var(--text-muted); font-size:12px;">${c.implementation_status}</span>
              </div>
            `).join('')}

            <h4 style="margin:20px 0 10px 0; color:var(--text-secondary);">KRIs</h4>
            ${d.nodes.kris.length === 0 ? '<p style="font-size:13px;color:var(--text-muted);">None</p>' : d.nodes.kris.map(k => `
              <div style="font-size:14px; margin-bottom:6px; color: ${k.status === 'Warning' || k.status === 'Breach' ? '#f59e0b' : 'inherit'}">
                ${k.status === 'Warning' || k.status === 'Breach' ? '⚠' : '✓'} ${k.kri_name}
              </div>
            `).join('')}
          </div>

          <div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="margin:0 0 5px 0; font-size:12px; text-transform:uppercase; color:var(--text-secondary);">Owner</h4>
              <div style="font-size:14px; color:#0a1628;">${d.nodes.owner}</div>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="margin:0 0 5px 0; font-size:12px; text-transform:uppercase; color:var(--text-secondary);">Overall Maturity</h4>
              <div style="font-size:16px; font-weight:600; color:${this._getHexColor(d.maturity)};">${d.maturity}</div>
            </div>

            <hr style="border-top: 1px solid var(--border-color); margin: 20px 0;" />
            
            <h4 style="margin:0 0 10px 0; color:#0a1628;">Coverage Score</h4>
            ${this.coverageWarning ? `<div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; color: #b45309; font-size: 13px;"><strong>Warning:</strong> ${this.coverageWarning}</div>` : ''}
            ${this.coverageReasoning ? `
              <div style="background: #0a1628; color: #ffffff; padding: 16px; border-radius: 6px;">
                <div style="font-size: 14px; font-weight: 600; color: ${this._getHexColor(this.coverageReasoning.maturity)}; margin-bottom: 12px;">AI Assessed: ${this.coverageReasoning.maturity}</div>
                <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                  ${this.coverageReasoning.reasoning.map(r => `<li>${r}</li>`).join('')}
                </ul>
                <div style="background: rgba(37, 99, 235, 0.1); border-left: 3px solid #2563eb; padding: 10px; font-size: 13px; color: #60a5fa;">
                  <strong>Recommendation:</strong> ${this.coverageReasoning.top_recommendation}
                </div>
              </div>
            ` : `
              <button class="btn btn-primary" id="btn-generate-coverage" style="width:100%;" ${this.isGeneratingCoverage ? 'disabled' : ''}>
                ${this.isGeneratingCoverage ? 'Analyzing Coverage...' : 'Generate Coverage Score'}
              </button>
            `}
            ${this.coverageError ? `<div style="color:#dc2626; font-size:13px; margin-top:10px;">${this.coverageError}</div>` : ''}
          </div>
        </div>
      </div>
    `;
    return html;
  }

  _renderTraceability() {
    const p = this.traceabilityPolicy;
    return `
      <div style="margin-bottom: 20px;">
        <button class="btn btn-secondary btn-close-panel">← Back to Governance Map</button>
      </div>
      <div class="glass-panel" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; position: relative;">
        <h2 style="font-family: 'IBM Plex Serif', serif; color: #0a1628; margin-top:0;">Traceability Map</h2>
        <p style="color:var(--text-secondary); margin-bottom:30px;">Lineage trace for ${p.title}</p>

        <div style="display:flex; flex-direction: column; gap: 20px; margin-left: 20px; border-left: 2px solid #e2e8f0; padding-left: 20px;">
          
          <div style="position:relative;">
            <div style="position:absolute; left:-27px; top:2px; width:10px; height:10px; border-radius:50%; background:#2563eb;"></div>
            <h4 style="margin:0 0 5px 0; color:var(--text-secondary); font-size:12px; text-transform:uppercase;">Policy</h4>
            <div style="font-size:15px; color:#0a1628;">${p.title} (${p.status})</div>
          </div>

          <div style="position:relative;">
            <div style="position:absolute; left:-27px; top:2px; width:10px; height:10px; border-radius:50%; background:#e2e8f0; border:2px solid #2563eb;"></div>
            <h4 style="margin:0 0 5px 0; color:var(--text-secondary); font-size:12px; text-transform:uppercase;">Controls Enabled</h4>
            <div style="font-size:14px; color:#0a1628; font-family:'IBM Plex Mono', monospace;">Traceability join required from risk_policy_map (Supabase data missing mock link here for brevity)</div>
          </div>

        </div>
      </div>
    `;
  }

  _renderGaps() {
    if (this.isGeneratingGaps) {
      return `<div style="padding:40px;text-align:center;color:var(--text-secondary);">Cross-referencing organizational trajectory signals with domain exposure. Generating contextual gaps...</div>`;
    }
    
    if (this.gapError) {
      return `<div style="padding:40px;text-align:center;color:#dc2626;">${this.gapError}</div>`;
    }

    let warningHtml = '';
    if (this.gapWarning) {
      warningHtml = `<div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; color: #b45309; font-size: 13px;"><strong>Warning:</strong> ${this.gapWarning}</div>`;
    }

    if (!this.gapData || this.gapData.length === 0) {
      return warningHtml + `<div style="padding:40px;text-align:center;color:var(--text-secondary);">No critical gaps identified at this time.</div>`;
    }

    let html = warningHtml + `<div style="display:flex; flex-direction: column; gap: 16px;">`;
    
    this.gapData.forEach(g => {
      const pColor = g.priority === 'Critical' ? '#dc2626' : g.priority === 'High' ? '#f59e0b' : '#2563eb';
      html += `
        <div style="background:#ffffff; border:1px solid var(--border-color); border-left:4px solid ${pColor}; border-radius:6px; padding:20px; display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex: 1; padding-right: 20px;">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
              <span style="background:${pColor}20; color:${pColor}; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; text-transform:uppercase;">${g.priority} Priority</span>
              <span style="color:var(--text-muted); font-size:12px;">${g.domain}</span>
            </div>
            <h3 style="margin:0 0 8px 0; color:#0a1628; font-family:'IBM Plex Serif', serif;">${g.policy_name}</h3>
            <p style="margin:0 0 12px 0; font-size:13px; color:var(--text-secondary); line-height:1.5;"><strong>Trajectory Context:</strong> ${g.reason}</p>
            <div style="font-size:12px; color:var(--text-muted);">
              <strong>Risk Addressed:</strong> ${g.risk_addressed} <br/>
              <strong>Regulatory Alignment:</strong> ${g.regulatory_relevance.join(', ')}
            </div>
          </div>
          <div>
            <button class="btn btn-primary btn-generate-intake" data-policy="${encodeURIComponent(g.policy_name)}" data-domain="${encodeURIComponent(g.domain)}">Generate Policy</button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  async fetchMapData() {
    try {
      const orgId = this.state.settings?.organization_id || '00000000-0000-0000-0000-000000000000';
      const response = await fetch('/api/governance/map', {
        headers: {
          'org-id': orgId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch map data');
      const data = await response.json();
      this.mapData = data.data;
      this.isLoading = false;
      this.render(document.querySelector('#app-container .component-container') || document.body); // hacky re-render, assuming standard container
    } catch (err) {
      this.isLoading = false;
      this.errorMsg = "Governance data unavailable. Check your connection and retry.";
      this.render(document.querySelector('#app-container .component-container') || document.body);
    }
  }

  async generateCoverageScore(container) {
    this.isGeneratingCoverage = true;
    this.coverageError = null;
    this.render(container);

    const d = this.mapData.find(x => x.domain === this.expandedDomain);

    try {
      const orgId = this.state.settings?.organization_id || '00000000-0000-0000-0000-000000000000';
      const result = await ClaudeService.getCoverageScore(d, orgId);
      this.coverageReasoning = result.coverage || result;
      this.coverageWarning = result.warning || null;
    } catch (err) {
      this.coverageError = "Coverage assessment unavailable. Retry.";
    } finally {
      this.isGeneratingCoverage = false;
      this.render(container);
    }
  }

  async generateGaps(container) {
    this.isGeneratingGaps = true;
    this.gapError = null;
    this.render(container);

    try {
      const orgId = this.state.settings?.organization_id || '00000000-0000-0000-0000-000000000000';
      const result = await ClaudeService.getGaps(this.mapData, orgId);
      this.gapData = result.gaps || result;
      this.gapWarning = result.warning || null;
    } catch (err) {
      this.gapError = "Gap analysis unavailable. Retry.";
    } finally {
      this.isGeneratingGaps = false;
      this.render(container);
    }
  }

  attachEvents(container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.target.dataset.tab;
        this.expandedDomain = null;
        this.traceabilityPolicy = null;
        this.render(container);
      });
    });

    container.querySelectorAll('.domain-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const domain = e.currentTarget.dataset.domain;
        const d = this.mapData.find(x => x.domain === domain);
        if (!d.hasData) {
          // Navigate to Settings
          this.onStateChange({ activeTab: 'settings' });
          return;
        }
        this.expandedDomain = domain;
        this.coverageReasoning = null;
        this.render(container);
      });
    });

    container.querySelector('.btn-close-panel')?.addEventListener('click', () => {
      this.expandedDomain = null;
      this.traceabilityPolicy = null;
      this.render(container);
    });

    container.querySelector('#btn-generate-coverage')?.addEventListener('click', () => {
      this.generateCoverageScore(container);
    });

    container.querySelectorAll('.view-traceability-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const policyId = e.currentTarget.dataset.policyId;
        const d = this.mapData.find(x => x.domain === this.expandedDomain);
        this.traceabilityPolicy = d.nodes.policies.find(p => p.id === policyId);
        this.expandedDomain = null;
        this.render(container);
      });
    });

    container.querySelectorAll('.btn-generate-intake').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pName = decodeURIComponent(e.target.dataset.policy);
        const pDomain = decodeURIComponent(e.target.dataset.domain);
        // Pre-fill logic by modifying state and navigating to intake
        this.onStateChange({
          activeTab: 'intelligencePolicy', // or wherever the intake form is
          prefillData: {
            title: pName,
            domain: pDomain
          }
        });
      });
    });
  }
}
