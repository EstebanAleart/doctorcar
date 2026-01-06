"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, FileText } from "lucide-react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function AdminBilling() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await fetch("/api/claims");
      const data = await response.json();
      // Filter only claims with items (completed work)
      const claimsWithItems = data.filter(
        (claim) => claim.items && claim.items.length > 0
      );
      setClaims(claimsWithItems);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateClaimTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const calculateDevelopmentFee = (baseAmount) => {
    return baseAmount * 0.1; // 10% development fee
  };

  const filteredClaims = useMemo(() => {
    let result = [...claims];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((claim) => claim.status === statusFilter);
    }

    // Approval status filter
    if (statusFilter === "approved") {
      result = result.filter((claim) => claim.approval_status === "accepted");
    }

    // Date filter (last 30/90 days or all time)
    if (dateFilter !== "all") {
      const now = new Date();
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      result = result.filter((claim) => {
        const claimDate = new Date(claim.createdAt);
        return claimDate >= cutoffDate;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (claim) =>
          claim.id?.toLowerCase().includes(term) ||
          claim.clientName?.toLowerCase().includes(term) ||
          claim.companyName?.toLowerCase().includes(term) ||
          claim.description?.toLowerCase().includes(term) ||
          claim.vehicleBrand?.toLowerCase().includes(term) ||
          claim.vehicleModel?.toLowerCase().includes(term) ||
          claim.vehiclePlate?.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-desc":
          return calculateClaimTotal(b.items) - calculateClaimTotal(a.items);
        case "amount-asc":
          return calculateClaimTotal(a.items) - calculateClaimTotal(b.items);
        case "client-asc":
          return (a.clientName || "").localeCompare(b.clientName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [claims, searchTerm, statusFilter, dateFilter, sortBy]);

  const calculateTotals = () => {
    let baseAmount = 0;
    let developmentFee = 0;

    filteredClaims.forEach((claim) => {
      const claimBase = calculateClaimTotal(claim.items);
      baseAmount += claimBase;
      developmentFee += calculateDevelopmentFee(claimBase);
    });

    return {
      baseAmount,
      developmentFee,
      total: baseAmount + developmentFee,
    };
  };

  const totals = calculateTotals();

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add logo if available
    try {
      const logoUrl =
        "https://res.cloudinary.com/dv0mzvpbk/image/upload/v1704067867/logo_light_xfbhpq.png";
      doc.addImage(logoUrl, "PNG", 15, 10, 30, 20);
    } catch (error) {
      console.log("Logo not available");
    }

    // Title
    doc.setFontSize(16);
    doc.text("Reporte de Facturación", 100, 25, { align: "center" });

    // Date range info
    doc.setFontSize(10);
    yPosition = 40;
    doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 15, yPosition);
    doc.text(
      `Total de trabajos: ${filteredClaims.length}`,
      15,
      yPosition + 8
    );

    yPosition = 60;

    // Table data
    const tableData = filteredClaims.map((claim) => {
      const base = calculateClaimTotal(claim.items);
      const fee = calculateDevelopmentFee(base);
      return [
        claim.id.substring(0, 10),
        claim.clientName || "-",
        claim.vehicleBrand || "-",
        claim.status || "-",
        `$${base.toFixed(2)}`,
        `$${fee.toFixed(2)}`,
        `$${(base + fee).toFixed(2)}`,
      ];
    });

    doc.autoTable({
      head: [
        [
          "ID",
          "Cliente",
          "Vehículo",
          "Estado",
          "Monto Base",
          "10% Desarrollo",
          "Total",
        ],
      ],
      body: tableData,
      startY: yPosition,
      margin: { left: 15, right: 15 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // Totals section
    yPosition = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");

    doc.text("TOTALES:", 15, yPosition);
    doc.text(`Monto Base: $${totals.baseAmount.toFixed(2)}`, 100, yPosition);
    doc.text(
      `10% Desarrollo: $${totals.developmentFee.toFixed(2)}`,
      100,
      yPosition + 8
    );

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(
      `TOTAL FACTURACION: $${totals.total.toFixed(2)}`,
      100,
      yPosition + 16
    );

    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("DoctorCar - Sistema de Facturación", 15, pageHeight - 15, {
      align: "left",
    });
    doc.text(`Página 1`, pageWidth - 30, pageHeight - 15, { align: "right" });

    doc.save(
      `facturacion_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando datos de facturación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facturación y Billing</h1>
        <Button
          onClick={downloadPDF}
          className="gap-2"
          disabled={filteredClaims.length === 0}
        >
          <Download className="h-4 w-4" />
          Descargar Reporte
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Buscar por ID, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Periodos</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más Recientes</SelectItem>
                <SelectItem value="date-asc">Más Antiguos</SelectItem>
                <SelectItem value="amount-desc">Mayor Monto</SelectItem>
                <SelectItem value="amount-asc">Menor Monto</SelectItem>
                <SelectItem value="client-asc">Cliente (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchTerm && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredClaims.length} resultado
              {filteredClaims.length !== 1 ? "s" : ""} de {claims.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monto Base Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.baseAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredClaims.length} trabajos facturados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              10% Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totals.developmentFee.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Comisión de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totals.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Base + 10% desarrollo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron trabajos con los criterios seleccionados"
                  : "No hay trabajos para facturar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto Base</TableHead>
                    <TableHead className="text-right">10% Desarrollo</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => {
                    const baseAmount = calculateClaimTotal(claim.items);
                    const devFee = calculateDevelopmentFee(baseAmount);
                    const total = baseAmount + devFee;

                    return (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium text-xs">
                          {claim.id.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {claim.clientName || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {claim.vehicleBrand || "-"} {claim.vehicleModel || ""}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {claim.vehiclePlate || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(claim.status)}>
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${baseAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-medium">
                          ${devFee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-bold">
                          ${total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(claim.createdAt).toLocaleDateString(
                            "es-AR"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Table Footer with Totals */}
              <div className="mt-6 border-t pt-4 flex justify-end">
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between text-sm">
                    <span>Monto Base Total:</span>
                    <span className="font-medium">
                      ${totals.baseAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10% Desarrollo (Comisión):</span>
                    <span className="font-medium text-blue-600">
                      ${totals.developmentFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                    <span>TOTAL FACTURACIÓN:</span>
                    <span className="text-green-600">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
