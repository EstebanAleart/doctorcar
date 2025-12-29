"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AdminHeader() {
  const { user } = useAuth();

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
            <p className="text-xs text-[#6cb4d8]">Panel de Administración</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user?.name}</span>
          </div>
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