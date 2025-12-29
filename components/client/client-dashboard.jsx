"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientHeader } from "./client-header.jsx";
import { ClientClaims } from "./client-claims.jsx";
import { ClientNewClaim } from "./client-new-claim.jsx";
import { ClientVehicles } from "./client-vehicles.jsx";
import { ClientProfile } from "./client-profile.jsx";

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("claims");

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="claims">Mis Reclamos</TabsTrigger>
            <TabsTrigger value="new-claim">Nuevo Reclamo</TabsTrigger>
            <TabsTrigger value="vehicles">Mis Vehículos</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="claims" className="space-y-6">
            <ClientClaims />
          </TabsContent>
          <TabsContent value="new-claim" className="space-y-6">
            <ClientNewClaim onSuccess={() => setActiveTab("claims")} />
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