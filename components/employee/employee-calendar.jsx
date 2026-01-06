"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function EmployeeCalendar() {
  const [booked, setBooked] = useState([]); // array of 'YYYY-MM-DD'
  const [workOrders, setWorkOrders] = useState([]); // array of work orders

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/calendar', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const dates = data.bookedDates || [];
          if (isMounted) {
            setBooked(dates);
            setWorkOrders(data.workOrders || []);
          }
        }
      } catch (e) {
        console.error('Error fetching calendar', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const occupiedMatchers = useMemo(() => {
    return booked.map((d) => new Date(d));
  }, [booked]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Calendario de Turnos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-green-600">Libre</Badge>
            <Badge className="bg-red-600">Ocupado (2 días)</Badge>
          </div>
          <Calendar 
            modifiers={{ occupied: occupiedMatchers }}
            modifiersClassNames={{ occupied: "bg-red-200 text-red-900" }}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Trabajos Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {workOrders.length > 0 ? (
            workOrders.map((order) => (
              <div key={order.id} className="p-3 border rounded-lg bg-muted/30 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="text-sm font-medium">{order.clientName}</div>
                  <Badge variant="outline" className="text-xs">
                    {format(new Date(order.date), "dd/MM", { locale: es })}
                  </Badge>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">
                    <strong>Vehículo:</strong> {order.vehicle}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Patente:</strong> {order.plate}
                  </p>
                  <p className="text-muted-foreground line-clamp-2">
                    <strong>Daño:</strong> {order.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay trabajos pendientes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
