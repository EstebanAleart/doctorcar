"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export function AdminCalendar() {
  const [bookedDates, setBookedDates] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();
      
      const workOrders = data.map((apt) => ({
        id: apt.id,
        date: typeof apt.scheduled_date === 'string' ? apt.scheduled_date : new Date(apt.scheduled_date).toISOString().split('T')[0],
        time: apt.scheduled_time,
        status: apt.status,
        type: apt.appointment_type,
        duration: apt.duration_minutes,
        clientName: apt.client_name,
        description: apt.notes || apt.claim_description,
        vehicle: `${apt.brand} ${apt.model}`,
        plate: apt.plate,
      }));

      const bookedDates = Array.from(new Set(workOrders.map((order) => order.date)));
      
      setBookedDates(bookedDates);
      setWorkOrders(workOrders);
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
        <h2 className="text-3xl font-bold">Calendario de Trabajos</h2>
        <p className="text-muted-foreground">
          Vista de todas las citas y trabajos programados
        </p>
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
                <span>Días Ocupados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay citas programadas
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {workOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.vehicle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">
                              {new Date(order.date).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </Badge>
                            {order.time && (
                              <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{order.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{order.type}</Badge>
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                          {order.duration ? (
                            <Badge variant="outline">{order.duration} min</Badge>
                          ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Patente: <span className="font-mono">{order.plate}</span>
                        </p>
                        <p className="text-sm">{order.description}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trabajos Programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días Ocupados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookedDates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximo Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.length > 0
                ? new Date(workOrders[0].date).toLocaleDateString("es-AR", {
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
