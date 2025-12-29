import { NextResponse } from 'next/server';

export async function GET() {
  const logoutUrl = new URL('https://' + process.env.AUTH0_DOMAIN + '/v2/logout');
  logoutUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID);
  logoutUrl.searchParams.append('returnTo', process.env.AUTH0_BASE_URL);

  const response = NextResponse.redirect(logoutUrl.toString());
  response.cookies.set('auth_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.AUTH0_BASE_URL.startsWith('https'),
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function POST(request) {
  return GET(request);
}
