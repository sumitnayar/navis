export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { skeleton, orgContext, ragChunks } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Policy generation failed: Claude API unavailable. Please try again.' });
    }

    const systemPrompt = `You are a governance writer producing board-ready policy content. Tone: authoritative, precise, unambiguous. Use "shall" and "must" for obligations. Use actual names, titles, system names, and process references from the organisational context. Do not produce generic policy text that could apply to any organisation. Respond in clear markdown format.`;
    
    const userPrompt = `
      Write a full policy based on the following skeleton:
      ${JSON.stringify(skeleton, null, 2)}
      
      Organizational Context:
      ${JSON.stringify(orgContext, null, 2)}
      
      Relevant Documents (RAG):
      ${JSON.stringify(ragChunks, null, 2)}
      
      Produce the full policy draft in markdown, section by section.
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
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const draft = data.content[0].text;
    
    return res.status(200).json({ draft });

  } catch (error) {
    console.error('Content Agent Error:', error);
    return res.status(500).json({ error: 'Policy generation failed: Content generation encountered an issue. Please try again.' });
  }
}
