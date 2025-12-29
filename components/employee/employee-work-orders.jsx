"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, FileText, Plus, Trash2, Download } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";

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

  useEffect(() => {
    if (user) {
      loadClaims();
    }
  }, [user]);

  const loadClaims = () => {
    if (user) {
      const employeeClaims = db.getClaimsByEmployee(user.id);
      setClaims(employeeClaims);
    }
  };

  const updateStatus = (claimId, status) => {
    db.updateClaim(claimId, { status });
    loadClaims();
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

  const getClientName = (clientId) => {
    const client = db.getUsers().find((u) => u.id === clientId);
    return client?.name || "Cliente Desconocido";
  };

  const getClientInfo = (clientId) => {
    const client = db.getUsers().find((u) => u.id === clientId);
    return client || null;
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicles = db.getVehicles();
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return "Vehículo desconocido";
    return `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.plate}`;
  };

  const openEstimateDialog = (claim) => {
    setSelectedClaim(claim);
    setEstimateItems(claim.items || []);
    setShowEstimate(true);
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

  const saveEstimate = () => {
    if (!selectedClaim) return;

    const totalCost = estimateItems.reduce((sum, item) => sum + item.total, 0);

    db.updateClaim(selectedClaim.id, {
      items: estimateItems,
      estimatedCost: totalCost,
    });

    setShowEstimate(false);
    setSelectedClaim(null);
    setEstimateItems([]);
    loadClaims();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Órdenes de Trabajo</h2>
        <p className="text-muted-foreground">Gestiona los trabajos asignados a ti</p>
      </div>

      <div className="grid gap-4">
        {claims.map((claim) => {
          const client = getClientInfo(claim.clientId);
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
                    <span className="font-medium">{getVehicleInfo(claim.vehicleId)}</span>
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
                  {claim.estimatedCost && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Presupuesto:</span>
                      <span className="font-bold text-[#1a4d6d]">
                        ${claim.estimatedCost.toFixed(2)}
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
                    Ver Fotos
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => openEstimateDialog(claim)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {claim.items && claim.items.length > 0 ? "Editar" : "Crear"} Presupuesto
                  </Button>

                  {claim.items && claim.items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(claim.id)}
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

        {claims.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              No tienes órdenes de trabajo asignadas
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

              {selectedClaim.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    Fotos del Daño ({selectedClaim.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClaim.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(photo, "_blank")}
                      />
                    ))}
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear/Editar Presupuesto</DialogTitle>
            <DialogDescription>Agrega los items del presupuesto para este trabajo</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium">Agregar Item</h4>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-description">Descripción</Label>
                  <Input
                    id="item-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Ej: Puerta izquierda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-quantity">Cantidad</Label>
                    <Input
                      id="item-quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Precio Unitario</Label>
                    <Input
                      id="item-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>
            </div>

            {estimateItems.length > 0 && (
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3">Items del Presupuesto</h4>
                <div className="space-y-2">
                  {estimateItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2 text-lg text-[#1a4d6d]">
                    <span>Total</span>
                    <span>${estimateItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

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
        </DialogContent>
      </Dialog>
    </div>
  );
} 