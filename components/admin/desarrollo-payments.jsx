"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Simulación de API temporal
const fetchDevelopmentPayments = async () => {
  // Aquí deberías hacer fetch a tu API real
  return [
    {
      id: 1,
      trabajo: "Integración API de facturación",
      monto: 120000,
      pagado: true,
      fechaPago: "2026-01-10",
    },
    {
      id: 2,
      trabajo: "Refactor módulo claims",
      monto: 80000,
      pagado: false,
      fechaPago: null,
    },
  ];
};

const registerPayment = async (data) => {
  // Aquí deberías hacer POST a tu API real
  return { success: true };
};

export function DesarrolloPayments() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ trabajo: "", monto: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevelopmentPayments().then(setPayments);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await registerPayment({ ...form, monto: Number(form.monto) });
    setForm({ trabajo: "", monto: "" });
    fetchDevelopmentPayments().then(setPayments);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pago de Desarrollo</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex gap-4 mb-6" onSubmit={handleSubmit}>
          <Input
            name="trabajo"
            value={form.trabajo}
            onChange={handleChange}
            placeholder="Trabajo realizado"
            required
            className="w-1/2"
          />
          <Input
            name="monto"
            type="number"
            value={form.monto}
            onChange={handleChange}
            placeholder="Monto ($)"
            required
            className="w-1/4"
            min={0}
          />
          <Button type="submit" disabled={loading}>
            Registrar
          </Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Fecha de Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.trabajo}</TableCell>
                <TableCell>${p.monto.toLocaleString()}</TableCell>
                <TableCell>{p.pagado ? "Sí" : "No"}</TableCell>
                <TableCell>{p.fechaPago ? p.fechaPago : "Pendiente"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
