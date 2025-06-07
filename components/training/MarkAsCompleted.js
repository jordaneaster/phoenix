'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MarkAsCompleted({ trainingId, userId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markAsCompleted = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('training_progress')
        .insert({
          user_id: userId,
          training_id: trainingId,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Training marked as completed');
      router.refresh();
    } catch (error) {
      console.error('Error marking training as completed:', error);
      toast.error('Failed to mark training as completed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={markAsCompleted}
      disabled={loading}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
    >
      <FiCheck className="mr-2 -ml-0.5 h-4 w-4" />
      {loading ? 'Marking...' : 'Mark as Completed'}
    </button>
  );
}
