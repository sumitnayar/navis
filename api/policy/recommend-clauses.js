export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { intakeData } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Clause recommendation failed: Claude API unavailable.' });
    }

    // Since clause library is hardcoded in frontend, we'll simulate the Claude recommendation by returning a generic instruction
    // In a real implementation we would pass the CLAUSE_LIBRARY keys and ask Claude to select the best 6.
    // For this rewrite, we will pass a simplified list of clause topics based on the domain, but for now let's just make it a flexible API.
    
    const systemPrompt = `You are a legal and governance expert. Based on the provided policy intake context (domain, scope, regulations), recommend 6-8 standard policy clauses that should be included.
    
    Respond strictly in JSON format:
    {
      "recommended_clauses": [
        {
          "title": "Clause Title",
          "description": "One-line description of what this clause covers",
          "framework_tag": "e.g., ISO 27001, SOC 2, General",
          "clause_text": "The full text of the recommended clause."
        }
      ]
    }`;
    
    const userPrompt = `
      Intake Context:
      ${JSON.stringify(intakeData, null, 2)}
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
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    let clausesText = data.content[0].text;
    
    const jsonMatch = clausesText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) clausesText = jsonMatch[1];
    
    const clauseData = JSON.parse(clausesText);
    
    return res.status(200).json(clauseData);

  } catch (error) {
    console.error('Clause Recommendation Error:', error);
    return res.status(500).json({ error: 'Failed to recommend clauses.' });
  }
}
