"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/app-header.jsx";
import { ClientClaims } from "./client-claims.jsx";
import { ClientNewClaim } from "./client-new-claim.jsx";
import { ClientVehicles } from "./client-vehicles.jsx";
import { ClientCalendar } from "./client-calendar.jsx";
import { ClientProfile } from "./client-profile.jsx";

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("claims");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-2 h-auto md:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="claims" className="text-xs md:text-sm">Mis Reclamos</TabsTrigger>
            <TabsTrigger value="new-claim" className="text-xs md:text-sm">Nuevo Reclamo</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">Mis Citas</TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs md:text-sm">Mis Vehículos</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Mi Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="claims" className="space-y-6">
            <ClientClaims />
          </TabsContent>
          <TabsContent value="new-claim" className="space-y-6">
            <ClientNewClaim onSuccess={() => setActiveTab("claims")} />
          </TabsContent>
          <TabsContent value="calendar" className="space-y-6">
            <ClientCalendar />
          </TabsContent>
          <TabsContent value="vehicles" className="space-y-6">
            <ClientVehicles />
          </TabsContent>
          <TabsContent value="profile" className="space-y-6">
            <ClientProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 