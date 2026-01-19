"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function RoleRedirectInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (status === "loading" || hasRedirected) return;
    
    // Only redirect after Auth0 callback or if there's a callbackUrl param
    const isCallback = pathname?.includes("/api/auth/callback") || 
                       pathname?.includes("/auth/callback") ||
                       searchParams?.get("callbackUrl");
    
    if (session?.user && isCallback) {
      fetchUserAndRedirect();
    }
  }, [session, status, pathname, searchParams, hasRedirected, router]);

  const fetchUserAndRedirect = async () => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) return;
      
      const data = await res.json();
      const role = data.user?.role;

      if (!role) return;

      setHasRedirected(true);

      // Redirect based on role
      switch (role) {
        case "admin":
          router.push("/admin");
          break;
        case "employee":
          router.push("/employee");
          break;
        case "client":
          router.push("/client");
          break;
        default:
          router.push("/client");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  return null;
}

export function RoleRedirect() {
  return (
    <Suspense fallback={null}>
      <RoleRedirectInner />
    </Suspense>
  );
}
