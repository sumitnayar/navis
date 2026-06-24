// Claude Service - Thin client wrapper for /api routes
// Connects to server-side endpoints to execute Anthropic AI models.
// NEVER store or expose Anthropic API keys in the frontend.

export class ClaudeService {
  /**
   * Helper to make secure backend API calls.
   * Ensures that if the API call fails, we throw an honest error without fallback simulations.
   */
  static async _callBackend(endpoint, payload) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errBody = await response.json();
          if (errBody && errBody.error) errorMsg = errBody.error;
        } catch (e) {
          // Ignore json parse error if the response wasn't JSON
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error(`ClaudeService Error [${endpoint}]:`, error);
      throw error; // Re-throw to ensure honest error state
    }
  }

  /**
   * Generates a complete policy document via multi-agent pipeline.
   * Endpoint: /api/policy/generate
   */
  static async generatePolicy(intakeData, orgContext, ragChunks) {
    const payload = {
      intakeData,
      orgContext,
      ragChunks
    };
    return this._callBackend('/api/policy/generate', payload);
  }

  /**
   * Simulates a scenario against a policy.
   * Endpoint: /api/policy/simulate
   */
  static async simulateScenario(policyId, scenarioType) {
    const payload = { policyId, scenarioType };
    return this._callBackend('/api/policy/simulate', payload);
  }

  /**
   * Generates a Coverage Score for a specific domain based on Layer 0 data.
   * Endpoint: /api/governance/coverage
   */
  static async getCoverageScore(domainData, orgId) {
    const payload = { domainData, organizationId: orgId };
    return this._callBackend('/api/governance/coverage', payload);
  }

  /**
   * Generates contextual gap recommendations based on domain data and org config.
   * Endpoint: /api/governance/gaps
   */
  static async getGaps(domainData, orgId) {
    const payload = { domainData, organizationId: orgId };
    return this._callBackend('/api/governance/gaps', payload);
  }

  /**
   * Generates future-state governance recommendations.
   * Endpoint: /api/governance/future
   */
  static async getFutureRecommendations(currentState, orgTrajectory, recentChanges) {
    const payload = { currentState, orgTrajectory, recentChanges };
    return this._callBackend('/api/governance/future', payload);
  }
}
