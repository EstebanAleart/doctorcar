import { NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  let returnTo = '/client';
  if (stateParam) {
    try {
      const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
      if (parsed?.returnTo && typeof parsed.returnTo === 'string') {
        returnTo = parsed.returnTo;
      }
    } catch (e) {
      // Invalid state param, continue without it
    }
  }

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
      const body = await tokenResponse.text();
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      throw new Error('Missing access token');
    }

    // Fetch user profile from Auth0
    const profileRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileRes.ok) {
      const body = await profileRes.text();
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

    // Store ONLY session token in httpOnly cookie (no user data)
    const sessionToken = Buffer.from(
      JSON.stringify({ sub: authUser.sub, iat: Date.now() })
    ).toString('base64url');

    const response = NextResponse.redirect(new URL(returnTo, process.env.AUTH0_BASE_URL));
    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.AUTH0_BASE_URL.startsWith('https'),
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
