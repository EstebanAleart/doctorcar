import { db } from "./db.js";
import jsPDF from "jspdf";

// Función para generar el contenido del PDF
export function generatePDFContent(claimInput) {
  // Permite recibir directamente el objeto claim (desde API) o el claimId (legacy/local DB)
  const claim = typeof claimInput === "object" ? claimInput : (typeof db?.getClaims === 'function' ? db.getClaims().find((c) => c.id === claimInput) : null);

  if (!claim) {
    return undefined;
  }

  // Asegurar que items es un array
  const items = Array.isArray(claim.items) ? claim.items : [];
  
  if (items.length === 0) {
    return undefined;
  }

  // Datos del cliente/vehículo: si vienen del API, ya están en el objeto
  const client = claim.client || {
    name: claim.client_name,
    email: claim.client_email,
    phone: claim.client_phone,
  } || (typeof db?.getUsers === 'function' ? db.getUsers()?.find((u) => u.id === claim.clientId) : null);

  const vehicle = claim.vehicle || (claim.brand ? {
    brand: claim.brand,
    model: claim.model,
    year: claim.year,
    plate: claim.plate,
    color: claim.color || claim.vehicle?.color || 'N/A',
  } : (typeof db?.getVehicles === 'function' ? db.getVehicles()?.find((v) => v.id === claim.vehicleId) : null));

  const employee = claim.employee || (typeof db?.getUsers === 'function' && claim.employeeId ? db.getUsers()?.find((u) => u.id === claim.employeeId) : null);
  const workshop = typeof db?.getWorkshop === 'function' ? db.getWorkshop() : { name: "DOCTORCAR", address: "", phone: "3412 69-7000", email: "doctorcarrosario@gmail.com" };
  
  try {
    const doc = new jsPDF();

    // Header - Logo y nombre del taller
    doc.setFillColor(26, 77, 109); // #1a4d6d
    doc.rect(0, 0, 210, 40, "F");
    
    // Agregar logo - usar try catch por si la imagen no está disponible
    try {
      doc.addImage("/images/whatsapp-20image-202025-12-29-20at-2000.jpeg", "JPEG", 15, 5, 30, 30);
    } catch (e) {
      // Logo no disponible, continuar sin él
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("DOCTORCAR", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Rosario - Chapa y Pintura", 105, 28, { align: "center" });

    // Información del taller
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Tel: 3412 69-7000`, 15, 50);
    doc.text("doctorcarrosario@gmail.com", 15, 55);

    // Título del documento
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 77, 109);
    doc.text("PRESUPUESTO", 105, 50, { align: "center" });

    // Número de presupuesto y fecha
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${claim.id.slice(-8).toUpperCase()}`, 195, 50, { align: "right" });
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 195, 55, { align: "right" });

    // Línea separadora
    doc.setDrawColor(26, 77, 109);
    doc.setLineWidth(0.5);
    doc.line(15, 70, 195, 70);

    // Información del cliente
    let y = 80;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", 15, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${client?.name || "N/A"}`, 15, y);
    y += 5;
    doc.text(`Teléfono: ${client?.phone || "N/A"}`, 15, y);
    y += 5;
    doc.text(`Email: ${client?.email || "N/A"}`, 15, y);

    // Información del vehículo
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL VEHÍCULO", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    if (vehicle) {
      doc.text(`Marca/Modelo: ${vehicle.brand} ${vehicle.model}`, 15, y);
      y += 5;
      doc.text(`Año: ${vehicle.year}`, 15, y);
      y += 5;
      doc.text(`Patente: ${vehicle.plate}`, 15, y);
      y += 5;
      doc.text(`Color: ${vehicle.color}`, 15, y);
    }

    // Tipo de reclamo
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("TIPO DE RECLAMO", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Tipo: ${claim.type === "particular" ? "Particular" : "Compañía de Seguros"}`, 15, y);
    if (claim.company_name) {
      y += 5;
      doc.text(`Compañía: ${claim.company_name}`, 15, y);
    }

    // Descripción del daño
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN DEL DAÑO", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(claim.description, 180);
    doc.text(descriptionLines, 15, y);
    y += descriptionLines.length * 5;

    // Tabla de presupuesto
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DEL PRESUPUESTO", 15, y);
    y += 7;

    // Headers de la tabla
    doc.setFillColor(26, 77, 109);
    doc.rect(15, y - 5, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Descripción", 17, y);
    doc.text("Cant.", 135, y);
    doc.text("P. Unit.", 155, y);
    doc.text("Total", 183, y, { align: "right" });
    y += 8;

    // Items del presupuesto
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    items.forEach((item, index) => {
      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, y - 5, 180, 7, "F");
      }
      // Handle both camelCase and snake_case property names
      const unitPrice = Number(item.unitPrice ?? item.unit_price ?? 0);
      const total = Number(item.total ?? item.total_price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      
      const descLines = doc.splitTextToSize(item.description, 115);
      doc.text(descLines, 17, y);
      doc.text(quantity.toString(), 135, y);
      doc.text(`$${unitPrice.toFixed(2)}`, 155, y);
      doc.text(`$${total.toFixed(2)}`, 193, y, { align: "right" });
      y += Math.max(7, descLines.length * 5);

      // Nueva página si es necesario
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Total
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(26, 77, 109);
    const estimatedCost = Number(claim.estimatedCost ?? claim.estimated_cost ?? 0);
    doc.text("TOTAL:", 135, y);
    doc.text(`$${estimatedCost.toFixed(2)}`, 193, y, { align: "right" });

    // Sección de fotos del cliente
    let photosArray = [];
    try {
      const photos = claim.photos || [];
      if (Array.isArray(photos)) {
        photosArray = photos;
      } else if (typeof photos === 'string' && photos.length > 0) {
        const parsed = JSON.parse(photos);
        photosArray = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      photosArray = [];
    }
    
    if (photosArray.length > 0) {
      y += 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 77, 109);
      doc.text("FOTOS DEL VEHÍCULO", 15, y);
      y += 10;

      let photosPerRow = 2;
      let photoWidth = 85;
      let photoHeight = 70;
      let photoSpacing = 10;
      let colIndex = 0;

      photosArray.forEach((photo, index) => {
        let photoUrl = typeof photo === "string" ? photo : (photo.url || photo.secure_url);
        let isBase64 = false;
        
        // Si tiene base64, usar eso en lugar de la URL
        if (photo && photo.base64) {
          photoUrl = 'data:' + (photo.type || 'image/jpeg') + ';base64,' + photo.base64;
          isBase64 = true;
        }
        
        // Nueva página si es necesario
        if (colIndex === 0 && y > 200) {
          doc.addPage();
          y = 20;
        }

        try {
          const xPos = 15 + (colIndex * (photoWidth + photoSpacing));
          
          // Si es base64, intentar agregar la imagen
          if (isBase64) {
            try {
              doc.addImage(photoUrl, "JPEG", xPos, y, photoWidth, photoHeight);
            } catch (e) {
              // No se pudo cargar la imagen base64
            }
          } else if (typeof window !== 'undefined') {
            // Cliente: intentar cargar la imagen con CORS
            try {
              doc.addImage(photoUrl, "JPEG", xPos, y, photoWidth, photoHeight);
            } catch (e) {
              // No se pudo cargar la foto
            }
          } else {
            // Servidor: omitir imágenes ya que no tenemos base64
          }
          
          colIndex++;
          if (colIndex >= photosPerRow) {
            colIndex = 0;
            y += photoHeight + 8;
          }
        } catch (e) {
          // Error procesando foto
        }
      });

      // Ajustar y si había una foto sin completar la fila
      if (colIndex > 0) {
        y += photoHeight + 8;
      }
    }

    // Información adicional
    y += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Tiempo estimado de trabajo: 1 a 2 días", 15, y);
    y += 5;
    doc.text("Validez del presupuesto: 30 días", 15, y);
    if (employee) {
      y += 5;
      doc.text(`Atendido por: ${employee.name}`, 15, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Este presupuesto es válido por 30 días desde la fecha de emisión", 105, 285, { align: "center" });

    return doc;
  } catch (error) {
    return undefined;
  }
}

// Función para descargar PDF en el navegador
export function downloadPDF(claimInput) {
  const doc = generatePDFContent(claimInput);
  if (doc) {
    // En el navegador, usar jsPDF's save method
    const claim = typeof claimInput === "object" ? claimInput : db.getClaims().find((c) => c.id === claimInput);
    const client = claimInput?.client || {
      name: claimInput?.client_name,
      email: claimInput?.client_email,
      phone: claimInput?.client_phone,
    };
    doc.save(`Presupuesto_${claim.id.slice(-8)}_${client?.name || "Cliente"}.pdf`);
  }
}