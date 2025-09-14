'use client';

import React, { useEffect, useState } from 'react';
import { WorksheetRepository } from '../../lib/repositories';
import Link from 'next/link';
import { FiPlus, FiFileText, FiClipboard } from 'react-icons/fi';
import WorksheetCard from '../../components/worksheets/WorksheetCard';
import WorksheetFilters from '../../components/worksheets/WorksheetFilters';

export default function WorksheetsPage() {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add default isManager to prevent ReferenceError when not defined
  const isManager = false;

  useEffect(() => {
    async function fetchWorksheets() {
      try {
        setLoading(true);
        // Fetch worksheets without relying on a foreign-key relationship to 'prospects'
        const data = await WorksheetRepository.getAll();
        console.log('Fetched worksheets:', data);
        setWorksheets(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching worksheets:', err);
        setError('Failed to load worksheets. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorksheets();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Worksheets</h1>
        
        <Link href="/worksheets/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FiPlus className="mr-2 h-4 w-4" />
            New Worksheet
          </button>
        </Link>
      </div>
      
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