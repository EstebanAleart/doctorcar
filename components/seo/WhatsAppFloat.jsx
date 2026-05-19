"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const WA_URL =
  "https://wa.me/34673782934?text=Hola,%20quiero%20información";

export default function WhatsAppFloat() {
  return (
    <Link
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-dc-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </Link>
  );
}
