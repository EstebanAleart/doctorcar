import { redirect } from 'next/navigation';

export async function GET(request) {
  const logoutUrl = new URL('https://' + process.env.AUTH0_DOMAIN + '/v2/logout');
  logoutUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID);
  logoutUrl.searchParams.append('returnTo', process.env.AUTH0_BASE_URL);
  
  redirect(logoutUrl.toString());
}

export async function POST(request) {
  return GET(request);
}
