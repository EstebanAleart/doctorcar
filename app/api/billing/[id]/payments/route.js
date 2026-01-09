import { NextResponse } from 'next/server';
import { billingDb, paymentDb, paymentInstallmentDb } from '@/lib/database';

// POST create payment for a billing
export async function POST(request, context) {
  try {
    const { id: billingId } = await context.params;
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

    // Create installment records if applicable
    if (data.installments && Array.isArray(data.installments)) {
      await Promise.all(
        data.installments.map((inst, idx) =>
          paymentInstallmentDb.create({
            paymentId: payment.id,
            installmentNumber: idx + 1,
            installmentAmount: inst.amount,
            dueDate: inst.dueDate || null,
            status: 'pending'
          })
        )
      );
    }

    // Obtener todos los installments para calcular el total pagado real
    const allPayments = await paymentDb.getByBillingId(billingId);
    let totalPaidFromInstallments = 0;
    for (const p of allPayments) {
      const installments = await paymentInstallmentDb.getByPaymentId(p.id);
      installments.forEach((inst) => {
        if (inst.status === 'paid') {
          totalPaidFromInstallments += parseFloat(inst.installment_amount || 0);
        }
      });
    }

    const newBalance = (billing.total_amount || 0) - totalPaidFromInstallments;

    // Determine new billing status
    let newStatus = 'pending';
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (totalPaidFromInstallments > 0) {
      newStatus = 'partial';
    }

    // Update billing
    await billingDb.update(billingId, {
      paidAmount: totalPaidFromInstallments,
      balance: newBalance,
      status: newStatus
    });

    // Get installments
    const installments = await paymentInstallmentDb.getByPaymentId(payment.id);

    return NextResponse.json({ ...payment, installments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// GET all payments for a billing OR get specific installment details
export async function GET(request, context) {
  try {
    const { id: billingId } = await context.params;
    const { searchParams } = new URL(request.url);
    const installmentId = searchParams.get('installmentId');
    
    // Si se solicita un installment específico
    if (installmentId) {
      const installment = await paymentInstallmentDb.getById(installmentId);
      if (!installment) {
        return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
      }
      return NextResponse.json(installment);
    }
    
    // Si no, devolver todos los payments con installments
    const payments = await paymentDb.getByBillingId(billingId);
    
    // Cargar installments para cada payment
    const paymentsWithInstallments = await Promise.all(
      payments.map(async (payment) => {
        const installments = await paymentInstallmentDb.getByPaymentId(payment.id);
        return { ...payment, installments };
      })
    );
    
    return NextResponse.json(paymentsWithInstallments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}

// PUT update payment for a billing
export async function PUT(request, context) {
  try {
    const { id: billingId } = await context.params;
    const data = await request.json();
    const { paymentId, installmentId, installmentStatus } = data;

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const billing = await billingDb.findById(billingId);
    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Si se está actualizando el estado de un installment específico
    if (installmentId && installmentStatus) {
      try {
        await paymentInstallmentDb.update(installmentId, { 
          status: installmentStatus,
          receiptUrl: data.receiptUrl || null,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          notes: data.notes || null
        });
      } catch (updateError) {
        console.error('Error updating installment:', updateError);
        return NextResponse.json({ error: 'Failed to update installment', details: updateError.message }, { status: 500 });
      }
      
      // Verificar si todos los installments están completados para actualizar el payment
      const installments = await paymentInstallmentDb.getByPaymentId(paymentId);
      const allCompleted = installments.length > 0 && installments.every((i) => i.status === 'paid');
      const derivedPaymentStatus = allCompleted ? 'completed' : 'pending';
      
      await paymentDb.update(paymentId, { status: derivedPaymentStatus });

      // Recalcular totales del billing
      const allPayments = await paymentDb.getByBillingId(billingId);
      let totalPaidFromInstallments = 0;
      for (const p of allPayments) {
        const insts = await paymentInstallmentDb.getByPaymentId(p.id);
        insts.forEach((inst) => {
          if (inst.status === 'paid') {
            totalPaidFromInstallments += parseFloat(inst.installment_amount || 0);
          }
        });
      }

      const newBalance = (billing.total_amount || 0) - totalPaidFromInstallments;

      let newStatus = 'pending';
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (totalPaidFromInstallments > 0) {
        newStatus = 'partial';
      }

      await billingDb.update(billingId, {
        paidAmount: totalPaidFromInstallments,
        balance: newBalance,
        status: newStatus,
      });

      const updatedInstallments = await paymentInstallmentDb.getByPaymentId(paymentId);
      const payment = await paymentDb.getByBillingId(billingId);
      return NextResponse.json({ success: true, installments: updatedInstallments });
    }

    // Actualización completa del payment (lógica existente)
    const updatedPayment = await paymentDb.update(paymentId, {
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      cardInstallments: data.cardInstallments,
      cardInterestRate: data.cardInterestRate,
      bankName: data.bankName,
      receiptUrl: data.receiptUrl,
      notes: data.notes,
      status: data.status,
    });

    // Delete old installments and create new ones
    if (data.installments && Array.isArray(data.installments)) {
      await paymentInstallmentDb.deleteByPaymentId(paymentId);
      await Promise.all(
        data.installments.map((inst, idx) =>
          paymentInstallmentDb.create({
            paymentId: paymentId,
            installmentNumber: idx + 1,
            installmentAmount: inst.amount,
            dueDate: inst.dueDate || null,
            status: inst.status || 'pending'
          })
        )
      );
    }

    // Get installments and derive payment status
    const installments = await paymentInstallmentDb.getByPaymentId(paymentId);
    const allCompleted = installments.length > 0 && installments.every((i) => i.status === 'paid');
    const derivedPaymentStatus = allCompleted ? 'completed' : 'pending';

    let finalPayment = updatedPayment;
    if (updatedPayment.status !== derivedPaymentStatus) {
      finalPayment = await paymentDb.update(paymentId, { status: derivedPaymentStatus });
    }

    // Recalcular total pagado basado en installments completados
    const allPayments = await paymentDb.getByBillingId(billingId);
    let totalPaidFromInstallments = 0;
    for (const p of allPayments) {
      const insts = await paymentInstallmentDb.getByPaymentId(p.id);
      insts.forEach((inst) => {
        if (inst.status === 'completed') {
          totalPaidFromInstallments += parseFloat(inst.installment_amount || 0);
        }
      });
    }

    const newBalance = (billing.total_amount || 0) - totalPaidFromInstallments;

    let newStatus = 'pending';
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (totalPaidFromInstallments > 0) {
      newStatus = 'partial';
    }

    await billingDb.update(billingId, {
      paidAmount: totalPaidFromInstallments,
      balance: newBalance,
      status: newStatus,
    });

    return NextResponse.json({ ...finalPayment, installments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
