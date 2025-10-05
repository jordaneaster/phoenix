import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const createSupabaseClient = () => {
  return createServerComponentClient({ cookies });
};

export const getSessionWithRetry = cache(async () => {
  const supabase = createSupabaseClient();
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        if (error.code === 'over_request_rate_limit' && retries < maxRetries - 1) {
          // Exponential backoff: wait 2^retries * 100ms before retrying
          const delay = Math.pow(2, retries) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          continue;
        }
        console.error('Auth session error:', error);
        return { session: null };
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get auth session:', error);
      return { session: null };
    }
  }
  
  return { session: null };
});
