import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
import CtaBox from "@/components/seo/CtaBox";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
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

/* ===================== Static params (N*M) ===================== */

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
    <SeoPageLayout>
      <JsonLd
        data={[schemaService(servicio.slug, zona.slug), schemaFaq(faqs)]}
      />

      <Breadcrumb
        items={[
          { name: "Inicio", url: "/" },
          { name: servicio.nombre, url: `/${servicio.slug}` },
          { name: zona.nombre },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        {servicio.nombre_h1} {zona.nombre_h1_sufijo}
      </h1>

      {servSeo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-4">
          {servSeo.parrafo}
        </p>
      )}

      {zonaSeo?.parrafo && (
        <p className="text-base text-dc-navy/70 leading-relaxed mb-6">
          {zonaSeo.parrafo}
        </p>
      )}

      <CtaBox
        titulo={`${servicio.nombre} ${zona.nombre_h1_sufijo} — presupuesto sin cargo`}
        subtitulo="Respondemos en menos de 24 horas."
        whatsappText={`Hola, me contacto desde ${servicio.slug}/${zona.slug}. Quiero presupuesto de ${servicio.nombre} en ${zona.nombre}`}
      />

      {/* Capa 2 — Datos reales */}
      {datos?.siniestros_tipo_distribucion && (
        <section className="mb-12 bg-dc-blue-pale border border-dc-blue/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-dc-navy mb-4">
            Datos de siniestros {zona.nombre_h1_sufijo}
          </h2>
          <p className="text-sm text-dc-navy/60 mb-3">
            Distribucion segun datos propios de DoctorCar (vehiculos reparados{" "}
            {new Date().getFullYear() - 1}–{new Date().getFullYear()}):
          </p>
          <ul className="space-y-2">
            {Object.entries(datos.siniestros_tipo_distribucion)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, pct]) => (
                <li key={tipo} className="flex justify-between border-b border-dc-blue/10 pb-1">
                  <span className="capitalize text-dc-navy">
                    {tipo.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-dc-navy/80">{Math.round(pct * 100)}%</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <FaqList faqs={faqs} />

      {/* Interlinking */}
      <section className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-dc-navy mb-3">
            Otros servicios {zona.nombre_h1_sufijo}
          </h3>
          <ul className="space-y-1">
            {otrosServicios.map((o) => (
              <li key={o.slug}>
                <Link
                  href={o.href}
                  className="text-dc-blue hover:text-dc-navy hover:underline transition-colors"
                >
                  {o.nombre} {zona.nombre_h1_sufijo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-dc-navy mb-3">
            {servicio.nombre} en otras zonas
          </h3>
          <ul className="space-y-1">
            {servicioEnOtrasZonas.map((o) => (
              <li key={o.slug}>
                <Link
                  href={o.href}
                  className="text-dc-blue hover:text-dc-navy hover:underline transition-colors"
                >
                  {servicio.nombre} en {o.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SeoPageLayout>
  );
}
