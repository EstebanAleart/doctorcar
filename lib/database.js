import pg from 'pg';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Schema initialization moved to scripts/db-init.js to avoid build-time connections

export const userDb = {
  async upsertFromAuth0(auth0User) {
    const id = auth0User.sub || auth0User.user_id;
    const { rows } = await pool.query(
      `INSERT INTO users (id, auth0_id, email, name, role, role_id)
       VALUES ($1,$2,$3,$4,'client', 'client')
       ON CONFLICT(auth0_id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, updated_at=CURRENT_TIMESTAMP
       RETURNING *`,
      [id, id, auth0User.email, auth0User.name || auth0User.email]
    );
    return rows[0];
  },
  async findByAuth0Id(auth0Id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE auth0_id=$1', [auth0Id]);
    return rows[0];
  },
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    return rows[0];
  },
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return rows[0];
  },
  async getAll() {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  },
  async getAllByRole(role) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE (role_id = $1 OR role = $1) ORDER BY created_at DESC',
      [role]
    );
    return rows;
  },
  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    if (data.name !== undefined) { fields.push(`name=$${i++}`); values.push(data.name); }
    if (data.email !== undefined) { fields.push(`email=$${i++}`); values.push(data.email); }
    if (data.phone !== undefined) { fields.push(`phone=$${i++}`); values.push(data.phone); }
    if (data.role !== undefined) {
      const roleIdx = i++;
      fields.push(`role=$${roleIdx}`);
      fields.push(`role_id=$${roleIdx}`);
      values.push(data.role);
    }
    fields.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    const { rows } = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  },
  async delete(id) { await pool.query('DELETE FROM users WHERE id=$1', [id]); }
};

export const vehicleDb = {
  async create(data) {
    const id = `VEH-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const { rows } = await pool.query(
      `INSERT INTO vehicles (id, client_id, brand, model, year, plate, color)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, data.clientId, data.brand, data.model, data.year, data.plate, data.color]
    );
    return rows[0];
  },
  async findById(id) { const { rows } = await pool.query('SELECT * FROM vehicles WHERE id=$1', [id]); return rows[0]; },
  async getByClientId(clientId) { const { rows } = await pool.query('SELECT * FROM vehicles WHERE client_id=$1 ORDER BY created_at DESC', [clientId]); return rows; },
  async getAll() { const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC'); return rows; },
  async update(id, data) {
    const fields = []; const values = []; let i = 1;
    if (data.brand !== undefined) { fields.push(`brand=$${i++}`); values.push(data.brand); }
    if (data.model !== undefined) { fields.push(`model=$${i++}`); values.push(data.model); }
    if (data.year !== undefined) { fields.push(`year=$${i++}`); values.push(data.year); }
    if (data.plate !== undefined) { fields.push(`plate=$${i++}`); values.push(data.plate); }
    if (data.color !== undefined) { fields.push(`color=$${i++}`); values.push(data.color); }
    values.push(id);
    const { rows } = await pool.query(`UPDATE vehicles SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  },
  async delete(id) { await pool.query('DELETE FROM vehicles WHERE id=$1', [id]); }
};

export const claimDb = {
  async create(data) {
    const id = `CLM-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const { rows } = await pool.query(
      `INSERT INTO claims (id, client_id, vehicle_id, type, company_name, description, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
      [id, data.clientId, data.vehicleId, data.type, data.companyName || null, data.description]
    );
    return rows[0];
  },
  async findById(id) { const { rows } = await pool.query('SELECT * FROM claims WHERE id=$1', [id]); return rows[0]; },
  async getByClientId(clientId) { const { rows } = await pool.query('SELECT * FROM claims WHERE client_id=$1 ORDER BY created_at DESC', [clientId]); return rows; },
  async getByEmployeeId(employeeId) { const { rows } = await pool.query('SELECT * FROM claims WHERE employee_id=$1 ORDER BY created_at DESC', [employeeId]); return rows; },
  async getAll() { const { rows } = await pool.query('SELECT * FROM claims ORDER BY created_at DESC'); return rows; },
  async update(id, data) {
    const fields = []; const values = []; let i = 1;
    if (data.employeeId !== undefined) { fields.push(`employee_id=$${i++}`); values.push(data.employeeId); }
    if (data.status !== undefined) { fields.push(`status=$${i++}`); values.push(data.status); }
    if (data.estimatedCost !== undefined) { fields.push(`estimated_cost=$${i++}`); values.push(data.estimatedCost); }
    if (data.description !== undefined) { fields.push(`description=$${i++}`); values.push(data.description); }
    fields.push('updated_at=CURRENT_TIMESTAMP'); values.push(id);
    const { rows } = await pool.query(`UPDATE claims SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  },
  async delete(id) { await pool.query('DELETE FROM claims WHERE id=$1', [id]); }
};

export const budgetItemDb = {
  async create(data) {
    const id = `ITM-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const total = data.quantity * data.unitPrice;
    const { rows } = await pool.query(
      `INSERT INTO budget_items (id, claim_id, description, quantity, unit_price, total)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, data.claimId, data.description, data.quantity, data.unitPrice, total]
    );
    return rows[0];
  },
  async getByClaimId(claimId) { const { rows } = await pool.query('SELECT * FROM budget_items WHERE claim_id=$1 ORDER BY created_at DESC', [claimId]); return rows; },
  async update(id, data) {
    const fields = []; const values = []; let i = 1;
    if (data.description !== undefined) { fields.push(`description=$${i++}`); values.push(data.description); }
    if (data.quantity !== undefined) { fields.push(`quantity=$${i++}`); values.push(data.quantity); }
    if (data.unitPrice !== undefined) { fields.push(`unit_price=$${i++}`); values.push(data.unitPrice); }
    if (data.quantity !== undefined || data.unitPrice !== undefined) {
      const current = await pool.query('SELECT quantity, unit_price FROM budget_items WHERE id=$1', [id]);
      const newQuantity = data.quantity ?? current.rows[0].quantity;
      const newUnitPrice = data.unitPrice ?? current.rows[0].unit_price;
      fields.push(`total=$${i++}`); values.push(newQuantity * newUnitPrice);
    }
    values.push(id);
    const { rows } = await pool.query(`UPDATE budget_items SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  },
  async delete(id) { await pool.query('DELETE FROM budget_items WHERE id=$1', [id]); },
  async deleteByClaimId(claimId) { await pool.query('DELETE FROM budget_items WHERE claim_id=$1', [claimId]); }
};

export const workshopDb = {
  async get() { const { rows } = await pool.query('SELECT * FROM workshop_config WHERE id=1'); return rows[0]; },
  async update(data) {
    const fields = []; const values = []; let i = 1;
    if (data.name !== undefined) { fields.push(`name=$${i++}`); values.push(data.name); }
    if (data.address !== undefined) { fields.push(`address=$${i++}`); values.push(data.address); }
    if (data.phone !== undefined) { fields.push(`phone=$${i++}`); values.push(data.phone); }
    if (data.email !== undefined) { fields.push(`email=$${i++}`); values.push(data.email); }
    fields.push('updated_at=CURRENT_TIMESTAMP');
    const { rows } = await pool.query(`UPDATE workshop_config SET ${fields.join(', ')} WHERE id=1 RETURNING *`, values);
    return rows[0];
  }
};

export const billingDb = {
  async create(data) {
    const id = `BILL-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const billingNumber = `F-${Date.now().toString().slice(-8)}`;
    const { rows } = await pool.query(
      `INSERT INTO billing (
        id, claim_id, billing_number, billing_date, customer_type,
        subtotal, total_amount, balance, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        id,
        data.claimId,
        billingNumber,
        data.billingDate || new Date(),
        data.customerType || 'individual',
        data.subtotal || 0,
        data.totalAmount || 0,
        data.balance || 0,
        'pending'
      ]
    );
    return rows[0];
  },
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM billing WHERE id=$1', [id]);
    return rows[0];
  },
  async findByClaimId(claimId) {
    const { rows } = await pool.query('SELECT * FROM billing WHERE claim_id=$1', [claimId]);
    return rows[0];
  },
  async getAll() {
    const { rows } = await pool.query(`
      SELECT 
        b.*,
        c.client_id,
        c.approval_status as claim_approval_status,
        u.name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.plate as vehicle_plate,
        v.year as vehicle_year,
        COALESCE(SUM(CASE WHEN pi.status = 'paid' THEN pi.installment_amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN pi.status != 'paid' THEN pi.installment_amount ELSE 0 END), 0) as balance
      FROM billing b
      JOIN claims c ON b.claim_id = c.id
      JOIN users u ON c.client_id = u.id
      JOIN vehicles v ON c.vehicle_id = v.id
      LEFT JOIN payments p ON b.id = p.billing_id
      LEFT JOIN payment_installments pi ON p.id = pi.payment_id
      GROUP BY b.id, c.id, u.id, v.id
      ORDER BY b.created_at DESC
    `);
    return rows;
  },
  async update(id, data) {
    const fields = []; const values = []; let i = 1;
    if (data.status !== undefined) { fields.push(`status=$${i++}`); values.push(data.status); }
      if (data.subtotal !== undefined) { fields.push(`subtotal=$${i++}`); values.push(data.subtotal); }
      if (data.totalAmount !== undefined) { fields.push(`total_amount=$${i++}`); values.push(data.totalAmount); }
    if (data.paidAmount !== undefined) { fields.push(`paid_amount=$${i++}`); values.push(data.paidAmount); }
    if (data.balance !== undefined) { fields.push(`balance=$${i++}`); values.push(data.balance); }
    if (data.notes !== undefined) { fields.push(`notes=$${i++}`); values.push(data.notes); }
    fields.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    const { rows } = await pool.query(`UPDATE billing SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  }
};

export const billingItemDb = {
  async create(data) {
    const id = `BILLITM-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const totalPrice = (data.quantity || 1) * (data.unitPrice || 0);
    const { rows } = await pool.query(
      `INSERT INTO billing_items (
        id, billing_id, budget_item_id, description, quantity, unit_price, total_price, item_type
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        id,
        data.billingId,
        data.budgetItemId || null,
        data.description,
        data.quantity || 1,
        data.unitPrice || 0,
        totalPrice,
        data.itemType || 'labor'
      ]
    );
    return rows[0];
  },
  async getByBillingId(billingId) {
    const { rows } = await pool.query('SELECT * FROM billing_items WHERE billing_id=$1', [billingId]);
    return rows;
  }
};

export const paymentDb = {
  async create(data) {
    const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const { rows } = await pool.query(
      `INSERT INTO payments (
        id, billing_id, payment_date, amount, payment_method,
        card_installments, card_interest_rate, bank_name,
        receipt_url, notes, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id,
        data.billingId,
        data.paymentDate || new Date(),
        data.amount,
        data.paymentMethod,
        data.cardInstallments || 1,
        data.cardInterestRate || 0,
        data.bankName || null,
        data.receiptUrl || null,
        data.notes || null,
        'pending'
      ]
    );
    return rows[0];
  },
  async getByBillingId(billingId) {
    const { rows } = await pool.query('SELECT * FROM payments WHERE billing_id=$1 ORDER BY payment_date DESC', [billingId]);
    return rows;
  },
  async getTotalPaidForBilling(billingId) {
    const { rows } = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE billing_id=$1 AND status=$2',
      [billingId, 'completed']
    );
    return parseFloat(rows[0].total);
  },
  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.amount !== undefined) { fields.push(`amount=$${i++}`); values.push(data.amount); }
    if (data.paymentMethod !== undefined) { fields.push(`payment_method=$${i++}`); values.push(data.paymentMethod); }
    if (data.paymentDate !== undefined) { fields.push(`payment_date=$${i++}`); values.push(data.paymentDate); }
    if (data.cardInstallments !== undefined) { fields.push(`card_installments=$${i++}`); values.push(data.cardInstallments); }
    if (data.cardInterestRate !== undefined) { fields.push(`card_interest_rate=$${i++}`); values.push(data.cardInterestRate); }
    if (data.bankName !== undefined) { fields.push(`bank_name=$${i++}`); values.push(data.bankName); }
    if (data.receiptUrl !== undefined) { fields.push(`receipt_url=$${i++}`); values.push(data.receiptUrl); }
    if (data.notes !== undefined) { fields.push(`notes=$${i++}`); values.push(data.notes); }
    if (data.status !== undefined) { fields.push(`status=$${i++}`); values.push(data.status); }

    if (fields.length === 0) {
      const { rows } = await pool.query('SELECT * FROM payments WHERE id=$1', [id]);
      return rows[0];
    }

    fields.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    const { rows } = await pool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  }
};

export const paymentInstallmentDb = {
  async create(data) {
    const id = `PAYINST-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const { rows } = await pool.query(
      `INSERT INTO payment_installments (
        id, payment_id, installment_number, installment_amount, due_date, status
      ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        id,
        data.paymentId,
        data.installmentNumber,
        data.installmentAmount,
        data.dueDate || null,
        data.status || 'pending'
      ]
    );
    return rows[0];
  },
  async getByPaymentId(paymentId) {
    const { rows } = await pool.query(
      'SELECT * FROM payment_installments WHERE payment_id=$1 ORDER BY installment_number ASC',
      [paymentId]
    );
    return rows;
  },
  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM payment_installments WHERE id=$1',
      [id]
    );
    return rows[0];
  },
  async deleteByPaymentId(paymentId) {
    await pool.query('DELETE FROM payment_installments WHERE payment_id=$1', [paymentId]);
  },
  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.status !== undefined) { fields.push(`status=$${i++}`); values.push(data.status); }
    if (data.installmentAmount !== undefined) { fields.push(`installment_amount=$${i++}`); values.push(data.installmentAmount); }
    if (data.dueDate !== undefined) { fields.push(`due_date=$${i++}`); values.push(data.dueDate); }
    if (data.receiptUrl !== undefined) { fields.push(`receipt_url=$${i++}`); values.push(data.receiptUrl); }
    if (data.paymentDate !== undefined) { fields.push(`payment_date=$${i++}`); values.push(data.paymentDate); }
    if (data.notes !== undefined) { fields.push(`notes=$${i++}`); values.push(data.notes); }

    if (fields.length === 0) {
      const { rows } = await pool.query('SELECT * FROM payment_installments WHERE id=$1', [id]);
      return rows[0];
    }

    fields.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    const { rows } = await pool.query(`UPDATE payment_installments SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
    return rows[0];
  }
};

export const developDb = {
  async create(data) {
    const id = `DEV-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    const { rows } = await pool.query(
      `INSERT INTO develop (id, billing_id, percentage, amount)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [
        id,
        data.billingId,
        data.percentage || 10.00,
        data.amount
      ]
    );
    return rows[0];
  },
  async getByBillingId(billingId) {
    const { rows } = await pool.query('SELECT * FROM develop WHERE billing_id=$1', [billingId]);
    return rows[0];
  },
  async getAll() {
    const { rows } = await pool.query('SELECT * FROM develop ORDER BY created_at DESC');
    return rows;
  }
};

export default pool;

// Helper function for raw queries
export async function query(text, params) {
  return pool.query(text, params);
}
