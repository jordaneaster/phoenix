"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { FiPlus, FiUsers } from 'react-icons/fi';
import ProspectCard from '../../components/prospects/ProspectCard';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = false;

export default function Prospects({ searchParams }) {
  const [prospects, setProspects] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  
  // Filter parameters
  const status = searchParams?.status || '';
  
  useEffect(() => {
    async function loadProspects() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        // Check if mock data is enabled
        const isDev = process.env.NODE_ENV === 'development';
        const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
        
        if (currentSession) {
          // Check user role
          const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          setIsManager(user?.role === 'manager');
          
          // Build query
          let query = supabase
            .from('prospects')
            .select(`
              *,
              users:assigned_to (full_name),
              follow_ups!inner (
                id,
                due_date,
                completed,
                priority
              )
            `);
          
          // If not manager, only show assigned prospects
          if (user?.role !== 'manager') {
            query = query.eq('assigned_to', currentSession.user.id);
          }
          
          // Apply status filter
          if (status) {
            query = query.eq('status', status);
          }
          
          // Order by last activity
          query = query.order('last_activity_date', { ascending: false });
          
          const { data: prospectData } = await query;
          if (prospectData) {
            setProspects(prospectData);
          }
        } else if (enableMockData) {
          // Mock prospects data
          setIsManager(true);
          setProspects([
            {
              id: '1',
              name: 'John Smith',
              email: 'john@example.com',
              phone: '555-123-4567',
              status: 'hot',
              source: 'website',
              notes: 'Interested in Honda Accord, budget around $25k',
              last_activity_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              users: { full_name: 'Sales Rep' },
              follow_ups: [
                { id: '1', due_date: new Date().toISOString(), completed: false, priority: 'high' }
              ]
            },
            {
              id: '2',
              name: 'Jane Doe',
              email: 'jane@example.com',
              phone: '555-987-6543',
              status: 'active',
              source: 'referral',
              notes: 'Looking for family SUV, test drive scheduled',
              last_activity_date: new Date(Date.now() - 86400000).toISOString(),
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              users: { full_name: 'Sales Rep' },
              follow_ups: [
                { id: '2', due_date: new Date().toISOString(), completed: false, priority: 'medium' }
              ]
            },
            {
              id: '3',
              name: 'Robert Johnson',
              email: 'robert@example.com',
              phone: '555-456-7890',
              status: 'cold',
              source: 'walk-in',
              notes: 'Browsing, not ready to buy yet',
              last_activity_date: new Date(Date.now() - 172800000).toISOString(),
              created_at: new Date(Date.now() - 172800000).toISOString(),
              updated_at: new Date(Date.now() - 172800000).toISOString(),
              users: { full_name: 'Sales Rep' },
              follow_ups: []
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading prospects:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProspects();
  }, [status]);
  
  // Event handlers for ProspectCard
  const handleView = (prospect) => {
    console.log('View prospect:', prospect);
    // Navigate to prospect detail page
    window.location.href = `/prospects/${prospect.id}`;
  };
  
  const handleEdit = (prospect) => {
    console.log('Edit prospect:', prospect);
    // Navigate to prospect edit page
    window.location.href = `/prospects/${prospect.id}/edit`;
  };
  
  const handleScheduleFollowUp = (prospect) => {
    console.log('Schedule follow up for:', prospect);
    // Navigate to follow up creation page
    window.location.href = `/prospects/${prospect.id}/follow-up`;
  };
  
  const handleAssign = (prospect) => {
    console.log('Assign prospect:', prospect);
    // Open assignment modal or navigate to assignment page
  };
  
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'hot', label: 'Hot' },
    { value: 'cold', label: 'Cold' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];
  
  // Calculate statistics
  const stats = {
    total: prospects.length,
    hot: prospects.filter(p => p.status === 'hot').length,
    active: prospects.filter(p => p.status === 'active').length,
    cold: prospects.filter(p => p.status === 'cold').length
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading prospects...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Working Prospects</h1>
        
        <Link href="/prospects/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FiPlus className="mr-2 h-4 w-4" />
            New Prospect
          </button>
        </Link>
      </div>
      
      {!session && ALWAYS_ENABLE_MOCK && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock prospect data because no authenticated session was found.
          </p>
        </div>
      )}
      
      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiUsers className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Prospects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hot Prospects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.hot}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cold</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cold}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={status}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Link href="/prospects" className="text-sm text-primary-600 hover:text-primary-700">
            Clear Filters
          </Link>
        </div>
      </div>
      
      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prospects.map((prospect) => (
          <ProspectCard 
            key={prospect.id} 
            prospect={prospect} 
            onView={handleView}
            onEdit={handleEdit}
            onScheduleFollowUp={handleScheduleFollowUp}
            onAssign={handleAssign}
          />
        ))}
        
        {prospects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No prospects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first prospect.
            </p>
            <div className="mt-6">
              <Link href="/prospects/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  <FiPlus className="mr-2 h-4 w-4" />
                  New Prospect
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}