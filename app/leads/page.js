'use client';

import React, { useEffect, useState } from 'react';
import { ProspectRepository } from '../../lib/repositories';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import StatusFilter from '../../components/leads/StatusFilter';

export const dynamic = 'force-dynamic';

export default function Leads({ searchParams }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status filter
  const status = searchParams?.status || '';

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        // Fetch all prospects/leads
        const data = await ProspectRepository.getAll({
          orderBy: 'updated_at',
          ascending: false
        });
        console.log('Fetched leads:', data);
        setLeads(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Get status options for filter
  const statusOptions = [
    'new',
    'contacted',
    'qualified',
    'proposal',
    'closed_won',
    'closed_lost'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>

        <div className="flex space-x-2">
          <StatusFilter statusOptions={statusOptions} currentStatus={status} />

          <Link href="/leads/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <FiPlus className="mr-2 h-4 w-4" />
              New Lead
            </button>
          </Link>
        </div>
      </div>

      {loading && <p>Loading leads...</p>}

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            No leads found. Add your first lead to get started.
          </p>
        </div>
      )}

      {!loading && leads.length > 0 && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.name || 'Unnamed'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.status === 'qualified'
                          ? 'bg-green-100 text-green-800'
                          : lead.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lead.status || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/leads/${lead.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
