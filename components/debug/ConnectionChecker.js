'use client';

import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '../../lib/supabase/client';
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

export default function ConnectionChecker() {
  const [status, setStatus] = useState({ checking: true, connected: false, error: null });

  useEffect(() => {
    const checkConnection = async () => {
      setStatus({ checking: true, connected: false, error: null });
      const result = await checkSupabaseConnection();
      setStatus({ checking: false, ...result });
    };

    checkConnection();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (status.checking) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-md shadow-lg z-50 text-sm flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>Checking Supabase connection...</span>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-md shadow-lg z-50 text-sm flex items-center space-x-2">
        <FiCheckCircle className="h-4 w-4" />
        <span>Connected to Supabase</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-md shadow-lg z-50 text-sm flex items-center space-x-2">
      <FiXCircle className="h-4 w-4" />
      <span>Supabase connection failed: {status.error}</span>
    </div>
  );
}
