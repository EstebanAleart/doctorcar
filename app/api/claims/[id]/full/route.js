import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query, billingDb, billingItemDb, paymentDb, paymentInstallmentDb } from "@/lib/database";

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

    // Get full claim data
    const claimResult = await query(
      `SELECT c.*, v.brand, v.model, v.plate, v.year, v.color,
              u.name as client_name, u.email as client_email, u.phone as client_phone,
              emp.name as employee_name
       FROM claims c
       JOIN vehicles v ON c.vehicle_id = v.id
       JOIN users u ON c.client_id = u.id
       LEFT JOIN users emp ON c.employee_id = emp.id
       WHERE c.id = $1`,
      [claimId]
    );

    if (claimResult.rows.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = claimResult.rows[0];

    // Check permissions
    if (user.role === "client" && claim.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get budget items
    const budgetItems = await query(
      "SELECT * FROM budget_items WHERE claim_id = $1 ORDER BY created_at ASC",
      [claimId]
    );

    // Get appointments
    const appointments = await query(
      "SELECT * FROM appointments WHERE claim_id = $1 AND status != 'cancelled' ORDER BY scheduled_date ASC",
      [claimId]
    );

    // Get billing with full payment details
    const billing = await billingDb.findByClaimId(claimId);
    let billingData = null;

    if (billing) {
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
            return acc + parseFloat(installment.installment_amount || 0);
          }
          return acc;
        }, 0);
        return total + installmentPaid;
      }, 0);

      const totalAmount = parseFloat(billing.total_amount || 0);
      const paidAmount = parseFloat(billing.paid_amount || paidFromInstallments);
      const balance = totalAmount - paidAmount;
      const progress = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

      billingData = {
        ...billing,
        items,
        payments: paymentsWithInstallments,
        totals: {
          totalAmount,
          paidAmount,
          balance,
          progress,
        },
      };
    }

    return NextResponse.json({
      ...claim,
      items: budgetItems.rows,
      appointments: appointments.rows,
      billing: billingData,
    });
  } catch (error) {
    console.error("Error loading full claim data:", error);
    return NextResponse.json({ error: "Failed to load claim data" }, { status: 500 });
  }
}
