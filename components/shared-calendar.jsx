"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export function SharedCalendar({ title, subtitle, filterAppointments, extraBlockedDates = [] }) {
  const [bookedDates, setBookedDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      // Get booked dates from calendar endpoint (48h already calculated)
      const calendarResponse = await fetch("/api/calendar");
      const calendarData = await calendarResponse.json();
      let bookedDates = calendarData.bookedDates || [];
      // Unir con fechas bloqueadas extra
      bookedDates = Array.from(new Set([...bookedDates, ...extraBlockedDates]));
      setBookedDates(bookedDates);

      // Get all appointments
      const response = await fetch("/api/appointments");
      const allAppointments = await response.json();

      if (!Array.isArray(allAppointments)) {
        setAppointments([]);
        return;
      }

      // Filter appointments based on role (passed as prop)
      const filteredAppointments = filterAppointments 
        ? filterAppointments(allAppointments) 
        : allAppointments;

      const workOrders = filteredAppointments.map((apt) => ({
        id: apt.id,
        date:
          typeof apt.scheduled_date === "string"
            ? apt.scheduled_date
            : new Date(apt.scheduled_date).toISOString().split("T")[0],
        time: apt.scheduled_time,
        status: apt.status,
        type: apt.appointment_type,
        duration: apt.duration_minutes,
        clientName: apt.client_name,
        description: apt.notes || apt.claim_description,
        vehicle: `${apt.brand} ${apt.model}`,
        plate: apt.plate,
      }));

      setAppointments(workOrders);
    } catch (error) {
      // Error fetching calendar dates
    }
  };

  const formatLocalYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const modifiers = {
    booked: (date) => bookedDates.includes(formatLocalYMD(date)),
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      fontWeight: "bold",
    },
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-amber-100 text-amber-800",
      completed: "bg-emerald-100 text-emerald-800",
      rescheduled: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Citas Programadas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Citas Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay citas programadas
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {appointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            {apt.clientName && (
                              <p className="text-sm font-medium text-muted-foreground">
                                {apt.clientName}
                              </p>
                            )}
                            <p className="font-medium">{apt.vehicle}</p>
                            <p className="text-sm text-muted-foreground">
                              Patente: <span className="font-mono">{apt.plate}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">
                              {new Date(apt.date).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </Badge>
                            {apt.time && (
                              <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{apt.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{apt.type}</Badge>
                          <Badge className={getStatusBadge(apt.status)}>
                            {apt.status}
                          </Badge>
                          {apt.duration ? (
                            <Badge variant="outline">{apt.duration} min</Badge>
                          ) : null}
                        </div>

                        {apt.description && (
                          <p className="text-sm">{apt.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próxima Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.length > 0
                ? new Date(appointments[0].date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
