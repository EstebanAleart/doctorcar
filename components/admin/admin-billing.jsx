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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

export function AdminBilling() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadBillings();
  }, []);

  const loadBillings = async () => {
    try {
      const response = await fetch("/api/billing");
      const data = await response.json();
      setBillings(data);
    } catch (error) {

      Swal.fire("Error", "No se pudieron cargar las facturas", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBillings = useMemo(() => {
    let result = [...billings];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((billing) => billing.status === statusFilter);
    }

    // Date filter (last 30/90 days or all time)
    if (dateFilter !== "all") {
      const now = new Date();
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      result = result.filter((billing) => {
        const billingDate = new Date(billing.billing_date);
        return billingDate >= cutoffDate;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (billing) =>
          billing.billing_number?.toLowerCase().includes(term) ||
          billing.client_name?.toLowerCase().includes(term) ||
          billing.vehicle_brand?.toLowerCase().includes(term) ||
          billing.vehicle_model?.toLowerCase().includes(term) ||
          billing.vehicle_plate?.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.billing_date) - new Date(a.billing_date);
        case "date-asc":
          return new Date(a.billing_date) - new Date(b.billing_date);
        case "amount-desc":
          return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case "amount-asc":
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        case "client-asc":
          return (a.client_name || "").localeCompare(b.client_name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [billings, searchTerm, statusFilter, dateFilter, sortBy]);

  const calculateTotals = () => {
    let total = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let developmentFee = 0;
    let cancelledTotal = 0;
    let cancelledPaidAmount = 0;
    let cancelledPendingAmount = 0;

    filteredBillings.forEach((billing) => {
      const subtotal = parseFloat(billing.subtotal) || 0;
      const totalAmount = parseFloat(billing.total_amount) || 0;
      const paid = parseFloat(billing.paid_amount) || 0;
      
      // Separar rechazados/cancelados de los activos
      if (billing.status === 'rejected' || billing.status === 'cancelled') {
        // Para rechazados/cancelados: usar subtotal
        cancelledTotal += subtotal;
        cancelledPaidAmount += paid;
        cancelledPendingAmount += (subtotal - paid);
      } else {
        // Para activos
        // Total: subtotal (sin develop fee)
        total += subtotal;
        // Pending: subtotal - paid (develop fee es ingresos de la empresa, no pendiente)
        pendingAmount += (subtotal - paid);
        // Development fee es el 10% del subtotal
        developmentFee += (subtotal * 0.1);
        paidAmount += paid;
      }
    });

    return {
      total,
      paidAmount,
      pendingAmount,
      developmentFee,
      cancelledTotal,
      cancelledPaidAmount,
      cancelledPendingAmount,
    };
  };

  const totals = calculateTotals();

  const handleViewDetails = (billing) => {
    setSelectedBilling(billing);
    setPaymentReceipt(null);
    setReceiptPreview(null);
    setPaymentNotes("");
    setShowDetailDialog(true);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Archivo muy grande",
          text: "El comprobante no debe superar 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result);
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePaymentInfo = async () => {
    if (!selectedBilling) return;

    try {
      const response = await fetch(`/api/billing/${selectedBilling.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_url: paymentReceipt,
          notes: paymentNotes,
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "Información guardada correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowDetailDialog(false);
        loadBillings();
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar la información", "error");
    }
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.text("Reporte de Facturación", 100, 25, { align: "center" });

    // Date range info
    doc.setFontSize(10);
    yPosition = 40;
    doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 15, yPosition);
    doc.text(
      `Total de facturas: ${filteredBillings.length}`,
      15,
      yPosition + 8
    );

    yPosition = 60;

    // Table data
    const tableData = filteredBillings.map((billing) => {
      const totalAmount = parseFloat(billing.total_amount) || 0;
      const paidAmount = parseFloat(billing.paid_amount) || 0;
      const balance = parseFloat(billing.balance) || 0;
      
      return [
        billing.billing_number,
        billing.client_name || "-",
        `${billing.vehicle_brand} ${billing.vehicle_model}`,
        billing.status || "-",
        `$${totalAmount.toFixed(2)}`,
        `$${paidAmount.toFixed(2)}`,
        `$${balance.toFixed(2)}`,
      ];
    });

    doc.autoTable({
      head: [
        [
          "Factura",
          "Cliente",
          "Vehículo",
          "Estado",
          "Total",
          "Pagado",
          "Saldo",
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
    doc.text(`Total Facturación: $${totals.total.toFixed(2)}`, 100, yPosition);
    doc.text(`Total Cobrado: $${totals.paidAmount.toFixed(2)}`, 100, yPosition + 8);
    doc.text(`Pendiente de Cobro: $${totals.pendingAmount.toFixed(2)}`, 100, yPosition + 16);
    doc.text(`10% Desarrollo: $${totals.developmentFee.toFixed(2)}`, 100, yPosition + 24);

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
      paid: "bg-green-100 text-green-800",
      partial: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
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
          disabled={filteredBillings.length === 0}
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
                placeholder="Buscar por factura, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado Factura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="partial">Pago Parcial</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
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
              Mostrando {filteredBillings.length} resultado
              {filteredBillings.length !== 1 ? "s" : ""} de {billings.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredBillings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected').length} facturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totals.paidAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pagos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendiente de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totals.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Por cobrar
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
              Comisión total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cancelled/Rejected Summary */}
      {totals.cancelledTotal > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">
                Cancelados/Rechazados - Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totals.cancelledTotal.toFixed(2)}
              </div>
              <p className="text-xs text-red-600 mt-2">
                {filteredBillings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length} facturas
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">
                Cancelados - Cobrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totals.cancelledPaidAmount.toFixed(2)}
              </div>
              <p className="text-xs text-red-600 mt-2">
                Ya cobrado
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">
                Cancelados - Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totals.cancelledPendingAmount.toFixed(2)}
              </div>
              <p className="text-xs text-red-600 mt-2">
                Por cobrar antes de cancelar
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          {billings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground">No hay facturas registradas</p>
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground">
                No se encontraron facturas con los criterios seleccionados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura #</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Actualizada</TableHead>
                    <TableHead>Pagos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBillings.map((billing) => {
                    const subtotal = parseFloat(billing.subtotal) || 0;
                    const paidAmount = parseFloat(billing.paid_amount) || 0;
                    const balance = parseFloat(billing.balance) || 0;

                    return (
                      <TableRow key={billing.id}>
                        <TableCell className="font-medium">
                          {billing.billing_number}
                        </TableCell>
                        <TableCell className="text-sm">
                          {billing.client_name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {billing.vehicle_brand} {billing.vehicle_model}
                          <div className="text-xs text-muted-foreground font-mono">
                            {billing.vehicle_plate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(billing.status)}>
                            {billing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          ${paidAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-yellow-600 font-medium">
                          ${balance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {billing.billing_date 
                            ? new Date(billing.billing_date).toLocaleDateString("es-AR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {billing.updated_at
                            ? new Date(billing.updated_at).toLocaleDateString("es-AR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {billing.payments && billing.payments.length > 0 ? (
                            <div className="text-blue-600">
                              {(() => {
                                const paymentWithInstallments = billing.payments.find(p => parseInt(p.card_installments) > 1);
                                const installments = paymentWithInstallments ? parseInt(paymentWithInstallments.card_installments) : null;
                                
                                return installments 
                                  ? `${billing.payments.length} pago${billing.payments.length !== 1 ? 's' : ''} (${installments} cuotas)`
                                  : `${billing.payments.length} pago${billing.payments.length !== 1 ? 's' : ''}`;
                              })()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin pagos</span>
                          )}
                        </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(billing)}
                            >
                              Ver Detalles
                            </Button>
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
                    <span>Total Facturación:</span>
                    <span className="font-medium">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cobrado:</span>
                    <span className="font-medium text-green-600">
                      ${totals.paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pendiente de Cobro:</span>
                    <span className="font-medium text-yellow-600">
                      ${totals.pendingAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10% Desarrollo:</span>
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

        {/* Dialog de detalles */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de Factura {selectedBilling?.billing_number}</DialogTitle>
            </DialogHeader>
          
            {selectedBilling && (
              <div className="space-y-6">
                {/* Info general */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{selectedBilling.client_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Vehículo</Label>
                    <p className="font-medium">
                      {selectedBilling.vehicle_brand} {selectedBilling.vehicle_model} - {selectedBilling.vehicle_plate}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge className={getStatusBadge(selectedBilling.status)}>
                        {selectedBilling.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fecha</Label>
                    <p>{new Date(selectedBilling.billing_date).toLocaleDateString("es-AR")}</p>
                  </div>
                </div>

                {/* Montos */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${parseFloat(selectedBilling.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">${parseFloat(selectedBilling.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Pagado:</span>
                    <span className="font-medium">${parseFloat(selectedBilling.paid_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-yellow-600 border-t pt-2">
                    <span className="font-medium">Saldo pendiente:</span>
                    <span className="font-bold">${parseFloat(selectedBilling.balance || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Items */}
                {selectedBilling.items && selectedBilling.items.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Items de factura</Label>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBilling.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.unit_price || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.total_price || 0).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Registrar nuevo pago */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <Label className="text-sm font-medium mb-3 block">Registrar nuevo pago</Label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="payment-amount" className="text-xs">Monto a registrar</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-method" className="text-xs">Método de pago</Label>
                        <Select defaultValue="cash">
                          <SelectTrigger id="payment-method" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="transfer">Transferencia</SelectItem>
                            <SelectItem value="check">Cheque</SelectItem>
                            <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      + Registrar pago
                    </Button>
                  </div>
                </div>

                {/* Historial de pagos */}
                {selectedBilling.payments && selectedBilling.payments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Historial de pagos ({selectedBilling.payments.length})</Label>
                    <div className="space-y-2">
                      {selectedBilling.payments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-3 bg-green-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-green-700">${parseFloat(payment.amount).toFixed(2)}</p>
                                {payment.card_installments && payment.card_installments > 1 && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {payment.card_installments} cuotas
                                  </span>
                                )}
                                {payment.status && payment.status !== 'completed' && (
                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                    payment.status === 'rejected' 
                                      ? 'bg-red-100 text-red-700' 
                                      : payment.status === 'failed'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {payment.status === 'rejected' ? 'Rechazado' : payment.status === 'failed' ? 'Fallido' : 'Pendiente'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(payment.payment_date).toLocaleDateString("es-AR")} - {payment.payment_method}
                              </p>
                              {payment.notes && (
                                <p className="text-xs text-muted-foreground mt-1">Nota: {payment.notes}</p>
                              )}
                            </div>
                            {payment.receipt_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(payment.receipt_url, '_blank')}
                              >
                                Comprobante
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subir comprobante */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Subir comprobante adicional</Label>
                
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receipt-upload" className="text-sm">Imagen del comprobante</Label>
                      <div className="mt-2">
                        {receiptPreview ? (
                          <div className="relative">
                            <img
                              src={receiptPreview}
                              alt="Vista previa"
                              className="max-w-full h-48 object-contain border rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setPaymentReceipt(null);
                                setReceiptPreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor="receipt-upload"
                            className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary"
                          >
                            <Upload className="h-5 w-5" />
                            <span>Subir comprobante (máx 5MB)</span>
                            <input
                              id="receipt-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleReceiptUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="payment-notes" className="text-sm">Notas</Label>
                      <Textarea
                        id="payment-notes"
                        placeholder="Notas adicionales sobre el pago..."
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleSavePaymentInfo} className="w-full">
                      Guardar información
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
