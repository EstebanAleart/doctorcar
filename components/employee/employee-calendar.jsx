"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

export function EmployeeCalendar() {
  const [booked, setBooked] = useState([]); // array of 'YYYY-MM-DD'

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/calendar', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const dates = (data.bookedDates || []).map((d) => d.date);
          if (isMounted) setBooked(dates);
        }
      } catch (e) {
        console.error('Error fetching calendar', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const occupiedMatchers = useMemo(() => {
    return booked.map((d) => ({ from: new Date(d), to: new Date(d) }));
  }, [booked]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Turnos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge className="bg-green-600">Libre</Badge>
          <Badge className="bg-red-600">Ocupado</Badge>
        </div>
        <Calendar 
          modifiers={{ occupied: occupiedMatchers }}
          modifiersClassNames={{ occupied: "bg-red-200 text-red-900" }}
        />
      </CardContent>
    </Card>
  );
}
