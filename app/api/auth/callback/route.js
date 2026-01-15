import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
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

    if (!response.ok) {
      const error = await response.json();
      console.error('Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error.error_description}`);
    }

    const tokens = await response.json();
    
    // Redirect to client dashboard
    const redirect = NextResponse.redirect(new URL('/client', process.env.AUTH0_BASE_URL));
    
    // Set session cookie
    redirect.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in || 86400,
    });

    return redirect;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}
