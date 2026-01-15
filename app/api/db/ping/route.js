import { NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function GET() {
  try {
    // Lightweight connectivity check: run a simple query via existing pool
    const users = await userDb.getAll();
    return NextResponse.json({ ok: true, usersCount: users.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
