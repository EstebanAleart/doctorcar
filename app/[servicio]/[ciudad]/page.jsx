import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
import {
  findServicio,
  findZona,
  getServicios,
  getZonas,
  getSeoServicio,
  getSeoZona,
  getFaqsServicioCiudad,
  getDatosZona,
  getOtrosServiciosEnZona,
  getServicioEnOtrasZonas,
} from "@/lib/seo";
import { schemaService, schemaFaq } from "@/lib/schema";
import { makeServicioCiudadMetadata } from "@/lib/metadata";

/* ===================== Static params (N×M) ===================== */

export function generateStaticParams() {
  const servicios = getServicios();
  const zonas = getZonas({ tier: 1 });
  return servicios.flatMap((s) =>
    zonas.map((z) => ({ servicio: s.slug, ciudad: z.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { servicio, ciudad } = await params;
  return makeServicioCiudadMetadata(servicio, ciudad);
}

/* ===================== Page ===================== */

export default async function ServicioCiudadPage({ params }) {
  const { servicio: servicioSlug, ciudad: ciudadSlug } = await params;
  const servicio = findServicio(servicioSlug);
  const zona = findZona(ciudadSlug);
  if (!servicio || !zona) notFound();

  const servSeo = getSeoServicio(servicio.id);
  const zonaSeo = getSeoZona(zona.id);
  const datos = getDatosZona(zona.id);
  const faqs = getFaqsServicioCiudad(servicio.id, zona.id);
  const otrosServicios = getOtrosServiciosEnZona(servicio.id, zona.id);
  const servicioEnOtrasZonas = getServicioEnOtrasZonas(
    servicio.slug,
    zona.id
  );

  return (
    <>
      <JsonLd
        data={[schemaService(servicio.slug, zona.slug), schemaFaq(faqs)]}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { name: "Inicio", url: "/" },
            { name: servicio.nombre, url: `/${servicio.slug}` },
            { name: zona.nombre },
          ]}
        />

        <h1 className="text-4xl font-bold mb-4">
          {servicio.nombre_h1} {zona.nombre_h1_sufijo}
        </h1>

        {servSeo?.parrafo && (
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {servSeo.parrafo}
          </p>
        )}

        {zonaSeo?.parrafo && (
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {zonaSeo.parrafo}
          </p>
        )}

        {/* CTA */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <p className="font-semibold text-lg">
              {servicio.nombre} {zona.nombre_h1_sufijo} — presupuesto sin cargo
            </p>
            <p className="text-sm text-gray-700">
              Respondemos en menos de 24 horas.
            </p>
          </div>
          <Link
            href={`https://wa.me/549341XXXXXXX?text=Hola,%20quiero%20presupuesto%20de%20${encodeURIComponent(servicio.nombre)}%20en%20${encodeURIComponent(zona.nombre)}`}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 whitespace-nowrap"
          >
            Presupuesto WhatsApp
          </Link>
        </div>

        {/* Capa 2 — Datos reales */}
        {datos?.siniestros_tipo_distribucion && (
          <section className="mb-12 bg-gray-50 border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Datos de siniestros {zona.nombre_h1_sufijo}
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Distribución según datos propios de DoctorCar (vehículos reparados{" "}
              {new Date().getFullYear() - 1}–{new Date().getFullYear()}):
            </p>
            <ul className="space-y-2">
              {Object.entries(datos.siniestros_tipo_distribucion)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, pct]) => (
                  <li key={tipo} className="flex justify-between border-b pb-1">
                    <span className="capitalize">
                      {tipo.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono">{Math.round(pct * 100)}%</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <FaqList faqs={faqs} />

        {/* Interlinking */}
        <section className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-3">
              Otros servicios {zona.nombre_h1_sufijo}
            </h3>
            <ul className="space-y-1">
              {otrosServicios.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={o.href}
                    className="text-blue-600 hover:underline"
                  >
                    {o.nombre} {zona.nombre_h1_sufijo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3">
              {servicio.nombre} en otras zonas
            </h3>
            <ul className="space-y-1">
              {servicioEnOtrasZonas.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={o.href}
                    className="text-blue-600 hover:underline"
                  >
                    {servicio.nombre} en {o.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
