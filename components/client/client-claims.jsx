"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, FileText, Download, Pencil, Trash2, XCircle, Upload, X, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";
import { ApprovalSection } from "./approval-section";
import Swal from "sweetalert2";

export function ClientClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");
  const [billingByClaim, setBillingByClaim] = useState({});
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptZoom, setReceiptZoom] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editPhotos, setEditPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

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
        const normalized = data.map((claim) => {
          const estimatedRaw = claim.estimatedCost ?? claim.estimated_cost ?? null;
          const estimatedNumber = estimatedRaw !== null && estimatedRaw !== undefined ? Number(estimatedRaw) : null;
          
          const items = (claim.items || []).map(item => ({
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price ?? item.unitPrice ?? 0) || 0,
            total: (Number(item.quantity) || 0) * (Number(item.unit_price ?? item.unitPrice ?? 0) || 0),
          }));

          return {
            ...claim,
            companyName: claim.companyName ?? claim.company_name ?? null,
            estimatedCost: Number.isFinite(estimatedNumber) ? estimatedNumber : null,
            createdAt: claim.createdAt ?? claim.created_at,
            approval_status: claim.approval_status || "pending",
            payment_method: claim.payment_method || null,
            appointment_date: null, // Now stored in appointments table
            appointments: claim.appointments || [],
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
            items: items,
          };
        });
        setClaims(normalized);
      }
    } catch (error) {
      // Error loading claims
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

  const getBillingStatusBadge = (status) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const labels = {
      paid: "Pagado",
      partial: "Pago parcial",
      pending: "Pendiente",
      overdue: "Vencido",
      cancelled: "Cancelado",
    };
    const badgeClass = variants[status] || variants.pending;
    const text = labels[status] || labels.pending;
    return <Badge className={badgeClass}>{text}</Badge>;
  };

  const getInstallmentStatusBadge = (status) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    const labels = {
      paid: "Pagada",
      pending: "Pendiente",
      overdue: "Vencida",
    };
    const badgeClass = variants[status] || variants.pending;
    const text = labels[status] || labels.pending;
    return <Badge className={badgeClass}>{text}</Badge>;
  };

  const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "$0.00";
    return `$${number.toFixed(2)}`;
  };

  const getReceiptDisplayUrl = (url) => {
    if (!url) return null;
    
    // Check if it's a PDF
    const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('image/upload/') && url.toLowerCase().includes('.pdf');
    
    if (isPdf && url.includes('cloudinary.com')) {
      // Convert Cloudinary PDF to JPG image (first page)
      // Replace /upload/ with /upload/f_jpg,pg_1/ to get first page as image
      return url.replace('/upload/', '/upload/f_jpg,pg_1/');
    }
    
    return url;
  };

  const isReceiptPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const loadBilling = async (claimId) => {
    if (!claimId) return;
    setBillingLoading(true);
    setBillingError("");
    try {
      const response = await fetch(`/api/claims/${claimId}/billing`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setBillingError(error.error || "No se pudo cargar la facturación");
        return;
      }
      const data = await response.json();
      setBillingByClaim((prev) => ({ ...prev, [claimId]: data }));
    } catch (error) {
      setBillingError("No se pudo cargar la información de pagos");
    } finally {
      setBillingLoading(false);
    }
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

  const handleApprovalUpdate = async (approvalData) => {
    if (!selectedClaim) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(approvalData),
      });

      if (response.ok) {
        setShowDetail(false);
        await Swal.fire({
          title: "¡Éxito!",
          text: approvalData.approval_status === "accepted" ? "Presupuesto aceptado correctamente" : "Presupuesto rechazado",
          icon: "success",
          confirmButtonColor: "#1a4d6d",
          confirmButtonText: "Aceptar",
        });
        loadClaims();
      } else {
        const error = await response.json();
        await Swal.fire({
          title: "Error",
          text: error.error || "Error al actualizar el presupuesto",
          icon: "error",
          confirmButtonColor: "#1a4d6d",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClaim = async () => {
    if (!editDescription.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "La descripción no puede estar vacía",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
        allowOutsideClick: true,
      });
      return;
    }

    if (editType === 'insurance' && !editCompany.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "Debes especificar la compañía de seguro",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
        allowOutsideClick: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare photos to upload
      const photosToUpload = [];
      for (const file of newPhotos) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        photosToUpload.push(base64);
      }

      const payload = {
        description: editDescription,
        type: editType,
        companyName: editType === 'insurance' ? editCompany : null,
      };

      if (photosToUpload.length > 0) {
        payload.photos = photosToUpload;
      }
      if (photosToDelete.length > 0) {
        payload.photosToDelete = photosToDelete;
      }

      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditMode(false);
        setNewPhotos([]);
        setPhotosToDelete([]);
        setPhotoPreview([]);
        setShowDetail(false);
        
        await Swal.fire({
          title: "¡Actualizado!",
          text: "Reclamo actualizado correctamente",
          icon: "success",
          confirmButtonColor: "#1a4d6d",
          allowOutsideClick: true,
        });
        loadClaims();
      } else {
        const error = await response.json();
        setShowDetail(false);
        
        await Swal.fire({
          title: "Error",
          text: error.error || "Error al actualizar el reclamo",
          icon: "error",
          confirmButtonColor: "#1a4d6d",
          allowOutsideClick: true,
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
        allowOutsideClick: true,
      });
    } finally {
      setLoading(false);
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
                    if (!billingByClaim[claim.id]) {
                      loadBilling(claim.id);
                    }
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                {claim.approval_status !== 'accepted' && claim.approval_status !== 'rejected' && claim.status !== 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClaim(claim);
                        setEditMode(true);
                        setEditDescription(claim.description);
                        setEditType(claim.type);
                        setEditCompany(claim.companyName || "");
                        setEditPhotos(claim.photos || []);
                        setNewPhotos([]);
                        setPhotosToDelete([]);
                        setPhotoPreview([]);
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
                  </>
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
              {selectedClaim.approval_status === 'accepted' && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  <strong>✓ Presupuesto aceptado:</strong> Este reclamo ya no se puede editar ni eliminar.
                </div>
              )}
              {selectedClaim.approval_status === 'rejected' && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  <strong>✗ Presupuesto rechazado:</strong> Este reclamo ya no se puede modificar.
                </div>
              )}
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
              </div>
              {editMode ? (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo de Reclamo</Label>
                    <Select value={editType} onValueChange={setEditType}>
                      <SelectTrigger id="edit-type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="particular">Particular</SelectItem>
                        <SelectItem value="insurance">Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editType === 'insurance' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-company">Compañía de Seguro</Label>
                      <Input
                        id="edit-company"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        placeholder="Nombre de la compañía"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descripción del Daño</Label>
                    <textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                      placeholder="Describe el daño..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fotos Actuales</Label>
                    {editPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {editPhotos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={typeof photo === 'string' ? photo : photo.url}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-md border"
                            />
                            <button
                              onClick={() => {
                                const publicId = typeof photo === 'string' ? null : photo.publicId;
                                if (publicId) setPhotosToDelete([...photosToDelete, publicId]);
                                setEditPhotos(editPhotos.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay fotos</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-photos">Agregar Nuevas Fotos</Label>
                    <Label htmlFor="new-photos" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click para agregar fotos</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG (m\u00e1x. 5MB cada una)</p>
                        </div>
                      </div>
                    </Label>
                    <Input
                      id="new-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const maxSize = 5 * 1024 * 1024;
                        const validFiles = [];
                        const previews = [];

                        files.forEach((file) => {
                          if (file.size > maxSize) {
                            Swal.fire({
                              title: 'Archivo muy grande',
                              text: `${file.name} excede 5MB`,
                              icon: 'warning',
                              confirmButtonColor: '#1a4d6d',
                              allowOutsideClick: true,
                            });
                            return;
                          }
                          validFiles.push(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              previews.push(event.target.result);
                              if (previews.length === validFiles.length) {
                                setPhotoPreview(previews);
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        });

                        setNewPhotos(validFiles);
                      }}
                    />
                    {photoPreview.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {photoPreview.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview}
                              alt={`Nueva foto ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setPhotoPreview(photoPreview.filter((_, i) => i !== idx));
                                setNewPhotos(newPhotos.filter((_, i) => i !== idx));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-2 text-sm">
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
                </>
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
              <div className="rounded-lg border p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Pagos y progreso</h4>
                    <p className="text-sm text-muted-foreground">Estado de facturación e instalaciones</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadBilling(selectedClaim.id)}
                    disabled={billingLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
                {billingLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando pagos...
                  </div>
                )}
                {billingError && !billingLoading && (
                  <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div className="space-y-1">
                      <p>{billingError}</p>
                      <Button variant="outline" size="sm" onClick={() => loadBilling(selectedClaim.id)}>
                        Reintentar
                      </Button>
                    </div>
                  </div>
                )}
                {!billingLoading && !billingError && (
                  <BillingSection
                    billing={billingByClaim[selectedClaim.id]}
                    formatCurrency={formatCurrency}
                    getBillingStatusBadge={getBillingStatusBadge}
                    getInstallmentStatusBadge={getInstallmentStatusBadge}
                    onViewReceipt={(url) => {
                      setSelectedReceipt(url);
                      setReceiptZoom(1);
                      setReceiptModalOpen(true);
                    }}
                  />
                )}
              </div>
              {selectedClaim.status === "in_progress" && (
                <ApprovalSection 
                  claim={selectedClaim} 
                  onApprovalUpdate={handleApprovalUpdate}
                  loading={loading}
                />
              )}
              {selectedClaim.approval_status !== 'accepted' && selectedClaim.approval_status !== 'rejected' && selectedClaim.status !== 'completed' && (
                <div className="flex gap-2 pt-4 border-t">
                  {editMode ? (
                    <>
                      <Button
                        onClick={handleEditClaim}
                        disabled={loading}
                        className="flex-1 bg-[#1a4d6d] hover:bg-[#153d57] text-white"
                      >
                        Guardar Cambios
                      </Button>
                      <Button
                        onClick={() => {
                          setEditMode(false);
                          setEditDescription(selectedClaim.description);
                          setNewPhotos([]);
                          setPhotosToDelete([]);
                          setPhotoPreview([]);
                        }}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setEditMode(true);
                          setEditDescription(selectedClaim.description);
                          setEditType(selectedClaim.type);
                          setEditCompany(selectedClaim.companyName || "");
                          setEditPhotos(selectedClaim.photos || []);
                          setNewPhotos([]);
                          setPhotosToDelete([]);
                          setPhotoPreview([]);
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
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={receiptModalOpen} onOpenChange={(open) => {
        setReceiptModalOpen(open);
        if (!open) setReceiptZoom(1);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            {selectedReceipt && isReceiptPdf(selectedReceipt) && (
              <p className="text-xs text-muted-foreground">Vista previa del PDF convertido a imagen</p>
            )}
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptZoom(Math.max(0.5, receiptZoom - 0.25))}
                  disabled={receiptZoom <= 0.5}
                >
                  -
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(receiptZoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptZoom(Math.min(3, receiptZoom + 0.25))}
                  disabled={receiptZoom >= 3}
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptZoom(1)}
                >
                  Restablecer
                </Button>
              </div>
              <div className="overflow-auto max-h-[60vh] border rounded-lg bg-muted/30 p-4">
                <img
                  src={getReceiptDisplayUrl(selectedReceipt)}
                  alt="Comprobante"
                  style={{ transform: `scale(${receiptZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                  className="w-full h-auto object-contain rounded-lg bg-white mx-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const iframe = document.createElement('iframe');
                    iframe.src = selectedReceipt;
                    iframe.className = 'w-full h-[60vh] rounded-lg border';
                    e.target.parentElement.insertBefore(iframe, e.target);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setReceiptModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BillingSection({ billing, formatCurrency, getBillingStatusBadge, getInstallmentStatusBadge, onViewReceipt }) {
  // Check if billing is actually null (not just the wrapper object)
  if (!billing || billing.billing === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">La facturación se generará una vez que se hayan agregado ítems al presupuesto y el presupuesto sea aprobado.</p>
        <p className="text-xs text-muted-foreground">Por ahora no hay datos de facturación disponibles para este reclamo.</p>
      </div>
    );
  }

  const totals = billing.totals || {
    totalAmount: billing.total_amount,
    paidAmount: billing.paid_amount,
    balance: billing.balance,
    progress: 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{`$${(Number(totals.totalAmount) || 0).toFixed(2)}`}</p>
        </div>
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-xs text-muted-foreground">Pagado</p>
          <p className="text-lg font-semibold text-green-700">{`$${(Number(totals.paidAmount) || 0).toFixed(2)}`}</p>
        </div>
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className="text-lg font-semibold text-amber-700">{`$${(Number(totals.balance) || 0).toFixed(2)}`}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avance de pago</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {billing.status && getBillingStatusBadge(billing.status)}
            <span>{totals.progress || 0}%</span>
          </div>
        </div>
        <Progress value={totals.progress || 0} />
      </div>

      <div className="space-y-3">
        <h5 className="font-medium">Cuotas y comprobantes</h5>
        {(billing.payments || []).length === 0 && (
          <p className="text-sm text-muted-foreground">No hay pagos registrados aún.</p>
        )}
        {(billing.payments || []).map((payment) => (
          <div key={payment.id} className="rounded-lg border bg-white p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.payment_method || "Método no especificado"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {payment.payment_date
                    ? format(new Date(payment.payment_date), "PPP", { locale: es })
                    : "Sin fecha"}
                </span>
                {getBillingStatusBadge(payment.status || "pending")}
              </div>
            </div>

            {(payment.installments || []).length > 0 ? (
              <div className="space-y-2">
                {payment.installments.map((inst) => (
                  <div key={inst.id} className="flex flex-wrap items-center justify-between rounded-md border bg-muted/30 px-3 py-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold">{formatCurrency(inst.installment_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Cuota #{inst.installment_number}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {inst.status === 'paid' && inst.updated_at
                          ? format(new Date(inst.updated_at), "PPP", { locale: es })
                          : inst.due_date
                          ? format(new Date(inst.due_date), "PPP", { locale: es })
                          : "Sin fecha"}
                      </span>
                      {getInstallmentStatusBadge(inst.status || "pending")}
                      {inst.receipt_url && (
                        <button
                          onClick={() => onViewReceipt(inst.receipt_url)}
                          className="underline text-primary hover:text-primary/80 text-xs"
                        >
                          Ver comprobante
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Este pago no tiene cuotas registradas.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

