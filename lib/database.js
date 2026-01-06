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

export default pool;

// Helper function for raw queries
export async function query(text, params) {
  return pool.query(text, params);
}
