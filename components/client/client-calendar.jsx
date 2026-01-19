"use client";

import { SharedCalendar } from "@/components/shared-calendar";
import { useAuth } from "@/hooks/use-auth";

export function ClientCalendar() {
  const { user } = useAuth();

  const filterAppointments = (appointments) => {
    // Filter only appointments for this client's claims
    return appointments.filter((apt) => apt.client_id === user?.id);
  };

  return (
    <SharedCalendar
      title="Mis Citas"
      subtitle="Calendario de tus citas de reparación programadas"
      filterAppointments={filterAppointments}
    />
  );
}
