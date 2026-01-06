import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json(session.user);
}
