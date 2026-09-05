/// <reference types="vite/client" />
import { supabase as sharedSupabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

const rawUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';

const rawKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || '';

// Canonical verified credentials
const CANONICAL_URL = "https://xopkmrurijeyfotjkrfq.supabase.co";
const CANONICAL_KEY = "sb_publishable_eQK893ZYF2hIvrDhc6qemQ_hqfVsA4N";

// Fix known typo if present (mrru -> mruri)
const sanitizedUrl = rawUrl.trim().replace('xopkmrrujeyfotjkrfq', 'xopkmrurijeyfotjkrfq');
const supabaseUrl = (sanitizedUrl && sanitizedUrl.startsWith('https://')) ? sanitizedUrl : CANONICAL_URL;
const supabaseAnonKey = rawKey.trim() || CANONICAL_KEY;

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const isSupabaseConfigured = true;

export const supabase = sharedSupabase || (
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null
);

