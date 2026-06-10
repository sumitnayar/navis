// Settings Component - Enterprise Branding & API Key Configuration

import { StorageService } from '../services/storageService.js';

export class SettingsComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.demoMessage = null;
    this.demoMessageType = 'success';
    this.demoBusy = false;
  }

  render(container) {
    const s = this.state.settings;
    const demoCounts = StorageService.getDemoDataCounts();

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
              <span class="status-badge" style="font-size:10px; background:${this.state.serverGeminiConfigured ? 'var(--color-safe-bg)' : s.geminiApiKey ? 'var(--color-warning-bg)' : 'var(--color-critical-bg)'}; color:${this.state.serverGeminiConfigured ? 'var(--color-safe)' : s.geminiApiKey ? 'var(--color-warning)' : 'var(--color-critical)'}; border:1px solid ${this.state.serverGeminiConfigured ? 'var(--color-safe)' : s.geminiApiKey ? 'var(--color-warning)' : 'var(--color-critical)'}; padding:2px 6px; border-radius:12px; font-weight:700;">
                ${this.state.serverGeminiConfigured ? 'Connected (Secure Server)' : s.geminiApiKey ? 'Connected (Live Dev Fallback)' : 'Disconnected (Simulated)'}
              </span>
            </h3>
            
            <div class="form-group">
              <label>Local Developer Gemini API Key</label>
              <input type="password" class="form-control" id="settings-api-key" 
                     value="${s.geminiApiKey || ''}" 
                     placeholder="AIzaSy..." />
              <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.35;">
                ${this.state.serverGeminiConfigured 
                  ? '<strong>✓ Secure Server Key Configured:</strong> The platform is using the secure server-side environment key. Local developer configurations below are optional fallbacks.' 
                  : '<strong>⚠ Server Key Missing:</strong> No secure server-side key detected. Enter a local developer API key below to enable live responses in local/dev mode. Get a key at <a href="https://aistudio.google.com/" target="_blank" style="color:var(--color-indigo);text-decoration:none;font-weight:600;">Google AI Studio</a>.'}
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

          <!-- DEMO DATA GENERATOR -->
          <div class="glass-panel" style="background:rgba(0,181,181,0.03);border-color:rgba(0,181,181,0.18);">
            <h3 class="dashboard-card-title" style="color:var(--color-indigo);">SaaS Demo Data</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.45;margin-bottom:14px;">
              Generate a realistic SaaS risk dataset for private demos. This will add sample risks, controls, KRIs, actions, and relationships.
            </p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">
              <div style="background:#fff;border:1px solid var(--border-color);border-radius:8px;padding:10px;">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Risks</div>
                <div style="font-family:var(--font-header);font-size:20px;font-weight:700;">${demoCounts.risks}</div>
              </div>
              <div style="background:#fff;border:1px solid var(--border-color);border-radius:8px;padding:10px;">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Controls</div>
                <div style="font-family:var(--font-header);font-size:20px;font-weight:700;">${demoCounts.controls}</div>
              </div>
              <div style="background:#fff;border:1px solid var(--border-color);border-radius:8px;padding:10px;">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Actions</div>
                <div style="font-family:var(--font-header);font-size:20px;font-weight:700;">${demoCounts.actions}</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);line-height:1.4;margin-bottom:14px;">
              Demo records use deterministic <strong>demo-trk-*</strong> IDs and a <strong>[DEMO Trackier SaaS]</strong> title marker so they can be safely identified later.
            </div>
            ${this.demoMessage ? `
              <div class="auth-message ${this.demoMessageType === 'error' ? 'error' : 'success'}" style="margin-bottom:12px;">
                ${this.demoMessage}
              </div>
            ` : ''}
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-primary btn-small" id="btn-generate-demo-data" style="flex:1;justify-content:center;" ${this.demoBusy ? 'disabled' : ''}>
                ${this.demoBusy ? 'Generating...' : 'Generate SaaS Demo Data'}
              </button>
              <button class="btn btn-secondary btn-small" id="btn-clear-demo-data" style="flex:1;justify-content:center;" ${this.demoBusy ? 'disabled' : ''}>
                Clear Demo Data
              </button>
            </div>
          </div>
          
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
    const generateDemoBtn = container.querySelector('#btn-generate-demo-data');
    if (generateDemoBtn) {
      generateDemoBtn.addEventListener('click', async () => {
        const confirmed = confirm("Generate SaaS demo data? This will add or refresh only records marked with [DEMO Trackier SaaS] and leave existing user-created records intact.");
        if (!confirmed) return;

        this.demoBusy = true;
        this.demoMessage = null;
        this.render(container);

        try {
          const counts = await StorageService.generateSaasDemoData();
          this.state.risks = await StorageService.getRisks();
          this.demoMessageType = 'success';
          this.demoMessage = `Demo data generated successfully. Added ${counts.risks} risks, ${counts.controls} controls, ${counts.kris} KRIs, ${counts.actions} actions, ${counts.relationships} relationships, and ${counts.trendLogs} trend logs.`;
          this.demoBusy = false;
          this.onStateChange({ risks: this.state.risks });
        } catch (err) {
          this.demoMessageType = 'error';
          this.demoMessage = `Demo data generation failed: ${err.message || err}`;
          this.demoBusy = false;
          this.render(container);
        }
      });
    }

    const clearDemoBtn = container.querySelector('#btn-clear-demo-data');
    if (clearDemoBtn) {
      clearDemoBtn.addEventListener('click', async () => {
        const confirmed = confirm("Clear generated demo data? This removes only demo-trk-* records created by the generator.");
        if (!confirmed) return;

        this.demoBusy = true;
        this.demoMessage = null;
        this.render(container);

        try {
          const counts = await StorageService.clearSaasDemoData();
          this.state.risks = await StorageService.getRisks();
          this.demoMessageType = 'success';
          this.demoMessage = `Demo data cleared. Removed generator-managed demo records for ${counts.risks} demo risks.`;
          this.demoBusy = false;
          this.onStateChange({ risks: this.state.risks });
        } catch (err) {
          this.demoMessageType = 'error';
          this.demoMessage = `Clear demo data failed: ${err.message || err}`;
          this.demoBusy = false;
          this.render(container);
        }
      });
    }

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
