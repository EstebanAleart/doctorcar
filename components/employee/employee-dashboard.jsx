"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeHeader } from "./employee-header.jsx";
import { EmployeeWorkOrders } from "./employee-work-orders.jsx";
import { EmployeeProfile } from "./employee-profile.jsx";

export function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("work-orders");

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="work-orders">Mis Órdenes de Trabajo</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="work-orders" className="space-y-6">
            <EmployeeWorkOrders />
          </TabsContent>
          <TabsContent value="profile" className="space-y-6">
            <EmployeeProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 