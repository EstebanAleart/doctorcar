import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query } from '@/lib/database';
import { billingDb } from '@/lib/database';
import { uploadMultipleImages } from '@/lib/cloudinary';
import { nanoid } from 'nanoid';

// GET /api/claims - Listar reclamos del usuario autenticado
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

    // Si es cliente, solo sus reclamos. Si es admin/employee, todos los reclamos
    let claims;
    if (user.role === 'client') {
      claims = await query(
        `SELECT c.*, v.brand, v.model, v.plate, v.year, v.color,
                COALESCE(json_agg(b.*) FILTER (WHERE b.id IS NOT NULL), '[]') AS items,
                COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]') AS appointments
         FROM claims c
         JOIN vehicles v ON c.vehicle_id = v.id
         LEFT JOIN budget_items b ON b.claim_id = c.id
         LEFT JOIN appointments a ON a.claim_id = c.id AND a.status != 'cancelled'
         WHERE c.client_id = $1
         GROUP BY c.id, v.brand, v.model, v.plate, v.year, v.color
         ORDER BY c.created_at DESC`,
        [user.id]
      );
    } else {
      claims = await query(
        `SELECT c.*, v.brand, v.model, v.plate, v.year, v.color,
                u.name as client_name, u.email as client_email, u.phone as client_phone,
                emp.name as employee_name,
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                  'id', b.id,
                  'description', b.description,
                  'quantity', b.quantity,
                  'unit_price', b.unit_price,
                  'total', b.total
                )) FILTER (WHERE b.id IS NOT NULL), '[]') AS items,
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                  'id', a.id,
                  'scheduled_date', a.scheduled_date,
                  'status', a.status,
                  'appointment_type', a.appointment_type
                )) FILTER (WHERE a.id IS NOT NULL), '[]') AS appointments
         FROM claims c
         JOIN vehicles v ON c.vehicle_id = v.id
         JOIN users u ON c.client_id = u.id
         LEFT JOIN users emp ON c.employee_id = emp.id
         LEFT JOIN budget_items b ON b.claim_id = c.id
         LEFT JOIN appointments a ON a.claim_id = c.id AND a.status != 'cancelled'
         GROUP BY c.id, v.brand, v.model, v.plate, v.year, v.color, u.name, u.email, u.phone, emp.name
         ORDER BY c.created_at DESC`
      );
    }

    return NextResponse.json(claims.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/claims - Crear nuevo reclamo con imágenes
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
    const { vehicleId, type, companyName, description, photos } = body;

    // Validaciones
    if (!vehicleId || !type || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'insurance' && !companyName) {
      return NextResponse.json({ error: 'Company name is required for insurance claims' }, { status: 400 });
    }

    // Verificar que el vehículo pertenece al usuario (si es cliente)
    if (user.role === 'client') {
      const vehicle = await query('SELECT client_id FROM vehicles WHERE id = $1', [vehicleId]);
      if (vehicle.rows.length === 0 || vehicle.rows[0].client_id !== user.id) {
        return NextResponse.json({ error: 'Vehicle not found or not owned by user' }, { status: 403 });
      }
    }

    // Subir fotos a Cloudinary si existen
    let uploadedPhotos = [];
    if (photos && photos.length > 0) {
      try {
        uploadedPhotos = await uploadMultipleImages(photos, {
          folder: 'doctorcar/claims',
        });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 });
      }
    }

    const claimId = nanoid();
    const result = await query(
      `INSERT INTO claims (id, client_id, vehicle_id, type, company_name, description, status, workshop_id, photos)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 1, $7)
       RETURNING *`,
      [
        claimId,
        user.id,
        vehicleId,
        type,
        type === 'insurance' ? companyName : null,
        description,
        JSON.stringify(uploadedPhotos),
      ]
    );

      // Crear billing record inmediatamente
      try {
        await billingDb.create({
          claimId: claimId,
          billingDate: new Date(),
          customerType: type === 'insurance' ? 'insurance_company' : 'individual',
          subtotal: 0,
          totalAmount: 0,
          balance: 0
        });
      } catch (billingError) {
        // Continue even if billing creation fails
      }

      return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
