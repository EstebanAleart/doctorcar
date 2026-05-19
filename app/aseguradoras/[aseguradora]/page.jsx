import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/seo/FaqList";
import Breadcrumb from "@/components/seo/Breadcrumb";
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
    <>
      <JsonLd
        data={[schemaServiceAseguradora(aseg.slug), schemaFaq(faqs)]}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { name: "Inicio", url: "/" },
            { name: "Aseguradoras", url: "/aseguradoras" },
            { name: aseg.nombre },
          ]}
        />

        <h1 className="text-4xl font-bold mb-4">
          Taller habilitado {aseg.nombre} en Rosario
        </h1>

        {seo?.parrafo && (
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {seo.parrafo}
          </p>
        )}

        <section className="bg-gray-50 border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            Cómo gestionamos tu siniestro con {aseg.nombre}
          </h2>
          <dl className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-semibold">Tipo de taller</dt>
              <dd className="text-gray-700">
                {aseg.atributos.tipo_de_taller}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Facturación</dt>
              <dd className="text-gray-700 capitalize">
                {aseg.atributos.tipo_facturacion}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Peritaje promedio</dt>
              <dd className="text-gray-700">
                {aseg.atributos.tiempo_peritaje_promedio_dias} días
              </dd>
            </div>
            {aseg.telefono_siniestros && (
              <div>
                <dt className="font-semibold">Denuncia de siniestro</dt>
                <dd className="text-gray-700">{aseg.telefono_siniestros}</dd>
              </div>
            )}
          </dl>
        </section>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12">
          <p className="font-semibold text-lg mb-2">
            Iniciar gestión con {aseg.nombre}
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Enviá número de denuncia y fotos por WhatsApp.
          </p>
          <Link
            href={`https://wa.me/549341XXXXXXX?text=Hola,%20tengo%20siniestro%20con%20${aseg.nombre}`}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 inline-block"
          >
            Iniciar por WhatsApp
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Atención por zona</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {ciudadesHub.map((z) => (
              <Link
                key={z.id}
                href={`/aseguradoras/${aseg.slug}/${z.slug}`}
                className="border rounded p-3 hover:bg-gray-50"
              >
                Taller {aseg.nombre} {z.nombre_h1_sufijo}
              </Link>
            ))}
          </div>
        </section>

        <FaqList faqs={faqs} />
      </main>
    </>
  );
}
