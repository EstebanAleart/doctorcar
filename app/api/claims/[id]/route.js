import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import pool from '@/lib/database';
import { uploadMultipleImages, deleteMultipleImages } from '@/lib/cloudinary';
import { nanoid } from 'nanoid';

// GET /api/claims/[id] - Obtener un reclamo específico
export async function GET(request, { params }) {
  try {
    const cookie = request.cookies.get('auth_session');
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString());
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE auth0_id = $1', [decoded.sub]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;

    const claim = await query(
      `SELECT c.*, v.brand, v.model, v.plate, v.year,
              u.name as client_name, u.email as client_email, u.phone as client_phone,
              COALESCE(json_agg(b.*) FILTER (WHERE b.id IS NOT NULL), '[]') AS items
       FROM claims c
       JOIN vehicles v ON c.vehicle_id = v.id
       JOIN users u ON c.client_id = u.id
       LEFT JOIN budget_items b ON b.claim_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, v.brand, v.model, v.plate, v.year, u.name, u.email, u.phone`,
      [id]
    );

    if (claim.rows.length === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Si es cliente, verificar que sea dueño del reclamo
    if (user.role === 'client' && claim.rows[0].client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(claim.rows[0]);
  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/claims/[id] - Actualizar un reclamo
export async function PUT(request, { params }) {
  try {
    const cookie = request.cookies.get('auth_session');
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString());
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE auth0_id = $1', [decoded.sub]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;
    const body = await request.json();

    // Verificar que el reclamo existe
    const claim = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (claim.rows.length === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Si es cliente, solo puede actualizar sus propios reclamos
    if (user.role === 'client') {
      if (claim.rows[0].client_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Los clientes solo pueden editar claims que no estén aprobados/rechazados/completados
      const isEditingBlocked = claim.rows[0].approval_status === 'accepted' || 
                               claim.rows[0].approval_status === 'rejected' || 
                               claim.rows[0].status === 'completed';
      if (isEditingBlocked && (body.description || body.photos || body.photosToDelete)) {
        return NextResponse.json({ error: 'No puedes editar un reclamo aprobado, rechazado o completado' }, { status: 400 });
      }
      // Si es cliente, solo puede actualizar aprobación si está en 'in_progress'
      if (body.approval_status && claim.rows[0].status !== 'in_progress') {
        return NextResponse.json({ error: 'Can only approve claims that are in progress' }, { status: 400 });
      }
    }

    const { description, status, estimatedCost, employeeId, photos, photosToDelete, items, approval_status, payment_method, appointment_date } = body;

    // Prevent duplicate booking: if accepting with a date already occupied
    if (user.role === 'client' && approval_status === 'accepted' && appointment_date) {
      // Check if date is in the past
      const selectedDate = new Date(appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return NextResponse.json({ error: 'No se puede seleccionar una fecha pasada' }, { status: 400 });
      }
      
      const existing = await query(
        'SELECT 1 FROM claims WHERE appointment_date = $1 AND approval_status = $2 AND id <> $3 LIMIT 1',
        [appointment_date, 'accepted', id]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'La fecha seleccionada ya está ocupada' }, { status: 400 });
      }
    }

    // Manejo de fotos
    let currentPhotos = claim.rows[0].photos ? JSON.parse(claim.rows[0].photos) : [];

    // Eliminar fotos si se especificaron
    if (photosToDelete && photosToDelete.length > 0) {
      try {
        await deleteMultipleImages(photosToDelete);
        currentPhotos = currentPhotos.filter((photo) => !photosToDelete.includes(photo.publicId));
      } catch (error) {
        console.error('Error deleting photos:', error);
      }
    }

    // Subir nuevas fotos si existen
    if (photos && photos.length > 0) {
      try {
        const uploadedPhotos = await uploadMultipleImages(photos, {
          folder: 'doctorcar/claims',
        });
        currentPhotos = [...currentPhotos, ...uploadedPhotos];
      } catch (error) {
        console.error('Error uploading photos:', error);
        return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 });
      }
    }

    // Construir query de actualización
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (body.type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(body.type);
    }
    if (body.companyName !== undefined) {
      updates.push(`company_name = $${paramIndex++}`);
      values.push(body.companyName);
    }
    if (status !== undefined && user.role !== 'client') {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (estimatedCost !== undefined && user.role !== 'client') {
      updates.push(`estimated_cost = $${paramIndex++}`);
      values.push(estimatedCost);
    }
    if (employeeId !== undefined && user.role !== 'client') {
      updates.push(`employee_id = $${paramIndex++}`);
      values.push(employeeId);
    }
    if (currentPhotos.length > 0 || photosToDelete) {
      updates.push(`photos = $${paramIndex++}`);
      values.push(JSON.stringify(currentPhotos));
    }

    // Manejo de aprobación (cliente)
    if (approval_status !== undefined && user.role === 'client') {
      if (!['pending', 'accepted', 'rejected'].includes(approval_status)) {
        return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
      }
      updates.push(`approval_status = $${paramIndex++}`);
      values.push(approval_status);

      if (approval_status === 'accepted') {
        if (payment_method !== undefined) {
          updates.push(`payment_method = $${paramIndex++}`);
          values.push(payment_method);
        }
        if (appointment_date !== undefined) {
          updates.push(`appointment_date = $${paramIndex++}`);
          values.push(appointment_date);
        }
      }
    }

    // Manejo de items de presupuesto (solo employee/admin)
    if (items && (user.role === 'employee' || user.role === 'admin')) {
      // Validar y sanear items
      const sanitizedItems = items.map((item) => ({
        description: (item.description || '').trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice ?? item.unit_price),
      })).filter((item) => item.description);

      const invalid = sanitizedItems.some((item) => !Number.isFinite(item.quantity) || !Number.isFinite(item.unitPrice) || item.quantity <= 0 || item.unitPrice < 0);
      if (invalid || sanitizedItems.length === 0) {
        return NextResponse.json({ error: 'Invalid budget items' }, { status: 400 });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM budget_items WHERE claim_id = $1', [id]);

        let total = 0;
        for (const item of sanitizedItems) {
          const totalItem = Number(item.quantity) * Number(item.unitPrice);
          total += totalItem;
          await client.query(
            `INSERT INTO budget_items (id, claim_id, description, quantity, unit_price, total)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [nanoid(), id, item.description, item.quantity, item.unitPrice, totalItem]
          );
        }

        await client.query('COMMIT');

        // Si no se envía estimatedCost, lo calculamos
        if (!values.includes(total) && (items.length > 0)) {
          updates.push(`estimated_cost = $${paramIndex++}`);
          values.push(total);
        }

        // Si no se envía status y hay items, pasamos a in_progress
        if (status === undefined) {
          updates.push(`status = $${paramIndex++}`);
          values.push('in_progress');
        }

        // Asignar empleado si viene del rol employee
        if (user.role === 'employee' && claim.rows[0].employee_id !== user.id) {
          updates.push(`employee_id = $${paramIndex++}`);
          values.push(user.id);
        }
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving budget items:', error);
        return NextResponse.json({ error: 'Failed to save budget items' }, { status: 500 });
      } finally {
        client.release();
      }
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query(
      `UPDATE claims
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/claims/[id] - Eliminar un reclamo
export async function DELETE(request, { params }) {
  try {
    const cookie = request.cookies.get('auth_session');
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString());
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE auth0_id = $1', [decoded.sub]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;

    const claim = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (claim.rows.length === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Validar permisos
    if (user.role === 'client') {
      // Cliente solo puede eliminar sus propios reclamos que no estén aceptados/rechazados/completados
      if (claim.rows[0].client_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (claim.rows[0].approval_status === 'accepted' || 
          claim.rows[0].approval_status === 'rejected' || 
          claim.rows[0].status === 'completed') {
        return NextResponse.json({ error: 'No puedes eliminar un reclamo aceptado, rechazado o completado' }, { status: 400 });
      }
    } else if (user.role !== 'admin') {
      // Solo admin y cliente pueden eliminar
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Eliminar fotos de Cloudinary
    const photos = claim.rows[0].photos ? JSON.parse(claim.rows[0].photos) : [];
    if (photos.length > 0) {
      try {
        const publicIds = photos.map((photo) => photo.publicId);
        await deleteMultipleImages(publicIds);
      } catch (error) {
        console.error('Error deleting photos from Cloudinary:', error);
      }
    }

    await query('DELETE FROM claims WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
