"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Eye } from "lucide-react";

export function AdminCalendar() {
  const [bookedDates, setBookedDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [claimDetail, setClaimDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  console.log("[ADMIN CALENDAR] Component rendered, current appointments:", appointments);

  useEffect(() => {
    console.log("[ADMIN CALENDAR] useEffect mounted, calling loadCalendarData");
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      // Obtener fechas ocupadas del endpoint /api/calendar (ya calcula 48 horas correctamente)
      const calendarResponse = await fetch("/api/calendar", { credentials: "include" });
      const calendarData = await calendarResponse.json();
      const bookedDates = calendarData.bookedDates || [];
      console.log("[ADMIN CALENDAR] Booked dates:", bookedDates);
      setBookedDates(bookedDates);

      // Obtener todas las citas
      const appointmentsResponse = await fetch("/api/appointments", { credentials: "include" });
      const allAppointments = await appointmentsResponse.json();
      console.log("[ADMIN CALENDAR] Raw appointments response:", allAppointments);

      if (!Array.isArray(allAppointments)) {
        console.error("[ADMIN CALENDAR] Appointments is not an array:", typeof allAppointments);
        setAppointments([]);
        return;
      }

      const workOrders = allAppointments.map((apt) => ({
        id: apt.id,
        claimId: apt.claim_id,
        date: typeof apt.scheduled_date === "string"
          ? apt.scheduled_date.split("T")[0]
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

      console.log("[ADMIN CALENDAR] Mapped appointments:", workOrders);
      setAppointments(workOrders);
    } catch (error) {
      console.error("[ADMIN CALENDAR] Error fetching calendar data:", error);
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

  const loadClaimDetail = async (claimId) => {
    try {
      console.log("[ADMIN CALENDAR] Loading claim detail for claimId:", claimId);
      setLoadingDetail(true);
      const response = await fetch(`/api/claims/${claimId}/full`, {
        credentials: "include",
      });
      console.log("[ADMIN CALENDAR] Claim response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("[ADMIN CALENDAR] Claim detail loaded:", data);
        setClaimDetail(data);
      } else {
        console.error("[ADMIN CALENDAR] Claim response not OK:", response.status);
      }
    } catch (error) {
      console.error("[ADMIN CALENDAR] Error loading claim details:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetail = (workOrder) => {
    console.log("[ADMIN CALENDAR] handleViewDetail called with:", workOrder);
    setSelectedWorkOrder(workOrder);
    setShowDetailModal(true);
    if (workOrder.claimId) {
      console.log("[ADMIN CALENDAR] Loading claim detail...");
      loadClaimDetail(workOrder.claimId);
    }
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
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <div>
                  <p className="font-medium">Días Ocupados</p>
                  <p className="text-xs text-muted-foreground">Incluye 48 horas mínimo de duración</p>
                </div>
              </div>
              {appointments.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="font-medium mb-2">Resumen:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Total de citas: <span className="font-medium text-foreground">{appointments.length}</span></li>
                    <li>• Días ocupados: <span className="font-medium text-foreground">{bookedDates.length}</span></li>
                    <li>• Próxima cita: <span className="font-medium text-foreground">
                      {appointments.length > 0
                        ? new Date(appointments[0].date).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "-"}
                    </span></li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Todos los Trabajos Programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay citas programadas
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{appointment.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.vehicle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">
                              {new Date(appointment.date).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </Badge>
                            {appointment.time && (
                              <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{appointment.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{appointment.type}</Badge>
                          <Badge className={getStatusBadge(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          {appointment.duration ? (
                            <Badge variant="outline">{appointment.duration} min</Badge>
                          ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Patente: <span className="font-mono">{appointment.plate}</span>
                        </p>
                        <p className="text-sm">{appointment.description}</p>

                        <Button
                          onClick={() => handleViewDetail(appointment)}
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles Completos
                        </Button>
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
              Total Citas Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Incluyendo reschedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días Ocupados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookedDates.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              (mínimo 48 horas por cita)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próxima Cita Programada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {appointments.length > 0
                ? new Date(appointments[0].date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "-"}
            </div>
            {appointments.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {appointments[0].clientName}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles de Cita Programada
              {selectedWorkOrder && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({new Date(selectedWorkOrder.date).toLocaleDateString("es-AR")} {selectedWorkOrder.time})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="space-y-6">
              {/* Cita Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de la Cita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedWorkOrder.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehículo</p>
                      <p className="font-medium">{selectedWorkOrder.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Patente</p>
                      <p className="font-mono">{selectedWorkOrder.plate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {new Date(selectedWorkOrder.date).toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hora</p>
                      <p className="font-medium">{selectedWorkOrder.time || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duración</p>
                      <p className="font-medium">{selectedWorkOrder.duration} minutos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div>
                      <Badge variant="secondary" className="w-full justify-center">
                        {selectedWorkOrder.type}
                      </Badge>
                    </div>
                    <div>
                      <Badge className={`w-full justify-center ${getStatusBadge(selectedWorkOrder.status)}`}>
                        {selectedWorkOrder.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedWorkOrder.description && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Notas / Descripción</p>
                      <p className="text-sm mt-2">{selectedWorkOrder.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detalles del Reclamo */}
              {loadingDetail ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Cargando detalles del reclamo...
                  </CardContent>
                </Card>
              ) : claimDetail ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Reclamo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">ID Reclamo</p>
                          <p className="font-mono font-medium">{claimDetail.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Descripción</p>
                          <p className="font-medium text-sm">{claimDetail.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo de Reclamo</p>
                          <p className="font-medium">{claimDetail.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <Badge>{claimDetail.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Presupuesto */}
                  {claimDetail.items && claimDetail.items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Presupuesto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {claimDetail.items.map((item, idx) => {
                            const unitPrice = parseFloat(item.unit_price || item.unitPrice || 0);
                            const quantity = parseFloat(item.quantity || 0);
                            return (
                            <div key={idx} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {quantity} x ${unitPrice.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium">
                                ${(quantity * unitPrice).toFixed(2)}
                              </p>
                            </div>
                          );
                          })}
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">Total del Presupuesto:</p>
                            <p className="text-xl font-bold text-green-600">
                              $
                              {claimDetail.items
                                .reduce(
                                  (sum, item) =>
                                    sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || item.unitPrice || 0)),
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Billing Info */}
                  {claimDetail.billing && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Estado de Facturación</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Monto Total</p>
                            <p className="text-lg font-bold">
                              ${(claimDetail.billing.total_amount || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Pagado</p>
                            <p className="text-lg font-bold text-green-600">
                              ${(claimDetail.billing.paid_amount || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Pendiente</p>
                            <p className="text-lg font-bold text-orange-600">
                              ${((claimDetail.billing.total_amount || 0) - (claimDetail.billing.paid_amount || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
