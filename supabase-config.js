const SUPABASE_URL = "https://kqypidctajadqwmdcash.supabase.co";
const SUPABASE_KEY = "sb_publishable_fXOBoK_Udnl4yOuswW0xlQ_YwIFil0g";

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
