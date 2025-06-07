import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiLogOut, FiEdit3 } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // For development mode - use mock data when no session exists
  const isDev = process.env.NODE_ENV === 'development';
  
  // Default values
  let userProfile = null;
  let userEmail = '';
  
  // Only query Supabase if we have a session
  if (session) {
    userEmail = session.user.email;
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profile) {
      userProfile = profile;
    }
  } else if (isDev) {
    // Mock profile data for development
    userEmail = 'dev@example.com';
    userProfile = {
      id: 'dev-user-id',
      full_name: 'Development User',
      role: 'manager',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
      </div>
      
      {!session && isDev && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock profile data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences.</p>
          </div>
          <Link href="/profile/edit">
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <FiEdit3 className="mr-2 -ml-1 h-4 w-4" />
              Edit Profile
            </button>
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiUser className="mr-2 h-5 w-5 text-gray-400" />
                Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userProfile?.full_name || 'Not set'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiMail className="mr-2 h-5 w-5 text-gray-400" />
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userEmail}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  userProfile?.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {userProfile?.role === 'manager' ? 'Manager' : 'Sales'}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(userProfile?.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Security Section */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Password and account settings.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiLock className="mr-2 h-5 w-5 text-gray-400" />
                Password
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <span className="mr-4">••••••••</span>
                <Link href="/profile/change-password">
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Change password
                  </button>
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="mt-8 flex justify-center">
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiLogOut className="mr-2 -ml-1 h-5 w-5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
