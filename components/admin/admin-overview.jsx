"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, CheckCircle2 } from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0,
  });

  useEffect(() => {
    const users = db.getUsers();
    const claims = db.getClaims();
    setStats({
      totalUsers: users.filter((u) => u.role === "client").length,
      totalClaims: claims.length,
      pendingClaims: claims.filter((c) => c.status === "pending").length,
      completedClaims: claims.filter((c) => c.status === "completed").length,
    });
  }, []);

  const statCards = [
    {
      title: "Clientes",
      value: stats.totalUsers,
      description: "Clientes registrados",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Reclamos Totales",
      value: stats.totalClaims,
      description: "Todos los reclamos",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Pendientes",
      value: stats.pendingClaims,
      description: "Esperando asignación",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completados",
      value: stats.completedClaims,
      description: "Trabajos finalizados",
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Panel General</h2>
        <p className="text-muted-foreground">Vista general del taller</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 