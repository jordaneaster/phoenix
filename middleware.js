import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

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
    
    // Check if mock data is enabled (either in dev mode, via env var, or forced)
    const isDev = process.env.NODE_ENV === 'development';
    const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
    
    // If mock data is enabled and no session, allow access
    if (enableMockData && !session) {
      console.log('Mock data mode: allowing access to mock data');
      return res;
    }
    
    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
    
    // If user is not authenticated and trying to access a protected route
    if (!session && !publicRoutes.includes(pathname) && !enableMockData) {
      console.log('Unauthenticated user accessing protected route - redirecting to login');
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // For all other cases, continue with the request (remove the dashboard redirect)
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
