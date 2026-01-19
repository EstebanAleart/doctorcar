"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/app-header.jsx";
import { EmployeeWorkOrders } from "./employee-work-orders.jsx";
import { EmployeePendingApproval } from "./employee-pending-approval.jsx";
import { EmployeeCalendar } from "./employee-calendar.jsx";
import { EmployeeProfile } from "./employee-profile.jsx";
import { EmployeePayments } from "./employee-payments.jsx";

export function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("work-orders");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-2 h-auto md:grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="work-orders" className="text-xs md:text-sm">Mis Órdenes de Trabajo</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs md:text-sm">Pendientes de Aprobación</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs md:text-sm">Cobros</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendario</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Mi Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="work-orders" className="space-y-6">
            <EmployeeWorkOrders />
          </TabsContent>
          <TabsContent value="pending" className="space-y-6">
            <EmployeePendingApproval />
          </TabsContent>
          <TabsContent value="payments" className="space-y-6">
            <EmployeePayments />
          </TabsContent>
          <TabsContent value="calendar" className="space-y-6">
            <EmployeeCalendar />
          </TabsContent>
          <TabsContent value="profile" className="space-y-6">
            <EmployeeProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 