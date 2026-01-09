import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/calendar - Returns booked dates from appointments table
export async function GET(request) {
  try {
    // Get all booked dates from appointments table
    // Cast to TEXT to avoid timezone conversion issues
    const result = await query(
      `SELECT DISTINCT scheduled_date::TEXT as scheduled_date
       FROM appointments
       WHERE status NOT IN ('cancelled', 'rescheduled')
       ORDER BY scheduled_date`
    );

    // Convert dates to YYYY-MM-DD format and add next day (48h minimum)
    const bookedDatesSet = new Set();
    result.rows.forEach((row) => {
      // Extract date string directly (already in YYYY-MM-DD format from ::TEXT cast)
      const dateStr = row.scheduled_date;
      
      bookedDatesSet.add(dateStr);
      
      // Add next day (48h)
      const date = new Date(dateStr + 'T00:00:00');
      date.setDate(date.getDate() + 1);
      const nextYear = date.getFullYear();
      const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
      const nextDay = String(date.getDate()).padStart(2, '0');
      bookedDatesSet.add(`${nextYear}-${nextMonth}-${nextDay}`);
    });

    return NextResponse.json({ 
      bookedDates: Array.from(bookedDatesSet)
    });
  } catch (error) {
    console.error('Error fetching calendar dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
