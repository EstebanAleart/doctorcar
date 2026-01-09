import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/calendar - Returns booked dates from appointments table
export async function GET(request) {
  try {
    // Get all booked dates from appointments table
    // Cast to TEXT to get the date as stored (YYYY-MM-DD)
    const result = await query(
      `SELECT DISTINCT scheduled_date::DATE::TEXT as scheduled_date
       FROM appointments
       WHERE status NOT IN ('cancelled', 'rescheduled')
       ORDER BY scheduled_date`
    );

    // Convert dates to YYYY-MM-DD format and add next day (48h minimum)
    const bookedDatesSet = new Set();
    
    // Helper function to calculate next day without timezone issues
    const getNextDay = (dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + 1);
      const nextYear = date.getFullYear();
      const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
      const nextDay = String(date.getDate()).padStart(2, '0');
      return `${nextYear}-${nextMonth}-${nextDay}`;
    };
    
    result.rows.forEach((row) => {
      // Extract date string directly (already in YYYY-MM-DD format from ::TEXT cast)
      const dateStr = row.scheduled_date;
      
      bookedDatesSet.add(dateStr);
      
      // Add next day (48h)
      const nextDay = getNextDay(dateStr);
      bookedDatesSet.add(nextDay);
    });

    return NextResponse.json({ 
      bookedDates: Array.from(bookedDatesSet)
    });
  } catch (error) {
    console.error('Error fetching calendar dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
