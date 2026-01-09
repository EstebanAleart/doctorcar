import { NextResponse } from 'next/server';
import { billingDb, billingItemDb, paymentDb, claimDb, budgetItemDb, developDb } from '@/lib/database';

// GET all billing records with related data
export async function GET() {
  try {
    const billings = await billingDb.getAll();
    
    // Get items and payments for each billing
    const billingsWithDetails = await Promise.all(
      billings.map(async (billing) => {
        const items = await billingItemDb.getByBillingId(billing.id);
        const payments = await paymentDb.getByBillingId(billing.id);
        return { ...billing, items, payments };
      })
    );

    return NextResponse.json(billingsWithDetails);
  } catch (error) {
    console.error('Error loading billing:', error);
    return NextResponse.json({ error: 'Failed to load billing' }, { status: 500 });
  }
}

// POST create billing from accepted claim
export async function POST(request) {
  try {
    const { claimId } = await request.json();

    // Check if billing already exists for this claim
    const existingBilling = await billingDb.findByClaimId(claimId);
    if (existingBilling) {
      return NextResponse.json(
        { error: 'Billing already exists for this claim' },
        { status: 400 }
      );
    }

    // Get claim to verify it's accepted
    const claim = await claimDb.findById(claimId);
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }
    if (claim.approval_status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted claims can be billed' },
        { status: 400 }
      );
    }

    // Get budget items for this claim
    const budgetItems = await budgetItemDb.findByClaimId(claimId);
    if (!budgetItems || budgetItems.length === 0) {
      return NextResponse.json(
        { error: 'No budget items found for this claim' },
        { status: 400 }
      );
    }

    // Calculate subtotal from budget items
    const subtotal = budgetItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    // Calculate development fee (10%)
    const developmentFee = subtotal * 0.10;
    const totalAmount = subtotal + developmentFee;

    // Create billing record
    const billing = await billingDb.create({
      claimId,
      billingDate: new Date(),
      customerType: 'individual',
      subtotal,
      totalAmount,
      balance: totalAmount
    });

    // Create develop record with 10% calculation
    await developDb.create({
      billingId: billing.id,
      percentage: 10.00,
      amount: developmentFee
    });

    // Create billing items from budget items
    await Promise.all(budgetItems.map(item =>
      billingItemDb.create({
        billingId: billing.id,
        budgetItemId: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        itemType: item.item_type || 'labor'
      })
    ));

    // Add development fee as separate item
    await billingItemDb.create({
      billingId: billing.id,
      budgetItemId: null,
      description: 'Comisión por desarrollo (10%)',
      quantity: 1,
      unitPrice: developmentFee,
      itemType: 'other'
    });

    // Get complete billing with items
    const items = await billingItemDb.getByBillingId(billing.id);

    return NextResponse.json({ ...billing, items });
  } catch (error) {
    console.error('Error creating billing:', error);
    return NextResponse.json({ error: 'Failed to create billing' }, { status: 500 });
  }
}
