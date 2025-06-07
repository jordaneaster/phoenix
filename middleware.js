import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get the pathname from the URL
    const { pathname } = req.nextUrl;
    
    // If not logged in and trying to access a protected route, redirect to login
    if (!session && pathname !== '/login' && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If logged in and trying to access login page, redirect to dashboard
    if (session && pathname === '/login') {
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Continue the request even if there's an error in the middleware
    // This prevents the app from breaking completely on auth errors
    return res;
  }
  
  return res;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes, and _next
    '/((?!_next/static|_next/image|images|favicon.ico|api).*)',
  ],
};
