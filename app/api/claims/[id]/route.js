import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { uploadMultipleImages, deleteMultipleImages } from '@/lib/cloudinary';

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
    const { id } = params;

    const claim = await query(
      `SELECT c.*, v.brand, v.model, v.plate, v.year, u.name as client_name, u.email as client_email
       FROM claims c
       JOIN vehicles v ON c.vehicle_id = v.id
       JOIN users u ON c.client_id = u.id
       WHERE c.id = $1`,
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
    const { id } = params;
    const body = await request.json();

    // Verificar que el reclamo existe
    const claim = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (claim.rows.length === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Si es cliente, solo puede actualizar sus propios reclamos y solo si están 'pending'
    if (user.role === 'client') {
      if (claim.rows[0].client_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (claim.rows[0].status !== 'pending') {
        return NextResponse.json({ error: 'Cannot update claim that is not pending' }, { status: 400 });
      }
    }

    const { description, status, estimatedCost, employeeId, photos, photosToDelete } = body;

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
    const { id } = params;

    // Solo admin puede eliminar reclamos
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const claim = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (claim.rows.length === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
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
