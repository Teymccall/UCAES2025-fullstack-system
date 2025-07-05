import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions } from './lib/session'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow requests to dev-only endpoints in development
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/api/dev')) {
    return NextResponse.next()
  }
  
  // Allow access to public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Allow access to static files
  if (
    pathname.includes('/_next') || 
    pathname.includes('/images') || 
    pathname.includes('/fonts') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  // Check if user is authenticated
  const userJson = request.cookies.get('academic_affairs_user')?.value
  
  if (!userJson) {
    // If the request is for an API route, return a JSON error response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Otherwise, redirect to the login page for page navigations
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  try {
    const user = JSON.parse(userJson)
    
    // If authenticated but trying to access the wrong dashboard
    if (pathname.startsWith('/director') && user.role !== 'director') {
      // Redirect staff to staff dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/staff/dashboard'
      return NextResponse.redirect(url)
    } else if (pathname.startsWith('/staff') && user.role !== 'staff') {
      // Redirect director to director dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/director/dashboard'
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  } catch (error) {
    // If the request is for an API route, return a JSON error response
    if (pathname.startsWith('/api/')) {
      // Clear the invalid cookie
      const response = NextResponse.json({ success: false, message: 'Invalid session. Please log in again.' }, { status: 401 });
      response.cookies.delete('academic_affairs_user');
      return response;
    }
    // Invalid user data in cookie, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Clear the invalid cookie before redirecting
    const response = NextResponse.redirect(url);
    response.cookies.delete('academic_affairs_user');
    return response;
  }
}

export const config = {
  // Match all paths except for:
  // - API routes for authentication (`/api/auth`)
  // - Development-only routes (`/api/dev`)
  // - Static files and images
  matcher: [
    '/((?!api/auth|api/dev|_next/static|_next/image|favicon.ico).*)',
  ],
} 