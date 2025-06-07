import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { FiUsers, FiClock, FiBook, FiUsers as FiTeam, FiBell, FiSettings } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // For development mode - use mock data when no session exists
  const isDev = process.env.NODE_ENV === 'development';
  
  // Mock data for development
  const mockUserId = 'dev-user-id';
  const mockLeadsCount = 5;
  const mockFollowUpsCount = 2;
  const mockNotificationsCount = 3;
  const mockTrainingCount = 4;
  
  // If we have a session, get real data, otherwise use mock data in development
  let profile = null;
  let leadsCount = isDev ? mockLeadsCount : 0;
  let followUpsCount = isDev ? mockFollowUpsCount : 0;
  let notificationsCount = isDev ? mockNotificationsCount : 0; 
  let trainingCount = isDev ? mockTrainingCount : 0;
  
  // Only query Supabase if we have a session
  if (session) {
    // Fetch user profile to determine role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    profile = userProfile;
    
    // Get count of leads assigned to user
    const { count: userLeadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.user.id);
    
    if (userLeadsCount !== null) leadsCount = userLeadsCount;
    
    // Get follow-ups count (leads not contacted in 3+ days)
    const { count: userFollowUpsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.user.id)
      .lt('last_contact_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());
    
    if (userFollowUpsCount !== null) followUpsCount = userFollowUpsCount;
    
    // Get unread notifications count
    const { count: userNotificationsCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    
    if (userNotificationsCount !== null) notificationsCount = userNotificationsCount;
    
    // Get incomplete training count
    const { count: userTrainingCount } = await supabase
      .from('training_content')
      .select('*', { count: 'exact', head: true })
      .not('id', 'in', (
        supabase
          .from('training_progress')
          .select('training_id')
          .eq('user_id', session.user.id)
      ));
    
    if (userTrainingCount !== null) trainingCount = userTrainingCount;
  }
  
  // Default to manager role for development, otherwise use profile role
  const isManager = isDev || (profile?.role === 'manager');
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {!session && isDev && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="My Leads" 
          description="View and manage your leads" 
          icon={<FiUsers className="h-6 w-6" />}
          href="/leads"
          count={leadsCount}
        />
        
        <DashboardCard 
          title="Follow-Ups" 
          description="Leads requiring your attention" 
          icon={<FiClock className="h-6 w-6" />}
          href="/follow-ups"
          count={followUpsCount}
        />
        
        <DashboardCard 
          title="Training Center" 
          description="Access training materials" 
          icon={<FiBook className="h-6 w-6" />}
          href="/training"
          count={trainingCount}
        />
        
        {isManager && (
          <DashboardCard 
            title="Team Overview" 
            description="Manage your team and performance" 
            icon={<FiTeam className="h-6 w-6" />}
            href="/team"
          />
        )}
        
        <DashboardCard 
          title="Notifications" 
          description="View your alerts and updates" 
          icon={<FiBell className="h-6 w-6" />}
          href="/notifications"
          count={notificationsCount}
        />
        
        <DashboardCard 
          title="Settings" 
          description="Manage your profile and preferences" 
          icon={<FiSettings className="h-6 w-6" />}
          href="/profile"
        />
      </div>
    </div>
  );
}
