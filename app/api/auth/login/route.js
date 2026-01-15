import { redirect } from 'next/navigation';

export async function GET(request) {
  const state = Buffer.from(JSON.stringify({ returnTo: '/client' })).toString('base64url');
  const loginUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize`);
  loginUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID);
  loginUrl.searchParams.append('redirect_uri', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
  loginUrl.searchParams.append('response_type', 'code');
  loginUrl.searchParams.append('scope', 'openid profile email');
  loginUrl.searchParams.append('state', state);
  
  redirect(loginUrl.toString());
}

export async function POST(request) {
  return GET(request);
}
