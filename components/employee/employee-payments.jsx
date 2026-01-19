"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Building, CreditCard } from "lucide-react";
import Swal from "sweetalert2";

export function EmployeePayments() {
  const [claims, setClaims] = useState([]);
  const [billings, setBillings] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailBillingId, setDetailBillingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [loading, setLoading] = useState(true);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [showInstallmentsDialog, setShowInstallmentsDialog] = useState(false);
  const [selectedBillingForPayments, setSelectedBillingForPayments] = useState(null);
  const [showPayInstallmentDialog, setShowPayInstallmentDialog] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [selectedPaymentForInstallment, setSelectedPaymentForInstallment] = useState(null);
  const [installmentPaymentData, setInstallmentPaymentData] = useState({
    receipt: null,
    receiptPreview: null,
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [showInstallmentDetailDialog, setShowInstallmentDetailDialog] = useState(false);
  const [installmentDetail, setInstallmentDetail] = useState(null);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    method: "efectivo",
    amount: 0,
    installments: 1,
    interestRate: 0,
    entity: "",
    cardType: "",
    receipt: null,
    receiptPreview: null,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [claimsRes, billingsRes] = await Promise.all([
        fetch("/api/claims"),
        fetch("/api/billing"),
      ]);

      if (!claimsRes.ok || !billingsRes.ok) {
        setClaims([]);
        setBillings([]);
        setPaymentsMap({});
        return;
      }

      const claimsData = await claimsRes.json();
      const billingsData = await billingsRes.json();

      const acceptedClaims = Array.isArray(claimsData)
        ? claimsData.filter((c) => c.items && c.items.length > 0)
        : [];

      const safeBillings = Array.isArray(billingsData) ? billingsData : [];
      
      // Cargar payments con installments para cada billing
      const paymentsPromises = safeBillings.map(async (b) => {
        try {
          const res = await fetch(`/api/billing/${b.id}/payments`);
          if (!res.ok) return { billingId: b.id, payments: [] };
          const payments = await res.json();
          return { billingId: b.id, payments: Array.isArray(payments) ? payments : [] };
        } catch {
          return { billingId: b.id, payments: [] };
        }
      });

      const paymentsResults = await Promise.all(paymentsPromises);
      const map = paymentsResults.reduce((acc, { billingId, payments }) => {
        acc[billingId] = payments;
        return acc;
      }, {});

      setClaims(acceptedClaims);
      setBillings(safeBillings);
      setPaymentsMap(map);
    } catch (e) {
      setClaims([]);
      setBillings([]);
      setPaymentsMap({});
    } finally {
      setLoading(false);
    }
  };

  const getBillingForClaim = (claimId) => billings.find((b) => b.claim_id === claimId);

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const calculateTotalWithoutDevelop = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const desc = (item.description || "").toLowerCase();
      const isDevelop = desc.includes("desarrollo") || desc.includes("comisión por desarrollo");
      if (isDevelop) return sum;
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const getDisplayTotal = (claim) => {
    const billing = getBillingForClaim(claim.id);
    if (billing) {
      if (billing.subtotal !== undefined && billing.subtotal !== null) {
        return Number(billing.subtotal) || 0;
      }
      if (Array.isArray(billing.items) && billing.items.length) {
        return calculateTotalWithoutDevelop(
          billing.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unit_price ?? i.unitPrice,
          }))
        );
      }
    }
    return calculateTotalWithoutDevelop(claim.items);
  };

  const getDisplayBalance = (claim) => {
    const billing = getBillingForClaim(claim.id);
    const total = getDisplayTotal(claim);
    const paid = Number(billing?.paid_amount ?? 0);
    const balance = total - paid;
    return balance >= 0 ? balance : 0;
  };

  const getBillingDisplayTotal = (billing) => {
    if (!billing) return 0;
    if (billing.subtotal !== undefined && billing.subtotal !== null) {
      return Number(billing.subtotal) || 0;
    }
    if (Array.isArray(billing.items) && billing.items.length) {
      return calculateTotalWithoutDevelop(
        billing.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unit_price ?? i.unitPrice,
        }))
      );
    }
    return Number(billing.total_amount || 0);
  };

  const getBillingDisplayBalance = (billing) => {
    const total = getBillingDisplayTotal(billing);
    const paid = Number(billing?.paid_amount ?? 0);
    const balance = total - paid;
    return balance >= 0 ? balance : 0;
  };

  // Calcular Por Pagar desde installments pendientes (incluye interés)
  const getPendingInstallmentsTotal = (billingId) => {
    const payments = paymentsMap[billingId] || [];
    let pendingTotal = 0;
    payments.forEach((payment) => {
      const installments = payment.installments || [];
      installments.forEach((inst) => {
        if (inst.status === 'pending') {
          pendingTotal += parseFloat(inst.installment_amount || 0);
        }
      });
    });
    return pendingTotal;
  };

  // Generar URL de preview para PDF en Cloudinary sin re-subir
  const getCloudinaryPdfPreviewUrl = (url, width = 300) => {
    try {
      if (!url || !url.toLowerCase().endsWith('.pdf')) return null;
      const transform = `f_jpg,pg_1,w_${width}`;
      if (url.includes('/raw/upload/')) {
        return url.replace('/raw/upload/', `/image/upload/${transform}/`);
      }
      // Si fue subido como image, igual aplicamos la transformación
      return url.replace('/image/upload/', `/image/upload/${transform}/`);
    } catch {
      return null;
    }
  };

  // Calcular total pagado desde installments completados (incluye interés)
  const getCompletedInstallmentsTotal = (billingId) => {
    const payments = paymentsMap[billingId] || [];
    let completedTotal = 0;
    payments.forEach((payment) => {
      const installments = payment.installments || [];
      installments.forEach((inst) => {
        if (inst.status === 'paid') {
          completedTotal += parseFloat(inst.installment_amount || 0);
        }
      });
    });
    return completedTotal;
  };

  // Verificar si un billing tiene installments
  const hasInstallments = (billingId) => {
    const payments = paymentsMap[billingId] || [];
    return payments.some(payment => payment.installments && payment.installments.length > 0);
  };

  // Cargar detalles completos de un installment
  const loadInstallmentDetails = async (billingId, paymentId, installmentId) => {
    try {
      const response = await fetch(`/api/billing/${billingId}/payments?installmentId=${installmentId}`);
      if (!response.ok) throw new Error('Error al cargar los detalles');
      const data = await response.json();
      setInstallmentDetail(data);
      setShowInstallmentDetailDialog(true);
    } catch (error) {
      console.error('Error loading installment details:', error);
    }
  };

  const calculateTotalWithInterest = () => {
    const base = parseFloat(paymentData.amount) || 0;
    const rate = parseFloat(paymentData.interestRate) || 0;
    return rate > 0 ? base * (1 + rate / 100) : base;
  };

  const generateInstallments = () => {
    const totalWithInterest = calculateTotalWithInterest();
    const installmentCount = parseInt(paymentData.installments) || 1;
    const installmentAmount = totalWithInterest / installmentCount;
    return Array.from({ length: installmentCount }, (_, i) => ({
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate: null,
    }));
  };

  const filteredClaims = useMemo(() => {
    let result = [...claims];

    if (paymentFilter !== "all") {
      result = result.filter((claim) => {
        const billing = getBillingForClaim(claim.id);
        if (paymentFilter === "paid") {
          return billing && billing.status === "paid";
        }
        if (paymentFilter === "pending") {
          return !billing || billing.status === "pending" || billing.status === "partial";
        }
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (claim) =>
          claim.id?.toLowerCase().includes(term) ||
          claim.clientName?.toLowerCase().includes(term) ||
          claim.vehicleBrand?.toLowerCase().includes(term) ||
          claim.vehicleModel?.toLowerCase().includes(term) ||
          claim.vehiclePlate?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-desc":
          return calculateTotal(b.items) - calculateTotal(a.items);
        case "amount-asc":
          return calculateTotal(a.items) - calculateTotal(b.items);
        default:
          return 0;
      }
    });

    return result;
  }, [claims, billings, searchTerm, paymentFilter, sortBy]);

  const categorizedClaims = useMemo(() => {
    const base = { rejected: [], pending: [], inProgress: [], paid: [] };

    filteredClaims.forEach((claim) => {
      const billing = getBillingForClaim(claim.id);
      if (claim.approval_status === "rejected") {
        base.rejected.push(claim);
        return;
      }

      if (!billing || billing.status === "pending") {
        base.pending.push(claim);
        return;
      }

      if (billing.status === "partial") {
        base.inProgress.push(claim);
        return;
      }

      if (billing.status === "paid") {
        base.paid.push(claim);
      }
    });

    return base;
  }, [filteredClaims, billings]);

  const handleOpenPayment = (claim) => {
    const billing = getBillingForClaim(claim.id);
    setSelectedClaim(claim);
    setSelectedBilling(billing || null);
    setEditingPaymentId(null);
    setPaymentData({
      method: "efectivo",
      amount: getDisplayBalance(claim),
      installments: 1,
      interestRate: 0,
      entity: "",
      cardType: "",
      receipt: null,
      receiptPreview: null,
      notes: "",
    });
    setShowPaymentDialog(true);
  };

  const handleOpenPaymentFromBilling = (billing) => {
    const claim = claims.find((c) => c.id === billing.claim_id) || {
      id: billing.claim_id,
      clientName: billing.client_name,
      vehicleBrand: billing.vehicle_brand,
      vehicleModel: billing.vehicle_model,
      vehiclePlate: billing.vehicle_plate,
      items: [],
      approval_status: billing.status,
    };

    setSelectedClaim(claim);
    setSelectedBilling(billing);
    setEditingPaymentId(null);
    setPaymentData({
      method: "efectivo",
      amount: getBillingDisplayBalance(billing),
      installments: 1,
      interestRate: 0,
      entity: "",
      cardType: "",
      receipt: null,
      receiptPreview: null,
      notes: "",
    });
    setShowPaymentDialog(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Archivo muy grande",
          text: "El comprobante no puede superar 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentData({
          ...paymentData,
          receipt: reader.result,
          receiptPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (paymentData.method === "tarjeta") {
      if (!paymentData.entity || !paymentData.cardType) {
        Swal.fire({
          icon: "warning",
          title: "Datos incompletos",
          text: "Por favor completa la entidad bancaria y el tipo de tarjeta",
        });
        return;
      }
    }

    try {
      let billing = selectedBilling;

      if (!billing) {
        const createBillingResponse = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimId: selectedClaim.id }),
        });

        if (!createBillingResponse.ok) {
          throw new Error("No se pudo crear la factura");
        }

        billing = await createBillingResponse.json();
        setSelectedBilling(billing);
      }

      const payload = {
        amount: calculateTotalWithInterest(),
        paymentMethod: paymentData.method === "efectivo" ? "cash" : 
                      paymentData.method === "transferencia" ? "bank_transfer" : 
                      "credit_card",
        cardInstallments: paymentData.installments,
        cardInterestRate: paymentData.interestRate,
        bankName: paymentData.entity,
        receiptUrl: paymentData.receipt,
        notes: paymentData.notes,
        installments: generateInstallments(),
      };

      const url = `/api/billing/${billing.id}/payments`;
      const response = await fetch(url, {
        method: editingPaymentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          paymentId: editingPaymentId || undefined,
        }),
      });

      if (response.ok) {
        setEditingPaymentId(null);
        setShowPaymentDialog(false);
        
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: editingPaymentId ? "Forma de pago actualizada" : "Forma de pago guardada",
            timer: 1800,
            showConfirmButton: false,
          });
        }, 100);

        loadData();
      } else {
        throw new Error("No se pudo guardar la forma de pago");
      }
    } catch (error) {
      setEditingPaymentId(null);
      setShowPaymentDialog(false);

      setTimeout(() => {
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudo guardar la forma de pago",
        });
      }, 100);
    }
  };

  const handleMarkInstallmentPaid = async (paymentId, installmentId) => {
    if (!installmentPaymentData.receipt) {
      Swal.fire({
        icon: "warning",
        title: "Comprobante requerido",
        text: "Por favor sube un comprobante de pago",
      });
      return;
    }

    try {
      // Subir comprobante usando el endpoint API
      const formData = new FormData();
      formData.append('file', installmentPaymentData.receipt);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el comprobante');
      }

      const uploadData = await uploadResponse.json();
      const receiptUrl = uploadData.secure_url;

      const response = await fetch(`/api/billing/${selectedBillingForPayments.id}/payments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          installmentId,
          installmentStatus: 'paid',
          receiptUrl,
          notes: installmentPaymentData.notes,
          paymentDate: installmentPaymentData.paymentDate
        }),
      });

      if (response.ok) {
        setShowPayInstallmentDialog(false);
        setInstallmentPaymentData({
          receipt: null,
          receiptPreview: null,
          notes: '',
          paymentDate: new Date().toISOString().split('T')[0]
        });
        await loadData();
        Swal.fire({
          icon: "success",
          title: "Cuota marcada como pagada",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el pago",
      });
    }
  };

  const getPaymentStatusBadge = (claim) => {
    const billing = getBillingForClaim(claim.id);
    
    if (!billing) {
      return <Badge className="bg-gray-100 text-gray-800">Sin factura</Badge>;
    }
    
    if (billing.status === "paid") {
      return <Badge className="bg-green-100 text-green-800">Cobrado</Badge>;
    }
    if (billing.status === "partial") {
      return <Badge className="bg-blue-100 text-blue-800">En proceso</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando cobros...</p>
      </div>
    );
  }

  // Calcular resumen por estado
  const summary = {
    pending: { count: 0, total: 0 },
    rejected: { count: 0, total: 0 },
    partial: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
  };

  billings.forEach((b) => {
    const billingTotal = getBillingDisplayTotal(b);
    const pendingInstallments = getPendingInstallmentsTotal(b.id);
    const completedInstallments = getCompletedInstallmentsTotal(b.id);
    
    // Sumar siempre los installments completados al total de "Cobrada"
    if (completedInstallments > 0) {
      summary.paid.total += completedInstallments;
    }
    
    if (b.claim_approval_status === "rejected") {
      summary.rejected.count += 1;
      summary.rejected.total += billingTotal;
    } else if (b.status === "paid") {
      // Solo contar como 1 billing cuando está completamente pagado
      summary.paid.count += 1;
    } else {
      // Para pending, contar solo los que no tienen plan de pago
      if (b.status !== "partial" && pendingInstallments === 0) {
        summary.pending.count += 1;
        summary.pending.total += billingTotal;
      }
      
      // Contar en "Por Pagar" todos los que tienen installments pendientes o son partial
      if (pendingInstallments > 0 || b.status === "partial") {
        summary.partial.count += 1;
        if (pendingInstallments > 0) {
          summary.partial.total += pendingInstallments;
        } else {
          // Si es partial pero no tiene installments, usar el balance
          summary.partial.total += getBillingDisplayBalance(b);
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Gestión de Cobros</h2>
        <p className="text-muted-foreground">
          Registra los pagos de clientes con comprobantes
        </p>
      </div>

      {/* Resumen por estado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending.count}</div>
            <p className="text-xs text-muted-foreground mt-1">${summary.pending.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rechazada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.rejected.count}</div>
            <p className="text-xs text-muted-foreground mt-1">${summary.rejected.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Por Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.partial.count}</div>
            <p className="text-xs text-muted-foreground mt-1">${summary.partial.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cobrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paid.count}</div>
            <p className="text-xs text-muted-foreground mt-1">${summary.paid.total.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Facturas</CardTitle>
              <p className="text-sm text-muted-foreground">Lista de todas las facturas con acción de pago</p>
            </div>
            <Badge variant="outline">{billings.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3">Factura</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Vehículo</th>
                <th className="py-2 pr-3 text-right">Total</th>
                <th className="py-2 pr-3 text-right">Por Pagar</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {billings.map((b) => {
                const total = getBillingDisplayTotal(b);
                const paid = Number(b.paid_amount || 0);
                const pendingAmount = getPendingInstallmentsTotal(b.id);
                const statusLabel = b.claim_approval_status === "rejected"
                  ? "Rechazada"
                  : b.status === "paid"
                    ? "Cobrada"
                    : b.status === "partial"
                      ? "Parcial"
                      : "Pendiente";
                return (
                  <tr key={b.id} className="border-t">
                    <td className="py-2 pr-3 font-medium">{b.billing_number || b.id}</td>
                    <td className="py-2 pr-3">{b.client_name || "-"}</td>
                    <td className="py-2 pr-3">{`${b.vehicle_brand || ""} ${b.vehicle_model || ""} ${b.vehicle_plate || ""}`.trim()}</td>
                    <td className="py-2 pr-3 text-right">${total.toFixed(2)}</td>
                    <td className="py-2 pr-3 text-right text-amber-700">${pendingAmount.toFixed(2)}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline">{statusLabel}</Badge>
                    </td>
                    <td className="py-2 pr-0 text-right space-x-2 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setDetailBillingId(b.id);
                        setShowDetailDialog(true);
                      }}>
                        Ver Detalle
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedBillingForPayments(b);
                        setShowInstallmentsDialog(true);
                      }}>
                        Pagar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenPaymentFromBilling(b)}
                        disabled={hasInstallments(b.id) || b.claim_approval_status === 'rejected'}
                      >
                        Forma de Pago
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Forma de Pago</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Define cómo se pagará esta factura. Luego podrás registrar el pago de cada cuota.</p>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              {/* Claim Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Cliente</p>
                      <p className="font-medium">{selectedClaim.clientName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Vehículo</p>
                      <p className="font-medium">
                        {selectedClaim.vehicleBrand} {selectedClaim.vehicleModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Patente</p>
                      <p className="font-medium font-mono">{selectedClaim.vehiclePlate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="font-bold text-green-600">${(selectedBilling ? getBillingDisplayTotal(selectedBilling) : getDisplayTotal(selectedClaim)).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(value) =>
                    setPaymentData({ ...paymentData, method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Efectivo
                      </div>
                    </SelectItem>
                    <SelectItem value="transferencia">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Transferencia
                      </div>
                    </SelectItem>
                    <SelectItem value="tarjeta">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Tarjeta de Crédito
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Monto Base</Label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  step="0.01"
                />
              </div>

              {/* Cuotas e Interés - para cualquier método */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cuotas</Label>
                  <Input
                    type="number"
                    value={paymentData.installments}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        installments: e.target.value,
                      })
                    }
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interés (%)</Label>
                  <Input
                    type="number"
                    value={paymentData.interestRate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        interestRate: e.target.value,
                      })
                    }
                    step="0.01"
                  />
                </div>
              </div>

              {/* Card specific fields */}
              {paymentData.method === "tarjeta" && (
                <>
                  <div className="space-y-2">
                    <Label>Entidad Bancaria</Label>
                    <Input
                      placeholder="Ej: Banco Nación, Visa, Mastercard"
                      value={paymentData.entity}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, entity: e.target.value })
                      }
                    />
                    {!paymentData.entity && (
                      <p className="text-xs text-red-600">⚠️ Campo requerido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Tarjeta</Label>
                    <Input
                      placeholder="Ej: Visa, Mastercard, Amex"
                      value={paymentData.cardType}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardType: e.target.value })
                      }
                    />
                    {!paymentData.cardType && (
                      <p className="text-xs text-red-600">⚠️ Campo requerido</p>
                    )}
                  </div>

                </>
              )}

              {/* Total con Interés/Cuotas */}
              {(paymentData.installments > 1 || paymentData.interestRate > 0) && (
                <>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-blue-800">
                        <strong>Total con Interés:</strong> $
                        {calculateTotalWithInterest().toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Desglose de Cuotas</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Cuota</th>
                            <th className="px-2 py-1 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateInstallments().map((inst) => (
                            <tr key={inst.installmentNumber} className="border-t">
                              <td className="px-2 py-1">#{inst.installmentNumber}</td>
                              <td className="px-2 py-1 text-right">${inst.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas (Opcional)</Label>
                <Textarea
                  placeholder="Observaciones sobre la forma de pago..."
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentDialog(false);
                    setEditingPaymentId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmitPayment}>
                  {editingPaymentId ? "Actualizar forma de pago" : "Guardar forma de pago"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
          </DialogHeader>

          {detailBillingId && billings.find((b) => b.id === detailBillingId) && (() => {
            const billing = billings.find((b) => b.id === detailBillingId);
            const claim = claims.find((c) => c.id === billing.claim_id);
            const payments = paymentsMap[billing.id] || [];

            return (
              <Tabs defaultValue="factura" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="factura">Factura</TabsTrigger>
                  <TabsTrigger value="cliente">Cliente</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="reclamo">Reclamo</TabsTrigger>
                </TabsList>

                <TabsContent value="factura" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información de Factura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">ID Factura</p>
                          <p className="font-medium">{billing.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Número de Factura</p>
                          <p className="font-medium">{billing.billing_number || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Estado</p>
                          <Badge variant="outline">{billing.status}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Aprobación Claim</p>
                          <Badge variant="outline">{billing.claim_approval_status || "pending"}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Total</p>
                          <p className="font-bold">${getBillingDisplayTotal(billing).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Pagado</p>
                          <p className="font-bold text-green-600">${Number(billing.paid_amount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Saldo</p>
                          <p className="font-bold">${getBillingDisplayBalance(billing).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {payments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Pagos Registrados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {payments.map((payment) => (
                            <div key={payment.id} className="border rounded p-3 bg-gray-50">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Método</p>
                                  <p className="font-medium capitalize">{payment.payment_method}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Monto</p>
                                  <p className="font-bold">${parseFloat(payment.amount).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Fecha</p>
                                  <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Estado</p>
                                  <Badge variant="outline">{payment.status || "recorded"}</Badge>
                                </div>
                              </div>
                              {payment.notes && (
                                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                  <p><strong>Notas:</strong> {payment.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="cliente" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Nombre</p>
                          <p className="font-medium">{billing.client_name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">mail</p>
                          <p className="font-medium text-xs">{billing.client_email || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">teléfono</p>
                          <p className="font-medium">{billing.client_phone || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Marca</p>
                          <p className="font-medium">{billing.vehicle_brand || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Modelo</p>
                          <p className="font-medium">{billing.vehicle_model || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Patente</p>
                          <p className="font-bold font-mono">{billing.vehicle_plate || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Año</p>
                          <p className="font-medium">{billing.vehicle_year || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4 mt-4">
                  {(() => {
                    const filteredItems = (billing.items || []).filter((it) => {
                      const d = (it.description || "").toLowerCase();
                      return !d.includes("desarrollo") && !d.includes("comisión por desarrollo");
                    });
                    return filteredItems.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Items de la Factura</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-2 text-left">Descripción</th>
                                  <th className="py-2 text-right">Cantidad</th>
                                  <th className="py-2 text-right">Precio Unitario</th>
                                  <th className="py-2 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredItems.map((item, idx) => {
                                  const qty = parseFloat(item.quantity) || 0;
                                  const price = parseFloat(item.unit_price || item.unitPrice) || 0;
                                  const subtotal = qty * price;
                                  return (
                                    <tr key={idx} className="border-b">
                                      <td className="py-2">{item.description}</td>
                                      <td className="py-2 text-right">{qty}</td>
                                      <td className="py-2 text-right">${price.toFixed(2)}</td>
                                      <td className="py-2 text-right font-semibold">${subtotal.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">No hay items para mostrar</p>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="reclamo" className="space-y-4 mt-4">
                  {claim ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Información del Reclamo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">ID Reclamo</p>
                            <p className="font-medium">{claim.id}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Estado Aprobación</p>
                            <Badge variant="outline">{claim.approval_status || "pending"}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">No hay información del reclamo</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                  className="w-full mt-4"
                >
                  Cerrar
                </Button>
              </Tabs>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal de Installments para Pagar */}
      <Dialog open={showInstallmentsDialog} onOpenChange={setShowInstallmentsDialog} onEscapeKeyDown={() => setShowInstallmentsDialog(false)}>
        <DialogContent className="max-w-6xl sm:!max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Desglose de Cuotas - {selectedBillingForPayments?.billing_number || selectedBillingForPayments?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedBillingForPayments && (() => {
            const payments = paymentsMap[selectedBillingForPayments.id] || [];
            
            if (payments.length === 0) {
              return (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">No hay plan de pago definido para esta factura</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <div className="space-y-4">
                {payments.map((payment) => {
                  const installments = payment.installments || [];
                  return (
                    <Card key={payment.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base">Plan de Pago</CardTitle>
                            <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground mt-1">
                              <p>
                              Método: {payment.payment_method === 'cash' ? 'Efectivo' : payment.payment_method === 'card' ? 'Tarjeta' : 'Transferencia'}
                            </p>
                            {payment.bank_name && (
                              <p>Entidad: {payment.bank_name}</p>
                            )}
                            </div>
                          </div>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="shrink-0">
                            {payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {installments.length > 0 ? (
                          <div className="space-y-4">
                            {/* Vista de tabla en pantallas grandes */}
                            <div className="hidden lg:block overflow-x-auto">
                              <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-muted-foreground border-b">
                                  <th className="py-2">Cuota</th>
                                  <th className="py-2 text-right">Monto</th>
                                  <th className="py-2">Vencimiento</th>
                                  <th className="py-2">Estado</th>
                                  <th className="py-2 text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {installments.map((inst) => (
                                  <tr key={inst.id} className="border-b">
                                    <td className="py-3">Cuota {inst.installment_number}</td>
                                    <td className="py-3 text-right font-semibold">${parseFloat(inst.installment_amount || 0).toFixed(2)}</td>
                                    <td className="py-3">
                                      {inst.due_date ? new Date(inst.due_date).toLocaleDateString('es-AR') : '-'}
                                    </td>
                                    <td className="py-3">
                                      <Badge variant={inst.status === 'paid' ? 'default' : 'secondary'}>
                                        {inst.status === 'paid' ? 'Pagada' : 'Pendiente'}
                                      </Badge>
                                    </td>
                                    <td className="py-3 text-right">
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => loadInstallmentDetails(selectedBillingForPayments.id, payment.id, inst.id)}
                                        >
                                          Ver Detalle
                                        </Button>
                                        {inst.status === 'pending' && (
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInstallment(inst);
                                              setSelectedPaymentForInstallment(payment);
                                              setShowPayInstallmentDialog(true);
                                            }}
                                          >
                                            Registrar Pago
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                              </div>

                              {/* Vista de tarjetas en pantallas pequeñas */}
                              <div className="lg:hidden space-y-3">
                                {installments.map((inst) => (
                                  <Card key={inst.id} className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-semibold">Cuota {inst.installment_number}</p>
                                          <p className="text-lg font-bold text-primary">
                                            ${parseFloat(inst.installment_amount || 0).toFixed(2)}
                                          </p>
                                        </div>
                                        <Badge variant={inst.status === 'paid' ? 'default' : 'secondary'}>
                                          {inst.status === 'paid' ? 'Pagada' : 'Pendiente'}
                                        </Badge>
                                      </div>
                                    
                                      <div className="text-sm text-muted-foreground">
                                        <p>Vencimiento: {inst.due_date ? new Date(inst.due_date).toLocaleDateString('es-AR') : '-'}</p>
                                      </div>
                                    
                                      <div className="flex flex-col gap-2 pt-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => loadInstallmentDetails(selectedBillingForPayments.id, payment.id, inst.id)}
                                          className="w-full"
                                        >
                                          Ver Detalle
                                        </Button>
                                        {inst.status === 'pending' && (
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInstallment(inst);
                                              setSelectedPaymentForInstallment(payment);
                                              setShowPayInstallmentDialog(true);
                                            }}
                                            className="w-full"
                                          >
                                            Registrar Pago
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>

                            <div className="pt-2 border-t flex justify-between items-center">
                              <span className="font-semibold">Total:</span>
                              <span className="text-lg font-bold">
                                ${installments.reduce((sum, i) => sum + parseFloat(i.installment_amount || 0), 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay cuotas definidas</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setShowInstallmentsDialog(false)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog para Registrar Pago de Installment */}
      <Dialog open={showPayInstallmentDialog} onOpenChange={setShowPayInstallmentDialog} onEscapeKeyDown={() => setShowPayInstallmentDialog(false)}>
        <DialogContent className="w-full max-w-3xl sm:!max-w-3xl md:max-w-4xl md:!max-w-4xl max-h-[85vh] overflow-y-auto overflow-x-hidden p-6">
          <DialogHeader>
            <DialogTitle>Registrar Pago de Cuota {selectedInstallment?.installment_number}</DialogTitle>
            <DialogDescription>
              Carga el comprobante de la cuota, la fecha de pago y notas opcionales. Puedes previsualizar imágenes o PDFs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Monto: <span className="font-bold text-foreground">${parseFloat(selectedInstallment?.installment_amount || 0).toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Pago</Label>
              <Input
                type="date"
                value={installmentPaymentData.paymentDate}
                onChange={(e) =>
                  setInstallmentPaymentData({ ...installmentPaymentData, paymentDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Comprobante de Pago *</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInstallmentPaymentData({
                      ...installmentPaymentData,
                      receipt: file,
                      receiptPreview: URL.createObjectURL(file),
                    });
                  }
                }}
              />
              {installmentPaymentData.receiptPreview && (
                <div className="mt-3">
                  {installmentPaymentData.receipt?.type?.startsWith('image/') ? (
                    <img
                      src={installmentPaymentData.receiptPreview}
                      alt="Preview"
                      className="max-h-[40vh] w-full object-contain rounded border"
                    />
                  ) : installmentPaymentData.receipt?.type?.includes('pdf') ? (
                    <iframe
                      src={installmentPaymentData.receiptPreview}
                      width="100%"
                      height="400px"
                      className="border rounded"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground break-words">
                      📄 {installmentPaymentData.receipt?.name}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-red-600">* Campo obligatorio</p>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                placeholder="Ej: Pago realizado por transferencia, referencia #12345"
                value={installmentPaymentData.notes}
                onChange={(e) =>
                  setInstallmentPaymentData({ ...installmentPaymentData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayInstallmentDialog(false);
                  setInstallmentPaymentData({
                    receipt: null,
                    receiptPreview: null,
                    notes: '',
                    paymentDate: new Date().toISOString().split('T')[0]
                  });
                }}
                className="w-full sm:flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleMarkInstallmentPaid(selectedPaymentForInstallment?.id, selectedInstallment?.id)}
                className="w-full sm:flex-1"
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Ver Detalles del Installment */}
      <Dialog open={showInstallmentDetailDialog} onOpenChange={setShowInstallmentDetailDialog} onEscapeKeyDown={() => setShowInstallmentDetailDialog(false)}>
        <DialogContent className="w-full max-w-3xl sm:!max-w-3xl md:max-w-4xl md:!max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
          <DialogHeader>
            <DialogTitle>
              Detalle de Cuota {installmentDetail?.installment_number}
            </DialogTitle>
          </DialogHeader>
          
          {installmentDetail && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de la Cuota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Número de Cuota</p>
                      <p className="font-semibold">Cuota {installmentDetail.installment_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monto</p>
                      <p className="font-bold text-lg">${parseFloat(installmentDetail.installment_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                      <p className="font-medium">
                        {installmentDetail.due_date 
                          ? new Date(installmentDetail.due_date).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge variant={installmentDetail.status === 'paid' ? 'default' : 'secondary'} className="mt-1">
                        {installmentDetail.status === 'paid' ? 'Pagada' : 
                         installmentDetail.status === 'pending' ? 'Pendiente' :
                         installmentDetail.status === 'overdue' ? 'Vencida' : 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {installmentDetail.status === 'paid' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información del Pago</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de Pago</p>
                          <p className="font-medium">
                            {installmentDetail.payment_date 
                              ? new Date(installmentDetail.payment_date).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                          <p className="font-medium">
                            {installmentDetail.updated_at 
                              ? new Date(installmentDetail.updated_at).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>

                      {installmentDetail.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Notas</p>
                          <p className="mt-1 p-3 bg-muted rounded text-sm">{installmentDetail.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {installmentDetail.receipt_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Comprobante de Pago</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {installmentDetail.receipt_url.toLowerCase().endsWith('.pdf') ? (
                          (() => {
                            const previewUrl = getCloudinaryPdfPreviewUrl(installmentDetail.receipt_url, 600);
                            return previewUrl ? (
                              <a
                                href={installmentDetail.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={previewUrl}
                                  alt="Preview del comprobante (PDF)"
                                  className="w-full rounded border"
                                />
                              </a>
                            ) : null;
                          })()
                        ) : (
                          <a
                            href={installmentDetail.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={installmentDetail.receipt_url}
                              alt="Comprobante de pago"
                              className="w-full rounded border"
                            />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setShowInstallmentDetailDialog(false);
                  setInstallmentDetail(null);
                }}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
