"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, FileText, Download, Pencil, Trash2 } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";
import Swal from "sweetalert2";

export function ClientClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadClaims();
    }
  }, [user]);

  const loadClaims = async () => {
    try {
      const response = await fetch("/api/claims", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map((claim) => ({
          ...claim,
          companyName: claim.companyName ?? claim.company_name ?? null,
          estimatedCost: claim.estimatedCost ?? claim.estimated_cost ?? null,
          createdAt: claim.createdAt ?? claim.created_at,
          photos: claim.photos
            ? typeof claim.photos === "string"
              ? (() => {
                  try {
                    return JSON.parse(claim.photos);
                  } catch {
                    return [];
                  }
                })()
              : claim.photos
            : [],
          vehicle: {
            brand: claim.brand ?? claim.vehicles?.brand,
            model: claim.model ?? claim.vehicles?.model,
            plate: claim.plate ?? claim.vehicles?.plate,
            year: claim.year ?? claim.vehicles?.year,
          },
        }));
        setClaims(normalized);
      }
    } catch (error) {
      console.error("Error loading claims:", error);
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

  const getVehicleInfo = (claim) => {
    if (!claim) return "Vehículo desconocido";
    const vehicle = claim.vehicle || claim.vehicles;
    if (!vehicle) return "Vehículo desconocido";
    const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
    const plate = vehicle.plate ? ` - ${vehicle.plate}` : "";
    const info = `${brandModel}${plate}`.trim();
    return info || "Vehículo desconocido";
  };

  const handleDelete = async (claimId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este reclamo. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#1a4d6d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`/api/claims/${claimId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'Reclamo eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#1a4d6d',
            confirmButtonText: 'Aceptar',
          });
          loadClaims();
        } else {
          const error = await response.json();
          await Swal.fire({
            title: 'Error',
            text: error.error || 'Error al eliminar el reclamo',
            icon: 'error',
            confirmButtonColor: '#1a4d6d',
            confirmButtonText: 'Aceptar',
          });
        }
      } catch (error) {
        console.error('Error deleting claim:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Error al conectar con el servidor',
          icon: 'error',
          confirmButtonColor: '#1a4d6d',
          confirmButtonText: 'Aceptar',
        });
      } finally {
        setLoading(false);
      }
    }
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
                  <CardDescription>{getVehicleInfo(claim)}</CardDescription>
                </div>
                {getStatusBadge(claim.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{claim.type === "particular" ? "Particular" : "Seguro"}</span>
                </div>
                {claim.companyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compañía Aseguradora:</span>
                    <span className="font-medium">{claim.companyName}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedClaim(claim);
                    setShowDetail(true);
                  }}
                  className="border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(claim.id)}
                  disabled={loading}
                  className="border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                  <span className="font-medium">{getVehicleInfo(selectedClaim)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{selectedClaim.type === "particular" ? "Particular" : "Seguro"}</span>
                </div>
                {selectedClaim.companyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compañía Aseguradora:</span>
                    <span className="font-medium">{selectedClaim.companyName}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Descripción del Daño</h4>
                <p className="text-sm text-muted-foreground">{selectedClaim.description}</p>
              </div>
              {selectedClaim.photos && selectedClaim.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Fotos ({selectedClaim.photos.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(typeof selectedClaim.photos === 'string' 
                      ? JSON.parse(selectedClaim.photos) 
                      : selectedClaim.photos
                    ).map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={typeof photo === 'string' ? photo : photo.url}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      </div>
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
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowDetail(false);
                    // Aquí irá la edición
                  }}
                  className="flex-1 border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetail(false);
                    handleDelete(selectedClaim.id);
                  }}
                  className="flex-1 border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

