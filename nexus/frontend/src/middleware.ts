import { NextRequest, NextResponse } from 'next/server';

// No password gate for MVP — Instagram OAuth only
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
