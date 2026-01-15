import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 500 });
    }
    const u = new URL(url);
    const host = u.hostname;
    const port = u.port || (u.protocol === 'postgresql:' ? '5432' : '');
    const dbName = u.pathname.replace(/^\//, '');
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const isSupabase = host.includes('supabase.com') || host.includes('supabase.co');

    return NextResponse.json({
      ok: true,
      host,
      port,
      dbName,
      isLocal,
      isSupabase,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
