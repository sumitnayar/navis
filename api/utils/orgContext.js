const { createClient } = require('@supabase/supabase-js');

async function getFullOrgContext(organizationId) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing in server environment.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [configRes, identityRes, deptsRes, risksRes, regsRes] = await Promise.all([
    supabase.from('org_global_config').select('*').eq('organization_id', organizationId).single(),
    supabase.from('org_identity').select('*').eq('organization_id', organizationId).single(),
    supabase.from('org_departments').select('*, org_roles(*)').eq('organization_id', organizationId),
    supabase.from('risk_register').select('*').eq('organization_id', organizationId),
    supabase.from('regulations').select('*').eq('organization_id', organizationId)
  ]);

  return {
    config: configRes.data || null,
    identity: identityRes.data || null,
    departments: deptsRes.data || [],
    risks: risksRes.data || [],
    regulations: regsRes.data || []
  };
}

module.exports = { getFullOrgContext };
