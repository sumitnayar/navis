// Risk Intelligence Service — NAVIS V3
// Handles KRI Trajectory Forecasting, Register Staleness Detection, and Insight Persistence.

import { StorageService } from './storageService.js';
import { supabaseClient, isSupabaseConfigured } from './supabaseClient.js';

const isCloudMode = isSupabaseConfigured && supabaseClient;

const STORAGE_KEYS = {
  AI_INSIGHTS: 'navis_v3_ai_insights'
};

const severityOrder = {
  'Critical': 1,
  'Warning': 2,
  'Advisory': 3
};

export class RiskIntelligenceService {

  static async generateInsights(risks, kris) {
    const insights = [];

    // 1. KRI Trajectory Forecasting
    insights.push(...this.generateKRITrajectoryInsights(kris, risks));

    // 2. Register Staleness Detection
    insights.push(...this.generateStalenessInsights(risks));

    // Sort by severity: Critical first, then Warning, then Advisory
    insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Load existing insights from database/localStorage to preserve statuses
    const existingInsights = await this.loadInsights();
    const existingMap = new Map(existingInsights.map(i => [i.insight_text, i]));

    const mergedInsights = insights.map(insight => {
      const existing = existingMap.get(insight.insight_text);
      if (existing) {
        return {
          ...insight,
          id: existing.id,
          status: existing.status,
          acknowledged_at: existing.acknowledged_at,
          dismissed_at: existing.dismissed_at
        };
      }
      // Generate unique identifier
      insight.id = insight.id || `insight-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      insight.status = 'active';
      return insight;
    });

    // Dismissed insights are filtered out completely
    const activeInsights = mergedInsights.filter(i => i.status !== 'dismissed');

    // Save active insights
    await this.saveInsights(activeInsights);

    return activeInsights;
  }

  static generateKRITrajectoryInsights(kris, risks) {
    const insights = [];
    const today = new Date();

    // Gather all active KRIs
    const allKRIs = kris || (risks || []).flatMap(r => 
      (r.kris || []).map(k => ({ ...k, riskId: r.id, riskTitle: r.title, riskTrend: r.trend }))
    );

    const parseKRIValue = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const clean = val.toString().replace(/[^0-9.-]/g, '');
      return parseFloat(clean) || 0;
    };

    for (const kri of allKRIs) {
      if (kri.status === 'BREACHED') continue;

      const threshVal = parseKRIValue(kri.threshold);
      const currVal = parseKRIValue(kri.current);
      let velocity = 0;

      // Calculate velocity
      if (kri.history && Array.isArray(kri.history) && kri.history.length >= 2) {
        // Linear regression with history + current value
        const y = kri.history.map(v => parseKRIValue(v));
        y.push(currVal);
        const n = y.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const denominator = n * sumXX - sumX * sumX;
        velocity = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
      } else {
        // Simulated trend based on risk trend direction
        const trend = kri.riskTrend || 'Stable';
        if (trend === 'Deteriorating') {
          velocity = currVal * 0.05; // 5% increase per period
        } else if (trend === 'Improving') {
          velocity = currVal * -0.03; // 3% decrease per period
        } else {
          velocity = 0;
        }
      }

      // Project days to breach
      let daysToBreach = null;
      if (currVal < threshVal) {
        if (velocity <= 0) continue; // Moving away from upper threshold
        daysToBreach = (threshVal - currVal) / velocity;
      } else if (currVal > threshVal) {
        if (velocity >= 0) continue; // Moving away from lower threshold
        daysToBreach = (threshVal - currVal) / velocity;
      } else {
        continue; // Exactly equal, handled as skip/breached
      }

      if (daysToBreach === null || isNaN(daysToBreach) || !isFinite(daysToBreach)) continue;

      const roundedDays = Math.ceil(daysToBreach);
      let severity = '';
      let text = '';

      if (daysToBreach <= 7) {
        severity = 'Critical';
        text = `${kri.name} is projected to breach its threshold of ${kri.threshold} within ${roundedDays} days at current velocity.`;
      } else if (daysToBreach <= 21) {
        severity = 'Warning';
        text = `${kri.name} is tracking toward its threshold of ${kri.threshold}. Projected breach in approximately ${roundedDays} days.`;
      } else if (daysToBreach <= 45) {
        severity = 'Advisory';
        text = `${kri.name} shows early movement toward its threshold. Monitor closely over the next ${roundedDays} days.`;
      } else {
        continue;
      }

      insights.push({
        id: `kri-insight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        insight_type: 'KRI Trajectory',
        severity,
        insight_text: text,
        source_data: { riskId: kri.riskId, kriName: kri.name, daysToBreach: roundedDays },
        status: 'active'
      });
    }

    return insights;
  }

  static generateStalenessInsights(risks) {
    const insights = [];
    const today = new Date();

    const getDaysSinceReview = (r) => {
      const lastReviewedStr = r.last_reviewed_date || r.lastReviewedDate || r.created_at || new Date().toISOString();
      const lastReviewed = new Date(lastReviewedStr);
      return Math.ceil(Math.abs(today - lastReviewed) / 86400000);
    };

    const criticalStaleCount = risks.filter(r => r.appetiteStatus === 'Above Appetite' && getDaysSinceReview(r) > 14).length;
    const warningStaleCount = risks.filter(r => r.appetiteStatus === 'Above Appetite' && getDaysSinceReview(r) > 7).length;
    
    // Grouping calculations:
    // Stale risks over 30 days
    const staleOver30 = risks.filter(r => getDaysSinceReview(r) > 30);
    const staleOver30AboveAppetite = staleOver30.filter(r => r.appetiteStatus === 'Above Appetite');

    // Within-appetite risks stale over 60 days
    const staleOver60Within = risks.filter(r => r.appetiteStatus === 'Within Appetite' && getDaysSinceReview(r) > 60);

    // 1. Critical Staleness Insight
    if (criticalStaleCount > 0) {
      insights.push({
        id: `stale-crit-${Date.now()}`,
        insight_type: 'Register Staleness',
        severity: 'Critical',
        insight_text: `${criticalStaleCount} above-appetite risks have not been reviewed in over 14 days. Board governance requires active monitoring of risks above appetite.`,
        source_data: { filter: 'stale' },
        status: 'active'
      });
    }

    // 2. Warning Staleness Insight
    if (staleOver30.length > 0) {
      insights.push({
        id: `stale-warn-${Date.now()}`,
        insight_type: 'Register Staleness',
        severity: 'Warning',
        insight_text: `${staleOver30.length} risks have not been reviewed in over 30 days. ${staleOver30AboveAppetite.length} of these are above appetite. Stale governance on live risks is a board liability.`,
        source_data: { filter: 'stale' },
        status: 'active'
      });
    } else if (warningStaleCount > 0) {
      insights.push({
        id: `stale-warn-above-${Date.now()}`,
        insight_type: 'Register Staleness',
        severity: 'Warning',
        insight_text: `${warningStaleCount} above-appetite risks have not been reviewed in over 7 days. Escalation timelines are active.`,
        source_data: { filter: 'stale' },
        status: 'active'
      });
    }

    // 3. Advisory Staleness Insight
    if (staleOver60Within.length > 0) {
      insights.push({
        id: `stale-adv-${Date.now()}`,
        insight_type: 'Register Staleness',
        severity: 'Advisory',
        insight_text: `${staleOver60Within.length} within-appetite risks have not been reviewed in over 60 days. Stale risk registry records degrade board decision quality.`,
        source_data: { filter: 'stale' },
        status: 'active'
      });
    }

    return insights;
  }

  static async saveInsights(insights) {
    if (isCloudMode) {
      try {
        for (const ins of insights) {
          const isTempId = ins.id.startsWith('insight-') || ins.id.startsWith('kri-') || ins.id.startsWith('stale-');
          const dbInsight = {
            id: isTempId ? undefined : ins.id,
            insight_type: ins.insight_type,
            severity: ins.severity,
            insight_text: ins.insight_text,
            source_data: ins.source_data,
            status: ins.status || 'active',
            acknowledged_at: ins.acknowledged_at || null,
            dismissed_at: ins.dismissed_at || null
          };
          if (dbInsight.id === undefined) delete dbInsight.id;
          await supabaseClient.from('ai_insights').upsert(dbInsight);
        }
        return;
      } catch (e) {
        console.error('Supabase save insights failed, using localStorage:', e);
      }
    }
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
  }

  static async loadInsights() {
    if (isCloudMode) {
      try {
        const { data, error } = await supabaseClient
          .from('ai_insights')
          .select('*')
          .filter('status', 'neq', 'dismissed');
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          insight_type: d.insight_type,
          severity: d.severity,
          insight_text: d.insight_text,
          source_data: d.source_data,
          created_at: d.created_at,
          acknowledged_at: d.acknowledged_at,
          dismissed_at: d.dismissed_at,
          status: d.status
        }));
      } catch (e) {
        console.error('Supabase load insights failed, using localStorage:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
    return data ? JSON.parse(data) : [];
  }

  static async dismissInsight(id) {
    if (isCloudMode) {
      try {
        const { error } = await supabaseClient
          .from('ai_insights')
          .update({ status: 'dismissed', dismissed_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) return;
      } catch (e) {
        console.error('Supabase dismiss failed:', e);
      }
    }
    const insights = JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) || '[]');
    const idx = insights.findIndex(i => i.id === id);
    if (idx > -1) {
      insights[idx].status = 'dismissed';
      insights[idx].dismissed_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
    }
  }

  static async acknowledgeInsight(id) {
    if (isCloudMode) {
      try {
        const { error } = await supabaseClient
          .from('ai_insights')
          .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) return;
      } catch (e) {
        console.error('Supabase acknowledge failed:', e);
      }
    }
    const insights = JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) || '[]');
    const idx = insights.findIndex(i => i.id === id);
    if (idx > -1) {
      insights[idx].status = 'acknowledged';
      insights[idx].acknowledged_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
    }
  }
}
