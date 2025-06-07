import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import StatusFilter from '../../components/leads/StatusFilter';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

export const dynamic = 'force-dynamic';

export default async function Leads({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled (either in dev mode, via env var, or forced)
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values and mock data
  let isManager = enableMockData ? true : false;
  let leads = [];
  
  // Status filter
  const status = searchParams?.status || '';
  
  // Only query Supabase if we have a session
  if (session) {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    isManager = profile?.role === 'manager';
    
    // Build query
    let query = supabase.from('leads').select(`
      *,
      profiles:assigned_to (full_name)
    `);
    
    // If not a manager, only show leads assigned to the current user
    if (!isManager) {
      query = query.eq('assigned_to', session.user.id);
    }
    
    // Apply status filter if selected
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by recently updated
    query = query.order('updated_at', { ascending: false });
    
    const { data: userLeads, error } = await query;
    
    if (!error && userLeads) {
      leads = userLeads;
    }
  } 
  
  // Hard-coded mock leads data
  if (enableMockData && !session) {
    leads = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        vehicle_interest: '2023 Sedan Model X',
        status: 'new',
        updated_at: new Date().toISOString(),
        profiles: { full_name: 'Sales Rep' }
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-987-6543',
        vehicle_interest: '2023 SUV Model Y',
        status: 'contacted',
        updated_at: new Date().toISOString(),
        profiles: { full_name: 'Sales Rep' }
      },
      {
        id: '3',
        name: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '555-456-7890',
        vehicle_interest: '2022 Truck Model Z',
        status: 'qualified',
        updated_at: new Date().toISOString(),
        profiles: { full_name: 'Sales Rep' }
      }
    ];
  }
  
  // Get status options for filter
  const statusOptions = [
    'new',
    'contacted',
    'qualified',
    'proposal',
    'closed_won',
    'closed_lost'
  ];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
        
        <div className="flex space-x-2">
          <StatusFilter statusOptions={statusOptions} currentStatus={status} />
          
          {isManager && (
            <Link href="/leads/new">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <FiPlus className="mr-2 h-4 w-4" />
                New Lead
              </button>
            </Link>
          )}
        </div>
      </div>
      
      {!session && enableMockData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock leads data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {leads && leads.length > 0 ? (
            leads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="font-medium text-primary-600 truncate">{lead.name}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              {lead.vehicle_interest ? `• ${lead.vehicle_interest}` : ''}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              {lead.email || 'No email'}
                              <span className="mx-1">•</span>
                              {lead.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : 
                            lead.status === 'qualified' ? 'bg-indigo-100 text-indigo-800' : 
                            lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' : 
                            lead.status === 'closed_won' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                            {lead.status.replace('_', ' ')}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {isManager && lead.profiles && <span>Assigned to: {lead.profiles.full_name}</span>}
                            {!isManager && <span>Last updated: {new Date(lead.updated_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-5 text-center text-gray-500">
              No leads found. {isManager && 'Create a new lead to get started.'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
