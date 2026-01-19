import { NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/finance-stats
export async function GET() {
  try {
    // Suma de installments pagados y pendientes, agrupando por status
    const { rows } = await pool.query(`
      SELECT 
        SUM(CASE WHEN pi.status = 'paid' THEN pi.installment_amount ELSE 0 END) AS total_paid,
        SUM(CASE WHEN pi.status != 'paid' THEN pi.installment_amount ELSE 0 END) AS total_pending
      FROM payment_installments pi
      JOIN payments p ON pi.payment_id = p.id
      JOIN billing b ON p.billing_id = b.id
      JOIN claims c ON b.claim_id = c.id
    `);
    const { total_paid, total_pending } = rows[0] || { total_paid: 0, total_pending: 0 };
    return NextResponse.json({
      totalRevenue: parseFloat(total_paid) || 0,
      pendingRevenue: parseFloat(total_pending) || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load finance stats' }, { status: 500 });
  }
}
