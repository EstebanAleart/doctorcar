"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    return <main className="p-6">Cargando perfil...</main>;
  }

  if (status === "error") {
    return (
      <main className="p-6 space-y-3">
        <div className="text-red-600 font-semibold">No se pudo cargar el perfil</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <Link href="/" className="text-blue-600 underline">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <div className="rounded-lg border p-4 space-y-2 bg-white/50">
        <div><span className="font-medium">Nombre:</span> {profile?.name}</div>
        <div><span className="font-medium">Email:</span> {profile?.email}</div>
        <div><span className="font-medium">Rol:</span> {profile?.role || profile?.role_id}</div>
      </div>
      <Link href="/" className="text-blue-600 underline">Volver al inicio</Link>
    </main>
  );
}
