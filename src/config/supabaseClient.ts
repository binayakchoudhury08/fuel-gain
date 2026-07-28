import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://asgwmtxwwjyycmdxwqgt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ3dtdHh3d2p5eWNtZHh3cWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjA2OTUsImV4cCI6MjEwMDczNjY5NX0.Tt-iHsSWGwDO-n7oyK9FLiF7DfsuiuBxOzRSzLIp230';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'FuelGainTracker-Android',
    },
  },
});

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `Supabase Connection Warning: ${error.message}` };
    }
    return {
      success: true,
      message: `Successfully connected to Supabase database project (${SUPABASE_URL})!`,
    };
  } catch (err: any) {
    return { success: false, message: `Supabase Connection Error: ${err.message || err}` };
  }
}
