"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  XCircle 
} from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0,
    inProgressClaims: 0,
    rejectedClaims: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Fetch users
      const usersResponse = await fetch("/api/users", { credentials: "include" });
      const users = await usersResponse.json();

      // Fetch claims
      const claimsResponse = await fetch("/api/claims", { credentials: "include" });
      const claims = await claimsResponse.json();

      // Calculate revenue from claims with items
      const totalRevenue = claims.reduce((sum, claim) => {
        if (claim.items && Array.isArray(claim.items) && claim.approval_status === "accepted") {
          const claimTotal = claim.items.reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          }, 0);
          return sum + claimTotal;
        }
        return sum;
      }, 0);

      // Calculate pending revenue (with items but not accepted yet)
      const pendingRevenue = claims.reduce((sum, claim) => {
        if (claim.items && Array.isArray(claim.items) && claim.approval_status === "pending") {
          const claimTotal = claim.items.reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          }, 0);
          return sum + claimTotal;
        }
        return sum;
      }, 0);

      setStats({
        totalUsers: users.filter((u) => u.role === "client").length,
        totalClaims: claims.length,
        pendingClaims: claims.filter((c) => c.status === "pending").length,
        completedClaims: claims.filter((c) => c.status === "completed").length,
        inProgressClaims: claims.filter((c) => c.status === "in_progress").length,
        rejectedClaims: claims.filter((c) => c.approval_status === "rejected").length,
        totalRevenue,
        pendingRevenue,
      });

      // Get 5 most recent claims with proper field mapping
      setRecentClaims(
        claims
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Clientes",
      value: stats.totalUsers,
      description: "Clientes registrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Reclamos Totales",
      value: stats.totalClaims,
      description: "Todos los reclamos",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pendientes",
      value: stats.pendingClaims,
      description: "Esperando asignación",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "En Progreso",
      value: stats.inProgressClaims,
      description: "Trabajos en curso",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completados",
      value: stats.completedClaims,
      description: "Trabajos finalizados",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rechazados",
      value: stats.rejectedClaims,
      description: "Presupuestos rechazados",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      completed: { className: "bg-green-100 text-green-800", label: "Completado" },
      in_progress: { className: "bg-blue-100 text-blue-800", label: "En Progreso" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelado" },
    };
    return variants[status] || { className: "bg-gray-100 text-gray-800", label: status };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Panel General</h2>
        <p className="text-muted-foreground">Vista general del taller</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Confirmada</CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Presupuestos aceptados y completados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Pendiente</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              ${stats.pendingRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperando aprobación de cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle>Reclamos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentClaims.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay reclamos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{claim.client_name || "Sin cliente"}</p>
                      <Badge className={getStatusBadge(claim.status).className}>
                        {getStatusBadge(claim.status).label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {claim.brand} {claim.model} - {claim.plate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {claim.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(claim.created_at).toLocaleDateString("es-AR")}
                    </p>
                    {claim.items && claim.items.length > 0 && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        $
                        {claim.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              (parseFloat(item.quantity) || 0) *
                                (parseFloat(item.unit_price) || 0),
                            0
                          )
                          .toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 