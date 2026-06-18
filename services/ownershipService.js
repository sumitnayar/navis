export class OwnershipService {
  /**
   * Generates distributed RACI instructions for prompts to prevent over-reliance on a single role.
   */
  static getRaciDistribution() {
    return `
### OWNERSHIP DISTRIBUTION (RACI)
Do not assign all responsibilities to a single role (e.g., DPO). Distribute ownership across the following roles:
- **Board of Directors**: Ultimate accountability (A), Approval of risk appetite.
- **CEO / Executive Committee**: Sponsorship (S), Strategic alignment.
- **COO**: Operational oversight (R), BCP activation.
- **CISO**: Security controls (R), Technical incident response.
- **DPO / Legal**: Regulatory compliance (R/C), Breach notification.
- **Engineering / IT**: Execution (R), Technical recovery.
- **Business Owners**: Departmental BIA completion (R).
`;
  }
}
