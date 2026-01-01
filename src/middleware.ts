import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('fefa_access_token')?.value;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/logo1.png',
    '/logo.jpg',
    '/images',
    '/videos',
    '/data'
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If no token and trying to access protected route, redirect to home page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If token exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
