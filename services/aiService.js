// AI Intelligence Service supporting both real-time simulated NLP and live Gemini API calls.

import { riskTemplates } from './riskUniverse.js';

export class AIService {
  // --- REAL GEMINI API CONNECTOR ---
  static async queryGemini(prompt, apiKey) {
    try {
      const response = await fetch(`https://generativetool.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    if (settings.geminiApiKey) {
      try {
        return await this.queryGemini(contextPrompt, settings.geminiApiKey);
      } catch (e) {
        // Fall back to simulation if API fails
      }
    }

    // High-Fidelity Local Simulation Engine
    return `### **BOARD EXECUTIVE BRIEF: RISK POSTURE OVERVIEW**
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
    if (questionId === 'q-3') questionText = "What threats our company growth and revenue objectives?";
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

    if (settings.geminiApiKey) {
      try {
        return await this.queryGemini(prompt, settings.geminiApiKey);
      } catch (e) {
        // Fallback to simulation
      }
    }

    // Simulated Natural Language Query Analyzer
    const qLower = questionText.toLowerCase();

    if (qLower.includes('biggest') || qLower.includes('above appetite') || qLower.includes('q-1')) {
      return `### **Corporate Risk Posture: Appetite Breaches**
Based on our active register of ${risks.length} risks, the following **${aboveAppetite.length} critical items** are currently operating **Above Appetite** and require immediate strategic attention:

*   **IPO Governance & Readiness Gaps (Score: 60):** Currently our highest risk item. Stalled due to an outstanding SEBI independent director vacancy, which directly threatens our listing timeline (**${settings.ipoTimeline}**).
*   **Enterprise Customer Concentration (Score: 48):** Top 3 clients represent **48% of total ARR** (Appetite Limit: 35%). Highly fragile; any account churn heavily impacts cash reserves.
*   **Pricing Structure Vulnerability (Score: 48):** Increased margin compression due to flat contract formats failing to offset rising customer support SLAs.

*Executive Directive:* Immediate audit controls have been drafted to enforce account sponsorship programs and fast-track the independent director nomination.`;
    }

    if (qLower.includes('worsening') || qLower.includes('improving') || qLower.includes('trend') || qLower.includes('q-2')) {
      return `### **Risk Posture Dynamics & Movement Trends**
Tracked monthly snapshots indicate active structural shifts across our operations:

*   **Top Worsening Risk (Deteriorating):** **Customer Concentration** and **Generative AI IP Liability**. High engineering attrition and un-scrubbed API pipelines are accelerating exposure risks in our product labs.
*   **Stable Posture:** **Founder Dependency** remains elevated but flat. Governance matrices are helping delegate commercial deal closures, but core product designs still bottleneck at the executive level.
*   **Top Improving Risk (Improving):** **Platform & API Dependency** and **DPDPA Compliance**. The deploy of multi-region AWS cloud failovers and database column PII encryption has successfully reduced operational fragility metrics.`;
    }

    if (qLower.includes('growth') || qLower.includes('revenue') || qLower.includes('threat') || qLower.includes('q-3')) {
      const growthRisks = risks.filter(r => (r.fragility?.growth >= 4 || r.fragility?.revenue >= 4));
      return `### **Strategic Growth & Revenue Vulnerabilities**
Strategic objectives are actively exposed to several critical threat vectors in the register:

*   **Revenue Growth Compression:** **Top-Tier Account Concentration (48% ARR)** represents our largest single point of revenue vulnerability. A single client departure will directly halt our cash break-even runway.
*   **Scale Friction:** **Founder Technical Dependency** limits the velocity of our engineering pipeline, directly delaying our SaaS roadmap expansion and R&D release commits.
*   **Certification Blockers:** **SOC 2 Gaps** are preventing sales teams from closing key global mid-market enterprise deals, constraining international acquisition streams.`;
    }

    if (qLower.includes('interconnect') || qLower.includes('relation') || qLower.includes('network') || qLower.includes('q-4')) {
      return `### **Risk Interdependency & Cascade Network**
Enterprise risks do not operate in isolation. Our system maps several compounding threat chains:

*   **The Governance Chain:** 
    \`Governance Gaps (IPO Block)\` $\\rightarrow$ \`Founder Technical Dependency\` $\\rightarrow$ \`Senior Engineering Attrition\`
    *Impact:* Delays in professionalizing the board lock founders into micro-management, causing regretted talent attrition and slowing down roadmap releases.
*   **The Client Risk Chain:**
    \`Customer Concentration\` $\\rightarrow$ \`Pricing Structure Vulnerability\` $\\rightarrow$ \`Revenue Atrophy\`
    *Impact:* Pricing flat-rates squeeze customer-success SLAs, compounding client churn pressure and destabilizing cash-flow predictability.`;
    }

    if (qLower.includes('kri') || qLower.includes('breach') || qLower.includes('action') || qLower.includes('overdue') || qLower.includes('q-5')) {
      const breachedKRIs = risks.flatMap(r => r.kris || []).filter(k => k.status === 'BREACHED');
      const overdueActions = actions.filter(a => new Date(a.dueDate) < new Date());
      return `### **Operational Accountability: KRIs & Overdue Actions**
Active breaches and task slippages require immediate leadership resolution:

*   **Breached KRIs:** **${breachedKRIs.length} indicators** are currently red, including:
    *   *Top 3 Accounts revenue share* operating at **48%** (Appetite: 35%).
    *   *Bangalore R&D developer attrition* at **14%** (Appetite: 8%).
    *   *Independent Director vacancy* extending to **90 Days** (Appetite: 60 Days).
*   **Pending Actions:** **${actions.length} strategic mitigations** are outstanding, with **${overdueActions.length} operating past due**, notably:
    *   *Independent Director nominations* (Due: 2026-06-30, Status: In Progress, Owner: CEO).
    *   *Regex PII Scrubber deploy on LLMs* (Due: 2026-06-12, Status: In Progress, Owner: SecOps Architect).`;
    }

    // Generic response fallback
    return `### **Board Advisory Brief**
*Responding to: "${questionText}"*

1.  **Strategic Focus:** The executive committee is actively monitoring all registered risks, concentrating efforts on the **${aboveAppetite.length} Above Appetite** items that impact corporate valuation.
2.  **Mitigation Velocity:** Active controls are mapped to 85% of critical operational areas. The transition to a Big 4 auditor is successfully completed.
3.  **Governance Alignment:** All critical regulatory indices under the DPDPA privacy frameworks are operational and verified.`;
  }
}
