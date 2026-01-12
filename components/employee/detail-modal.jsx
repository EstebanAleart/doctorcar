"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DetailModal({
  billing,
  claim,
  claims,
  billings,
  payments = [],
  getBillingDisplayTotal,
  getBillingDisplayBalance,
}) {
  return (
    <Tabs defaultValue="factura" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="factura">Factura</TabsTrigger>
        <TabsTrigger value="cliente">Cliente</TabsTrigger>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="reclamo">Reclamo</TabsTrigger>
      </TabsList>

      {/* Pestaña: Factura */}
      <TabsContent value="factura" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">ID Factura</p>
                <p className="font-medium">{billing.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Número de Factura</p>
                <p className="font-medium">{billing.billing_number || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Estado</p>
                <Badge variant="outline">{billing.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Aprobación Claim</p>
                <Badge variant="outline">{billing.claim_approval_status || "pending"}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="font-bold">${getBillingDisplayTotal(billing).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pagado</p>
                <p className="font-bold text-green-600">${Number(billing.paid_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Saldo</p>
                <p className="font-bold">${getBillingDisplayBalance(billing).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagos Realizados */}
        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagos Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded p-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Método</p>
                        <p className="font-medium capitalize">{payment.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Monto</p>
                        <p className="font-bold">${parseFloat(payment.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Fecha</p>
                        <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Estado</p>
                        <Badge variant="outline">{payment.status || "recorded"}</Badge>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <p><strong>Notas:</strong> {payment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Pestaña: Cliente */}
      <TabsContent value="cliente" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Nombre</p>
                <p className="font-medium">{billing.client_name || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium text-xs">{billing.client_email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Teléfono</p>
                <p className="font-medium">{billing.client_phone || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Marca</p>
                <p className="font-medium">{billing.vehicle_brand || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Modelo</p>
                <p className="font-medium">{billing.vehicle_model || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Patente</p>
                <p className="font-bold font-mono">{billing.vehicle_plate || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Año</p>
                <p className="font-medium">{billing.vehicle_year || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Pestaña: Items */}
      <TabsContent value="items" className="space-y-4 mt-4">
        {billing.items && billing.items.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items de la Factura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Descripción</th>
                      <th className="py-2 text-right">Cantidad</th>
                      <th className="py-2 text-right">Precio Unitario</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.items.map((item, idx) => {
                      const qty = parseFloat(item.quantity) || 0;
                      const price = parseFloat(item.unit_price || item.unitPrice) || 0;
                      const subtotal = qty * price;
                      return (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-right">{qty}</td>
                          <td className="py-2 text-right">${price.toFixed(2)}</td>
                          <td className="py-2 text-right font-semibold">${subtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No hay items en esta factura</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Pestaña: Reclamo */}
      <TabsContent value="reclamo" className="space-y-4 mt-4">
        {claim ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Reclamo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">ID Reclamo</p>
                  <p className="font-medium">{claim.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Estado Aprobación</p>
                  <Badge variant="outline">{claim.approval_status || "pending"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No hay información del reclamo</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
