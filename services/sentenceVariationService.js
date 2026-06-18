export class SentenceVariationService {
  /**
   * Provides instructions to Gemini to avoid repetitive, AI-sounding sentence structures.
   */
  static getLinguisticInstructions() {
    return `
### LINGUISTIC AND STRUCTURAL INSTRUCTIONS
- Avoid repetitive sentence openings (e.g., do not start every sentence with "The organization shall").
- Cycle among variations such as: "Management shall ensure...", "The organization maintains...", "Business units are responsible for...", "Senior leadership shall oversee...", "Critical functions must...", "Departments shall establish...".
- Maintain a highly professional, institutional, and consultant-grade tone (think Deloitte / KPMG deliverables).
- Avoid flowery language or "SaaS aesthetics" (e.g., "supercharge," "seamless," "robust"). Use precise governance terminology.
`;
  }
}
