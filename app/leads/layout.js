import { Suspense } from 'react';
import Link from 'next/link';
import { FiUsers, FiList, FiPlus, FiSearch } from 'react-icons/fi';

export default function LeadsLayout({ children }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header for leads section */}
      <div className="bg-white shadow">
        <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <FiUsers className="h-6 w-6 text-primary-600 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900">Leads Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/leads/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiPlus className="h-4 w-4 mr-2" /> New Lead
            </Link>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <Link
                href="/leads"
                className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                All Leads
              </Link>
              <Link
                href="/leads/my-leads"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                My Leads
              </Link>
              <Link
                href="/leads/hot"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Hot Leads
              </Link>
              <Link
                href="/leads/recent"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Recent
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 py-3 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-md w-full">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search leads..."
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow p-4 sm:p-6 lg:p-8 bg-gray-50 overflow-auto">
        <Suspense fallback={<div className="text-center py-10">Loading leads...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
