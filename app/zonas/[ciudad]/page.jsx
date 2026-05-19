import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
import CtaBox from "@/components/seo/CtaBox";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { findZona, getZonas, getServicios, getSeoZona } from "@/lib/seo";
import { makeZonaMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getZonas({ tier: 1 })
    .filter((z) => z.tipo !== "subzona")
    .map((z) => ({ ciudad: z.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { ciudad } = await params;
  return makeZonaMetadata(ciudad);
}

export default async function ZonaPage({ params }) {
  const { ciudad: slug } = await params;
  const zona = findZona(slug);
  if (!zona) notFound();

  const seo = getSeoZona(zona.id);
  const servicios = getServicios();

  return (
    <SeoPageLayout>
      <Breadcrumb
        items={[
          { name: "Inicio", url: "/" },
          { name: "Zonas", url: "/zonas" },
          { name: zona.nombre },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        Taller de Chapa, Pintura y Siniestros {zona.nombre_h1_sufijo}
      </h1>

      {seo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
          {seo.parrafo}
        </p>
      )}

      <CtaBox
        titulo={`Presupuesto sin cargo ${zona.nombre_h1_sufijo}`}
        subtitulo="Envia fotos por WhatsApp y te respondemos en menos de 24 horas."
        whatsappText={`Hola, necesito presupuesto en ${zona.nombre}`}
      />

      <section>
        <h2 className="text-2xl font-bold text-dc-navy mb-4">
          Servicios disponibles {zona.nombre_h1_sufijo}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {servicios.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}/${zona.slug}`}
              className="border border-dc-blue/30 rounded-xl p-4 hover:shadow-md hover:border-dc-navy/40 transition-all bg-white"
            >
              <h3 className="font-semibold text-dc-navy">
                {s.nombre} {zona.nombre_h1_sufijo}
              </h3>
              <p className="text-sm text-dc-navy/60">{s.descripcion_corta}</p>
            </Link>
          ))}
        </div>
      </section>
    </SeoPageLayout>
  );
}
