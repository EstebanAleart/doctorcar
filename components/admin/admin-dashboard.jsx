"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "./admin-header.jsx";
import { AdminOverview } from "./admin-overview.jsx";
import { AdminUsers } from "./admin-users.jsx";
import { AdminClaims } from "./admin-claims.jsx";
import { AdminWorkshop } from "./admin-workshop.jsx";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Panel General</TabsTrigger>
            <TabsTrigger value="claims">Reclamos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="workshop">Taller</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="claims" className="space-y-6">
            <AdminClaims />
          </TabsContent>
          <TabsContent value="users" className="space-y-6">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="workshop" className="space-y-6">
            <AdminWorkshop />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 