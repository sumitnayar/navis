import re

with open('components/policyStudio.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace renderGeneratorTab
new_generator_tab = '''  renderGeneratorTab() {
    const domains = [
      { id: 'privacy', name: 'Privacy & Data Protection' },
      { id: 'security', name: 'Information Security' },
      { id: 'governance', name: 'Corporate Governance' }
    ];

    return `
      <div class="register-layout">
        <div class="details-panel" style="flex: 1 1 500px; max-width: 800px; margin: 0 auto;">
          <div class="glass-panel">
            <h3 class="dashboard-card-title">Intake Screen</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Configure policy parameters before initiating the multi-agent generation pipeline.</p>
            
            <form id="intake-form" onsubmit="return false;">
              <div class="form-group">
                <label>Policy Name</label>
                <input type="text" class="form-control" id="intake-policy-name" value="${this.genTitle || ''}" placeholder="e.g. Vendor Management Policy" required />
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Domain</label>
                  <select class="form-control" id="intake-domain">
                    ${domains.map(d => `<option value="${d.id}" ${this.genDomain === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Effective Date</label>
                  <input type="date" class="form-control" id="intake-effective-date" required />
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label>Policy Owner</label>
                  <input type="text" class="form-control" id="intake-owner" placeholder="e.g. Chief Information Security Officer" required />
                </div>
                <div class="form-group">
                  <label>Approver</label>
                  <input type="text" class="form-control" id="intake-approver" placeholder="e.g. Risk Committee" required />
                </div>
              </div>

              <div class="form-group">
                <label>Regulations & Frameworks</label>
                <input type="text" class="form-control" id="intake-regulations" value="${this.selectedFrameworks.join(', ')}" placeholder="e.g. ISO 27001, SOC 2, DPDP Act" required />
              </div>

              <div class="form-group">
                <label>Scope Definition</label>
                <textarea class="form-control" id="intake-scope" rows="3" placeholder="Define what systems, users, and data this policy applies to..." required></textarea>
              </div>

              <div class="form-group">
                <label>Custom Instructions for AI</label>
                <textarea class="form-control" id="intake-instructions" rows="2" placeholder="e.g. Ensure strict vendor offboarding timeline of 48 hours...">${this.genPrompt || ''}</textarea>
              </div>

              <div class="form-actions" style="margin-top: 24px;">
                <button class="btn btn-primary" id="btn-generate-policy" style="width:100%;justify-content:center;height:40px;" ${this.isGenerating ? 'disabled' : ''}>
                  ${this.isGenerating ? '<span class="spinner"></span> Orchestrating Generation Pipeline...' : 'Generate Policy'}
                </button>
              </div>
            </form>
          </div>
          
          <div id="generation-progress" style="display: ${this.isGenerating ? 'block' : 'none'}; margin-top: 20px; padding: 20px; background: var(--color-bg-elevated); border: 1px solid var(--border-color); border-radius: 8px;">
             <h4 style="margin:0 0 10px 0; font-size: 14px;">Pipeline Progress</h4>
             <ul id="progress-steps" style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: var(--text-secondary);">
                <li id="step-structure">⏳ Generating structural skeleton...</li>
                <li id="step-content">⏳ Drafting substantive content...</li>
                <li id="step-compliance">⏳ Running compliance challenge...</li>
                <li id="step-clauses">⏳ Recommending clauses...</li>
             </ul>
          </div>
        </div>
      </div>
    `;
  }'''

content = re.sub(r'  renderGeneratorTab\(\) \{[\s\S]*?return `[\s\S]*?    `;\n  \}', new_generator_tab, content, count=1)

# 2. Replace click listener for btn-generate-policy
new_listener = '''      container.querySelector('#btn-generate-policy')?.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const form = container.querySelector('#intake-form');
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        this.isGenerating = true;
        this.genTitle = container.querySelector('#intake-policy-name').value;
        this.renderSubTabContent(container.querySelector('#tab-body-container'));

        const intakeData = {
          title: this.genTitle,
          domain: container.querySelector('#intake-domain').value,
          effectiveDate: container.querySelector('#intake-effective-date').value,
          owner: container.querySelector('#intake-owner').value,
          approver: container.querySelector('#intake-approver').value,
          regulations: container.querySelector('#intake-regulations').value,
          scope: container.querySelector('#intake-scope').value,
          instructions: container.querySelector('#intake-instructions').value
        };

        const progressContainer = container.querySelector('#generation-progress');
        if (progressContainer) progressContainer.style.display = 'block';

        const setStepStatus = (stepId, text) => {
          const step = container.querySelector('#' + stepId);
          if (step) step.innerHTML = text;
        };

        try {
          const [globalConfig, orgIdentity] = await Promise.all([
             StorageService.getGlobalConfig(),
             StorageService.getOrgIdentity()
          ]);
          
          const orgContext = { globalConfig, orgIdentity };

          // Step 1: Structure Agent
          setStepStatus('step-structure', '🔄 Generating structural skeleton...');
          const structureRes = await fetch('/api/policy/generate/structure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intakeData, orgContext })
          });
          const structureData = await structureRes.json();
          if (!structureRes.ok) throw new Error(structureData.error);
          setStepStatus('step-structure', '✅ Structure skeleton completed');

          // Parallel Step: Clauses
          setStepStatus('step-clauses', '🔄 Recommending clauses...');
          const clausePromise = fetch('/api/policy/recommend-clauses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intakeData })
          });

          // Step 2: Content Agent
          setStepStatus('step-content', '🔄 Drafting substantive content...');
          const contentRes = await fetch('/api/policy/generate/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skeleton: structureData.skeleton, intakeData, orgContext })
          });
          const contentData = await contentRes.json();
          if (!contentRes.ok) throw new Error(contentData.error);
          this.genResultText = contentData.policyDraft;
          setStepStatus('step-content', '✅ Content drafting completed');

          // Step 3: Compliance Agent
          setStepStatus('step-compliance', '🔄 Running compliance challenge...');
          const complianceRes = await fetch('/api/policy/generate/compliance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draft: this.genResultText, orgContext })
          });
          const complianceData = await complianceRes.json();
          if (!complianceRes.ok) throw new Error(complianceData.error);
          this.challengeReport = complianceData.challengeReport;
          setStepStatus('step-compliance', '✅ Compliance challenge completed');

          // Resolve Parallel Clauses
          const clauseRes = await clausePromise;
          const clauseData = await clauseRes.json();
          this.recommendedClauses = clauseData.recommended_clauses || [];
          setStepStatus('step-clauses', '✅ Clauses recommended');

          // Switch to Editor View
          this.activeSubTab = 'refinement';
        } catch (err) {
          console.error("Pipeline Error:", err);
          alert('Generation failed: ' + err.message);
        } finally {
          this.isGenerating = false;
          this.renderSubTabContent(container.querySelector('#tab-body-container'));
        }
      });'''

content = re.sub(r'      container\.querySelector\(\'#btn-generate-policy\'\)\?\.addEventListener\(\'click\', async \(\) => \{[\s\S]*?      \}\);\n', new_listener + '\n', content, count=1)

with open('components/policyStudio.js', 'w', encoding='utf-8') as f:
    f.write(content)
