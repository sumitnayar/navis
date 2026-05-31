const supabaseUrl = window.ENV?.SUPABASE_URL || '';
const supabaseKey = window.ENV?.SUPABASE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== '__SUPABASE_URL__' &&
  supabaseKey !== '__SUPABASE_KEY__' &&
  window.supabase
);

export const supabaseClient = isSupabaseConfigured
  ? window.supabase.createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;
