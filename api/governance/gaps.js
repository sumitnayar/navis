// POST /api/governance/gaps
// Calls Claude to identify governance gaps based on current domain data AND organizational trajectory/config.
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
    return res.status(500).json({ error: 'Gap analysis unavailable. Retry.' });
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
You are the Navis Governance AI. Your task is to identify critical governance gaps by cross-referencing the organization's current domain state against its organizational trajectory and config signals.

Organizational Trajectory & Config Signals:
${JSON.stringify(orgContext.config || {}, null, 2)}

Organisational Identity (CRITICAL CONTEXT):
${JSON.stringify(orgContext.identity || {}, null, 2)}

Current Domain State:
${JSON.stringify(domainData, null, 2)}

INSTRUCTIONS:
You MUST reason about the organizational trajectory and identity. For example, if remote work % is high, expect remote security policies. If the organization is a 'Dual Role' or 'Processor' for client data, expect specific vendor management, sub-processor lists, and data processing agreements. If serving US customers, expect specific privacy regulations.
Provide your response EXACTLY as a raw JSON array of objects with no markdown formatting or text outside the JSON.
Each object in the array must follow this structure:
{
  "policy_name": "Name of the missing or deficient policy",
  "domain": "The relevant domain name",
  "reason": "Specific explanation linking the gap to the org config and identity signals (e.g. 'You act as a Processor for client Behavioural Data... No sub-processor policy exists.')",
  "risk_addressed": "Description of the risk if unmitigated",
  "regulatory_relevance": ["Array", "of", "regulations"],
  "priority": "Critical" | "High" | "Medium" | "Low"
}
Sort the array by priority (Critical first, then High, Medium, Low).
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
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    let jsonContent = data.content?.[0]?.text;
    
    // Strip markdown blocks
    if (jsonContent.startsWith('\`\`\`json')) {
      jsonContent = jsonContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonContent.startsWith('\`\`\`')) {
      jsonContent = jsonContent.replace(/\`\`\`/g, '').trim();
    }

    return res.status(200).json({
      gaps: JSON.parse(jsonContent),
      warning: warning
    });
  } catch (error) {
    console.error("Gap Analysis API Error:", error);
    return res.status(500).json({ error: 'Gap analysis unavailable. Retry.' });
  }
};
