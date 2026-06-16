// Strategic Objectives Module - Visualizing Goal Thread Exposure (F1)

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';


export class ObjectivesComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedObjectiveId = this.state.editingObjectiveId || null;
    this.isLinkingRisk = false;
    this.deepLinked = !!this.state.editingObjectiveId;

    // Parse search query parameters
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id');
    if (targetId) {
      this.selectedObjectiveId = targetId;
      this.deepLinked = true;
    }
  }

  clearFilters() {
    this.selectedObjectiveId = null;
    this.deepLinked = false;
    if (this.state) {
      this.state.editingObjectiveId = null;
    }
  }

  // Calculate aggregate exposure of linked risks
  calculateAggregateExposure(linkedRisks) {
    if (!linkedRisks.length) return { text: 'No Active Threat', score: 0, class: 'within' };
    
    // Find the highest residual score in the linked chain
    const maxScore = Math.max(...linkedRisks.map(r => r.residualScore || 0));
    
    if (maxScore >= 16) {
      return { text: 'High Exposure', score: maxScore, class: 'above' };
    } else if (maxScore >= 11) {
      return { text: 'Medium Exposure', score: maxScore, class: 'near' };
    } else {
      return { text: 'Low Exposure', score: maxScore, class: 'within' };
    }
  }

  render(container) {
    const objectives = this.state.objectives || [];
    const risks = this.state.risks || [];
    
    // Auto-select the first objective if none is selected
    if (!this.selectedObjectiveId && objectives.length > 0) {
      this.selectedObjectiveId = objectives[0].id;
    }
    
    const selectedObj = objectives.find(o => o.id === this.selectedObjectiveId);

    // Map objectives with their active linked risks
    const mappedObjectives = objectives.map(obj => {
      const linked = risks.filter(r => r.objectiveIds && r.objectiveIds.includes(obj.id));
      const exposure = this.calculateAggregateExposure(linked);
      return { ...obj, linked, exposure };
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Goal Alignment Framework</span>
          <h1>Strategic Objectives threatened</h1>
          <p class="page-subtitle">Map enterprise risks to strategic target objectives | Visualize aggregate threat profiles</p>
        </div>
      </div>

      <div class="register-layout">
        
        <!-- LEFT: LIST OF OBJECTIVE CARDS -->
        <div class="details-panel">
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${mappedObjectives.map(obj => {
              const isSelected = this.selectedObjectiveId === obj.id;
              
              let statusClass = 'within';
              if (obj.status === 'Critical Gaps') statusClass = 'above';
              else if (obj.status === 'At Risk') statusClass = 'near';

              return `
                <div class="glass-panel clickable ${isSelected ? 'selected' : ''}" 
                     style="padding:16px; border-left:4px solid ${obj.exposure.class === 'above' ? 'var(--color-above-appetite)' : obj.exposure.class === 'near' ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'};"
                     data-id="${obj.id}">
                  
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <div>
                      <span class="profile-role-badge" style="font-size:9px;color:var(--color-indigo);">${obj.importance} Priority</span>
                      <h3 style="font-size:15px;font-weight:700;margin-top:2px;color:var(--text-primary);">${obj.title}</h3>
                    </div>
                    <span class="status-badge ${statusClass}" style="font-size:9px;padding:2px 8px;">
                      ${obj.status}
                    </span>
                  </div>

                  <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-bottom:12px;">
                    ${obj.successMetrics.slice(0, 100)}...
                  </p>

                  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:10px;font-size:11px;">
                    <span style="color:var(--text-secondary);">Linked Risks: <strong>${obj.linked.length} Elements</strong></span>
                    <span class="status-badge ${obj.exposure.class}" style="font-size:9px;padding:1px 6px;">
                      ${obj.exposure.text} (${obj.exposure.score})
                    </span>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- RIGHT: MAPPED THREAT DRILLDOWN -->
        <div class="details-panel no-print">
          <div class="glass-panel" style="min-height:480px;display:flex;flex-direction:column;justify-content:space-between;">
            ${selectedObj ? this.renderDrilldown(selectedObj, risks) : `
              <div style="text-align:center;color:var(--text-muted);padding-top:160px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" style="width:48px;height:48px;margin:0 auto 12px;opacity:0.3;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Select an organizational objective on the left to inspect linked board risks, aggregate scores, and success metrics.
              </div>
            `}
          </div>
        </div>

      </div>
    `;

    if (selectedObj) {
      const linked = risks.filter(r => r.objectiveIds && r.objectiveIds.includes(selectedObj.id));
      const aggregateScore = Math.min(30, linked.reduce((sum, r) => sum + (r.residualScore || 0), 0));
      setTimeout(() => {
        const fillEl = container.querySelector('.exposure-progress-fill');
        if (fillEl) fillEl.style.width = `${(aggregateScore / 30) * 100}%`;
      }, 50);
    }

    this.bindEvents(container);
    // Render Back to Dashboard banner if filtered
    if (this.deepLinked) {
      AIInsightService.renderBackToDashboardBanner(this, container, 'Exposed Strategic Objective');
    }

    if (this.selectedObjectiveId) {
      setTimeout(() => {
        const card = container.querySelector(`[data-id="${this.selectedObjectiveId}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.outline = '2px dashed var(--color-indigo)';
          card.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.4)';
        }
      }, 100);
    }
  }

  renderDrilldown(obj, risks) {
    const linked = risks.filter(r => r.objectiveIds && r.objectiveIds.includes(obj.id));
    const unlinked = risks.filter(r => !r.objectiveIds || !r.objectiveIds.includes(obj.id));
    const exposure = this.calculateAggregateExposure(linked);

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      warning: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#D97706',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626',
      navy: getComputedStyle(document.documentElement).getPropertyValue('--color-navy').trim() || '#0F172A'
    };

    const aggregateScore = Math.min(30, linked.reduce((sum, r) => sum + (r.residualScore || 0), 0));
    const appetiteLimit = 15;
    const appetiteLimitPct = (appetiteLimit / 30) * 100;
    let barColor = tokens.safe;
    if (aggregateScore > 20) barColor = tokens.critical;
    else if (aggregateScore > 10) barColor = tokens.warning;

    return `
      <div>
        <span class="profile-role-badge" style="margin-bottom:4px;">${obj.importance} Strategic Alignment</span>
        <h3 style="font-size:18px;line-height:1.2;margin-bottom:8px;">${obj.title}</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:14px;">
          <span class="status-badge ${exposure.class}" style="font-size:10px;">
            Aggregate Exposure: ${exposure.text} (${exposure.score})
          </span>
        </div>

        <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:10px;padding:12px;margin-bottom:16px;">
          <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Target Success Metrics</h4>
          <p style="font-size:12px;color:var(--text-primary);line-height:1.4;">
            ${obj.successMetrics}
          </p>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:10px;">
            <span>Target Date: <strong>${obj.targetDate}</strong></span>
            <span>Owner: <strong>${obj.owner}</strong></span>
          </div>
        </div>

        <!-- Exposure Bar -->
        <div style="margin-bottom: 24px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Aggregate Exposure</span>
            <span style="font-size: 12px; font-weight: 700; color: ${aggregateScore > appetiteLimit ? tokens.critical : tokens.navy};">${aggregateScore} / 30</span>
          </div>
          <div style="width: 100%; height: 8px; background: rgba(13,27,42,0.08); border-radius: 4px; position: relative; margin-top: 18px; margin-bottom: 12px;">
            <!-- Appetite Limit Marker -->
            <div style="position: absolute; left: ${appetiteLimitPct}%; top: -14px; display: flex; flex-direction: column; align-items: center; transform: translateX(-50%); z-index: 5;">
              <span style="font-size: 9px; color: rgba(13,27,42,0.6); white-space: nowrap; font-weight: 500;">Appetite limit</span>
              <div style="width: 1px; height: 16px; background-color: rgba(13,27,42,0.3); margin-top: 1px;"></div>
            </div>
            <!-- Progress Fill -->
            <div class="exposure-progress-fill" style="height: 100%; width: 0%; border-radius: 4px; background-color: ${barColor}; transition: width 400ms ease-out;"></div>
          </div>
        </div>

        <!-- LINKED RISK CHIPS -->
        <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Threatened Risk Ledger (${linked.length})</h4>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;margin-bottom:16px;">
          ${linked.length ? linked.map(r => `
            <div style="padding:8px 10px;background:rgba(0,0,0,0.015);border:1px solid var(--border-color);border-radius:6px;display:flex;justify-content:space-between;align-items:center;font-size:11px;">
              <div class="ai-explain-trigger" data-explain-type="risk" data-explain-id="${r.id}" style="cursor:pointer;flex-grow:1;">
                <strong style="color:var(--text-primary);display:flex;align-items:center;gap:4px;">
                  <span title="ID: ${r.id}">${r.title}</span>
                  <button class="ai-explain-icon-btn" aria-label="AI Explain">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                    </svg>
                  </button>
                </strong>
                <div style="color:var(--text-muted);font-size:9px;">Category: ${r.category} | Owner: ${r.owner}</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="status-badge ${r.appetiteStatus === 'Above Appetite' ? 'above' : r.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size:9px;padding:1px 6px;">
                  ${r.residualScore}
                </span>
                <span class="btn-unlink-risk" style="cursor:pointer;color:var(--color-above-appetite);font-weight:700;" data-risk-id="${r.id}">✕</span>
              </div>
            </div>
          `).join('') : '<p style="font-size:11px;color:var(--text-muted);text-align:center;">No threat vectors mapped to this objective.</p>'}
        </div>

        <!-- LINK RISK FORM TOGGLE -->
        ${this.isLinkingRisk ? `
          <div style="border-top:1px solid var(--border-color);padding-top:12px;margin-top:12px;">
            <label style="display:block;font-size:10px;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;font-weight:600;">Link Existing risk element</label>
            <div style="display:flex;gap:8px;">
              <select class="form-control" id="select-unlinked-risk" style="font-size:11px;padding:6px;height:30px;">
                ${unlinked.map(r => `<option value="${r.id}" title="ID: ${r.id}">${r.title}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-small" id="btn-submit-link" style="padding:4px 12px;height:30px;">Link</button>
            </div>
          </div>
        ` : ''}

      </div>

      <button class="btn btn-secondary btn-small" id="btn-toggle-link-risk" style="width:100%;justify-content:center;margin-top:12px;">
        ${this.isLinkingRisk ? 'Cancel Linking' : 'Link Risk Element'}
      </button>
    `;
  }

  bindEvents(container) {
    // Click on Objective Card
    const cards = container.querySelectorAll('.glass-panel.clickable');
    cards.forEach(c => {
      c.addEventListener('click', () => {
        this.selectedObjectiveId = c.dataset.id;
        this.isLinkingRisk = false; // Reset form
        this.render(container);
      });
    });

    // Toggle link risk form
    const toggleLinkBtn = container.querySelector('#btn-toggle-link-risk');
    if (toggleLinkBtn) {
      toggleLinkBtn.addEventListener('click', () => {
        this.isLinkingRisk = !this.isLinkingRisk;
        this.render(container);
      });
    }

    // Submit risk linking
    const submitLinkBtn = container.querySelector('#btn-submit-link');
    if (submitLinkBtn) {
      submitLinkBtn.addEventListener('click', async () => {
        const riskId = container.querySelector('#select-unlinked-risk').value;
        const targetRisk = this.state.risks.find(r => r.id === riskId);
        
        if (targetRisk && this.selectedObjectiveId) {
          const objectiveIds = targetRisk.objectiveIds || [];
          if (!objectiveIds.includes(this.selectedObjectiveId)) {
            objectiveIds.push(this.selectedObjectiveId);
            targetRisk.objectiveIds = objectiveIds;
            
            await StorageService.saveRisk(targetRisk);
            
            // Refresh state
            this.state.risks = await StorageService.getRisks();
            this.isLinkingRisk = false;
            this.render(container);
            
            this.onStateChange({ risks: this.state.risks });
          }
        }
      });
    }

    // Unlink risk click
    const unlinkBtns = container.querySelectorAll('.btn-unlink-risk');
    unlinkBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Avoid triggering card clicks
        const riskId = btn.dataset.riskId;
        const targetRisk = this.state.risks.find(r => r.id === riskId);
        
        if (targetRisk && this.selectedObjectiveId) {
          let objectiveIds = targetRisk.objectiveIds || [];
          objectiveIds = objectiveIds.filter(id => id !== this.selectedObjectiveId);
          targetRisk.objectiveIds = objectiveIds;
          
          await StorageService.saveRisk(targetRisk);
          
          // Refresh state
          this.state.risks = await StorageService.getRisks();
          this.render(container);
          this.onStateChange({ risks: this.state.risks });
        }
      });
    });

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
  }
}
