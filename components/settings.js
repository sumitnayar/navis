// Settings Component - Enterprise Global Config (Layer 0)

import { StorageService } from '../services/storageService.js';

export class SettingsComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.globalConfig = null;
    this.orgIdentity = null;
    this.isSaving = false;
    this.saveMessage = '';
  }

  async render(container) {
    if (!this.globalConfig || !this.orgIdentity) {
      const [config, identity] = await Promise.all([
        StorageService.getGlobalConfig(),
        StorageService.getOrgIdentity()
      ]);
      this.globalConfig = config;
      this.orgIdentity = identity;
    }

    const c = this.globalConfig;
    const certsActiveStr = (c.certifications_active || []).join(', ');
    const certsInprogressStr = (c.certifications_inprogress || []).join(', ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">System Core Control</span>
          <h1>Platform Settings & Global Config</h1>
          <p class="page-subtitle">Configure Layer 0 organizational intelligence. This data drives all multi-agent policy generations and coverage assessments.</p>
        </div>
      </div>

      <div class="register-layout">
        
        <div class="details-panel" style="max-width: 800px; margin: 0 auto; width: 100%;">
          
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Global Organizational Configuration (Layer 0)</h3>
            
            ${this.saveMessage ? `<div style="padding: 10px; background: var(--color-safe-bg); border: 1px solid var(--color-safe); color: var(--color-safe); border-radius: 4px; margin-bottom: 15px; font-size: 13px;">${this.saveMessage}</div>` : ''}

            <form id="global-config-form" onsubmit="return false;">
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Company Legal Name</label>
                  <input type="text" class="form-control" id="config-company-name" value="${c.company_name || ''}" required placeholder="e.g. Acme Corp" />
                </div>
                <div class="form-group">
                  <label>Logo URL</label>
                  <input type="url" class="form-control" id="config-logo-url" value="${c.logo_url || ''}" placeholder="https://example.com/logo.png" />
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Primary Font</label>
                  <select class="form-control" id="config-primary-font">
                    <option value="Inter" ${c.primary_font === 'Inter' ? 'selected' : ''}>Inter (Default)</option>
                    <option value="Roboto" ${c.primary_font === 'Roboto' ? 'selected' : ''}>Roboto</option>
                    <option value="IBM Plex Sans" ${c.primary_font === 'IBM Plex Sans' ? 'selected' : ''}>IBM Plex Sans</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Brand Colour (Hex)</label>
                  <div style="display:flex;gap:8px;">
                    <input type="color" id="config-brand-color-picker" value="${c.brand_color || '#1a1a2e'}" style="height:36px;width:36px;padding:0;border:1px solid var(--border-color);border-radius:4px;" />
                    <input type="text" class="form-control" id="config-brand-color" value="${c.brand_color || '#1a1a2e'}" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#1a1a2e" style="flex:1;" />
                  </div>
                </div>
              </div>

              <h4 style="margin-top:24px;margin-bottom:12px;font-size:12px;color:var(--text-secondary);text-transform:uppercase;">Organizational Context</h4>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Industry</label>
                  <input type="text" class="form-control" id="config-industry" value="${c.industry || ''}" required placeholder="e.g. B2B SaaS, FinTech" />
                </div>
                <div class="form-group">
                  <label>HQ Location</label>
                  <input type="text" class="form-control" id="config-hq-location" value="${c.hq_location || ''}" required placeholder="e.g. London, UK" />
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Employee Count</label>
                  <input type="number" class="form-control" id="config-employee-count" value="${c.employee_count || 0}" min="1" required />
                </div>
                <div class="form-group">
                  <label>Remote Work Percentage (%)</label>
                  <input type="number" class="form-control" id="config-remote-percent" value="${c.remote_employee_percentage || 0}" min="0" max="100" required />
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px; align-items:center;">
                <div class="form-group" style="margin-bottom:0;">
                  <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="config-us-customers" ${c.us_customers ? 'checked' : ''} style="width:16px;height:16px;" />
                    Serving US Customers
                  </label>
                </div>
              </div>

              <h4 style="margin-top:24px;margin-bottom:12px;font-size:12px;color:var(--text-secondary);text-transform:uppercase;">Compliance Context</h4>

              <div class="form-group">
                <label>Active Certifications (comma separated)</label>
                <input type="text" class="form-control" id="config-certs-active" value="${certsActiveStr}" placeholder="e.g. ISO 27001, SOC 2 Type II" />
              </div>

              <div class="form-group">
                <label>Certifications In-Progress (comma separated)</label>
                <input type="text" class="form-control" id="config-certs-inprogress" value="${certsInprogressStr}" placeholder="e.g. DPDP Act, GDPR" />
              </div>

              <div class="form-actions" style="margin-top: 30px; display:flex; justify-content:flex-end;">
                <button type="button" class="btn btn-primary" id="btn-save-global-config" ${this.isSaving ? 'disabled' : ''}>
                  ${this.isSaving ? 'Saving Layer 0...' : 'Save Global Config'}
                </button>
              </div>

            </form>
          </div>

          <div class="glass-panel" style="margin-top: 24px;">
            <h3 class="dashboard-card-title">Organisational Identity</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; padding: 12px; background: rgba(37, 99, 235, 0.05); border-left: 3px solid #2563eb; border-radius: 0 4px 4px 0;">This section tells Navis what kind of organisation you are. Every policy, every risk assessment, every compliance recommendation is shaped by these answers. Fill this once, fill it carefully.</p>
            
            ${this.saveIdentityMessage ? `<div style="padding: 10px; background: var(--color-safe-bg); border: 1px solid var(--color-safe); color: var(--color-safe); border-radius: 4px; margin-bottom: 15px; font-size: 13px;">${this.saveIdentityMessage}</div>` : ''}

            <form id="org-identity-form" onsubmit="return false;">
              
              <div class="form-group">
                <label>Business Model</label>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">B2B means your customers are other businesses. B2C means individuals. B2B2C means both. Internal means this entity serves only its parent group.</div>
                <div style="display:flex; gap: 16px;">
                  <label><input type="radio" name="business_model" value="B2B" ${this.orgIdentity.business_model === 'B2B' ? 'checked' : ''} /> B2B</label>
                  <label><input type="radio" name="business_model" value="B2C" ${this.orgIdentity.business_model === 'B2C' ? 'checked' : ''} /> B2C</label>
                  <label><input type="radio" name="business_model" value="B2B2C" ${this.orgIdentity.business_model === 'B2B2C' ? 'checked' : ''} /> B2B2C</label>
                  <label><input type="radio" name="business_model" value="Internal" ${this.orgIdentity.business_model === 'Internal' ? 'checked' : ''} /> Internal</label>
                </div>
              </div>

              <div class="form-group">
                <label>Business Description</label>
                <textarea class="form-control" id="id-business-desc" rows="3" placeholder="Describe what your organisation does in two sentences...">${this.orgIdentity.business_model_description || ''}</textarea>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Primary Industry</label>
                  <input type="text" class="form-control" id="id-industry" value="${this.orgIdentity.primary_industry || ''}" placeholder="e.g. Technology" />
                </div>
                <div class="form-group">
                  <label>Primary Sub-sector</label>
                  <input type="text" class="form-control" id="id-sub-sector" value="${this.orgIdentity.primary_sub_sector || ''}" placeholder="e.g. SaaS / AdTech" />
                </div>
              </div>

              <hr style="border-top: 1px solid var(--border-color); margin: 24px 0;" />
              
              <h4 style="margin-bottom:12px;font-size:14px;color:#0a1628;">Data Role Classification</h4>
              
              <div class="form-group">
                <label>What is your primary relationship to the personal data you handle?</label>
                <div style="display:flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                  <label style="display:flex; gap: 10px; align-items: flex-start;">
                    <input type="radio" name="data_role" value="Controller" ${this.orgIdentity.data_role === 'Controller' ? 'checked' : ''} style="margin-top: 3px;" />
                    <div>
                      <strong style="color: #0a1628;">Controller</strong>
                      <div style="font-size: 12px; color: var(--text-muted);">You decide why and how personal data is processed. Example: you collect employee data for HR purposes.</div>
                    </div>
                  </label>
                  <label style="display:flex; gap: 10px; align-items: flex-start;">
                    <input type="radio" name="data_role" value="Processor" ${this.orgIdentity.data_role === 'Processor' ? 'checked' : ''} style="margin-top: 3px;" />
                    <div>
                      <strong style="color: #0a1628;">Processor</strong>
                      <div style="font-size: 12px; color: var(--text-muted);">You process personal data on behalf of another organisation (your client) who decides the purpose. Example: you run ad tracking on behalf of your clients.</div>
                    </div>
                  </label>
                  <label style="display:flex; gap: 10px; align-items: flex-start;">
                    <input type="radio" name="data_role" value="Dual Role" ${this.orgIdentity.data_role === 'Dual Role' ? 'checked' : ''} style="margin-top: 3px;" />
                    <div>
                      <strong style="color: #0a1628;">Dual Role</strong>
                      <div style="font-size: 12px; color: var(--text-muted);">You are both. Most B2B SaaS companies fall here — processor for client data, controller for your own employee and operational data.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div id="dual-role-fields" style="display: ${this.orgIdentity.data_role === 'Dual Role' ? 'block' : 'none'}; padding: 15px; background: #f8fafc; border-radius: 6px; margin-bottom: 20px;">
                <div class="form-group">
                  <label>Data you control (your own purposes): (comma separated)</label>
                  <input type="text" class="form-control" id="id-controller-data" value="${(this.orgIdentity.controller_data_categories || []).join(', ')}" placeholder="e.g. Employee Data, Vendor Data, Operational Data" />
                </div>
                <div class="form-group">
                  <label>Data you process on clients' behalf: (comma separated)</label>
                  <input type="text" class="form-control" id="id-processor-data" value="${(this.orgIdentity.processor_data_categories || []).join(', ')}" placeholder="e.g. End User Behavioural Data, Transaction Data" />
                </div>
              </div>

              <hr style="border-top: 1px solid var(--border-color); margin: 24px 0;" />
              
              <h4 style="margin-bottom:12px;font-size:14px;color:#0a1628;">Client Relationship Context</h4>
              
              <div class="form-group">
                <label>Who are your clients and what data do they share with you?</label>
                <textarea class="form-control" id="id-client-desc" rows="2">${this.orgIdentity.client_description || ''}</textarea>
              </div>
              <div class="form-group">
                <label>What processing do you perform on their data?</label>
                <textarea class="form-control" id="id-processing-activities" rows="2">${this.orgIdentity.processing_activities || ''}</textarea>
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="id-dpa-in-place" ${this.orgIdentity.dpa_in_place ? 'checked' : ''} />
                  We have Data Processing Agreements (DPAs) in place with clients
                </label>
              </div>

              <hr style="border-top: 1px solid var(--border-color); margin: 24px 0;" />

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Operating Jurisdictions (comma separated)</label>
                  <input type="text" class="form-control" id="id-operating-jurisdictions" value="${(this.orgIdentity.operating_jurisdictions || []).join(', ')}" placeholder="e.g. India, USA" />
                </div>
                <div class="form-group">
                  <label>Client Jurisdictions (comma separated)</label>
                  <input type="text" class="form-control" id="id-client-jurisdictions" value="${(this.orgIdentity.client_jurisdictions || []).join(', ')}" placeholder="e.g. Global, EU" />
                </div>
              </div>
              <div class="form-group">
                <label>Data Residency (where is data stored?)</label>
                <input type="text" class="form-control" id="id-data-residency" value="${this.orgIdentity.data_residency || ''}" placeholder="e.g. AWS Mumbai" />
              </div>

              <hr style="border-top: 1px solid var(--border-color); margin: 24px 0;" />

              <div class="form-group">
                <label>Data Categories Processed (comma separated)</label>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Personal Data, Sensitive Personal Data, Children's Data, Financial Data, Behavioural / Tracking Data, Location Data.</div>
                <input type="text" class="form-control" id="id-data-categories" value="${(this.orgIdentity.data_categories_processed || []).join(', ')}" placeholder="e.g. Behavioural / Tracking Data, Personal Data" />
              </div>
              
              <div class="form-group">
                <label>Data Flow Description</label>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Describe briefly how data enters your organisation, what happens to it, and where it goes.</div>
                <textarea class="form-control" id="id-data-flow" rows="3" placeholder="e.g. Client sends campaign tracking pixels...">${this.orgIdentity.data_flow_description || ''}</textarea>
              </div>

              <div class="form-group">
                <label>Primary Regulations (comma separated)</label>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Select all that apply. Navis will use these to prioritise policy recommendations and compliance gap analysis.</div>
                <input type="text" class="form-control" id="id-primary-regulations" value="${(this.orgIdentity.primary_regulations || []).join(', ')}" placeholder="e.g. DPDP, ISO 27001, SOC 2" />
              </div>

              <div class="form-actions" style="margin-top: 30px; display:flex; justify-content:flex-end;">
                <button type="button" class="btn btn-primary" id="btn-save-org-identity" ${this.isSavingIdentity ? 'disabled' : ''}>
                  ${this.isSavingIdentity ? 'Saving Identity...' : 'Save Organisational Identity'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    `;

    this.attachEvents(container);
  }

  attachEvents(container) {
    const colorPicker = container.querySelector('#config-brand-color-picker');
    const colorInput = container.querySelector('#config-brand-color');

    colorPicker?.addEventListener('input', (e) => {
      if (colorInput) colorInput.value = e.target.value;
    });
    colorInput?.addEventListener('input', (e) => {
      if (colorPicker && e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
        colorPicker.value = e.target.value;
      }
    });

    const saveBtn = container.querySelector('#btn-save-global-config');
    saveBtn?.addEventListener('click', async () => {
      this.isSaving = true;
      this.saveMessage = '';
      this.render(container); // re-render to show disabled state

      try {
        const certsActiveStr = document.getElementById('config-certs-active').value;
        const certsInprogressStr = document.getElementById('config-certs-inprogress').value;

        const updatedConfig = {
          company_name: document.getElementById('config-company-name').value,
          logo_url: document.getElementById('config-logo-url').value,
          primary_font: document.getElementById('config-primary-font').value,
          brand_color: document.getElementById('config-brand-color').value,
          industry: document.getElementById('config-industry').value,
          hq_location: document.getElementById('config-hq-location').value,
          employee_count: parseInt(document.getElementById('config-employee-count').value, 10) || 0,
          remote_employee_percentage: parseInt(document.getElementById('config-remote-percent').value, 10) || 0,
          us_customers: document.getElementById('config-us-customers').checked,
          certifications_active: certsActiveStr.split(',').map(s => s.trim()).filter(Boolean),
          certifications_inprogress: certsInprogressStr.split(',').map(s => s.trim()).filter(Boolean)
        };

        this.globalConfig = await StorageService.saveGlobalConfig(updatedConfig);
        this.saveMessage = 'Layer 0 Global Config saved securely.';
      } catch (err) {
        console.error("Save config error:", err);
        this.saveMessage = 'Error saving config. Check console for details.';
      } finally {
        this.isSaving = false;
        this.render(container);
      }
    });

    const dataRoleRadios = container.querySelectorAll('input[name="data_role"]');
    dataRoleRadios.forEach(r => {
      r.addEventListener('change', (e) => {
        const dualRoleFields = container.querySelector('#dual-role-fields');
        if (dualRoleFields) {
          dualRoleFields.style.display = e.target.value === 'Dual Role' ? 'block' : 'none';
        }
      });
    });

    const saveIdentityBtn = container.querySelector('#btn-save-org-identity');
    saveIdentityBtn?.addEventListener('click', async () => {
      this.isSavingIdentity = true;
      this.saveIdentityMessage = '';
      this.render(container); // re-render to show disabled state

      try {
        const selectedBusinessModel = container.querySelector('input[name="business_model"]:checked')?.value || '';
        const selectedDataRole = container.querySelector('input[name="data_role"]:checked')?.value || '';

        const updatedIdentity = {
          business_model: selectedBusinessModel,
          business_model_description: container.querySelector('#id-business-desc').value,
          primary_industry: container.querySelector('#id-industry').value,
          primary_sub_sector: container.querySelector('#id-sub-sector').value,
          data_role: selectedDataRole,
          controller_data_categories: container.querySelector('#id-controller-data').value.split(',').map(s => s.trim()).filter(Boolean),
          processor_data_categories: container.querySelector('#id-processor-data').value.split(',').map(s => s.trim()).filter(Boolean),
          dual_role_explanation: '',
          client_description: container.querySelector('#id-client-desc').value,
          processing_activities: container.querySelector('#id-processing-activities').value,
          dpa_in_place: container.querySelector('#id-dpa-in-place').checked,
          operating_jurisdictions: container.querySelector('#id-operating-jurisdictions').value.split(',').map(s => s.trim()).filter(Boolean),
          client_jurisdictions: container.querySelector('#id-client-jurisdictions').value.split(',').map(s => s.trim()).filter(Boolean),
          data_residency: container.querySelector('#id-data-residency').value,
          data_categories_processed: container.querySelector('#id-data-categories').value.split(',').map(s => s.trim()).filter(Boolean),
          data_flow_description: container.querySelector('#id-data-flow').value,
          primary_regulations: container.querySelector('#id-primary-regulations').value.split(',').map(s => s.trim()).filter(Boolean)
        };

        this.orgIdentity = await StorageService.saveOrgIdentity(updatedIdentity);
        this.saveIdentityMessage = 'Organisational Identity saved securely.';
      } catch (err) {
        console.error("Save identity error:", err);
        this.saveIdentityMessage = 'Error saving identity. Check console for details.';
      } finally {
        this.isSavingIdentity = false;
        this.render(container);
      }
    });

  }
}
