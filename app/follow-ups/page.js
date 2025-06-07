import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiClock } from 'react-icons/fi';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

export const dynamic = 'force-dynamic';

export default async function FollowUps() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled (either in dev mode, via env var, or forced)
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values and mock data
  let isManager = enableMockData ? true : false;
  let followUps = [];
  
  // Only query Supabase if we have a session
  if (session) {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    isManager = profile?.role === 'manager';
    
    // Calculate date threshold for follow-ups (3 days ago)
    const threeeDaysAgo = new Date();
    threeeDaysAgo.setDate(threeeDaysAgo.getDate() - 3);
    const thresholdDate = threeeDaysAgo.toISOString();
    
    // Build query for leads not contacted in 3+ days
    let query = supabase.from('leads').select(`
      *,
      profiles:assigned_to (full_name)
    `)
    .lt('last_contact_at', thresholdDate)
    .not('status', 'in', '("closed_won","closed_lost")');
    
    // If not a manager, only show leads assigned to the current user
    if (!isManager) {
      query = query.eq('assigned_to', session.user.id);
    }
    
    // Order by oldest contact first
    query = query.order('last_contact_at', { ascending: true });
    
    const { data: followUpLeads, error } = await query;
    
    if (!error && followUpLeads) {
      followUps = followUpLeads;
    }
  } 
  
  // Force mock follow-ups for all environments
  if (enableMockData && !session) {
    const now = new Date();
    
    // Create dates 4, 5, and 7 days ago
    const fourDaysAgo = new Date(now);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    followUps = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        vehicle_interest: '2023 Sedan Model X',
        status: 'contacted',
        last_contact_at: fourDaysAgo.toISOString(),
        updated_at: fourDaysAgo.toISOString(),
        profiles: { full_name: 'Sales Rep' }
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-987-6543',
        vehicle_interest: '2023 SUV Model Y',
        status: 'qualified',
        last_contact_at: fiveDaysAgo.toISOString(),
        updated_at: fiveDaysAgo.toISOString(),
        profiles: { full_name: 'Sales Rep' }
      },
      {
        id: '3',
        name: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '555-456-7890',
        vehicle_interest: '2022 Truck Model Z',
        status: 'new',
        last_contact_at: sevenDaysAgo.toISOString(),
        updated_at: sevenDaysAgo.toISOString(),
        profiles: { full_name: 'Sales Rep' }
      }
    ];
  }
  
  // Helper function to get days since last contact
  const getDaysSinceContact = (lastContactDate) => {
    const lastContact = new Date(lastContactDate);
    const now = new Date();
    const differenceInTime = now - lastContact;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Follow-Ups Required</h1>
        
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          <FiClock className="inline-block mr-1" /> 3+ days since last contact
        </div>
      </div>
      
      {!session && isDev && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock follow-up data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {followUps && followUps.length > 0 ? (
            followUps.map((lead) => (
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
                          <div className="text-xs text-red-500 font-medium mt-1">
                            {getDaysSinceContact(lead.last_contact_at)} days since last contact
                          </div>
                          {isManager && lead.profiles && (
                            <div className="text-xs text-gray-500 mt-1">
                              Assigned to: {lead.profiles.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-5 text-center text-gray-500">
              No follow-ups needed at this time. All leads have been contacted within the last 3 days.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
