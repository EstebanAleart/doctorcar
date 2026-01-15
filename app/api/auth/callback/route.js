import { NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  let returnTo = '/client';
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
      returnTo = decoded.returnTo || '/client';
    } catch (e) {
      // Invalid state, use default
    }
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
      }),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.json();
      console.error('Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error.error_description}`);
    }

    const tokens = await tokenRes.json();

    // Decode id_token to get user info (it's a JWT)
    let userInfo;
    try {
      const idTokenParts = tokens.id_token.split('.');
      const userPayload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());
      userInfo = {
        sub: userPayload.sub,
        email: userPayload.email,
        name: userPayload.name || userPayload.email,
      };
    } catch (e) {
      console.error('Failed to decode id_token:', e);
      throw new Error('Invalid id_token');
    }

    // Ensure user exists in DB with default client role
    await userDb.upsertFromAuth0({
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    });

    // Create session cookie expected by /api/user
    const sessionToken = Buffer.from(
      JSON.stringify({ sub: userInfo.sub, iat: Date.now() })
    ).toString('base64url');

    const response = NextResponse.redirect(new URL(returnTo, process.env.AUTH0_BASE_URL));

    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    // Optional: keep access token for future server-side calls
    response.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
      maxAge: tokens.expires_in || 86400,
    });

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message, code: error.code, detail: error.detail },
      { status: 500 }
    );
  }
}
