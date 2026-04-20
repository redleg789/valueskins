import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/chat',
  '/discover',
  '/notifications',
  '/creator',
  '/brand',
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requiresDemoSession = PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));

  if (!requiresDemoSession) {
    return NextResponse.next();
  }

  const hasSession = req.cookies.get('valueskins_demo_session')?.value === '1';
  if (hasSession) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/auth/login', req.url));
}

export const config = {
  matcher: ['/chat/:path*', '/discover/:path*', '/notifications/:path*', '/creator/:path*', '/brand/:path*'],
};
