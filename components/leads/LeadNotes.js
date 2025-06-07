'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LeadNotes({ leadId, userId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_notes')
          .select(`
            *,
            profiles:user_id (full_name)
          `)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
    
    // Set up real-time subscription for new notes
    const subscription = supabase
      .channel(`lead_notes:${leadId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'lead_notes',
        filter: `lead_id=eq.${leadId}`
      }, payload => {
        fetchNotes();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [leadId]);
  
  // Add new note
  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          user_id: userId,
          content: newNote
        });
      
      if (error) throw error;
      
      // Also update the lead's last_contact_at timestamp
      await supabase
        .from('leads')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', leadId);
      
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="text-center p-4">Loading notes...</div>;
  }
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="p-4 sm:p-6">
        {notes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No communication history yet. Add a note to get started.
          </div>
        ) : (
          <ul className="space-y-4 mb-4">
            {notes.map(note => (
              <li key={note.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{note.profiles?.full_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </li>
            ))}
          </ul>
        )}
        
        <form onSubmit={addNote} className="mt-4">
          <div>
            <label htmlFor="note" className="sr-only">Add note</label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newNote.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <FiSend className="mr-2 -ml-1 h-4 w-4" />
              {submitting ? 'Sending...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
