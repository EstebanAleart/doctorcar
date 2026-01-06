import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/calendar - Returns booked dates from appointments table
export async function GET(request) {
  try {
    // Get all booked dates from appointments table
    const result = await query(
      `SELECT DISTINCT scheduled_date
       FROM appointments
       WHERE status NOT IN ('cancelled', 'rescheduled')
       ORDER BY scheduled_date`
    );

    // Convert dates to YYYY-MM-DD format
    const bookedDates = result.rows.map((row) => {
      const date = new Date(row.scheduled_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    return NextResponse.json({ 
      bookedDates
    });
  } catch (error) {
    console.error('Error fetching calendar dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
