import { createClient } from '@supabase/supabase-js';

// ==========================================
// PASTE YOUR SUPABASE CREDENTIALS HERE:
// ==========================================
const DEFAULT_URL = "https://xopkmrurijeyfotjkrfq.supabase.co";
const DEFAULT_KEY = "sb_publishable_eQK893ZYF2hIvrDhc6qemQ_hqfVsA4N";
// ==========================================

const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';
const envKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || '';

const sanitizedEnvUrl = envUrl.trim().replace('xopkmrrujeyfotjkrfq', 'xopkmrurijeyfotjkrfq');
const SUPABASE_URL = (sanitizedEnvUrl && sanitizedEnvUrl.startsWith('https://')) ? sanitizedEnvUrl : DEFAULT_URL;
const SUPABASE_PUBLIC_KEY = envKey.trim() || DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
