// filepath: /home/jordaneaster/phoenix/app/follow-up/page.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiPlus, FiClock, FiAlertTriangle } from 'react-icons/fi';
import FollowUpCard from '../../components/follow-up/FollowUpCard';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = false;

export const dynamic = 'force-dynamic';

export default async function FollowUpDashboard({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values
  let followUps = [];
  let isManager = enableMockData ? true : false;
  
  // Filter parameters
  const priority = searchParams?.priority || '';
  const completed = searchParams?.completed || '';
  const overdue = searchParams?.overdue || '';
  
  // Only query Supabase if we have a session
  if (session) {
    // Check user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    isManager = user?.role === 'manager';
    
    // Build query
    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        prospects (id, name, email, phone),
        users:assigned_to (full_name)
      `);
    
    // If not manager, only show assigned follow-ups
    if (!isManager) {
      query = query.eq('assigned_to', session.user.id);
    }
    
    // Apply filters
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (completed) {
      query = query.eq('completed', completed === 'true');
    }
    if (overdue === 'true') {
      query = query.lt('due_date', new Date().toISOString());
    }
    
    // Order by due date
    query = query.order('due_date', { ascending: true });
    
    const { data: followUpData, error: followUpError } = await query;
    if (followUpError) {
      console.error('Error fetching follow-ups:', followUpError);
    }
    if (followUpData) {
      followUps = followUpData;
    }
  } else if (enableMockData) {
    // Mock follow-ups data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    followUps = [
      {
        id: '1',
        title: 'Follow up on test drive',
        description: 'Call John about his Honda Accord test drive experience',
        priority: 'high',
        due_date: yesterday.toISOString(),
        completed: false,
        created_at: new Date().toISOString(),
        prospects: { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-123-4567' },
        users: { full_name: 'Sales Rep' }
      },
      {
        id: '2',
        title: 'Send financing options',
        description: 'Email Jane the financing packages for her SUV purchase',
        priority: 'medium',
        due_date: now.toISOString(),
        completed: false,
        created_at: new Date().toISOString(),
        prospects: { id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '555-987-6543' },
        users: { full_name: 'Sales Rep' }
      },
      {
        id: '3',
        title: 'Check on decision',
        description: 'Follow up with Robert about his truck purchase decision',
        priority: 'low',
        due_date: tomorrow.toISOString(),
        completed: false,
        created_at: new Date().toISOString(),
        prospects: { id: '3', name: 'Robert Johnson', email: 'robert@example.com', phone: '555-456-7890' },
        users: { full_name: 'Sales Rep' }
      }
    ];
  }
  
  // Calculate statistics
  const now = new Date();
  const stats = {
    total: followUps.length,
    overdue: followUps.filter(f => new Date(f.due_date) < now && !f.completed).length,
    dueToday: followUps.filter(f => {
      const dueDate = new Date(f.due_date);
      return dueDate.toDateString() === now.toDateString() && !f.completed;
    }).length,
    completed: followUps.filter(f => f.completed).length
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Follow-Up Dashboard</h1>
        
        <Link href="/follow-up/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FiPlus className="mr-2 h-4 w-4" />
            New Follow-Up
          </button>
        </Link>
      </div>
      
      {!session && enableMockData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock follow-up data because no authenticated session was found.
          </p>
        </div>
      )}
      
      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Follow-Ups</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiAlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Due Today</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.dueToday}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Follow-Ups List */}
      <div className="space-y-4">
        {followUps.map((followUp) => (
          <FollowUpCard key={followUp.id} followUp={followUp} isManager={isManager} />
        ))}
        
        {followUps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No follow-ups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first follow-up task to get started.
            </p>
            <div className="mt-6">
              <Link href="/follow-up/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  <FiPlus className="mr-2 h-4 w-4" />
                  New Follow-Up
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}