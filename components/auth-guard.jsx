"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    
    if (!user) {
      router.push("/login");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      const roleRedirects = {
        admin: "/admin",
        employee: "/employee",
        client: "/client",
        admindev: "/admindev",
      };
      const target = roleRedirects[user.role];
      router.replace(target || "/unauthorized");
    } else {
    }
  }, [user, loading, allowedRoles, router]);

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not authorized, return null (will redirect)
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  // User is authenticated and authorized
  return <>{children}</>;
} 