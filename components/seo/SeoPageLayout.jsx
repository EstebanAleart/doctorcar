import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import WhatsAppFloat from "./WhatsAppFloat";

export default function SeoPageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10">{children}</div>
      </main>

      {/* MiSeguro banner — visible on all SEO pages */}
      <section className="py-10 bg-linear-to-r from-dc-navy to-dc-blue">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-white" />
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Necesitas un seguro? Cotiza online
            </h2>
          </div>
          <p className="text-white/80 mb-5 max-w-lg mx-auto text-sm">
            Auto-cotizacion, auto-emision, mejores precios del mercado y
            dashboard completo en{" "}
            <a
              href="https://miseguro.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold underline underline-offset-2"
            >
              miseguro.com.ar
            </a>
          </p>
          <a
            href="https://miseguro.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-dc-navy font-bold px-6 py-2.5 rounded-lg hover:bg-white/90 transition shadow-md"
          >
            Cotizar ahora
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
