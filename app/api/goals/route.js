import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

function missingConfigResponse(missing) {
  return NextResponse.json({ error: 'Server missing Supabase configuration', missing }, { status: 500 });
}

export async function GET() {
  try {
    const missing = [];
    if (!SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (missing.length) return missingConfigResponse(missing);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/accountability_goals?select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: 'no-store',
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: payload?.message || 'Fetch failed', details: payload }, { status: res.status });
    }

    return NextResponse.json(payload || [], { status: 200 });
  } catch (err) {
    console.error('API /api/goals GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const missing = [];
    if (!SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (missing.length) return missingConfigResponse(missing);

    const body = await req.json().catch(() => ({}));
    const { goal_type, target_value, deadline, user_id } = body || {};
    if (!goal_type || !target_value) {
      return NextResponse.json({ error: 'Missing goal_type or target_value' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const payload = {
      user_id: user_id || null,
      goal_type,
      target_value: Number(target_value),
      deadline: deadline || null,
      progress: 0,
      created_at: timestamp,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/accountability_goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'Insert failed', details: data }, { status: res.status });
    }

    // res returns an array of created rows; return the first row for convenience
    return NextResponse.json(data && Array.isArray(data) ? data[0] : data, { status: 201 });
  } catch (err) {
    console.error('API /api/goals POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
