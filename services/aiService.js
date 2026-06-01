// AI Intelligence Service supporting both real-time simulated NLP and live Gemini API calls.

import { riskTemplates } from './riskUniverse.js';

export class AIService {
  // --- REAL GEMINI API CONNECTOR ---
  static async queryGemini(prompt, apiKey) {
    try {
      // 1. Prioritize Secure Server-Side Bridge
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        });

        if (response.ok) {
          const result = await response.json();
          return result.text;
        }

        // Handle specific server-side errors
        const err = await response.json();
        
        // If the server explicitly complains about a missing key, check if we have a local fallback key
        if (err.code === 'MISSING_SERVER_KEY') {
          if (apiKey) {
            console.log("Server environment key is missing, falling back to client-side developer key...");
            // Proceed to the direct client fetch below
          } else {
            throw new Error('GEMINI_API_KEY is not configured on the server. Please set it as an environment variable in Vercel, or set a local developer key in Platform Settings.');
          }
        } else {
          // General server-side errors (e.g. quota, bad prompt) should be thrown directly
          throw new Error(err.error || 'Server bridge failed to process Gemini request');
        }
      } catch (serverError) {
        // If it's a missing server key error we already handled, rethrow it
        if (serverError.message && serverError.message.includes('not configured on the server')) {
          throw serverError;
        }
        
        // If the server route is not found or connection failed (e.g. local dev without api server),
        // we can fallback to direct browser call if a local apiKey exists.
        if (apiKey) {
          console.warn("Secure server bridge failed/unreachable. Attempting direct browser call fallback:", serverError);
        } else {
          throw serverError;
        }
      }

      // 2. Direct Browser Fallback (if client key is provided and server route was missing/keyless)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to connect to Gemini API');
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to extract response from Gemini.";

    } catch (error) {
      console.error("Gemini API Router Error:", error);
      throw error;
    }
  }

  // --- AI RISK COPILOT (FORM SUGGESTIONS) ---
  static suggestRiskDetails(inputText) {
    const text = inputText.toLowerCase();
    
    // Core SaaS/IPO semantic matches
    if (text.includes('meta') || text.includes('api') || text.includes('platform') || text.includes('aws') || text.includes('google')) {
      const t = riskTemplates.platform_dependency;
      return {
        category: t.category,
        title: "Third-Party Platform & API Reliance",
        description: `High operational vulnerability due to critical systems dependency on external platform APIs: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('concentr') || text.includes('customer') || text.includes('revenue') || text.includes('reliance') || text.includes('account')) {
      const t = riskTemplates.customer_concentration;
      return {
        category: t.category,
        title: "Enterprise Revenue Concentration Risk",
        description: `Significant portion of corporate revenue and contract ARR tied to a narrow list of core enterprise customers: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('founder') || text.includes('dependency') || text.includes('key person') || text.includes('ceo') || text.includes('cto')) {
      const t = riskTemplates.founder_dependency;
      return {
        category: t.category,
        title: "Founder Decisional Dependency Risk",
        description: `Operational bottleneck resulting from centralization of commercial and engineering architectures in the founders: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('cyber') || text.includes('security') || text.includes('breach') || text.includes('hack') || text.includes('leak') || text.includes('database')) {
      const t = riskTemplates.cyber_security;
      return {
        category: t.category,
        title: "Cyber Security & Data Infringement Exposure",
        description: `Vulnerability of customer multitenant production schemas to cyber threats and authentication bypass: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('privacy') || text.includes('dpdpa') || text.includes('consent') || text.includes('pii') || text.includes('gdpr')) {
      const t = riskTemplates.data_privacy_dpdpa;
      return {
        category: t.category,
        title: "Digital Personal Data Privacy Non-Compliance (DPDPA)",
        description: `Potential exposure to severe statutory penalties under Indian DPDPA laws for unstructured customer PII processing: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('soc') || text.includes('certification') || text.includes('compliance') || text.includes('readiness') || text.includes('audit')) {
      const t = riskTemplates.soc2_readiness;
      return {
        category: t.category,
        title: "SaaS Enterprise Compliance Gaps (SOC 2 Type II)",
        description: `Absence of formalized operational audit evidence impeding closure of mid-market enterprise contracts: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('ipo') || text.includes('board') || text.includes('governance') || text.includes('sebi') || text.includes('prospectus')) {
      const t = riskTemplates.ipo_readiness;
      return {
        category: t.category,
        title: "SEBI Corporate Governance Gaps Blocking IPO Listing",
        description: `Delays in implementing compliance architectures, corporate board configurations, or capitalization audits: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('attrition') || text.includes('people') || text.includes('talent') || text.includes('employee') || text.includes('quit') || text.includes('salary')) {
      const t = riskTemplates.talent_attrition;
      return {
        category: t.category,
        title: "Senior Engineering Attrition & R&D Atrophy",
        description: `Loss of vital system architects and R&D engineers to highly capitalized competitors: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }
    if (text.includes('ai') || text.includes('llm') || text.includes('hallucinat') || text.includes('ethics') || text.includes('gpt')) {
      const t = riskTemplates.ai_governance;
      return {
        category: t.category,
        title: "Enterprise Generative AI Hallucination & Copyright Risk",
        description: `Exposure to intellectual property lawsuits and client liability due to unverified LLM integrations: ${inputText}`,
        causes: t.causes,
        suggestedControls: t.suggestedControls,
        suggestedKRIs: t.suggestedKRIs,
        boardImpact: t.boardImpact
      };
    }

    // Default Fallback mapping
    return {
      category: "Strategic",
      title: "Identified Operational Vulnerability",
      description: `Analyzing operational metrics for: ${inputText}`,
      causes: ["Unstructured growth processes", "Lack of documented operational standards"],
      suggestedControls: ["Establish oversight framework", "Adopt formal monitoring guidelines"],
      suggestedKRIs: ["Incident counts", "Audit check compliance rate"],
      boardImpact: "May introduce operational friction and dilute corporate valuation if left unmitigated."
    };
  }

  // --- DYNAMIC BOARD NARRATIVE GENERATOR ---
  static async generateBoardBrief(risks, settings) {
    const aboveAppetite = risks.filter(r => r.appetiteStatus === 'Above Appetite');
    const worsening = risks.filter(r => r.trend === 'Deteriorating');
    const KRIsBreached = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED'));
    const overdueActions = risks.filter(r => r.actions?.some(a => a.status !== 'Completed' && new Date(a.dueDate) < new Date()));

    const contextPrompt = `
      You are the Chief Risk Officer for ${settings.companyName || 'RiskOS SaaS'}. 
      Revenue: ${settings.revenueBracket || '₹100 Cr'}. 
      Status: ${settings.ipoTimeline || 'IPO Ready'}.
      
      Enterprise Risk Register Metrics:
      - Total Registered Risks: ${risks.length}
      - Risks ABOVE Appetite Threshold: ${aboveAppetite.length} (${aboveAppetite.map(r => r.title).join(', ')})
      - Risks WORSENING in posture: ${worsening.length} (${worsening.map(r => r.title).join(', ')})
      - Key Risk Indicators (KRIs) BREACHED: ${KRIsBreached.length}
      - Overdue Strategic Actions: ${overdueActions.length}

      Task: Write a highly strategic, professional Board Brief (Executive Summary) in Markdown.
      Include:
      1. Overall Risk Posture Verdict (under 3 sentences, clear and direct).
      2. Critical Threat Vectors (specifically details why Customer Concentration or Governance Gaps are above appetite and how they affect our IPO timeline).
      3. Missing Controls and Immediate Directives (recommend 3 bulletproof actions).
      Keep the tone formal, board-worthy, and concise. No fluff.
    `;

    let apiErrorNotice = "";
    try {
      const clientKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      return await this.queryGemini(contextPrompt, clientKey);
    } catch (e) {
      console.error("Gemini Brief Call failed, falling back to simulated intelligence:", e);
      if (e.message && !e.message.includes('not configured on the server') && !e.message.includes('Failed to fetch')) {
        apiErrorNotice = `> [!CAUTION]
> **Gemini API Call Failed:** ${e.message || 'Unknown network error'}. Falling back to Simulation Mode.
\n\n`;
      }
    }

    // High-Fidelity Local Simulation Engine
    return apiErrorNotice + `### **BOARD EXECUTIVE BRIEF: RISK POSTURE OVERVIEW**
*Generated by RiskOS AI Analyst | Confidential - For Board of Directors Only*

---

#### **1. Overall Risk Posture Verdict**
The enterprise risk posture for **${settings.companyName}** is currently **Elevated**, primarily driven by strategic dependency vectors and governance gaps that directly threaten our target listing timeline (**${settings.ipoTimeline}**). While infrastructure and cyber resilience remain stable, critical financial and strategic thresholds are operating **above appetite**, demanding immediate board intervention.

---

#### **2. Critical Threat Clusters & Appetite Breaches**
We have identified **${aboveAppetite.length} critical risks** operating outside our approved corporate risk appetite boundaries:

*   **Strategic & IPO Readiness Gaps (Score: ${aboveAppetite.find(r => r.id === 'risk-013')?.residualScore || 60}):** Our SEBI corporate governance alignment is currently stalled due to an independent director vacancy extending to **90 days** (breaching our 60-day limit). This delays our filing sequence.
*   **Top-Tier Enterprise Revenue Concentration (Score: ${aboveAppetite.find(r => r.id === 'risk-001')?.residualScore || 48}):** The top 3 client accounts represent **48% of total recurring ARR** against an appetite threshold of **35%**. This extreme concentration heavily penalizes our valuation multiple during preliminary PE/VC and banker audits.
*   **Pricing Structure Vulnerability (Score: ${aboveAppetite.find(r => r.id === 'risk-008')?.residualScore || 48}):** High support overheads and aggressive discount caps (averaging above acceptable metrics) are compressing gross margins, creating cash runway exposure.

---

#### **3. Critical Trend Indicators & KRI Breaches**
*   **Postures Worsening:** **${worsening.length} risks** have deteriorated this quarter, specifically our **Pricing Structure Stability** and **Generative AI Governance** metrics.
*   **KRI Breaches Active:** **${KRIsBreached.length} Key Risk Indicators** are in active breach, highlighted by the *Bangalore tech team regretted attrition rate* hovering at **14%** (Limit: 8%) and *checkout gateway auto-retry retry failures* at **4.8%**.

---

#### **4. Board Directives & Missing Controls**
To restore risk posture within acceptable appetite levels, the executive committee recommends immediate authorization of the following controls:
1.  **Governance Restructure:** Appoint the nominated Independent Directors within the next **15 business days** to close the SEBI audit gap.
2.  **Revenue De-risking:** Mandate a minimum **24-month contract term lock-in** with strict early exit penalties on all account expansions exceeding ₹50L.
3.  **Comp-Grid Adjustment:** Allocate 1.5% of the upcoming VC expansion round towards an **ESOP liquidity pool** to immediately stem regretted senior developer attrition.`;
  }

  // --- DIRECT BOARD QUESTIONS ASSISTANT ---
  static async answerBoardQuestion(questionId, customText, risks, settings) {
    let questionText = customText || "";
    if (questionId === 'q-1') questionText = "What are our biggest risks and above appetite items?";
    if (questionId === 'q-2') questionText = "Which risks are worsening and improving this month?";
    if (questionId === 'q-3') questionText = "What threatens our company growth and revenue objectives?";
    if (questionId === 'q-4') questionText = "Which risks are interconnected and depend on each other?";
    if (questionId === 'q-5') questionText = "Which KRIs are breached and what actions are overdue?";

    const aboveAppetite = risks.filter(r => r.appetiteStatus === 'Above Appetite');
    const worsening = risks.filter(r => r.trend === 'Deteriorating');
    const improving = risks.filter(r => r.trend === 'Improving');
    const breaches = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED'));
    const actions = risks.flatMap(r => r.actions || []).filter(a => a.status !== 'Completed');

    const prompt = `
      You are the Board Risk Assistant for ${settings.companyName}.
      Active risks in our system: ${JSON.stringify(risks.map(r => ({ title: r.title, score: r.residualScore, appetite: r.appetiteStatus, trend: r.trend, parent: r.parentRiskId })))}.
      
      The Director has asked: "${questionText}"
      
      Provide a highly professional, strategic, clear corporate response in 3-4 structured bullet points. Limit to under 250 words total.
    `;

    let apiErrorNotice = "";
    try {
      const clientKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      return await this.queryGemini(prompt, clientKey);
    } catch (e) {
      console.error("Gemini Q&A Call failed, falling back to simulated intelligence:", e);
      if (e.message && !e.message.includes('not configured on the server') && !e.message.includes('Failed to fetch')) {
        apiErrorNotice = `> [!CAUTION]
> **Gemini API Call Failed:** ${e.message || 'Unknown network error'}. 
> The system has automatically fallen back to Simulation Mode. Please verify your API Key and network configurations in [Platform Settings](/settings).
\n\n`;
      }
    }

    // Simulated Natural Language Query Analyzer
    const qLower = questionText.toLowerCase();

    // 1. Core Presets
    if (qLower.includes('biggest') || qLower.includes('above appetite') || qLower.includes('q-1')) {
      return apiErrorNotice + `### **Corporate Risk Posture: Appetite Breaches (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Based on our active register of ${risks.length} risks, the following **${aboveAppetite.length} critical items** are currently operating **Above Appetite** and require immediate strategic attention:

${aboveAppetite.map(r => `*   **${r.title} (Score: ${r.residualScore}):** Mapped in the *${r.category}* category. Owner: ${r.owner || 'Unassigned'}. ${r.description || ''}`).join('\n')}

*Executive Directive:* Immediate audit controls have been drafted to enforce account sponsorship programs and governance compliance.`;
    }

    if (qLower.includes('worsening') || qLower.includes('improving') || qLower.includes('trend') || qLower.includes('q-2')) {
      return apiErrorNotice + `### **Risk Posture Dynamics & Movement Trends (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Tracked monthly snapshots indicate active structural shifts across our operations:

*   **Top Worsening Risk (Deteriorating):** ${worsening.length > 0 ? worsening.map(r => `**${r.title}** (Score: ${r.residualScore})`).join(', ') : 'None currently deteriorating'}.
*   **Top Improving Risk (Improving):** ${improving.length > 0 ? improving.map(r => `**${r.title}** (Score: ${r.residualScore})`).join(', ') : 'None currently reporting improvements'}.
*   **Stable Posture:** Other key risks remain within stable, historical tolerances.

*Operational Directive:* Focus mitigation resources on deteriorating vectors to return scores within bounds.`;
    }

    if (qLower.includes('growth') || qLower.includes('revenue') || qLower.includes('threat') || qLower.includes('q-3')) {
      const growthRisks = risks.filter(r => (r.category === 'Financial' || r.category === 'Strategic' || r.residualScore >= 12));
      return apiErrorNotice + `### **Strategic Growth & Revenue Vulnerabilities (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Strategic objectives are actively exposed to several critical threat vectors in the register:

${growthRisks.slice(0, 3).map(r => `*   **${r.title} (Score: ${r.residualScore}):** Directly threatens strategic objectives. ${r.description}`).join('\n')}

*Growth Impact:* These operational friction points directly impact international acquisition streams and ARR growth velocity.`;
    }

    if (qLower.includes('interconnect') || qLower.includes('relation') || qLower.includes('network') || qLower.includes('q-4')) {
      const parentChild = risks.filter(r => r.parentRiskId);
      return apiErrorNotice + `### **Risk Interdependency & Cascade Network (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Enterprise risks do not operate in isolation. Our system maps several compounding threat chains:

*   **The Parent-Child Dependency Map:** 
    ${parentChild.length > 0 ? parentChild.map(r => `*   \`${r.title}\` is a child dependency of Parent Risk ID: \`${r.parentRiskId}\`.`).join('\n') : '*   No active parent-child relations registered. Add relationships in the Risk Ledger to map cascade chains.'}
*   **Compounding Cascade Effect:** Escalated operational risks cascade directly into financial and valuation metrics. Failure to implement active controls will dilute IPO multiples.`;
    }

    if (qLower.includes('kri') || qLower.includes('breach') || qLower.includes('action') || qLower.includes('overdue') || qLower.includes('q-5')) {
      const breachedKRIs = risks.flatMap(r => r.kris || []).filter(k => k.status === 'BREACHED');
      const overdueActions = actions.filter(a => new Date(a.dueDate) < new Date());
      return apiErrorNotice + `### **Operational Accountability: KRIs & Overdue Actions (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Active breaches and task slippages require immediate leadership resolution:

*   **Breached KRIs:** **${breachedKRIs.length} indicators** are currently red, including:
    ${breachedKRIs.length > 0 ? breachedKRIs.map(k => `*   *${k.name || k.title}* operating in BREACHED status (Value: ${k.value || 'N/A'}).`).join('\n') : '*   No breached KRIs registered.'}
*   **Overdue Actions:** **${overdueActions.length} strategic mitigations** are outstanding, including:
    ${overdueActions.length > 0 ? overdueActions.map(a => `*   *${a.title}* (Due: ${a.dueDate}, Owner: ${a.owner || 'Unassigned'}).`).join('\n') : '*   No overdue actions registered.'}

*Directive:* Immediate prioritization of overdue actions is required to close the security and governance gap.`;
    }

    // 2. Smart Custom Query Semantic Mapper
    let matchedRisks = [];
    let matchedCategory = "";

    if (qLower.includes('cyber') || qLower.includes('security') || qLower.includes('breach') || qLower.includes('hack') || qLower.includes('leak') || qLower.includes('database') || qLower.includes('vulnerability') || qLower.includes('firewall') || qLower.includes('encryption')) {
      matchedCategory = "Cyber Security & Data Integrity";
      matchedRisks = risks.filter(r => r.category === 'Cyber' || r.category === 'Technology' || r.title.toLowerCase().includes('cyber') || r.description.toLowerCase().includes('security'));
    } else if (qLower.includes('privacy') || qLower.includes('dpdpa') || qLower.includes('consent') || qLower.includes('pii') || qLower.includes('gdpr') || qLower.includes('compliance') || qLower.includes('legal') || qLower.includes('sebi')) {
      matchedCategory = "Privacy & Legal Compliance";
      matchedRisks = risks.filter(r => r.category === 'Privacy' || r.category === 'Compliance' || r.title.toLowerCase().includes('privacy') || r.title.toLowerCase().includes('compliance') || r.title.toLowerCase().includes('sebi'));
    } else if (qLower.includes('revenue') || qLower.includes('financial') || qLower.includes('pricing') || qLower.includes('arr') || qLower.includes('mrr') || qLower.includes('cost') || qLower.includes('valuation') || qLower.includes('discount') || qLower.includes('margin') || qLower.includes('pricing')) {
      matchedCategory = "Financial Operations & Pricing Stability";
      matchedRisks = risks.filter(r => r.category === 'Financial' || r.title.toLowerCase().includes('revenue') || r.title.toLowerCase().includes('pricing') || r.title.toLowerCase().includes('concentration'));
    } else if (qLower.includes('talent') || qLower.includes('attrition') || qLower.includes('hr') || qLower.includes('team') || qLower.includes('employee') || qLower.includes('people') || qLower.includes('engineer') || qLower.includes('staff')) {
      matchedCategory = "Talent Retention & Human Capital";
      matchedRisks = risks.filter(r => r.title.toLowerCase().includes('talent') || r.description.toLowerCase().includes('attrition') || r.title.toLowerCase().includes('people') || r.description.toLowerCase().includes('employee'));
    } else if (qLower.includes('founder') || qLower.includes('dependency') || qLower.includes('key person') || qLower.includes('ceo') || qLower.includes('cto') || qLower.includes('decision')) {
      matchedCategory = "Key Person & Founder Dependency";
      matchedRisks = risks.filter(r => r.title.toLowerCase().includes('founder') || r.description.toLowerCase().includes('founder') || r.title.toLowerCase().includes('dependency') || r.title.toLowerCase().includes('key person'));
    } else if (qLower.includes('ipo') || qLower.includes('listing') || qLower.includes('governance') || qLower.includes('board') || qLower.includes('director')) {
      matchedCategory = "SEBI Governance & Corporate Readiness";
      matchedRisks = risks.filter(r => r.title.toLowerCase().includes('ipo') || r.title.toLowerCase().includes('governance') || r.description.toLowerCase().includes('director') || r.title.toLowerCase().includes('readiness'));
    }

    if (matchedRisks.length > 0) {
      return apiErrorNotice + `### **Corporate Risk Assessment: ${matchedCategory} (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

We detected keywords related to **${matchedCategory}** in your query. Here is the active risk ledger analysis:

${matchedRisks.map(r => `*   **${r.title} (Score: ${r.residualScore} - ${r.appetiteStatus}):** ${r.description}
    *Controls Mapped:* ${r.controls && r.controls.length > 0 ? r.controls.map(c => `\`${c.name || c.title || c}\``).join(', ') : '_No active controls mapped._'}
    *Trend Indicator:* ${r.trend === 'Deteriorating' ? '⚠️ Deteriorating' : r.trend === 'Improving' ? '✅ Improving' : 'Stable'}.`).join('\n\n')}

*Executive Insight:* These profiles directly impact corporate valuations and audit readiness. Ensure all mapped controls are fully operational.`;
    }

    // 3. Smart Default Fallback (Not entirely static anymore!)
    return apiErrorNotice + `### **Board Advisory Brief (Simulated)**
> [!NOTE]
> **Simulation Mode Active:** This response is compiled locally from active risk ledger parameters because no valid Gemini API Key is configured.

Responding to custom query: *"${questionText}"*

1.  **Strategic Focus:** The executive committee is actively monitoring all registered risks, concentrating efforts on the **${aboveAppetite.length} Above Appetite** items (specifically *${aboveAppetite.map(r => r.title).slice(0,2).join(', ')}*) that impact corporate valuation.
2.  **Mitigation Velocity:** Active controls are mapped to 85% of critical operational areas. The transition to a Big 4 auditor is successfully completed.
3.  **Governance Alignment:** All critical regulatory indices under the DPDPA privacy frameworks are operational and verified.

*Note:* To get fully customized generative answers to your specific queries, configure a valid Gemini API Key in [Platform Settings](/settings).`;
  }

  // --- UPGRADED GEMINI RISK INTELLIGENCE CONTEXT ENGINE (v2.0 - EXECUTIVE DASHBOARD MODE) ---
  static async generateRiskIntelligenceProfile(context, settings) {
    const { organization, riskNodes, riskEdges, controls, actions, kris, trendSignals, computedMetrics } = context;
    const apiKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
    const now = new Date();

    // Standardize calculated metrics
    const overdueCount = computedMetrics.overdueActions ? computedMetrics.overdueActions.length : 0;
    const staleReviewsCount = computedMetrics.staleReviews ? computedMetrics.staleReviews.length : 0;
    const breachedKRIsCount = kris ? kris.filter(k => k.status === 'BREACHED').length : 0;
    const deterioratingCount = computedMetrics.deterioratingCount || 0;
    const openHighCount = computedMetrics.openHighRiskCount || 0;
    const aboveAppetiteCount = riskNodes ? riskNodes.filter(r => r.appetiteStatus === 'Above Appetite').length : 0;

    // Posture mapping
    let postureStatus = "MODERATE";
    let postureColor = "#d97706";
    let postureBg = "rgba(217, 119, 6, 0.08)";
    let postureBorder = "rgba(217, 119, 6, 0.2)";
    let postureIcon = "🟡";

    if (aboveAppetiteCount > 2 || openHighCount > 3) {
      postureStatus = "CRITICAL";
      postureColor = "#e11d48";
      postureBg = "rgba(225, 29, 72, 0.08)";
      postureBorder = "rgba(225, 29, 72, 0.2)";
      postureIcon = "🔴";
    } else if (aboveAppetiteCount > 0 || openHighCount > 0 || overdueCount > 1) {
      postureStatus = "ELEVATED";
      postureColor = "#ea580c";
      postureBg = "rgba(249, 115, 22, 0.08)";
      postureBorder = "rgba(249, 115, 22, 0.2)";
      postureIcon = "🟠";
    } else if (riskNodes && riskNodes.length > 0) {
      postureStatus = "STABLE";
      postureColor = "#059669";
      postureBg = "rgba(5, 150, 105, 0.08)";
      postureBorder = "rgba(5, 150, 105, 0.2)";
      postureIcon = "🟢";
    }

    // Top 3 Drivers mapping
    const topDrivers = computedMetrics.topInfluenceRisks.slice(0, 3).map(r => r.title);
    if (topDrivers.length < 3) {
      if (overdueCount > 0) topDrivers.push("Overdue Strategic Mitigations");
      if (breachedKRIsCount > 0) topDrivers.push("Key Risk Indicator Breaches");
      if (staleReviewsCount > 0) topDrivers.push("Stale Review Accountability");
    }
    const driversList = topDrivers.slice(0, 3).map(d => `<li style="margin-left: 14px; margin-bottom: 2px;">${d}</li>`).join('');

    // DNA Scores calculations (scaled 1-10)
    const relDensity = computedMetrics.relationshipDensity || 0;
    const dnaInfluenceVal = Math.min(10, Math.max(3, relDensity > 1.2 ? 8 : relDensity > 0.8 ? 6 : 4));
    const dnaFragilityVal = Math.min(10, Math.max(2, Math.round((computedMetrics.fragileRisks.length / Math.max(1, riskNodes.length)) * 12)));
    const dnaEntropyVal = Math.min(10, Math.max(2, Math.round(((overdueCount + breachedKRIsCount) / Math.max(1, riskNodes.length)) * 10)));
    const activeControls = controls || [];
    const dnaControlMaturityVal = activeControls.length > 0
      ? Math.min(10, Math.max(1, Math.round((activeControls.filter(c => c.rating === 'Effective').length / activeControls.length) * 10)))
      : 3;
    const dnaAdaptabilityVal = 8;
    const dnaBoardReadinessVal = Math.max(2, Math.min(10, 10 - Math.round((overdueCount + staleReviewsCount) / 2)));

    const drawMonospaceSlider = (val) => {
      return "█".repeat(val) + "░".repeat(10 - val);
    };

    const getMaturityLabel = (val) => {
      if (val >= 8) return "High";
      if (val >= 5) return "Medium-High";
      return "Moderate";
    };

    const getControlLabel = (val) => {
      if (val >= 8) return "Mature";
      if (val >= 5) return "Developing";
      return "Immature";
    };

    // Dynamic DNA slider rows
    const sliderRows = `
      <tr>
        <td style="padding: 3px 0; width: 140px; font-weight: 600; color: var(--text-secondary);">Influence Concentration</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaInfluenceVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">${dnaInfluenceVal >= 8 ? 'High' : dnaInfluenceVal >= 5 ? 'Moderate' : 'Low'}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; font-weight: 600; color: var(--text-secondary);">Fragility</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaFragilityVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">${getMaturityLabel(dnaFragilityVal)}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; font-weight: 600; color: var(--text-secondary);">Entropy</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaEntropyVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">${dnaEntropyVal >= 8 ? 'High' : dnaEntropyVal >= 5 ? 'Moderate' : 'Low'}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; font-weight: 600; color: var(--text-secondary);">Control Maturity</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaControlMaturityVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">${getControlLabel(dnaControlMaturityVal)}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; font-weight: 600; color: var(--text-secondary);">Adaptability</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaAdaptabilityVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">High</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; font-weight: 600; color: var(--text-secondary);">Board Readiness</td>
        <td style="padding: 3px 0; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #a78bfa;">${drawMonospaceSlider(dnaBoardReadinessVal)}</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 600; color: var(--text-secondary);">${dnaBoardReadinessVal >= 8 ? 'High' : dnaBoardReadinessVal >= 5 ? 'Moderate' : 'Developing'}</td>
      </tr>
    `;

    // Radar math calculations (Scaled 1-5 to a radius of 70)
    const rMat = computedMetrics.radarMetrics || { financial: 3.5, people: 3.2, customers: 4.0, technology: 3.0, compliance: 3.8, operations: 3.4 };
    const dFin = 14 * rMat.financial;
    const dPeo = 14 * rMat.people;
    const dCus = 14 * rMat.customers;
    const dTech = 14 * rMat.technology;
    const dComp = 14 * rMat.compliance;
    const dOps = 14 * rMat.operations;

    const p1 = `${(100 + dFin).toFixed(1)},100`;
    const p2 = `${(100 + dPeo * 0.5).toFixed(1)},${(100 + dPeo * 0.866).toFixed(1)}`;
    const p3 = `${(100 - dCus * 0.5).toFixed(1)},${(100 + dCus * 0.866).toFixed(1)}`;
    const p4 = `${(100 - dTech).toFixed(1)},100`;
    const p5 = `${(100 - dComp * 0.5).toFixed(1)},${(100 - dComp * 0.866).toFixed(1)}`;
    const p6 = `${(100 + dOps * 0.5).toFixed(1)},${(100 - dOps * 0.866).toFixed(1)}`;

    // Top Influence horizontal bars
    const maxScore = computedMetrics.topInfluenceRisks[0]?.influenceScore || 12;
    const influenceBarsHTML = computedMetrics.topInfluenceRisks.slice(0, 4).map((tr, idx) => {
      const widthPct = maxScore > 0 ? (tr.influenceScore / maxScore) * 100 : 0;
      return `
        <div style="margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; font-weight:600;">
            <span style="color:var(--text-secondary); font-family:var(--font-header);">${idx + 1}. ${tr.title}</span>
            <span style="color:#7c3aed; font-weight:700;">${tr.influenceScore}</span>
          </div>
          <div style="height:6px; background:var(--bg-tertiary); border-radius:3px; overflow:hidden; border: 1px solid var(--border-color);">
            <div style="height:100%; width:${widthPct}%; background:linear-gradient(90deg, #7c3aed, #4f46e5); border-radius:3px;"></div>
          </div>
        </div>
      `;
    }).join('') || `<div style="font-size:10px; color:var(--text-muted); text-align:center;">No high-influence risks mapped.</div>`;

    // Breached KRI Alert Cards
    const breachedKRIs = kris ? kris.filter(k => k.status === 'BREACHED') : [];
    const breachedCardsHTML = breachedKRIs.length > 0
      ? breachedKRIs.slice(0, 2).map(k => `
        <div style="border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.04); padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; border: 1px solid rgba(239, 68, 68, 0.12); display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:10px; color:var(--text-primary); align-items:center;">
            <span>⚠️ ${k.name}</span>
            <span style="color:#ef4444; font-size:8px; text-transform:uppercase; font-weight:800; background:rgba(239,68,68,0.1); padding:1px 4px; border-radius:4px;">BREACHED</span>
          </div>
          <div style="font-size:9px; color:var(--text-secondary); font-family:monospace;">
            Current: <strong style="color:#ef4444;">${k.current}</strong> | Threshold: <strong>${k.threshold}</strong>
          </div>
        </div>
      `).join('')
      : `
        <div style="border-left: 3px solid #059669; background: rgba(5, 150, 105, 0.04); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(5, 150, 105, 0.12);">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:10px; color:var(--text-primary); align-items:center;">
            <span>✅ Operations Standard</span>
            <span style="color:#059669; font-size:8px; text-transform:uppercase; font-weight:800; background:rgba(5,150,105,0.1); padding:1px 4px; border-radius:4px;">STABLE</span>
          </div>
          <div style="font-size:9px; margin-top:2px; color:var(--text-secondary);">
            All monitored Key Risk Indicators are operating within designated parameters.
          </div>
        </div>
      `;

    // Actions table rows
    const actionRowsHTML = actions && actions.length > 0
      ? actions.slice(0, 3).map(a => {
          let statusBadgeBg = "rgba(245, 158, 11, 0.1)";
          let statusBadgeColor = "#d97706";
          if (a.status === 'Completed') {
            statusBadgeBg = "rgba(5, 150, 105, 0.1)";
            statusBadgeColor = "#059669";
          } else if (new Date(a.dueDate) < now) {
            statusBadgeBg = "rgba(239, 68, 68, 0.1)";
            statusBadgeColor = "#ef4444";
          }
          return `
            <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
              <td style="padding: 6px 8px; font-weight: 600; color:var(--text-primary);">${a.owner}</td>
              <td style="padding: 6px 8px;">${a.title}</td>
              <td style="padding: 6px 8px; font-family: monospace; font-size: 10px;">${a.dueDate}</td>
              <td style="padding: 6px 8px;">
                <span style="padding: 1px 5px; border-radius: 10px; font-size: 8px; font-weight: 700; text-transform: uppercase; background: ${statusBadgeBg}; color: ${statusBadgeColor};">
                  ${a.status === 'Completed' ? 'Completed' : new Date(a.dueDate) < now ? 'Overdue' : a.status}
                </span>
              </td>
            </tr>
          `;
        }).join('')
      : `
        <tr>
          <td colspan="4" style="padding: 12px; text-align: center; color: var(--text-muted);">
            No active mitigation actions found.
          </td>
        </tr>
      `;

    const prompt = `
      You are the NAVIS Risk Intelligence Network Engine. Your task is to perform a deep network graph analysis and generate a highly visual, courtroom-ready Executive Risk Profile (v2.0 - Executive Dashboard Mode).
      The target is: "Scan first, read second". You must reduce text volumes by 50%, completely replace paragraphs with styled HTML cards, horizontal gauges, alert scorecards, SVG diagrams, and priority widgets.

      Here is the structured Risk Intelligence Context Object:
      ${JSON.stringify(context, null, 2)}

      Please structure your output strictly inside a single, beautifully organized HTML container.
      You can use embedded HTML tags (div, table, tr, td, svg, polygon, line, text) with inline CSS styles matching the premium off-white corporate layout.

      The HTML output MUST be strictly formatted using the following structure:

      ### **BOARD RISK INTELLIGENCE EXECUTIVE CONSOLE (v2.0)**
      *NAVIS Advanced Risk Intelligence Engine | Confidential - Strategic Dashboard*

      <div style="font-family: var(--font-body); color: var(--text-primary); max-width: 100%; display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
        
        <!-- ROW 1: RISK DNA & EXECUTIVE POSTURE (2-Column Grid) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          
          <!-- CELL 1.1: ORGANIZATIONAL RISK DNA -->
          <div style="background: linear-gradient(135deg, rgba(88, 28, 135, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%); border: 1px solid rgba(139, 92, 246, 0.25); padding: 14px; border-radius: 10px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 10px 0;">🧬 ORGANIZATIONAL RISK DNA</h4>
              <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 10px; color: var(--text-primary);">
                ${sliderRows}
              </table>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(139, 92, 246, 0.15); font-family: var(--font-body); font-size: 11px; line-height: 1.4; color: var(--text-secondary);">
              <strong>Characterization:</strong> [Provide a dynamic 1-2 sentence AI Characterization describing current scaling exposure, people dependency, and developing governance, keeping prose short]
            </div>
          </div>

          <!-- CELL 1.2: EXECUTIVE POSTURE -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">🛡️ EXECUTIVE RISK POSTURE</h4>
              <div style="margin-bottom: 12px;">
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Current Posture Status</span>
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; font-family: var(--font-header); background: ${postureBg}; color: ${postureColor}; border: 1px solid ${postureBorder};">
                  <span>${postureIcon}</span> ${postureStatus}
                </div>
              </div>
              <div>
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Top 3 Threat Drivers</span>
                <ul style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; padding-left: 0; list-style-type: square; margin: 0;">
                  ${driversList}
                </ul>
              </div>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
              <strong>Posture Verdict:</strong> ${computedMetrics.postureSummary}
            </div>
          </div>

        </div>

        <!-- ROW 2: INFLUENCE SCORE & FRAGILITY RADAR (2-Column Grid) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          
          <!-- CELL 2.1: TOP RISK INFLUENCE MAP -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">📊 TOP RISK INFLUENCE SCORECARD</h4>
              ${influenceBarsHTML}
            </div>
            <div style="font-size: 9px; color: var(--text-muted); margin-top: 8px; text-align: center;">
              *Influence Score is computed as: (child connections + related connections) * residualScore
            </div>
          </div>

          <!-- CELL 2.2: FRAGILITY RADAR -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; text-align: center;">
            <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; text-align: left;">🌐 FRAGILITY EXPOSURE RADAR</h4>
            <div style="display:flex; justify-content:center;">
              <svg width="220" height="190" viewBox="0 0 220 190" style="overflow: visible;">
                <!-- background hexagons -->
                <polygon points="170,100 135,160.6 65,160.6 30,100 65,39.4 135,39.4" fill="none" stroke="var(--border-color)" stroke-width="0.75" />
                <polygon points="146.2,100 123.1,140 76.9,140 53.8,100 76.9,60 123.1,60" fill="none" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="2" />
                <polygon points="123.1,100 111.5,120 88.5,120 76.9,100 88.5,80 111.5,80" fill="none" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="2" />
                
                <!-- axis lines -->
                <line x1="100" y1="100" x2="170" y2="100" stroke="var(--border-color)" stroke-width="0.5" />
                <line x1="100" y1="100" x2="135" y2="160.6" stroke="var(--border-color)" stroke-width="0.5" />
                <line x1="100" y1="100" x2="65" y2="160.6" stroke="var(--border-color)" stroke-width="0.5" />
                <line x1="100" y1="100" x2="30" y2="100" stroke="var(--border-color)" stroke-width="0.5" />
                <line x1="100" y1="100" x2="65" y2="39.4" stroke="var(--border-color)" stroke-width="0.5" />
                <line x1="100" y1="100" x2="135" y2="39.4" stroke="var(--border-color)" stroke-width="0.5" />

                <!-- dynamic polygon -->
                <polygon points="${p1} ${p2} ${p3} ${p4} ${p5} ${p6}" fill="rgba(124, 58, 237, 0.35)" stroke="#7c3aed" stroke-width="1.75" />

                <!-- labels -->
                <text x="175" y="103" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="start">Financial</text>
                <text x="135" y="172" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">People</text>
                <text x="65" y="172" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Customers</text>
                <text x="25" y="103" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="end">Technology</text>
                <text x="65" y="32" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Compliance</text>
                <text x="135" y="32" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Operations</text>
              </svg>
            </div>
          </div>

        </div>

        <!-- ROW 3: ENTROPY & CASCADE & BREACHES (2-Column Grid) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          
          <!-- CELL 3.1: ENTROPY SIGNALS -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">⚡ ENTROPY SIGNALS</h4>
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:12px;">
                <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Overdue Actions</span>
                  <strong style="font-family:var(--font-header); font-size:18px; color:var(--color-above-appetite);">${overdueCount}</strong>
                </div>
                <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Stale Reviews</span>
                  <strong style="font-family:var(--font-header); font-size:18px; color:var(--color-near-appetite);">${staleReviewsCount}</strong>
                </div>
                <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Breached KRIs</span>
                  <strong style="font-family:var(--font-header); font-size:18px; color:#ef4444;">${breachedKRIsCount}</strong>
                </div>
                <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Deteriorating Risks</span>
                  <strong style="font-family:var(--font-header); font-size:18px; color:#f59e0b;">${deterioratingCount}</strong>
                </div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; padding-top:8px; border-top:1px solid var(--border-color);">
              <span>Entropy Level: <strong>Moderate</strong></span>
              <span>Entropy Trend: <strong style="color:#ef4444;">↗ Increasing</strong></span>
            </div>
          </div>

          <!-- CELL 3.2: CASCADE VISUALIZATION & BREACH CARDS -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display:flex; flex-direction:column; gap:12px;">
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">⛓️ DYNAMIC RISK CASCADE</h4>
              <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                <div style="background:#3b82f6; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(59, 130, 246, 0.15);">Key Person Silo</div>
                <div style="color:#3b82f6; font-size:10px; font-weight:700; line-height:1;">↓</div>
                <div style="background:#7c3aed; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(124, 58, 237, 0.15);">Enterprise Concentration</div>
                <div style="color:#7c3aed; font-size:10px; font-weight:700; line-height:1;">↓</div>
                <div style="background:#10b981; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(16, 185, 129, 0.15);">Revenue Stability Exposure</div>
                <div style="color:#10b981; font-size:10px; font-weight:700; line-height:1;">↓</div>
                <div style="background:#e11d48; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(225, 29, 72, 0.15);">SEBI IPO Filing Block</div>
              </div>
            </div>
            <div>
              <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">⚠️ ACTIVE BREACHES</h4>
              ${breachedCardsHTML}
            </div>
          </div>

        </div>

        <!-- ROW 4: BOARD PRIORITIES (3-Column Priority Widgets) -->
        <div>
          <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">🎯 90-DAY STRATEGIC BOARD PRIORITIES</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            <!-- Priority Card 1 -->
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #e11d48;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #1</span>
              <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">De-risk Founder Silos</h4>
              <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#e11d48;">HIGH</strong> | Owner: <strong>CEO</strong></div>
              <div style="font-size:10px;">Timeline: <strong>90 Days</strong></div>
            </div>
            <!-- Priority Card 2 -->
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #ea580c;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #2</span>
              <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">Revenue De-concentration</h4>
              <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#ea580c;">HIGH</strong> | Owner: <strong>Account Mgmt</strong></div>
              <div style="font-size:10px;">Timeline: <strong>90 Days</strong></div>
            </div>
            <!-- Priority Card 3 -->
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #3b82f6;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #3</span>
              <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">SEBI Director Compliance</h4>
              <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#3b82f6;">HIGH</strong> | Owner: <strong>Board Audit</strong></div>
              <div style="font-size:10px;">Timeline: <strong>15 Days</strong></div>
            </div>
          </div>
        </div>

        <!-- ROW 5: MANAGEMENT ACTIONS (Boardroom Table) -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; overflow-x: auto;">
          <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">📋 IMMEDIATE MITIGATION ACTIONS TABLE</h4>
          <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left; font-family:var(--font-body);">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color); color:var(--text-secondary);">
                <th style="padding:6px 8px; font-weight:700;">Owner</th>
                <th style="padding:6px 8px; font-weight:700;">Action Directive</th>
                <th style="padding:6px 8px; font-weight:700;">Due Date</th>
                <th style="padding:6px 8px; font-weight:700;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionRowsHTML}
            </tbody>
          </table>
        </div>

      Please evaluate the ledger and compile this gorgeous HTML dashboard structure. Avoid any paragraphs in headings or listings, keep text brief, and ensure it renders natively in the chat block. Do NOT attempt Bayesian modeling or forecasting.
      </div>
    `;

    let apiErrorNotice = "";
    try {
      return await this.queryGemini(prompt, apiKey);
    } catch (e) {
      console.error("Gemini Profile Generation failed, falling back to simulated intelligence:", e);
      if (e.message && !e.message.includes('not configured on the server') && !e.message.includes('Failed to fetch')) {
        apiErrorNotice = `> [!CAUTION]
> **Gemini API Call Failed:** ${e.message || 'Unknown network error'}. Falling back to high-fidelity Simulation Mode.
\n\n`;
      }
    }

    // High-Fidelity Local Simulation Engine - Constructs the exact v2.0 Dashboard mathematically!
    const defaultCharacterization = `Rapidly scaling SaaS organization with strong execution capability, but elevated dependency concentration and developing governance maturity.`;

    return apiErrorNotice + `### **BOARD RISK INTELLIGENCE EXECUTIVE CONSOLE (v2.0)**
*NAVIS Advanced Risk Intelligence Engine | Confidential - Strategic Dashboard*

<div style="font-family: var(--font-body); color: var(--text-primary); max-width: 100%; display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
  
  <!-- ROW 1: RISK DNA & EXECUTIVE POSTURE (2-Column Grid) -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
    
    <!-- CELL 1.1: ORGANIZATIONAL RISK DNA -->
    <div style="background: linear-gradient(135deg, rgba(88, 28, 135, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%); border: 1px solid rgba(139, 92, 246, 0.25); padding: 14px; border-radius: 10px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 10px 0;">🧬 ORGANIZATIONAL RISK DNA</h4>
        <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 10px; color: var(--text-primary);">
          ${sliderRows}
        </table>
      </div>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(139, 92, 246, 0.15); font-family: var(--font-body); font-size: 11px; line-height: 1.4; color: var(--text-secondary);">
        <strong>Characterization:</strong> ${defaultCharacterization}
      </div>
    </div>

    <!-- CELL 1.2: EXECUTIVE POSTURE -->
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">🛡️ EXECUTIVE RISK POSTURE</h4>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Current Posture Status</span>
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; font-family: var(--font-header); background: ${postureBg}; color: ${postureColor}; border: 1px solid ${postureBorder};">
            <span>${postureIcon}</span> ${postureStatus}
          </div>
        </div>
        <div>
          <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Top 3 Threat Drivers</span>
          <ul style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; padding-left: 0; list-style-type: square; margin: 0;">
            ${driversList}
          </ul>
        </div>
      </div>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
        <strong>Posture Verdict:</strong> ${computedMetrics.postureSummary}
      </div>
    </div>

  </div>

  <!-- ROW 2: INFLUENCE SCORE & FRAGILITY RADAR (2-Column Grid) -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
    
    <!-- CELL 2.1: TOP RISK INFLUENCE MAP -->
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">📊 TOP RISK INFLUENCE SCORECARD</h4>
        ${influenceBarsHTML}
      </div>
      <div style="font-size: 9px; color: var(--text-muted); margin-top: 8px; text-align: center;">
        *Influence Score is computed as: (child connections + related connections) * residualScore
      </div>
    </div>

    <!-- CELL 2.2: FRAGILITY EXPOSURE RADAR -->
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; text-align: center;">
      <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; text-align: left;">🌐 FRAGILITY EXPOSURE RADAR</h4>
      <div style="display:flex; justify-content:center;">
        <svg width="220" height="190" viewBox="0 0 220 190" style="overflow: visible;">
          <!-- background hexagons -->
          <polygon points="170,100 135,160.6 65,160.6 30,100 65,39.4 135,39.4" fill="none" stroke="var(--border-color)" stroke-width="0.75" />
          <polygon points="146.2,100 123.1,140 76.9,140 53.8,100 76.9,60 123.1,60" fill="none" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="2" />
          <polygon points="123.1,100 111.5,120 88.5,120 76.9,100 88.5,80 111.5,80" fill="none" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="2" />
          
          <!-- axis lines -->
          <line x1="100" y1="100" x2="170" y2="100" stroke="var(--border-color)" stroke-width="0.5" />
          <line x1="100" y1="100" x2="135" y2="160.6" stroke="var(--border-color)" stroke-width="0.5" />
          <line x1="100" y1="100" x2="65" y2="160.6" stroke="var(--border-color)" stroke-width="0.5" />
          <line x1="100" y1="100" x2="30" y2="100" stroke="var(--border-color)" stroke-width="0.5" />
          <line x1="100" y1="100" x2="65" y2="39.4" stroke="var(--border-color)" stroke-width="0.5" />
          <line x1="100" y1="100" x2="135" y2="39.4" stroke="var(--border-color)" stroke-width="0.5" />

          <!-- dynamic polygon -->
          <polygon points="${p1} ${p2} ${p3} ${p4} ${p5} ${p6}" fill="rgba(124, 58, 237, 0.35)" stroke="#7c3aed" stroke-width="1.75" />

          <!-- labels -->
          <text x="175" y="103" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="start">Financial</text>
          <text x="135" y="172" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">People</text>
          <text x="65" y="172" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Customers</text>
          <text x="25" y="103" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="end">Technology</text>
          <text x="65" y="32" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Compliance</text>
          <text x="135" y="32" font-size="8" fill="var(--text-secondary)" font-family="var(--font-header)" font-weight="700" text-anchor="middle">Operations</text>
        </svg>
      </div>
    </div>

  </div>

  <!-- ROW 3: ENTROPY & CASCADE & BREACHES (2-Column Grid) -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
    
    <!-- CELL 3.1: ENTROPY SIGNALS -->
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">⚡ ENTROPY SIGNALS</h4>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:12px;">
          <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
            <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Overdue Actions</span>
            <strong style="font-family:var(--font-header); font-size:18px; color:var(--color-above-appetite);">${overdueCount}</strong>
          </div>
          <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
            <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Stale Reviews</span>
            <strong style="font-family:var(--font-header); font-size:18px; color:var(--color-near-appetite);">${staleReviewsCount}</strong>
          </div>
          <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
            <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Breached KRIs</span>
            <strong style="font-family:var(--font-header); font-size:18px; color:#ef4444;">${breachedKRIsCount}</strong>
          </div>
          <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:8px 10px; border-radius:6px; text-align:center;">
            <span style="font-size:9px; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase;">Deteriorating Risks</span>
            <strong style="font-family:var(--font-header); font-size:18px; color:#f59e0b;">${deterioratingCount}</strong>
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; padding-top:8px; border-top:1px solid var(--border-color);">
        <span>Entropy Level: <strong>Moderate</strong></span>
        <span>Entropy Trend: <strong style="color:#ef4444;">↗ Increasing</strong></span>
      </div>
    </div>

    <!-- CELL 3.2: CASCADE VISUALIZATION & BREACH CARDS -->
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; display:flex; flex-direction:column; gap:12px;">
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">⛓️ DYNAMIC RISK CASCADE</h4>
        <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
          <div style="background:#3b82f6; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(59, 130, 246, 0.15);">Key Person Silo</div>
          <div style="color:#3b82f6; font-size:10px; font-weight:700; line-height:1;">↓</div>
          <div style="background:#7c3aed; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(124, 58, 237, 0.15);">Enterprise Concentration</div>
          <div style="color:#7c3aed; font-size:10px; font-weight:700; line-height:1;">↓</div>
          <div style="background:#10b981; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(16, 185, 129, 0.15);">Revenue Stability Exposure</div>
          <div style="color:#10b981; font-size:10px; font-weight:700; line-height:1;">↓</div>
          <div style="background:#e11d48; color:white; padding:6px 10px; border-radius:6px; font-weight:700; font-size:10px; width:100%; text-align:center; box-shadow:0 2px 4px rgba(225, 29, 72, 0.15);">SEBI IPO Filing Block</div>
        </div>
      </div>
      <div>
        <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">⚠️ ACTIVE BREACHES</h4>
        ${breachedCardsHTML}
      </div>
    </div>

  </div>

  <!-- ROW 4: BOARD PRIORITIES (3-Column Priority Widgets) -->
  <div>
    <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">🎯 90-DAY STRATEGIC BOARD PRIORITIES</h4>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <!-- Priority Card 1 -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #e11d48;">
        <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #1</span>
        <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">De-risk Founder Silos</h4>
        <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#e11d48;">HIGH</strong> | Owner: <strong>CEO</strong></div>
        <div style="font-size:10px;">Timeline: <strong>90 Days</strong></div>
      </div>
      <!-- Priority Card 2 -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #ea580c;">
        <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #2</span>
        <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">Revenue De-concentration</h4>
        <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#ea580c;">HIGH</strong> | Owner: <strong>Account Mgmt</strong></div>
        <div style="font-size:10px;">Timeline: <strong>90 Days</strong></div>
      </div>
      <!-- Priority Card 3 -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; border-top: 3px solid #3b82f6;">
        <span style="font-size:9px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Priority #3</span>
        <h4 style="font-size:12px; margin: 3px 0; font-family:var(--font-header); font-weight:700; color:var(--text-primary);">SEBI Director Compliance</h4>
        <div style="font-size:10px; margin-top:2px;">Impact: <strong style="color:#3b82f6;">HIGH</strong> | Owner: <strong>Board Audit</strong></div>
        <div style="font-size:10px;">Timeline: <strong>15 Days</strong></div>
      </div>
    </div>
  </div>

  <!-- ROW 5: MANAGEMENT ACTIONS (Boardroom Table) -->
  <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: 10px; overflow-x: auto;">
    <h4 style="font-family: var(--font-header); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">📋 IMMEDIATE MITIGATION ACTIONS TABLE</h4>
    <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left; font-family:var(--font-body);">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); color:var(--text-secondary);">
          <th style="padding:6px 8px; font-weight:700;">Owner</th>
          <th style="padding:6px 8px; font-weight:700;">Action Directive</th>
          <th style="padding:6px 8px; font-weight:700;">Due Date</th>
          <th style="padding:6px 8px; font-weight:700;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${actionRowsHTML}
      </tbody>
    </table>
  </div>

</div>`;
  }
}
