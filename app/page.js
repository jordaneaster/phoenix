import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FiUsers, FiClock, FiBook, FiSettings } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Phoenix CRM
            </h1>
            <p className="mt-6 text-xl max-w-prose">
              Streamline your car dealership sales process with our intuitive CRM system. 
              Manage leads, track follow-ups, and boost your team's performance.
            </p>
            <div className="mt-10 flex space-x-4">
              <Link href="/login">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white">
                  Log In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Built for car dealership sales teams
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to manage your sales process in one place.
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Lead Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Efficiently track and manage all your customer leads in one place.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
              <FiClock className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Follow-Up Reminders</h3>
            <p className="mt-2 text-base text-gray-500">
              Never miss a follow-up with automated reminders and notifications.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
              <FiBook className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Training Center</h3>
            <p className="mt-2 text-base text-gray-500">
              Access sales training materials and track completion progress.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
              <FiSettings className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Team Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Assign leads, track performance, and manage your sales team.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to boost your sales?</span>
            <span className="block text-primary-600">Log in to get started.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/login">
                <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  Log In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Phoenix CRM. All rights reserved.
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              Built for car dealership excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
