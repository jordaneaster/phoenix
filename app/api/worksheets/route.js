import { NextResponse } from 'next/server';

// Try common env var names used in different setups
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;

export async function POST(req) {
  try {
    const missing = [];
    if (!SUPABASE_URL) missing.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY (server-only)');

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: 'Server missing Supabase configuration',
          missing,
          hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment (e.g. .env.local) and restart the dev server. The service role key must not be exposed to the browser.',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { title, type } = body || {};
    if (!title || !type) {
      return NextResponse.json({ error: 'Missing title or type' }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/worksheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ title, type }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: payload?.message || 'Insert failed', details: payload }, { status: res.status });
    }

    return NextResponse.json({ data: payload }, { status: 201 });
  } catch (err) {
    console.error('API create worksheet error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
