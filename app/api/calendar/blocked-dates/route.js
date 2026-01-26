import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/calendar/blocked-dates - Add a blocked date
export async function POST(request) {
  try {
    const { date, reason } = await request.json();
    if (!date) {
      return NextResponse.json({ error: 'Missing date' }, { status: 400 });
    }
    await query(
      `INSERT INTO blocked_dates (date, reason) VALUES ($1, $2)`,
      [date, reason || null]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/calendar/blocked-dates - Get all blocked dates
export async function GET() {
  try {
    const result = await query(`SELECT date::TEXT as date, reason FROM blocked_dates ORDER BY date`);
    return NextResponse.json({ blockedDates: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
