// Expanded Cloud-Ready and Local-First Storage Service for NAVIS V3.
// Automatically connects to Supabase database clusters when credentials are provided,
// and gracefully falls back to localStorage Local Demo Mode when running offline.

import { 
  seededRisks, 
  riskTemplates, 
  seededObjectives, 
  seededScenarios, 
  seededCultureMetrics 
} from './riskUniverse.js';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient.js';
import { DemoDataService } from './demoDataService.js';

const STORAGE_KEYS = {
  RISKS: 'navis_v3_risks',
  TEMPLATES: 'navis_v3_templates',
  SETTINGS: 'navis_v3_settings',
  OBJECTIVES: 'navis_v3_objectives',
  SCENARIOS: 'navis_v3_scenarios',
  CULTURE: 'navis_v3_culture',
  TRENDS: 'navis_v3_trends',
  SEEDED: 'navis_v3_seeded_flag_v3',
  DOCUMENT_VAULT: 'navis_v3_document_vault',
  CHANGE_QUEUE:   'navis_v3_change_queue',
  POLICY_DOCUMENTS: 'navis_v3_policy_documents',
  POLICY_CHUNKS: 'navis_v3_policy_chunks',
  POLICY_QUESTIONS: 'navis_v3_policy_questions',
  POLICY_SEEDED: 'navis_v3_policy_seeded_flag'
};

const isCloudMode = isSupabaseConfigured && supabaseClient;

function normalizeControl(control) {
  const rating = control.rating || control.effectiveness || 'Partially Effective';
  return {
    ...control,
    effectiveness: control.effectiveness || (rating === 'Effective' ? 'Highly Effective' : rating),
    status: control.status || (rating === 'Ineffective' ? 'Under Review' : 'Active')
  };
}

function normalizeAction(action) {
  return {
    ...action,
    dueDate: action.dueDate || action.due_date
  };
}

export class StorageService {
  static generateScoreHistory(lr, ir, trend) {
    const history = [];
    let tempScore = lr * ir;
    const today = new Date();
    for (let i = 0; i < 180; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      history.push({
        date: dateLabel,
        score: Math.max(1, Math.min(25, Math.round(tempScore)))
      });
      let change = (Math.random() - 0.5) * 1.2;
      if (trend === 'Deteriorating') change -= 0.06;
      else if (trend === 'Improving') change += 0.06;
      tempScore += change;
    }
    return history.reverse();
  }

  static async getActiveOrgId() {
    if (!isCloudMode) return '00000000-0000-0000-0000-000000000000';
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      const session = data?.session;
      const orgId = session?.user?.user_metadata?.organization_id;
      return orgId || '00000000-0000-0000-0000-000000000000';
    } catch (e) {
      console.error("Error fetching active org ID:", e);
      return '00000000-0000-0000-0000-000000000000';
    }
  }

  static init() {
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.resetToDefaults();
    }
    const isPolicySeeded = localStorage.getItem(STORAGE_KEYS.POLICY_SEEDED);
    if (!isPolicySeeded) {
      this.seedPolicyDocuments();
    }
  }

  static resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(seededRisks));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(riskTemplates));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(seededObjectives));
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(seededScenarios));
    localStorage.setItem(STORAGE_KEYS.CULTURE, JSON.stringify(seededCultureMetrics));
    localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify([]));

    const defaultSettings = {
      brandName: 'NAVIS',
      geminiApiKey: '',
      companyName: 'ScaleFlow Technologies Pvt Ltd',
      revenueBracket: '₹280 Cr (FY26)',
      ipoTimeline: 'Target Q3 FY27 (NSE/BSE Mainboard)',
      soc2Status: 'SOC 2 Type II Certified',
      businessUnits: ['Enterprise Sales', 'Engineering & Infrastructure', 'Security Operations', 'Finance Operations', 'Legal & HR', 'Product Management'],
      locations: ['Bangalore HQ', 'Chennai Dev Center', 'US Delaware Entity'],
      activeUserRole: 'CRO (Chief Risk Officer)',
      products: 'Affiliate Tracking Platform, Attribution Engine, Rewards System',
      businessModel: 'B2B SaaS',
      customerSegments: 'Gaming, E-commerce, Fintech, Ad-networks',
      cloudProvider: 'AWS',
      hostingRegion: 'ap-south-1 (Mumbai), us-east-1 (N. Virginia)',
      criticalVendors: 'Cloudflare, MongoDB Atlas, Stripe, Datadog',
      criticalProcesses: 'Event Ingestion (10B+ events/mo), Attribution Calculation, Publisher Payouts',
      regulatoryExposure: 'India (DPDP Act), EU (GDPR)',
      riskAppetite: 'Moderate',
      recoveryPhilosophy: 'Availability-first'
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }

  // --- RISKS CRUD WITH AUTOMATIC CONVERSION ---

  static async getRisks() {
    this.init();

    // A. CLOUD DEMO / SAAS PRODUCTION MODE (Supabase fetch with joins)
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('risks')
          .select(`
            *,
            controls(*),
            kris(*),
            actions(*),
            risk_fragilities(*),
            assurance_mappings(*),
            risk_to_objectives(objective_id),
            risk_relationships!risk_relationships_parent_id_fkey(child_id, relation_type)
          `);

        if (error) throw error;

        return data.map(r => ({
          id: r.id,
          title: r.title ? r.title.replace(/^\[DEMO Trackier SaaS\]\s*/i, '').replace(/^\[demo-trk-risk-\d+\]\s*/i, '').trim() : '',
          category: r.category,
          l1: r.l1,
          l2: r.l2,
          l3: r.l3,
          description: r.description,
          owner: r.owner,
          businessUnit: r.business_unit,
          location: r.location,
          likelihood: r.likelihood,
          impact: r.impact,
          velocity: r.velocity,
          likelihoodResidual: r.likelihood_residual,
          impactResidual: r.impact_residual,
          velocityResidual: r.velocity_residual,
          residualScore: r.residual_score,
          appetiteStatus: r.appetite_status,
          trend: r.trend,
          scoreHistory: StorageService.generateScoreHistory(
            r.likelihood_residual || r.likelihood || 3,
            r.impact_residual || r.impact || 3,
            r.trend || 'Stable'
          ),
          timeToImpact: r.time_to_impact,
          timeToDetection: r.time_to_detection,
          timeToRecovery: r.time_to_recovery,
          parentRiskId: r.parent_risk_id,
          last_reviewed_date: r.last_reviewed_date || r.created_at || new Date().toISOString(),
          created_at: r.created_at || new Date().toISOString(),
          
          controls: (r.controls || []).map(normalizeControl),
          kris: r.kris || [],
          actions: (r.actions || []).map(normalizeAction),
          fragility: r.risk_fragilities ? {
            revenue: r.risk_fragilities.revenue,
            growth: r.risk_fragilities.growth,
            customerTrust: r.risk_fragilities.customer_trust,
            technology: r.risk_fragilities.technology,
            people: r.risk_fragilities.people,
            operations: r.risk_fragilities.operations,
            reputation: r.risk_fragilities.reputation,
            valuation: r.risk_fragilities.valuation
          } : {},
          assurance: r.assurance_mappings ? {
            firstLine: r.assurance_mappings.first_line,
            secondLine: r.assurance_mappings.second_line,
            thirdLine: r.assurance_mappings.third_line,
            gapDetected: r.assurance_mappings.gap_detected
          } : {},
          objectiveIds: r.risk_to_objectives ? r.risk_to_objectives.map(o => o.objective_id) : [],
          childRiskIds: r.risk_relationships ? r.risk_relationships.filter(rel => rel.relation_type === 'parent-child').map(rel => rel.child_id) : [],
          relatedRiskIds: r.risk_relationships ? r.risk_relationships.filter(rel => rel.relation_type === 'related').map(rel => rel.child_id) : []
        }));
      } catch (e) {
        console.error("Supabase fetch risks failed. Falling back to local offline cache:", e);
      }
    }

    // B. LOCAL OFFLINE DEMO MODE (localStorage)
    const data = localStorage.getItem(STORAGE_KEYS.RISKS);
    const risks = data ? JSON.parse(data) : [];
    
    const getSimulatedDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString();
    };

    const SIMULATED_OFFSETS = {
      'risk-003': 2,
      'risk-004': 5,
      'risk-005': 9,
      'risk-006': 12,
      'risk-001': 15,
      'risk-002': 18,
      'risk-007': 25,
      'risk-008': 35,
      'risk-009': 40,
      'risk-010': 42,
      'risk-011': 60,
      'risk-013': 80
    };

    let modified = false;
    const mappedRisks = risks.map(r => {
      const title = r.title ? r.title.replace(/^\[DEMO Trackier SaaS\]\s*/i, '').replace(/^\[demo-trk-risk-\d+\]\s*/i, '').trim() : '';
      let updated = false;
      if (r.title !== title) {
        r.title = title;
        updated = true;
      }
      if (!r.last_reviewed_date) {
        const offset = SIMULATED_OFFSETS[r.id];
        if (offset !== undefined) {
          r.last_reviewed_date = getSimulatedDate(offset);
          updated = true;
        } else {
          r.last_reviewed_date = getSimulatedDate(3);
          updated = true;
        }
      }
      if (!r.created_at) {
        r.created_at = r.last_reviewed_date || new Date().toISOString();
        updated = true;
      }
      if (updated) {
        modified = true;
      }
      return {
        ...r,
        title,
        scoreHistory: r.scoreHistory || StorageService.generateScoreHistory(
          r.likelihoodResidual || r.likelihood || 3,
          r.impactResidual || r.impact || 3,
          r.trend || 'Stable'
        )
      };
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(mappedRisks));
    }
    return mappedRisks;
  }

  static async getRiskById(id) {
    const risks = await this.getRisks();
    return risks.find(r => r.id === id) || null;
  }

  static async saveRisk(risk, userComment = "Updated risk metrics") {
    risk.last_reviewed_date = new Date().toISOString();
    risk.created_at = risk.created_at || new Date().toISOString();

    const likelihoodRes = parseInt(risk.likelihoodResidual || risk.likelihood || 1);
    const impactRes = parseInt(risk.impactResidual || risk.impact || 1);
    risk.residualScore = likelihoodRes * impactRes; 
    risk.inherentScore = parseInt(risk.likelihood || 1) * parseInt(risk.impact || 1);

    if (risk.residualScore >= 16) {
      risk.appetiteStatus = 'Above Appetite';
    } else if (risk.residualScore >= 11) {
      risk.appetiteStatus = 'Near Appetite';
    } else {
      risk.appetiteStatus = 'Within Appetite';
    }

    const settings = await this.getSettings();
    const activeUser = settings.activeUserRole || "CRO";

    // A. CLOUD DEMO / PRODUCTION MODE (Supabase write RLS protected)
    if (isCloudMode) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges. Writes are blocked at the database layer (RLS).");
          return risk;
        }

        const orgId = await this.getActiveOrgId();

        const dbRisk = {
          id: risk.id,
          organization_id: orgId, // default Demo Tenant Organization UUID
          title: risk.title,
          category: risk.category,
          l1: risk.category,
          l2: risk.subcategory || risk.l2 || 'General',
          l3: risk.l3 || 'Other',
          description: risk.description,
          owner: risk.owner,
          business_unit: risk.businessUnit,
          location: risk.location || 'Bangalore HQ',
          likelihood: parseInt(risk.likelihood || 3),
          impact: parseInt(risk.impact || 3),
          velocity: parseInt(risk.velocity || 3),
          likelihood_residual: likelihoodRes,
          impact_residual: impactRes,
          velocity_residual: parseInt(risk.velocityResidual || 2),
          trend: risk.trend || 'Stable',
          time_to_impact: risk.timeToImpact || 'Moderate',
          time_to_detection: risk.timeToDetection || 'Moderate',
          time_to_recovery: risk.timeToRecovery || 'Moderate',
          parent_risk_id: risk.parentRiskId || null,
          last_reviewed_date: risk.last_reviewed_date
        };

        const { error } = await supabaseClient.from('risks').upsert(dbRisk);
        if (error) throw error;

        // Save normalized sub-tables
        if (risk.fragility) {
          await supabaseClient.from('risk_fragilities').upsert({
            risk_id: risk.id,
            organization_id: orgId,
            revenue: risk.fragility.revenue || 1,
            growth: risk.fragility.growth || 1,
            customer_trust: risk.fragility.customerTrust || 1,
            technology: risk.fragility.technology || 1,
            people: risk.fragility.people || 1,
            operations: risk.fragility.operations || 1,
            reputation: risk.fragility.reputation || 1,
            valuation: risk.fragility.valuation || 1
          });
        }

        if (risk.assurance) {
          await supabaseClient.from('assurance_mappings').upsert({
            risk_id: risk.id,
            organization_id: orgId,
            first_line: risk.assurance.firstLine || 'CRO',
            second_line: risk.assurance.secondLine || 'Committee',
            third_line: risk.assurance.thirdLine || 'None',
            gap_detected: risk.assurance.gapDetected || false
          });
        }

        if (risk.objectiveIds) {
          await supabaseClient.from('risk_to_objectives').delete().eq('risk_id', risk.id);
          for (const objId of risk.objectiveIds) {
            await supabaseClient.from('risk_to_objectives').insert({
              risk_id: risk.id,
              objective_id: objId,
              organization_id: orgId
            });
          }
        }

        return risk;
      } catch (err) {
        alert(`Supabase RLS Violation: Writing denied. (${err.message})`);
        throw err;
      }
    }

    // B. LOCAL OFFLINE MODE
    const risks = JSON.parse(localStorage.getItem(STORAGE_KEYS.RISKS) || '[]');
    const index = risks.findIndex(r => r.id === risk.id);

    if (index > -1) {
      const prevRisk = risks[index];
      const prevScore = prevRisk.residualScore || 12;
      const newScore = risk.residualScore;

      if (prevScore !== newScore) {
        const trendLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRENDS) || '[]');
        trendLogs.push({
          id: `trend-${Date.now()}`,
          riskId: risk.id,
          riskTitle: risk.title,
          previousScore: prevScore,
          newScore: newScore,
          user: activeUser,
          timestamp: new Date().toISOString(),
          comments: userComment
        });
        localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trendLogs));
        risk.trend = (newScore > prevScore) ? 'Deteriorating' : 'Improving';
      }
      risks[index] = { ...risks[index], ...risk };
    } else {
      if (!risk.id) {
        risk.id = `risk-${Date.now().toString().slice(-3)}`;
      }
      risk.trend = 'Stable';
      risks.push(risk);

      const trendLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRENDS) || '[]');
      trendLogs.push({
        id: `trend-${Date.now()}`,
        riskId: risk.id,
        riskTitle: risk.title,
        previousScore: 0,
        newScore: risk.residualScore,
        user: activeUser,
        timestamp: new Date().toISOString(),
        comments: "Initial risk registration"
      });
      localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trendLogs));
    }

    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(risks));
    return risk;
  }

  static async deleteRisk(id) {
    const settings = await this.getSettings();

    // A. CLOUD DEMO MODE (Supabase delete RLS protected)
    if (isCloudMode) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges. Deletions are blocked by RLS.");
          return false;
        }

        const { error } = await supabaseClient.from('risks').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        alert(`Supabase RLS Violation: Deletion denied. (${err.message})`);
        throw err;
      }
    }

    // B. LOCAL OFFLINE MODE
    let risks = JSON.parse(localStorage.getItem(STORAGE_KEYS.RISKS) || '[]');
    risks = risks.map(r => {
      let updated = false;
      let childIds = r.childRiskIds || [];
      let relatedIds = r.relatedRiskIds || [];
      let parentId = r.parentRiskId;

      if (parentId === id) { parentId = null; updated = true; }
      if (childIds.includes(id)) { childIds = childIds.filter(cid => cid !== id); updated = true; }
      if (relatedIds.includes(id)) { relatedIds = relatedIds.filter(rid => rid !== id); updated = true; }

      return updated ? { ...r, parentRiskId: parentId, childRiskIds: childIds, relatedRiskIds: relatedIds } : r;
    });

    const filtered = risks.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(filtered));

    let trends = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRENDS) || '[]');
    trends = trends.filter(t => t.riskId !== id);
    localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trends));

    return true;
  }

  // --- TREND LOGS ENGINE QUERY ---
  
  static async getTrendLogs() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient.from('trend_logs').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        return data.map(t => ({
          id: t.id,
          riskId: t.risk_id,
          riskTitle: t.risk_title,
          previousScore: t.previous_score,
          newScore: t.new_score,
          user: t.active_user,
          timestamp: t.timestamp,
          comments: t.comments
        }));
      } catch (e) {
        console.error("Supabase fetch trends failed, falling back to local:", e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.TRENDS);
    return data ? JSON.parse(data) : [];
  }

  // --- STRATEGIC OBJECTIVES CRUD (F1) ---

  static async getObjectives() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient.from('strategic_objectives').select('*');
        if (error) throw error;
        return data.map(o => ({
          id: o.id,
          title: o.title,
          owner: o.owner,
          targetDate: o.target_date,
          importance: o.importance,
          successMetrics: o.success_metrics,
          status: o.status
        }));
      } catch (e) {
        console.error("Supabase fetch objectives failed, falling back to local:", e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
    return data ? JSON.parse(data) : [];
  }

  static async saveObjective(objective) {
    const settings = await this.getSettings();

    if (isCloudMode) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return objective;
        }

        const orgId = await this.getActiveOrgId();

        const dbObj = {
          id: objective.id,
          organization_id: orgId,
          title: objective.title,
          owner: objective.owner,
          target_date: objective.targetDate,
          importance: objective.importance,
          success_metrics: objective.successMetrics,
          status: objective.status
        };

        const { error } = await supabaseClient.from('strategic_objectives').upsert(dbObj);
        if (error) throw error;
        return objective;
      } catch (err) {
        alert(`Supabase RLS Violation: Writing denied. (${err.message})`);
        throw err;
      }
    }

    const objectives = JSON.parse(localStorage.getItem(STORAGE_KEYS.OBJECTIVES) || '[]');
    const index = objectives.findIndex(o => o.id === objective.id);

    if (index > -1) {
      objectives[index] = { ...objectives[index], ...objective };
    } else {
      if (!objective.id) {
        objective.id = `obj-${Date.now().toString().slice(-3)}`;
      }
      objectives.push(objective);
    }

    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
    return objective;
  }

  // --- SCENARIOS (F4) ---

  static async getScenarios() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient.from('scenarios').select('*');
        if (error) throw error;
        return data.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          objectiveId: s.objective_id,
          revenueImpact: {
            best: s.revenue_impact_best,
            expected: s.revenue_impact_expected,
            worst: s.revenue_impact_worst
          },
          ebitdaImpact: {
            best: s.ebitda_impact_best,
            expected: s.ebitda_impact_expected,
            worst: s.ebitda_impact_worst
          },
          cashImpact: {
            best: s.cash_impact_best,
            expected: s.cash_impact_expected,
            worst: s.cash_impact_worst
          },
          objectiveImpact: s.objective_impact
        }));
      } catch (e) {
        console.error("Supabase fetch scenarios failed, falling back to local:", e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return data ? JSON.parse(data) : [];
  }

  // --- CULTURE METRICS CRUD (F9) ---

  static async getCultureMetrics() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient.from('culture_metrics').select('*').order('recorded_at', { ascending: false }).limit(1);
        if (error) throw error;
        if (data.length > 0) {
          const c = data[0];
          return {
            policyAcknowledgementRate: c.policy_acknowledgement_rate,
            trainingCompletionRate: c.training_completion_rate,
            incidentReportVelocityDays: c.incident_report_velocity_days,
            nearMissLoggedCount: c.near_miss_logged_count,
            whistleblowerCasesActive: c.whistleblower_cases_active,
            cultureScore: c.culture_score,
            trend: c.trend
          };
        }
      } catch (e) {
        console.error("Supabase fetch culture failed, falling back to local:", e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.CULTURE);
    return data ? JSON.parse(data) : seededCultureMetrics;
  }

  static async saveCultureMetrics(metrics) {
    const settings = await this.getSettings();

    if (isCloudMode) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return metrics;
        }

        const orgId = await this.getActiveOrgId();

        const dbCulture = {
          organization_id: orgId,
          policy_acknowledgement_rate: metrics.policyAcknowledgementRate,
          training_completion_rate: metrics.trainingCompletionRate,
          incident_report_velocity_days: metrics.incidentReportVelocityDays,
          near_miss_logged_count: metrics.nearMissLoggedCount,
          whistleblower_cases_active: metrics.whistleblowerCasesActive,
          culture_score: metrics.cultureScore,
          trend: metrics.trend
        };

        const { error } = await supabaseClient.from('culture_metrics').insert(dbCulture);
        if (error) throw error;
        return metrics;
      } catch (err) {
        alert(`Supabase RLS Violation: Writing denied. (${err.message})`);
        throw err;
      }
    }

    localStorage.setItem(STORAGE_KEYS.CULTURE, JSON.stringify(metrics));
    return metrics;
  }

  // --- SETTINGS CLIENT ---

  static async getSettings() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 'default_config');
        if (error) throw error;
        if (data.length > 0) {
          const s = data[0];
          
          // Fetch locations and BUs in parallel
          const buData = await supabaseClient.from('settings_business_units').select('unit_name');
          const locData = await supabaseClient.from('settings_locations').select('location_name');
          
          const localKey = localStorage.getItem('navis_v3_gemini_api_key') || '';
          const localRole = localStorage.getItem('navis_v3_active_user_role') || s.active_user_role || 'CRO (Chief Risk Officer)';

          return {
            brandName: s.brand_name,
            companyName: s.company_name,
            revenueBracket: s.revenue_bracket,
            ipoTimeline: s.ipo_timeline,
            soc2Status: s.soc2_status,
            businessUnits: buData.data ? buData.data.map(bu => bu.unit_name) : [],
            locations: locData.data ? locData.data.map(loc => loc.location_name) : [],
            activeUserRole: localRole,
            geminiApiKey: localKey
          };
        }
      } catch (e) {
        console.error("Supabase fetch settings failed, falling back to local:", e);
      }
    }

    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : {};
    
    if (parsed.brandName === 'RiskOS') {
      parsed.brandName = 'NAVIS';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    parsed.geminiApiKey = localStorage.getItem('navis_v3_gemini_api_key') || parsed.geminiApiKey || '';
    parsed.activeUserRole = localStorage.getItem('navis_v3_active_user_role') || parsed.activeUserRole || 'CRO (Chief Risk Officer)';
    return parsed;
  }

  static async saveSettings(settings) {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    // Always securely save the Gemini Key in local browser cache only
    if (settings.geminiApiKey !== undefined) {
      localStorage.setItem('navis_v3_gemini_api_key', settings.geminiApiKey);
    }

    // Always securely save the simulated Active User Role in local browser cache only
    if (settings.activeUserRole !== undefined) {
      localStorage.setItem('navis_v3_active_user_role', settings.activeUserRole);
    }

    if (isCloudMode) {
      try {
        if (current.activeUserRole && current.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return updated;
        }

        const orgId = await this.getActiveOrgId();

        const dbSettings = {
          id: 'default_config',
          organization_id: orgId,
          brand_name: updated.brandName,
          company_name: updated.companyName,
          revenue_bracket: updated.revenueBracket,
          ipo_timeline: updated.ipoTimeline,
          soc2_status: updated.soc2Status || 'SOC 2 Type II Certified'
        };

        const { error } = await supabaseClient.from('settings').upsert(dbSettings);
        if (error) throw error;
        
        // Sync BUs and Locations if they changed
        if (settings.businessUnits) {
          await supabaseClient.from('settings_business_units').delete().eq('settings_id', 'default_config');
          for (const bu of settings.businessUnits) {
            await supabaseClient.from('settings_business_units').insert({
              settings_id: 'default_config',
              organization_id: orgId,
              unit_name: bu
            });
          }
        }

        return updated;
      } catch (err) {
        console.warn(`Supabase write failed: ${err.message}. Falling back to local storage.`);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- TEMPLATES ---
  
  static async getTemplates() {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : {};
  }

  static getDemoDataCounts() {
    return DemoDataService.getRecordCounts();
  }

  static async generateSaasDemoData() {
    return DemoDataService.generate();
  }

  static async clearSaasDemoData() {
    return DemoDataService.clear();
  }

  // --- DOCUMENT VAULT (Risk Intelligence Desk) ---

  static async getDocumentVault() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('document_vault')
          .select('*')
          .order('upload_date', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          documentName: d.document_name,
          documentType: d.document_type,
          documentSummary: d.document_summary,
          uploadDate: d.upload_date,
          extractedCounts: d.extracted_counts || {},
          status: d.status,
          changesAccepted: d.changes_accepted || 0,
          changesDismissed: d.changes_dismissed || 0,
          rawExtraction: d.raw_extraction || null,
          is_demo: d.is_demo || ['policy-doc-access-control', 'policy-doc-bcp-dr', 'policy-doc-privacy', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'].includes(d.id)
        }));
      } catch (e) {
        console.error('Supabase document_vault fetch failed, falling back to local:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_VAULT);
    const vault = data ? JSON.parse(data) : [];
    
    // Retroactive sync for demo flag
    let updated = false;
    const syncedVault = vault.map(d => {
      if (['policy-doc-access-control', 'policy-doc-bcp-dr', 'policy-doc-privacy', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'].includes(d.id) && !d.is_demo) {
        d.is_demo = true;
        updated = true;
      }
      return d;
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENT_VAULT, JSON.stringify(syncedVault));
    }
    return syncedVault;
  }

  static async saveVaultEntry(entry) {
    if (isCloudMode) {
      try {
        const orgId = await this.getActiveOrgId();
        const dbEntry = {
          id: entry.id,
          organization_id: orgId,
          document_name: entry.documentName,
          document_type: entry.documentType,
          document_summary: entry.documentSummary,
          upload_date: entry.uploadDate || new Date().toISOString(),
          extracted_counts: entry.extractedCounts || {},
          status: entry.status || 'pending_review',
          changes_accepted: entry.changesAccepted || 0,
          changes_dismissed: entry.changesDismissed || 0,
          raw_extraction: entry.rawExtraction || null
        };
        const { error } = await supabaseClient.from('document_vault').upsert(dbEntry);
        if (error) throw error;
        return entry;
      } catch (e) {
        console.error('Supabase document_vault save failed, falling back to local:', e);
      }
    }
    const vault = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_VAULT) || '[]');
    const idx = vault.findIndex(v => v.id === entry.id);
    if (idx > -1) {
      vault[idx] = { ...vault[idx], ...entry };
    } else {
      vault.push(entry);
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_VAULT, JSON.stringify(vault));
    return entry;
  }

  static async saveGovernancePack(pack) {
    const packEntry = {
      id: `pack-${Date.now()}`,
      documentName: pack.packName,
      documentType: 'Governance Pack',
      documentSummary: `Complete governance pack for ${pack.domain} domain, containing ${pack.artifacts.length} interconnected artifacts.`,
      uploadDate: new Date().toISOString(),
      status: 'active',
      domain: pack.domain,
      artifacts: pack.artifacts // Parent-child relationship
    };

    if (isCloudMode) {
      try {
        const orgId = await this.getActiveOrgId();
        const dbEntry = {
          id: packEntry.id,
          organization_id: orgId,
          document_name: packEntry.documentName,
          document_type: packEntry.documentType,
          document_summary: packEntry.documentSummary,
          upload_date: packEntry.uploadDate,
          raw_extraction: JSON.stringify(pack.artifacts),
          status: packEntry.status
        };
        const { error } = await supabaseClient.from('document_vault').upsert(dbEntry);
        if (error) throw error;
        return packEntry;
      } catch (e) {
        console.error('Supabase pack save failed, falling back to local:', e);
      }
    }
    const vault = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_VAULT) || '[]');
    vault.push(packEntry);
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_VAULT, JSON.stringify(vault));
    return packEntry;
  }

  // --- CHANGE QUEUE (Risk Intelligence Desk) ---

  static async getChangeQueue() {
    // Phase 1: localStorage only (cloud persistence in future sprint)
    const data = localStorage.getItem(STORAGE_KEYS.CHANGE_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  static async saveChangeQueue(items) {
    // Phase 1: localStorage only
    localStorage.setItem(STORAGE_KEYS.CHANGE_QUEUE, JSON.stringify(items));
  }

  // --- POLICY INTELLIGENCE SEEDER ---

  static seedPolicyDocuments() {
    const sampleDocs = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Access Control Policy',
        document_type: 'Access Control Policy',
        framework_tags: ['ISO 27001', 'SOC 2'],
        file_name: 'access_control_policy_v2.pdf',
        file_url: '',
        mime_type: 'application/pdf',
        status: 'Ready',
        extracted_text: `ScaleFlow Technologies Access Control Policy. ISO 27001 / SOC 2 Compliance framework.
Section 1: User Access Provisioning. All user accounts must be authorized by the respective department head. Access is granted on a least-privilege basis. Multi-Factor Authentication (MFA) is mandatory for all access to internal systems, databases, and production servers.
Section 2: Privileged Access Management. Admin accounts must use dedicated admin credentials. Double authentication is required. Privileged access reviews must occur every 90 days. Any inactive admin account for more than 30 days will be disabled automatically.
Section 3: Revocation of Access. Upon termination of employment or changes in contract, user access must be revoked within 24 hours of the departure date. HR must trigger the offboarding ticket immediately.
Section 4: Audit Logs. Authentication and authorization logs must be maintained for at least 365 days. Monitoring tools will alert the security team of any brute force or access control bypass attempts.
Section 5: Password Complexity. Passwords must be at least 12 characters long, containing uppercase, lowercase, numbers, and special characters. Password rotation is recommended every 180 days.`,
        summary: 'Access control policy covering provisioning, privileged access reviews, password rules, and immediate revocation procedures.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'BCP/DR Policy',
        document_type: 'BCP/DR Policy',
        framework_tags: ['ISO 27001', 'Internal Governance'],
        file_name: 'scaleflow_bcp_dr_framework.pdf',
        file_url: '',
        mime_type: 'application/pdf',
        status: 'Ready',
        extracted_text: `ScaleFlow Technologies Business Continuity & Disaster Recovery Policy.
Section 1: Business Continuity Plan. ScaleFlow is committed to maintaining operations during disruptions. The Critical Crisis Management Team (CMT) is responsible for declaring a disaster and executing recovery procedures.
Section 2: Disaster Recovery Targets. The Recovery Time Objective (RTO) is defined as less than 4 hours for production databases and customer tracking ingestion services. The Recovery Point Objective (RPO) is defined as less than 1 hour, meaning no more than 1 hour of customer transactional data can be lost in a failover event.
Section 3: Data Backup Schedule. Full database backups are performed weekly. Incremental backups are executed daily. Backups are stored in an encrypted offsite location with geographic redundancy.
Section 4: Disaster Recovery Testing. Annual tabletop exercises and simulation tests must be conducted by the DevOps and Security teams. The results of the annual DR test must be reported to the Board of Directors.
Section 5: Crisis Communications. In the event of a critical service outage, customer success must notify key enterprise tenants within 2 hours. A public status page will be maintained and updated every 30 minutes.`,
        summary: 'Business continuity and disaster recovery plan defining critical RTO (< 4 hrs) and RPO (< 1 hr) metrics, testing, and communications.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        title: 'Privacy Policy',
        document_type: 'Privacy Policy',
        framework_tags: ['DPDP', 'GDPR', 'CCPA'],
        file_name: 'scaleflow_privacy_charter.pdf',
        file_url: '',
        mime_type: 'application/pdf',
        status: 'Ready',
        extracted_text: `ScaleFlow Technologies Data Privacy Policy. Alignment with DPDP, GDPR, and CCPA.
Section 1: Personal Data Collection. ScaleFlow processes customer event tracking data, user identifiers, email addresses, and IP addresses. We strictly collect only personal data necessary for attribution services, aligning with the data minimization principle.
Section 2: Consent Management. Explicit consent must be obtained from users prior to tracking or processing their PII. Users have the right to withdraw consent at any time.
Section 3: User Rights. Under GDPR and DPDP, users have the right of access, right of rectification, and right of erasure (the right to be forgotten). ScaleFlow will process erasure requests within 30 days of receipt.
Section 4: Data Breach Notification. In the event of a confirmed personal data breach, ScaleFlow will notify the regulatory authorities and affected data subjects within 72 hours of detection, detailing the nature of the breach and mitigation steps.
Section 5: Data Protection Officer. The DPO is responsible for oversight of privacy impact assessments (PIAs) and ensuring continuous compliance across all engineering and customer-facing teams.`,
        summary: 'Privacy charter aligned with DPDP, GDPR, and CCPA detailing PII collection, consent, rights of erasure, and 72-hour breach notice.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    localStorage.setItem(STORAGE_KEYS.POLICY_DOCUMENTS, JSON.stringify(sampleDocs));

    // Seed corresponding Document Vault entries for the sample policies
    const vaultDocs = sampleDocs.map(doc => ({
      id: doc.id,
      documentName: doc.title,
      documentType: doc.document_type,
      documentSummary: doc.summary,
      uploadDate: doc.created_at,
      extractedCounts: {
        risks: 5,
        controls: 5,
        policies: 1,
        actions: 5,
        gaps: 2
      },
      status: 'fully_processed',
      changesAccepted: 5,
      changesDismissed: 0,
      rawExtraction: null,
      is_demo: true
    }));

    const existingVault = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_VAULT) || '[]');
    const cleanedVault = existingVault.filter(v => 
      !v.is_demo && 
      v.id !== 'policy-doc-access-control' && 
      v.id !== 'policy-doc-bcp-dr' && 
      v.id !== 'policy-doc-privacy' &&
      v.id !== '00000000-0000-0000-0000-000000000001' &&
      v.id !== '00000000-0000-0000-0000-000000000002' &&
      v.id !== '00000000-0000-0000-0000-000000000003'
    );
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_VAULT, JSON.stringify([...cleanedVault, ...vaultDocs]));

    // Seed initial chunks for the sample policies
    const allChunks = [];
    sampleDocs.forEach(doc => {
      if (doc.id === '00000000-0000-0000-0000-000000000001') {
        allChunks.push(
          { id: 'chunk-ac-1', document_id: doc.id, chunk_index: 0, chunk_text: `Section 1: User Access Provisioning. All user accounts must be authorized by the respective department head. Access is granted on a least-privilege basis. Multi-Factor Authentication (MFA) is mandatory for all access to internal systems, databases, and production servers.`, section_title: 'Section 1: User Access Provisioning', page_number: 1, token_count: 50, created_at: new Date().toISOString() },
          { id: 'chunk-ac-2', document_id: doc.id, chunk_index: 1, chunk_text: `Section 2: Privileged Access Management. Admin accounts must use dedicated admin credentials. Double authentication is required. Privileged access reviews must occur every 90 days. Any inactive admin account for more than 30 days will be disabled automatically.`, section_title: 'Section 2: Privileged Access Management', page_number: 1, token_count: 50, created_at: new Date().toISOString() },
          { id: 'chunk-ac-3', document_id: doc.id, chunk_index: 2, chunk_text: `Section 3: Revocation of Access. Upon termination of employment or changes in contract, user access must be revoked within 24 hours of the departure date. HR must trigger the offboarding ticket immediately.`, section_title: 'Section 3: Revocation of Access', page_number: 1, token_count: 40, created_at: new Date().toISOString() },
          { id: 'chunk-ac-4', document_id: doc.id, chunk_index: 3, chunk_text: `Section 4: Audit Logs. Authentication and authorization logs must be maintained for at least 365 days. Monitoring tools will alert the security team of any brute force or access control bypass attempts.`, section_title: 'Section 4: Audit Logs', page_number: 2, token_count: 40, created_at: new Date().toISOString() },
          { id: 'chunk-ac-5', document_id: doc.id, chunk_index: 4, chunk_text: `Section 5: Password Complexity. Passwords must be at least 12 characters long, containing uppercase, lowercase, numbers, and special characters. Password rotation is recommended every 180 days.`, section_title: 'Section 5: Password Complexity', page_number: 2, token_count: 35, created_at: new Date().toISOString() }
        );
      }
      if (doc.id === '00000000-0000-0000-0000-000000000002') {
        allChunks.push(
          { id: 'chunk-bd-1', document_id: doc.id, chunk_index: 0, chunk_text: `Section 1: Business Continuity Plan. ScaleFlow is committed to maintaining operations during disruptions. The Critical Crisis Management Team (CMT) is responsible for declaring a disaster and executing recovery procedures.`, section_title: 'Section 1: Business Continuity Plan', page_number: 1, token_count: 45, created_at: new Date().toISOString() },
          { id: 'chunk-bd-2', document_id: doc.id, chunk_index: 1, chunk_text: `Section 2: Disaster Recovery Targets. The Recovery Time Objective (RTO) is defined as less than 4 hours for production databases and customer tracking ingestion services. The Recovery Point Objective (RPO) is defined as less than 1 hour, meaning no more than 1 hour of customer transactional data can be lost in a failover event.`, section_title: 'Section 2: Disaster Recovery Targets', page_number: 1, token_count: 65, created_at: new Date().toISOString() },
          { id: 'chunk-bd-3', document_id: doc.id, chunk_index: 2, chunk_text: `Section 3: Data Backup Schedule. Full database backups are performed weekly. Incremental backups are executed daily. Backups are stored in an encrypted offsite location with geographic redundancy.`, section_title: 'Section 3: Data Backup Schedule', page_number: 1, token_count: 40, created_at: new Date().toISOString() },
          { id: 'chunk-bd-4', document_id: doc.id, chunk_index: 3, chunk_text: `Section 4: Disaster Recovery Testing. Annual tabletop exercises and simulation tests must be conducted by the DevOps and Security teams. The results of the annual DR test must be reported to the Board of Directors.`, section_title: 'Section 4: Disaster Recovery Testing', page_number: 2, token_count: 45, created_at: new Date().toISOString() },
          { id: 'chunk-bd-5', document_id: doc.id, chunk_index: 5, chunk_text: `Section 5: Crisis Communications. In the event of a critical service outage, customer success must notify key enterprise tenants within 2 hours. A public status page will be maintained and updated every 30 minutes.`, section_title: 'Section 5: Crisis Communications', page_number: 2, token_count: 50, created_at: new Date().toISOString() }
        );
      }
      if (doc.id === '00000000-0000-0000-0000-000000000003') {
        allChunks.push(
          { id: 'chunk-pr-1', document_id: doc.id, chunk_index: 0, chunk_text: `Section 1: Personal Data Collection. ScaleFlow processes customer event tracking data, user identifiers, email addresses, and IP addresses. We strictly collect only personal data necessary for attribution services, aligning with the data minimization principle.`, section_title: 'Section 1: Personal Data Collection', page_number: 1, token_count: 50, created_at: new Date().toISOString() },
          { id: 'chunk-pr-2', document_id: doc.id, chunk_index: 1, chunk_text: `Section 2: Consent Management. Explicit consent must be obtained from users prior to tracking or processing their PII. Users have the right to withdraw consent at any time.`, section_title: 'Section 2: Consent Management', page_number: 1, token_count: 35, created_at: new Date().toISOString() },
          { id: 'chunk-pr-3', document_id: doc.id, chunk_index: 2, chunk_text: `Section 3: User Rights. Under GDPR and DPDP, users have the right of access, right of rectification, and right of erasure (the right to be forgotten). ScaleFlow will process erasure requests within 30 days of receipt.`, section_title: 'Section 3: User Rights', page_number: 1, token_count: 55, created_at: new Date().toISOString() },
          { id: 'chunk-pr-4', document_id: doc.id, chunk_index: 3, chunk_text: `Section 4: Data Breach Notification. In the event of a confirmed personal data breach, ScaleFlow will notify the regulatory authorities and affected data subjects within 72 hours of detection, detailing the nature of the breach and mitigation steps.`, section_title: 'Section 4: Data Breach Notification', page_number: 2, token_count: 55, created_at: new Date().toISOString() },
          { id: 'chunk-pr-5', document_id: doc.id, chunk_index: 4, chunk_text: `Section 5: Data Protection Officer. The DPO is responsible for oversight of privacy impact assessments (PIAs) and ensuring continuous compliance across all engineering and customer-facing teams.`, section_title: 'Section 5: Data Protection Officer', page_number: 2, token_count: 45, created_at: new Date().toISOString() }
        );
      }
    });

    localStorage.setItem(STORAGE_KEYS.POLICY_CHUNKS, JSON.stringify(allChunks));
    localStorage.setItem(STORAGE_KEYS.POLICY_SEEDED, 'true');
  }

  // --- POLICY DOCUMENTS CRUD ---

  static async getPolicyDocuments() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('policy_documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          title: d.title,
          document_type: d.document_type,
          framework_tags: d.framework_tags || [],
          file_name: d.file_name,
          file_url: d.file_url,
          mime_type: d.mime_type,
          uploaded_by: d.uploaded_by,
          status: d.status,
          extracted_text: d.extracted_text,
          summary: d.summary,
          created_at: d.created_at,
          updated_at: d.updated_at
        }));
      } catch (e) {
        console.error('Supabase getPolicyDocuments failed, falling back to local:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.POLICY_DOCUMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async savePolicyDocument(doc) {
    if (isCloudMode) {
      try {
        const orgId = await this.getActiveOrgId();
        const dbDoc = {
          id: doc.id,
          organization_id: orgId,
          title: doc.title,
          document_type: doc.document_type,
          framework_tags: doc.framework_tags || [],
          file_name: doc.file_name,
          file_url: doc.file_url,
          mime_type: doc.mime_type,
          uploaded_by: doc.uploaded_by,
          status: doc.status,
          extracted_text: doc.extracted_text,
          summary: doc.summary,
          created_at: doc.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { error } = await supabaseClient.from('policy_documents').upsert(dbDoc);
        if (error) throw error;
        return doc;
      } catch (e) {
        console.error('Supabase savePolicyDocument failed, falling back to local:', e);
      }
    }
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICY_DOCUMENTS) || '[]');
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx > -1) {
      docs[idx] = { ...docs[idx], ...doc, updated_at: new Date().toISOString() };
    } else {
      docs.push({ ...doc, created_at: doc.created_at || new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.POLICY_DOCUMENTS, JSON.stringify(docs));
    return doc;
  }

  static async deletePolicyDocument(id) {
    if (isCloudMode) {
      try {
        const { error } = await supabaseClient.from('policy_documents').delete().eq('id', id);
        if (error) throw error;
        // Also delete from document_vault
        await supabaseClient.from('document_vault').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase deletePolicyDocument failed, falling back to local:', e);
      }
    }
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICY_DOCUMENTS) || '[]');
    const remaining = docs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.POLICY_DOCUMENTS, JSON.stringify(remaining));

    const chunks = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICY_CHUNKS) || '[]');
    const remainingChunks = chunks.filter(c => c.document_id !== id);
    localStorage.setItem(STORAGE_KEYS.POLICY_CHUNKS, JSON.stringify(remainingChunks));

    // Also delete from document_vault
    const vault = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_VAULT) || '[]');
    const remainingVault = vault.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_VAULT, JSON.stringify(remainingVault));

    return true;
  }

  // --- POLICY CHUNKS ---

  static async getPolicyChunks(documentId = null) {
    if (isCloudMode) {
      try {
        let query = supabaseClient.from('policy_document_chunks').select('*');
        if (documentId) {
          query = query.eq('document_id', documentId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data.map(c => ({
          id: c.id,
          document_id: c.document_id,
          chunk_index: c.chunk_index,
          chunk_text: c.chunk_text,
          section_title: c.section_title,
          page_number: c.page_number,
          token_count: c.token_count,
          created_at: c.created_at
        }));
      } catch (e) {
        console.error('Supabase getPolicyChunks failed, falling back to local:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.POLICY_CHUNKS);
    const parsed = data ? JSON.parse(data) : [];
    if (documentId) {
      return parsed.filter(c => c.document_id === documentId);
    }
    return parsed;
  }

  static async savePolicyChunks(chunks) {
    if (isCloudMode) {
      try {
        const orgId = await this.getActiveOrgId();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const dbChunks = chunks.map(c => {
          const row = {
            document_id: c.document_id,
            organization_id: orgId,
            chunk_index: c.chunk_index,
            chunk_text: c.chunk_text,
            section_title: c.section_title,
            page_number: c.page_number,
            token_count: c.token_count
          };
          if (c.id && uuidRegex.test(c.id)) {
            row.id = c.id;
          }
          return row;
        });
        const { error } = await supabaseClient.from('policy_document_chunks').insert(dbChunks);
        if (error) throw error;
        return chunks;
      } catch (e) {
        console.error('Supabase savePolicyChunks failed, falling back to local:', e);
      }
    }
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICY_CHUNKS) || '[]');
    const newChunks = chunks.map(c => ({
      ...c,
      id: c.id || `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString()
    }));
    localStorage.setItem(STORAGE_KEYS.POLICY_CHUNKS, JSON.stringify([...existing, ...newChunks]));
    return newChunks;
  }

  // --- POLICY QUESTIONS ---

  static async getPolicyQuestions() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('policy_questions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(q => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          cited_chunks: q.cited_chunks || [],
          confidence: q.confidence,
          created_at: q.created_at
        }));
      } catch (e) {
        console.error('Supabase getPolicyQuestions failed, falling back to local:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.POLICY_QUESTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async savePolicyQuestion(q) {
    if (isCloudMode) {
      try {
        const orgId = await this.getActiveOrgId();
        const dbQ = {
          id: q.id || undefined,
          organization_id: orgId,
          question: q.question,
          answer: q.answer,
          cited_chunks: q.cited_chunks || [],
          confidence: q.confidence
        };
        const { error } = await supabaseClient.from('policy_questions').insert(dbQ);
        if (error) throw error;
        return q;
      } catch (e) {
        console.error('Supabase savePolicyQuestion failed, falling back to local:', e);
      }
    }
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICY_QUESTIONS) || '[]');
    const newQ = {
      ...q,
      id: q.id || `q-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    questions.push(newQ);
    localStorage.setItem(STORAGE_KEYS.POLICY_QUESTIONS, JSON.stringify(questions));
    return newQ;
  }

  // --- KEYWORD RETRIEVAL ---

  static async retrieveRelevantChunks(query, documentIds = null, limit = 4) {
    return this.retrieveRelevantChunksKeyword(query, documentIds, limit);
  }

  static async retrieveRelevantChunksKeyword(query, documentIds = null, limit = 4) {
    let allChunks = await this.getPolicyChunks();
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      allChunks = allChunks.filter(c => documentIds.includes(c.document_id));
    }
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (queryWords.length === 0) {
      const fallback = allChunks.slice(0, limit);
      fallback.forEach(c => { c.score = 0; });
      return fallback;
    }
    
    const scored = allChunks.map(chunk => {
      const text = chunk.chunk_text.toLowerCase();
      let score = 0;
      
      queryWords.forEach(word => {
        const regex = new RegExp('\\b' + word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'g');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length * 2.0;
        }
        if (text.includes(word)) {
          score += 0.5;
        }
      });
      
      return { chunk, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    // Attach score to each chunk object
    scored.forEach(s => {
      s.chunk.score = s.score;
    });
    
    const top = scored.filter(s => s.score > 0).map(s => s.chunk);
    
    if (top.length === 0) {
      const fallback = allChunks.slice(0, limit);
      fallback.forEach(c => { c.score = 0; });
      return fallback;
    }
    
    return top.slice(0, limit);
  }
}
