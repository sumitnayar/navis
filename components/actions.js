// Action Tracker Component - Establishing Board Accountability

import { StorageService } from '../services/storageService.js';
import { AIInsightService } from '../services/aiInsightService.js';

const cleanTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/^\[demo-trk-risk-\d+\]\s*/i, '')
    .replace(/^\[DEMO Trackier SaaS\]\s*/i, '')
    .trim();
};

export class ActionsComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.isAddingAction = false;
    this.filterToOverdueActions = false;
  }

  clearFilters() {
    this.filterToOverdueActions = false;
  }

  render(container) {
    const risks = this.state.risks;
    
    // Check search query parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'overdue') {
      this.filterToOverdueActions = true;
    }
    
    // Extract actions from all risks
    let allActions = risks.flatMap(r => 
      (r.actions || []).map(a => ({ ...a, riskId: r.id, riskTitle: r.title }))
    );

    const today = new Date();

    if (this.filterToOverdueActions) {
      allActions = allActions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today);
    }

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Corporate Accountability Board</span>
          <h1>Action Items Tracker</h1>
          <p class="page-subtitle">Assign operational actions to owners | Track due dates and audit completion velocities</p>
        </div>
      </div>

      <!-- AI INSIGHT CONTAINER -->
      <div id="ai-insight-container"></div>

      <div class="register-layout">
        
        <!-- LEFT: LIST OF ACTION ITEMS -->
        <div class="details-panel">
          <div class="glass-panel" style="min-height:500px;">
            <h3 class="dashboard-card-title">
              <span>Accountability Checklist</span>
              <button class="btn btn-primary btn-small no-print" id="btn-add-action">
                ${this.isAddingAction ? 'Close Form' : 'Deploy Action'}
              </button>
            </h3>

            <!-- ADD ACTION FORM -->
            ${this.isAddingAction ? `
              <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:16px;">
                <form id="action-form" onsubmit="return false;">
                  <div class="form-group">
                    <label>Target Board Risk</label>
                    <select class="form-control" id="action-risk-id" required>
                      ${risks.map(r => `<option value="${r.id}" title="ID: ${r.id}">${cleanTitle(r.title)}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Action Objective</label>
                    <input type="text" class="form-control" id="action-title" placeholder="e.g. Recruits VP of Engineering to transfer R&D dependencies" required />
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                      <label>Action Owner</label>
                      <input type="text" class="form-control" id="action-owner" placeholder="e.g. Chief People Officer" required />
                    </div>
                    <div class="form-group">
                      <label>Due Date</label>
                      <input type="date" class="form-control" id="action-date" required />
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                      <label>Priority</label>
                      <select class="form-control" id="action-priority">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Task Status</label>
                      <select class="form-control" id="action-status">
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <button class="btn btn-primary btn-small" id="btn-save-action" style="width:100%;justify-content:center;margin-top:8px;">Deploy Action Item</button>
                </form>
              </div>
            ` : ''}

            <!-- ACTION CHECKLIST CARDS -->
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${allActions.length ? allActions.map(a => {
                const isCompleted = a.status === 'Completed';
                const isOverdue = !isCompleted && new Date(a.dueDate) < today;
                
                let prioColor = 'var(--text-secondary)';
                if (a.priority === 'High') prioColor = 'var(--color-above-appetite)';
                else if (a.priority === 'Medium') prioColor = 'var(--color-near-appetite)';

                return `
                  <div style="padding:16px;background:rgba(255,255,255,0.015);border:${this.filterToOverdueActions ? '2px dashed var(--color-above-appetite)' : isOverdue ? '1px solid rgba(255,42,84,0.15)' : '1px solid var(--border-color)'};border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:16px;position:relative;overflow:hidden;transition:all 0.2s ease;">
                    
                    <!-- Overdue warning indicator background -->
                    ${isOverdue ? `<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--color-above-appetite);"></div>` : ''}

                    <div style="display:flex;align-items:flex-start;gap:12px;flex-grow:1;">
                      <div class="no-print" style="margin-top:3px;">
                        <input type="checkbox" class="action-toggle-check" 
                               data-risk-id="${a.riskId}" 
                               data-act-id="${a.id}" 
                               style="width:18px;height:18px;cursor:pointer;accent-color:var(--color-within-appetite);" 
                               ${isCompleted ? 'checked' : ''} />
                      </div>
                      <div>
                        <div style="font-weight:600;font-size:13px;color:${isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${isCompleted ? 'line-through' : 'none'};display:flex;align-items:center;gap:4px;">
                          <span>${a.title}</span>
                          <button class="ai-explain-icon-btn ai-explain-trigger" data-explain-type="action" data-explain-id="${a.id}" data-explain-risk="${a.riskId}" aria-label="AI Explain" style="border:none;background:none;cursor:pointer;color:var(--color-indigo);padding:0;display:flex;align-items:center;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px;">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                            </svg>
                          </button>
                        </div>
                        <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">
                          Mapped Risk: <span style="font-weight:600;" title="ID: ${a.riskId}">${cleanTitle(a.riskTitle)}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display:flex;align-items:center;gap:16px;flex-shrink:0;">
                      <div style="text-align:right;">
                        <div style="font-size:11px;font-weight:700;color:${prioColor}">${a.priority} Priority</div>
                        <div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">Owner: ${a.owner}</div>
                      </div>

                      <div style="text-align:right;">
                        <div style="font-size:11px;font-weight:600;color:${isOverdue ? 'var(--color-above-appetite)' : 'var(--text-secondary)'};">
                          ${isOverdue ? 'OVERDUE' : 'Due'}
                        </div>
                        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${a.dueDate}</div>
                      </div>
                    </div>

                  </div>
                `;
              }).join('') : `
                <div style="text-align:center;color:var(--text-muted);padding:40px;">
                  No action items deployed yet. Use the button to map accountability.
                </div>
              `}
            </div>

          </div>
        </div>

        <!-- RIGHT: BOARD ACCOUNTABILITY METRICS -->
        <div class="details-panel">
          <div class="glass-panel" style="background:rgba(99,102,241,0.02);">
            <h4 style="font-size:11px;color:var(--color-indigo);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Accountability Performance</h4>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;">
              <span style="color:var(--text-secondary);">Total Actions:</span>
              <span style="font-weight:700;">${allActions.length}</span>
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;">
              <span style="color:var(--text-secondary);">Completed Actions:</span>
              <span style="font-weight:700;color:var(--color-within-appetite);">${allActions.filter(a => a.status === 'Completed').length}</span>
            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:12px;">
              <span style="color:var(--text-secondary);">Overdue Actions:</span>
              <span style="font-weight:700;color:var(--color-above-appetite);">${allActions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length}</span>
            </div>

            <!-- Task completion progress bar -->
            <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;margin-top:16px;">
              <div style="height:100%;background:var(--color-within-appetite);width:${Math.round((allActions.filter(a => a.status === 'Completed').length / (allActions.length || 1)) * 100)}%;"></div>
            </div>
            <div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:6px;">
              Task Completion Rate: ${Math.round((allActions.filter(a => a.status === 'Completed').length / (allActions.length || 1)) * 100)}%
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Add action toggle button
    const addActionBtn = container.querySelector('#btn-add-action');
    if (addActionBtn) {
      addActionBtn.addEventListener('click', () => {
        this.isAddingAction = !this.isAddingAction;
        this.render(container);
      });
    }

    // Toggle Action completion checkbox
    container.querySelectorAll('.action-toggle-check').forEach(check => {
      check.addEventListener('change', async () => {
        const riskId = check.dataset.riskId;
        const actId = check.dataset.actId;

        const targetRisk = this.state.risks.find(r => r.id === riskId);
        if (targetRisk) {
          const actIndex = targetRisk.actions?.findIndex(a => a.id === actId);
          if (actIndex > -1) {
            targetRisk.actions[actIndex].status = check.checked ? 'Completed' : 'In Progress';
            await StorageService.saveRisk(targetRisk);
            
            // Refresh state
            this.state.risks = await StorageService.getRisks();
            this.render(container);
            this.onStateChange({ risks: this.state.risks });
          }
        }
      });
    });

    // Save deployed action
    const saveActionBtn = container.querySelector('#btn-save-action');
    if (saveActionBtn) {
      saveActionBtn.addEventListener('click', async () => {
        const form = container.querySelector('#action-form');
        if (!form.reportValidity()) return;

        const targetId = container.querySelector('#action-risk-id').value;
        const targetRisk = this.state.risks.find(r => r.id === targetId);

        if (targetRisk) {
          const actions = targetRisk.actions || [];
          actions.push({
            id: `act-${Date.now().toString().slice(-6)}`,
            title: container.querySelector('#action-title').value,
            owner: container.querySelector('#action-owner').value,
            dueDate: container.querySelector('#action-date').value,
            priority: container.querySelector('#action-priority').value,
            status: container.querySelector('#action-status').value
          });

          targetRisk.actions = actions;
          await StorageService.saveRisk(targetRisk);

          // Refresh state
          this.state.risks = await StorageService.getRisks();
          this.isAddingAction = false;
          this.render(container);
          this.onStateChange({ risks: this.state.risks });
        }
      });
    }

    // Click-to-Explain Bindings
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = trigger.dataset.explainType;
        const id = trigger.dataset.explainId;
        const riskId = trigger.dataset.explainRisk;
        
        let item = null;
        if (type === 'action') {
          const risk = this.state.risks.find(r => r.id === riskId);
          const act = risk?.actions?.find(a => a.id === id);
          if (act) {
            item = { ...act, riskTitle: risk.title, riskId: risk.id };
          }
        }
        
        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });

    // Render page-level AI insights card
    const insightContainer = container.querySelector('#ai-insight-container');
    if (insightContainer) {
      AIInsightService.renderPageInsightCard('actions', insightContainer, this.state);
    }

    // Render Back to Dashboard banner if filtered
    if (this.filterToOverdueActions) {
      AIInsightService.renderBackToDashboardBanner(this, container, 'Overdue Strategic Actions');
    }
  }
}
