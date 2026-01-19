"use client";

import { SharedCalendar } from "@/components/shared-calendar";
import { useAuth } from "@/hooks/use-auth";

export function EmployeeCalendar() {
  const { user } = useAuth();

  const filterAppointments = (appointments) => {
    // Filter only appointments for claims assigned to this employee
    return appointments.filter((apt) => apt.employee_id === user?.id);
  };

  return (
    <SharedCalendar
      title="Mi Calendario"
      subtitle="Vista de todas tus citas y trabajos programados"
      filterAppointments={filterAppointments}
    />
  );
}
