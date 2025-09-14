import React from 'react';
import { notFound } from 'next/navigation';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;

async function fetchWorksheet(id) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase server config for worksheet fetch');
      return null;
    }

    const encodedId = encodeURIComponent(id);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worksheets?id=eq.${encodedId}&select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      // ensure we always get fresh data
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Supabase fetch failed', res.status);
      return null;
    }

    const payload = await res.json().catch(() => null);
    if (!Array.isArray(payload) || payload.length === 0) return null;
    return payload[0];
  } catch (err) {
    console.error('Error fetching worksheet from Supabase:', err);
    return null;
  }
}

export default async function WorksheetPage({ params }) {
  const { id } = params;
  const worksheet = await fetchWorksheet(id);
  if (!worksheet) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-2">{worksheet.title}</h1>
        <p className="text-sm text-gray-500 mb-4">Type: {worksheet.type}</p>
        <div className="prose">
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(worksheet, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
