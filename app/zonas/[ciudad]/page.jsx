import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { name: "Inicio", url: "/" },
          { name: "Zonas", url: "/zonas" },
          { name: zona.nombre },
        ]}
      />

      <h1 className="text-4xl font-bold mb-4">
        Taller de Chapa, Pintura y Siniestros {zona.nombre_h1_sufijo}
      </h1>

      {seo?.parrafo && (
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {seo.parrafo}
        </p>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">
          Servicios disponibles {zona.nombre_h1_sufijo}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {servicios.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}/${zona.slug}`}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-semibold">
                {s.nombre} {zona.nombre_h1_sufijo}
              </h3>
              <p className="text-sm text-gray-600">{s.descripcion_corta}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
