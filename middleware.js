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
    
    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
    
    // If this is a public route, no need to check authentication
    if (publicRoutes.includes(pathname)) {
      return res;
    }
    
    // Initialize Supabase client
    const supabase = createMiddlewareClient({ req, res });
    
    // Check for session - log cookie data for debugging
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    console.log(`Middleware: ${pathname} - Session ${session ? 'exists' : 'missing'}`);
    
    // If user is not authenticated and trying to access a protected route
    // if (!session) {
    //   console.log(`Redirecting to /login from ${pathname} - no valid session found`);
    //   const redirectUrl = new URL('/login', req.url);
    //   return NextResponse.redirect(redirectUrl);
    // }
    
    // For authenticated users, continue with the request
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
};
