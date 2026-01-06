import { NextResponse } from 'next/server';
import { billingDb, billingItemDb, paymentDb } from '@/lib/database';

// GET single billing with details
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const billing = await billingDb.findById(id);
    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    const items = await billingItemDb.getByBillingId(id);
    const payments = await paymentDb.getByBillingId(id);

    return NextResponse.json({
      ...billing,
      items,
      payments
    });
  } catch (error) {
    console.error('Error loading billing:', error);
    return NextResponse.json({ error: 'Failed to load billing' }, { status: 500 });
  }
}

// PUT update billing (for notes and receipt)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const billing = await billingDb.findById(id);
    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Update billing with new data
    await billingDb.update(id, {
      notes: data.notes,
      // Note: receipt_url would be stored in payments table ideally
      // but for quick access we can add it to billing notes
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating billing:', error);
    return NextResponse.json({ error: 'Failed to update billing' }, { status: 500 });
  }
}
