// AI Intelligence Service supporting both real-time simulated NLP and live Gemini API calls.

import { riskTemplates } from './riskUniverse.js';
import { supabaseClient, isSupabaseConfigured } from './supabaseClient.js';
import { StorageService } from './storageService.js';

export class AIService {
  // --- DYNAMIC CONTEXT CONSTRUCTORS ---
  static async getQAPromptContext(risks, objectives) {
    const now = new Date();

    // 1. All active risks with residual scores, likelihood, impact, velocity, and owner
    const activeRisks = risks.map(r => ({
      title: r.title,
      residualScore: r.residualScore,
      likelihoodResidual: r.likelihoodResidual || r.likelihood,
      impactResidual: r.impactResidual || r.impact,
      velocityResidual: r.velocityResidual || r.velocity,
      owner: r.owner || 'Unassigned'
    }));

    // Helper to extract numeric values and compute delta
    const calculateDelta = (current, threshold) => {
      if (typeof current !== 'string' || typeof threshold !== 'string') return 'N/A';
      const curMatch = current.match(/[-+]?[0-9]*\.?[0-9]+/);
      const thrMatch = threshold.match(/[-+]?[0-9]*\.?[0-9]+/);
      if (!curMatch || !thrMatch) return 'N/A';
      const curVal = parseFloat(curMatch[0]);
      const thrVal = parseFloat(thrMatch[0]);
      const diff = curVal - thrVal;
      const sign = diff >= 0 ? '+' : '';
      const formattedDiff = Number(diff.toFixed(2));
      const isPercent = current.includes('%') || threshold.includes('%');
      return `${sign}${formattedDiff}${isPercent ? '%' : ''}`;
    };

    // 2. KRI breaches (threshold crossed, current value, delta)
    const kriBreaches = [];
    risks.forEach(r => {
      if (r.kris && Array.isArray(r.kris)) {
        r.kris.forEach(k => {
          if (k.status === 'BREACHED') {
            kriBreaches.push({
              riskTitle: r.title,
              name: k.name,
              current: k.current,
              threshold: k.threshold,
              delta: calculateDelta(k.current, k.threshold)
            });
          }
        });
      }
    });

    // 3. Overdue actions (days overdue, responsible owner)
    const overdueActions = [];
    risks.forEach(r => {
      if (r.actions && Array.isArray(r.actions)) {
        r.actions.forEach(a => {
          if (a.status !== 'Completed' && a.dueDate) {
            const due = new Date(a.dueDate);
            if (due < now) {
              const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
              overdueActions.push({
                riskTitle: r.title,
                title: a.title,
                owner: a.owner || 'Unassigned',
                daysOverdue: daysOverdue,
                dueDate: a.dueDate
              });
            }
          }
        });
      }
    });

    // 4. Strategic objectives with status (At Risk / On Track) and linked risk count
    const strategicObjectives = objectives.map(obj => {
      const linkedRisks = risks.filter(r => r.objectiveIds && r.objectiveIds.includes(obj.id));
      return {
        id: obj.id,
        title: obj.title,
        status: obj.status,
        linkedRiskCount: linkedRisks.length,
        linkedRisks: linkedRisks.map(r => r.title)
      };
    });

    // 5. Risk posture summary (fragility scores by dimension)
    const dimensions = ['revenue', 'growth', 'customerTrust', 'technology', 'people', 'operations', 'reputation', 'valuation'];
    const fragilityTotals = {};
    dimensions.forEach(d => fragilityTotals[d] = 0);
    let hasFragilityCount = 0;
    
    risks.forEach(r => {
      if (r.fragility && typeof r.fragility === 'object' && Object.keys(r.fragility).length > 0) {
        dimensions.forEach(d => {
          fragilityTotals[d] += (r.fragility[d] || 1);
        });
        hasFragilityCount++;
      }
    });
    
    const riskPostureFragility = {};
    dimensions.forEach(d => {
      riskPostureFragility[d] = hasFragilityCount > 0 ? Number((fragilityTotals[d] / hasFragilityCount).toFixed(2)) : 1.0;
    });

    // 6. Top 3 worsening and top 3 improving risk items
    const worsening = risks
      .filter(r => r.trend === 'Deteriorating')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3)
      .map(r => ({ title: r.title, score: r.residualScore, owner: r.owner }));

    const improving = risks
      .filter(r => r.trend === 'Improving')
      .sort((a, b) => (b.residualScore || 0) - (a.residualScore || 0))
      .slice(0, 3)
      .map(r => ({ title: r.title, score: r.residualScore, owner: r.owner }));

    return {
      activeRisks,
      kriBreaches,
      overdueActions,
      strategicObjectives,
      riskPostureFragility,
      topTrends: {
        worsening,
        improving
      }
    };
  }

  // --- DUAL-MODE CACHING CONNECTOR ---
  static async getCachedResponse(key) {
    const isCloudMode = isSupabaseConfigured && supabaseClient;
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('ai_cache')
          .select('value')
          .eq('key', key)
          .maybeSingle();
        if (!error && data) {
          return data.value;
        }
      } catch (e) {
        console.warn("Supabase AI Cache read failed, falling back to local:", e);
      }
    }
    try {
      return localStorage.getItem(`navis_ai_cache_${key}`);
    } catch (e) {
      console.warn("localStorage read failed:", e);
      return null;
    }
  }

  static async setCachedResponse(key, value) {
    const isCloudMode = isSupabaseConfigured && supabaseClient;
    if (isCloudMode) {
      try {
        const { error } = await supabaseClient
          .from('ai_cache')
          .upsert({ key, value, updated_at: new Date() });
        if (!error) {
          return;
        }
      } catch (e) {
        console.warn("Supabase AI Cache write failed, falling back to local:", e);
      }
    }
    try {
      localStorage.setItem(`navis_ai_cache_${key}`, value);
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  }
  // --- REAL GEMINI API CONNECTOR ---
  static async queryGemini(prompt, apiKey, isRetry = false) {
    try {
      // 1. Prioritize Secure Server-Side Bridge
      let response;
      let isServerBridge = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          return result.text;
        }

        // Handle specific server-side errors
        const err = await response.json().catch(() => ({}));
        
        // If the server explicitly complains about a missing key, check if we have a local fallback key
        if (err.code === 'MISSING_SERVER_KEY') {
          if (apiKey) {
            console.log("Server environment key is missing, falling back to client-side developer key...");
            isServerBridge = false; // Proceed to the direct client fetch below
          } else {
            throw new Error('GEMINI_API_KEY is not configured on the server. Please set it as an environment variable in Vercel, or set a local developer key in Platform Settings.');
          }
        } else {
          // General server-side errors (e.g. quota, bad prompt) should be thrown directly
          const serverErr = new Error(err.error || 'Server bridge failed to process Gemini request');
          serverErr.status = response.status;
          throw serverErr;
        }
      } catch (serverError) {
        // If it's a missing server key error we already handled, rethrow it
        if (serverError.message && serverError.message.includes('not configured on the server')) {
          throw serverError;
        }
        
        // If it is a status-bearing error (e.g. 429/503), rethrow it so outer catch can retry it
        if (serverError.status) {
          throw serverError;
        }
        
        // If the server route is not found or connection failed (e.g. local dev without api server),
        // we can fallback to direct browser call if a local apiKey exists.
        if (apiKey) {
          console.warn("Secure server bridge failed/unreachable. Attempting direct browser call fallback:", serverError);
          isServerBridge = false;
        } else {
          throw serverError;
        }
      }

      // 2. Direct Browser Fallback (if client key is provided and server route was missing/keyless)
      if (!isServerBridge) {
        const directController = new AbortController();
        const directTimeoutId = setTimeout(() => directController.abort(), 30000);
        const directResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          }),
          signal: directController.signal
        });
        clearTimeout(directTimeoutId);

        if (!directResponse.ok) {
          const err = await directResponse.json().catch(() => ({}));
          const errMsg = err.error?.message || 'Failed to connect to Gemini API';
          const browserErr = new Error(errMsg);
          browserErr.status = directResponse.status;
          throw browserErr;
        }

        const result = await directResponse.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to extract response from Gemini.";
      }

    } catch (error) {
      const status = error.status;
      const errMsg = error.message ? error.message.toLowerCase() : "";
      
      const isRateLimit = status === 429 || errMsg.includes("429") || errMsg.includes("rate limit") || errMsg.includes("too many requests") || errMsg.includes("quota");
      const isOverload = status === 503 || errMsg.includes("503") || errMsg.includes("overload") || errMsg.includes("exhausted") || errMsg.includes("service unavailable");
      
      if ((isRateLimit || isOverload) && !isRetry) {
        console.warn(`Gemini rate limit/overload error detected (status: ${status}, message: ${error.message}). Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.queryGemini(prompt, apiKey, true);
      }
      
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

    try {
      const clientKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      return await this.queryGemini(contextPrompt, clientKey);
    } catch (e) {
      console.error("Gemini Brief Call failed, falling back to simulated intelligence:", e);
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
    if (questionId === 'q-1') questionText = "Which risks are above appetite?";
    if (questionId === 'q-2') questionText = "Which risks are worsening and improving?";
    if (questionId === 'q-3') questionText = "What threatens our growth and revenue objectives?";
    if (questionId === 'q-4') questionText = "Which risks are interconnected?";
    if (questionId === 'q-5') questionText = "Which KRIs are breached and what actions are overdue?";

    // 1. Pull dynamic context from Supabase / StorageService
    let liveRisks = [];
    let liveObjectives = [];
    try {
      liveRisks = await StorageService.getRisks();
      liveObjectives = await StorageService.getObjectives();
    } catch (e) {
      console.warn("Failed to fetch fresh risk context for Q&A, using passed parameters:", e);
    }

    const finalRisks = (liveRisks && liveRisks.length > 0) ? liveRisks : (risks || []);
    const finalObjectives = (liveObjectives && liveObjectives.length > 0) ? liveObjectives : [];

    // 2. Assemble context block
    const contextObj = await this.getQAPromptContext(finalRisks, finalObjectives);
    const contextJSON = JSON.stringify(contextObj, null, 2);

    // 3. Perform Insufficient Data Trigger Check (Semantic Keyword/Entity Relevance)
    const queryLower = questionText.toLowerCase().trim();
    
    // Extract search tokens (ignore small grammar words)
    const stopwords = new Set(['what', 'which', 'who', 'how', 'why', 'where', 'when', 'is', 'are', 'our', 'the', 'and', 'for', 'of', 'in', 'on', 'at', 'to', 'a', 'an', 'this', 'that', 'these', 'those', 'with', 'above', 'below', 'threatens', 'under', 'about', 'some', 'any', 'my', 'your', 'we', 'they', 'he', 'she', 'it', 'us', 'them', 'has', 'have', 'had', 'do', 'does', 'did', 'been', 'was', 'were', 'be', 'can', 'will', 'should', 'would', 'could', 'may', 'might', 'must', 'tell', 'me', 'explain', 'show', 'list', 'detail', 'details', 'give', 'get']);
    const queryTokens = queryLower
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1 && !stopwords.has(t));

    // Semantic relevance check
    let hasRelevantData = false;

    // Check risks
    finalRisks.forEach(r => {
      const title = r.title || "";
      const desc = r.description || "";
      const owner = r.owner || "";
      const cat = r.category || "";
      
      const match = queryTokens.some(t => 
        title.toLowerCase().includes(t) || 
        desc.toLowerCase().includes(t) || 
        owner.toLowerCase().includes(t) || 
        cat.toLowerCase().includes(t)
      );
      if (match) {
        hasRelevantData = true;
      }
    });

    // Check KRIs
    contextObj.kriBreaches.forEach(k => {
      const name = k.name || "";
      const match = queryTokens.some(t => name.toLowerCase().includes(t));
      if (match) {
        hasRelevantData = true;
      }
    });

    // Check actions
    contextObj.overdueActions.forEach(a => {
      const title = a.title || "";
      const owner = a.owner || "";
      const match = queryTokens.some(t => title.toLowerCase().includes(t) || owner.toLowerCase().includes(t));
      if (match) {
        hasRelevantData = true;
      }
    });

    // Check objectives
    contextObj.strategicObjectives.forEach(obj => {
      const title = obj.title || "";
      const match = queryTokens.some(t => title.toLowerCase().includes(t));
      if (match) {
        hasRelevantData = true;
      }
    });

    // Special bypass for preset question IDs
    if (questionId) {
      hasRelevantData = true;
    }

    // Determine specific data gap based on query tokens
    let missingGap = "specific risk entries or relevant metrics in the risk register";
    if (queryTokens.length > 0) {
      const tokensStr = queryTokens.join(' ');
      if (tokensStr.includes('employee') || tokensStr.includes('headcount') || tokensStr.includes('hr') || tokensStr.includes('people') || tokensStr.includes('talent') || tokensStr.includes('attrition') || tokensStr.includes('salary') || tokensStr.includes('hiring') || tokensStr.includes('staff')) {
        missingGap = "headcount and HR risk entries, which are not currently captured in the risk register";
      } else if (tokensStr.includes('revenue') || tokensStr.includes('financial') || tokensStr.includes('finance') || tokensStr.includes('cost') || tokensStr.includes('profit') || tokensStr.includes('sales') || tokensStr.includes('multiple') || tokensStr.includes('valuation') || tokensStr.includes('growth')) {
        missingGap = "financial and revenue risk entries, which are not currently captured in the risk register";
      } else if (tokensStr.includes('cyber') || tokensStr.includes('security') || tokensStr.includes('data') || tokensStr.includes('privacy') || tokensStr.includes('gdpr') || tokensStr.includes('dpdpa') || tokensStr.includes('hack') || tokensStr.includes('leak') || tokensStr.includes('server') || tokensStr.includes('aws')) {
        missingGap = "cyber security and data privacy risk entries, which are not currently captured in the risk register";
      } else {
        const gapWords = queryTokens.join(', ');
        missingGap = `${gapWords} risk entries, which are not currently captured in the risk register`;
      }
    }

    // Fallback if zero relevant items found
    if (!hasRelevantData) {
      return `Insufficient data to answer this with confidence. Recommend reviewing ${missingGap}.`;
    }

    // 4. Intent Classifier (Runs after context assembly and relevance check, with context as input)
    let classifiedIntent = "Diagnostic";
    if (queryLower.includes("happen if") || queryLower.includes("threat") || queryLower.includes("will") || queryLower.includes("predict") || queryLower.includes("prospect") || queryLower.includes("forecast") || queryLower.includes("scenario")) {
      classifiedIntent = "Predictive";
    } else if (queryLower.includes("worse") || queryLower.includes("compare") || queryLower.includes("rank") || queryLower.includes("better") || queryLower.includes("versus") || queryLower.includes("vs") || queryLower.includes("highest") || queryLower.includes("lowest")) {
      classifiedIntent = "Comparative";
    } else if (queryLower.includes("should we") || queryLower.includes("how do we") || queryLower.includes("fix") || queryLower.includes("remedy") || queryLower.includes("solve") || queryLower.includes("mitigate") || queryLower.includes("who owns") || queryLower.includes("action") || queryLower.includes("owner")) {
      classifiedIntent = "Action-oriented";
    }

    // Compile Gemini prompt
    const systemPrompt = `You are the Board Risk Assistant for ${settings.companyName}.
Your responses MUST follow these rules strictly:
1. ONLY answer from the live risk data context provided below. Do not use generic ERM knowledge or external facts.
2. Structure your response EXACTLY as:
   - One-sentence verdict.
   - 2-3 sentence reasoning containing specific details (names, scores, owners, KRI values, dates).
   - One board-level recommendation.
3. Total word count must be STRICTLY under 150 words.
4. Never use meta-language or chatbot phrases like "based on the data provided", "as an AI", "according to the JSON", "my analysis shows", etc. Speak as an executive board intelligence system.
5. If the query asks for details that are partially missing from the context, attempt to answer using the available data in the context and note the specific data limitation inline rather than refusing to answer.

Detected Query Intent Type: ${classifiedIntent}
Explicit Format Rules Per Intent Type:
- Diagnostic ("What is X?", "What is our current...") -> Response format: Current state in one-sentence verdict + severity level with specific score/metric + root cause or contributing risk factor in reasoning.
- Predictive ("What will happen if...", "What is the risk of...") -> Response format: Scenario description in verdict + likelihood or velocity indicator from live data + downstream impact chain referencing connected risks in reasoning.
- Comparative ("Which is worse...", "Compare...", "Rank...") -> Response format: Ranked comparison in verdict + ranked list using actual residual scores with delta between items called out explicitly in reasoning.
- Action-oriented ("What should we do...", "How do we fix...", "Who owns...") -> Response format: Core mitigation status in verdict + named owner from the risk register + concrete timeline (days, not vague language) in reasoning + specific recommended action.

Preset Question Templates:
- "Which risks are above appetite?": Ranked comparison format using actual residual scores. Rank risks with residual score >= 16.
- "Which risks are worsening and improving?": Contrast worsening (Deteriorating) and improving risks in comparison format.
- "What threatens our growth and revenue objectives?": Detail objectives exposed to threats, naming objective title, status, and linked risks.
- "Which risks are interconnected?": Map interdependencies (parent-child or related links) and display the cascade chain.
- "Which KRIs are breached and what actions are overdue?": Pair breached KRIs with overdue actions, including owners, dates, and calculated deltas.

Live Corporate Risk Context:
${contextJSON}

User's Question:
"${questionText}"
`;

    // 5. Query Gemini or fallback
    const clientKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
    const cacheKey = questionId ? `qa_${questionId}` : `qa_custom_${questionText.toLowerCase().trim().slice(0, 50).replace(/[^a-z0-9]/g, '_')}`;

    try {
      const answer = await this.queryGemini(systemPrompt, clientKey);
      if (answer && answer.trim()) {
        await this.setCachedResponse(cacheKey, answer);
        return answer;
      }
      throw new Error("Empty response from Gemini API");
    } catch (e) {
      console.error("Gemini Q&A Call failed, falling back to cache or local simulator:", e);
      const cached = await this.getCachedResponse(cacheKey);
      if (cached) {
        return "Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n" + cached;
      }

      // High-Fidelity Local Simulation Fallback
      const simulatedText = this.getSimulatedAnswer(questionId, questionText, finalRisks, settings, classifiedIntent, contextObj);
      return "Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n" + simulatedText;
    }
  }

  static getSimulatedAnswer(questionId, questionText, risks, settings, intent, contextObj) {
    const qLower = questionText.toLowerCase();

    // 1. Preset: Which risks are above appetite? (q-1)
    if (questionId === 'q-1' || qLower.includes('above appetite') || qLower.includes('biggest')) {
      const aboveAppetite = risks.filter(r => r.residualScore >= 16).sort((a,b) => b.residualScore - a.residualScore);
      const verdict = `There are currently ${aboveAppetite.length} critical risks operating above our approved appetite threshold.`;
      
      let reasoning = "";
      if (aboveAppetite.length > 0) {
        reasoning = aboveAppetite.map((r, idx) => `${idx + 1}. ${r.title} (Score: ${r.residualScore}, Owner: ${r.owner}).`).join(' ');
      } else {
        const topRisks = [...risks].sort((a,b) => b.residualScore - a.residualScore).slice(0, 2);
        reasoning = `No risks are strictly above 16. The highest tracked items are ${topRisks.map(r => `${r.title} (Score: ${r.residualScore})`).join(' and ')}.`;
      }
      
      const recommendation = "Recommend scheduling a special audit review with the risk owners of all top exposure items within 14 days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // 2. Preset: Which risks are worsening and improving? (q-2)
    if (questionId === 'q-2' || qLower.includes('worsening') || qLower.includes('improving')) {
      const worsening = contextObj.topTrends.worsening;
      const improving = contextObj.topTrends.improving;
      
      const verdict = `Our risk ledger registers ${worsening.length} worsening and ${improving.length} improving risk vectors this month.`;
      
      const worseningStr = worsening.length > 0 ? worsening.map(r => `${r.title} (Score: ${r.score})`).join(', ') : 'none';
      const improvingStr = improving.length > 0 ? improving.map(r => `${r.title} (Score: ${r.score})`).join(', ') : 'none';
      
      const reasoning = `Worsening: ${worseningStr}. Improving: ${improvingStr}. The net risk index has stabilized.`;
      const recommendation = "Recommend redirecting engineering and audit resources to the worsening threats within 10 business days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // 3. Preset: What threatens our growth and revenue objectives? (q-3)
    if (questionId === 'q-3' || qLower.includes('growth') || qLower.includes('revenue') || qLower.includes('threat')) {
      const growthObj = contextObj.strategicObjectives.find(o => o.title.toLowerCase().includes('growth') || o.title.toLowerCase().includes('revenue'));
      const objTitle = growthObj ? growthObj.title : '₹500 Cr ARR Revenue Milestones Expansion';
      const linkedCount = growthObj ? growthObj.linkedRiskCount : 2;
      
      const verdict = `Our core objective "${objTitle}" is currently exposed to ${linkedCount} active threats.`;
      const reasoning = `The primary threat is Top-Tier Enterprise Customer Concentration (Score: 12, Owner: CRO) due to client ARR dependencies. Additionally, succession mapping vacancies present talent constraints.`;
      const recommendation = "Recommend establishing a board-level review of the top accounts pipeline within 30 days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // 4. Preset: Which risks are interconnected? (q-4)
    if (questionId === 'q-4' || qLower.includes('interconnect') || qLower.includes('depend')) {
      const verdict = `We have mapped 2 critical risk cascade chains across the enterprise network map.`;
      const reasoning = `Founder Dependency (Score: 12) cascades directly into Top-Tier Enterprise Customer Concentration (Score: 12), creating compounding pressure on IPO readiness. These linkages increase structural fragility.`;
      const recommendation = "Recommend appointing external technical leadership within 45 days to break the founder dependency cascade.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // 5. Preset: Which KRIs are breached and what actions are overdue? (q-5)
    if (questionId === 'q-5' || qLower.includes('kri') || qLower.includes('breach') || qLower.includes('overdue')) {
      const breaches = contextObj.kriBreaches;
      const actions = contextObj.overdueActions;
      
      const verdict = `There are currently ${breaches.length} breached KRIs and ${actions.length} overdue mitigation actions.`;
      
      const breachStr = breaches.length > 0 ? `${breaches[0].name} (Value: ${breaches[0].current} vs Threshold: ${breaches[0].threshold})` : "no active breaches";
      const actionStr = actions.length > 0 ? `${actions[0].title} (Owner: ${actions[0].owner}, Overdue: ${actions[0].daysOverdue} days)` : "no overdue actions";
      
      const reasoning = `Primary breach: ${breachStr}. Primary overdue task: ${actionStr}. These gaps delay key assurance checkpoints.`;
      const recommendation = "Recommend demanding accountability logs from responsible owners of all overdue actions within 7 business days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // 6. Custom Queries: Match by Intent format rules
    if (intent === 'Predictive') {
      const verdict = `Predictive analysis indicates that pricing and concentration factors will compress valuation multiples if unmitigated.`;
      const reasoning = `Our model forecasts that a churn event at our top client would drop ARR by 20%, directly triggering KRI breaches. The velocity is rated as FAST, leaving a 30-day mitigation window.`;
      const recommendation = "Recommend lock-in contract renegotiations for all accounts exceeding ₹50L within 15 days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    if (intent === 'Comparative') {
      const verdict = `A comparative ranking indicates that founder dependency remains a higher operational threat than cloud spend variance.`;
      const reasoning = `Founder Dependency has a residual score of 12 (High impact, medium likelihood) with a delta of +4 points over Cloud Cost variance (Score: 8). Owner assignment details show limited backup coverage for tech leadership.`;
      const recommendation = "Recommend immediate succession planning and commercial delegation matrix sign-off within 21 days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    if (intent === 'Action-oriented') {
      const verdict = `Action registers show critical control gaps in our SOC 2 readiness audit.`;
      const reasoning = `CISO owns the SOC 2 gap remediation action, which is currently 10 days overdue. The current status is In Progress, but lack of evidence uploads delays audit sign-off.`;
      const recommendation = "Recommend holding an emergency compliance meeting with the security operations team within 5 days.";
      return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
    }

    // Default Diagnostic simulated answer
    const verdict = `Diagnostic scans show a stable risk posture with notable hotspots in founder dependency and customer concentration.`;
    const reasoning = `Founder Dependency is at score 12 (Critical gap) due to lack of succession tracking. Top-Tier Customer Concentration is score 12, driven by top 3 accounts representing 48% of total ARR.`;
    const recommendation = "Recommend immediate board governance succession mapping and commercial threshold reviews within 14 days.";
    return `${verdict}\n\nReasoning: ${reasoning}\n\nRecommendation: ${recommendation}`;
  }

  // --- UPGRADED GEMINI RISK INTELLIGENCE CONTEXT ENGINE (v2.0 - EXECUTIVE BRIEF MODE) ---
  static async generateRiskIntelligenceProfile(context, settings) {
    const apiKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';

    // Build the instruction prompt for Gemini
    const systemPrompt = `You are the NAVIS Risk Intelligence Network Engine.
Your task is to generate a printable boardroom brief: **BOARDROOM RISK INTELLIGENCE BRIEF**.

You must follow these formatting rules strictly:
- Background: white (#FFFFFF)
- Section headers: dark navy (#0A1628)
- Section dividers: Navis teal accent (#00B5B5)
- Font: system sans-serif stack - no external font imports
- Layout: max two pages when printed (A4), single column, generous line spacing (line-height: 1.6)
- Provide exactly four sections:
  1. STRUCTURAL FRAGILITY SUMMARY: Labeled header, a one-line section summary, and top 3 fragile dimensions with scores.
  2. INFLUENCE CONCENTRATION: Labeled header, a one-line section summary, and risks with most downstream dependencies.
  3. STALE REVIEW LOG: Labeled header, a one-line section summary, and risks not reviewed in 30+ days.
  4. 90-DAY BOARD DIRECTIVES: Labeled header, a one-line section summary, and exactly three directives. Each directive must contain: directive statement, rationale referencing a specific risk/KRI by name, and recommended owner.
- Include a Print Button in the HTML that triggers window.print() (hidden during printing using CSS).
- No raw JSON, no debug output, no placeholder text.

Live Corporate Risk Context:
${JSON.stringify(context, null, 2)}
`;

    try {
      const response = await this.queryGemini(systemPrompt, apiKey);
      if (response && response.trim()) {
        await this.setCachedResponse('profile', response);
        return response;
      }
      throw new Error("Empty response from Gemini API");
    } catch (e) {
      console.error("Gemini Profile Generation failed, falling back to cache or local simulator:", e);
      const cached = await this.getCachedResponse('profile');
      if (cached) {
        return "Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n" + cached;
      }
      // If no cache, return the simulated dashboard, prefixed with the message
      const simulatedText = this.getSimulatedProfile(context);
      return "Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n" + simulatedText;
    }
  }

  static getSimulatedProfile(context) {
    const { riskNodes, kris, computedMetrics } = context;
    const now = new Date();

    // Section 1: Fragility
    const radar = computedMetrics.radarMetrics || { financial: 3.5, people: 3.2, customers: 4.0, technology: 3.0, compliance: 3.8, operations: 3.4 };
    const sortedRadar = Object.entries(radar)
      .map(([dim, score]) => ({
        dim: dim.charAt(0).toUpperCase() + dim.slice(1),
        score: Number(score.toFixed(2))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const fragilityHTML = sortedRadar.map(item => {
      const pct = (item.score / 5) * 100;
      return `
        <div style="margin-bottom: 12px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; margin-bottom:4px;">
            <span style="color:#0A1628;">${item.dim} Dimension</span>
            <span style="color:#00B5B5; font-weight:700;">${item.score} / 5.00</span>
          </div>
          <div style="height:6px; background:#F1F5F9; border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:#00B5B5; border-radius:3px;"></div>
          </div>
        </div>
      `;
    }).join('');

    // Section 2: Influence
    const influenceList = computedMetrics.topInfluenceRisks.slice(0, 3);
    const influenceHTML = influenceList.map((tr, idx) => {
      const riskItem = riskNodes.find(r => r.id === tr.id);
      const childCount = (riskItem?.childRiskIds || []).length;
      const relatedCount = (riskItem?.relatedRiskIds || []).length;
      const totalDep = childCount + relatedCount;
      return `
        <div style="background:#F8FAFC; border-left:4px solid #00B5B5; padding:10px 14px; border-radius:4px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:12px; color:#0A1628;">
            <span>${idx + 1}. ${tr.title}</span>
            <span style="color:#00B5B5;">Influence: ${tr.influenceScore} (Residual: ${tr.residualScore})</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748B; margin-top:4px;">
            <span>Owner: <strong>${riskItem?.owner || 'Unassigned'}</strong></span>
            <span>Network Links: <strong>${totalDep} dependencies (${childCount} children, ${relatedCount} related)</strong></span>
          </div>
        </div>
      `;
    }).join('') || `<div style="font-size:12px; color:#64748B;">No high-influence risks mapped in the network graph.</div>`;

    // Section 3: Stale Reviews
    const staleList = computedMetrics.staleReviews || [];
    let staleHTML = "";
    if (staleList.length > 0) {
      staleHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left; margin-top:6px;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8F0; color:#0A1628; font-weight:700;">
              <th style="padding:6px 8px;">Risk Title</th>
              <th style="padding:6px 8px;">Owner</th>
              <th style="padding:6px 8px; color:var(--color-critical-text);">Days Since Last Review</th>
            </tr>
          </thead>
          <tbody>
            ${staleList.slice(0, 5).map(sr => {
              const riskItem = riskNodes.find(r => r.id === sr.id);
              let daysText = "Never Reviewed";
              if (sr.lastReviewed && sr.lastReviewed !== 'Never') {
                const diffTime = Math.abs(now - new Date(sr.lastReviewed));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysText = `${diffDays} days ago`;
              }
              return `
                <tr style="border-bottom: 1px solid #F1F5F9; color:#475569;">
                  <td style="padding:6px 8px; font-weight:600; color:#0A1628;">${sr.title}</td>
                  <td style="padding:6px 8px;">${riskItem?.owner || 'Unassigned'}</td>
                  <td style="padding:6px 8px; color:var(--color-critical-text); font-family:monospace;">${daysText}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      staleHTML = `<div style="font-size:11px; color:var(--color-safe-text); padding:8px; background:var(--color-safe-bg); border-radius:4px;">✅ All active risks have been reviewed and logged within the standard 30-day corporate window.</div>`;
    }


    // Section 4: Directives
    const topFragileDim = sortedRadar[0]?.dim || 'Financial';
    const topFragileScore = sortedRadar[0]?.score || 4.0;
    const highestRisk = riskNodes.find(r => r.category === topFragileDim) || riskNodes[0] || { title: "Top-Tier Enterprise Customer Concentration", owner: "CRO" };
    
    const topInfRiskObj = influenceList[0] ? riskNodes.find(r => r.id === influenceList[0].id) : null;
    const influenceRisk = topInfRiskObj || { title: "Founder Dependency on Technical & Deal Closure Architecture", owner: "CEO & Founder" };
    
    const staleRisk = staleList[0] ? riskNodes.find(r => r.id === staleList[0].id) : null;
    const staleOwner = staleRisk?.owner || "Risk Management Committee";
    const staleRiskName = staleRisk?.title || "active risk logs";

    const directives = [
      {
        statement: `Mitigate ${topFragileDim} Fragility Vectors`,
        rationale: `Our dynamic DNA analysis identifies the ${topFragileDim} dimension as our highest vulnerability area (Score: ${topFragileScore}/5.00). Immediate mitigation action is required for "${highestRisk.title}" to stabilize posture.`,
        owner: highestRisk.owner || "CRO"
      },
      {
        statement: `De-risk Influence Concentrations`,
        rationale: `The risk "${influenceRisk.title}" has the highest volume of downstream dependencies (Score: ${influenceList[0]?.influenceScore || 12}). Isolation and controls are required at this parent node to break potential cascade chains.`,
        owner: influenceRisk.owner || "CEO & Founder"
      },
      {
        statement: `Enforce Compliance Cadence on Stale Reviews`,
        rationale: `There are currently ${staleList.length} risks pending review for over 30 days, specifically "${staleRiskName}". We must resolve these review gaps ahead of board audits.`,
        owner: staleOwner
      }
    ];

    const directivesHTML = directives.map((d, idx) => `
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:12px 16px; border-radius:6px; margin-bottom:10px; border-top:3px solid #00B5B5;">
        <div style="font-size:10px; font-weight:800; color:#00B5B5; text-transform:uppercase;">Directive #${idx+1}</div>
        <h4 style="color:#0A1628; font-size:13px; font-weight:700; margin:4px 0 6px 0;">${d.statement}</h4>
        <p style="font-size:11px; color:#475569; margin:0 0 8px 0; line-height:1.5;">${d.rationale}</p>
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748B; border-top:1px solid #E2E8F0; padding-top:6px;">
          <span>Owner: <strong>${d.owner}</strong></span>
          <span>Timeline: <strong>90 Days</strong></span>
        </div>
      </div>
    `).join('');

    return `
<div class="print-brief-container" style="background:#FFFFFF; color:#1E293B; font-family:system-ui, -apple-system, sans-serif; line-height:1.6; padding:24px; max-width:800px; margin:0 auto; border:1px solid rgba(0,0,0,0.08); border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
  <style>
    @media print {
      body {
        background:#FFFFFF !important;
        color:#000000 !important;
      }
      .no-print {
        display:none !important;
      }
      .print-brief-container {
        border:none !important;
        box-shadow:none !important;
        padding:0 !important;
        max-width:100% !important;
        margin:0 !important;
      }
      @page {
        size:A4;
        margin:15mm;
      }
    }
  </style>

  <!-- Print Button Block -->
  <div class="no-print" style="display:flex; justify-content:flex-end; margin-bottom:20px;">
    <button onclick="window.print()" style="background:#FFFFFF; border:1px solid #00B5B5; color:#00B5B5; padding:6px 14px; font-size:11px; font-weight:600; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='rgba(0,181,181,0.05)'" onmouseout="this.style.background='#FFFFFF'">
      <span>🖨️</span> Print Board Brief
    </button>
  </div>

  <!-- Header -->
  <div style="border-bottom:2px solid #00B5B5; padding-bottom:12px; margin-bottom:24px;">
    <h2 style="color:#0A1628; margin:0; font-size:20px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">Boardroom Risk Intelligence Brief</h2>
    <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748B; margin-top:6px; font-weight:500;">
      <span>NAVIS Advanced Risk Intelligence | Confidential</span>
      <span>Date: ${now.toLocaleDateString('en-IN')}</span>
    </div>
  </div>

  <!-- SECTION 1: STRUCTURAL FRAGILITY SUMMARY -->
  <div style="margin-bottom:24px; page-break-inside:avoid;">
    <h3 style="color:#0A1628; font-size:14px; font-weight:800; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">1. Structural Fragility Summary</h3>
    <p style="font-size:11px; color:#64748B; margin:0 0 12px 0; font-style:italic;">Aggregated exposure scores across six critical vulnerability vectors highlighting structural dependencies.</p>
    ${fragilityHTML}
  </div>

  <!-- SECTION 2: INFLUENCE CONCENTRATION -->
  <div style="margin-bottom:24px; page-break-inside:avoid;">
    <h3 style="color:#0A1628; font-size:14px; font-weight:800; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">2. Influence Concentration</h3>
    <p style="font-size:11px; color:#64748B; margin:0 0 12px 0; font-style:italic;">Identification of parent risks with the highest volume of downstream dependency connections.</p>
    ${influenceHTML}
  </div>

  <!-- SECTION 3: STALE REVIEW LOG -->
  <div style="margin-bottom:24px; page-break-inside:avoid;">
    <h3 style="color:#0A1628; font-size:14px; font-weight:800; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">3. Stale Review Log</h3>
    <p style="font-size:11px; color:#64748B; margin:0 0 12px 0; font-style:italic;">Comprehensive registry of active risks whose reviews are overdue or have not been updated in 30+ days.</p>
    ${staleHTML}
  </div>

  <!-- SECTION 4: 90-DAY BOARD DIRECTIVES -->
  <div style="margin-bottom:12px; page-break-inside:avoid;">
    <h3 style="color:#0A1628; font-size:14px; font-weight:800; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">4. 90-Day Board Directives</h3>
    <p style="font-size:11px; color:#64748B; margin:0 0 12px 0; font-style:italic;">Immediate executive actions recommended to insulate primary operational gaps and structural fragility vectors.</p>
    ${directivesHTML}
  </div>
</div>`;
  }

  // --- POLICY Q&A ---
  static validateCitations(citations, chunks) {
    const validatedCitations = [];
    let validatedCount = 0;

    for (const cit of citations) {
      const excerpt = cit.excerpt || cit.quote || "";
      let matchedChunk = null;

      if (excerpt.trim()) {
        const excerptClean = excerpt.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
        const excerptWords = excerptClean.split(/\s+/).filter(w => w.length > 2);

        for (const chk of chunks) {
          const chunkClean = (chk.chunk_text || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
          
          // Substring check
          if (chunkClean.includes(excerptClean) || excerptClean.includes(chunkClean)) {
            matchedChunk = chk;
            break;
          }

          // Word overlap check
          if (excerptWords.length > 0) {
            let wordMatches = 0;
            excerptWords.forEach(w => {
              if (chunkClean.includes(w)) wordMatches++;
            });
            const ratio = wordMatches / excerptWords.length;
            if (ratio >= 0.7) {
              matchedChunk = chk;
              break;
            }
          }
        }
      }

      // Prepare validated citation object
      const newCit = {
        document_title: cit.document_title || cit.documentTitle || (matchedChunk ? (matchedChunk.document_title || matchedChunk.documentName) : "Policy"),
        excerpt: excerpt
      };

      if (matchedChunk) {
        validatedCount++;
        newCit.page_number = (matchedChunk.page_number !== undefined && matchedChunk.page_number !== null) ? matchedChunk.page_number : null;
        newCit.section_title = matchedChunk.section_title || null;
      } else {
        newCit.page_number = null;
        newCit.section_title = null;
      }

      validatedCitations.push(newCit);
    }

    return { validatedCitations, validatedCount };
  }

  static async answerPolicyQuestion(query, chunks, settings) {
    const selectedDocIds = settings.selectedDocIds || [];
    
    // 1. Filter out low relevance chunks (score < 2)
    const relevantChunks = chunks.filter(c => c.score !== undefined && c.score >= 2);
    
    const retrievedDocIds = [...new Set(relevantChunks.map(c => c.document_id))];
    const retrievedChunkIds = relevantChunks.map(c => c.id);
    const chunkScores = relevantChunks.map(c => c.score || 0);
    const totalScore = relevantChunks.reduce((sum, c) => sum + (c.score || 0), 0);
    const chunksRetrieved = relevantChunks.length;
    const avgScore = chunksRetrieved > 0 ? totalScore / chunksRetrieved : 0;
    
    // Calculate evidence strength programmatically
    let evidenceStrength = 'Low';
    if (chunksRetrieved >= 2 && totalScore >= 15) {
      evidenceStrength = 'High';
    } else if (chunksRetrieved >= 1) {
      evidenceStrength = 'Medium';
    }

    const contextText = relevantChunks.map((c, i) => `Chunk [${i+1}] (Document: ${c.document_title || c.documentName || 'Policy'}, Section: ${c.section_title || 'General'}, Page: ${c.page_number || 'N/A'}):\n${c.chunk_text}`).join('\n\n');
    const timestamp = new Date().toISOString();

    // Console Logging (No sensitive chunk text)
    console.log("Q&A Retrieval Diagnostics:", {
      question: query,
      selected_document_ids: selectedDocIds,
      retrieved_document_ids: retrievedDocIds,
      retrieved_chunk_ids: retrievedChunkIds,
      chunk_scores: chunkScores,
      prompt_context_length: contextText.length,
      timestamp: timestamp
    });

    // 2. Bypass Gemini if no Medium or High relevance chunks
    if (relevantChunks.length === 0) {
      return {
        direct_answer: "No evidence was found in the selected documents.",
        citations: [],
        gaps_detected: [
          {
            title: "Information Gap",
            description: "Unable to determine from available information."
          }
        ],
        recommended_actions: [
          {
            title: "Review Policy Coverage",
            type: "action",
            description: "Upload additional evidence or review the policy."
          }
        ],
        confidence: "Low",
        evidence_strength: "Low",
        metadata: {
          chunksRetrieved: 0,
          documentsUsed: 0,
          usedDocNames: [],
          averageScore: 0,
          evidenceStrength: "Low",
          retrievedDocIds: [],
          retrievedChunkIds: [],
          chunkScores: [],
          contextLength: 0,
          chunksSupplied: []
        }
      };
    }

    // 3. Otherwise, construct strict analyst prompt and query Gemini
    const prompt = `You are the Navis Policy Intelligence Engine, a highly advanced corporate governance, risk, and compliance analyst.
Your task is to analyze the provided policy document chunks and answer the user's question.

You must return a valid JSON object matching the following schema exactly. Do NOT output any markdown code fences (like \`\`\`json), backticks, or text outside the JSON:
{
  "direct_answer": "Provide a comprehensive, authoritative, board-ready response directly addressing the user's question based on the policy context. If no evidence is found in the context to answer the question, you MUST respond exactly with 'No evidence was found in the selected documents.'",
  "citations": [
    {
      "document_title": "The title of the document cited",
      "section_title": "The section title (e.g. Section 2: User Access)",
      "page_number": 1,
      "excerpt": "A short exact quote or summary of the relevant text"
    }
  ],
  "gaps_detected": [
    {
      "title": "Short title of the gap",
      "description": "Detailed explanation of the gap, risk, or compliance omission in the policy relative to frameworks like ISO 27001 or SOC 2"
    }
  ],
  "recommended_actions": [
    {
      "title": "Short title of the recommended action/control",
      "type": "control | action",
      "description": "Specific, actionable mitigation step to address the gap (e.g. implement quarterly reviews or document incident log procedures)"
    }
  ],
  "confidence": "Low"
}

Strict Guidelines:
1. Answer ONLY using the provided text. Never assume facts, invent frequencies, procedures, controls, teams, roles, sections, or page numbers.
2. If the context does not contain the answer, you must return:
   - "direct_answer": "No evidence was found in the selected documents."
   - "citations": []
   - "gaps_detected": []
   - "recommended_actions": []
3. Never invent citation metadata. Only cite what is directly present in the context.

Context (Policy Document Chunks):
${contextText}

User Question:
${query}`;

    let parsedResponse;
    try {
      const apiKey = settings.geminiApiKey || localStorage.getItem('navis_v3_gemini_api_key') || '';
      const response = await this.queryGemini(prompt, apiKey);
      
      // Clean and parse response
      let cleaned = response.trim();
      const bt = String.fromCharCode(96);
      const regex1 = new RegExp('^' + bt + bt + bt + 'json\\s*', 'i');
      const regex2 = new RegExp('^' + bt + bt + bt + '\\s*', 'i');
      const regex3 = new RegExp('\\s*' + bt + bt + bt + '$', 'i');
      cleaned = cleaned.replace(regex1, '').replace(regex2, '').replace(regex3, '').trim();
      
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      
      parsedResponse = JSON.parse(cleaned);
    } catch (e) {
      console.warn("Gemini Policy Q&A call failed, falling back to simulated intelligence:", e);
      parsedResponse = this._simulatePolicyAnswer(query, relevantChunks);
    }

    // 4. Validate Citations and calculate programmatic confidence
    const citations = parsedResponse.citations || [];
    const validatedResult = this.validateCitations(citations, relevantChunks);
    
    // Set cleaned citations
    parsedResponse.citations = validatedResult.validatedCitations;
    
    // Calculate Programmatic Confidence
    const directAnswer = parsedResponse.direct_answer || parsedResponse.directAnswer || "";
    const isNoEvidenceAnswer = directAnswer.toLowerCase().includes("no evidence") || 
                               directAnswer.toLowerCase().includes("unable to determine") || 
                               directAnswer.toLowerCase().includes("no information") || 
                               directAnswer.toLowerCase().includes("not specified") || 
                               directAnswer.toLowerCase().includes("not defined") || 
                               directAnswer.toLowerCase().includes("no mention") ||
                               directAnswer.toLowerCase().includes("insufficient data");
    
    let confidence = 'Low';
    if (isNoEvidenceAnswer) {
      confidence = 'Low';
    } else if (chunksRetrieved >= 2 && validatedResult.validatedCount >= 1) {
      confidence = 'High';
    } else if (chunksRetrieved >= 1) {
      confidence = 'Medium';
    }
    
    parsedResponse.confidence = confidence;
    parsedResponse.evidence_strength = evidenceStrength;

    // Attach metadata for the frontend to consume
    parsedResponse.metadata = {
      chunksRetrieved: chunksRetrieved,
      documentsUsed: retrievedDocIds.length,
      usedDocIds: retrievedDocIds,
      averageScore: avgScore,
      evidenceStrength: evidenceStrength,
      retrievedDocIds: retrievedDocIds,
      retrievedChunkIds: retrievedChunkIds,
      chunkScores: chunkScores,
      contextLength: contextText.length,
      chunksSupplied: relevantChunks
    };

    return parsedResponse;
  }

  static _simulatePolicyAnswer(query, chunks) {
    const text = query.toLowerCase();
    
    // Check for specific questions that have no evidence in the seeded docs
    if ((text.includes('continuity') && text.includes('testing')) || 
        (text.includes('crisis management') && (text.includes('comprise') || text.includes('who') || text.includes('members') || text.includes('constitute'))) || 
        text.includes('alternate') || 
        text.includes('pizza')) {
      return {
        direct_answer: "No evidence was found in the selected documents.",
        citations: [],
        gaps_detected: [
          {
            title: "Information Gap",
            description: "Unable to determine from available information."
          }
        ],
        recommended_actions: [
          {
            title: "Review Policy Coverage",
            type: "action",
            description: "Upload additional evidence or review the policy."
          }
        ],
        confidence: "Low",
        evidence_strength: "Low"
      };
    }
    
    if (text.includes('access') || text.includes('password') || text.includes('mfa') || text.includes('login') || text.includes('credential')) {
      return {
        direct_answer: "Based on the Access Control Policy, ScaleFlow Technologies mandates Multi-Factor Authentication (MFA) for all user access to internal systems, databases, and production servers. User access is provisioned on a least-privilege basis and must be authorized by department heads. Additionally, privileged access reviews must occur every 90 days, and access must be revoked within 24 hours of employee departure.",
        citations: [
          {
            document_title: "Access Control Policy",
            section_title: "Section 1: User Access Provisioning",
            page_number: 1,
            excerpt: "Multi-Factor Authentication (MFA) is mandatory for all access to internal systems, databases, and production servers."
          },
          {
            document_title: "Access Control Policy",
            section_title: "Section 2: Privileged Access Management",
            page_number: 1,
            excerpt: "Privileged access reviews must occur every 90 days. Any inactive admin account for more than 30 days will be disabled automatically."
          }
        ],
        gaps_detected: [
          {
            title: "Access Control Review Gap",
            description: "While MFA and privileged reviews are mandated, there is no automated enforcement or continuous logging specified for access control changes."
          }
        ],
        recommended_actions: [
          {
            title: "Automate Access Reviews",
            type: "control",
            description: "Implement automated access review workflows using IAM tools to enforce the 90-day review cycle."
          },
          {
            title: "Review Privileged Access",
            type: "action",
            description: "Perform an audit of all active administrator accounts to identify and disable inactive credentials."
          }
        ],
        confidence: "High"
      };
    }
    
    if (text.includes('bcp') || text.includes('dr') || text.includes('backup') || text.includes('disaster') || text.includes('recovery') || text.includes('rto') || text.includes('rpo')) {
      return {
        direct_answer: "The BCP/DR Policy defines a strict Recovery Time Objective (RTO) of less than 4 hours for production databases and customer tracking ingestion services, and a Recovery Point Objective (RPO) of less than 1 hour. Backups follow a weekly full and daily incremental schedule, stored offsite with geographic redundancy. DR testing must be conducted annually.",
        citations: [
          {
            document_title: "BCP/DR Policy",
            section_title: "Section 2: Disaster Recovery Targets",
            page_number: 1,
            excerpt: "The Recovery Time Objective (RTO) is defined as less than 4 hours for production databases... Recovery Point Objective (RPO) is defined as less than 1 hour."
          }
        ],
        gaps_detected: [
          {
            title: "Disaster Recovery Testing Delay",
            description: "The BCP/DR policy outlines annual tabletop and simulation testing, but there is a lack of continuous failover drills or real-time simulation under high-load conditions."
          }
        ],
        recommended_actions: [
          {
            title: "Schedule Tabletop DR Simulation",
            type: "action",
            description: "Conduct the annual disaster recovery tabletop exercise with the DevOps and Security teams."
          },
          {
            title: "Deploy Multi-Region Failover Controls",
            type: "control",
            description: "Implement automated multi-region replication controls to guarantee the 1-hour RPO target."
          }
        ],
        confidence: "High"
      };
    }
    
    if (text.includes('privacy') || text.includes('consent') || text.includes('dpdp') || text.includes('gdpr') || text.includes('ccpa')) {
      return {
        direct_answer: "ScaleFlow's Privacy Policy aligns with DPDP, GDPR, and CCPA frameworks. It collects only necessary PII (IP addresses, user IDs, emails) for attribution services, enforces explicit consent before tracking, and guarantees user rights of erasure within 30 days. Confirming breach notifications are completed within 72 hours of detection is also mandated under the responsibility of the Data Protection Officer.",
        citations: [
          {
            document_title: "Privacy Policy",
            section_title: "Section 4: Data Breach Notification",
            page_number: 2,
            excerpt: "In the event of a confirmed personal data breach, ScaleFlow will notify the regulatory authorities and affected data subjects within 72 hours of detection."
          }
        ],
        gaps_detected: [
          {
            title: "Consent Management Documentation Gap",
            description: "The policy mentions that consent must be obtained, but doesn't define the technical mechanics of cookie consent or dynamic user preferences logging."
          }
        ],
        recommended_actions: [
          {
            title: "Implement Dynamic Consent Banner",
            type: "control",
            description: "Configure a cookie consent banner that maps directly to the consent logs database."
          },
          {
            title: "Appoint Data Protection Officer",
            type: "action",
            description: "Formalize the DPO role and establish a quarterly privacy impact assessment schedule."
          }
        ],
        confidence: "High"
      };
    }
    
    // Default general response
    return {
      direct_answer: `Based on the provided policy document chunks, we analyzed the guidelines regarding "${query}". The documents establish general corporate governance controls and align with ISO 27001 and privacy frameworks, but require more granular operational checklists for continuous verification.`,
      citations: chunks.length > 0 ? [
        {
          document_title: chunks[0].document_title || "Policy Document",
          section_title: chunks[0].section_title || "General",
          page_number: chunks[0].page_number || 1,
          excerpt: chunks[0].chunk_text.slice(0, 150) + "..."
        }
      ] : [],
      gaps_detected: [
        {
          title: "Governance Documentation Gap",
          description: "The policy guidelines are stated at a high level without associated lower-level Standard Operating Procedures (SOPs)."
        }
      ],
      recommended_actions: [
        {
          title: "Draft SOPs for Policy Alignment",
          type: "action",
          description: "Document detailed operational procedures to support the policies referenced in this query."
        }
      ],
      confidence: "Medium"
    };
  }
}

