import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { getZonas, getServicios } from "@/lib/seo";
import { schemaBreadcrumb, schemaItemList } from "@/lib/schema";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Zonas de cobertura en Rosario y Gran Rosario | DoctorCar",
  description:
    "Atendemos en Rosario, Funes, Roldan, Granadero Baigorria, Villa Gobernador Galvez, Perez y toda la zona metropolitana. Retiro y entrega coordinados.",
  alternates: { canonical: `${SITE_URL}/zonas` },
};

export default function ZonasHubPage() {
  const zonas = getZonas({ tier: 1 }).filter((z) => z.tipo !== "subzona");
  const servicios = getServicios();

  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Zonas" },
  ];

  const itemListItems = zonas.map((z) => ({
    name: `Taller de chapa y pintura ${z.nombre_h1_sufijo}`,
    url: `/zonas/${z.slug}`,
  }));

  return (
    <SeoPageLayout>
      <JsonLd
        data={[
          schemaBreadcrumb(breadcrumbItems),
          schemaItemList(itemListItems),
        ]}
      />

      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        Zonas de cobertura en Rosario y el Gran Rosario
      </h1>

      <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
        Cubrimos toda la zona metropolitana de Rosario, Santa Fe. Si tuviste un
        siniestro, necesitas reparar chapa y pintura o sacar abolladuras,
        coordinamos retiro y entrega del vehiculo para que no tengas que
        trasladarte. Elegí tu zona para ver los servicios disponibles.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">
          Ciudades y zonas donde trabajamos
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {zonas.map((z) => (
            <Link
              key={z.id}
              href={`/zonas/${z.slug}`}
              className="border border-dc-blue/30 rounded-xl p-4 hover:shadow-md hover:border-dc-navy/40 transition-all bg-white"
            >
              <h3 className="font-semibold text-lg text-dc-navy">
                Chapa y pintura {z.nombre_h1_sufijo}
              </h3>
              <p className="text-sm text-dc-navy/60 mt-1">{z.provincia}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-dc-navy mb-4">
          Servicios disponibles en todas las zonas
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {servicios.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="border border-dc-blue/30 rounded-lg p-3 hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
            >
              {s.nombre}
            </Link>
          ))}
        </div>
      </section>
    </SeoPageLayout>
  );
}
