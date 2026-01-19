"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [status, setStatus] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!active) return;
        if (!res.ok) {
          setStatus("error");
          setError(`Error ${res.status}: ${res.statusText}`);
          return;
        }
        const data = await res.json();
        setProfile(data);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setError(err.message);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Cargando perfil...</h1>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold text-red-600">Error</h1>
        <div className="text-sm text-muted-foreground">{error}</div>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Perfil de Usuario</h1>
      
      <div className="rounded-lg border p-4 bg-white/50 space-y-3">
        <div className="text-sm space-y-2">
          <div><span className="font-medium">Nombre:</span> {profile?.name}</div>
          <div><span className="font-medium">Email:</span> {profile?.email}</div>
          <div><span className="font-medium">Auth0 ID:</span> <code className="text-xs bg-gray-100 px-2 py-1">{profile?.sub}</code></div>
          <div><span className="font-medium">Rol:</span> {profile?.role || "No definido"}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-gray-50">
        <h2 className="font-medium mb-2">JSON Raw:</h2>
        <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded border">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      <div className="flex gap-2">
        <Link href="/">
          <Button variant="outline">Volver</Button>
        </Link>
        <Link href="/api/auth/logout">
          <Button variant="destructive">Logout</Button>
        </Link>
      </div>
    </main>
  );
}
