"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CallbackPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by fetching /api/user
        const res = await fetch("/api/user", { credentials: "include" });
        
        if (res.ok) {
          const userData = await res.json();
          console.log("User authenticated:", userData);
          
          const role = userData?.user?.role;
          
          // Redirect based on role
          setTimeout(() => {
            if (role === "admin") {
              router.push("/admin");
            } else if (role === "employee") {
              router.push("/employee");
            } else if (role === "client") {
              router.push("/client");
            } else {
              router.push("/client");
            }
          }, 1000);
        } else {
          setError("Authentication failed");
          setRedirecting(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError(err.message);
        setRedirecting(false);
      }
    };

    checkAuth();
  }, [router]);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Completando login...</p>
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Error de autenticación</h1>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-2 justify-center">
          <Link href="/api/auth/signin">
            <Button>Intentar de nuevo</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
