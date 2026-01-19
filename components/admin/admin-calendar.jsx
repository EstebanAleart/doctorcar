"use client";

import { SharedCalendar } from "@/components/shared-calendar";

export function AdminCalendar() {
  const filterAppointments = (appointments) => {
    // Admin sees ALL appointments - no filter
    return appointments;
  };

  return (
    <SharedCalendar
      title="Calendario de Citas"
      subtitle="Vista de todas las citas programadas en el taller"
      filterAppointments={filterAppointments}
    />
  );
}
