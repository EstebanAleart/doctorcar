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

    // Return all booked dates with claim details
    const result = await query(
      `SELECT 
        c.id,
        c.appointment_date::date AS date,
        c.description,
        c.client_id,
        u.name AS client_name,
        v.brand,
        v.model,
        v.plate
       FROM claims c
       JOIN users u ON c.client_id = u.id
       JOIN vehicles v ON c.vehicle_id = v.id
       WHERE c.appointment_date IS NOT NULL AND c.approval_status = 'accepted'
       ORDER BY c.appointment_date::date`
    );

    // Group by date and create work orders with two-day blocks
    const workOrders = result.rows.map((row) => ({
      id: row.id,
      date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0],
      clientName: row.client_name,
      description: row.description,
      vehicle: `${row.brand} ${row.model}`,
      plate: row.plate,
    }));

    // For booked dates, each appointment blocks two days starting from appointment_date
    const bookedDates = new Set();
    workOrders.forEach((order) => {
      // order.date es string en formato 'YYYY-MM-DD'
      const dateStr = typeof order.date === 'string' ? order.date : new Date(order.date).toISOString().split('T')[0];
      bookedDates.add(dateStr);
      
      // Sumar un día al string
      const dateParts = dateStr.split('-');
      const nextDayDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]) + 1);
      const year = nextDayDate.getFullYear();
      const month = String(nextDayDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDayDate.getDate()).padStart(2, '0');
      bookedDates.add(`${year}-${month}-${day}`);
    });

    return NextResponse.json({ 
      bookedDates: Array.from(bookedDates),
      workOrders 
    });
  } catch (error) {
    console.error('Error fetching calendar dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
