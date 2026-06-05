import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
import CtaBox from "@/components/seo/CtaBox";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import {
  findAseguradora,
  findZona,
  getAseguradoras,
  getZonas,
  getSeoAseguradora,
  getSeoZona,
  getFaqsAseguradoraCiudad,
} from "@/lib/seo";
import { schemaServiceAseguradora, schemaFaq } from "@/lib/schema";
import { makeAseguradoraCiudadMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  const aseguradoras = getAseguradoras();
  const ciudadesHub = getZonas({ tier: 1 }).filter(
    (z) => z.tipo !== "subzona"
  );
  return aseguradoras.flatMap((a) =>
    ciudadesHub.map((z) => ({ aseguradora: a.slug, ciudad: z.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { aseguradora, ciudad } = await params;
  return makeAseguradoraCiudadMetadata(aseguradora, ciudad);
}

export default async function AseguradoraCiudadPage({ params }) {
  const { aseguradora: asegSlug, ciudad: ciudadSlug } = await params;
  const aseg = findAseguradora(asegSlug);
  const zona = findZona(ciudadSlug);
  if (!aseg || !zona) notFound();

  const asegSeo = getSeoAseguradora(aseg.id);
  const zonaSeo = getSeoZona(zona.id);
  const faqs = getFaqsAseguradoraCiudad(aseg.id, zona.id);

  return (
    <SeoPageLayout>
      <JsonLd
        data={[
          schemaServiceAseguradora(aseg.slug, zona.slug),
          schemaFaq(faqs),
        ]}
      />

      <Breadcrumb
        items={[
          { name: "Inicio", url: "/" },
          { name: "Aseguradoras", url: "/aseguradoras" },
          { name: aseg.nombre, url: `/aseguradoras/${aseg.slug}` },
          { name: zona.nombre },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        Taller habilitado {aseg.nombre} {zona.nombre_h1_sufijo}
      </h1>

      {asegSeo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-4">
          {asegSeo.parrafo}
        </p>
      )}

      {zonaSeo?.parrafo && (
        <p className="text-base text-dc-navy/70 leading-relaxed mb-6">
          {zonaSeo.parrafo}
        </p>
      )}

      <CtaBox
        titulo={`Siniestro con ${aseg.nombre} ${zona.nombre_h1_sufijo}`}
        subtitulo="Envia numero de denuncia y fotos por WhatsApp."
        whatsappText={`Hola, me contacto desde aseguradoras/${aseg.slug}/${zona.slug}. Siniestro ${aseg.nombre} en ${zona.nombre}`}
      />

      <FaqList faqs={faqs} />
    </SeoPageLayout>
  );
}
