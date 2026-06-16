const cleanDescription = (desc) => {
  if (!desc) return '';
  let cleaned = desc;
  const markerIdx = cleaned.indexOf('Demo marker:');
  if (markerIdx !== -1) {
    cleaned = cleaned.substring(0, markerIdx).trim();
  }
  const demoIdx = cleaned.indexOf('[DEMO');
  if (demoIdx !== -1) {
    const endIdx = cleaned.indexOf(']', demoIdx);
    if (endIdx !== -1) {
      cleaned = cleaned.substring(0, demoIdx) + cleaned.substring(endIdx + 1);
    } else {
      cleaned = cleaned.substring(0, demoIdx);
    }
  }
  return cleaned.trim();
};

export class BoardPackComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
  }

  render(container) {
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];
    const settings = this.state.settings || {};

    const today = new Date();
    const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    const overdueActions = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today);

    const tokens = {
      safe: getComputedStyle(document.documentElement).getPropertyValue('--color-safe').trim() || '#16A34A',
      warning: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#D97706',
      critical: getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim() || '#DC2626',
      slate: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748B'
    };

    let postureValue = "LOW";
    let postureColor = tokens.safe; 
    if (aboveAppetiteCount > 15 || breachedKRIs > 20 || overdueActions.length > 10) {
      postureValue = "CRITICAL";
      postureColor = tokens.critical; 
    } else if (aboveAppetiteCount > 0 || breachedKRIs > 0 || overdueActions.length > 0) {
      postureValue = "ELEVATED";
      postureColor = tokens.warning; 
    } else if (worseningCount > 0) {
      postureValue = "MODERATE";
      postureColor = tokens.slate; 
    }

    // Filter Top Risks
    const criticalRisks = risks
      .filter(r => r.appetiteStatus === 'Above Appetite' || r.residualScore >= 40)
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0));

    // Extract Incident Alerts from KRIs and logs
    const incidentAlerts = [];
    risks.forEach(r => {
      if (r.kris) {
        r.kris.forEach(k => {
          if (k.status === 'BREACHED' && (k.name.toLowerCase().includes('incident') || k.name.toLowerCase().includes('anomaly') || k.name.toLowerCase().includes('outage'))) {
            incidentAlerts.push({
              riskTitle: r.title,
              name: k.name,
              value: k.current,
              threshold: k.threshold,
              status: k.status
            });
          }
        });
      }
    });

    container.innerHTML = `
      <div class="page-header no-print">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Executive Reporting Module</span>
          <h1>Board Pack Compiler</h1>
          <p class="page-subtitle">Compile and format board-ready executive risk briefs. Hit Print/Download to export the document.</p>
        </div>
        <div class="page-actions" style="display:flex; gap:10px;">
          <button class="btn btn-primary" id="btn-print-pack" style="display:flex; align-items:center; gap:6px;">
            <span>🖨️</span> Print / Save to PDF
          </button>
        </div>
      </div>

      <div class="board-brief-print-container" style="background:#FFFFFF; border:1px solid var(--border-color); border-radius:8px; padding:40px; font-family:'Inter', system-ui, -apple-system, sans-serif; max-width:960px; margin: 0 auto; color:#0D1B2A; box-shadow: 0 4px 12px rgba(13,27,42,0.04);">
        
        <!-- HEADER BLOCK -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0D1B2A; padding-bottom:20px; margin-bottom:30px;">
          <div>
            <div style="font-size:24px; font-weight:800; letter-spacing:-0.5px; text-transform:uppercase; color:#0D1B2A;">Board Risk Intelligence Brief</div>
            <div style="font-size:14px; font-weight:600; color:#4A6FA5; margin-top:4px;">ScaleFlow Technologies Pvt Ltd &mdash; Confidential</div>
          </div>
          <div style="text-align:right; font-size:12px; color:var(--color-navy-secondary);">
            <div>Date compiled: <strong>${today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
            <div>Timeline: <strong>Q2 FY26 Posture</strong></div>
          </div>
        </div>

        <!-- POSTURE STATS PANEL -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap:16px; background:#F7F6F4; border:1px solid var(--border-color); border-radius:6px; padding:16px; margin-bottom:30px;">
          <div style="border-right:1px solid rgba(13,27,42,0.1); padding-right:10px; display:flex; flex-direction:column; justify-content:center;">
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; color:var(--color-navy-secondary);">Risk Posture Status</span>
            <strong style="font-size:18px; color:${postureColor}; margin-top:2px;">${postureValue}</strong>
          </div>
          <div style="text-align:center;">
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; color:var(--color-navy-secondary);">Above Appetite</span>
            <strong style="font-size:18px; display:block; margin-top:2px; color:var(--color-critical);">${aboveAppetiteCount}</strong>
          </div>
          <div style="text-align:center;">
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; color:var(--color-navy-secondary);">KRI Breaches</span>
            <strong style="font-size:18px; display:block; margin-top:2px; color:var(--color-warning);">${breachedKRIs}</strong>
          </div>
          <div style="text-align:center;">
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; color:var(--color-navy-secondary);">Worsening Risks</span>
            <strong style="font-size:18px; display:block; margin-top:2px; color:var(--color-warning);">${worseningCount}</strong>
          </div>
          <div style="text-align:center;">
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; color:var(--color-navy-secondary);">Overdue Actions</span>
            <strong style="font-size:18px; display:block; margin-top:2px; color:var(--color-critical);">${overdueActions.length}</strong>
          </div>
        </div>

        <!-- EXECUTIVE SUMMARY SECTION -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:15px; font-weight:700; text-transform:uppercase; border-bottom:1px solid #0D1B2A; padding-bottom:6px; margin-bottom:12px; color:#0D1B2A;">I. Executive Summary</h2>
          <p style="font-size:12px; line-height:1.6; color:#0D1B2A; margin-bottom:10px;">
            This brief compiles the active risk profile of <strong>${settings.companyName || 'ScaleFlow Technologies'}</strong> as of ${today.toLocaleDateString('en-IN')}. 
            The enterprise risk posture stands at <strong style="color:${postureColor};">${postureValue}</strong>. 
            There are currently <strong>${aboveAppetiteCount} key risks operating above the defined risk appetite thresholds</strong>. 
            The management team is actively executing mitigation controls to align operations back within appetite limits.
          </p>
          <p style="font-size:12px; line-height:1.6; color:#0D1B2A;">
            <strong>Immediate Board Directives:</strong> Appoint independent directors to satisfy listing thresholds, establish geographic failover redundancies to mitigate platform dependency, and accelerate DPDP mapping controls.
          </p>
        </div>

        <!-- STRATEGIC OBJECTIVES SECTION -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:15px; font-weight:700; text-transform:uppercase; border-bottom:1px solid #0D1B2A; padding-bottom:6px; margin-bottom:12px; color:#0D1B2A;">II. Strategic Objectives Status</h2>
          <table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
            <thead>
              <tr style="border-bottom:1.5px solid #0D1B2A; text-align:left; background:#F7F6F4;">
                <th style="padding:6px 8px; font-weight:700; width:45%;">Objective</th>
                <th style="padding:6px 8px; font-weight:700; width:15%;">Importance</th>
                <th style="padding:6px 8px; font-weight:700; width:25%;">Target Date</th>
                <th style="padding:6px 8px; font-weight:700; width:15%; text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${objectives.map(o => {
                const isCritical = o.status === 'Critical Gaps';
                const isWarning = o.status === 'At Risk';
                const statusColor = isCritical ? 'var(--color-critical)' : isWarning ? 'var(--color-warning)' : 'var(--color-safe)';
                return `
                  <tr style="border-bottom:1px solid rgba(13,27,42,0.15);">
                    <td style="padding:8px; font-weight:600; color:#0D1B2A;">
                      ${o.title}
                      <div style="font-size:9px; color:var(--color-navy-secondary); font-weight:400; margin-top:2px;">Metrics: ${o.successMetrics}</div>
                    </td>
                    <td style="padding:8px; font-weight:500;">${o.importance}</td>
                    <td style="padding:8px; color:var(--color-navy-secondary);">${o.targetDate}</td>
                    <td style="padding:8px; font-weight:700; text-align:right; color:${statusColor};">${o.status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- CRITICAL RISKS SECTION -->
        <div style="margin-bottom:30px; page-break-before: always;">
          <h2 style="font-size:15px; font-weight:700; text-transform:uppercase; border-bottom:1px solid #0D1B2A; padding-bottom:6px; margin-bottom:12px; color:#0D1B2A;">III. Critical Risks &amp; Mitigating Controls</h2>
          <table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
            <thead>
              <tr style="border-bottom:1.5px solid #0D1B2A; text-align:left; background:#F7F6F4;">
                <th style="padding:6px 8px; font-weight:700; width:35%;">Risk Element</th>
                <th style="padding:6px 8px; font-weight:700; width:15%;">Category</th>
                <th style="padding:6px 8px; font-weight:700; width:10%;">Score</th>
                <th style="padding:6px 8px; font-weight:700; width:15%;">Trend</th>
                <th style="padding:6px 8px; font-weight:700; width:25%;">Primary Mitigating Controls</th>
              </tr>
            </thead>
            <tbody>
              ${criticalRisks.map(r => {
                const controlsText = r.controls?.length 
                  ? r.controls.map(c => `• ${c.name} (${c.effectiveness || 'Active'})`).join('<br>') 
                  : 'No controls mapped';
                const trendIcon = r.trend === 'Deteriorating' ? '↑ Deteriorating' : r.trend === 'Improving' ? '↓ Improving' : '→ Stable';
                const trendColor = r.trend === 'Deteriorating' ? 'var(--color-critical)' : r.trend === 'Improving' ? 'var(--color-safe)' : 'var(--color-navy-secondary)';
                
                return `
                  <tr style="border-bottom:1px solid rgba(13,27,42,0.15); vertical-align:top;">
                    <td style="padding:8px; font-weight:600; color:#0D1B2A;">
                      ${r.title}
                      <div style="font-size:9px; color:var(--color-navy-secondary); font-weight:400; margin-top:2px; line-height:1.3;">${cleanDescription(r.description).slice(0, 100)}...</div>
                    </td>
                    <td style="padding:8px;">${r.category}</td>
                    <td style="padding:8px; font-weight:700; color:var(--color-critical);">${r.residualScore}</td>
                    <td style="padding:8px; font-weight:600; color:${trendColor};">${trendIcon}</td>
                    <td style="padding:8px; font-size:9.5px; line-height:1.3; color:#475569;">${controlsText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- INCIDENT & COMPLIANCE ALERTS -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:15px; font-weight:700; text-transform:uppercase; border-bottom:1px solid #0D1B2A; padding-bottom:6px; margin-bottom:12px; color:#0D1B2A;">IV. Incident Briefs &amp; KRI Alerts</h2>
          
          ${incidentAlerts.length === 0 ? `
            <div style="font-size:12px; color:var(--color-safe-text); background:var(--color-safe-bg); border:1px solid rgba(26,122,74,0.1); border-radius:6px; padding:10px; margin-top:8px;">
              ✓ No critical security incident breaches or operational outages logged in the active console.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
              ${incidentAlerts.map(i => `
                <div style="background:var(--color-critical-bg); border:1px solid rgba(226,75,74,0.15); border-left:4px solid var(--color-critical); border-radius:6px; padding:10px; font-size:11px;">
                  <div style="display:flex; justify-content:space-between; font-weight:700; color:#0D1B2A; margin-bottom:4px;">
                    <span>🚨 KRI Breach: ${i.name}</span>
                    <span style="color:var(--color-critical); text-transform:uppercase;">${i.status}</span>
                  </div>
                  <div style="color:var(--color-navy-secondary);">Risk mapping: <strong>${i.riskTitle}</strong></div>
                  <div style="margin-top:4px;">Reported value: <strong style="color:var(--color-critical);">${i.value}</strong> (Threshold limit: ${i.threshold})</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- ACCOUNTABILITY & ACTIONS -->
        <div style="margin-bottom:20px;">
          <h2 style="font-size:15px; font-weight:700; text-transform:uppercase; border-bottom:1px solid #0D1B2A; padding-bottom:6px; margin-bottom:12px; color:#0D1B2A;">V. Overdue Mitigation Actions</h2>
          
          ${overdueActions.length === 0 ? `
            <div style="font-size:12px; color:var(--color-safe-text); background:var(--color-safe-bg); border:1px solid rgba(26,122,74,0.1); border-radius:6px; padding:10px; margin-top:8px;">
              ✓ All scheduled mitigation actions are current and within scheduled timelines.
            </div>
          ` : `
            <table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
              <thead>
                <tr style="border-bottom:1.5px solid #0D1B2A; text-align:left; background:#F7F6F4;">
                  <th style="padding:6px 8px; font-weight:700; width:45%;">Action Item</th>
                  <th style="padding:6px 8px; font-weight:700; width:20%;">Owner</th>
                  <th style="padding:6px 8px; font-weight:700; width:20%;">Due Date</th>
                  <th style="padding:6px 8px; font-weight:700; width:15%; text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${overdueActions.map(a => `
                  <tr style="border-bottom:1px solid rgba(13,27,42,0.15);">
                    <td style="padding:8px; font-weight:600; color:#0D1B2A;">${a.title}</td>
                    <td style="padding:8px; font-weight:500;">${a.owner}</td>
                    <td style="padding:8px; color:var(--color-critical); font-weight:600;">${a.dueDate}</td>
                    <td style="padding:8px; text-align:right; font-weight:700; color:var(--color-critical);">${a.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const printBtn = container.querySelector('#btn-print-pack');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
}
