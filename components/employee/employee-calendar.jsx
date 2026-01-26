"use client";


import { useState, useEffect } from "react";
import { SharedCalendar } from "@/components/shared-calendar";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export function EmployeeCalendar() {
  const { user } = useAuth();
  const [selectedBlockDate, setSelectedBlockDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBlockDate = async () => {
    if (!selectedBlockDate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: null,
          scheduledDate: selectedBlockDate,
          scheduledTime: null,
          duration: 1440,
          type: "blocked",
          notes: "Bloqueo de fecha por empleado"
        }),
      });
      if (res.ok) {
        await Swal.fire({
          title: "Fecha bloqueada",
          text: `La fecha ${selectedBlockDate} fue bloqueada para turnos de clientes.`,
          icon: "success",
          confirmButtonColor: "#1a4d6d",
        });
        setSelectedBlockDate("");
        window.location.reload();
      } else {
        const error = await res.json();
        await Swal.fire({
          title: "Error",
          text: error.error || "No se pudo bloquear la fecha",
          icon: "error",
          confirmButtonColor: "#1a4d6d",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(
      (apt) =>
        (apt.claim_employee_id && apt.claim_employee_id === user?.id) ||
        (apt.type === "blocked")
    );
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="py-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="block-date" className="font-medium">Bloquear fecha para turnos</label>
            <input
              id="block-date"
              type="date"
              value={selectedBlockDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedBlockDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <Button onClick={handleBlockDate} disabled={!selectedBlockDate || loading} className="bg-[#1a4d6d]">
            {loading ? "Bloqueando..." : "Bloquear Fecha"}
          </Button>
        </CardContent>
      </Card>
      <SharedCalendar
        title="Mi Calendario"
        subtitle="Vista de todas tus citas y trabajos programados"
        filterAppointments={filterAppointments}
      />
    </>
  );
}
