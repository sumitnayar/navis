export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { policyText, scenarioType, orgContext } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Simulation failed: Claude API unavailable.' });
    }

    const systemPrompt = `You are a policy resilience simulator. Your job is to simulate a specific scenario against a policy document and identify gaps or successful mitigations based strictly on what is written in the policy. You must not assume anything that is not explicitly stated in the policy text.
    
    Respond in a structured JSON format representing a timeline of steps during the scenario.
    Schema:
    {
      "scenario": "Scenario Name and Context",
      "steps": [
        {
          "step_number": number,
          "event": "Description of what happens",
          "policy_response": "What the policy says to do (or notes if silent)",
          "status": "Pass" | "Gap",
          "issue": "Description of the issue (if Gap) or empty string",
          "gap": "Description of the gap implication (if Gap) or empty string"
        }
      ],
      "gaps_identified": number,
      "highest_risk_gap": "Description of the highest risk gap"
    }`;
    
    const userPrompt = `
      Simulate the following scenario against the policy draft.
      
      Scenario Type: ${scenarioType}
      
      Policy Text:
      ${policyText}
      
      Organizational Context:
      ${JSON.stringify(orgContext, null, 2)}
    `;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    let simulationText = data.content[0].text;
    
    const jsonMatch = simulationText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) simulationText = jsonMatch[1];
    
    const simulationReport = JSON.parse(simulationText);
    
    return res.status(200).json({ simulationReport });

  } catch (error) {
    console.error('Simulation Agent Error:', error);
    return res.status(500).json({ error: 'Simulation encountered an issue. Please try again.' });
  }
}
