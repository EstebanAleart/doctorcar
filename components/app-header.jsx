"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSelector } from "react-redux";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function AppHeader() {
  const { user: authUser } = useAuth();
  const reduxUserData = useSelector((state) => state.user?.data);
  const user = reduxUserData?.user || authUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Generar foto de avatar basada en email o usar profile_image
  const getAvatar = (user) => {
    if (user?.profile_image) {
      return user.profile_image;
    }
    if (!user?.email) return null;
    return `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`;
  };

  // Obtener título según el rol
  const getRoleTitle = (role) => {
    switch (role) {
      case "admin":
        return "Panel de Administración";
      case "employee":
        return "Panel de Empleado";
      case "client":
        return "Portal de Cliente";
      default:
        return "DOCTORCAR";
    }
  };

  return (
    <header className="border-b bg-[#1a4d6d] text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative h-10 w-10">
            <Image
              src="/images/whatsapp-20image-202025-12-29-20at-2000.jpeg"
              alt="DOCTORCAR"
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold">DOCTORCAR</h1>
            <p className="text-xs text-[#6cb4d8]">{getRoleTitle(user?.role)}</p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {user.email && (
                <Image
                  src={getAvatar(user)}
                  alt={user.name || "Perfil"}
                  width={36}
                  height={36}
                  className="rounded-full flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-[#6cb4d8] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2d6a8f] flex-shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 hover:bg-[#2d6a8f] rounded-md"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#2d6a8f] bg-[#1a4d6d] p-4 space-y-4">
          {user && (
            <>
              <div className="flex items-center gap-2">
                {user.email && (
                  <Image
                    src={getAvatar(user)}
                    alt={user.name || "Perfil"}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-[#6cb4d8] truncate">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#2d6a8f] hover:bg-[#3d7a9f]"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
