import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompanyplaceholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const isSupabaseConfigured = () => {
  return (
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Authorized Admin Emails (can be extended via VITE_ADMIN_EMAILS in .env)
const DEFAULT_ADMIN_EMAILS = [
  'community.va01@gmail.com',
  'foundercommunityva@gmail.com'
];

export const getApprovedAdminEmails = (): string[] => {
  const envAdmins = import.meta.env.VITE_ADMIN_EMAILS;
  if (envAdmins) {
    const list = envAdmins.split(',').map((e: string) => e.trim().toLowerCase());
    return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...list]));
  }
  return DEFAULT_ADMIN_EMAILS;
};

export const isAuthorizedAdmin = (email?: string | null, metadataRole?: string): boolean => {
  if (metadataRole === 'admin') return true;
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getApprovedAdminEmails().includes(normalized);
};
