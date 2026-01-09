"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DollarSign,
  Upload,
  X,
  Search,
  Filter,
  Receipt,
  CreditCard,
  Banknote,
  Building,
} from "lucide-react";
import Swal from "sweetalert2";

export function EmployeePayments() {
  const [claims, setClaims] = useState([]);
  const [billings, setBillings] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [loading, setLoading] = useState(true);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    method: "efectivo", // efectivo, transferencia, tarjeta
    amount: 0,
    // Para tarjeta
    installments: 1,
    interestRate: 0,
    entity: "", // Banco/entidad
    cardType: "", // Visa, Mastercard, etc
    // Comprobante
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
        fetch("/api/billing")
      ]);
      
      // Verificar respuestas exitosas
      if (!claimsRes.ok) {
        setClaims([]);
        setBillings([]);
        return;
      }
      
      if (!billingsRes.ok) {
        setClaims([]);
        setBillings([]);
        return;
      }
      
      const claimsData = await claimsRes.json();
      const billingsData = await billingsRes.json();
      
      // Validar que sean arrays
      if (!Array.isArray(claimsData)) {
        setBillings(Array.isArray(billingsData) ? billingsData : []);
        return;
      }
      
      // Solo reclamos con presupuesto aceptado
      const acceptedClaims = claimsData.filter(
        (c) => c.approval_status === "accepted" && c.items && c.items.length > 0
      );
      
      setClaims(acceptedClaims);
      setBillings(Array.isArray(billingsData) ? billingsData : []);
    } catch (error) {
      setClaims([]);
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };

  const getBillingForClaim = (claimId) => {
    return billings.find(b => b.claim_id === claimId);
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const calculateTotalWithInterest = () => {
    const { amount, installments, interestRate } = paymentData;
    if (paymentData.method !== "tarjeta") return parseFloat(amount);
    
    const rate = parseFloat(interestRate) / 100;
    const totalWithInterest = parseFloat(amount) * (1 + rate * installments);
    return totalWithInterest;
  };

  const filteredClaims = useMemo(() => {
    let result = [...claims];

    // Payment status filter - now based on billing status
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

    // Search filter
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

    // Sorting
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

  const handleOpenPayment = (claim) => {
    setSelectedClaim(claim);
    setPaymentData({
      method: "efectivo",
      amount: calculateTotal(claim.items),
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
    if (!paymentData.receipt) {
      Swal.fire({
        icon: "warning",
        title: "Comprobante requerido",
        text: "Por favor sube una imagen del comprobante de pago",
      });
      return;
    }

    if (paymentData.method === "tarjeta" && !paymentData.entity) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Por favor ingresa la entidad bancaria",
      });
      return;
    }

    try {
      // 1. Crear o encontrar billing para este claim
      let billing;
      try {
        const billingCheckResponse = await fetch("/api/billing");
        const allBillings = await billingCheckResponse.json();
        billing = allBillings.find(b => b.claim_id === selectedClaim.id);
        
        if (!billing) {
          // Crear billing si no existe
          const createBillingResponse = await fetch("/api/billing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claimId: selectedClaim.id }),
          });
          
          if (!createBillingResponse.ok) {
            throw new Error("No se pudo crear la factura");
          }
          
          billing = await createBillingResponse.json();
        }
      } catch (error) {
        throw error;
      }

      // 2. Crear payment record
      const paymentResponse = await fetch(`/api/billing/${billing.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculateTotalWithInterest(),
          paymentMethod: paymentData.method === "efectivo" ? "cash" : 
                        paymentData.method === "transferencia" ? "bank_transfer" : 
                        "credit_card",
          cardInstallments: paymentData.installments,
          cardInterestRate: paymentData.interestRate,
          bankName: paymentData.entity,
          receiptUrl: paymentData.receipt, // Base64 for now
          notes: paymentData.notes,
        }),
      });

      if (paymentResponse.ok) {
        Swal.fire({
          icon: "success",
          title: "Pago registrado",
          text: "El pago se registró correctamente en la factura",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowPaymentDialog(false);
        loadData();
      } else {
        throw new Error("Error al registrar el pago");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo registrar el pago",
      });
    }
  };

  const getPaymentStatusBadge = (claim) => {
    const billing = getBillingForClaim(claim.id);
    
    if (!billing) {
      return <Badge className="bg-gray-100 text-gray-800">Sin factura</Badge>;
    }
    
    if (billing.status === "paid") {
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
    }
    if (billing.status === "partial") {
      return <Badge className="bg-blue-100 text-blue-800">Pago Parcial</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Gestión de Cobros</h2>
        <p className="text-muted-foreground">
          Registra los pagos de clientes con comprobantes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {claims
                .filter((c) => {
                  const billing = getBillingForClaim(c.id);
                  return !billing || billing.status === "pending" || billing.status === "partial";
                })
                .reduce((sum, c) => {
                  const billing = getBillingForClaim(c.id);
                  return sum + (billing ? parseFloat(billing.balance) || 0 : calculateTotal(c.items));
                }, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cobrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {billings
                .filter((b) => b.status === "paid" || b.status === "partial")
                .reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trabajos Aceptados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay trabajos para cobrar
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
                      {claim.vehicleBrand} {claim.vehicleModel}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {claim.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {claim.vehiclePlate}
                    </p>
                  </div>
                  {getPaymentStatusBadge(claim)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monto Total:</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${calculateTotal(claim.items).toFixed(2)}
                  </p>
                </div>

                {claim.payment_status === "paid" ? (
                  <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Pago Registrado
                    </p>
                    <div className="text-xs text-green-700">
                      <p>Método: {claim.payment_method}</p>
                      <p>Monto: ${parseFloat(claim.payment_amount || 0).toFixed(2)}</p>
                      {claim.payment_installments > 1 && (
                        <p>Cuotas: {claim.payment_installments} x {claim.payment_interest_rate}%</p>
                      )}
                      {claim.payment_receipt && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-green-700"
                          onClick={() => window.open(claim.payment_receipt, "_blank")}
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Ver comprobante
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleOpenPayment(claim)}
                    className="w-full"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Registrar Pago
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              {/* Claim Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cliente:</p>
                      <p className="font-medium">{selectedClaim.clientName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vehículo:</p>
                      <p className="font-medium">
                        {selectedClaim.vehicleBrand} {selectedClaim.vehicleModel}
                      </p>
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

              {/* Card specific fields */}
              {paymentData.method === "tarjeta" && (
                <>
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

                  <div className="space-y-2">
                    <Label>Entidad Bancaria</Label>
                    <Input
                      placeholder="Ej: Banco Nación, Visa, Mastercard"
                      value={paymentData.entity}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, entity: e.target.value })
                      }
                    />
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
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-blue-800">
                        <strong>Total con Interés:</strong> $
                        {calculateTotalWithInterest().toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Comprobante de Pago *</Label>
                {!paymentData.receiptPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Sube una imagen del comprobante
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("receipt-upload").click()
                      }
                    >
                      Seleccionar archivo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG hasta 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={paymentData.receiptPreview}
                      alt="Comprobante"
                      className="w-full h-64 object-contain border rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setPaymentData({
                          ...paymentData,
                          receipt: null,
                          receiptPreview: null,
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas (Opcional)</Label>
                <Textarea
                  placeholder="Observaciones sobre el pago..."
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmitPayment}>
                  Registrar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
