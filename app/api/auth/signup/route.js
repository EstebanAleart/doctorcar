import { NextResponse } from 'next/server';

export async function GET() {
  const signupUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.AUTH0_BASE_URL + '/api/auth/callback')}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(process.env.AUTH0_SCOPE || 'openid profile email')}&` +
    `screen_hint=signup`;
  
  return NextResponse.redirect(signupUrl);
}
