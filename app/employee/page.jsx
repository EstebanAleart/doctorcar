"use client";

import { AuthGuard } from "@/components/auth-guard";
import { EmployeeDashboard } from "@/components/employee/employee-dashboard";

export default function EmployeePage() {
  return (
    <AuthGuard allowedRoles={["employee"]}>
      <EmployeeDashboard />
    </AuthGuard>
  );
} 