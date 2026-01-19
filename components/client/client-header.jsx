"use client";

import { useSelector } from "react-redux";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";

export function ClientHeader() {
  const user = useSelector((state) => state.user.data?.user);

  // Generar foto de avatar basada en email o usar profile_image
  const getAvatar = (user) => {
    if (user?.profile_image) {
      return user.profile_image;
    }
    if (!user?.email) return null;
    return `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`;
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b bg-[#1a4d6d] text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/images/whatsapp-20image-202025-12-29-20at-2000.jpeg"
              alt="DOCTORCAR"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">DOCTORCAR</h1>
            <p className="text-xs text-[#6cb4d8]">Portal de Cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && user.email && (
            <div className="flex items-center gap-3">
              <Image
                src={getAvatar(user)}
                alt={user.name || "Perfil"}
                width={36}
                height={36}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[#6cb4d8]">{user.email}</p>
              </div>
            </div>
          )}
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-[#2d6a8f]">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
} 