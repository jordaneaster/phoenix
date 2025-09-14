import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;

export async function GET(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const missing = [];
    if (!SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Server missing Supabase configuration', missing }, { status: 500 });
    }

    // Query by id using PostgREST filter
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worksheets?id=eq.${id}&select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: payload?.message || 'Fetch failed', details: payload }, { status: res.status });
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: payload[0] }, { status: 200 });
  } catch (err) {
    console.error('API fetch worksheet error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
