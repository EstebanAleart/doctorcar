import { redirect } from 'next/navigation';

export async function GET(request) {
  const state = Buffer.from(JSON.stringify({ returnTo: '/client' })).toString('base64url');
  const signupUrl = new URL('https://' + process.env.AUTH0_DOMAIN + '/authorize');
  signupUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID);
  signupUrl.searchParams.append('redirect_uri', process.env.AUTH0_BASE_URL + '/api/auth/callback');
  signupUrl.searchParams.append('response_type', 'code');
  signupUrl.searchParams.append('scope', process.env.AUTH0_SCOPE || 'openid profile email');
  signupUrl.searchParams.append('screen_hint', 'signup');
  signupUrl.searchParams.append('state', state);
  signupUrl.searchParams.append('prompt', 'login');
  
  redirect(signupUrl.toString());
}

export async function POST(request) {
  return GET(request);
}
