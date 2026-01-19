"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

export function AdminWorkOrders() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [appointmentData, setAppointmentData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    type: "repair",
    notes: "",
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await fetch("/api/claims", { credentials: "include" });
      const data = await response.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading claims:", error);
      setClaims([]);
    }
  };

  const filteredClaims = useMemo(() => {
    if (!Array.isArray(claims)) return [];
    let result = [...claims];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((claim) => claim.status === statusFilter);
    }

    // Approval filter
    if (approvalFilter !== "all") {
      result = result.filter((claim) => claim.approval_status === approvalFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (claim) =>
          claim.id?.toLowerCase().includes(term) ||
          claim.client_name?.toLowerCase().includes(term) ||
          claim.brand?.toLowerCase().includes(term) ||
          claim.model?.toLowerCase().includes(term) ||
          claim.plate?.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date-asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "amount-desc":
          return calculateTotal(b.items) - calculateTotal(a.items);
        case "amount-asc":
          return calculateTotal(a.items) - calculateTotal(b.items);
        case "client-asc":
          return (a.client_name || "").localeCompare(b.client_name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [claims, searchTerm, statusFilter, approvalFilter, sortBy]);

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const handleCreateEstimate = (claim) => {
    setSelectedClaim(claim);
    setItems(claim.items || []);
    setShowEstimate(true);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const saveEstimate = async () => {
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Items requeridos",
        text: "Agrega al menos un item al presupuesto",
      });
      return;
    }

    try {
      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Presupuesto guardado",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowEstimate(false);
        loadClaims();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el presupuesto",
      });
    }
  };

  const downloadPDF = (claim) => {
    const doc = new jsPDF();
    const total = calculateTotal(claim.items);

    // Header
    doc.setFontSize(18);
    doc.text("Presupuesto de Reparación", 105, 20, { align: "center" });

    // Claim details
    doc.setFontSize(10);
    doc.text(`ID: ${claim.id}`, 20, 40);
    doc.text(`Cliente: ${claim.client_name}`, 20, 50);
    doc.text(`Vehículo: ${claim.brand} ${claim.model}`, 20, 60);
    doc.text(`Patente: ${claim.plate}`, 20, 70);

    // Items table
    let y = 90;
    doc.setFontSize(12);
    doc.text("Items:", 20, y);
    y += 10;

    claim.items?.forEach((item) => {
      const itemTotal = item.quantity * item.unit_price;
      doc.setFontSize(10);
      doc.text(`${item.description}`, 20, y);
      doc.text(`${item.quantity} x $${item.unit_price}`, 150, y, {
        align: "right",
      });
      doc.text(`$${itemTotal.toFixed(2)}`, 190, y, { align: "right" });
      y += 7;
    });

    // Total
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 190, y, { align: "right" });

    doc.save(`presupuesto_${claim.id}.pdf`);
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

  const getApprovalBadge = (approval) => {
    const variants = {
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return variants[approval] || "bg-gray-100 text-gray-800";
  };

  const handleScheduleAppointment = async (claim) => {
    setSelectedClaim(claim);
    setAppointmentData({
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      type: "repair",
      notes: "",
    });
    setAppointmentError("");
    
    try {
      const res = await fetch('/api/calendar', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBookedDates(data.bookedDates || []);
      }
    } catch (e) {
      // Error loading booked dates
    }
    
    setShowScheduleAppointment(true);
  };

  const saveAppointment = async () => {
    if (!appointmentData.scheduledDate) {
      setAppointmentError("Por favor selecciona una fecha para la cita");
      return;
    }
    
    if (bookedDates.includes(appointmentData.scheduledDate)) {
      setAppointmentError("Esa fecha ya está ocupada. Por favor elige otra.");
      return;
    }
    
    setAppointmentError("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          claimId: selectedClaim.id,
          scheduledDate: appointmentData.scheduledDate,
          scheduledTime: appointmentData.scheduledTime || null,
          duration: parseInt(appointmentData.duration),
          type: appointmentData.type,
          notes: appointmentData.notes,
        }),
      });

      if (response.ok) {
        setShowScheduleAppointment(false);
        loadClaims();
      } else {
        throw new Error("Error al guardar cita");
      }
    } catch (error) {
      setAppointmentError("No se pudo guardar la cita. Intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Órdenes de Trabajo</h2>
        <p className="text-muted-foreground">
          Gestiona todas las órdenes de trabajo y presupuestos
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Aprobación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Work Orders Grid */}
      {filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm
              ? "No se encontraron órdenes con los filtros seleccionados"
              : "No hay órdenes de trabajo"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredClaims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {claim.brand} {claim.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {claim.client_name}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {claim.plate}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusBadge(claim.status)}>
                      {claim.status}
                    </Badge>
                    <Badge className={getApprovalBadge(claim.approval_status)}>
                      {claim.approval_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción:</p>
                  <p className="text-sm">{claim.description}</p>
                </div>

                {claim.items && claim.items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Presupuesto: ${calculateTotal(claim.items).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateEstimate(claim)}
                  >
                    {claim.items?.length > 0 ? "Editar" : "Crear"} Presupuesto
                  </Button>
                  {claim.items?.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPDF(claim)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      {claim.approval_status === "accepted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleAppointment(claim)}
                        >
                          📅 Programar Cita
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Appointment Dialog */}
      <Dialog open={showScheduleAppointment} onOpenChange={setShowScheduleAppointment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Programar Cita - {selectedClaim?.vehicleBrand} {selectedClaim?.vehicleModel}</DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              {appointmentError && (
                <p className="text-sm text-red-600">{appointmentError}</p>
              )}
              
              <div>
                <Label>Fecha de cita *</Label>
                <Input
                  type="date"
                  value={appointmentData.scheduledDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setAppointmentData({
                      ...appointmentData,
                      scheduledDate: selectedDate,
                    });
                    if (appointmentError) setAppointmentError("");
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={appointmentData.scheduledTime}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        scheduledTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Duración (minutos)</Label>
                  <Input
                    type="number"
                    value={appointmentData.duration}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        duration: e.target.value,
                      })
                    }
                    min="30"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de cita</Label>
                <Select
                  value={appointmentData.type}
                  onValueChange={(value) =>
                    setAppointmentData({
                      ...appointmentData,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspection">Inspección</SelectItem>
                    <SelectItem value="repair">Reparación</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="follow_up">Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  placeholder="Notas adicionales sobre la cita..."
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleAppointment(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveAppointment}>Programar Cita</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estimate Dialog */}
      <Dialog open={showEstimate} onOpenChange={setShowEstimate}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Presupuesto de Reparación</DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedClaim.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehículo</p>
                  <p className="font-medium">
                    {selectedClaim.brand} {selectedClaim.model}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Items del Presupuesto</Label>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-6">
                          <Label>Descripción</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="Descripción del trabajo..."
                            rows={2}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            min="1"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label>Precio Unit.</Label>
                          <Input
                            type="number"
                            value={item.unit_price || item.unitPrice}
                            onChange={(e) =>
                              updateItem(index, "unit_price", e.target.value)
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-right text-sm text-muted-foreground">
                        Subtotal: ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold">
                  ${calculateTotal(items).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEstimate(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveEstimate}>Guardar Presupuesto</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
