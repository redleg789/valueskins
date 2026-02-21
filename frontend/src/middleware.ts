import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'vs_auth';
const PASSWORD = process.env.SITE_PASSWORD ?? 'password@1';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the auth check API and static assets through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/api/auth-check'
  ) {
    return NextResponse.next();
  }

  // Allow the password page itself through
  if (pathname === '/gate') {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  const gateUrl = req.nextUrl.clone();
  gateUrl.pathname = '/gate';
  gateUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
