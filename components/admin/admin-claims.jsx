"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, Download } from "lucide-react";
import { downloadPDF } from "@/lib/pdf-generator";

export function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allClaims = db.getClaims();
    const allEmployees = db.getUsers().filter((u) => u.role === "employee");
    setClaims(allClaims);
    setEmployees(allEmployees);
  };

  const assignEmployee = (claimId, employeeId) => {
    db.updateClaim(claimId, { employeeId, status: "in_progress" });
    loadData();
  };

  const updateStatus = (claimId, status) => {
    db.updateClaim(claimId, { status });
    loadData();
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

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Sin asignar";
    const employee = db.getUsers().find((u) => u.id === employeeId);
    return employee?.name || "Empleado Desconocido";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Reclamos</h2>
        <p className="text-muted-foreground">Administra todos los reclamos del taller</p>
      </div>
      <div className="grid gap-4">
        {claims.map((claim) => (
          <Card key={claim.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Reclamo #{claim.id.slice(-8)}</CardTitle>
                  <CardDescription>Cliente: {getClientName(claim.clientId)}</CardDescription>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empleado:</span>
                  <span className="font-medium">{getEmployeeName(claim.employeeId)}</span>
                </div>
                {claim.appointmentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Turno:</span>
                    <span className="font-medium">
                      {format(new Date(claim.appointmentDate), "PPP", { locale: es })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium">{format(new Date(claim.createdAt), "PPP", { locale: es })}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={claim.employeeId || ""} onValueChange={(value) => assignEmployee(claim.id, value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Asignar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Ver Detalles
                </Button>
                {claim.items && claim.items.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(claim.id)}
                    className="bg-[#1a4d6d] text-white hover:bg-[#2d6a8f] hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {claims.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              No hay reclamos registrados
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Reclamo</DialogTitle>
            <DialogDescription>Información completa del reclamo</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">{selectedClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{getClientName(selectedClaim.clientId)}</span>
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
                <h4 className="font-medium mb-2">Descripción</h4>
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
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedClaim.items && selectedClaim.items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Presupuesto</h4>
                  <div className="space-y-2">
                    {selectedClaim.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.description} (x{item.quantity})
                        </span>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
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