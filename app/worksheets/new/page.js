'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewWorksheetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('buyer_order');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/worksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), type }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Create request failed');
      }

      router.push('/worksheets');
    } catch (err) {
      console.error('Error creating worksheet:', err);
      setError(err.message || 'Failed to create worksheet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Create New Worksheet</h1>
        <p className="mb-4 text-sm text-gray-600">This form creates a worksheet via a server API route (server uses service role to bypass RLS).</p>
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="buyer_order">Buyer Order</option>
              <option value="deal_pack">Deal Pack</option>
            </select>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white " + (loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700')}
            >
              {loading ? 'Creating...' : 'Create Worksheet'}
            </button>
            <Link href="/worksheets" className="text-sm text-primary-600 hover:underline">Back to Worksheets</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
