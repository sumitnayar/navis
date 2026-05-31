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

const STORAGE_KEYS = {
  RISKS: 'navis_v3_risks',
  TEMPLATES: 'navis_v3_templates',
  SETTINGS: 'navis_v3_settings',
  OBJECTIVES: 'navis_v3_objectives',
  SCENARIOS: 'navis_v3_scenarios',
  CULTURE: 'navis_v3_culture',
  TRENDS: 'navis_v3_trends',
  SEEDED: 'navis_v3_seeded_flag_v3'
};

// ------------------------------------------
// 1. SUPABASE CLIENT DUAL-MODE INITIALIZATION
// ------------------------------------------
let supabaseClient = null;
const supabaseUrl = window.ENV?.SUPABASE_URL || '';
const supabaseKey = window.ENV?.SUPABASE_KEY || '';

const isSupabaseActive = (
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== '__SUPABASE_URL__' && 
  supabaseKey !== '__SUPABASE_KEY__'
);

if (isSupabaseActive) {
  try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("NAVIS Cloud Demo Active: Connected to Supabase Cluster ebevtxhjngoxvrgprqyk.");
  } catch (e) {
    console.error("Failed to initialize Supabase client, falling back to Local Demo Mode:", e);
  }
}

export class StorageService {
  static init() {
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.resetToDefaults();
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
      activeUserRole: 'CRO (Chief Risk Officer)'
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }

  // --- RISKS CRUD WITH AUTOMATIC CONVERSION ---

  static async getRisks() {
    this.init();

    // A. CLOUD DEMO / SAAS PRODUCTION MODE (Supabase fetch with joins)
    if (supabaseClient) {
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
            risk_relationships(child_id, relation_type)
          `);

        if (error) throw error;

        return data.map(r => ({
          id: r.id,
          title: r.title,
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
          timeToImpact: r.time_to_impact,
          timeToDetection: r.time_to_detection,
          timeToRecovery: r.time_to_recovery,
          parentRiskId: r.parent_risk_id,
          
          controls: r.controls || [],
          kris: r.kris || [],
          actions: r.actions || [],
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
    return data ? JSON.parse(data) : [];
  }

  static async getRiskById(id) {
    const risks = await this.getRisks();
    return risks.find(r => r.id === id) || null;
  }

  static async saveRisk(risk, userComment = "Updated risk metrics") {
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
    if (supabaseClient) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges. Writes are blocked at the database layer (RLS).");
          return risk;
        }

        const dbRisk = {
          id: risk.id,
          organization_id: '00000000-0000-0000-0000-000000000000', // default Demo Tenant Organization UUID
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
          parent_risk_id: risk.parentRiskId || null
        };

        const { error } = await supabaseClient.from('risks').upsert(dbRisk);
        if (error) throw error;

        // Save normalized sub-tables
        if (risk.fragility) {
          await supabaseClient.from('risk_fragilities').upsert({
            risk_id: risk.id,
            organization_id: '00000000-0000-0000-0000-000000000000',
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
            organization_id: '00000000-0000-0000-0000-000000000000',
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
              organization_id: '00000000-0000-0000-0000-000000000000'
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
    if (supabaseClient) {
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
    if (supabaseClient) {
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
    if (supabaseClient) {
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

    if (supabaseClient) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return objective;
        }

        const dbObj = {
          id: objective.id,
          organization_id: '00000000-0000-0000-0000-000000000000',
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
    if (supabaseClient) {
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
    if (supabaseClient) {
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

    if (supabaseClient) {
      try {
        if (settings.activeUserRole && settings.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return metrics;
        }

        const dbCulture = {
          organization_id: '00000000-0000-0000-0000-000000000000',
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
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 'default_config');
        if (error) throw error;
        if (data.length > 0) {
          const s = data[0];
          
          // Fetch locations and BUs in parallel
          const buData = await supabaseClient.from('settings_business_units').select('unit_name');
          const locData = await supabaseClient.from('settings_locations').select('location_name');

          return {
            brandName: s.brand_name,
            companyName: s.company_name,
            revenueBracket: s.revenue_bracket,
            ipoTimeline: s.ipo_timeline,
            soc2Status: s.soc2_status,
            businessUnits: buData.data ? buData.data.map(bu => bu.unit_name) : [],
            locations: locData.data ? locData.data.map(loc => loc.location_name) : [],
            activeUserRole: s.active_user_role
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
    return parsed;
  }

  static async saveSettings(settings) {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    if (supabaseClient) {
      try {
        if (current.activeUserRole && current.activeUserRole.includes('Viewer')) {
          alert("Supabase Security Alert: Reviewer accounts hold read-only privileges.");
          return updated;
        }

        const dbSettings = {
          id: 'default_config',
          organization_id: '00000000-0000-0000-0000-000000000000',
          brand_name: updated.brandName,
          company_name: updated.companyName,
          revenue_bracket: updated.revenueBracket,
          ipo_timeline: updated.ipoTimeline,
          soc2_status: updated.soc2Status || 'SOC 2 Type II Certified',
          active_user_role: updated.activeUserRole
        };

        const { error } = await supabaseClient.from('settings').upsert(dbSettings);
        if (error) throw error;
        
        // Sync BUs and Locations if they changed
        if (settings.businessUnits) {
          await supabaseClient.from('settings_business_units').delete().eq('settings_id', 'default_config');
          for (const bu of settings.businessUnits) {
            await supabaseClient.from('settings_business_units').insert({
              settings_id: 'default_config',
              organization_id: '00000000-0000-0000-0000-000000000000',
              unit_name: bu
            });
          }
        }

        return updated;
      } catch (err) {
        alert(`Supabase RLS Violation: Writing denied. (${err.message})`);
        throw err;
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
}
