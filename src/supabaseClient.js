import { createClient } from '@supabase/supabase-js';

// ==========================================
// PASTE YOUR SUPABASE CREDENTIALS HERE:
// ==========================================
const SUPABASE_URL = "https://xopkmrurijeyfotjkrfq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_eQK893ZYF2hIvrDhc6qemQ_hqfVsA4N";
// ==========================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
