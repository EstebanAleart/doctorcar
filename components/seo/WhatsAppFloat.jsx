"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const PHONE = "543412697000";

function pageName(pathname) {
  if (!pathname || pathname === "/") return "la pagina principal";
  const clean = pathname.replace(/^\/|\/$/g, "").replace(/\//g, " > ");
  return clean;
}

export default function WhatsAppFloat() {
  const pathname = usePathname();
  const text = `Hola, me contacto desde ${pageName(pathname)}`;
  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="whatsapp-flotante"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-dc-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </Link>
  );
}
