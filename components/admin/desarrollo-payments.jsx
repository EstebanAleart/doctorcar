"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const fetchDevelopmentPayments = async () => {
  const res = await fetch("/api/develop");
  return await res.json();
};

const registerPayment = async (data) => {
  const res = await fetch("/api/develop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export function DesarrolloPayments() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ billingId: "", percentage: 10, amount: "" });
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
    await registerPayment({ ...form, amount: Number(form.amount) });
    setForm({ billingId: "", percentage: 10, amount: "" });
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
            name="billingId"
            value={form.billingId}
            onChange={handleChange}
            placeholder="ID de Billing"
            required
            className="w-1/3"
          />
          <Input
            name="percentage"
            type="number"
            value={form.percentage}
            onChange={handleChange}
            placeholder="% Desarrollo"
            required
            className="w-1/6"
            min={0}
            max={100}
          />
          <Input
            name="amount"
            type="number"
            value={form.amount}
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
              <TableHead>ID Billing</TableHead>
              <TableHead>Claim</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>% Desarrollo</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.billingId}</TableCell>
                <TableCell>{p.billing?.claim_id}</TableCell>
                <TableCell>{p.billing?.client_name || p.billing?.client_id}</TableCell>
                <TableCell>${p.amount?.toLocaleString()}</TableCell>
                <TableCell>{p.percentage}%</TableCell>
                <TableCell>{p.created_at?.slice(0,10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
