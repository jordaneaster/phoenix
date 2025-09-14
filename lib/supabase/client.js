import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Proxy the 'from' method to remap 'profiles' -> 'users'
const originalFrom = _supabase.from.bind(_supabase);
_supabase.from = (table) => {
  if (table === 'profiles') table = 'users';
  return originalFrom(table);
};

export { _supabase as supabase };
