// GET /api/governance/map
// Retrieves Layer 0 structural data from Supabase and applies the server-side maturity rule engine.
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, org-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Governance data unavailable. Check your connection and retry.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const orgId = req.headers['org-id'] || '00000000-0000-0000-0000-000000000000';

  const FIXED_DOMAINS = [
    'Identity & Access', 'Third Party Risk', 'Data Privacy', 'HR & People',
    'Finance & Procurement', 'Operations', 'Business Continuity',
    'Compliance & Regulatory', 'Vendor Management', 'Information Security'
  ];

  try {
    // Parallel fetch of domain-related Layer 0 data
    const [policiesReq, controlsReq, krisReq, actionsReq, assuranceReq] = await Promise.all([
      supabase.from('policy_documents').select('id, title, status, domain, updated_at').eq('organization_id', orgId),
      supabase.from('controls').select('control_id, control_name, domain, implementation_status, owner_role_id').eq('organization_id', orgId),
      supabase.from('kris').select('kri_name, domain, status').eq('organization_id', orgId),
      supabase.from('risk_register').select('risk_name, risk_domain').eq('organization_id', orgId), // Mocking "open actions" via risks for now, or assume another table if actions existed. Wait, brief says "Open Actions", but we don't have an actions table in Phase 1 schema. We'll leave it empty for now.
      supabase.from('org_departments').select('name').eq('organization_id', orgId) // Just a dummy fetch to keep Promise array alive if needed
    ]);

    const policies = policiesReq.data || [];
    const controls = controlsReq.data || [];
    const kris = krisReq.data || [];

    const mapData = FIXED_DOMAINS.map(domainName => {
      const dPolicies = policies.filter(p => p.domain === domainName);
      const dControls = controls.filter(c => c.domain === domainName);
      const dKris = kris.filter(k => k.domain === domainName);

      const approvedPolicies = dPolicies.filter(p => p.status === 'Approved').length;
      const implementedControls = dControls.filter(c => c.implementation_status === 'Implemented' || c.implementation_status === 'Verified').length;
      const warningKris = dKris.filter(k => k.status === 'Warning' || k.status === 'Breach').length;

      let maturity = 'Critical Gap';

      // Maturity Rule Engine
      if (dPolicies.length === 0) {
        maturity = 'Critical Gap';
      } else if (dPolicies.length > 0 && dControls.some(c => c.implementation_status === 'Partial') && warningKris > 0) {
        maturity = 'Weak';
      } else if (approvedPolicies > 0 && implementedControls > 0 && !dControls.some(c => c.implementation_status === 'Verified')) {
        maturity = 'Moderate'; // Approved and implemented, but no verified evidence
      } else if (approvedPolicies > 0 && dControls.some(c => c.implementation_status === 'Verified')) {
        maturity = 'Strong';
      } else if (dPolicies.length > 0) {
        // Fallback for cases where policies exist but don't strictly match the specific upper rules
        maturity = 'Weak';
      }

      // Check if domain is completely empty (No Data)
      const hasData = dPolicies.length > 0 || dControls.length > 0 || dKris.length > 0;

      return {
        domain: domainName,
        hasData,
        maturity,
        metrics: {
          policiesTotal: dPolicies.length,
          policiesApproved: approvedPolicies,
          controlsTotal: dControls.length,
          controlsImplemented: implementedControls,
          kriAlerts: warningKris
        },
        nodes: {
          policies: dPolicies,
          controls: dControls,
          kris: dKris,
          openActions: [], // No layer 0 schema provided for this, returning empty array
          assurance: [],
          owner: dControls[0]?.owner_role_id || 'Unassigned' // Simplifying owner lookup for now
        }
      };
    });

    return res.status(200).json({ data: mapData });
  } catch (error) {
    console.error("Governance Map API Error:", error);
    return res.status(500).json({ error: 'Governance data unavailable. Check your connection and retry.' });
  }
};
