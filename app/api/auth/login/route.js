import { redirect } from 'next/navigation';

export async function GET(request) {
  const loginUrl = new URL('https://' + process.env.AUTH0_DOMAIN + '/authorize');
  loginUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID);
  loginUrl.searchParams.append('redirect_uri', process.env.AUTH0_BASE_URL + '/api/auth/callback');
  loginUrl.searchParams.append('response_type', 'code');
  loginUrl.searchParams.append('scope', process.env.AUTH0_SCOPE || 'openid profile email');
  
  redirect(loginUrl.toString());
}

export async function POST(request) {
  return GET(request);
}
