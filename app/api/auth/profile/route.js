import { getSession } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    // Redirect to Auth0 login
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/api/auth/login`);
  }
  return NextResponse.json(session.user);
}
