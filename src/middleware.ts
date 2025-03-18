import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password'];

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Add this to your .env file

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for api routes and public assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get the token using next-auth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // For public routes
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      );
    }
    return NextResponse.next();
  }

  // For protected routes
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // For admin routes, add a query parameter instead of redirecting
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'ADMIN') {
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('unauthorized', 'admin');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
