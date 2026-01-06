"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, X } from "lucide-react";
import Swal from "sweetalert2";

export function ApprovalSection({ claim, onApprovalUpdate, loading }) {
  const [approvalData, setApprovalData] = useState({
    approval: claim.approval_status || "pending",
    paymentMethod: claim.payment_method || "",
    appointmentDate: claim.appointment_date || "",
  });
  const [bookedDates, setBookedDates] = useState([]);
  const formatLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/calendar', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const dates = (data.bookedDates || []).map((d) => d.date);
          if (isMounted) setBookedDates(dates);
        }
      } catch (e) {
        console.error('Error loading booked dates', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const isParticular = claim.type === "particular";
  const isAccepted = approvalData.approval === "accepted";

  const handleSubmitAccept = async () => {
    if (isParticular && !approvalData.paymentMethod) {
      await Swal.fire({
        title: "Dato incompleto",
        text: "Por favor selecciona un método de pago",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    if (!approvalData.appointmentDate) {
      await Swal.fire({
        title: "Dato incompleto",
        text: "Por favor selecciona una fecha para el turno",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    await onApprovalUpdate({
      approval_status: "accepted",
      payment_method: isParticular ? approvalData.paymentMethod : null,
      appointment_date: approvalData.appointmentDate,
    });
  };

  const handleSubmitReject = async () => {
    const result = await Swal.fire({
      title: "¿Rechazar Presupuesto?",
      text: "Si rechazas este presupuesto, tendrás que crear un nuevo reclamo",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#1a4d6d",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await onApprovalUpdate({
        approval_status: "rejected",
      });
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="h-4 w-4" />
        {claim.approval_status === "pending" && "Este presupuesto está pendiente de tu aceptación o rechazo"}
        {claim.approval_status === "accepted" && "Presupuesto aceptado"}
        {claim.approval_status === "rejected" && "Presupuesto rechazado"}
      </div>

      {claim.approval_status === "pending" && (
        <div className="space-y-4">
          {isParticular && (
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select value={approvalData.paymentMethod} onValueChange={(value) => setApprovalData({ ...approvalData, paymentMethod: value })}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Fecha de Turno</Label>
            <div className="text-xs text-muted-foreground mb-2 flex gap-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#1a4d6d]"></span> Seleccionada</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Ocupada</span>
            </div>
            <Calendar
              mode="single"
              selected={approvalData.appointmentDate ? new Date(approvalData.appointmentDate + 'T00:00:00') : undefined}
              onSelect={(date) => {
                if (!date) return;
                const ymd = formatLocalYMD(date);
                if (bookedDates.includes(ymd)) {
                  Swal.fire({
                    title: 'Fecha ocupada',
                    text: 'Esa fecha ya está ocupada. Por favor elige otra.',
                    icon: 'warning',
                    confirmButtonColor: '#1a4d6d',
                  });
                  return;
                }
                setApprovalData({ ...approvalData, appointmentDate: ymd });
              }}
              fromDate={new Date()}
              disabled={(date) => {
                const ymd = formatLocalYMD(date);
                return bookedDates.includes(ymd);
              }}
              modifiers={{
                booked: (date) => {
                  const ymd = formatLocalYMD(date);
                  return bookedDates.includes(ymd);
                }
              }}
              modifiersClassNames={{
                booked: "bg-red-100 text-red-900 line-through opacity-50 cursor-not-allowed"
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitAccept}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Aceptar Presupuesto
            </Button>
            <Button
              onClick={handleSubmitReject}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {claim.approval_status === "accepted" && (
        <div className="space-y-2 p-3 bg-green-50 rounded-md">
          <p className="text-sm"><strong>Fecha de Turno:</strong> {claim.appointment_date ? new Date(claim.appointment_date).toLocaleDateString("es-AR") : "N/A"}</p>
          {isParticular && <p className="text-sm"><strong>Método de Pago:</strong> {claim.payment_method || "N/A"}</p>}
        </div>
      )}

      {claim.approval_status === "rejected" && (
        <div className="p-3 bg-red-50 rounded-md text-sm text-red-800">
          Este presupuesto ha sido rechazado. Si deseas continuar, crea un nuevo reclamo.
        </div>
      )}
    </div>
  );
}
