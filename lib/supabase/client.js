import { createClient } from '@supabase/supabase-js';

// Check if we're in the browser or server environment
const isBrowser = typeof window !== 'undefined';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isBrowser ? window.env?.SUPABASE_URL : null);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isBrowser ? window.env?.SUPABASE_ANON_KEY : null);

// Log initialization info (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase initialization:', { 
    url: supabaseUrl ? 'Set' : 'Not set', 
    key: supabaseAnonKey ? 'Set' : 'Not set'
  });
}

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  if (isBrowser) {
    console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.');
  }
}

// Initialize Supabase client
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  debug: process.env.NODE_ENV === 'development'
};

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', supabaseOptions);

// Add debugging interceptor for development
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'User is authenticated' : 'No user');
  });
}

// Provide a way to check connection in development
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    return { connected: !error, error: error?.message };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};
