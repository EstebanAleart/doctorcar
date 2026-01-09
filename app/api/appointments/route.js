import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { nanoid } from 'nanoid';

// GET all appointments
export async function GET(request) {
  try {
    const result = await query(
      `SELECT 
        a.id,
        a.claim_id,
        a.scheduled_date,
        a.scheduled_time,
        a.status,
        a.appointment_type,
        a.duration_minutes,
        a.notes,
        c.description AS claim_description,
        u.name AS client_name,
        u.id AS client_id,
        v.brand,
        v.model,
        v.plate,
        v.id AS vehicle_id
       FROM appointments a
       JOIN claims c ON a.claim_id = c.id
       JOIN users u ON c.client_id = u.id
       JOIN vehicles v ON c.vehicle_id = v.id
       WHERE a.status NOT IN ('cancelled')
       ORDER BY a.scheduled_date DESC, a.scheduled_time`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST create appointment
export async function POST(request) {
  try {
    const cookie = request.cookies.get('auth_session');
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      claimId,
      scheduledDate,
      scheduledTime,
      duration,
      type,
      notes,
    } = body;

    console.log('[POST /api/appointments] Received:', { claimId, scheduledDate, scheduledTime, duration, type, notes });

    if (!claimId || !scheduledDate) {
      console.log('[POST /api/appointments] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: claimId, scheduledDate' },
        { status: 400 }
      );
    }

    // Verify claim exists
    const claimCheck = await query('SELECT id FROM claims WHERE id = $1', [claimId]);
    if (claimCheck.rows.length === 0) {
      console.log('[POST /api/appointments] Claim not found:', claimId);
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const appointmentId = nanoid();
    console.log('[POST /api/appointments] Creating appointment:', appointmentId);
    
    const result = await query(
      `INSERT INTO appointments (
        id, claim_id, scheduled_date, scheduled_time, duration_minutes,
        appointment_type, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
       RETURNING *`,
      [
        appointmentId,
        claimId,
        scheduledDate,
        scheduledTime || null,
        duration || 1440,
        type || 'inspection',
        notes || null,
      ]
    );

    console.log('[POST /api/appointments] Success, inserted:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[POST /api/appointments] Error:', error);
    return NextResponse.json({ error: 'Failed to create appointment', details: error.message }, { status: 500 });
  }
}
