import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Team() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  // Default values
  let isManager = false;
  let teamMembers = [];
  let performanceStats = {
    totalLeads: 0,
    leadsAssigned: 0,
    leadsClosed: 0,
    conversionRate: 0,
  };
  
  // Fetch user role
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  isManager = user?.role === 'manager';
  
  if (isManager) {
    // Fetch team members
    const { data: members } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
    
    if (members) {
      teamMembers = members;
      
      // Fetch lead statistics for each team member
      const promises = members.map(async (member) => {
        // Get total leads assigned to this member
        const { count: assignedCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id);
        
        // Get closed leads for this member
        const { count: closedCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .in('status', ['closed_won', 'closed_lost']);
        
        // Get won leads for this member
        const { count: wonCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .eq('status', 'closed_won');
        
        // Calculate metrics
        member.metrics = {
          assignedLeads: assignedCount || 0,
          closedLeads: closedCount || 0,
          wonLeads: wonCount || 0,
          conversionRate: assignedCount ? Math.round((wonCount / assignedCount) * 100) : 0
        };
        
        return member;
      });
      
      // Wait for all statistics to be calculated
      teamMembers = await Promise.all(promises);
      
      // Calculate team-wide stats
      performanceStats.totalLeads = teamMembers.reduce((sum, member) => sum + member.metrics.assignedLeads, 0);
      performanceStats.leadsClosed = teamMembers.reduce((sum, member) => sum + member.metrics.closedLeads, 0);
      performanceStats.leadsWon = teamMembers.reduce((sum, member) => sum + member.metrics.wonLeads, 0);
      performanceStats.conversionRate = performanceStats.totalLeads 
        ? Math.round((performanceStats.leadsWon / performanceStats.totalLeads) * 100) 
        : 0;
    }
  }
  
  // If not a manager, show access denied
  if (!isManager) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 inline-block p-6 rounded-lg">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-red-800">Access Denied</h3>
          <p className="mt-1 text-sm text-red-600">
            You need manager permissions to access the team overview.
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Return to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Team Overview</h1>
      
      {/* Team Performance Summary */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-medium text-gray-500">Total Leads</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{performanceStats.totalLeads}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-medium text-gray-500">Leads Closed</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{performanceStats.leadsClosed}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-medium text-gray-500">Leads Won</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{performanceStats.leadsWon}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{performanceStats.conversionRate}%</div>
        </div>
      </div>
      
      {/* Team Members List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
          <p className="mt-1 text-sm text-gray-500">
            {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'} in the team
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <li key={member.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{member.full_name}</div>
                        <div className="flex mt-1 text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone_number && (
                            <div className="flex items-center">
                              <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span>{member.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {member.role === 'manager' ? 'Manager' : 'Sales'}
                    </span>
                    {member.department && (
                      <span className="text-xs text-gray-500">{member.department}</span>
                    )}
                  </div>
                </div>
                
                {/* Member performance metrics */}
                <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <span className="block text-gray-500">Leads</span>
                    <span className="mt-1 font-medium text-gray-900">{member.metrics.assignedLeads}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Closed</span>
                    <span className="mt-1 font-medium text-gray-900">{member.metrics.closedLeads}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Won</span>
                    <span className="mt-1 font-medium text-gray-900">{member.metrics.wonLeads}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Conv. Rate</span>
                    <span className={`mt-1 font-medium ${
                      member.metrics.conversionRate >= 40 ? 'text-green-600' : 
                      member.metrics.conversionRate >= 30 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {member.metrics.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
          
          {teamMembers.length === 0 && (
            <li className="px-4 py-5 text-center text-gray-500">
              No team members found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
