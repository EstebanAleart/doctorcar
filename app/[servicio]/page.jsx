import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
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
    <>
      <JsonLd data={[schemaService(servicio.slug), schemaFaq(faqs)]} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[{ name: "Inicio", url: "/" }, { name: servicio.nombre }]}
        />

        <h1 className="text-4xl font-bold mb-4">
          {servicio.nombre_h1} en Rosario y Zona
        </h1>

        {seo?.parrafo && (
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {seo.parrafo}
          </p>
        )}

        {!seo?.parrafo && (
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {servicio.descripcion_corta} En DoctorCar trabajamos con todas las
            aseguradoras y damos presupuesto en menos de 24 horas.
          </p>
        )}

        {/* CTA arriba — intención transaccional */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <p className="font-semibold text-lg">
              Presupuesto sin cargo en 24 horas
            </p>
            <p className="text-sm text-gray-700">
              Enviá fotos por WhatsApp y recibí el detalle.
            </p>
          </div>
          <Link
            href="https://wa.me/549341XXXXXXX?text=Hola,%20quiero%20un%20presupuesto"
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Pedir presupuesto
          </Link>
        </div>

        {/* Interlinking: servicio en cada ciudad */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {servicio.nombre} por zona
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {ciudadesHub.map((z) => (
              <Link
                key={z.id}
                href={`/${servicio.slug}/${z.slug}`}
                className="border rounded p-3 hover:bg-gray-50"
              >
                {servicio.nombre} {z.nombre_h1_sufijo}
              </Link>
            ))}
          </div>
        </section>

        {/* Aseguradoras */}
        {servicio.id === "siniestros" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Aseguradoras con las que trabajamos
            </h2>
            <div className="grid md:grid-cols-4 gap-3">
              {aseguradoras.map((a) => (
                <Link
                  key={a.id}
                  href={`/aseguradoras/${a.slug}`}
                  className="border rounded p-3 text-center hover:bg-gray-50"
                >
                  {a.nombre}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        <FaqList faqs={faqs} />
      </main>
    </>
  );
}
