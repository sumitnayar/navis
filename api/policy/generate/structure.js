export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { intakeData, orgContext, ragChunks } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Policy generation failed: Claude API unavailable. Please try again.' });
    }

    const systemPrompt = `You are a governance architect. Your job is to produce a policy skeleton — section headers, scope statement, definitions, ownership assignments — drawn from the organisational context provided. Use actual names and titles from the org data. Do not invent roles. Do not use placeholder text. Respond strictly in JSON format.`;
    
    const userPrompt = `
      Create a policy structure for the following intake context:
      ${JSON.stringify(intakeData, null, 2)}
      
      Organizational Context:
      ${JSON.stringify(orgContext, null, 2)}
      
      Relevant Documents (RAG):
      ${JSON.stringify(ragChunks, null, 2)}
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
    let skeletonText = data.content[0].text;
    
    // Extract JSON block if surrounded by markdown
    const jsonMatch = skeletonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) skeletonText = jsonMatch[1];
    
    const skeleton = JSON.parse(skeletonText);
    
    return res.status(200).json({ skeleton });

  } catch (error) {
    console.error('Structure Agent Error:', error);
    return res.status(500).json({ error: 'Policy generation failed: Structure generation encountered an issue. Please try again.' });
  }
}
