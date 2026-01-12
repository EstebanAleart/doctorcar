"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, Loader2, CreditCard, DollarSign } from "lucide-react";
import Swal from "sweetalert2";

export function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [fullClaimData, setFullClaimData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsRes, employeesRes] = await Promise.all([
        fetch("/api/claims", { credentials: "include" }),
        fetch("/api/users?role=employee", { credentials: "include" }),
      ]);

      if (claimsRes.ok && employeesRes.ok) {
        const claimsData = await claimsRes.json();
        const employeesData = await employeesRes.json();
        setClaims(claimsData);
        setEmployees(employeesData);
      }
    } catch (error) {
      await Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadFullClaimData = async (claimId) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/claims/${claimId}/full`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setFullClaimData(data);
      }
    } catch (error) {
      await Swal.fire("Error", "No se pudo cargar el detalle completo", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const assignEmployee = async (claimId, employeeId) => {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employeeId, status: "in_progress" }),
      });

      if (response.ok) {
        await Swal.fire("¡Asignado!", "Empleado asignado correctamente", "success");
        loadData();
      }
    } catch (error) {
      await Swal.fire("Error", "No se pudo asignar el empleado", "error");
    }
  };

  const updateStatus = async (claimId, status) => {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await Swal.fire("¡Actualizado!", "Estado actualizado correctamente", "success");
        loadData();
      }
    } catch (error) {
      await Swal.fire("Error", "No se pudo actualizar el estado", "error");
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

  const getApprovalBadge = (status) => {
    const variants = {
      pending: "bg-gray-500",
      accepted: "bg-green-500",
      rejected: "bg-red-500",
    };
    const labels = {
      pending: "Pendiente",
      accepted: "Aceptado",
      rejected: "Rechazado",
    };
    return <Badge className={variants[status] || variants.pending}>{labels[status] || labels.pending}</Badge>;
  };

  const getBillingStatusBadge = (status) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    const labels = {
      paid: "Pagado",
      partial: "Pago parcial",
      pending: "Pendiente",
      overdue: "Vencido",
    };
    return <Badge className={variants[status] || variants.pending}>{labels[status] || labels.pending}</Badge>;
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
    return <Badge className={variants[status] || variants.pending}>{labels[status] || labels.pending}</Badge>;
  };

  const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "$0.00";
    return `$${number.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                  <CardDescription>Cliente: {claim.client_name || "Desconocido"}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(claim.status)}
                  {getApprovalBadge(claim.approval_status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehículo:</span>
                  <span className="font-medium">
                    {claim.brand} {claim.model} - {claim.plate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{claim.type === "particular" ? "Particular" : "Seguro"}</span>
                </div>
                {claim.company_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compañía:</span>
                    <span className="font-medium">{claim.company_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empleado:</span>
                  <span className="font-medium">{claim.employee_name || "Sin asignar"}</span>
                </div>
                {claim.estimated_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presupuesto:</span>
                    <span className="font-bold text-[#1a4d6d]">{formatCurrency(claim.estimated_cost)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium">{format(new Date(claim.created_at), "PPP", { locale: es })}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={claim.employee_id || ""}
                  onValueChange={(value) => assignEmployee(claim.id, value)}
                >
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
                    loadFullClaimData(claim.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles Completos
                </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles Completos del Reclamo</DialogTitle>
            <DialogDescription>Información completa incluyendo billing, pagos y cuotas</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            fullClaimData && (
              <div className="space-y-6">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3">Información del Reclamo</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <p className="font-medium">{fullClaimData.client_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{fullClaimData.client_email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teléfono:</span>
                      <p className="font-medium">{fullClaimData.client_phone || "No especificado"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vehículo:</span>
                      <p className="font-medium">
                        {fullClaimData.brand} {fullClaimData.model} ({fullClaimData.year})
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Patente:</span>
                      <p className="font-medium">{fullClaimData.plate}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Empleado:</span>
                      <p className="font-medium">{fullClaimData.employee_name || "Sin asignar"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Descripción del Daño</h3>
                  <p className="text-sm text-muted-foreground">{fullClaimData.description}</p>
                </div>

                {fullClaimData.items && fullClaimData.items.length > 0 && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h3 className="font-semibold mb-3">Presupuesto Detallado</h3>
                    <div className="space-y-2">
                      {fullClaimData.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.description} (x{item.quantity} @ {formatCurrency(item.unit_price)})
                          </span>
                          <span className="font-medium">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t pt-2 text-base text-[#1a4d6d]">
                        <span>Total</span>
                        <span>{formatCurrency(fullClaimData.estimated_cost)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {fullClaimData.billing && (
                  <div className="rounded-lg border p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5" />
                      <h3 className="font-semibold">Facturación y Pagos</h3>
                      {getBillingStatusBadge(fullClaimData.billing.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="rounded-lg border p-3 bg-white">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-semibold">{formatCurrency(fullClaimData.billing.totals.totalAmount)}</p>
                      </div>
                      <div className="rounded-lg border p-3 bg-white">
                        <p className="text-xs text-muted-foreground">Pagado</p>
                        <p className="text-lg font-semibold text-green-700">
                          {formatCurrency(fullClaimData.billing.totals.paidAmount)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 bg-white">
                        <p className="text-xs text-muted-foreground">Saldo</p>
                        <p className="text-lg font-semibold text-amber-700">
                          {formatCurrency(fullClaimData.billing.totals.balance)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Progreso de pago</span>
                        </div>
                        <span className="text-xs">{fullClaimData.billing.totals.progress}%</span>
                      </div>
                      <Progress value={fullClaimData.billing.totals.progress} />
                    </div>

                    {fullClaimData.billing.payments && fullClaimData.billing.payments.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Detalle de Pagos y Cuotas</h4>
                        {fullClaimData.billing.payments.map((payment) => (
                          <div key={payment.id} className="rounded-lg border bg-white p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.payment_method || "Método no especificado"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {payment.payment_date
                                    ? format(new Date(payment.payment_date), "PPP", { locale: es })
                                    : "Sin fecha"}
                                </p>
                                {getBillingStatusBadge(payment.status || "pending")}
                              </div>
                            </div>

                            {payment.installments && payment.installments.length > 0 && (
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-muted-foreground">Cuotas:</p>
                                {payment.installments.map((inst) => (
                                  <div
                                    key={inst.id}
                                    className="flex justify-between items-center rounded-md border bg-muted/30 px-3 py-2"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold">{formatCurrency(inst.installment_amount)}</p>
                                      <p className="text-xs text-muted-foreground">Cuota #{inst.installment_number}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-muted-foreground">
                                        {inst.status === "paid" && inst.updated_at
                                          ? format(new Date(inst.updated_at), "PPP", { locale: es })
                                          : inst.due_date
                                          ? format(new Date(inst.due_date), "PPP", { locale: es })
                                          : "Sin fecha"}
                                      </p>
                                      {getInstallmentStatusBadge(inst.status || "pending")}
                                      {inst.receipt_url && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(inst.receipt_url, "_blank")}
                                          className="text-xs h-7"
                                        >
                                          Ver comprobante
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!fullClaimData.billing && (
                  <div className="rounded-lg border p-4 bg-yellow-50">
                    <p className="text-sm text-muted-foreground">
                      No hay información de facturación disponible aún para este reclamo.
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
