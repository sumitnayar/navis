export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { draft, orgContext } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Policy generation failed: Claude API unavailable. Please try again.' });
    }

    const systemPrompt = `You are a compliance reviewer. Review this policy draft against the applicable regulations and controls provided. Identify: missing ownership statements, missing escalation timelines, regulatory gaps, ambiguous language, unrealistic requirements, contradictions between sections. Be specific. Reference section numbers.
    
    You must respond strictly in JSON format matching this schema:
    {
      "weaknesses_found": number,
      "items": [
        {
          "severity": "High" | "Medium" | "Low",
          "section": "Section reference",
          "issue": "Description of the issue",
          "recommendation": "Actionable recommendation to fix the issue"
        }
      ]
    }`;
    
    const userPrompt = `
      Review this policy draft:
      ${draft}
      
      Organizational Context & Regulations:
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
    let reportText = data.content[0].text;
    
    // Extract JSON block if surrounded by markdown
    const jsonMatch = reportText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) reportText = jsonMatch[1];
    
    const challengeReport = JSON.parse(reportText);
    
    return res.status(200).json({ challengeReport });

  } catch (error) {
    console.error('Compliance Agent Error:', error);
    return res.status(500).json({ error: 'Policy generation failed: Compliance review encountered an issue. Please try again.' });
  }
}
