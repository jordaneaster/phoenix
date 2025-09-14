import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { FiUsers, FiClock, FiBook, FiUsers as FiTeam, FiBell, FiSettings, FiFileText, FiTarget, FiTrendingUp } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    // Redirect to login if no session
    return null;
  }

  let profile = null;
  let leadsCount = 0;
  let followUpsCount = 0;
  let notificationsCount = 0;
  let trainingCount = 0;
  let worksheetsCount = 0;
  let prospectsCount = 0;

  try {
    const userProfile = await supabase.rpc('get_user_by_id', { user_id: session.user.id });
    profile = Array.isArray(userProfile.data) && userProfile.data.length > 0 ? userProfile.data[0] : userProfile.data;
  } catch (err) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, role, status')
      .eq('id', session.user.id)
      .maybeSingle();
    profile = userProfile;
  }

  try {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.user.id);
    if (count !== null) leadsCount = count;
  } catch (error) {
    console.error('Failed to fetch leads count:', error);
  }

  try {
    const followUpsResult = await supabase.rpc('get_user_follow_ups', { user_id: session.user.id });
    followUpsCount = Array.isArray(followUpsResult.data) ? followUpsResult.data.length : 0;
  } catch (error) {
    try {
      const { count } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', session.user.id)
        .eq('status', 'pending');
      if (count !== null) followUpsCount = count;
    } catch (e) {
      console.error('Failed to fetch follow-ups count:', e);
    }
  }

  try {
    const worksheetsResult = await supabase.rpc('get_user_worksheets', { user_id: session.user.id });
    worksheetsCount = Array.isArray(worksheetsResult.data) ? worksheetsResult.data.length : 0;
  } catch (error) {
    try {
      const { count } = await supabase
        .from('worksheets')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', session.user.id);
      if (count !== null) worksheetsCount = count;
    } catch (e) {
      console.error('Failed to fetch worksheets count:', e);
    }
  }

  try {
    const prospectsResult = await supabase.rpc('get_user_prospects', { user_id: session.user.id });
    prospectsCount = Array.isArray(prospectsResult.data) ? prospectsResult.data.length : 0;
  } catch (error) {
    try {
      const { count } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', session.user.id);
      if (count !== null) prospectsCount = count;
    } catch (e) {
      console.error('Failed to fetch prospects count:', e);
    }
  }

  try {
    const notificationsResult = await supabase.rpc('get_user_notifications', { user_id: session.user.id });
    notificationsCount = Array.isArray(notificationsResult.data) ? notificationsResult.data.filter(n => !n.read).length : 0;
  } catch (error) {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('read', false);
      if (count !== null) notificationsCount = count;
    } catch (e) {
      console.error('Failed to fetch notifications count:', e);
    }
  }

  try {
    const { count } = await supabase
      .from('training_content')
      .select('*', { count: 'exact', head: true })
      .not('id', 'in', (
        supabase
          .from('training_progress')
          .select('training_id')
          .eq('user_id', session.user.id)
      ));
    if (count !== null) trainingCount = count;
  } catch (error) {
    console.error('Failed to fetch training count:', error);
  }

  const isManager = (profile?.role === 'manager');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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