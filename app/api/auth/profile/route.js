import { NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function GET(request) {
  try {
    const cookie = request.cookies.get('auth_session');

    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString());

    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from DB using auth0 sub
    const user = await userDb.findByAuth0Id(decoded.sub);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
