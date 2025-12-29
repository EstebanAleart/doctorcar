"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log("[AuthGuard] Render - user:", user, "loading:", loading);

  useEffect(() => {
    console.log("[AuthGuard] Effect - loading:", loading, "user:", user);
    
    if (loading) return; // Wait for auth check to complete
    
    if (!user) {
      console.log("[AuthGuard] No user, redirecting to /login");
      router.push("/login");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log("[AuthGuard] Wrong role, redirecting to /unauthorized");
      router.push("/unauthorized");
    } else {
      console.log("[AuthGuard] Auth OK, user:", user.email);
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