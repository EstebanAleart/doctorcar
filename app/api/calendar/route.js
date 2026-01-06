import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/calendar - Returns booked dates (accepted appointments)
export async function GET(request) {
  try {
    const cookie = request.cookies.get('auth_session');
    if (!cookie?.value) {
      // Allow public read? For now, require login
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString());
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return all booked dates
    const result = await query(
      `SELECT appointment_date::date AS date, COUNT(*) AS count
       FROM claims
       WHERE appointment_date IS NOT NULL AND approval_status = 'accepted'
       GROUP BY appointment_date::date
       ORDER BY appointment_date::date`
    );

    const bookedDates = result.rows.map(r => ({ date: r.date, count: Number(r.count) }));
    return NextResponse.json({ bookedDates });
  } catch (error) {
    console.error('Error fetching calendar dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
