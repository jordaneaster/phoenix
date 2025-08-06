// filepath: /home/jordaneaster/phoenix/app/dashboard/page.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { FiUsers, FiClock, FiBook, FiUsers as FiTeam, FiBell, FiSettings, FiFileText, FiTarget, FiTrendingUp } from 'react-icons/fi';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled (either in dev mode, via env var, or forced)
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Mock data values - now always available in production
  const mockLeadsCount = 5;
  const mockFollowUpsCount = 2;
  const mockNotificationsCount = 3;
  const mockTrainingCount = 4;
  const mockWorksheetsCount = 7;
  const mockProspectsCount = 12;
  
  // If we have a session, get real data, otherwise use mock data if enabled
  let profile = null;
  let leadsCount = enableMockData ? mockLeadsCount : 0;
  let followUpsCount = enableMockData ? mockFollowUpsCount : 0;
  let notificationsCount = enableMockData ? mockNotificationsCount : 0; 
  let trainingCount = enableMockData ? mockTrainingCount : 0;
  let worksheetsCount = enableMockData ? mockWorksheetsCount : 0;
  let prospectsCount = enableMockData ? mockProspectsCount : 0;
  
  // Only query Supabase if we have a session
  if (session) {
    try {
      console.log('Dashboard: Fetching user profile from users table for:', session.user.id);
      // Fetch user profile from users table instead of profiles table
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, role, status')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile from users table:', error);
      } else {
        console.log('Successfully fetched user profile:', userProfile);
        profile = userProfile;
      }
      
      // Get count of leads assigned to user
      try {
        const { count: userLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', session.user.id);
        
        if (userLeadsCount !== null) leadsCount = userLeadsCount;
      } catch (error) {
        console.error('Failed to fetch leads count:', error);
        if (error.message?.includes('assigned_to') || error.code === '42703') {
          console.log('Leads table missing assigned_to column, using fallback value');
          leadsCount = enableMockData ? mockLeadsCount : 0;
        }
      }
      
      // Get follow-ups count (leads not contacted in 3+ days)
      try {
        const { count: userFollowUpsCount } = await supabase
          .from('follow_ups')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', session.user.id)
          .eq('completed', false);
        
        if (userFollowUpsCount !== null) followUpsCount = userFollowUpsCount;
      } catch (error) {
        console.error('Failed to fetch follow-ups count:', error);
        if (error.message?.includes('assigned_to') || error.code === '42703') {
          console.log('Follow-ups table missing assigned_to column, using fallback value');
          followUpsCount = enableMockData ? mockFollowUpsCount : 0;
        }
      }
      
      // Get worksheets count
      try {
        const { count: userWorksheetsCount } = await supabase
          .from('worksheets')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', session.user.id);
        
        if (userWorksheetsCount !== null) worksheetsCount = userWorksheetsCount;
      } catch (error) {
        console.error('Failed to fetch worksheets count:', error);
        // If column doesn't exist, fall back to mock data or 0
        if (error.message?.includes('created_by') || error.code === '42703') {
          console.log('Worksheets table missing created_by column, using fallback value');
          worksheetsCount = enableMockData ? mockWorksheetsCount : 0;
        }
      }
      
      // Get prospects count
      try {
        const { count: userProspectsCount } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', session.user.id);
        
        if (userProspectsCount !== null) prospectsCount = userProspectsCount;
      } catch (error) {
        console.error('Failed to fetch prospects count:', error);
        if (error.message?.includes('assigned_to') || error.code === '42703') {
          console.log('Prospects table missing assigned_to column, using fallback value');
          prospectsCount = enableMockData ? mockProspectsCount : 0;
        }
      }
      
      // Get unread notifications count
      try {
        const { count: userNotificationsCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('read', false);
        
        if (userNotificationsCount !== null) notificationsCount = userNotificationsCount;
      } catch (error) {
        console.error('Failed to fetch notifications count:', error);
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.log('Notifications table does not exist, using fallback value');
          notificationsCount = enableMockData ? mockNotificationsCount : 0;
        }
      }
      
      // Get incomplete training count
      try {
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
      } catch (error) {
        console.error('Failed to fetch training count:', error);
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.log('Training tables do not exist, using fallback value');
          trainingCount = enableMockData ? mockTrainingCount : 0;
        }
      }
    } catch (error) {
      console.error('Error in dashboard:', error);
    }
  }
  
  // Default to manager role even if no profile exists
  const isManager = enableMockData || (profile?.role === 'manager') || !profile;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {!session && enableMockData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core CRM Features */}
        <DashboardCard 
          title="Working Prospects" 
          description="Manage your active prospects" 
          icon={<FiUsers className="h-6 w-6" />}
          href="/prospects"
          count={prospectsCount}
        />
        
        <DashboardCard 
          title="Follow-Up Tasks" 
          description="Track and complete follow-ups" 
          icon={<FiClock className="h-6 w-6" />}
          href="/follow-up"
          count={followUpsCount}
        />
        
        <DashboardCard 
          title="Worksheets" 
          description="Buyer orders and deal packs" 
          icon={<FiFileText className="h-6 w-6" />}
          href="/worksheets"
          count={worksheetsCount}
        />
        
        {/* Legacy Features */}
        <DashboardCard 
          title="My Leads" 
          description="View and manage your leads" 
          icon={<FiUsers className="h-6 w-6" />}
          href="/leads"
          count={leadsCount}
        />
        
        <DashboardCard 
          title="Training Center" 
          description="Access training materials" 
          icon={<FiBook className="h-6 w-6" />}
          href="/training"
          count={trainingCount}
        />
        
        <DashboardCard 
          title="Goals & Accountability" 
          description="Track your sales goals" 
          icon={<FiTarget className="h-6 w-6" />}
          href="/goals"
        />
        
        {isManager && (
          <>
            <DashboardCard 
              title="Team Overview" 
              description="Manage your team and performance" 
              icon={<FiTeam className="h-6 w-6" />}
              href="/team"
            />
            
            <DashboardCard 
              title="Manager Accountability" 
              description="Review team activity and goals" 
              icon={<FiTrendingUp className="h-6 w-6" />}
              href="/manager"
            />
          </>
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