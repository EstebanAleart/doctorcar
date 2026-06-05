import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
import CtaBox from "@/components/seo/CtaBox";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import {
  findAseguradora,
  getAseguradoras,
  getZonas,
  getSeoAseguradora,
} from "@/lib/seo";
import { schemaServiceAseguradora, schemaFaq } from "@/lib/schema";
import { makeAseguradoraMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAseguradoras().map((a) => ({ aseguradora: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { aseguradora } = await params;
  return makeAseguradoraMetadata(aseguradora);
}

export default async function AseguradoraPage({ params }) {
  const { aseguradora: slug } = await params;
  const aseg = findAseguradora(slug);
  if (!aseg) notFound();

  const seo = getSeoAseguradora(aseg.id);
  const ciudadesHub = getZonas({ tier: 1 }).filter(
    (z) => z.tipo !== "subzona"
  );
  const faqs = seo?.faqs || [];

  return (
    <SeoPageLayout>
      <JsonLd
        data={[schemaServiceAseguradora(aseg.slug), schemaFaq(faqs)]}
      />

      <Breadcrumb
        items={[
          { name: "Inicio", url: "/" },
          { name: "Aseguradoras", url: "/aseguradoras" },
          { name: aseg.nombre },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        Taller habilitado {aseg.nombre} en Rosario
      </h1>

      {seo?.parrafo && (
        <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
          {seo.parrafo}
        </p>
      )}

      <section className="bg-dc-blue-pale border border-dc-blue/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-dc-navy mb-4">
          Como gestionamos tu siniestro con {aseg.nombre}
        </h2>
        <dl className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-semibold text-dc-navy">Tipo de taller</dt>
            <dd className="text-dc-navy/70">
              {aseg.atributos.tipo_de_taller}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-dc-navy">Facturacion</dt>
            <dd className="text-dc-navy/70 capitalize">
              {aseg.atributos.tipo_facturacion}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-dc-navy">Peritaje promedio</dt>
            <dd className="text-dc-navy/70">
              {aseg.atributos.tiempo_peritaje_promedio_dias} dias
            </dd>
          </div>
          {aseg.telefono_siniestros && (
            <div>
              <dt className="font-semibold text-dc-navy">Denuncia de siniestro</dt>
              <dd className="text-dc-navy/70">{aseg.telefono_siniestros}</dd>
            </div>
          )}
        </dl>
      </section>

      <CtaBox
        titulo={`Iniciar gestion con ${aseg.nombre}`}
        subtitulo="Envia numero de denuncia y fotos por WhatsApp."
        whatsappText={`Hola, me contacto desde aseguradoras/${aseg.slug}. Tengo siniestro con ${aseg.nombre}`}
      />

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">Atencion por zona</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {ciudadesHub.map((z) => (
            <Link
              key={z.id}
              href={`/aseguradoras/${aseg.slug}/${z.slug}`}
              className="border border-dc-blue/30 rounded-lg p-3 hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
            >
              Taller {aseg.nombre} {z.nombre_h1_sufijo}
            </Link>
          ))}
        </div>
      </section>

      <FaqList faqs={faqs} />
    </SeoPageLayout>
  );
}
