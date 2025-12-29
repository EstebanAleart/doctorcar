"use client";

import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ClientHeader() {
  const user = useSelector((state) => state.user.data);

  // Generar foto de Gmail basada en email
  const getGmailAvatar = (email) => {
    if (!email) return null;
    return `https://www.gravatar.com/avatar/${email}?d=identicon&s=40`;
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
          {user && (
            <div className="flex items-center gap-3">
              <Image
                src={getGmailAvatar(user.email)}
                alt={user.name || "Perfil"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[#6cb4d8]">{user.email}</p>
              </div>
            </div>
          )}
          <Link href="/api/auth/logout">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#2d6a8f]">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
} 