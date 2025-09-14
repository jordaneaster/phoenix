import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  console.log('Auth API route handler called');
  
  try {
    const body = await req.json();
    const { event, session } = body;

    // Create a supabase client using the route handler helper
    const supabase = createRouteHandlerClient({ cookies });

    if (event === 'SIGNED_IN' && session) {
      // We're not using session directly - we'll let Supabase handle setting cookies correctly
      
      // Instead of manually setting cookies, use the official method from auth-helpers
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      
      // Return a success response
      return NextResponse.json({ message: 'Auth cookie set successfully' });
    } else {
      console.error('Invalid request format:', body);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth error in API route:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}