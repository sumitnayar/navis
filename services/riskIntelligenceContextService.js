// Risk Intelligence Context Builder Service v0.1 for NAVIS / RiskOS
// Dynamically builds a unified risk graph context and computes network intelligence metrics.

import { StorageService } from './storageService.js';

export class RiskIntelligenceContextService {
  static async buildContext() {
    try {
      // 1. Fetch authenticated organization data from Storage Service
      const settings = await StorageService.getSettings();
      const risks = await StorageService.getRisks();
      const trendLogs = await StorageService.getTrendLogs();

      // If we have no risks, return a clean empty structure with default details
      if (!risks || risks.length === 0) {
        return {
          organization: settings,
          riskNodes: [],
          riskEdges: [],
          controls: [],
          actions: [],
          kris: [],
          trendSignals: trendLogs || [],
          computedMetrics: {
            influenceScores: {},
            topInfluenceRisks: [],
            fragileRisks: [],
            staleReviews: [],
            overdueActions: [],
            staleControls: [],
            openHighRiskCount: 0,
            relationshipDensity: 0,
            boardPriorityRisks: [],
            postureSummary: "No active risks registered; organizational posture is unrated."
          }
        };
      }

      // 2. Map risk nodes
      const riskNodes = risks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        l1: r.l1 || r.category,
        l2: r.l2 || 'General',
        l3: r.l3 || 'Other',
        description: r.description,
        owner: r.owner,
        businessUnit: r.businessUnit,
        location: r.location,
        likelihoodResidual: r.likelihoodResidual,
        impactResidual: r.impactResidual,
        residualScore: r.residualScore,
        appetiteStatus: r.appetiteStatus,
        trend: r.trend,
        timeToImpact: r.timeToImpact,
        timeToDetection: r.timeToDetection,
        timeToRecovery: r.timeToRecovery
      }));

      // Gather sub-elements and construct structural edges
      const allControls = [];
      const allActions = [];
      const allKRIs = [];
      const riskEdges = [];

      risks.forEach(r => {
        // Collect Controls
        if (r.controls && Array.isArray(r.controls)) {
          r.controls.forEach(c => {
            allControls.push({
              ...c,
              riskId: r.id,
              riskTitle: r.title
            });
          });
        }

        // Collect Actions
        if (r.actions && Array.isArray(r.actions)) {
          r.actions.forEach(a => {
            allActions.push({
              ...a,
              riskId: r.id,
              riskTitle: r.title
            });
          });
        }

        // Collect KRIs
        if (r.kris && Array.isArray(r.kris)) {
          r.kris.forEach(k => {
            allKRIs.push({
              ...k,
              riskId: r.id,
              riskTitle: r.title
            });
          });
        }

        // Collect Edges from parent-child relationships
        if (r.childRiskIds && Array.isArray(r.childRiskIds)) {
          r.childRiskIds.forEach(cid => {
            riskEdges.push({
              source: r.id,
              target: cid,
              type: 'parent-child'
            });
          });
        }

        // Collect Edges from related relationships
        if (r.relatedRiskIds && Array.isArray(r.relatedRiskIds)) {
          r.relatedRiskIds.forEach(rid => {
            riskEdges.push({
              source: r.id,
              target: rid,
              type: 'related'
            });
          });
        }
      });

      // 3. Compute v0.1 metrics
      const now = new Date();

      // Metrics 3.1: Influence score by risk: (child links + related links) * residualScore
      const influenceScores = {};
      risks.forEach(r => {
        const childLinks = (r.childRiskIds && Array.isArray(r.childRiskIds)) ? r.childRiskIds.length : 0;
        const relatedLinks = (r.relatedRiskIds && Array.isArray(r.relatedRiskIds)) ? r.relatedRiskIds.length : 0;
        // Formula: (links) * residualScore
        influenceScores[r.id] = (childLinks + relatedLinks) * (r.residualScore || 1);
      });

      // Metrics 3.2: Top influence risks (sorted descending by influence score)
      const topInfluenceRisks = [...risks]
        .map(r => ({
          id: r.id,
          title: r.title,
          influenceScore: influenceScores[r.id],
          residualScore: r.residualScore
        }))
        .sort((a, b) => b.influenceScore - a.influenceScore);

      // Metrics 3.3: Overdue Actions: status !== 'Completed' && due_date < now
      const overdueActions = allActions.filter(a => {
        if (a.status === 'Completed' || !a.dueDate) return false;
        return new Date(a.dueDate) < now;
      });

      // Metrics 3.4: Fragility assessment (high impact / weak control gaps)
      // Standard Fragility: impactResidual >= 4 AND (weak controls OR overdue actions mapped to this risk)
      const fragileRisks = risks.map(r => {
        const highImpact = (r.impactResidual >= 4) || (r.residualScore >= 12);
        const weakControls = !r.controls || r.controls.length === 0 || r.controls.some(c => c.rating === 'Ineffective' || c.rating === 'Partially Effective');
        const hasOverdueActions = r.actions && r.actions.some(a => a.status !== 'Completed' && new Date(a.dueDate) < now);
        
        return {
          id: r.id,
          title: r.title,
          isFragile: highImpact && (weakControls || hasOverdueActions),
          highImpact,
          weakControls,
          hasOverdueActions
        };
      }).filter(fr => fr.isFragile);

      // Metrics 3.5: Stale reviews check (for Entropy assessment):
      // A risk has a stale review if its latest trend log is older than 30 days or if it has no trend logs.
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const staleReviews = risks.map(r => {
        const logs = trendLogs
          .filter(l => l.riskId === r.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
        const isStale = logs.length === 0 || new Date(logs[0].timestamp) < thirtyDaysAgo;
        return {
          id: r.id,
          title: r.title,
          isStale,
          lastReviewed: logs.length > 0 ? logs[0].timestamp : 'Never'
        };
      }).filter(sr => sr.isStale);

      // Metrics 3.6: Stale Controls (controls in risks with stale reviews or showing ineffectiveness)
      const staleControls = allControls.filter(c => {
        const riskStale = staleReviews.some(sr => sr.id === c.riskId);
        return riskStale || c.rating === 'Ineffective';
      });

      // Metrics 3.7: Open High-Risk Count (residualScore >= 12)
      const openHighRiskCount = risks.filter(r => r.residualScore >= 12).length;

      // Metrics 3.8: Relationship density (total edges / total risks)
      const relationshipDensity = risks.length > 0 ? riskEdges.length / risks.length : 0;

      // Metrics 3.9: Board priority risks (Above Appetite or high score)
      const boardPriorityRisks = risks.filter(r => r.appetiteStatus === 'Above Appetite' || r.residualScore >= 12);

      // Metrics 3.10: One-line Organizational Risk Posture summary (Caveat 5)
      const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
      let postureSummary = "";
      if (aboveAppetiteCount > 2 || openHighRiskCount > 3) {
        postureSummary = `Risk Posture is ELEVATED due to ${aboveAppetiteCount} active appetite breaches, ${openHighRiskCount} high-residual risks, and ${overdueActions.length} overdue mitigations requiring Board oversight.`;
      } else if (aboveAppetiteCount > 0 || openHighRiskCount > 0) {
        postureSummary = `Risk Posture is MODERATE with ${aboveAppetiteCount} appetite breaches and ${openHighRiskCount} high-residual risks within acceptable tolerance corridors.`;
      } else {
        postureSummary = `Risk Posture is STABLE with all critical operational and financial risks operating within approved appetite thresholds.`;
      }

      // Metrics 3.11: Fragility radar averages across active risks having fragility (scaled 1-5)
      let finSum = 0, peoSum = 0, cusSum = 0, techSum = 0, compSum = 0, opsSum = 0;
      let fragCount = 0;
      risks.forEach(r => {
        if (r.fragility && typeof r.fragility === 'object') {
          finSum += ((r.fragility.revenue || 1) + (r.fragility.valuation || 1)) / 2;
          peoSum += (r.fragility.people || 1);
          cusSum += (r.fragility.customerTrust || 1);
          techSum += (r.fragility.technology || 1);
          compSum += (r.fragility.reputation || 1);
          opsSum += ((r.fragility.operations || 1) + (r.fragility.growth || 1)) / 2;
          fragCount++;
        }
      });

      const radarMetrics = {
        financial: fragCount > 0 ? Number((finSum / fragCount).toFixed(2)) : 3.5,
        people: fragCount > 0 ? Number((peoSum / fragCount).toFixed(2)) : 3.2,
        customers: fragCount > 0 ? Number((cusSum / fragCount).toFixed(2)) : 4.0,
        technology: fragCount > 0 ? Number((techSum / fragCount).toFixed(2)) : 3.0,
        compliance: fragCount > 0 ? Number((compSum / fragCount).toFixed(2)) : 3.8,
        operations: fragCount > 0 ? Number((opsSum / fragCount).toFixed(2)) : 3.4
      };

      const deterioratingCount = risks.filter(r => r.trend === 'Deteriorating').length;

      return {
        organization: settings,
        riskNodes,
        riskEdges,
        controls: allControls,
        actions: allActions,
        kris: allKRIs,
        trendSignals: trendLogs,
        computedMetrics: {
          influenceScores,
          topInfluenceRisks,
          fragileRisks,
          staleReviews,
          overdueActions,
          staleControls,
          openHighRiskCount,
          relationshipDensity,
          boardPriorityRisks,
          postureSummary,
          radarMetrics,
          deterioratingCount
        }
      };
    } catch (error) {
      console.error("Failed to build Risk Intelligence Context Object:", error);
      throw error;
    }
  }
}
