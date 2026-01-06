import { NextResponse } from 'next/server';
import { billingDb, paymentDb } from '@/lib/database';

// POST create payment for a billing
export async function POST(request, { params }) {
  try {
    const billingId = params.id;
    const data = await request.json();

    // Get current billing
    const billing = await billingDb.findById(billingId);
    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Validate payment amount
    if (data.amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Create payment record
    const payment = await paymentDb.create({
      billingId,
      paymentDate: new Date(),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      cardInstallments: data.cardInstallments || 1,
      cardInterestRate: data.cardInterestRate || 0,
      bankName: data.bankName || null,
      receiptUrl: data.receiptUrl || null,
      notes: data.notes || null
    });

    // Calculate new paid amount and balance
    const totalPaid = await paymentDb.getTotalPaidForBilling(billingId);
    const newBalance = billing.total_amount - totalPaid;

    // Determine new billing status
    let newStatus = 'pending';
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }

    // Update billing
    await billingDb.update(billingId, {
      paidAmount: totalPaid,
      balance: newBalance,
      status: newStatus
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// GET all payments for a billing
export async function GET(request, { params }) {
  try {
    const billingId = params.id;
    const payments = await paymentDb.getByBillingId(billingId);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error loading payments:', error);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}
