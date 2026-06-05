"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Menu, X } from "lucide-react";

const PHONE = "543412697000";

const NAV_LINKS = [
  { href: "/chapa-y-pintura/rosario", label: "Servicios" },
  { href: "/zonas", label: "Zonas" },
  { href: "/aseguradoras", label: "Aseguradoras" },
  { href: "/sobre-doctorcar", label: "Nosotros" },
  { href: "https://miseguro.com.ar", label: "Cotizar Seguro", external: true },
];

function pageName(pathname) {
  if (!pathname || pathname === "/") return "la pagina principal";
  return pathname.replace(/^\/|\/$/g, "").replace(/\//g, " > ");
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const waText = `Hola, me contacto desde ${pageName(pathname)}`;
  const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(waText)}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dc-blue/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="DoctorCar Logo"
            className="w-10 h-10 rounded shadow-sm object-contain bg-white border border-dc-navy/10"
          />
          <span className="text-xl font-bold text-dc-navy tracking-tight">
            DOCTORCAR
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-dc-blue hover:text-dc-navy transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-dc-navy hover:text-dc-blue transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://newton-broker.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-sm font-medium border border-dc-navy text-dc-navy px-4 py-2 rounded-lg hover:bg-dc-navy/5 transition-colors"
          >
            Portal
          </Link>
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-dc-green text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-dc-navy"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-dc-blue/20 bg-white px-4 pb-4 space-y-2">
          {NAV_LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block py-2 text-dc-blue font-semibold hover:text-dc-navy transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-dc-navy font-medium hover:text-dc-blue transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
          <Link
            href="https://newton-broker.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block py-2 text-dc-navy font-medium hover:text-dc-blue transition-colors"
          >
            Portal de Clientes
          </Link>
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-dc-green text-white font-semibold px-4 py-2 rounded-lg mt-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Link>
        </div>
      )}
    </header>
  );
}
