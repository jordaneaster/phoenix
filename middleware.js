import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Create a response object
  const res = NextResponse.next();
  
  try {
    // Get the pathname from the URL
    const { pathname } = req.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('favicon')
    ) {
      return res;
    }
    
    // Initialize Supabase client
    const supabase = createMiddlewareClient({ req, res });
    
    // Only check if a session exists, don't try to load profiles
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    // If user is authenticated and not already on dashboard, redirect to dashboard
    if (session && pathname !== '/dashboard') {
      console.log('Authenticated user detected - redirecting to dashboard');
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // For all other cases, continue with the request
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
};
