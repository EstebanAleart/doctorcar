import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { billingDb, billingItemDb, paymentDb, paymentInstallmentDb, query } from "@/lib/database";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id, role FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id: claimId } = await context.params;

    const claimResult = await query("SELECT id, client_id FROM claims WHERE id = $1", [claimId]);
    if (claimResult.rows.length === 0) {
      return NextResponse.json({
        billing: null,
        items: [],
        payments: [],
        totals: {
          totalAmount: 0,
          paidAmount: 0,
          balance: 0,
          progress: 0,
        },
      });
    }

    if (user.role === "client" && claimResult.rows[0].client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const billing = await billingDb.findByClaimId(claimId);
    
    if (!billing) {
      return NextResponse.json({
        billing: null,
        items: [],
        payments: [],
        totals: {
          totalAmount: 0,
          paidAmount: 0,
          balance: 0,
          progress: 0,
        },
      });
    }

    const [items, payments] = await Promise.all([
      billingItemDb.getByBillingId(billing.id),
      paymentDb.getByBillingId(billing.id),
    ]);

    const paymentsWithInstallments = await Promise.all(
      payments.map(async (payment) => {
        const installments = await paymentInstallmentDb.getByPaymentId(payment.id);
        return { ...payment, installments };
      })
    );

    const paidFromInstallments = paymentsWithInstallments.reduce((total, payment) => {
      const installmentPaid = (payment.installments || []).reduce((acc, installment) => {
        if (installment.status === "paid") {
          const amount = parseFloat(installment.installment_amount || 0);
          return acc + (Number.isFinite(amount) ? amount : 0);
        }
        return acc;
      }, 0);
      return total + installmentPaid;
    }, 0);

    // Calcular balance de cuotas pendientes
    const balanceFromInstallments = paymentsWithInstallments.reduce((total, payment) => {
      const installmentBalance = (payment.installments || []).reduce((acc, installment) => {
        if (installment.status !== "paid") {
          const amount = parseFloat(installment.installment_amount || 0);
          return acc + (Number.isFinite(amount) ? amount : 0);
        }
        return acc;
      }, 0);
      return total + installmentBalance;
    }, 0);

    // Total = subtotal (lo que aprobó el cliente, sin develop fee)
    const subtotalRaw = parseFloat(billing.subtotal ?? 0);
    const totalAmount = Number.isFinite(subtotalRaw) ? subtotalRaw : 0;

    // Pagado = suma de installments con status='paid'
    const paidAmount = Number.isFinite(paidFromInstallments) ? paidFromInstallments : 0;

    // Saldo = suma de installments con status!='paid'
    const balance = Number.isFinite(balanceFromInstallments) ? balanceFromInstallments : 0;

    let status = billing.status;
    if (!status) {
      status = balance <= 0 ? "paid" : paidAmount > 0 ? "partial" : "pending";
    }

    const progress = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

    return NextResponse.json({
      ...billing,
      status,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      balance,
      items,
      payments: paymentsWithInstallments,
      totals: {
        totalAmount,
        paidAmount,
        balance,
        progress,
      },
    });
  } catch (error) {
    console.error("Error loading billing for claim", error);
    return NextResponse.json({ error: "Failed to load billing for claim" }, { status: 500 });
  }
}
