import { NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.AUTH0_BASE_URL + '/api/auth/callback',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Fetch user profile from Auth0
    const profileRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileRes.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await profileRes.json();
    const authUser = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name || profile.nickname || profile.email,
    };

    // Upsert in DB with default role client
    const dbUser = await userDb.upsertFromAuth0(authUser);

    // Store minimal session in cookie
    const cookiePayload = Buffer.from(
      JSON.stringify({ sub: authUser.sub, email: authUser.email, name: authUser.name, role: dbUser.role })
    ).toString('base64url');

    const response = NextResponse.redirect(new URL('/', process.env.AUTH0_BASE_URL));
    response.cookies.set('auth_user', cookiePayload, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.AUTH0_BASE_URL.startsWith('https'),
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
