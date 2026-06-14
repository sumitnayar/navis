// AI Insight Service for NAVIS V3
// Coordinates session-based, board-ready insights, page-level interpretations,
// and click-to-explain interactions with Gemini and rule-based fallbacks.

import { AIService } from './aiService.js';
import { StorageService } from './storageService.js';
import { RiskIntelligenceContextService } from './riskIntelligenceContextService.js';

export class AIInsightService {
  // Check if Gemini is configured (client-side key or server-configured)
  static isAIConfigured(state) {
    const localKey = localStorage.getItem('navis_v3_gemini_api_key') || state?.settings?.geminiApiKey;
    return !!localKey || !!state?.serverGeminiConfigured;
  }

  // Detect a fresh session and clear session storage if needed
  static checkFreshSession() {
    if (!sessionStorage.getItem('navis_session_active')) {
      // Fresh session detected - clear previous session caches
      this.clearSessionInsights();
      sessionStorage.setItem('navis_session_active', 'true');
      return true;
    }
    return false;
  }

  static clearSessionInsights() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('navis_insight_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Get cached session insight or generate it
  static async getOrGenerateInsight(key, generatorPrompt, fallbackFunc, state) {
    const cacheKey = `navis_insight_${key}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }

    let result = '';
    const isAI = this.isAIConfigured(state);

    if (isAI) {
      try {
        const clientKey = state?.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
        result = await AIService.queryGemini(generatorPrompt, clientKey);
      } catch (e) {
        console.warn(`Gemini generation failed for ${key}, using rule-based fallback:`, e);
        result = fallbackFunc(state);
      }
    } else {
      result = fallbackFunc(state);
    }

    if (result && result.trim()) {
      sessionStorage.setItem(cacheKey, result);
    }
    return result;
  }

  // 1. BOARD ATTENTION BRIEF (Dashboard)
  static async getBoardAttentionBrief(state, forceRegenerate = false) {
    if (forceRegenerate) {
      sessionStorage.removeItem('navis_insight_board_attention_brief');
    }

    const context = await RiskIntelligenceContextService.buildContext();
    const prompt = `
      You are the Chief Risk Officer for ${state?.settings?.companyName || 'NAVIS'}.
      Status: ${state?.settings?.ipoTimeline || 'IPO Ready'}.
      Revenue: ${state?.settings?.revenueBracket || '₹280 Cr'}.

      Here is the current unified risk context:
      ${JSON.stringify(context, null, 2)}

      Write a board-ready "Board Attention Brief" in Markdown.
      It must be concise, strategic, and consulting-grade.
      Avoid generic filler. Address the listing timeline and ARR metrics.

      Structure exactly as:
      ### **Board Attention Brief**
      *   **Top 3 Risks**: (Specifically name 3 risks requiring immediate board oversight with scores and owners)
      *   **Why They Matter Now**: (Strategic relevance to IPO/growth)
      *   **Risk Movement**: (What worsening trends or KRI breaches have occurred)
      *   **Strategic Exposure**: (Objectives exposed)
      *   **Recommended Intervention**: (Direct board-level directives)
      *   **Early Warning Indicators**: (3 metrics to monitor on the watchlist)
    `;

    return this.getOrGenerateInsight(
      'board_attention_brief',
      prompt,
      (st) => this.generateFallbackBoardAttentionBrief(st, context),
      state
    );
  }

  static generateFallbackBoardAttentionBrief(state, context) {
    const risks = context.riskNodes || [];
    const aboveAppetite = risks.filter(r => r.appetiteStatus === 'Above Appetite');
    const highRisks = risks.filter(r => r.residualScore >= 12).sort((a,b) => b.residualScore - a.residualScore);
    
    const top3 = highRisks.slice(0, 3);
    const top3List = top3.length ? top3.map(r => `**${r.title}** (Score: ${r.residualScore}, Owner: ${r.owner})`).join(', ') : 'No high residual risks registered';

    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const breachedKriCount = context.computedMetrics.boardPriorityRisks.length;

    return `### **Board Attention Brief**
*   **Top 3 Risks**: ${top3List}.
*   **Why They Matter Now**: These items present significant friction to our target listing timeline (**${state?.settings?.ipoTimeline || 'Q3 FY27'}**) and gross margins, creating a potential multiple penalty during PE/VC audits.
*   **Risk Movement**: There are **${worseningCount} deteriorating risk trends** and **${context.kris.filter(k => k.status === 'BREACHED').length} breached KRIs** active.
*   **Strategic Exposure**: Objectives relating to *Revenue Milestones Expansion* and *Market Growth* are exposed to compounding dependency vectors.
*   **Recommended Intervention**: Approve the Independent Director nominations within 15 days to address SEBI alignment; enforce a minimum 24-month contract lock-in on accounts exceeding ₹50L.
*   **Early Warning Indicators**: 
    1. Regret tech attrition rate exceeding 8%.
    2. Overdue SOC 2 compliance actions exceeding 30 days.
    3. Revenue concentration percentage from top 3 accounts exceeding 35%.`;
  }

  // 2. PAGE-LEVEL INSIGHTS
  static async getPageInsight(pageId, state, forceRegenerate = false) {
    const cacheKey = `navis_insight_page_${pageId}`;
    if (forceRegenerate) {
      sessionStorage.removeItem(cacheKey);
    }

    const context = await RiskIntelligenceContextService.buildContext();
    const pageDetails = this.getPageContextDetails(pageId, state, context);
    
    const prompt = `
      You are the Board Risk Analyst for ${state?.settings?.companyName || 'NAVIS'}.
      Explain this module view for the Board.
      
      Page: ${pageDetails.name}
      What this page shows: ${pageDetails.description}
      Current Page Data:
      ${JSON.stringify(pageDetails.data, null, 2)}

      Write a professional board-ready insight card in Markdown.
      It must have exactly four bullet points:
      *   **Overview**: (Explain what the page is showing in 1 sentence)
      *   **Key Insight**: (What is the most important strategic takeaway from the current data)
      *   **Leadership Attention**: (What specifically requires C-Suite or Board attention now)
      *   **Next Steps**: (Actionable recommendation)

      Tone: Strategic, board-ready, concise. Under 150 words total.
    `;

    return this.getOrGenerateInsight(
      `page_${pageId}`,
      prompt,
      (st) => this.generateFallbackPageInsight(pageId, st, context),
      state
    );
  }

  static getPageContextDetails(pageId, state, context) {
    switch (pageId) {
      case 'objectives':
        return {
          name: 'Strategic Objectives Alignments',
          description: 'Tracks key corporate objectives and their exposure to registered risks.',
          data: state?.objectives || []
        };
      case 'scenario':
        return {
          name: 'Board Decision Room',
          description: 'Simulates strategic situations, timelines, and management response choices.',
          data: state?.scenarios || []
        };
      case 'portfolio':
        return {
          name: 'Value Portfolio Mapper',
          description: 'Visualizes risk distributions across business units and value categories.',
          data: context.computedMetrics.radarMetrics
        };
      case 'network':
        return {
          name: 'Strategic Cascade Visualizer',
          description: 'Maps the relational edges, parent-child cascades, and interdependencies of the risk network.',
          data: { edges: context.riskEdges, topInfluence: context.computedMetrics.topInfluenceRisks.slice(0, 3) }
        };
      case 'taxonomy':
        return {
          name: 'Centralized 3-tier Taxonomy',
          description: 'Enforces structured L1 Categories, L2 Subcategories, and L3 Root Causes.',
          data: { totalRisks: context.riskNodes.length, categories: [...new Set(context.riskNodes.map(r => r.l1))] }
        };
      case 'assurance':
        return {
          name: 'Three Lines of Defense Assurance',
          description: 'Evaluates risk assurance coverage across Management (1st Line), Risk Functions (2nd Line), and Internal Audit (3rd Line).',
          data: { staleReviews: context.computedMetrics.staleReviews, fragileRisks: context.computedMetrics.fragileRisks }
        };
      case 'controls':
        return {
          name: 'Controls & KRI Monitor',
          description: 'Assesses corporate controls efficacy and tracks breached Key Risk Indicators.',
          data: { controlsCount: context.controls.length, breachedKRIs: context.kris.filter(k => k.status === 'BREACHED') }
        };
      case 'actions':
        return {
          name: 'Corporate Actions Tracker',
          description: 'Tracks accountability, status, and due dates of risk mitigation actions.',
          data: { overdue: context.computedMetrics.overdueActions }
        };
      case 'culture':
        return {
          name: 'Risk Culture Scorecard',
          description: 'Assesses cultural indicators, policy compliance rates, and employee feedback metrics.',
          data: state?.cultureMetrics || {}
        };
      default:
        return { name: 'Dashboard Module', description: 'Enterprise Risk posture.', data: {} };
    }
  }

  static generateFallbackPageInsight(pageId, state, context) {
    const company = state?.settings?.companyName || 'NAVIS';
    
    switch (pageId) {
      case 'objectives':
        const objCount = state?.objectives?.length || 0;
        const atRisk = state?.objectives?.filter(o => o.status === 'At Risk').length || 0;
        return `*   **Overview**: Shows the alignment of corporate strategic objectives with active risk exposures.
*   **Key Insight**: Out of **${objCount} core objectives**, **${atRisk} are marked At Risk** due to unmitigated dependency paths.
*   **Leadership Attention**: The *₹500 Cr ARR Revenue Milestone* is highly exposed to enterprise customer churn.
*   **Next Steps**: Assign priority mitigation budgets to controls linked with the exposed revenue objectives.`;

      case 'scenario':
        return `*   **Overview**: Simulates strategic situations, timelines, and management response choices in the Board Decision Room.
*   **Key Insight**: Strategic threat models show up to **₹15 Cr** worst-case revenue exposure if no interventions are activated.
*   **Leadership Attention**: Cyber security and customer churn are the highest impact vectors requiring immediate board response.
*   **Next Steps**: Approve contingency budgets for Strong/Aggressive management responses and assign committees.`;

      case 'portfolio':
        return `*   **Overview**: Maps risk capital concentration across corporate business units and product pillars.
*   **Key Insight**: Risk capital is heavily skewed towards *Engineering & Infrastructure* and *Enterprise Sales* operations.
*   **Leadership Attention**: Customer concentration and margins are primary drivers of structural volatility.
*   **Next Steps**: Rebalance control allocation to stabilize multi-tenant architectures and diversify sales pipelines.`;

      case 'network':
        const edgeCount = context.riskEdges?.length || 0;
        const topInf = context.computedMetrics.topInfluenceRisks?.[0]?.title || 'Founder Decisional Dependency';
        return `*   **Overview**: Maps systemic risk connections and parent-child cascade routes.
*   **Key Insight**: A network of **${edgeCount} edges** reveals high structural coupling between founder delegation and sales cycles.
*   **Leadership Attention**: **${topInf}** acts as the primary systemic driver of downstream vulnerabilities.
*   **Next Steps**: Implement delegation of authority matrices to isolate and break the influence cascades.`;

      case 'taxonomy':
        return `*   **Overview**: Outlines the standard 3-tier risk taxonomy tree ensuring consistent classification.
*   **Key Insight**: System classification aligns well with regulatory standards, spanning L1/L2/L3 tiers.
*   **Leadership Attention**: Several risks lack specific L3 root cause tagging, leading to vague mitigation plans.
*   **Next Steps**: Mandate a quarterly taxonomy audit to update registry version controls.`;

      case 'assurance':
        const fragile = context.computedMetrics.fragileRisks?.length || 0;
        const stale = context.computedMetrics.staleReviews?.length || 0;
        return `*   **Overview**: Tracks compliance and controls assurance across the Three Lines of Defense.
*   **Key Insight**: There are **${fragile} fragile risks** with control weaknesses and **${stale} stale reviews** exceeding 30 days.
*   **Leadership Attention**: Stale logs indicate a decay in 1st-line review accountability.
*   **Next Steps**: Automate weekly reminders to risk owners with outstanding review schedules.`;

      case 'controls':
        const controls = context.controls || [];
        const ineffective = controls.filter(c => c.rating === 'Ineffective' || c.rating === 'Partially Effective').length;
        const breached = context.kris.filter(k => k.status === 'BREACHED').length;
        return `*   **Overview**: Monitors active control ratings alongside key risk indicator (KRI) breach metrics.
*   **Key Insight**: **${ineffective} of ${controls.length} controls** are rated ineffective, coinciding with **${breached} breached KRIs**.
*   **Leadership Attention**: Regretted tech team attrition and API response failure KRIs are operating in critical red zones.
*   **Next Steps**: Re-engineer compensation bands and configure automated API retry backups.`;

      case 'actions':
        const overdue = context.computedMetrics.overdueActions || [];
        return `*   **Overview**: Tracks ownership, status, and deadlines of mitigation tasks.
*   **Key Insight**: There are **${overdue.length} overdue mitigation actions**, slowing critical security and compliance tracks.
*   **Leadership Attention**: The SOC 2 audit readiness action is currently overdue, delaying contract closures.
*   **Next Steps**: Issue a formal directive to action owners to clear critical items within 7 business days.`;

      case 'culture':
        const metrics = state?.cultureMetrics || {};
        const trainRate = metrics.complianceTrainingRate || '82%';
        return `*   **Overview**: Measures cultural health, policy compliance, and whistle-blower activity indicators.
*   **Key Insight**: Compliance training completion stands at **${trainRate}**, lagging behind our 95% target.
*   **Leadership Attention**: Regretted engineering turnover points to culture friction and ESOP stagnation.
*   **Next Steps**: Establish a quarterly employee pulse survey and expand the ESOP allocation pool.`;

      default:
        return `*   **Overview**: Module overview.
*   **Key Insight**: Posture is stable.
*   **Leadership Attention**: Keep monitoring.
*   **Next Steps**: Review monthly.`;
    }
  }

  // 3. CLICK-TO-EXPLAIN FEATURE
  static async explainItem(type, item, state) {
    const isAI = this.isAIConfigured(state);
    
    const prompt = `
      You are the Board Risk Intelligence Coach.
      Explain this specific ${type} item for the board.
      
      Item Details:
      ${JSON.stringify(item, null, 2)}
      
      Provide a board-ready explanation in Markdown.
      Structure EXACTLY as:
      *   **Why It Matters**: (Why is this item significant for strategic alignment/IPO/operations)
      *   **Interconnections**: (What other risks, controls, or objectives is this item connected to)
      *   **Impact of Inaction**: (What could happen if ignored or unmitigated)
      *   **Governance Action**: (Concrete board-level recommendation)
      
      Keep the explanation concise, high-impact, under 120 words.
    `;

    if (isAI) {
      try {
        const clientKey = state?.settings?.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
        return await AIService.queryGemini(prompt, clientKey);
      } catch (e) {
        console.warn("Gemini explanation failed, using fallback:", e);
      }
    }
    return this.generateFallbackExplanation(type, item);
  }

  static generateFallbackExplanation(type, item) {
    const name = item.title || item.name || item.kriName || item.label || 'Selected Item';
    const owner = item.owner || 'Unassigned';
    const score = item.residualScore || item.score || 'N/A';

    return `*   **Why It Matters**: **${name}** represents a key operational dependency that directly influences corporate valuation and compliance parameters.
*   **Interconnections**: This ${type} maps to active strategic revenue targets and is managed under our primary risk register line.
*   **Impact of Inaction**: Leaving this unchecked could result in audit gaps, increased regulatory friction, and operational bottlenecks.
*   **Governance Action**: Direct **${owner}** to establish a weekly monitoring log and report back to the Audit Committee at the next session.`;
  }

  // Inject explanation modal dynamically
  static showExplanationModal(type, item, state) {
    // Prevent duplicate modals
    const existing = document.querySelector('#ai-explanation-modal');
    if (existing) existing.remove();

    const name = item.title || item.name || item.kriName || 'Item Analysis';
    const modal = document.createElement('div');
    modal.id = 'ai-explanation-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 500px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);">
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
        <div class="modal-content" style="padding: 24px;">
          <h3 style="font-family: var(--font-header); font-size: 16px; font-weight: 700; color: var(--color-indigo); margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 18px; height: 18px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
            </svg>
            AI Governance Interpretation
          </h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 16px 0;">Item: <strong>${name}</strong></p>
          
          <div id="ai-modal-body" style="font-size: 12px; line-height: 1.6; color: var(--text-primary);">
            <div style="display: flex; flex-direction: column; gap: 8px; justify-content: center; min-height: 100px;">
              <div class="skeleton-loading" style="width: 95%; height: 12px; border-radius: 4px;"></div>
              <div class="skeleton-loading" style="width: 90%; height: 12px; border-radius: 4px;"></div>
              <div class="skeleton-loading" style="width: 85%; height: 12px; border-radius: 4px;"></div>
            </div>
            <p style="font-size: 10px; color: var(--text-muted); text-align: center; margin-top: 10px;">Analyzing risk relationships...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove();
    });
    
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    // Load explanation asynchronously
    this.explainItem(type, item, state).then(explanation => {
      const body = modal.querySelector('#ai-modal-body');
      if (body) {
        body.innerHTML = `
          <div class="board-brief-markdown" style="animation: fadeIn 0.2s ease-out;">
            ${this.formatMarkdown(explanation)}
          </div>
        `;
      }
    }).catch(err => {
      const body = modal.querySelector('#ai-modal-body');
      if (body) {
        body.innerHTML = `
          <p style="color: var(--color-above-appetite);">Failed to generate AI analysis. Displaying rule-based fallback.</p>
          <div class="board-brief-markdown">
            ${this.formatMarkdown(this.generateFallbackExplanation(type, item))}
          </div>
        `;
      }
    });
  }

  // 4. BOARD NARRATIVE MODE
  static generateBoardNarrative(risks, settings) {
    const aboveAppetite = risks.filter(r => r.appetiteStatus === 'Above Appetite');
    const worsening = risks.filter(r => r.trend === 'Deteriorating');
    
    const signal = aboveAppetite.length > 2 ? 'ELEVATED' : 'MODERATE';
    const riskDesc = aboveAppetite.length ? aboveAppetite.map(r => r.title).slice(0,2).join(' and ') : 'no critical breaches';

    return `
### **EXECUTIVE BOARD NARRATIVE REPORT**
*Formulated for: ${settings.companyName || 'NAVIS'} | IPO Readiness Cadence*

*   **Executive Signal**: Corporate risk exposure is **${signal}**, requiring attention on governance and margin vectors.
*   **Risk Movement**: Deteriorating patterns registered in **${worsening.length} risks**, particularly regarding ${riskDesc}.
*   **Strategic Exposure**: Delayed compliance alignment poses a direct listing gatekeeper threat to the **${settings.ipoTimeline || 'Q3 FY27'}** listing timeline.
*   **Governance Implication**: Lack of documented succession logs could trigger multiple deflation during external audits.
*   **Recommended Action**: Establish a dedicated audit oversight taskforce and nominate independent board directors.
*   **Watchlist Indicators**: Regretted tech team attrition, overdue action completion rates, and client concentration limits.
    `;
  }

  // Helper to render page-level AI insight cards dynamically
  static renderPageInsightCard(pageId, targetEl, state, onRegenerate) {
    if (!targetEl) return;

    // Check if card already exists
    let card = targetEl.querySelector('.ai-insight-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'ai-insight-card';
      // Insert as the first child of the target element
      targetEl.insertBefore(card, targetEl.firstChild);
    }

    const isAI = this.isAIConfigured(state);
    
    // Initial loading state inside card
    card.innerHTML = `
      <div class="ai-insight-header" id="ai-insight-header-${pageId}">
        <h4 class="ai-insight-title">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px; color: var(--color-indigo);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43a9.002 9.002 0 0010.457-12.827L15.904 9.813a9.002 9.002 0 00-10.457 12.827z" />
          </svg>
          <span>AI Governance Interpretation</span>
          <span class="status-badge ${isAI ? 'within' : 'near'}" style="font-size: 8px; padding: 2px 6px; font-weight: normal; margin-left: 8px;">
            ${isAI ? 'Live Gemini AI' : 'Simulation Mode'}
          </span>
        </h4>
        <div class="ai-insight-actions">
          <button class="btn btn-secondary btn-small btn-regenerate-insight" id="btn-regen-${pageId}" style="padding: 2px 8px; font-size: 10px; z-index: 2; position: relative;">Regenerate AI Insights</button>
          <span style="font-size: 10px; color: var(--text-muted);" id="ai-insight-toggle-lbl-${pageId}">Expand Analysis</span>
          <svg id="ai-insight-chevron-${pageId}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px; transition: transform 0.2s ease;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <div class="ai-insight-body" id="ai-insight-body-${pageId}" style="max-height: 0px; border-top: none; padding-top: 0; margin-top: 0;">
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 0;">
          <div class="skeleton-loading" style="width: 95%; height: 12px; border-radius: 4px;"></div>
          <div class="skeleton-loading" style="width: 90%; height: 12px; border-radius: 4px;"></div>
          <div class="skeleton-loading" style="width: 80%; height: 12px; border-radius: 4px;"></div>
        </div>
        <p style="font-size: 10px; color: var(--text-muted); text-align: center; margin: 0;">Building governance interpretation...</p>
      </div>
    `;

    // Bind event listeners for collapse and regenerate
    let isCollapsed = true;
    const header = card.querySelector(`#ai-insight-header-${pageId}`);
    const body = card.querySelector(`#ai-insight-body-${pageId}`);
    const label = card.querySelector(`#ai-insight-toggle-lbl-${pageId}`);
    const chevron = card.querySelector(`#ai-insight-chevron-${pageId}`);
    const regenBtn = card.querySelector(`#btn-regen-${pageId}`);

    const toggleCollapse = () => {
      isCollapsed = !isCollapsed;
      if (isCollapsed) {
        body.style.maxHeight = '0px';
        body.style.borderTop = 'none';
        body.style.paddingTop = '0';
        body.style.marginTop = '0';
        chevron.style.transform = 'rotate(0deg)';
        label.textContent = 'Expand Analysis';
      } else {
        body.style.maxHeight = '1000px';
        body.style.borderTop = '1px dashed rgba(0, 181, 181, 0.15)';
        body.style.paddingTop = '12px';
        body.style.marginTop = '12px';
        chevron.style.transform = 'rotate(180deg)';
        label.textContent = 'Collapse Analysis';
      }
    };

    header.addEventListener('click', (e) => {
      if (e.target === regenBtn) return;
      toggleCollapse();
    });

    regenBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      regenBtn.disabled = true;
      regenBtn.textContent = 'Analyzing...';
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 0;">
          <div class="skeleton-loading" style="width: 95%; height: 12px; border-radius: 4px;"></div>
          <div class="skeleton-loading" style="width: 90%; height: 12px; border-radius: 4px;"></div>
          <div class="skeleton-loading" style="width: 80%; height: 12px; border-radius: 4px;"></div>
        </div>
      `;
      if (isCollapsed) toggleCollapse();

      try {
        const freshInsight = await this.getPageInsight(pageId, state, true);
        body.innerHTML = `
          <div class="board-brief-markdown">
            ${this.formatMarkdown(freshInsight)}
          </div>
        `;
        if (onRegenerate) onRegenerate(freshInsight);
      } catch (err) {
        body.innerHTML = `<p style="color: var(--color-above-appetite);">Failed to generate AI analysis. Displaying rule-based fallback.</p>`;
      } finally {
        regenBtn.disabled = false;
        regenBtn.textContent = 'Regenerate AI Insights';
      }
    });

    // Load page-level insight asynchronously (session-cached by default)
    this.getPageInsight(pageId, state).then(insight => {
      body.innerHTML = `
        <div class="board-brief-markdown">
          ${this.formatMarkdown(insight)}
        </div>
      `;
    }).catch(err => {
      body.innerHTML = `
        <p style="color: var(--color-above-appetite); font-size: 11px; margin-bottom: 8px;">Failed to connect to AI server. Displaying rule-based fallback.</p>
        <div class="board-brief-markdown">
          ${this.formatMarkdown(this.generateFallbackPageInsight(pageId, state, {}))}
        </div>
      `;
    });
  }

  // Formatting Markdown helper
  static formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    html = html.replace(new RegExp('\\*\\*(.*?)\\*\\/', 'g'), '<strong>$1</strong>'); // Fix typo in regex bold parsing
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:14px;margin-bottom:6px;">$1</h4>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:12px;margin-bottom:4px;">$1</li>');
    return html;
  }

  // Render standard Back-to-Dashboard banner for deep links
  static renderBackToDashboardBanner(pageComponent, container, filterDescription) {
    const banner = document.createElement('div');
    banner.className = 'dashboard-evidence-banner';
    banner.style.cssText = 'background: rgba(0, 181, 181, 0.05); border: 1px dashed rgba(0, 181, 181, 0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-primary); animation: fadeIn 0.3s ease-out;';
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-indigo); animation: pulse 1.5s infinite;"></span>
        <span>Viewing evidence from <strong>Board Dashboard</strong>: <em>${filterDescription}</em></span>
      </div>
      <div style="display: flex; gap: 8px;" class="no-print">
        <button class="btn btn-secondary btn-small" id="btn-clear-dashboard-filter" style="padding: 4px 10px; font-size: 11px; height: 28px; cursor: pointer;">Clear Filter</button>
        <button class="btn btn-primary btn-small" id="btn-back-to-dashboard" style="padding: 4px 10px; font-size: 11px; height: 28px; background: var(--color-indigo); border-color: var(--color-indigo); cursor: pointer;">Back to Board Dashboard</button>
      </div>
    `;

    // Insert as the first child of the main layout container or right below header
    const header = container.querySelector('.page-header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
      container.insertBefore(banner, container.firstChild);
    }

    // Bind event handlers
    const clearBtn = banner.querySelector('#btn-clear-dashboard-filter');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        window.history.pushState(null, '', window.location.pathname);
        if (pageComponent.clearFilters) {
          pageComponent.clearFilters();
        }
        pageComponent.render(container);
      });
    }

    const backBtn = banner.querySelector('#btn-back-to-dashboard');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.pushState(null, '', '/dashboard');
        pageComponent.onStateChange({ activeTab: 'dashboard' });
      });
    }
  }
}
