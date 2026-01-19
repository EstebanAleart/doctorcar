"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";

export function EmployeePendingApproval() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
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
      },
    };
  };

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/claims", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        const inProgress = data.filter((c) => c.status === "in_progress").map(normalizeClaim);
        setClaims(inProgress);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los presupuestos pendientes",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y buscar claims
  const filteredClaims = useMemo(() => {
    let result = claims;

    // Búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((c) =>
        c.client?.name.toLowerCase().includes(search) ||
        c.client?.email.toLowerCase().includes(search) ||
        c.client?.phone.toLowerCase().includes(search) ||
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
  }, [claims, searchTerm, sortBy]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente de Aceptación",
      accepted: "Aceptado",
      rejected: "Rechazado",
    };
    return labels[status] || "Desconocido";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Presupuestos Pendientes de Aprobación</h2>
        <p className="text-muted-foreground">
          Presupuestos que están en espera de aceptación o rechazo del cliente
        </p>
      </div>

      {/* Controles de búsqueda y filtrado */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Label>
              <Input
                id="search"
                placeholder="Cliente, email, teléfono, vehículo, patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Ordenamiento */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más reciente</SelectItem>
                  <SelectItem value="date-asc">Más antiguo</SelectItem>
                  <SelectItem value="amount-desc">Mayor monto</SelectItem>
                  <SelectItem value="amount-asc">Menor monto</SelectItem>
                  <SelectItem value="client-asc">Cliente (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicador de resultados */}
          {searchTerm ? (
            <p className="text-sm text-muted-foreground">
              {filteredClaims.length} resultado(s) encontrado(s)
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Lista de presupuestos */}
      <div className="grid gap-4">
        {filteredClaims.map((claim) => {
          const estimatedValue = Number.parseFloat(claim.estimatedCost);
          const hasEstimate = Number.isFinite(estimatedValue);
          const approvalStatus = claim.approval_status || "pending";

          return (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Presupuesto #{claim.id.slice(-8)}</CardTitle>
                    <CardDescription>
                      Cliente: {claim.client?.name || "Desconocido"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(approvalStatus)}>
                    {getStatusLabel(approvalStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{claim.client?.name || "Desconocido"}</p>
                    <p className="text-sm text-muted-foreground">{claim.client?.email || "Sin email"}</p>
                    <p className="text-sm text-muted-foreground">{claim.client?.phone || "Sin teléfono"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehículo:</span>
                    <p className="font-medium">
                      {claim.vehicle?.brand} {claim.vehicle?.model} {claim.vehicle?.year}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Patente:</span>
                    <p className="font-medium">{claim.vehicle?.plate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">
                      {claim.type === "particular" ? "Particular" : "Seguro"}
                    </p>
                  </div>
                  {claim.companyName && (
                    <div>
                      <span className="text-muted-foreground">Compañía:</span>
                      <p className="font-medium">{claim.companyName}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <p className="font-medium">{claim.items?.length || 0} items</p>
                  </div>
                  {hasEstimate && (
                    <div>
                      <span className="text-muted-foreground">Monto:</span>
                      <p className="font-bold text-[#1a4d6d]">
                        ${estimatedValue.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredClaims.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              {claims.length === 0
                ? "No hay presupuestos pendientes de aprobación"
                : "No se encontraron presupuestos con los filtros especificados"}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Presupuesto</DialogTitle>
            <DialogDescription>Información completa del presupuesto enviado al cliente</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 grid gap-3 sm:grid-cols-2 text-sm bg-muted/40">
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium text-lg">{selectedClaim.client?.name}</p>
                  {selectedClaim.client?.email && (
                    <p className="text-sm text-muted-foreground">📧 {selectedClaim.client.email}</p>
                  )}
                  {selectedClaim.client?.phone && (
                    <p className="text-sm text-muted-foreground">📞 {selectedClaim.client.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Vehículo</p>
                  <p className="font-medium">
                    {selectedClaim.vehicle?.brand} {selectedClaim.vehicle?.model}
                  </p>
                  <p className="text-xs text-muted-foreground">Patente: {selectedClaim.vehicle?.plate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo de Reclamo</p>
                  <p className="font-medium">
                    {selectedClaim.type === "particular" ? "Particular" : "Seguro"}
                  </p>
                </div>
                {Number.isFinite(Number(selectedClaim.estimatedCost)) && (
                  <div>
                    <p className="text-muted-foreground">Total Presupuesto</p>
                    <p className="font-bold text-[#1a4d6d]">
                      ${Number(selectedClaim.estimatedCost).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {selectedClaim.description && (
                <div>
                  <h4 className="font-medium mb-2">Descripción del Daño</h4>
                  <p className="text-sm text-muted-foreground">{selectedClaim.description}</p>
                </div>
              )}

              {selectedClaim.items && selectedClaim.items.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Detalle del Presupuesto</h4>
                  <div className="space-y-2">
                    {selectedClaim.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 rounded-md bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-medium">${Number(item.total).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-[#1a4d6d]">
                        ${selectedClaim.items.reduce((sum, i) => sum + Number(i.total || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 bg-blue-50">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Estado de Aceptación:</strong> {getStatusLabel(selectedClaim.approval_status || "pending")}
                </p>
                {selectedClaim.approval_status === "accepted" && (
                  <>
                    {selectedClaim.payment_method && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Método de Pago:</strong> {selectedClaim.payment_method}
                      </p>
                    )}
                    {selectedClaim.appointments && selectedClaim.appointments.length > 0 && selectedClaim.appointments[0].scheduled_date && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Fecha de Turno:</strong> {new Date(selectedClaim.appointments[0].scheduled_date + 'T00:00:00').toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
