import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiPlus, FiFileText, FiClipboard } from 'react-icons/fi';
import WorksheetCard from '../../components/worksheets/WorksheetCard';
import WorksheetFilters from '../../components/worksheets/WorksheetFilters';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

export const dynamic = 'force-dynamic';

export default async function Worksheets({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values
  let worksheets = [];
  let isManager = enableMockData ? true : false;
  
  // Filter parameters
  const type = searchParams?.type || '';
  const status = searchParams?.status || '';
  
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
      .from('worksheets')
      .select(`
        *,
        users:created_by (full_name),
        prospects (name, email)
      `);
    
    // If not manager, only show own worksheets
    if (!isManager) {
      query = query.eq('created_by', session.user.id);
    }
    
    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by most recent
    query = query.order('created_at', { ascending: false });
    
    const { data: worksheetData } = await query;
    if (worksheetData) {
      worksheets = worksheetData;
    }
  } else if (enableMockData) {
    // Mock worksheets data
    worksheets = [
      {
        id: '1',
        title: 'John Smith - Honda Accord Deal',
        type: 'buyer_order',
        status: 'draft',
        prospect_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: { full_name: 'Sales Rep' },
        prospects: { name: 'John Smith', email: 'john@example.com' }
      },
      {
        id: '2',
        title: 'Jane Doe - Toyota Camry Package',
        type: 'deal_pack',
        status: 'pending_approval',
        prospect_id: '2',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        users: { full_name: 'Sales Rep' },
        prospects: { name: 'Jane Doe', email: 'jane@example.com' }
      },
      {
        id: '3',
        title: 'Robert Johnson - F-150 Order',
        type: 'buyer_order',
        status: 'approved',
        prospect_id: '3',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        users: { full_name: 'Sales Rep' },
        prospects: { name: 'Robert Johnson', email: 'robert@example.com' }
      }
    ];
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Worksheets</h1>
        
        <Link href="/worksheets/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FiPlus className="mr-2 h-4 w-4" />
            New Worksheet
          </button>
        </Link>
      </div>
      
      {!session && enableMockData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock worksheet data because no authenticated session was found.
          </p>
        </div>
      )}
      
      {/* Filters */}
      <WorksheetFilters />
      
      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiFileText className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Worksheets</p>
              <p className="text-2xl font-semibold text-gray-900">{worksheets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiClipboard className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Buyer Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {worksheets.filter(w => w.type === 'buyer_order').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FiFileText className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Deal Packs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {worksheets.filter(w => w.type === 'deal_pack').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Worksheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worksheets.map((worksheet) => (
          <WorksheetCard key={worksheet.id} worksheet={worksheet} isManager={isManager} />
        ))}
        
        {worksheets.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No worksheets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first worksheet.
            </p>
            <div className="mt-6">
              <Link href="/worksheets/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  <FiPlus className="mr-2 h-4 w-4" />
                  New Worksheet
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}