import { createClient } from '@supabase/supabase-js';

// Check if we're in the browser or server environment
const isBrowser = typeof window !== 'undefined';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log initialization info (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase initialization:', { 
    url: supabaseUrl ? 'Set' : 'Not set', 
    key: supabaseAnonKey ? 'Set' : 'Not set'
  });
}

// Initialize Supabase client with safer approach
let supabase;

// Only create the client if we have the required credentials
if (supabaseUrl && supabaseAnonKey) {
  const supabaseOptions = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    debug: process.env.NODE_ENV === 'development'
  };
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
  
  // Add debugging interceptor for development
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User is authenticated' : 'No user');
    });
  }
} else {
  // Create a mock client for environments without proper credentials
  // This prevents crashes during builds or middleware execution
  const mockFunctionality = () => ({ 
    data: { session: null },
    error: new Error('Supabase credentials not configured')
  });
  
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: null, error: new Error('Supabase not configured') }),
      single: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
    auth: {
      getSession: async () => mockFunctionality(),
      signInWithPassword: async () => mockFunctionality(),
      signOut: async () => mockFunctionality(),
      onAuthStateChange: () => ({ data: null, unsubscribe: () => {} })
    }
  };
  
  // Log missing credentials warning but don't crash
  if (isBrowser && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Supabase credentials missing. Using mock client to prevent crashes.');
    console.warn('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local or Vercel environment variables.');
  }
}

export { supabase };

// Provide a way to check connection in development
export const checkSupabaseConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { connected: false, error: 'Supabase credentials not configured' };
  }
  
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    return { connected: !error, error: error?.message };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};
