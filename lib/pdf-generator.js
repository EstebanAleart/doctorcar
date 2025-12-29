import { db } from "./db.js";
import jsPDF from "jspdf";

export function downloadPDF(claimId) {
  const claim = db.getClaims().find((c) => c.id === claimId);
  
  if (!claim || !claim.items || claim.items.length === 0) {
    alert("No hay presupuesto disponible para este reclamo");
    return;
  }

  const client = db.getUsers().find((u) => u.id === claim.clientId);
  const vehicle = db.getVehicles().find((v) => v.id === claim.vehicleId);
  const employee = claim.employeeId ? db.getUsers().find((u) => u.id === claim.employeeId) : null;
  const workshop = db.getWorkshop();
  const doc = new jsPDF();

  // Header - Logo y nombre del taller
  doc.setFillColor(26, 77, 109); // #1a4d6d
  doc.rect(0, 0, 210, 40, "F");
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
  doc.text(workshop.address, 15, 50);
  doc.text(`Tel: ${workshop.phone}`, 15, 55);
  doc.text(workshop.email, 15, 60);

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
  if (claim.companyName) {
    y += 5;
    doc.text(`Compañía: ${claim.companyName}`, 15, y);
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
  claim.items.forEach((item, index) => {
    // Alternar color de fondo
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, y - 5, 180, 7, "F");
    }
    const descLines = doc.splitTextToSize(item.description, 115);
    doc.text(descLines, 17, y);
    doc.text(item.quantity.toString(), 135, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 155, y);
    doc.text(`$${item.total.toFixed(2)}`, 193, y, { align: "right" });
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
  doc.text("TOTAL:", 135, y);
  doc.text(`$${claim.estimatedCost?.toFixed(2)}`, 193, y, { align: "right" });

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

  // Descargar el PDF
  doc.save(`Presupuesto_${claim.id.slice(-8)}_${client?.name || "Cliente"}.pdf`);
}