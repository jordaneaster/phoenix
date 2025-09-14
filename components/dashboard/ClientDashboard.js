'use client';

import { useState, useEffect } from 'react';
import { DashboardService } from '../../lib/services/DashboardService';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { FiUsers, FiClock, FiBook, FiUsers as FiTeam, FiBell, FiSettings, FiFileText, FiTarget, FiTrendingUp } from 'react-icons/fi';

export default function ClientDashboard() {
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    leadsCount: 0,
    followUpsCount: 0,
    worksheetsCount: 0,
    prospectsCount: 0,
    notificationsCount: 0,
    trainingCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const dashboardService = new DashboardService();
        const currentUser = await dashboardService.getCurrentUser();
        
        if (!currentUser) {
          console.log('No authenticated user found');
          setIsLoading(false);
          return;
        }
        
        console.log('Loading dashboard data for user:', currentUser.id);
        const data = await dashboardService.getDashboardData(currentUser.id);
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);
  
  // Check if user is a manager
  const isManager = dashboardData.profile?.role === 'manager';
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {dashboardData.profile && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-md shadow">
          <h3 className="text-sm font-medium text-gray-800">Welcome, {dashboardData.profile.full_name}</h3>
          <p className="mt-1 text-xs text-gray-700">
            Role: {dashboardData.profile.role} | Department: {dashboardData.profile.department}
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
          count={dashboardData.prospectsCount}
        />
        
        <DashboardCard 
          title="Follow-Up Tasks" 
          description="Track and complete follow-ups" 
          icon={<FiClock className="h-6 w-6" />}
          href="/follow-up"
          count={dashboardData.followUpsCount}
        />
        
        <DashboardCard 
          title="Worksheets" 
          description="Buyer orders and deal packs" 
          icon={<FiFileText className="h-6 w-6" />}
          href="/worksheets"
          count={dashboardData.worksheetsCount}
        />
        
        {/* Legacy Features */}
        <DashboardCard 
          title="My Leads" 
          description="View and manage your leads" 
          icon={<FiUsers className="h-6 w-6" />}
          href="/leads"
          count={dashboardData.leadsCount}
        />
        
        <DashboardCard 
          title="Training Center" 
          description="Access training materials" 
          icon={<FiBook className="h-6 w-6" />}
          href="/training"
          count={dashboardData.trainingCount}
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
          count={dashboardData.notificationsCount}
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