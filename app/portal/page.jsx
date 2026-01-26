"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signIn, signOut } from "next-auth/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, FileCheck, Clock, Shield, CheckCircle, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PortalHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generar foto de avatar basada en email o usar profile_image
  const getAvatar = (user) => {
    if (user?.profile_image) {
      return user.profile_image;
    }
    if (!user?.email) return null;
    return `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`;
  };

  useEffect(() => {
    // Initialize database with demo data
    db.initialize();
  }, []);

  // Redirigir al dashboard si hay sesión activa
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "employee") {
        router.push("/employee");
      } else if (user.role === "client") {
        router.push("/client");
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative h-10 w-10">
              <Image
                src="/images/whatsapp-20image-202025-12-29-20at-2000.jpeg"
                alt="DOCTORCAR"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#1a4d6d]">DOCTORCAR</span>
            <Link
              href="/"
              className="ml-3 flex items-center gap-1 px-2 py-1 bg-[#1a4d6d] hover:bg-[#2d6a8f] text-white rounded text-xs font-semibold"
              title="Ir a Home SEO"
            >
              Home
            </Link>
            <Link
              href="/chapa-pintura-rosario"
              className="ml-2 flex items-center gap-1 px-2 py-1 bg-[#6cb4d8] hover:bg-[#1a4d6d] text-white rounded text-xs font-semibold"
              title="Chapa y Pintura"
            >
              Chapa y Pintura
            </Link>
          </div>
          {/* Desktop View */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  {user.email && (
                    <Image
                      src={getAvatar(user)}
                      alt={user.name || "Perfil"}
                      width={36}
                      height={36}
                      className="rounded-full shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a4d6d] truncate">{user.name}</p>
                    <p className="text-xs text-[#6cb4d8] truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#1a4d6d] hover:bg-[#6cb4d8]/10 shrink-0"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-[#1a4d6d] hover:text-[#6cb4d8] text-sm cursor-pointer"
                  onClick={() => signIn("auth0")}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  className="bg-[#1a4d6d] hover:bg-[#6cb4d8] text-sm cursor-pointer"
                  onClick={() => signIn("auth0")}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-[#6cb4d8]/10 rounded-md"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-[#1a4d6d]" />
            ) : (
              <Menu className="h-5 w-5 text-[#1a4d6d]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#6cb4d8]/20 bg-background p-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-[#6cb4d8]/20">
                  {user.email && (
                    <Image
                      src={getAvatar(user)}
                      alt={user.name || "Perfil"}
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a4d6d] truncate">{user.name}</p>
                    <p className="text-xs text-[#6cb4d8] truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a4d6d] hover:bg-[#2d6a8f]"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full text-[#1a4d6d] hover:bg-[#6cb4d8]/10 cursor-pointer"
                  onClick={() => signIn("auth0")}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  className="w-full bg-[#1a4d6d] hover:bg-[#2d6a8f] cursor-pointer"
                  onClick={() => signIn("auth0")}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex justify-center mb-6">
          <a
            href="https://wa.me/34673782934"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow font-semibold text-base"
            title="Contactar por WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.13 1.6 5.93L0 24l6.27-1.64A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.72.97.99-3.62-.24-.38A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-balance md:text-6xl">
            Bienvenido al Portal de DoctorCar
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
            Accedé a tu panel, gestioná reclamos, turnos y seguí el estado de tu vehículo en tiempo real.
          </p>
        </div>
      </section>
    </div>
  );
}
