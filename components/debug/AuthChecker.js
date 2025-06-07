'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function AuthChecker() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      
      // Set up auth listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event);
          setSession(newSession);
        }
      );
      
      return () => {
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    }
    
    checkSession();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-md shadow-lg z-50 text-sm">
      <div>
        {loading ? (
          'Checking auth...'
        ) : session ? (
          <span className="text-green-400">✓ Authenticated</span>
        ) : (
          <span className="text-red-400">✗ Not authenticated</span>
        )}
      </div>
    </div>
  );
}
