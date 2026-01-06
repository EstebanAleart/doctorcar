"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeHeader } from "./employee-header.jsx";
import { EmployeeWorkOrders } from "./employee-work-orders.jsx";
import { EmployeePendingApproval } from "./employee-pending-approval.jsx";
import { EmployeeCalendar } from "./employee-calendar.jsx";
import { EmployeeProfile } from "./employee-profile.jsx";
import { EmployeePayments } from "./employee-payments.jsx";

export function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("work-orders");

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="work-orders">Mis Órdenes de Trabajo</TabsTrigger>
            <TabsTrigger value="pending">Pendientes de Aprobación</TabsTrigger>
            <TabsTrigger value="payments">Cobros</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
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