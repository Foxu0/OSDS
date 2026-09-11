import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Completely Public Paths (Allowed for all visitors without touching authentication session)
  const isPublicPath =
    path === '/' ||
    path === '/login' ||
    path.startsWith('/events') ||
    path.startsWith('/ticket') ||
    path.startsWith('/verify') ||
    path.startsWith('/api/');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Legacy routes cleanup: redirect old student, judge, coordinator links
  if (
    path.startsWith('/student') ||
    path.startsWith('/judge') ||
    path.startsWith('/coordinator')
  ) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-secret-key-2026',
    });
    if (token) {
      return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 3. Protected routes: /admin and /officer
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-secret-key-2026',
  });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string) || '';

  // Admin area guard
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/officer', req.url));
  }

  // Officer area guard (Admin can also access officer operational tools)
  if (path.startsWith('/officer') && role !== 'OFFICER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/officer/:path*',
    '/student/:path*',
    '/judge/:path*',
    '/coordinator/:path*',
    '/dashboard-redirect',
  ],
};
