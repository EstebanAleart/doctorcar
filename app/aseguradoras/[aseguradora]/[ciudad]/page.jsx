import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
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
    <>
      <JsonLd
        data={[
          schemaServiceAseguradora(aseg.slug, zona.slug),
          schemaFaq(faqs),
        ]}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { name: "Inicio", url: "/" },
            { name: "Aseguradoras", url: "/aseguradoras" },
            { name: aseg.nombre, url: `/aseguradoras/${aseg.slug}` },
            { name: zona.nombre },
          ]}
        />

        <h1 className="text-4xl font-bold mb-4">
          Taller habilitado {aseg.nombre} {zona.nombre_h1_sufijo}
        </h1>

        {asegSeo?.parrafo && (
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {asegSeo.parrafo}
          </p>
        )}

        {zonaSeo?.parrafo && (
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {zonaSeo.parrafo}
          </p>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12">
          <p className="font-semibold mb-2">
            Siniestro con {aseg.nombre} {zona.nombre_h1_sufijo}
          </p>
          <Link
            href={`https://wa.me/549341XXXXXXX?text=Siniestro%20${aseg.nombre}%20en%20${encodeURIComponent(zona.nombre)}`}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 inline-block"
          >
            Iniciar gestión por WhatsApp
          </Link>
        </div>

        <FaqList faqs={faqs} />
      </main>
    </>
  );
}
