// Settings Component - Enterprise Branding & API Key Configuration

import { StorageService } from '../services/storageService.js';

export class SettingsComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
  }

  render(container) {
    const s = this.state.settings;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">System Core Control</span>
          <h1>Platform Settings</h1>
          <p class="page-subtitle">Configure corporate metadata, UI brand names, and connect live LLM interfaces.</p>
        </div>
      </div>

      <div class="register-layout">
        
        <!-- LEFT: BRAND & API CORE -->
        <div class="details-panel">
          
          <!-- API KEY INTEGRATION -->
          <div class="glass-panel" style="background:rgba(99,102,241,0.03);border-color:rgba(99,102,241,0.25);">
            <h3 class="dashboard-card-title" style="color:var(--color-indigo);">
              <span>Gemini API Live Intelligence</span>
              <span class="status-badge ${s.geminiApiKey ? 'within' : 'near'}" style="font-size:10px;">
                ${s.geminiApiKey ? 'Connected (Live)' : 'Disconnected (Simulated)'}
              </span>
            </h3>
            
            <div class="form-group">
              <label>Gemini API Key</label>
              <input type="password" class="form-control" id="settings-api-key" 
                     value="${s.geminiApiKey || ''}" 
                     placeholder="AIzaSy..." />
              <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.3;">
                *Entering a valid Gemini API Key transitions the Board Brief and Q&A engine from local simulated NLP mapping to live, dynamic LLM responses. Get a key at <a href="https://aistudio.google.com/" target="_blank" style="color:var(--color-indigo);text-decoration:none;font-weight:600;">Google AI Studio</a>.
              </p>
            </div>
          </div>

          <!-- BRANDING & OBJECTIVES -->
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Corporate & Brand Profiles</h3>
            <form id="settings-form" onsubmit="return false;">
              
              <div class="form-group">
                <label>System Brand Name (UI Logo)</label>
                <select class="form-control" id="settings-brand-name">
                  <option value="NAVIS" ${s.brandName === 'NAVIS' ? 'selected' : ''}>NAVIS (Recommended)</option>
                  <option value="RiskOS" ${s.brandName === 'RiskOS' ? 'selected' : ''}>RiskOS</option>
                  <option value="ERM Navigator" ${s.brandName === 'ERM Navigator' ? 'selected' : ''}>ERM Navigator</option>
                  <option value="BoardRisk AI" ${s.brandName === 'BoardRisk AI' ? 'selected' : ''}>BoardRisk AI</option>
                </select>
              </div>

              <div class="form-group">
                <label>Company Legal Name</label>
                <input type="text" class="form-control" id="settings-company-name" value="${s.companyName || ''}" required />
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Revenue Bracket (INR)</label>
                  <input type="text" class="form-control" id="settings-revenue" value="${s.revenueBracket || ''}" required />
                </div>
                <div class="form-group">
                  <label>Strategic IPO Target Timeline</label>
                  <input type="text" class="form-control" id="settings-ipo" value="${s.ipoTimeline || ''}" required />
                </div>
              </div>

              <div style="display:flex;gap:12px;margin-top:16px;">
                <button class="btn btn-primary" id="btn-save-settings" style="flex-grow:1;justify-content:center;">Apply Configurations</button>
              </div>

            </form>
          </div>

        </div>

        <!-- RIGHT: META DATA DEFAULTS & REBOOT -->
        <div class="details-panel">
          
          <!-- SEED DEFAULTS -->
          <div class="glass-panel" style="background:rgba(255,42,84,0.02);border-color:rgba(255,42,84,0.15);">
            <h3 class="dashboard-card-title" style="color:var(--color-above-appetite);">Factory Systems Reset</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.4;margin-bottom:16px;">
              Rebooting the database restores all 12 preloaded Indian SaaS, DPDPA, and SOC 2 enterprise risk profiles, deleting any custom entries or keys.
            </p>
            <button class="btn btn-danger" id="btn-reset-db" style="width:100%;justify-content:center;">
              Reseed Default Risk Pack
            </button>
          </div>

          <!-- USER ROLE COMPILER -->
          <div class="glass-panel">
            <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Active Board Session Context</h4>
            <div class="form-group">
              <label>Current Active User Role</label>
              <select class="form-control" id="settings-role" style="font-size:12px;padding:6px 10px;">
                <option value="CRO (Chief Risk Officer)" ${s.activeUserRole === 'CRO (Chief Risk Officer)' ? 'selected' : ''}>CRO (Chief Risk Officer)</option>
                <option value="Board Member / Viewer" ${s.activeUserRole === 'Board Member / Viewer' ? 'selected' : ''}>Board Member / Viewer</option>
                <option value="Independent Director" ${s.activeUserRole === 'Independent Director' ? 'selected' : ''}>Independent Director</option>
                <option value="CEO & Founder" ${s.activeUserRole === 'CEO & Founder' ? 'selected' : ''}>CEO & Founder</option>
                <option value="Lead External Auditor" ${s.activeUserRole === 'Lead External Auditor' ? 'selected' : ''}>Lead External Auditor</option>
              </select>
            </div>
            <div style="font-size:11px;color:var(--text-muted);line-height:1.4;">
              *Changing the session context dynamically simulates different access views for board governance reporting.
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Save settings
    container.querySelector('#btn-save-settings').addEventListener('click', async () => {
      const form = container.querySelector('#settings-form');
      if (!form.reportValidity()) return;

      const updated = {
        brandName: container.querySelector('#settings-brand-name').value,
        companyName: container.querySelector('#settings-company-name').value,
        revenueBracket: container.querySelector('#settings-revenue').value,
        ipoTimeline: container.querySelector('#settings-ipo').value,
        geminiApiKey: container.querySelector('#settings-api-key').value,
        activeUserRole: container.querySelector('#settings-role').value
      };

      await StorageService.saveSettings(updated);
      this.state.settings = await StorageService.getSettings();

      // Dispatch global brand changes
      this.onStateChange({ settings: this.state.settings });

      // Visual feedback
      const btn = container.querySelector('#btn-save-settings');
      btn.textContent = "Configurations Applied! ✓";
      btn.style.backgroundColor = "var(--color-within-appetite)";
      setTimeout(() => {
        btn.textContent = "Apply Configurations";
        btn.style.backgroundColor = "var(--color-indigo)";
      }, 1500);
    });

    // Save active role trigger
    const roleSelect = container.querySelector('#settings-role');
    roleSelect.addEventListener('change', async () => {
      await StorageService.saveSettings({ activeUserRole: roleSelect.value });
      this.state.settings = await StorageService.getSettings();
      this.onStateChange({ settings: this.state.settings });
    });

    // Factory database reset
    container.querySelector('#btn-reset-db').addEventListener('click', async () => {
      if (confirm("Are you sure you want to restore factory default parameters? This will wipe your database and clear your Gemini API Key.")) {
        StorageService.resetToDefaults();
        
        // Refresh entire state and redirect to dashboard
        this.state.risks = await StorageService.getRisks();
        this.state.settings = await StorageService.getSettings();
        
        this.onStateChange({
          risks: this.state.risks,
          settings: this.state.settings,
          activeTab: 'dashboard'
        });
      }
    });
  }
}
