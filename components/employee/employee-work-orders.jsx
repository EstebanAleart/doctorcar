"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, FileText, Plus, Trash2, Download, Search, Filter } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";
import Swal from "sweetalert2";

export function EmployeeWorkOrders() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateItems, setEstimateItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    if (user) {
      loadClaims();
    }
  }, [user]);

  const normalizeClaim = (claim) => {
    const estimatedRaw = claim.estimatedCost ?? claim.estimated_cost ?? null;
    const estimatedNumber = estimatedRaw !== null && estimatedRaw !== undefined
      ? Number(estimatedRaw)
      : null;

    const normalizeBudgetItem = (item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price ?? item.unitPrice ?? 0) || 0;
      const total = quantity * unitPrice;
      return {
        description: item.description || "",
        quantity,
        unitPrice,
        total,
      };
    };

    return {
      ...claim,
      companyName: claim.companyName ?? claim.company_name ?? null,
      estimatedCost: Number.isFinite(estimatedNumber) ? estimatedNumber : null,
      createdAt: claim.createdAt ?? claim.created_at,
      photos: claim.photos
        ? typeof claim.photos === "string"
          ? (() => {
              try { return JSON.parse(claim.photos); } catch { return []; }
            })()
          : claim.photos
        : [],
      items: (claim.items || []).map(normalizeBudgetItem),
      client: {
        name: claim.client_name,
        email: claim.client_email,
        phone: claim.client_phone,
      },
      vehicle: {
        brand: claim.brand,
        model: claim.model,
        plate: claim.plate,
        year: claim.year,
        color: claim.color,
      },
    };
  };

  const loadClaims = async () => {
    try {
      const response = await fetch("/api/claims", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map(normalizeClaim);
        setClaims(normalized);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las órdenes",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
      });
    }
  };

  // Filtrar y ordenar claims
  const filteredClaims = useMemo(() => {
    let result = claims;

    // Filtro por estado de trabajo
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Filtro por estado de aprobación
    if (approvalFilter !== "all") {
      result = result.filter((c) => c.approval_status === approvalFilter);
    }

    // Búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((c) =>
        c.client?.name.toLowerCase().includes(search) ||
        c.vehicle?.brand.toLowerCase().includes(search) ||
        c.vehicle?.model.toLowerCase().includes(search) ||
        c.vehicle?.plate.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
      );
    }

    // Ordenamiento
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-desc":
          return (Number(b.estimatedCost) || 0) - (Number(a.estimatedCost) || 0);
        case "amount-asc":
          return (Number(a.estimatedCost) || 0) - (Number(b.estimatedCost) || 0);
        case "client-asc":
          return (a.client?.name || "").localeCompare(b.client?.name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [claims, searchTerm, statusFilter, approvalFilter, sortBy]);

  const updateStatus = async (claimId, status) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadClaims();
      } else {
        const error = await res.json();
        Swal.fire({
          title: "Error",
          text: error.error || "No se pudo actualizar el estado",
          icon: "error",
          confirmButtonColor: "#1a4d6d",
        });
      }
    } catch (error) {
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };

    const labels = {
      pending: "Pendiente",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getClientName = (claim) => claim?.client?.name || "Cliente Desconocido";

  const getClientInfo = (claim) => claim?.client || null;

  const getVehicleInfo = (claim) => {
    if (!claim?.vehicle) return "Vehículo desconocido";
    const v = claim.vehicle;
    return `${v.brand || ""} ${v.model || ""} ${v.year || ""} - ${v.plate || ""}`.trim();
  };

  const openEstimateDialog = (claim) => {
    setSelectedClaim(claim);
    setEstimateItems(claim.items || []);
    setShowEstimate(true);
  };

  const updateItem = (index, field, value) => {
    setEstimateItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      if (field === "description") {
        item.description = value;
      } else if (field === "quantity") {
        const qty = Number(value) || 0;
        item.quantity = qty;
      } else if (field === "unitPrice") {
        const price = Number(value) || 0;
        item.unitPrice = price;
      }
      item.total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;

    const item = {
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };

    setEstimateItems([...estimateItems, item]);
    setNewItem({ description: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index) => {
    setEstimateItems(estimateItems.filter((_, i) => i !== index));
  };

  const saveEstimate = async () => {
    if (!selectedClaim) return;

    const itemsPayload = estimateItems
      .map((item) => ({
        description: (item.description || "").trim(),
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      }))
      .filter((item) => item.description);

    const invalid = itemsPayload.some((i) => !Number.isFinite(i.quantity) || !Number.isFinite(i.unitPrice) || i.quantity <= 0 || i.unitPrice < 0);
    if (itemsPayload.length === 0 || invalid) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Verifica que cada item tenga descripción, cantidad > 0 y precio válido",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    const res = await fetch(`/api/claims/${selectedClaim.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemsPayload, status: "in_progress" }),
    });

    if (res.ok) {
      // Cerrar modal antes de mostrar SweetAlert para evitar overlay
      setShowEstimate(false);
      setSelectedClaim(null);
      setEstimateItems([]);
      setNewItem({ description: "", quantity: 1, unitPrice: 0 });

      await Swal.fire({
        title: "Presupuesto guardado",
        icon: "success",
        confirmButtonColor: "#1a4d6d",
      });
      loadClaims();
    } else {
      const error = await res.json();
      // También cierra el modal para evitar overlay en error
      setShowEstimate(false);
      setSelectedClaim(null);
      setEstimateItems([]);
      setNewItem({ description: "", quantity: 1, unitPrice: 0 });

      Swal.fire({
        title: "Error",
        text: error.error || "No se pudo guardar el presupuesto",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Órdenes de Trabajo</h2>
        <p className="text-muted-foreground">Gestiona los trabajos asignados a ti</p>
      </div>

      {/* Controles de búsqueda y filtrado */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Label>
              <Input
                id="search"
                placeholder="Cliente, vehículo, patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por estado de trabajo */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Estado del Trabajo
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por aprobación */}
            <div className="space-y-2">
              <Label htmlFor="approval-filter">Aprobación</Label>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger id="approval-filter">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="accepted">Aceptado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenamiento */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Selecciona orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más reciente</SelectItem>
                  <SelectItem value="date-asc">Más antiguo</SelectItem>
                  <SelectItem value="amount-desc">Monto (mayor)</SelectItem>
                  <SelectItem value="amount-asc">Monto (menor)</SelectItem>
                  <SelectItem value="client-asc">Cliente (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicador de resultados */}
          {searchTerm || statusFilter !== "all" || approvalFilter !== "all" ? (
            <p className="text-sm text-muted-foreground">
              {filteredClaims.length} resultado(s) encontrado(s)
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredClaims.map((claim) => {
          const client = getClientInfo(claim);
          const estimatedValue = Number.parseFloat(claim.estimatedCost);
          const hasEstimate = Number.isFinite(estimatedValue);
          return (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Orden #{claim.id.slice(-8)}</CardTitle>
                    <CardDescription>
                      Cliente: {client?.name} {client?.phone && `- ${client.phone}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehículo:</span>
                    <span className="font-medium">{getVehicleInfo(claim)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">
                      {claim.type === "particular" ? "Particular" : "Compañía"}
                    </span>
                  </div>
                  {claim.companyName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compañía:</span>
                      <span className="font-medium">{claim.companyName}</span>
                    </div>
                  )}
                  {claim.appointmentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Turno:</span>
                      <span className="font-medium">
                        {format(new Date(claim.appointmentDate), "PPP", { locale: es })}
                      </span>
                    </div>
                  )}
                  {hasEstimate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Presupuesto:</span>
                      <span className="font-bold text-[#1a4d6d]">
                        ${estimatedValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={claim.status} onValueChange={(value) => updateStatus(claim.id, value)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => openEstimateDialog(claim)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {claim.items && claim.items.length > 0 ? "Editar" : "Crear"} Presupuesto
                  </Button>

                  {claim.items && claim.items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF({
                        ...claim,
                        items: claim.items,
                        client: getClientInfo(claim),
                        vehicle: claim.vehicle,
                      })}
                      className="bg-[#1a4d6d] text-white hover:bg-[#2d6a8f] hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredClaims.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              {claims.length === 0
                ? "No tienes órdenes de trabajo asignadas"
                : "No se encontraron órdenes con los filtros especificados"}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Trabajo</DialogTitle>
            <DialogDescription>Información y fotos del daño</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Descripción del Cliente</h4>
                <p className="text-sm text-muted-foreground">{selectedClaim.description}</p>
              </div>

              {selectedClaim.photos && selectedClaim.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    Fotos del Daño ({selectedClaim.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(typeof selectedClaim.photos === 'string' 
                      ? JSON.parse(selectedClaim.photos) 
                      : selectedClaim.photos
                    ).map((photo, idx) => {
                      const src = typeof photo === 'string' ? photo : photo.url;
                      return (
                      <img
                        key={idx}
                        src={src || "/placeholder.svg"}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => src && window.open(src, "_blank")}
                      />
                    );})}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click en una foto para verla en tamaño completo
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEstimate} onOpenChange={setShowEstimate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Crear/Editar Presupuesto</DialogTitle>
            <DialogDescription>Agrega los items del presupuesto para este trabajo</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 grid gap-2 grid-cols-3 text-xs bg-muted/40">
                <div>
                  <p className="text-muted-foreground text-xs">Cliente</p>
                  <p className="font-medium text-sm">{selectedClaim.client?.name || "N/A"}</p>
                  {selectedClaim.client?.phone && <p className="text-xs text-muted-foreground">{selectedClaim.client.phone}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Vehículo</p>
                  <p className="font-medium text-sm">
                    {selectedClaim.vehicle?.brand} {selectedClaim.vehicle?.model} {selectedClaim.vehicle?.year}
                  </p>
                  {selectedClaim.vehicle?.plate && <p className="text-xs text-muted-foreground">Patente: {selectedClaim.vehicle.plate}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Estado</p>
                  <p className="font-medium text-sm capitalize">{selectedClaim.status?.replace("_"," ")}</p>
                  {Number.isFinite(selectedClaim.estimatedCost) && (
                    <p className="text-xs font-semibold text-[#1a4d6d]">
                      Total: ${Number(selectedClaim.estimatedCost).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {estimateItems.length > 0 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Items del Presupuesto</h4>
                    <span className="text-xs font-semibold text-[#1a4d6d]">
                      Total: ${estimateItems.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {estimateItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="space-y-2 p-2 rounded-md bg-muted/50"
                      >
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-5 space-y-0">
                            <Label className="text-xs text-muted-foreground">Descripción</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(idx, "description", e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="col-span-2 space-y-0">
                            <Label className="text-xs text-muted-foreground">Cantidad</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="col-span-3 space-y-0">
                            <Label className="text-xs text-muted-foreground">Precio Unitario</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="col-span-2 text-right text-xs font-medium pt-6">
                            ${Number(item.total || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(idx)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium text-sm">Agregar Item</h4>
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-6 space-y-1">
                    <Label htmlFor="item-description" className="text-xs">Descripción</Label>
                    <Input
                      id="item-description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Ej: Puerta izquierda"
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label htmlFor="item-quantity" className="text-xs">Cantidad</Label>
                    <Input
                      id="item-quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label htmlFor="item-price" className="text-xs">Precio Unitario</Label>
                    <Input
                      id="item-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="text-sm h-9"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  className="w-full bg-transparent h-9 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveEstimate}
                  className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]"
                  disabled={estimateItems.length === 0}
                >
                  Guardar Presupuesto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEstimate(false);
                    setSelectedClaim(null);
                    setEstimateItems([]);
                    setNewItem({ description: "", quantity: 1, unitPrice: 0 });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 