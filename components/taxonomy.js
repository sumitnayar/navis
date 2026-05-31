// Centralized 3-tier Taxonomy Manager with version checks (F2)

import { StorageService } from '../services/storageService.js';

export class TaxonomyComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.activeL1 = null;
    this.activeL2 = null;
    this.activeL3 = null;
    
    // UI states
    this.isCreating = false;
    this.newLevel = 'L1'; // L1, L2, or L3
    this.formError = '';
    this.version = 3.1; // Version control
  }

  // Load custom taxonomy tree or derive from seeded risks
  getTaxonomyTree(risks) {
    const tree = {};

    // 1. Load default seeds
    risks.forEach(r => {
      const l1 = r.l1 || r.category || 'Unclassified';
      const l2 = r.l2 || 'General';
      const l3 = r.l3 || 'Other';

      if (!tree[l1]) tree[l1] = {};
      if (!tree[l1][l2]) tree[l1][l2] = new Set();
      tree[l1][l2].add(l3);
    });

    // 2. Load custom added ones from local storage
    const customTax = localStorage.getItem('navis_v3_taxonomies');
    if (customTax) {
      try {
        const list = JSON.parse(customTax);
        list.forEach(item => {
          const { l1, l2, l3 } = item;
          if (l1) {
            if (!tree[l1]) tree[l1] = {};
            if (l2) {
              if (!tree[l1][l2]) tree[l1][l2] = new Set();
              if (l3) {
                tree[l1][l2].add(l3);
              }
            }
          }
        });
      } catch (e) {
        console.error("Failed to parse custom taxonomies", e);
      }
    }

    // Convert Sets to Arrays for rendering
    const formattedTree = {};
    Object.keys(tree).forEach(l1 => {
      formattedTree[l1] = {};
      Object.keys(tree[l1]).forEach(l2 => {
        formattedTree[l1][l2] = Array.from(tree[l1][l2]);
      });
    });

    return formattedTree;
  }

  saveCustomTaxonomy(l1, l2, l3) {
    const customTax = localStorage.getItem('navis_v3_taxonomies');
    let list = [];
    if (customTax) {
      try {
        list = JSON.parse(customTax);
      } catch (e) {}
    }
    list.push({ l1, l2, l3 });
    localStorage.setItem('navis_v3_taxonomies', JSON.stringify(list));
    
    // Increment minor version to represent version checks
    this.version = parseFloat((this.version + 0.1).toFixed(2));
    localStorage.setItem('navis_v3_taxonomy_version', this.version.toString());
  }

  render(container) {
    const risks = this.state.risks || [];
    const tree = this.getTaxonomyTree(risks);
    const storedVer = localStorage.getItem('navis_v3_taxonomy_version') || '3.1';
    this.version = parseFloat(storedVer);

    // Default L1 selection
    if (!this.activeL1 && Object.keys(tree).length > 0) {
      this.activeL1 = Object.keys(tree)[0];
    }
    // Default L2 selection
    if (this.activeL1 && tree[this.activeL1] && !this.activeL2 && Object.keys(tree[this.activeL1]).length > 0) {
      this.activeL2 = Object.keys(tree[this.activeL1])[0];
    }

    const l2s = this.activeL1 ? Object.keys(tree[this.activeL1] || {}) : [];
    const l3s = (this.activeL1 && this.activeL2) ? (tree[this.activeL1][this.activeL2] || []) : [];

    // Count risks in current active branch
    const filteredRisks = risks.filter(r => {
      const matchL1 = (r.l1 || r.category) === this.activeL1;
      const matchL2 = r.l2 === this.activeL2;
      return matchL1 && matchL2;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Enterprise Risk Standard</span>
          <h1>Centralized 3-tier Taxonomy</h1>
          <p class="page-subtitle">Configure structured risk classifications | Verify compliance using version controls</p>
        </div>
        <div class="header-actions">
          <span class="status-badge within" style="padding: 6px 12px; font-weight: 600; font-size:12px;">
            Taxonomy Registry Version: v${this.version.toFixed(1)}
          </span>
        </div>
      </div>

      <div class="register-layout">
        
        <!-- LEFT: THE THREE TIER BROWSER -->
        <div class="details-panel" style="flex: 2;">
          <div class="glass-panel" style="padding: 20px;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 class="dashboard-card-title" style="margin: 0;">Hierarchy Navigator</h3>
              <button class="btn btn-primary btn-small" id="btn-add-taxonomy-node">
                + Create Taxonomy Node
              </button>
            </div>

            <!-- TIER CARDS GRID -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
              
              <!-- TIER 1: L1 CATEGORIES -->
              <div style="background: rgba(0,0,0,0.01); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; font-weight: 700; letter-spacing: 0.5px;">
                  L1 Category
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.keys(tree).map(l1 => `
                    <div class="taxonomy-node-pill ${this.activeL1 === l1 ? 'active' : ''}" 
                         data-l1="${l1}" style="cursor: pointer; padding: 10px; border-radius: 8px; border: 1px solid ${this.activeL1 === l1 ? 'var(--color-indigo)' : 'var(--border-color)'}; background: ${this.activeL1 === l1 ? 'rgba(99,102,241,0.06)' : 'var(--bg-primary)'}; font-size: 12px; font-weight: 600; color: ${this.activeL1 === l1 ? 'var(--color-indigo)' : 'var(--text-primary)'};">
                      ${l1}
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- TIER 2: L2 SUBCATEGORIES -->
              <div style="background: rgba(0,0,0,0.01); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; font-weight: 700; letter-spacing: 0.5px;">
                  L2 Subcategory
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${l2s.length ? l2s.map(l2 => `
                    <div class="taxonomy-node-pill ${this.activeL2 === l2 ? 'active' : ''}" 
                         data-l2="${l2}" style="cursor: pointer; padding: 10px; border-radius: 8px; border: 1px solid ${this.activeL2 === l2 ? 'var(--color-indigo)' : 'var(--border-color)'}; background: ${this.activeL2 === l2 ? 'rgba(99,102,241,0.06)' : 'var(--bg-primary)'}; font-size: 12px; font-weight: 600; color: ${this.activeL2 === l2 ? 'var(--color-indigo)' : 'var(--text-primary)'};">
                      ${l2}
                    </div>
                  `).join('') : '<p style="font-size: 11px; color: var(--text-muted); text-align: center; padding-top: 20px;">Select an L1 category</p>'}
                </div>
              </div>

              <!-- TIER 3: L3 ROOT CAUSES -->
              <div style="background: rgba(0,0,0,0.01); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; font-weight: 700; letter-spacing: 0.5px;">
                  L3 Root Cause
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${l3s.length ? l3s.map(l3 => `
                    <div class="taxonomy-node-pill" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); font-size: 12px; font-weight: 500; color: var(--text-primary);">
                      ${l3}
                    </div>
                  `).join('') : '<p style="font-size: 11px; color: var(--text-muted); text-align: center; padding-top: 20px;">Select an L2 subcategory</p>'}
                </div>
              </div>

            </div>

          </div>
        </div>

        <!-- RIGHT: MAPPED RISKS AND CREATION MODULE -->
        <div class="details-panel" style="flex: 1.2;">
          
          <!-- NODE CREATOR FORM -->
          ${this.isCreating ? `
            <div class="glass-panel" style="padding: 20px; border-color: var(--color-indigo); margin-bottom: 16px;">
              <h3 class="dashboard-card-title" style="color: var(--color-indigo);">Create Taxonomy Node</h3>
              
              <div class="form-group">
                <label>Taxonomy Tier level</label>
                <select class="form-control" id="new-node-level" style="font-size:12px;">
                  <option value="L1">L1 Category (Top level)</option>
                  <option value="L2">L2 Subcategory (Under ${this.activeL1 || 'selected L1'})</option>
                  <option value="L3">L3 Root Cause (Under ${this.activeL1 || 'L1'} > ${this.activeL2 || 'L2'})</option>
                </select>
              </div>

              <div class="form-group" id="node-parent-l1-group" style="display:none;">
                <label>Parent L1 Category</label>
                <select class="form-control" id="node-parent-l1" style="font-size:12px;">
                  ${Object.keys(tree).map(l1 => `<option value="${l1}">${l1}</option>`).join('')}
                </select>
              </div>

              <div class="form-group" id="node-parent-l2-group" style="display:none;">
                <label>Parent L2 Subcategory</label>
                <select class="form-control" id="node-parent-l2" style="font-size:12px;">
                  ${l2s.map(l2 => `<option value="${l2}">${l2}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Node Name (Title)</label>
                <input type="text" class="form-control" id="new-node-name" placeholder="e.g. Talent Acquisition" required />
              </div>

              ${this.formError ? `<p style="color:var(--color-above-appetite);font-size:11px;margin-bottom:12px;">${this.formError}</p>` : ''}

              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-small" id="btn-save-taxonomy" style="flex: 1; justify-content: center;">Save</button>
                <button class="btn btn-secondary btn-small" id="btn-cancel-taxonomy" style="flex: 1; justify-content: center;">Cancel</button>
              </div>
            </div>
          ` : ''}

          <!-- MAPPED RISKS LEDGER -->
          <div class="glass-panel" style="padding: 20px;">
            <h3 class="dashboard-card-title">Risks in Active Branch</h3>
            <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.3;">
              The following risks are currently mapped to L1: <strong>${this.activeL1 || 'None'}</strong> | L2: <strong>${this.activeL2 || 'None'}</strong>
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${filteredRisks.length ? filteredRisks.map(r => `
                <div style="padding: 10px; background: rgba(0,0,0,0.015); border: 1px solid var(--border-color); border-radius: 8px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <strong style="color: var(--text-primary); cursor: pointer;" class="taxonomy-risk-link" data-risk-id="${r.id}">
                      [${r.id}] ${r.title}
                    </strong>
                    <span class="status-badge ${r.appetiteStatus === 'Above Appetite' ? 'above' : r.appetiteStatus === 'Near Appetite' ? 'near' : 'within'}" style="font-size: 8px; padding: 1px 4px;">
                      ${r.residualScore}
                    </span>
                  </div>
                  <p style="font-size: 10px; color: var(--text-muted); line-height: 1.3; margin: 0;">
                    Cause: ${r.l3 || 'Unspecified'} | Owner: ${r.owner}
                  </p>
                </div>
              `).join('') : `
                <div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 11px;">
                  No active risks mapped under this specific taxonomy category pathway.
                </div>
              `}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents(container, tree);
  }

  bindEvents(container, tree) {
    // 1. Click L1 Node
    const l1Nodes = container.querySelectorAll('[data-l1]');
    l1Nodes.forEach(node => {
      node.addEventListener('click', () => {
        this.activeL1 = node.dataset.l1;
        // Auto-select first L2 under this L1
        const subcategories = Object.keys(tree[this.activeL1] || {});
        this.activeL2 = subcategories.length ? subcategories[0] : null;
        this.render(container);
      });
    });

    // 2. Click L2 Node
    const l2Nodes = container.querySelectorAll('[data-l2]');
    l2Nodes.forEach(node => {
      node.addEventListener('click', () => {
        this.activeL2 = node.dataset.l2;
        this.render(container);
      });
    });

    // 3. Toggle Creator Panel
    const addBtn = container.querySelector('#btn-add-taxonomy-node');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.isCreating = true;
        this.formError = '';
        this.render(container);
      });
    }

    const cancelBtn = container.querySelector('#btn-cancel-taxonomy');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.isCreating = false;
        this.formError = '';
        this.render(container);
      });
    }

    // 4. Toggle level select triggers parent selectors display
    const levelSelect = container.querySelector('#new-node-level');
    if (levelSelect) {
      levelSelect.addEventListener('change', () => {
        const val = levelSelect.value;
        const l1Group = container.querySelector('#node-parent-l1-group');
        const l2Group = container.querySelector('#node-parent-l2-group');
        
        if (val === 'L1') {
          l1Group.style.display = 'none';
          l2Group.style.display = 'none';
        } else if (val === 'L2') {
          l1Group.style.display = 'block';
          l2Group.style.display = 'none';
        } else {
          l1Group.style.display = 'block';
          l2Group.style.display = 'block';
        }
      });
    }

    // 5. Save Node
    const saveBtn = container.querySelector('#btn-save-taxonomy');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const level = container.querySelector('#new-node-level').value;
        const name = container.querySelector('#new-node-name').value.trim();

        if (!name) {
          this.formError = "Node title cannot be empty.";
          this.render(container);
          return;
        }

        let l1 = '';
        let l2 = '';
        let l3 = '';

        if (level === 'L1') {
          l1 = name;
        } else if (level === 'L2') {
          l1 = container.querySelector('#node-parent-l1').value;
          l2 = name;
        } else {
          l1 = container.querySelector('#node-parent-l1').value;
          l2 = container.querySelector('#node-parent-l2').value;
          l3 = name;
        }

        this.saveCustomTaxonomy(l1, l2, l3);
        
        // Refresh active views to show newly added item
        this.activeL1 = l1;
        if (l2) this.activeL2 = l2;
        this.isCreating = false;
        this.formError = '';
        
        this.render(container);
      });
    }

    // 6. Deep Link risk to Register Form
    const riskLinks = container.querySelectorAll('.taxonomy-risk-link');
    riskLinks.forEach(lnk => {
      lnk.addEventListener('click', () => {
        const riskId = lnk.dataset.riskId;
        this.onStateChange({
          editingRiskId: riskId,
          activeTab: 'register'
        });
      });
    });
  }
}
