import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// TEMPORARY: Completely bypass the middleware for development
export function middleware(req) {
  console.log('Middleware called for path:', req.nextUrl.pathname);
  
  // Just pass through all requests during development
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: bypassing auth checks');
    return NextResponse.next();
  }
  
  // Regular auth logic (disabled for now)
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = supabase.auth.getSession();

  // Check auth condition
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
