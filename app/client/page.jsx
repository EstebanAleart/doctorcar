"use client";

import { AuthGuard } from "@/components/auth-guard";
import { ClientDashboard } from "@/components/client/client-dashboard";

export default function ClientPage() {
  return (
    <AuthGuard allowedRoles={["client"]}>
      <ClientDashboard />
    </AuthGuard>
  );
} 