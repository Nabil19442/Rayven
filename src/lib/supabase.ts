/// <reference types="vite/client" />
import { supabase as sharedSupabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

const rawUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';

const rawKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || '';

const supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  sharedSupabase || (
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'MY_SUPABASE_URL' && 
    supabaseUrl.startsWith('https://')
  )
);

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

