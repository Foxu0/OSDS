import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Root path redirect (No public portal — strictly account-based system)
  if (path === '/') {
    const secret = process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-development-secret-key-2026';
    const token = await getToken({ req, secret });
    if (token) {
      return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. Public Transit Paths
  const isPublicPath =
    path === '/login' ||
    path === '/dashboard-redirect' ||
    path.startsWith('/ticket') ||
    path.startsWith('/verify') ||
    path.startsWith('/api/');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Legacy route cleanup (old /student, /judge, /coordinator)
  if (
    path.startsWith('/student') ||
    path.startsWith('/judge') ||
    path.startsWith('/coordinator')
  ) {
    const legacyToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-development-secret-key-2026',
    });
    if (legacyToken) return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 3. Resolve auth token for protected routes
  const secret = process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-development-secret-key-2026';
  const token = await getToken({
    req,
    secret,
  });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string) || '';

  // 4. Admin-only area
  if ((path === '/admin' || path.startsWith('/admin/')) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
  }

  // 5. OSDS Officer area (OSDS + ADMIN)
  if ((path === '/osds' || path.startsWith('/osds/')) && role !== 'OSDS_OFFICER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
  }

  // 6. Org Officer area (ORG_OFFICER + OSDS_OFFICER + ADMIN)
  if (
    (path === '/org-officer' || path.startsWith('/org-officer/')) &&
    role !== 'ORG_OFFICER' &&
    role !== 'OSDS_OFFICER' &&
    role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
  }

  // 7. Legacy /officer route — accessible by all staff roles
  if (
    (path === '/officer' || path.startsWith('/officer/')) &&
    role !== 'OFFICER' &&
    role !== 'ORG_OFFICER' &&
    role !== 'OSDS_OFFICER' &&
    role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
  }

  // 8. Student dashboard area (do NOT match /dashboard-redirect)
  if ((path === '/dashboard' || path.startsWith('/dashboard/')) && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/dashboard-redirect', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/osds/:path*',
    '/org-officer/:path*',
    '/officer/:path*',
    '/dashboard/:path*',
    '/student/:path*',
    '/judge/:path*',
    '/coordinator/:path*',
    '/dashboard-redirect',
  ],
};
