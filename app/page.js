import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FiUsers, FiBook, FiSettings, FiArrowRight, FiTrendingUp, FiShield } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">Phoenix CRM</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your customer relationships and boost your sales with our powerful CRM platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign In
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/signup"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Management</h3>
            <p className="text-gray-600">Track and manage your leads effectively with our intuitive interface.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Analytics</h3>
            <p className="text-gray-600">Get insights into your sales performance with detailed analytics.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiShield className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Your data is protected with enterprise-grade security.</p>
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
