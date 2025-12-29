import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  // For now, passthrough. Auth0 routes are handled via explicit route handlers in /app/api/auth/
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*'],
};
