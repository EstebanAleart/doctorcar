import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET single appointment
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

// PUT update appointment
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const appointment = await query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (appointment.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const {
      scheduledDate,
      scheduledTime,
      duration,
      type,
      status,
      notes,
    } = body;

    const fields = [];
    const values = [];
    let i = 1;

    if (scheduledDate !== undefined) {
      fields.push(`scheduled_date = $${i++}`);
      values.push(scheduledDate);
    }
    if (scheduledTime !== undefined) {
      fields.push(`scheduled_time = $${i++}`);
      values.push(scheduledTime);
    }
    if (duration !== undefined) {
      fields.push(`duration_minutes = $${i++}`);
      values.push(duration);
    }
    if (type !== undefined) {
      fields.push(`appointment_type = $${i++}`);
      values.push(type);
    }
    if (status !== undefined) {
      fields.push(`status = $${i++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${i++}`);
      values.push(notes);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE appointment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
