import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Auth API route handler called');
    
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth error in API route:', error);
      
      // Handle specific error types better
      if (error.message.includes("invalid") && error.message.includes("email")) {
        return NextResponse.json(
          { error: "Email address format is invalid. Please use a proper email format." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Check if user exists in users table and is active
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, status, role')
        .eq('id', data.user.id)
        .single();
      
      if (userError || !userData) {
        console.error('User not found in users table:', userError);
        return NextResponse.json(
          { error: 'User account not found. Please contact an administrator.' },
          { status: 403 }
        );
      }
      
      if (userData.status !== 'active') {
        return NextResponse.json(
          { error: 'Your account is not active. Please contact an administrator.' },
          { status: 403 }
        );
      }
    }
    
    // Return success response
    console.log('Login successful, returning JSON response');
    return NextResponse.json(
      { 
        success: true, 
        user: data.user,
        message: 'Login successful' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in auth API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 