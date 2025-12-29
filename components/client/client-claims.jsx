"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, FileText, Download } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";

export function ClientClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (user) {
      loadClaims();
    }
  }, [user]);

  const loadClaims = () => {
    if (user) {
      const userClaims = db.getClaimsByClient(user.id);
      setClaims(userClaims);
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

  const getVehicleInfo = (vehicleId) => {
    const vehicles = db.getVehicles();
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return "Vehículo desconocido";
    return `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Reclamos</h2>
        <p className="text-muted-foreground">Seguimiento de tus solicitudes de servicio</p>
      </div>
      <div className="grid gap-4">
        {claims.map((claim) => (
          <Card key={claim.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Reclamo #{claim.id.slice(-8)}</CardTitle>
                  <CardDescription>{getVehicleInfo(claim.vehicleId)}</CardDescription>
                </div>
                {getStatusBadge(claim.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{claim.type === "particular" ? "Particular" : "Compañía"}</span>
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
                    <span className="font-bold text-[#1a4d6d]">${claim.estimatedCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium">{format(new Date(claim.createdAt), "PPP", { locale: es })}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedClaim(claim);
                    setShowDetail(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                {claim.items && claim.items.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(claim.id)}
                    className="flex-1 bg-[#1a4d6d] text-white hover:bg-[#2d6a8f] hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Presupuesto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {claims.length === 0 && (
          <Card>
            <CardContent className="flex flex-col h-32 items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>No tienes reclamos registrados</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Reclamo</DialogTitle>
            <DialogDescription>Información completa de tu solicitud</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                {getStatusBadge(selectedClaim.status)}
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">{selectedClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehículo:</span>
                  <span className="font-medium">{getVehicleInfo(selectedClaim.vehicleId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{selectedClaim.type === "particular" ? "Particular" : "Compañía"}</span>
                </div>
                {selectedClaim.companyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compañía:</span>
                    <span className="font-medium">{selectedClaim.companyName}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Descripción del Daño</h4>
                <p className="text-sm text-muted-foreground">{selectedClaim.description}</p>
              </div>
              {selectedClaim.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Fotos ({selectedClaim.photos.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClaim.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedClaim.items && selectedClaim.items.length > 0 && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Presupuesto Detallado</h4>
                  <div className="space-y-2">
                    {selectedClaim.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.description} (x{item.quantity})
                        </span>
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 text-base text-[#1a4d6d]">
                      <span>Total</span>
                      <span>${selectedClaim.estimatedCost?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

