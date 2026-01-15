import { NextResponse } from 'next/server';

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
    
    // Fetch user info from Auth0
    const userRes = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await userRes.json();
    
    // Store user data in cookie
    const userData = JSON.stringify({
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
    });

    const response = NextResponse.redirect(new URL(returnTo, process.env.AUTH0_BASE_URL));
    
    // Set session cookie with user data
    response.cookies.set('auth_user', userData, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 7, // 7 days
    });
    
    response.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in || 86400,
    });

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}
