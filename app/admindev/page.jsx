"use client";
import { AdminDevDashboard } from "@/components/admin/admindev-dashboard";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DesarrolloPayments } from "@/components/admin/desarrollo-payments";
import { useEffect, useState } from "react";

export default function AdminDevPage() {
  const { data: session } = useSession();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "admindev") {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
    }
  }, [session]);

  if (!isAllowed) {
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">
        Acceso denegado. Solo para rol admindev.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Panel General</TabsTrigger>
          <TabsTrigger value="desarrollo">Desarrollo</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <AdminDevDashboard />
        </TabsContent>
        <TabsContent value="desarrollo">
          <DesarrolloPayments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
