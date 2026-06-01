// AI Intelligence Service supporting both real-time simulated NLP and live Gemini API calls.

import { riskTemplates } from './riskUniverse.js';

export class AIService {
  // --- REAL GEMINI API CONNECTOR ---
  static async queryGemini(prompt, apiKey) {
    try {
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
      console.error("Gemini API Error, falling back to simulated intelligence:", error);
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
    if (settings.geminiApiKey) {
      try {
        return await this.queryGemini(contextPrompt, settings.geminiApiKey);
      } catch (e) {
        console.error("Gemini Brief Call failed, falling back to simulated intelligence:", e);
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
    if (settings.geminiApiKey) {
      try {
        return await this.queryGemini(prompt, settings.geminiApiKey);
      } catch (e) {
        console.error("Gemini Q&A Call failed, falling back to simulated intelligence:", e);
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

  // --- UPGRADED GEMINI RISK INTELLIGENCE CONTEXT ENGINE (v0.1) ---
  static async generateRiskIntelligenceProfile(context, settings) {
    const { organization, riskNodes, riskEdges, controls, actions, kris, trendSignals, computedMetrics } = context;
    const apiKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';

    const prompt = `
      You are the NAVIS Risk Intelligence Network Engine. Your job is to perform a deep network graph analysis of the organization's risk posture.
      We have constructed a structured Risk Intelligence Context Object containing details of our company and its risks, controls, actions, KRIs, trends, and calculated metrics.

      Here is the structured Risk Intelligence Context:
      ${JSON.stringify(context, null, 2)}

      Please perform a comprehensive, board-ready, boardroom-grade Network Risk Profile analysis.
      The tone must be professional, authoritative, analytical, and highly structured (courtroom-ready). Avoid generic flat summaries; you are analyzing relationships, influence paths, cascade risks, control weaknesses, and posture trends.

      Output format MUST be strictly in Markdown using the following structure:

      ### **BOARD RISK INTELLIGENCE CONTEXT PROFILE (v0.1)**
      *NAVIS Advanced Risk Intelligence Engine | Confidential - Strategic Briefing*

      ---

      #### **1. EXECUTIVE INSIGHT & ORG POSTURE**
      - **One-Line Risk Posture:** [Include the computed postureSummary here exactly: "${computedMetrics.postureSummary}"]
      - **Strategic Verdict:** [A brief 2-3 sentence strategic verdict on how our risk posture aligns with our business trajectory, IPO timeline, and goals]

      #### **2. RISK INFLUENCE ANALYSIS (NETWORK SCORECARD)**
      Analyze the interdependencies and network connections. Use "Influence Score" instead of "Gravity" internally and in descriptions.
      - **Top Influence Nodes:** [Identify risks with the highest computed Influence Score and explain why they are critical connectors in the risk network]
      - **Cascade Exposure:** [Discuss how risks connect (parent-child, related) and where a failure could trigger a cascading failure across other parts of the organization]
      - **Network Density:** [Analyze the relationship density: ${computedMetrics.relationshipDensity} edges per node. What does this mean for organizational complexity?]

      #### **3. STRUCTURAL FRAGILITY & CONTROL ADEQUACY**
      Analyze structural vulnerabilities. Include overdue actions in fragility calculations.
      - **Fragile Nodes:** [List the fragile risks identified by computedMetrics.fragileRisks (impact >= 4 with weak controls or overdue actions) and detail the gaps]
      - **Control Gaps:** [Assess the presence of partially effective or ineffective controls. Specifically note where high-impact risks lack effective controls]
      - **Overdue Strategic Mitigations:** [Highlight the ${computedMetrics.overdueActions.length} overdue actions. List them with their owners and due dates, explaining why they compromise our defense]

      #### **4. ENTROPY SIGNALS & REVIEW ACCOUNTABILITY**
      Analyze velocity, trends, and review gaps. Include stale reviews in entropy.
      - **Posture Volatility:** [Identify risks with worsening trends or high velocity of change]
      - **Stale Reviews:** [Highlight the ${computedMetrics.staleReviews.length} risks with stale reviews (no updates in >30 days). List them and explain how review lapses create blind spots]
      - **KRI Breaches:** [Detail any breached KRIs, their current status, and threshold limits]

      #### **5. 90-DAY BOARD PRIORITIES & MANAGEMENT ACTION PATHWAY**
      Provide direct, actionable, bulletproof recommendations. Do NOT attempt Bayesian analysis in v0.1.
      - **Next 90 Days Priorities:** [What are the top 3 priorities the Board must vote on or monitor to safeguard the IPO timeline or revenue target?]
      - **Recommended 90-Day Actions:** [Provide 3 concrete, owner-assigned, highly specific management actions to address the fragile nodes, stale controls, and overdue items]
    `;

    let apiErrorNotice = "";
    if (apiKey) {
      try {
        return await this.queryGemini(prompt, apiKey);
      } catch (e) {
        console.error("Gemini Profile Generation failed, falling back to simulated intelligence:", e);
        apiErrorNotice = `> [!CAUTION]
> **Gemini API Call Failed:** ${e.message || 'Unknown network error'}. Falling back to high-fidelity Simulation Mode.
\n\n`;
      }
    }

    // High-Fidelity Local Simulation Engine - Uses ACTUAL computed metrics!
    const topRisksList = computedMetrics.topInfluenceRisks.slice(0, 3).map(tr => {
      return `*   **${tr.title} (Influence Score: ${tr.influenceScore}, Residual: ${tr.residualScore}):** Critical nodal connector.`;
    }).join('\n');

    const fragileRisksList = computedMetrics.fragileRisks.length > 0
      ? computedMetrics.fragileRisks.map(fr => `*   **${fr.title}:** Flagged due to High Impact residual metrics and control or action gaps.`).join('\n')
      : "*   *No fragile nodes detected in active register metrics.*";

    const overdueList = computedMetrics.overdueActions.length > 0
      ? computedMetrics.overdueActions.map(a => `*   **${a.title}** (Owner: *${a.owner}*, Due: *${a.dueDate}*) - Linked to *${a.riskTitle}*`).join('\n')
      : "*   *No overdue actions registered.*";

    const staleReviewsList = computedMetrics.staleReviews.length > 0
      ? computedMetrics.staleReviews.map(sr => `*   **${sr.title}** (Last Updated: *${sr.lastReviewed}*) - Exceeds 30-day review threshold.`).join('\n')
      : "*   *No stale reviews detected (all nodes reviewed within 30 days).*";

    const breachedKRIsList = kris.filter(k => k.status === 'BREACHED').map(k => {
      return `*   **${k.name}** (Current: *${k.current}*, Threshold: *${k.threshold}*) - Mapped to *${k.riskTitle}*`;
    }).join('\n') || "*   *No active KRI breaches detected in active operations.*";

    return apiErrorNotice + `### **BOARD RISK INTELLIGENCE CONTEXT PROFILE (v0.1)**
*NAVIS Advanced Risk Intelligence Engine | Confidential - Strategic Briefing*

---

#### **1. EXECUTIVE INSIGHT & ORG POSTURE**
- **One-Line Risk Posture:** ${computedMetrics.postureSummary}
- **Strategic Verdict:** The operational profile for **${settings.companyName || 'the organization'}** presents structural vulnerabilities that intersect directly with the target IPO sequence (**${settings.ipoTimeline || 'Q3 FY27'}**). While baseline risk controls remain active, the network of interconnected dependencies creates critical path friction that could compress valuation multiples if left unmitigated.

#### **2. RISK INFLUENCE ANALYSIS (NETWORK SCORECARD)**
- **Top Influence Nodes:** 
${topRisksList || '*   No high-influence connector nodes detected.*'}
- **Cascade Exposure:** The high degree of structural coupling between strategic and operational nodes introduces feedback cascades. Specifically, tech person dependencies cascade directly into product delivery delays, compromising enterprise customer satisfaction and compounding revenue concentration exposures.
- **Network Density:** We detect a relationship density of **${computedMetrics.relationshipDensity.toFixed(2)} edges per node**. This indicates a moderately coupled risk topology where risk events in single nodes are likely to diffuse across adjacent layers.

#### **3. STRUCTURAL FRAGILITY & CONTROL ADEQUACY**
- **Fragile Nodes:** 
${fragileRisksList}
- **Control Gaps:** Significant control gaps remain active in high-residual risk zones. Existing "Succession Mapping" and "Commercial Authorization" programs are rated Partially Effective or Ineffective, failing to suppress the underlying vulnerabilities.
- **Overdue Strategic Mitigations:**
${overdueList}

#### **4. ENTROPY SIGNALS & REVIEW ACCOUNTABILITY**
- **Posture Volatility:** Volatility is elevated in technical and financial risk categories. Key Person dependency metrics show high sensitivity, driven by founder centrality.
- **Stale Reviews:**
${staleReviewsList}
- **KRI Breaches:**
${breachedKRIsList}

#### **5. 90-DAY BOARD PRIORITIES & MANAGEMENT ACTION PATHWAY**
- **Next 90 Days Priorities:**
  1. **Governance Compliance:** Resolution of SEBI independent director board seat vacancies to unblock the IPO prospectus sequence.
  2. **Technical De-risking:** Onboarding engineering leadership to systematically decouple daily operations from founders.
  3. **Revenue Protection:** Executing contract expansions and multi-year lock-ins to mitigate enterprise concentration risks.
- **Recommended 90-Day Actions:**
  1. **Action 1 (CPO/CRO):** Complete recruitment for the VP of Engineering by Q3 to take over architecture oversight.
  2. **Action 2 (CFO/General Counsel):** Nominate and appoint two new Independent Directors to the Board Audit Committee.
  3. **Action 3 (VP Customer Success):** Restructure high-priority enterprise contract terms to include 24-month minimum lock-ins during renewals.`;
  }
}

