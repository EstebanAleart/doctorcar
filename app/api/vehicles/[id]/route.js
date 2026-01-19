import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query } from '@/lib/database';

// GET /api/vehicles/[id] - Obtener un vehículo específíco
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;

    const vehicle = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (vehicle.rows.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Si es cliente, verificar que sea dueño del vehículo
    if (user.role === 'client' && vehicle.rows[0].client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(vehicle.rows[0]);
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vehicles/[id] - Actualizar un vehículo
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;
    const body = await request.json();

    // Verificar que el vehículo existe
    const vehicle = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (vehicle.rows.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Si es cliente, verificar que sea dueño del vehículo
    if (user.role === 'client' && vehicle.rows[0].client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { brand, model, year, plate, color } = body;

    // Verificar que la patente no esté duplicada (excepto por este vehículo)
    if (plate) {
      const existingPlate = await query('SELECT id FROM vehicles WHERE plate = $1 AND id != $2', [
        plate.toUpperCase(),
        id,
      ]);
      if (existingPlate.rows.length > 0) {
        return NextResponse.json({ error: 'Plate already exists' }, { status: 409 });
      }
    }

    const result = await query(
      `UPDATE vehicles
       SET brand = COALESCE($1, brand),
           model = COALESCE($2, model),
           year = COALESCE($3, year),
           plate = COALESCE($4, plate),
           color = COALESCE($5, color)
       WHERE id = $6
       RETURNING *`,
      [brand, model, year, plate?.toUpperCase(), color, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vehicles/[id] - Eliminar un vehículo
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT id, role FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const { id } = await params;

    // Solo admin puede eliminar vehículos
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const vehicle = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (vehicle.rows.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    await query('DELETE FROM vehicles WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
