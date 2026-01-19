import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query } from '@/lib/database';
import { nanoid } from 'nanoid';

// GET /api/vehicles - Listar vehículos del usuario autenticado
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el user_id desde email (usando NextAuth session)
    const userResult = await query('SELECT id, role FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Si es cliente, solo sus vehículos. Si es admin/employee, todos los vehículos
    let vehicles;
    if (user.role === 'client') {
      vehicles = await query(
        'SELECT * FROM vehicles WHERE client_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
    } else {
      vehicles = await query('SELECT * FROM vehicles ORDER BY created_at DESC');
    }

    return NextResponse.json(vehicles.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vehicles - Crear nuevo vehículo
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el user_id desde email (usando NextAuth session)
    const userResult = await query('SELECT id, role FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const body = await request.json();
    const { brand, model, year, plate, color } = body;

    // Validaciones
    if (!brand || !model || !year || !plate || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verificar que la patente no esté duplicada
    const existingPlate = await query('SELECT id FROM vehicles WHERE plate = $1', [plate.toUpperCase()]);
    if (existingPlate.rows.length > 0) {
      return NextResponse.json({ error: 'Plate already exists' }, { status: 409 });
    }

    const vehicleId = nanoid();
    const result = await query(
      `INSERT INTO vehicles (id, client_id, brand, model, year, plate, color, workshop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
       RETURNING *`,
      [vehicleId, user.id, brand, model, year, plate.toUpperCase(), color]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
