// Board Dashboard Component - The Central Landing Page ("5-Minute Posture" View)

import { AIService } from '../services/aiService.js';
import { AIInsightService } from '../services/aiInsightService.js';


export class DashboardComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.selectedHeatmapRiskIndex = null;
    this.isGeneratingBrief = false;
    this.briefContent = "";
    this.isBriefCollapsed = false;
    this._diagnosticsExpanded = false;
  }

  // ─── Navigation Helper ────────────────────────────────────────────────────
  navigateToPage(url, tabKey) {
    window.history.pushState(null, '', url);
    this.onStateChange({ activeTab: tabKey });
  }

  // ─── Calculate dynamic metrics from risk register ─────────────────────────
  calculateMetrics() {
    const risks = this.state.risks;

    const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const improvingCount = risks.filter(r => r.trend === 'Improving').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;

    // Count overdue actions
    const today = new Date();
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    // Assurance gaps
    const assuranceGapsCount = risks.filter(r =>
      r.assurance?.gapDetected ||
      !r.assurance?.thirdLine ||
      r.assurance?.thirdLine?.includes('None')
    ).length;

    // Calculate Strategic Fragility averages (1-5 scaled to %)
    const fragilitySums = { revenue: 0, growth: 0, customerTrust: 0, technology: 0, people: 0, operations: 0, reputation: 0, valuation: 0 };
    let count = risks.length || 1;

    risks.forEach(r => {
      if (r.fragility) {
        Object.keys(fragilitySums).forEach(k => {
          fragilitySums[k] += (r.fragility[k] || 0);
        });
      }
    });

    const fragilityPercentages = {};
    Object.keys(fragilitySums).forEach(k => {
      // Map 1-5 average to 0-100%
      fragilityPercentages[k] = Math.round((fragilitySums[k] / count) * 20);
    });

    return {
      aboveAppetiteCount,
      worseningCount,
      improvingCount,
      breachedKRIs,
      overdueActionsCount,
      assuranceGapsCount,
      fragilityPercentages
    };
  }

  // ─── Compute Top Board Issues ─────────────────────────────────────────────
  computeTopBoardIssues(risks, objectives) {
    const today = new Date();

    const scored = risks.map(r => {
      const appetiteScore =
        r.appetiteStatus === 'Above Appetite' ? 3 :
        r.appetiteStatus === 'Near Appetite'  ? 2 : 0;

      const trendScore =
        r.trend === 'Deteriorating' ? 3 :
        r.trend === 'Stable'        ? 1 : 0;

      const kriScore = r.kris?.some(k => k.status === 'BREACHED') ? 3 : 0;

      const hasOverdue = (r.actions || []).some(
        a => a.status !== 'Completed' && new Date(a.dueDate) < today
      );
      const overdueScore = hasOverdue ? 2 : 0;

      const totalScore = appetiteScore + trendScore + kriScore + overdueScore;
      return { r, totalScore };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    const top5 = scored.slice(0, 5);

    return top5.map(({ r, totalScore }) => {
      const severity =
        totalScore >= 8 ? 'Critical' :
        totalScore >= 5 ? 'High'     : 'Medium';

      // Match first objective that references this risk (by id or by category/name)
      const linkedObj = (objectives || []).find(o =>
        (o.linkedRisks && o.linkedRisks.includes(r.id)) ||
        (o.risks && o.risks.includes(r.id))
      );
      const linkedObjective = linkedObj ? linkedObj.title : null;

      // First non-completed action
      const firstAction = (r.actions || []).find(a => a.status !== 'Completed');
      const recommendedAction = firstAction ? firstAction.title : 'Escalate to board';

      return {
        title: r.title,
        type: 'Risk',
        severity,
        whyMatters: `${r.appetiteStatus} — ${r.category} risk with residual score ${r.residualScore}`,
        linkedObjective,
        recommendedAction,
        deepLink: { url: `/risks?riskId=${r.id}`, tabKey: 'register' }
      };
    });
  }

  render(container) {
    const risks = this.state.risks || [];
    const objectives = this.state.objectives || [];
    const isLoading = this.state.isLoading;
    const metrics = this.calculateMetrics();
    const settings = this.state.settings || {};
    const isAI = AIInsightService.isAIConfigured(this.state);

    // Top worsening/improving lists
    const worseningRisks = risks.filter(r => r.trend === 'Deteriorating').slice(0, 3);
    const improvingRisks = risks.filter(r => r.trend === 'Improving').slice(0, 3);

    // Top board issues
    const topIssues = this.computeTopBoardIssues(risks, objectives);

    // Governance Action Queue – top 3 most-overdue actions
    const today = new Date();
    const allOverdueActions = risks.flatMap(r =>
      (r.actions || [])
        .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today)
        .map(a => ({
          ...a,
          riskTitle: r.title,
          daysOverdue: Math.floor((today - new Date(a.dueDate)) / 86400000)
        }))
    ).sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 3);

    container.innerHTML = `
      <!-- ═══════════════ PAGE HEADER ═══════════════ -->
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">Executive Risk Control Center</span>
          <h1>Board Risk Intelligence</h1>
          <p class="page-subtitle">Real-time risk posture for <strong>${settings.companyName || 'NAVIS'}</strong> | IPO Alignment Tracker</p>
        </div>
        <div class="no-print">
          <button class="btn btn-secondary" id="btn-print-pack">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821V21h10.56v-7.179m-10.56 0a3 3 0 01-3-3V6.72a3 3 0 013-3h10.56a3 3 0 013 3v4.101a3 3 0 01-3 3m-10.56 0h10.56" />
            </svg>
            Print Board Pack
          </button>
        </div>
      </div>

      <!-- ═══════════════ BOARD ATTENTION BRIEF (AI INSIGHT LAYER) ═══════════════ -->
      <div class="dashboard-graph-card" id="board-attention-brief-card" style="border-color: rgba(239, 68, 68, 0.15) !important; background: linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, rgba(99, 102, 241, 0.02) 100%);">
        <div class="dashboard-graph-card-header" id="board-brief-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
          <div>
            <h3 class="dashboard-graph-card-title" style="display: flex; align-items: center; gap: 8px; margin: 0; color: #EF4444;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>Board Attention Brief</span>
              <span class="status-badge ${isAI ? 'within' : 'near'}" style="font-size: 9px; padding: 2px 6px; font-weight: normal; margin-left: 8px;">
                ${isAI ? 'Live Gemini AI' : 'Simulation Mode'}
              </span>
            </h3>
            <p class="dashboard-graph-card-subtitle" style="margin-top: 4px;">Top risk alerts and early warning indicators requiring immediate board oversight</p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;" class="no-print">
            <button class="btn btn-secondary btn-small" id="btn-regenerate-brief-top" style="padding: 2px 8px; font-size: 10px; z-index: 2; position: relative;">Regenerate AI Insights</button>
            <span style="font-size: 10px; color: var(--text-muted);" id="brief-collapse-lbl">Expand Analysis</span>
            <svg id="board-brief-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px; transition: transform 0.2s ease;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div id="board-brief-body" style="transition: max-height 0.3s ease-in-out, margin-top 0.3s ease-in-out; overflow: hidden; max-height: 0px; margin-top: 0;">
          <div style="background: rgba(0,0,0,0.015); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; border-top: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(239,68,68,0.15);">
            <div id="board-brief-content">
              <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center; min-height: 120px;">
                <div class="skeleton-loading" style="width: 95%; height: 14px; border-radius: 4px;"></div>
                <div class="skeleton-loading" style="width: 90%; height: 14px; border-radius: 4px;"></div>
                <div class="skeleton-loading" style="width: 85%; height: 14px; border-radius: 4px;"></div>
                <div class="skeleton-loading" style="width: 70%; height: 14px; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ CRITICAL SIGNALS ROW (5-CARD) ═══════════════ -->
      <div class="ticker-grid" style="grid-template-columns: repeat(5, 1fr);">

        <!-- 1. Risks Above Appetite -->
        <div class="ticker-card above" style="display: flex; flex-direction: column; gap: 4px;">
          <span class="ticker-label">Risks Above Appetite</span>
          ${isLoading ? `
            <span class="ticker-value" style="display: flex; align-items: center; justify-content: center; height: 32px; margin-top: 6px;">
              <span class="skeleton-loading" style="width: 40px; height: 28px;"></span>
            </span>
          ` : `
            <span class="ticker-value">${metrics.aboveAppetiteCount}</span>
          `}
          <span class="ticker-footer">Critical breaches requiring mitigation</span>
          <button id="btn-view-appetite" class="btn btn-secondary btn-small" style="margin-top: 6px; font-size: 10px; padding: 3px 8px; align-self: flex-start;">→ View Evidence</button>
        </div>

        <!-- 2. KRI Breaches -->
        <div class="ticker-card near" style="display: flex; flex-direction: column; gap: 4px;">
          <span class="ticker-label">KRI Breaches</span>
          ${isLoading ? `
            <span class="ticker-value" style="display: flex; align-items: center; justify-content: center; height: 32px; margin-top: 6px;">
              <span class="skeleton-loading" style="width: 40px; height: 28px;"></span>
            </span>
          ` : `
            <span class="ticker-value">${metrics.breachedKRIs}</span>
          `}
          <span class="ticker-footer">Operational thresholds crossed</span>
          <button id="btn-view-kri" class="btn btn-secondary btn-small" style="margin-top: 6px; font-size: 10px; padding: 3px 8px; align-self: flex-start;">→ View Evidence</button>
        </div>

        <!-- 3. Overdue Actions -->
        <div class="ticker-card indigo" style="display: flex; flex-direction: column; gap: 4px;">
          <span class="ticker-label">Overdue Actions</span>
          ${isLoading ? `
            <span class="ticker-value" style="display: flex; align-items: center; justify-content: center; height: 32px; margin-top: 6px;">
              <span class="skeleton-loading" style="width: 40px; height: 28px;"></span>
            </span>
          ` : `
            <span class="ticker-value" style="color: ${metrics.overdueActionsCount > 0 ? 'var(--color-above-appetite)' : 'var(--color-within-appetite)'}">
              ${metrics.overdueActionsCount}
            </span>
          `}
          <span class="ticker-footer">Slipped mitigation tasks</span>
          <button id="btn-view-actions" class="btn btn-secondary btn-small" style="margin-top: 6px; font-size: 10px; padding: 3px 8px; align-self: flex-start;">→ View Evidence</button>
        </div>

        <!-- 4. Assurance Gaps -->
        <div class="ticker-card within" style="display: flex; flex-direction: column; gap: 4px;">
          <span class="ticker-label">Assurance Gaps</span>
          ${isLoading ? `
            <span class="ticker-value" style="display: flex; align-items: center; justify-content: center; height: 32px; margin-top: 6px;">
              <span class="skeleton-loading" style="width: 40px; height: 28px;"></span>
            </span>
          ` : `
            <span class="ticker-value" style="color: ${metrics.assuranceGapsCount > 0 ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'}">
              ${metrics.assuranceGapsCount}
            </span>
          `}
          <span class="ticker-footer">Missing third-line coverage</span>
          <button id="btn-view-assurance" class="btn btn-secondary btn-small" style="margin-top: 6px; font-size: 10px; padding: 3px 8px; align-self: flex-start;">→ View Evidence</button>
        </div>

        <!-- 5. Worsening Trends -->
        <div class="ticker-card" style="display: flex; flex-direction: column; gap: 4px; background: rgba(99,102,241,0.04); border-color: rgba(99,102,241,0.15);">
          <span class="ticker-label" style="color: var(--color-indigo);">Worsening Trends</span>
          ${isLoading ? `
            <span class="ticker-value" style="display: flex; align-items: center; justify-content: center; height: 32px; margin-top: 6px;">
              <span class="skeleton-loading" style="width: 40px; height: 28px;"></span>
            </span>
          ` : `
            <span class="ticker-value" style="color: var(--color-indigo);">${metrics.worseningCount}</span>
          `}
          <span class="ticker-footer">Increasing volatility vectors</span>
          <button id="btn-view-network" class="btn btn-secondary btn-small" style="margin-top: 6px; font-size: 10px; padding: 3px 8px; align-self: flex-start;">→ View Evidence</button>
        </div>

      </div>

      <!-- ═══════════════ RISK INTELLIGENCE FEED ═══════════════ -->
      <div class="dashboard-graph-card" id="risk-intelligence-feed-card" style="margin-bottom: 20px;">
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-teal);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Risk Intelligence Feed
            <span class="status-badge within" style="font-size: 9px; padding: 2px 6px; font-weight: normal; margin-left: 4px;">AI Forecasts &amp; Audits</span>
          </h3>
          <p class="dashboard-graph-card-subtitle">AI-detected signals requiring attention</p>
        </div>
        <div id="risk-intelligence-feed-body" style="padding-top: 10px;">
          <!-- Asynchronous loading state -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="skeleton-loading" style="width: 100%; height: 50px; border-radius: 6px;"></div>
            <div class="skeleton-loading" style="width: 100%; height: 50px; border-radius: 6px;"></div>
            <div class="skeleton-loading" style="width: 100%; height: 50px; border-radius: 6px;"></div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ TOP BOARD ISSUES ═══════════════ -->
      <div class="dashboard-graph-card" id="top-board-issues-container">
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-above-appetite);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Top Board Issues
            <span class="status-badge near" style="font-size: 9px; padding: 2px 6px; font-weight: normal; margin-left: 4px;">AI Prioritized</span>
          </h3>
          <p class="dashboard-graph-card-subtitle">Top 5 risks ranked by composite urgency score — appetite breach, trend velocity, KRI status and action overdue</p>
        </div>

        ${isLoading ? `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${[1,2,3,4,5].map(() => `
              <div style="padding: 14px; border: 1px solid var(--border-color); border-radius: 8px; border-left: 3px solid var(--border-color);">
                <div class="skeleton-loading" style="width: 60%; height: 13px; margin-bottom: 8px;"></div>
                <div class="skeleton-loading" style="width: 90%; height: 10px; margin-bottom: 6px;"></div>
                <div class="skeleton-loading" style="width: 45%; height: 10px;"></div>
              </div>
            `).join('')}
          </div>
        ` : topIssues.length === 0 ? `
          <div class="no-data-card dashboard-fade-in">No board issues detected — risk portfolio within appetite.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;" class="dashboard-fade-in">
            ${topIssues.map((issue, idx) => {
              const borderColor =
                issue.severity === 'Critical' ? 'var(--color-above-appetite)' :
                issue.severity === 'High'     ? 'var(--color-near-appetite)'  :
                                                'var(--color-within-appetite)';
              const badgeClass =
                issue.severity === 'Critical' ? 'above' :
                issue.severity === 'High'     ? 'near'  : 'within';
              return `
                <div style="padding: 14px 16px; border: 1px solid var(--border-color); border-radius: 8px; border-left: 3px solid ${borderColor}; background: rgba(0,0,0,0.01);">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <span style="font-size: 10px; font-weight: 600; color: var(--text-muted);">#${idx + 1}</span>
                      <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${issue.title}</span>
                      <span class="status-badge near" style="font-size: 8px; padding: 1px 5px;">${issue.type}</span>
                      <span class="status-badge ${badgeClass}" style="font-size: 8px; padding: 1px 5px;">${issue.severity}</span>
                    </div>
                    <button
                      class="btn btn-secondary btn-small board-issue-evidence-btn"
                      data-url="${issue.deepLink.url}"
                      data-tab="${issue.deepLink.tabKey}"
                      style="font-size: 10px; padding: 3px 10px; white-space: nowrap; flex-shrink: 0;">
                      View Evidence →
                    </button>
                  </div>
                  <p style="font-size: 11px; color: var(--text-secondary); margin: 0 0 4px 0; line-height: 1.5;">${issue.whyMatters}</p>
                  ${issue.linkedObjective ? `<p style="font-size: 10px; color: var(--text-muted); margin: 0 0 4px 0;">🎯 Objective: <em>${issue.linkedObjective}</em></p>` : ''}
                  <p style="font-size: 10px; color: var(--text-muted); margin: 0;">
                    <strong>Recommended:</strong> ${issue.recommendedAction}
                  </p>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- ═══════════════ GOVERNANCE ACTION QUEUE ═══════════════ -->
      <div class="dashboard-graph-card" id="governance-action-queue">
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-near-appetite);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Governance Action Queue
          </h3>
          <p class="dashboard-graph-card-subtitle">Most overdue mitigation actions requiring immediate attention</p>
        </div>

        ${isLoading ? `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${[1,2,3].map(() => `
              <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                <div class="skeleton-loading" style="width: 55%; height: 12px; margin-bottom: 6px;"></div>
                <div class="skeleton-loading" style="width: 75%; height: 10px;"></div>
              </div>
            `).join('')}
          </div>
        ` : allOverdueActions.length === 0 ? `
          <div class="no-data-card dashboard-fade-in" style="background: rgba(16,185,129,0.03); border: 1px solid rgba(16,185,129,0.15);">
            ✓ No overdue governance actions — mitigation programme on track.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;" class="dashboard-fade-in">
            ${allOverdueActions.map(a => {
              const dueDateStr = a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              const statusBadge = a.status === 'In Progress' ? 'near' : a.status === 'Not Started' ? 'above' : 'within';
              return `
                <div style="padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(239,68,68,0.01); border-left: 3px solid var(--color-above-appetite); display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 180px;">
                    <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${a.title || 'Unnamed Action'}</div>
                    <div style="font-size: 10px; color: var(--text-secondary);">Risk: <em>${a.riskTitle}</em></div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 10px; color: var(--text-secondary);">
                    <span>Due: <strong style="color: var(--color-above-appetite);">${dueDateStr}</strong></span>
                    <span style="background: rgba(239,68,68,0.08); color: var(--color-above-appetite); font-weight: 700; padding: 2px 7px; border-radius: 4px;">${a.daysOverdue}d overdue</span>
                    ${a.owner ? `<span>Owner: <strong>${a.owner}</strong></span>` : ''}
                    <span class="status-badge ${statusBadge}" style="font-size: 8px; padding: 1px 5px;">${a.status || 'Unknown'}</span>
                  </div>
                </div>
              `;
            }).join('')}
            <div style="margin-top: 4px; text-align: right;">
              <a id="link-view-all-overdue" href="#" style="font-size: 11px; color: var(--color-indigo); text-decoration: none; font-weight: 600;">View All Overdue Actions →</a>
            </div>
          </div>
        `}
      </div>

      <!-- ═══════════════ DETAILED DIAGNOSTICS ACCORDION ═══════════════ -->
      <div class="dashboard-graph-card" style="padding: 0; overflow: hidden;">

        <!-- Accordion Header -->
        <div id="diagnostics-accordion-header" style="
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; cursor: pointer; user-select: none;
          border-bottom: ${this._diagnosticsExpanded ? '1px solid var(--border-color)' : 'none'};
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-indigo);">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            <div>
              <h3 class="dashboard-graph-card-title" style="margin: 0; font-size: 14px;">Detailed Diagnostics &amp; Analytics</h3>
              <p class="dashboard-graph-card-subtitle" style="margin: 2px 0 0 0; font-size: 11px;">KRI Monitor · Heatmap · Velocity · Fragility · Dynamics · AI Narrative</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 10px; color: var(--text-muted);">${this._diagnosticsExpanded ? 'Collapse' : 'Expand'}</span>
            <svg id="diagnostics-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
              style="width: 16px; height: 16px; transition: transform 0.25s ease; transform: ${this._diagnosticsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <!-- Accordion Body -->
        <div id="diagnostics-accordion-body" style="
          overflow: hidden;
          max-height: ${this._diagnosticsExpanded ? '9999px' : '0px'};
          transition: max-height 0.35s ease-in-out;
          padding: ${this._diagnosticsExpanded ? '20px' : '0 20px'};
        ">
          <div style="display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px;">

            <!-- 1. KRI BREACH MONITOR (FULL WIDTH) -->
            <div class="dashboard-graph-card" id="kri-breach-container" style="margin: 0;">
              <div class="dashboard-graph-card-header">
                <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
                <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
              </div>
              <div class="kri-gauge-scroll-container">
                <div class="kri-gauge-grid">
                  ${isLoading ? `
                    ${[1, 2, 3, 4].map(() => `
                      <div class="kri-gauge-card">
                        <div class="kri-gauge-title">
                          <div class="skeleton-loading" style="width: 100px; height: 12px; margin: 0 auto;"></div>
                        </div>
                        <div style="position: relative; width: 100%; max-width: 120px; height: 66px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                          <div class="skeleton-loading" style="width: 100px; height: 50px; border-radius: 50px 50px 0 0;"></div>
                        </div>
                        <div class="skeleton-loading" style="width: 60px; height: 18px; margin: 0 auto; border-radius: 4px;"></div>
                      </div>
                    `).join('')}
                  ` : `
                    <!-- Will be populated dynamically in initGraphs -->
                  `}
                </div>
              </div>
            </div>

            <!-- 2. RISK HEATMAP (FULL WIDTH) -->
            <div class="dashboard-graph-card" id="risk-heatmap-container" style="margin: 0;">
              <div class="dashboard-graph-card-header">
                <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
                <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
              </div>
              ${isLoading ? `
                <div class="dashboard-fade-in" style="position: relative; height: 280px; margin-bottom: 16px; display: flex; justify-content: center; align-items: center; background: rgba(0, 0, 0, 0.02); border-radius: 8px;">
                  <div class="skeleton-loading" style="width: 100%; height: 100%; border-radius: 8px;"></div>
                </div>
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; font-size: 11px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #FCA5A5; opacity: 0.5;"></span>
                    <span style="color: var(--text-secondary);">Above Appetite</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #FCD34D; opacity: 0.5;"></span>
                    <span style="color: var(--text-secondary);">Near Appetite</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #6EE7B7; opacity: 0.5;"></span>
                    <span style="color: var(--text-secondary);">Within Appetite</span>
                  </div>
                </div>
                <div id="heatmap-drilldown-container" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                  <p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>
                </div>
              ` : `
                <!-- Will be populated dynamically in initGraphs -->
              `}
            </div>

            <!-- 3. RISK VELOCITY TRACKER (FULL WIDTH) -->
            <div class="dashboard-graph-card" id="risk-velocity-container" style="margin: 0;">
              <div class="dashboard-graph-card-header">
                <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
                <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
              </div>
              ${isLoading ? `
                <div style="overflow-x: auto; width: 100%;">
                  <table class="risk-velocity-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 600;">
                        <th style="padding: 8px 12px;">Risk Name</th>
                        <th style="padding: 8px 12px;">Category</th>
                        <th style="padding: 8px 12px; text-align: center;">Score</th>
                        <th style="padding: 8px 12px; text-align: center;">Trend</th>
                        <th style="padding: 8px 12px; width: 100px; text-align: center;">Sparkline</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${[1, 2, 3, 4, 5].map(() => `
                        <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.03);">
                          <td style="padding: 10px 12px;"><div class="skeleton-loading" style="width: 180px; height: 12px;"></div></td>
                          <td style="padding: 10px 12px;"><div class="skeleton-loading" style="width: 80px; height: 10px; border-radius: 4px;"></div></td>
                          <td style="padding: 10px 12px; text-align: center; display: flex; justify-content: center;"><div class="skeleton-loading" style="width: 20px; height: 16px;"></div></td>
                          <td style="padding: 10px 12px; text-align: center;"><div class="skeleton-loading" style="width: 60px; height: 12px; border-radius: 4px; margin: 0 auto;"></div></td>
                          <td style="padding: 10px 12px; text-align: center;"><div class="skeleton-loading" style="width: 80px; height: 24px; border-radius: 4px; margin: 0 auto;"></div></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <!-- Will be populated dynamically in initGraphs -->
              `}
            </div>

            <!-- 4. STRATEGIC FRAGILITY MAP (FULL WIDTH) -->
            <div class="dashboard-graph-card" id="fragility-map-container" style="margin: 0;">
              <div class="dashboard-graph-card-header">
                <h3 class="dashboard-graph-card-title">Strategic Fragility Map</h3>
                <p class="dashboard-graph-card-subtitle">Aggregated risk severity mapped to core strategic objective categories</p>
              </div>
              <div class="fragility-container">
                ${isLoading ? `
                  ${['Revenue Objectives', 'Market Growth', 'Customer Trust', 'Technology Stack', 'Talent & People'].map((name) => `
                    <div class="fragility-bar-row">
                      <div class="fragility-bar-header">
                        <span>${name}</span>
                        <span class="skeleton-loading" style="width: 50px; height: 12px; display: inline-block;"></span>
                      </div>
                      <div class="fragility-bar-outer">
                        <div class="skeleton-loading" style="width: 100%; height: 100%; border-radius: 3px;"></div>
                      </div>
                    </div>
                  `).join('')}
                ` : `
                  ${Object.entries(metrics.fragilityPercentages).map(([key, percent]) => {
                    const displayName = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/([A-Z])/g, ' $1');
                    return `
                      <div class="fragility-bar-row">
                        <div class="fragility-bar-header">
                          <span>${displayName}</span>
                          <span>${percent}% Fragility</span>
                        </div>
                        <div class="fragility-bar-outer">
                          <div class="fragility-bar-inner" style="width: ${percent}%"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                `}
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 14px; text-align: center;">
                *Fragility aggregates risk severity (L × I × V) mapped to objective dimensions. Lower is safer.
              </p>
            </div>

            <!-- 5. RISK DYNAMICS TRACKER (FULL WIDTH) -->
            <div class="dashboard-graph-card" id="dynamics-tracker-container" style="margin: 0;">
              <div class="dashboard-graph-card-header">
                <h3 class="dashboard-graph-card-title">Risk Dynamics Tracker</h3>
                <p class="dashboard-graph-card-subtitle">Detailed categorization of risk posture trend changes</p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">

                <!-- Column Worsening -->
                <div>
                  <h4 style="font-size:12px;color:var(--color-above-appetite);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Top Worsening Risk Items</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    ${isLoading ? `
                      ${[1, 2].map(() => `
                        <div style="padding:10px;background:rgba(255,42,84,0.01);border:1px solid rgba(255,42,84,0.05);border-radius:6px;">
                          <div class="skeleton-loading" style="width: 100%; height: 12px; margin-bottom: 6px;"></div>
                          <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div class="skeleton-loading" style="width: 60px; height: 10px;"></div>
                            <div class="skeleton-loading" style="width: 50px; height: 10px;"></div>
                          </div>
                        </div>
                      `).join('')}
                    ` : worseningRisks.length ? worseningRisks.map(r => `
                      <div class="ai-explain-trigger" data-explain-type="risk" data-explain-id="${r.id}" style="padding:10px;background:rgba(255,42,84,0.03);border:1px solid rgba(255,42,84,0.1);border-radius:6px;cursor:pointer;">
                        <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;justify-content:space-between;align-items:center;">
                          <span>${r.title}</span>
                          <button class="ai-explain-icon-btn" aria-label="AI Explain">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 12px; height: 12px;">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                            </svg>
                          </button>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:4px;">
                          <span>Residual Score: ${r.residualScore}</span>
                          <span class="trend-tag deteriorating">↑ Worsening</span>
                        </div>
                      </div>
                    `).join('') : '<div style="font-size:11px;color:var(--text-muted);">No deteriorating trends.</div>'}
                  </div>
                </div>

                <!-- Column Improving -->
                <div>
                  <h4 style="font-size:12px;color:var(--color-within-appetite);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Top Improving Risk Items</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    ${isLoading ? `
                      ${[1, 2].map(() => `
                        <div style="padding:10px;background:rgba(16,185,129,0.01);border:1px solid rgba(16,185,129,0.05);border-radius:6px;">
                          <div class="skeleton-loading" style="width: 100%; height: 12px; margin-bottom: 6px;"></div>
                          <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div class="skeleton-loading" style="width: 60px; height: 10px;"></div>
                            <div class="skeleton-loading" style="width: 50px; height: 10px;"></div>
                          </div>
                        </div>
                      `).join('')}
                    ` : improvingRisks.length ? improvingRisks.map(r => `
                      <div class="ai-explain-trigger" data-explain-type="risk" data-explain-id="${r.id}" style="padding:10px;background:rgba(16,185,129,0.03);border:1px solid rgba(16,185,129,0.1);border-radius:6px;cursor:pointer;">
                        <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;justify-content:space-between;align-items:center;">
                          <span>${r.title}</span>
                          <button class="ai-explain-icon-btn" aria-label="AI Explain">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 12px; height: 12px;">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
                            </svg>
                          </button>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:4px;">
                          <span>Residual Score: ${r.residualScore}</span>
                          <span class="trend-tag improving">↓ Improving</span>
                        </div>
                      </div>
                    `).join('') : '<div style="font-size:11px;color:var(--text-muted);">No active mitigations reporting improvement.</div>'}
                  </div>
                </div>

              </div>
            </div>

            <!-- 6. AI BOARD NARRATIVE BRIEF (FULL WIDTH COLLAPSIBLE) -->
            <div class="dashboard-graph-card" id="ai-brief-container" style="margin: 0;">
              <div class="dashboard-graph-card-header" id="ai-brief-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
                <div>
                  <h3 class="dashboard-graph-card-title" style="display: flex; align-items: center; gap: 8px; margin: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-indigo);">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>AI Board Narrative Brief</span>
                    <span class="status-badge ${settings.geminiApiKey ? 'within' : 'near'}" style="font-size: 9px; padding: 2px 6px; font-weight: normal; margin-left: 8px;">
                      ${settings.geminiApiKey ? 'Live Gemini AI' : 'Simulation Mode'}
                    </span>
                  </h3>
                  <p class="dashboard-graph-card-subtitle" style="margin-top: 4px;">Executive qualitative commentary and risk posture summarization</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;" class="no-print">
                  <button class="btn btn-primary btn-small" id="btn-generate-brief" ${isLoading ? 'disabled' : ''} style="position: relative; z-index: 2;">
                    ${this.isGeneratingBrief ? 'Analyzing...' : 'Generate Brief'}
                  </button>
                  <svg id="ai-brief-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px; transition: transform 0.2s ease; transform: ${this.isBriefCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              <div id="ai-brief-body" style="transition: max-height 0.3s ease-in-out, margin-top 0.3s ease-in-out; overflow: hidden; max-height: ${this.isBriefCollapsed ? '0px' : '2000px'}; margin-top: ${this.isBriefCollapsed ? '0' : '16px'};">
                <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: 10px; padding: 20px; font-size: 13px; line-height: 1.6;">
                  ${isLoading ? `
                    <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center; min-height: 120px;">
                      <div class="skeleton-loading" style="width: 95%; height: 14px; border-radius: 4px;"></div>
                      <div class="skeleton-loading" style="width: 90%; height: 14px; border-radius: 4px;"></div>
                      <div class="skeleton-loading" style="width: 85%; height: 14px; border-radius: 4px;"></div>
                      <div class="skeleton-loading" style="width: 70%; height: 14px; border-radius: 4px;"></div>
                    </div>
                  ` : this.isGeneratingBrief ? `
                    <div class="chat-bubble-loader" style="height: 120px; display: flex; align-items: center; justify-content: center;">
                      <span></span><span></span><span></span>
                    </div>
                  ` : `
                    <div class="board-brief-markdown">
                      ${this.briefContent ? this.formatMarkdown(this.briefContent) : `
                        <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 40px; height: 40px; margin: 0 auto 10px; opacity: 0.5;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Click "Generate Brief" to formulate a professional narrative summary for board review.
                        </div>
                      `}
                    </div>
                  `}
                </div>
              </div>
            </div>

          </div><!-- /inner flex column -->
        </div><!-- /diagnostics-accordion-body -->
      </div><!-- /accordion card -->
    `;

    this.bindEvents(container);

    // Trigger asynchronous graph rendering (only if accordion is open)
    if (this._diagnosticsExpanded) {
      this.initGraphs(container);
    } else {
      // Still load the Board Attention Brief (it's outside the accordion)
      this._loadBoardBrief(container);
    }

    // Trigger asynchronous Risk Intelligence Feed loading
    setTimeout(async () => {
      try {
        const { RiskIntelligenceService } = await import('../services/riskIntelligenceService.js');
        const insights = await RiskIntelligenceService.generateInsights(risks, null);
        this.renderIntelligenceFeed(insights);
      } catch (err) {
        console.error("Failed to load Risk Intelligence Feed:", err);
        const feedBody = document.querySelector('#risk-intelligence-feed-body');
        if (feedBody) {
          feedBody.innerHTML = `<div class="no-data-card" style="font-size:11px;color:var(--color-above-appetite);">Failed to generate intelligence feed.</div>`;
        }
      }
    }, 100);
  }

  // ─── Load Board Attention Brief (outside accordion) ──────────────────────
  _loadBoardBrief(container) {
    const isLoading = this.state.isLoading;
    if (isLoading) return;

    const briefContentContainer = container.querySelector('#board-brief-content');
    if (briefContentContainer) {
      AIInsightService.getBoardAttentionBrief(this.state).then(brief => {
        briefContentContainer.innerHTML = AIInsightService.formatMarkdown(brief);
      }).catch(err => {
        console.error("Failed to load Board Attention Brief:", err);
        briefContentContainer.innerHTML = `<p style="color: var(--color-above-appetite);">Failed to load AI Board Attention Brief. Click regenerate to retry.</p>`;
      });
    }
  }

  // Generate HTML for Heatmap drilldown card
  renderHeatmapDrilldown(risk) {
    if (!risk) {
      return `<p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>`;
    }

    return `
      <div class="dashboard-fade-in" style="padding: 12px; background: rgba(0, 181, 181, 0.03); border: 1px solid rgba(0, 181, 181, 0.15); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:12px; color:var(--text-primary); font-weight:700; margin:0;">${risk.title}</h4>
          <button class="btn btn-secondary btn-small" id="btn-clear-heatmap" style="padding:2px 8px; font-size:10px;">Clear Pin</button>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); line-height:1.5; margin-bottom:8px;">
          ${risk.description}
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:10px; border-top: 1px solid var(--border-color); padding-top:8px; margin-top:8px;">
          <div>Owner: <strong>${risk.owner}</strong></div>
          <div>Category: <strong>${risk.category}</strong></div>
          <div>Likelihood: <strong>L${risk.likelihoodResidual || risk.likelihood}</strong></div>
          <div>Impact: <strong>I${risk.impactResidual || risk.impact}</strong></div>
          <div>Residual Score: <strong class="trend-tag ${risk.appetiteStatus === 'Above Appetite' ? 'deteriorating' : 'stable'}" style="padding: 2px 6px; font-size:10px; border-radius:4px; font-weight:bold;">${risk.residualScore}</strong></div>
          <div>Appetite Status: <strong style="color: ${risk.appetiteStatus === 'Above Appetite' ? 'var(--color-above-appetite)' : risk.appetiteStatus === 'Near Appetite' ? 'var(--color-near-appetite)' : 'var(--color-within-appetite)'}">${risk.appetiteStatus}</strong></div>
        </div>
      </div>
    `;
  }

  // Fast Markdown to HTML Converter for simulated/live responses
  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    // Replace headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:14px;margin-bottom:6px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;margin-top:10px;margin-bottom:4px;">$1</h5>');
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Replace horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:12px 0;" />');
    // Replace lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;list-style:decimal;">$1</li>');

    return html;
  }

  // ─── Render line charts, bubble charts and SVG gauges dynamically ─────────
  async initGraphs(container) {
    const risks = this.state.risks || [];
    const isLoading = this.state.isLoading;

    if (isLoading) {
      return;
    }

    // Load Board Attention Brief
    this._loadBoardBrief(container);

    // Guard: containers live inside accordion — skip if not in DOM
    const velocityContainer  = container.querySelector('#risk-velocity-container');
    const heatmapContainer   = container.querySelector('#risk-heatmap-container');
    const breachedKriContainer = container.querySelector('#kri-breach-container');

    if (!velocityContainer && !heatmapContainer && !breachedKriContainer) {
      // Accordion not yet expanded — charts will be lazy-initialized on expand
      return;
    }

    if (risks.length === 0) {
      if (velocityContainer) {
        velocityContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
            <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for velocity tracking.</div>
        `;
      }
      if (heatmapContainer) {
        heatmapContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
            <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for risk heatmap.</div>
        `;
      }
      if (breachedKriContainer) {
        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="no-data-card dashboard-fade-in">No data available for KRI monitoring.</div>
        `;
      }
      return;
    }

    // Helper functions for parsing numerical fields in KRIs
    const parseNumeric = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const match = val.match(/[-+]?[0-9]*\.?[0-9]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const getUnit = (val) => {
      if (typeof val !== 'string') return '';
      if (val.includes('%')) return '%';
      if (val.includes('days')) return ' days';
      if (val.includes('day')) return ' day';
      return '';
    };

    // 1. RENDER RISK VELOCITY TRACKER
    if (velocityContainer) {
      const top5Risks = [...risks]
        .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
        .slice(0, 5);

      velocityContainer.innerHTML = `
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title">Risk Velocity Tracker</h3>
          <p class="dashboard-graph-card-subtitle">Residual score movement across top risks</p>
        </div>
        <div style="overflow-x: auto; width: 100%;" class="dashboard-fade-in">
          <table class="risk-velocity-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; color: var(--text-primary);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 600;">
                <th style="padding: 8px 12px;">Risk Name</th>
                <th style="padding: 8px 12px;">Category</th>
                <th style="padding: 8px 12px; text-align: center; width: 60px;">Score</th>
                <th style="padding: 8px 12px; text-align: center; width: 100px;">Trend</th>
                <th style="padding: 8px 12px; text-align: center; width: 100px;">Sparkline</th>
              </tr>
            </thead>
            <tbody>
              ${top5Risks.map((r, idx) => {
                const trendLabel = r.trend === 'Deteriorating' ? 'Worsening' : r.trend === 'Improving' ? 'Improving' : 'Stable';
                const badgeClass = r.trend === 'Deteriorating' ? 'above' : r.trend === 'Improving' ? 'within' : 'near';
                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                return `
                  <tr style="background-color: ${rowBg}; border-bottom: 1px solid rgba(0, 0, 0, 0.03);">
                    <td style="padding: 10px 12px; font-weight: 600; font-size: 12px;" title="${r.title}">${r.title}</td>
                    <td style="padding: 10px 12px;">
                      <span class="profile-role-badge" style="font-size: 8px; color: var(--color-indigo); margin: 0; padding: 2px 6px;">${r.category}</span>
                    </td>
                    <td style="padding: 10px 12px; text-align: center; font-size: 14px; font-weight: 700;">${r.residualScore}</td>
                    <td style="padding: 10px 12px; text-align: center;">
                      <span class="status-badge ${badgeClass}" style="font-size: 8px; padding: 1px 4px; font-weight: bold; display: inline-block;">${trendLabel}</span>
                    </td>
                    <td style="padding: 6px 12px; text-align: center; vertical-align: middle;">
                      <div style="width: 80px; height: 32px; margin: 0 auto; position: relative;">
                        <canvas id="velocity-chart-${idx}" width="80" height="32" style="width: 80px !important; height: 32px !important;"></canvas>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Initialize line charts for each of the top 5 risks
      top5Risks.forEach((r, idx) => {
        const ctx = document.getElementById(`velocity-chart-${idx}`);
        if (!ctx) return;

        const currentScore = r.residualScore || 12;
        const trend = r.trend;
        const historyPoints = [];
        const clamp = (val) => Math.max(1, Math.min(25, val));

        if (trend === 'Deteriorating') {
          let last = currentScore;
          historyPoints.unshift(last);
          for (let i = 0; i < 4; i++) {
            last = clamp(last - Math.floor(Math.random() * 3));
            historyPoints.unshift(last);
          }
        } else if (trend === 'Improving') {
          let last = currentScore;
          historyPoints.unshift(last);
          for (let i = 0; i < 4; i++) {
            last = clamp(last + Math.floor(Math.random() * 3));
            historyPoints.unshift(last);
          }
        } else {
          for (let i = 0; i < 5; i++) {
            const dev = Math.floor(Math.random() * 3) - 1;
            historyPoints.push(clamp(currentScore + dev));
          }
        }
        historyPoints[historyPoints.length - 1] = currentScore;

        const lineColor = trend === 'Deteriorating' ? '#EF4444' : trend === 'Improving' ? '#059669' : '#D97706';

        if (typeof window.Chart !== 'undefined') {
          new window.Chart(ctx, {
            type: 'line',
            data: {
              labels: ['P1', 'P2', 'P3', 'P4', 'Current'],
              datasets: [{
                data: historyPoints,
                borderColor: lineColor,
                borderWidth: 1.5,
                pointBackgroundColor: lineColor,
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 1.0,
                pointRadius: 1.5,
                pointHoverRadius: 3.0,
                fill: false,
                tension: 0.35
              }]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  intersect: false,
                  mode: 'index',
                  backgroundColor: '#0F172A',
                  titleColor: '#FFFFFF',
                  bodyColor: '#FFFFFF',
                  titleFont: { size: 9, family: 'Inter' },
                  bodyFont: { size: 10, family: 'Inter', weight: 'bold' },
                  padding: 4,
                  callbacks: {
                    title: () => '',
                    label: (context) => `Score: ${context.parsed.y}`
                  }
                }
              },
              scales: {
                x: { display: false },
                y: {
                  display: false,
                  min: Math.max(0, Math.min(...historyPoints) - 1),
                  max: Math.max(...historyPoints) + 1,
                  grid: { display: false },
                  border: { display: false }
                }
              }
            }
          });
        } else {
          console.warn("Chart.js is not loaded. Skipping velocity sparkline chart initialization.");
        }
      });
    }

    // 2. RENDER RISK HEATMAP
    if (heatmapContainer) {
      heatmapContainer.innerHTML = `
        <div class="dashboard-graph-card-header">
          <h3 class="dashboard-graph-card-title">Risk Heatmap</h3>
          <p class="dashboard-graph-card-subtitle">Residual likelihood vs impact across active risk portfolio</p>
        </div>
        <div class="dashboard-fade-in" style="position: relative; height: 280px; margin-bottom: 16px;">
          <canvas id="heatmap-chart-canvas"></canvas>
        </div>
        <div class="dashboard-fade-in" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #FCA5A5;"></span>
            <span style="color: var(--text-secondary);">Above Appetite</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #FCD34D;"></span>
            <span style="color: var(--text-secondary);">Near Appetite</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #6EE7B7;"></span>
            <span style="color: var(--text-secondary);">Within Appetite</span>
          </div>
        </div>
        <div id="heatmap-drilldown-container" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <p style="font-size:11px;color:var(--text-muted);text-align:center;">Click on any plotted risk point in the heatmap scatter grid to pin and inspect item specifics.</p>
        </div>
      `;

      const ctx = document.getElementById('heatmap-chart-canvas');
      if (ctx) {
        const bubbleData = risks.map((r, index) => ({
          x: r.likelihoodResidual || r.likelihood || 1,
          y: r.impactResidual || r.impact || 1,
          r: Math.max(6, (r.residualScore || 1) * 0.8),
          riskObj: r,
          index: index
        }));

        this.selectedHeatmapRiskIndex = null;

        const xVals = risks.map(r => r.likelihoodResidual || r.likelihood || 1);
        const yVals = risks.map(r => r.impactResidual || r.impact || 1);
        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);
        const yMin = Math.min(...yVals);
        const yMax = Math.max(...yVals);

        const scaleMinX = Math.max(0.5, xMin - 0.5);
        const scaleMaxX = Math.min(5.5, xMax + 0.5);
        const scaleMinY = Math.max(0.5, yMin - 0.5);
        const scaleMaxY = Math.min(5.5, yMax + 0.5);

        const quadrantPlugin = {
          id: 'quadrantShading',
          beforeDraw(chart) {
            const { ctx: chartCtx, chartArea: { top, right, bottom, left }, scales: { x, y } } = chart;
            chartCtx.save();
            const xPixel = x.getPixelForValue(3);
            const yPixel = y.getPixelForValue(3);
            const xMaxVal = Math.max(3, x.max);
            const yMaxVal = Math.max(3, y.max);
            const xMaxPixel = x.getPixelForValue(xMaxVal);
            const yMaxPixel = y.getPixelForValue(yMaxVal);

            chartCtx.fillStyle = 'rgba(239, 68, 68, 0.02)';
            chartCtx.fillRect(
              Math.max(left, xPixel),
              Math.max(top, yMaxPixel),
              Math.max(0, xMaxPixel - xPixel),
              Math.max(0, yPixel - yMaxPixel)
            );
            chartCtx.restore();
          }
        };

        if (typeof window.Chart !== 'undefined') {
          const heatmapChartInstance = new window.Chart(ctx, {
            type: 'bubble',
            data: {
              datasets: [{
                data: bubbleData,
                backgroundColor: (context) => {
                  const dataPoint = context.raw;
                  if (!dataPoint) return '#6EE7B7';
                  const status = dataPoint.riskObj.appetiteStatus;
                  return status === 'Above Appetite' ? '#FCA5A5' : status === 'Near Appetite' ? '#FCD34D' : '#6EE7B7';
                },
                borderColor: '#FFFFFF',
                borderWidth: 2,
                hoverBorderColor: '#0F172A',
                hoverBorderWidth: 2
              }]
            },
            plugins: [quadrantPlugin],
            options: {
              responsive: true,
              maintainAspectRatio: false,
              onClick: (event, elements) => {
                const ddContainer = container.querySelector('#heatmap-drilldown-container');
                if (elements && elements.length > 0) {
                  const datasetIndex = elements[0].datasetIndex;
                  const index = elements[0].index;
                  const clickedPoint = heatmapChartInstance.data.datasets[datasetIndex].data[index];

                  this.selectedHeatmapRiskIndex = clickedPoint.index;

                  if (ddContainer) {
                    ddContainer.innerHTML = this.renderHeatmapDrilldown(clickedPoint.riskObj);
                    this.bindHeatmapClearEvent(container, heatmapChartInstance);
                  }
                } else {
                  this.selectedHeatmapRiskIndex = null;
                  if (ddContainer) {
                    ddContainer.innerHTML = this.renderHeatmapDrilldown(null);
                  }
                }
                heatmapChartInstance.update();
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  backgroundColor: '#0F172A',
                  titleColor: '#FFFFFF',
                  bodyColor: '#FFFFFF',
                  titleFont: { size: 10, family: 'Inter', weight: 'bold' },
                  bodyFont: { size: 9, family: 'Inter' },
                  padding: 10,
                  callbacks: {
                    title: (context) => {
                      const rawPoint = context[0].raw;
                      return rawPoint.riskObj.title;
                    },
                    label: (context) => {
                      const rawPoint = context.raw;
                      return [
                        `Residual Score: ${rawPoint.riskObj.residualScore}`,
                        `Likelihood: L${rawPoint.x}`,
                        `Impact: I${rawPoint.y}`,
                        `Status: ${rawPoint.riskObj.appetiteStatus}`
                      ];
                    }
                  }
                }
              },
              scales: {
                x: {
                  min: scaleMinX,
                  max: scaleMaxX,
                  ticks: {
                    stepSize: 1,
                    color: '#64748B',
                    font: { family: 'Inter', size: 10 }
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawTicks: false
                  },
                  border: { color: 'rgba(0, 0, 0, 0.06)' },
                  title: {
                    display: true,
                    text: 'Likelihood →',
                    color: '#64748B',
                    font: { family: 'Outfit', size: 11, weight: 'bold' }
                  }
                },
                y: {
                  min: scaleMinY,
                  max: scaleMaxY,
                  ticks: {
                    stepSize: 1,
                    color: '#64748B',
                    font: { family: 'Inter', size: 10 }
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawTicks: false
                  },
                  border: { color: 'rgba(0, 0, 0, 0.06)' },
                  title: {
                    display: true,
                    text: 'Impact ↑',
                    color: '#64748B',
                    font: { family: 'Outfit', size: 11, weight: 'bold' }
                  }
                }
              }
            }
          });
        } else {
          console.warn("Chart.js is not loaded. Skipping heatmap scatter chart initialization.");
        }
      }
    }

    // 3. RENDER KRI BREACH MONITOR (GAUGES)
    if (breachedKriContainer) {
      const breachedKriList = [];
      risks.forEach(r => {
        if (r.kris && Array.isArray(r.kris)) {
          r.kris.forEach(k => {
            if (k.status === 'BREACHED') {
              breachedKriList.push({
                riskTitle: r.title,
                kriName: k.name,
                current: k.current,
                threshold: k.threshold
              });
            }
          });
        }
      });

      if (breachedKriList.length === 0) {
        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="no-breach-state-card dashboard-fade-in" style="background: rgba(16,185,129,0.03); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 32px 24px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <div style="font-size: 32px; color: #059669; margin-bottom: 8px;">✓</div>
            <h4 style="font-family: var(--font-header); font-size: 14px; font-weight: 700; color: #059669; margin: 0 0 4px 0;">All KRIs within threshold</h4>
            <p style="font-family: var(--font-body); font-size: 11px; color: var(--text-secondary); margin: 0;">No operational metric has breached approved corporate limits.</p>
          </div>
        `;
      } else {
        breachedKriContainer.innerHTML = `
          <div class="dashboard-graph-card-header">
            <h3 class="dashboard-graph-card-title">KRI Breach Monitor</h3>
            <p class="dashboard-graph-card-subtitle">Live key risk indicator status against defined thresholds</p>
          </div>
          <div class="kri-gauge-scroll-container dashboard-fade-in">
            <div class="kri-gauge-grid">
              ${breachedKriList.map((kri, idx) => {
                const currentNum = parseNumeric(kri.current);
                const thresholdNum = parseNumeric(kri.threshold);
                const unit = getUnit(kri.current);

                const delta = currentNum - thresholdNum;
                const formattedDelta = `+${delta.toFixed(1).replace(/\.0$/, '')}${unit}`;

                let maxVal = 100;
                if (currentNum > 100 || thresholdNum > 100) {
                  maxVal = Math.ceil(Math.max(currentNum, thresholdNum) * 1.3);
                } else if (thresholdNum <= 0) {
                  maxVal = 100;
                } else {
                  maxVal = Math.max(10, Math.ceil(thresholdNum * 1.4), Math.ceil(currentNum * 1.1));
                }

                const cx = 100;
                const cy = 90;
                const R = 70;

                const amberStartVal = 0.9 * thresholdNum;

                const angleAmberStart = Math.max(0, Math.min(180, (amberStartVal / maxVal) * 180));
                const radAmberStart = (180 - angleAmberStart) * Math.PI / 180;
                const xAmberStart = cx + R * Math.cos(radAmberStart);
                const yAmberStart = cy - R * Math.sin(radAmberStart);

                const angleThresh = Math.max(0, Math.min(180, (thresholdNum / maxVal) * 180));
                const radThresh = (180 - angleThresh) * Math.PI / 180;
                const xThresh = cx + R * Math.cos(radThresh);
                const yThresh = cy - R * Math.sin(radThresh);

                const angleNeedle = Math.max(0, Math.min(180, (currentNum / maxVal) * 180));
                const radNeedle = (180 - angleNeedle) * Math.PI / 180;
                const xNeedle = cx + (R - 12) * Math.cos(radNeedle);
                const yNeedle = cy - (R - 12) * Math.sin(radNeedle);

                return `
                  <div class="kri-gauge-card">
                    <div class="kri-gauge-title" title="${kri.kriName}">${kri.kriName}</div>

                    <div style="position: relative; width: 100%; max-width: 120px; height: 66px; margin: 0 auto 8px;">
                      <svg viewBox="0 0 200 110" width="100%" height="100%">
                        <path d="M 30 90 A 70 70 0 0 1 170 90" fill="none" stroke="#F1F5F9" stroke-width="12" stroke-linecap="round" />
                        <path d="M 30 90 A 70 70 0 0 1 ${xAmberStart} ${yAmberStart}" fill="none" stroke="#6EE7B7" stroke-width="12" />
                        <path d="M ${xAmberStart} ${yAmberStart} A 70 70 0 0 1 ${xThresh} ${yThresh}" fill="none" stroke="#FCD34D" stroke-width="12" />
                        <path d="M ${xThresh} ${yThresh} A 70 70 0 0 1 170 90" fill="none" stroke="#FCA5A5" stroke-width="12" stroke-linecap="round" />
                        <line x1="${cx + (R - 14) * Math.cos(radThresh)}" y1="${cy - (R - 14) * Math.sin(radThresh)}"
                              x2="${cx + (R + 14) * Math.cos(radThresh)}" y2="${cy - (R + 14) * Math.sin(radThresh)}"
                              stroke="#0F172A" stroke-width="2" />
                        <line x1="${cx}" y1="${cy}" x2="${xNeedle}" y2="${yNeedle}" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" />
                        <circle cx="${cx}" cy="${cy}" r="5" fill="#0F172A" />
                      </svg>
                    </div>

                    <div style="font-size: 16px; font-weight: 700; color: #EF4444; line-height: 1;">
                      ${formattedDelta}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
    }
  }

  // ─── clearFilters (required by deep-link spec) ────────────────────────────
  clearFilters() {
    window.history.pushState(null, '', window.location.pathname);
  }

  bindEvents(container) {
    // ── Print button ──────────────────────────────────────────────────────────
    const printBtn = container.querySelector('#btn-print-pack');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // ── Critical Signals "View Evidence" buttons ───────────────────────────
    const tickerBtnMap = [
      { id: 'btn-view-appetite',  url: '/risks?appetiteStatus=above',   tab: 'register'  },
      { id: 'btn-view-kri',       url: '/controls?kriStatus=breached',   tab: 'controls'  },
      { id: 'btn-view-actions',   url: '/actions?status=overdue',        tab: 'actions'   },
      { id: 'btn-view-assurance', url: '/assurance?gap=true',            tab: 'assurance' },
      { id: 'btn-view-network',   url: '/network',                       tab: 'network'   },
    ];
    tickerBtnMap.forEach(({ id, url, tab }) => {
      const btn = container.querySelector(`#${id}`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigateToPage(url, tab);
        });
      }
    });

    // ── Top Board Issues "View Evidence" buttons ──────────────────────────
    container.querySelectorAll('.board-issue-evidence-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        const tab = btn.dataset.tab;
        if (url && tab) {
          this.navigateToPage(url, tab);
        }
      });
    });

    // ── Governance Action Queue "View All" link ────────────────────────────
    const viewAllOverdue = container.querySelector('#link-view-all-overdue');
    if (viewAllOverdue) {
      viewAllOverdue.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToPage('/actions?status=overdue', 'actions');
      });
    }

    // ── Diagnostics Accordion Toggle ──────────────────────────────────────
    const accordionHeader = container.querySelector('#diagnostics-accordion-header');
    if (accordionHeader) {
      accordionHeader.addEventListener('click', () => {
        this._diagnosticsExpanded = !this._diagnosticsExpanded;
        const body    = container.querySelector('#diagnostics-accordion-body');
        const chevron = container.querySelector('#diagnostics-chevron');

        if (body && chevron) {
          if (this._diagnosticsExpanded) {
            body.style.maxHeight = '9999px';
            body.style.padding   = '20px';
            chevron.style.transform = 'rotate(180deg)';
            accordionHeader.style.borderBottom = '1px solid var(--border-color)';
            // Lazy-init charts now that the containers are visible
            setTimeout(() => this.initGraphs(container), 50);
          } else {
            body.style.maxHeight = '0px';
            body.style.padding   = '0 20px';
            chevron.style.transform = 'rotate(0deg)';
            accordionHeader.style.borderBottom = 'none';
          }
        }
      });
    }

    // ── Generate Brief button ─────────────────────────────────────────────
    const genBriefBtn = container.querySelector('#btn-generate-brief');
    if (genBriefBtn) {
      genBriefBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (this.isGeneratingBrief) return;
        this.isGeneratingBrief = true;
        this.isBriefCollapsed = false;
        this.render(container);

        try {
          const brief = await AIService.generateBoardBrief(this.state.risks, this.state.settings);
          this.briefContent = brief;
        } catch (e) {
          this.briefContent = "Failed to compile Board Brief. Please check your network or API configurations.";
        } finally {
          this.isGeneratingBrief = false;
          this.render(container);
        }
      });
    }

    // ── AI Brief collapse toggle ──────────────────────────────────────────
    const aiBriefHeader = container.querySelector('#ai-brief-header');
    if (aiBriefHeader) {
      aiBriefHeader.addEventListener('click', () => {
        this.isBriefCollapsed = !this.isBriefCollapsed;
        const body    = container.querySelector('#ai-brief-body');
        const chevron = container.querySelector('#ai-brief-chevron');
        if (body && chevron) {
          if (this.isBriefCollapsed) {
            body.style.maxHeight = '0px';
            body.style.marginTop = '0';
            chevron.style.transform = 'rotate(0deg)';
          } else {
            body.style.maxHeight = '2000px';
            body.style.marginTop = '16px';
            chevron.style.transform = 'rotate(180deg)';
          }
        }
      });
    }

    // ── Board Attention Brief collapse toggle ─────────────────────────────
    const boardBriefHeader  = container.querySelector('#board-brief-header');
    const boardBriefBody    = container.querySelector('#board-brief-body');
    const boardBriefChevron = container.querySelector('#board-brief-chevron');
    const boardBriefLbl     = container.querySelector('#brief-collapse-lbl');
    const regenBriefBtnTop  = container.querySelector('#btn-regenerate-brief-top');

    let isBriefCollapsed = true; // start collapsed by default

    if (boardBriefHeader && boardBriefBody && boardBriefChevron && boardBriefLbl) {
      boardBriefHeader.addEventListener('click', (event) => {
        if (event.target === regenBriefBtnTop) return;
        isBriefCollapsed = !isBriefCollapsed;
        if (isBriefCollapsed) {
          boardBriefBody.style.maxHeight = '0px';
          boardBriefBody.style.marginTop = '0';
          boardBriefChevron.style.transform = 'rotate(0deg)';
          boardBriefLbl.textContent = 'Expand Analysis';
        } else {
          boardBriefBody.style.maxHeight = '2000px';
          boardBriefBody.style.marginTop = '16px';
          boardBriefChevron.style.transform = 'rotate(180deg)';
          boardBriefLbl.textContent = 'Collapse Analysis';
        }
      });
    }

    if (regenBriefBtnTop && boardBriefBody) {
      regenBriefBtnTop.addEventListener('click', async (event) => {
        event.stopPropagation();
        regenBriefBtnTop.disabled = true;
        regenBriefBtnTop.textContent = 'Analyzing...';

        const contentArea = container.querySelector('#board-brief-content');
        if (contentArea) {
          contentArea.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center; min-height: 120px;">
              <div class="skeleton-loading" style="width: 95%; height: 14px; border-radius: 4px;"></div>
              <div class="skeleton-loading" style="width: 90%; height: 14px; border-radius: 4px;"></div>
              <div class="skeleton-loading" style="width: 85%; height: 14px; border-radius: 4px;"></div>
            </div>
          `;
        }

        if (isBriefCollapsed) {
          isBriefCollapsed = false;
          boardBriefBody.style.maxHeight = '2000px';
          boardBriefBody.style.marginTop = '16px';
          boardBriefChevron.style.transform = 'rotate(180deg)';
          boardBriefLbl.textContent = 'Collapse Analysis';
        }

        try {
          const freshBrief = await AIInsightService.getBoardAttentionBrief(this.state, true);
          if (contentArea) {
            contentArea.innerHTML = AIInsightService.formatMarkdown(freshBrief);
          }
        } catch (e) {
          if (contentArea) {
            contentArea.innerHTML = `<p style="color: var(--color-above-appetite);">Failed to regenerate Board Attention Brief.</p>`;
          }
        } finally {
          regenBriefBtnTop.disabled = false;
          regenBriefBtnTop.textContent = 'Regenerate AI Insights';
        }
      });
    }

    // ── Click-to-Explain Bindings ─────────────────────────────────────────
    container.querySelectorAll('.ai-explain-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = trigger.dataset.explainType;
        const id   = trigger.dataset.explainId;

        let item = null;
        if (type === 'risk') {
          item = this.state.risks.find(r => r.id === id);
        } else if (type === 'objective') {
          item = this.state.objectives.find(o => o.id === id);
        }

        if (item) {
          AIInsightService.showExplanationModal(type, item, this.state);
        }
      });
    });
  }

  bindHeatmapClearEvent(container, heatmapChartInstance) {
    const clearBtn = container.querySelector('#btn-clear-heatmap');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedHeatmapRiskIndex = null;

        const ddContainer = container.querySelector('#heatmap-drilldown-container');
        if (ddContainer) {
          ddContainer.innerHTML = this.renderHeatmapDrilldown(null);
        }

        if (heatmapChartInstance) {
          heatmapChartInstance.update();
        }
      });
    }
  }

  renderIntelligenceFeed(insights) {
    const feedBody = document.querySelector('#risk-intelligence-feed-body');
    if (!feedBody) return;

    if (!insights || insights.length === 0) {
      feedBody.innerHTML = `
        <div class="no-data-card" style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 11px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px; margin: 0 auto 8px; opacity: 0.5;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          No active intelligence alerts or forecast breaches detected.
        </div>
      `;
      return;
    }

    feedBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${insights.map(ins => {
          let severityClass = 'within'; // Advisory
          let borderLeftColor = '#00B5B5';
          let bg = 'rgba(0, 181, 181, 0.02)';
          
          if (ins.severity === 'Critical') {
            severityClass = 'above';
            borderLeftColor = 'var(--color-above-appetite, #E11D48)';
            bg = 'rgba(225, 29, 72, 0.02)';
          } else if (ins.severity === 'Warning') {
            severityClass = 'near';
            borderLeftColor = 'var(--color-near-appetite, #D97706)';
            bg = 'rgba(217, 119, 6, 0.02)';
          }

          const isAcknowledged = ins.status === 'acknowledged';
          const opacityStyle = isAcknowledged ? 'opacity: 0.65;' : '';

          return `
            <div class="insight-card" data-insight-id="${ins.id}" style="border: 1px solid var(--border-color); border-left: 4px solid ${borderLeftColor}; background: ${bg}; padding: 12px 16px; border-radius: 8px; transition: all 0.2s ease; ${opacityStyle}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="status-badge ${severityClass}" style="font-size: 10px; padding: 2px 8px;">${ins.severity}</span>
                  <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">${ins.insight_type}</span>
                  ${isAcknowledged ? `<span style="font-size: 10px; color: var(--text-muted); font-style: italic;">(Acknowledged)</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;" class="no-print">
                  <button class="btn btn-secondary btn-small btn-insight-ack" data-id="${ins.id}" style="padding: 2px 8px; font-size: 10px;" ${isAcknowledged ? 'disabled style="opacity: 0.5;"' : ''}>Acknowledge</button>
                  <button class="btn btn-secondary btn-small btn-insight-dismiss" data-id="${ins.id}" style="padding: 2px 8px; font-size: 10px; color: var(--color-above-appetite);">Dismiss</button>
                  <button class="btn btn-primary btn-small btn-insight-review" data-id="${ins.id}" data-type="${ins.insight_type}" data-risk-id="${ins.source_data?.riskId || ''}" data-filter="${ins.source_data?.filter || ''}" style="padding: 2px 8px; font-size: 10px;">Review</button>
                </div>
              </div>
              <div class="insight-text" style="font-size: 12px; line-height: 1.5; color: var(--text-primary);">
                ${ins.insight_text}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind event listeners
    feedBody.querySelectorAll('.btn-insight-ack').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        try {
          const { RiskIntelligenceService } = await import('../services/riskIntelligenceService.js');
          await RiskIntelligenceService.acknowledgeInsight(id);
          // Re-load and re-render feed
          const freshInsights = await RiskIntelligenceService.generateInsights(this.state.risks, null);
          this.renderIntelligenceFeed(freshInsights);
        } catch (err) {
          console.error("Failed to acknowledge insight:", err);
        }
      });
    });

    feedBody.querySelectorAll('.btn-insight-dismiss').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        try {
          const { RiskIntelligenceService } = await import('../services/riskIntelligenceService.js');
          await RiskIntelligenceService.dismissInsight(id);
          // Re-load and re-render feed
          const freshInsights = await RiskIntelligenceService.generateInsights(this.state.risks, null);
          this.renderIntelligenceFeed(freshInsights);
        } catch (err) {
          console.error("Failed to dismiss insight:", err);
        }
      });
    });

    feedBody.querySelectorAll('.btn-insight-review').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const riskId = btn.dataset.riskId;
        const filter = btn.dataset.filter;

        if (type === 'KRI Trajectory') {
          // 1. Expand diagnostics accordion if collapsed
          const accordionBody = document.querySelector('#diagnostics-accordion-body');
          const accordionHeader = document.querySelector('#diagnostics-accordion-header');
          const chevron = document.querySelector('#diagnostics-chevron');
          if (accordionBody && !this._diagnosticsExpanded) {
            this._diagnosticsExpanded = true;
            accordionBody.style.maxHeight = '9999px';
            accordionBody.style.padding   = '20px';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            if (accordionHeader) accordionHeader.style.borderBottom = '1px solid var(--border-color)';
            this.initGraphs(document.querySelector('#page-render-container'));
          }

          // 2. Scroll `#kri-breach-container` into view and highlight it
          const targetEl = document.querySelector('#kri-breach-container');
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.style.transition = 'outline 0.3s ease';
            targetEl.style.outline = '2px solid var(--color-indigo)';
            setTimeout(() => {
              targetEl.style.outline = 'none';
            }, 2000);
          }
        } else if (type === 'Register Staleness' && filter === 'stale') {
          // Deep-link to the register module with staleness query param
          this.navigateToPage('/risks?staleness=true', 'register');
        }
      });
    });
  }
}
