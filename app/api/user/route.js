import { auth0 } from '@/lib/auth0';
import { userDb } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Crear o actualizar usuario en la BD
    let user = await userDb.findByAuth0Id(session.user.sub);
    if (!user) {
      user = await userDb.upsertFromAuth0(session.user);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
