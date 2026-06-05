import Link from "next/link";
import { MapPin, Phone, Clock, Star, Shield } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-dc-navy text-white">
      {/* MiSeguro banner */}
      <div className="bg-dc-blue/10 border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-dc-blue" />
            <div>
              <p className="font-semibold text-sm">
                Cotiza y emiti tu seguro online en{" "}
                <a
                  href="https://miseguro.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dc-blue hover:underline"
                >
                  miseguro.com.ar
                </a>
              </p>
              <p className="text-white/60 text-xs">
                Auto-cotizacion, auto-emision, mejores precios del mercado y
                dashboard completo de usuario.
              </p>
            </div>
          </div>
          <a
            href="https://miseguro.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-dc-blue text-white text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 transition whitespace-nowrap"
          >
            Cotizar ahora
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Col 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpeg"
                alt="DoctorCar Logo"
                className="w-10 h-10 rounded shadow-sm object-contain bg-white border border-white/20"
              />
              <span className="text-xl font-bold tracking-tight">
                DOCTORCAR
              </span>
            </Link>
            <p className="text-white/70 text-sm mb-4">
              Taller de chapa y pintura en Rosario. Especialistas en reparacion
              de siniestros y gestion con aseguradoras.
            </p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-white/50 ml-2 text-sm">
                4.9 en Google
              </span>
            </div>
          </div>

          {/* Col 2: Servicios */}
          <div>
            <h3 className="font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/chapa-y-pintura/rosario"
                  className="text-white/70 hover:text-dc-blue transition-colors"
                >
                  Chapa y Pintura
                </Link>
              </li>
              <li>
                <Link
                  href="/siniestros/rosario"
                  className="text-white/70 hover:text-dc-blue transition-colors"
                >
                  Reparacion de Siniestros
                </Link>
              </li>
              <li>
                <Link
                  href="/aseguradoras"
                  className="text-white/70 hover:text-dc-blue transition-colors"
                >
                  Aseguradoras
                </Link>
              </li>
              <li>
                <Link
                  href="/zonas"
                  className="text-white/70 hover:text-dc-blue transition-colors"
                >
                  Zonas de Cobertura
                </Link>
              </li>
              <li>
                <a
                  href="https://miseguro.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-dc-blue transition-colors"
                >
                  Cotizar Seguro Online
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <address className="not-italic space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-dc-blue" />
                <span>9 de julio 4231, Rosario, Santa Fe</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-dc-blue" />
                <a
                  href="tel:+543412697000"
                  className="hover:text-white transition-colors"
                >
                  341 269-7000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-dc-blue" />
                <span>Lun-Vie: 8:00 - 18:00</span>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm space-y-1">
          <p>
            &copy; {new Date().getFullYear()} DoctorCar. Todos los derechos
            reservados. 9 de julio 4231, Rosario, Santa Fe.
          </p>
          <p>
            Potenciado por{" "}
            <a
              href="https://www.pairprogramming.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dc-blue hover:text-white transition-colors"
            >
              pairprogramming
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
