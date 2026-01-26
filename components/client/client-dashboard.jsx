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
        <div className="flex justify-end mb-4">
          <a
            href="https://wa.me/34673782934"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow font-semibold text-sm"
            title="Contactar por WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.13 1.6 5.93L0 24l6.27-1.64A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.72.97.99-3.62-.24-.38A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
            </svg>
            Contacto WhatsApp
          </a>
        </div>
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