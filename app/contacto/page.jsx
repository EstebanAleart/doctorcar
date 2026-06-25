import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { SITE_URL } from "@/lib/metadata";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contacto | DoctorCar — Taller de Chapa y Pintura en Rosario",
  description:
    "Contactá a DoctorCar: dirección, teléfono, WhatsApp y horarios. Taller de chapa y pintura en Rosario.",
  alternates: { canonical: `${SITE_URL}/contacto` },
};

export default function ContactoPage() {
  return (
    <SeoPageLayout>
      <Breadcrumb items={[{ name: "Inicio", url: "/" }, { name: "Contacto" }]} />
      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-6">Contacto</h1>
      <p className="text-lg text-dc-navy/80 mb-8">
        ¿Necesitás un presupuesto o querés coordinar una reparación? Escribinos o acercate al taller.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="flex items-start gap-3 p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <MapPin className="w-5 h-5 text-dc-blue mt-0.5" />
          <div>
            <div className="font-semibold text-dc-navy">Dirección</div>
            <div className="text-dc-navy/70 text-sm">9 de julio 4231, Rosario, Santa Fe</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <Phone className="w-5 h-5 text-dc-blue mt-0.5" />
          <div>
            <div className="font-semibold text-dc-navy">Teléfono</div>
            <a href="tel:+543412697000" className="text-dc-blue hover:underline text-sm">341 269-7000</a>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <MessageCircle className="w-5 h-5 text-dc-blue mt-0.5" />
          <div>
            <div className="font-semibold text-dc-navy">WhatsApp</div>
            <a
              href="https://wa.me/543412697000?text=Hola,%20quiero%20un%20presupuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dc-blue hover:underline text-sm"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <Clock className="w-5 h-5 text-dc-blue mt-0.5" />
          <div>
            <div className="font-semibold text-dc-navy">Horarios</div>
            <div className="text-dc-navy/70 text-sm">Lunes a Viernes: 8:00 - 18:00</div>
          </div>
        </div>
      </div>

      <a
        href="https://wa.me/543412697000?text=Hola,%20quiero%20un%20presupuesto"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-dc-blue text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition"
      >
        <MessageCircle className="w-5 h-5" />
        Pedir presupuesto por WhatsApp
      </a>
    </SeoPageLayout>
  );
}
