const SUPABASE_URL = "https://ksyakrcgqzsupuqyusyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_OLGPIepJQoFBoEoL7jyvSA_9GC5hSgD";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
