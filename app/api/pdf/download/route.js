import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { generatePDFContent } from '@/lib/pdf-generator';

// Función para hacer fetch de una imagen y convertirla a base64
async function fetchImageAsBase64(imageUrl) {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return null;
    }
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      data: base64,
      type: contentType
    };
  } catch (e) {
    return null;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const claimId = url.searchParams.get('id');

    if (!claimId) {
      return new NextResponse(JSON.stringify({ error: 'Claim ID is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener los datos del claim con todos los detalles necesarios
    const claimData = await query(
      `SELECT c.*, v.brand, v.model, v.plate, v.year, v.color,
              u.name as client_name, u.email as client_email, u.phone as client_phone,
              emp.name as employee_name,
              COALESCE(json_agg(b.*) FILTER (WHERE b.id IS NOT NULL), '[]') AS items
       FROM claims c
       JOIN vehicles v ON c.vehicle_id = v.id
       JOIN users u ON c.client_id = u.id
       LEFT JOIN users emp ON c.employee_id = emp.id
       LEFT JOIN budget_items b ON b.claim_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, v.brand, v.model, v.plate, v.year, v.color, u.name, u.email, u.phone, emp.name`,
      [claimId]
    );

    if (claimData.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Claim not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const claimInfo = claimData.rows[0];

    // Procesar las fotos: hacer fetch de cada una y convertir a base64
    let photosArray = [];
    try {
      const photos = claimInfo.photos || [];
      if (Array.isArray(photos)) {
        photosArray = photos;
      } else if (typeof photos === 'string' && photos.length > 0) {
        const parsed = JSON.parse(photos);
        photosArray = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      // No hacer nada si no se pueden parsear las fotos
    }
    
    // Hacer fetch de las imágenes en paralelo
    const photosWithBase64 = await Promise.all(
      photosArray.map(async (photo) => {
        const photoUrl = typeof photo === "string" ? photo : (photo.url || photo.secure_url);
        const base64Data = await fetchImageAsBase64(photoUrl);
        
        if (base64Data) {
          return {
            ...photo,
            base64: base64Data.data,
            type: base64Data.type
          };
        }
        return photo;
      })
    );

    // Actualizar el claim con las fotos convertidas a base64
    claimInfo.photos = photosWithBase64;
    
    // Generar el PDF
    const doc = generatePDFContent(claimInfo);
    
    if (!doc) {
      return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const fileName = `Presupuesto_${claimId.slice(-8)}_${claimInfo.client_name || 'Cliente'}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
