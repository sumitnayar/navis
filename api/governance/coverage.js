// POST /api/governance/coverage
// Calls Claude to generate a Coverage Score reasoning block for a specific domain.
const { getFullOrgContext } = require('../utils/orgContext');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Coverage assessment unavailable. Retry.' });
  }

  const { domainData, organizationId } = req.body;
  if (!domainData || !organizationId) {
    return res.status(400).json({ error: 'Domain data and organizationId required.' });
  }

  try {
    const orgContext = await getFullOrgContext(organizationId);
    let warning = null;
    if (!orgContext.identity) {
      warning = "Organisational Identity not configured. Navis outputs will be generic until this is completed. Configure in Settings -> Organisational Identity.";
    }

    const prompt = `
You are the Navis Governance AI. Analyze the following domain structural data against the organizational trajectory and identity context, and determine its coverage score.

Organizational Trajectory & Config Signals:
${JSON.stringify(orgContext.config || {}, null, 2)}

Organisational Identity (CRITICAL CONTEXT):
${JSON.stringify(orgContext.identity || {}, null, 2)}

Domain: ${domainData.domain}
Policies: ${JSON.stringify(domainData.nodes.policies)}
Controls: ${JSON.stringify(domainData.nodes.controls)}
KRIs: ${JSON.stringify(domainData.nodes.kris)}

Provide your response EXACTLY as a raw JSON object with no markdown formatting or text outside the JSON.
The JSON must follow this structure:
{
  "maturity": "Critical Gap" | "Weak" | "Moderate" | "Strong",
  "reasoning": [
    "Array of strings explaining the assessment based strictly on the provided data and context."
  ],
  "top_recommendation": "A single highlighted action item."
}

Do not invent facts. Do not output percentages or numeric scores out of 10.
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    let jsonContent = data.content?.[0]?.text;
    
    // Safety fallback to strip potential markdown blocks from Claude's response
    if (jsonContent.startsWith('\`\`\`json')) {
      jsonContent = jsonContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonContent.startsWith('\`\`\`')) {
      jsonContent = jsonContent.replace(/\`\`\`/g, '').trim();
    }

    return res.status(200).json({
      coverage: JSON.parse(jsonContent),
      warning: warning
    });
  } catch (error) {
    console.error("Coverage Score API Error:", error);
    // Honest error state
    return res.status(500).json({ error: 'Coverage assessment unavailable. Retry.' });
  }
};
