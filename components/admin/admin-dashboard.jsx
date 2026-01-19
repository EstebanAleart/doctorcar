"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "./admin-header.jsx";
import { AdminOverview } from "./admin-overview.jsx";
import { AdminUsers } from "./admin-users.jsx";
import { AdminClaims } from "./admin-claims.jsx";
import { AdminWorkshop } from "./admin-workshop.jsx";
import { AdminBilling } from "./admin-billing.jsx";
import { AdminWorkOrders } from "./admin-work-orders.jsx";
import { AdminCalendar } from "./admin-calendar.jsx";
import { UserProfile } from "@/components/user-profile";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-2 h-auto md:grid-cols-4 lg:grid-cols-8 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Panel General</TabsTrigger>
            <TabsTrigger value="claims" className="text-xs md:text-sm">Reclamos</TabsTrigger>
            <TabsTrigger value="work-orders" className="text-xs md:text-sm">Órdenes</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendario</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs md:text-sm">Facturación</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">Usuarios</TabsTrigger>
            <TabsTrigger value="workshop" className="text-xs md:text-sm">Taller</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Mi Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="claims" className="space-y-6">
            <AdminClaims />
          </TabsContent>
          <TabsContent value="work-orders" className="space-y-6">
            <AdminWorkOrders />
          </TabsContent>
          <TabsContent value="calendar" className="space-y-6">
            <AdminCalendar />
          </TabsContent>
          <TabsContent value="billing" className="space-y-6">
            <AdminBilling />
          </TabsContent>
          <TabsContent value="users" className="space-y-6">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="workshop" className="space-y-6">
            <AdminWorkshop />
          </TabsContent>
          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 