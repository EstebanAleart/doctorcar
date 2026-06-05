import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
import CtaBox from "@/components/seo/CtaBox";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import {
  findServicio,
  getServicios,
  getZonas,
  getSeoServicio,
  getAseguradoras,
} from "@/lib/seo";
import { schemaService, schemaFaq } from "@/lib/schema";
import { makeServicioMetadata } from "@/lib/metadata";

/* ===================== Static params ===================== */

export function generateStaticParams() {
  return getServicios().map((s) => ({ servicio: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { servicio } = await params;
  return makeServicioMetadata(servicio);
}

/* ===================== Page ===================== */

export default async function ServicioHubPage({ params }) {
  const { servicio: slug } = await params;
  const servicio = findServicio(slug);
  if (!servicio) notFound();

  const seo = getSeoServicio(servicio.id);
  const ciudadesHub = getZonas({ tier: 1 }).filter(
    (z) => z.tipo !== "subzona"
  );
  const aseguradoras = getAseguradoras({ soloPrincipales: true });

  const faqs = seo?.faqs || [];

  return (
    <SeoPageLayout>
      <JsonLd data={[schemaService(servicio.slug), schemaFaq(faqs)]} />

      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: servicio.nombre }]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        {servicio.nombre_h1} en Rosario y Zona
      </h1>

      {seo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
          {seo.parrafo}
        </p>
      )}

      {!seo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
          {servicio.descripcion_corta} En DoctorCar trabajamos con todas las
          aseguradoras del pais y damos presupuesto en menos de 24 horas.
        </p>
      )}

      <CtaBox
        titulo="Presupuesto sin cargo en 24 horas"
        subtitulo="Envia fotos por WhatsApp y recibi el detalle."
        whatsappText={`Hola, me contacto desde ${servicio.slug}. Quiero presupuesto de ${servicio.nombre}`}
      />

      {/* Interlinking: servicio en cada ciudad */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">
          {servicio.nombre} por zona
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {ciudadesHub.map((z) => (
            <Link
              key={z.id}
              href={`/${servicio.slug}/${z.slug}`}
              className="border border-dc-blue/30 rounded-lg p-3 hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
            >
              {servicio.nombre} {z.nombre_h1_sufijo}
            </Link>
          ))}
        </div>
      </section>

      {/* Aseguradoras */}
      {servicio.id === "siniestros" && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-dc-navy mb-4">
            Aseguradoras con las que trabajamos
          </h2>
          <div className="grid md:grid-cols-4 gap-3">
            {aseguradoras.map((a) => (
              <Link
                key={a.id}
                href={`/aseguradoras/${a.slug}`}
                className="border border-dc-blue/30 rounded-lg p-3 text-center hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
              >
                {a.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqList faqs={faqs} />
    </SeoPageLayout>
  );
}
