import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { getAseguradoras } from "@/lib/seo";
import { schemaBreadcrumb, schemaItemList } from "@/lib/schema";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Taller habilitado para aseguradoras en Rosario | DoctorCar",
  description:
    "Trabajamos con todas las aseguradoras del pais. Gestion integral del peritaje, reparacion y facturacion directa con tu compania de seguros.",
  alternates: { canonical: `${SITE_URL}/aseguradoras` },
};

export default function AseguradorasHubPage() {
  const aseguradoras = getAseguradoras();
  const principales = aseguradoras.filter((a) => a.es_principal);
  const otras = aseguradoras.filter((a) => !a.es_principal);

  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Aseguradoras" },
  ];

  const itemListItems = aseguradoras.map((a) => ({
    name: `Taller habilitado ${a.nombre} en Rosario`,
    url: `/aseguradoras/${a.slug}`,
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
        Trabajamos con todas las aseguradoras del pais
      </h1>
      <p className="text-lg text-dc-navy/80 leading-relaxed mb-8">
        Si tuviste un siniestro y tenes un seguro contratado, nos encargamos del
        proceso completo: peritaje, presupuesto, reparacion y facturacion
        directa con tu compania. Sin tramites, sin demoras. Selecciona tu
        aseguradora para ver como trabajamos con ella.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">
          Companias principales
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {principales.map((a) => (
            <Link
              key={a.id}
              href={`/aseguradoras/${a.slug}`}
              className="border border-dc-blue/30 rounded-xl p-4 hover:shadow-md hover:border-dc-navy/40 transition-all bg-white"
            >
              <h3 className="font-semibold text-dc-navy">
                Siniestros con {a.nombre}
              </h3>
              <p className="text-xs text-dc-navy/60 mt-1">
                Taller habilitado — peritaje y facturacion directa
              </p>
            </Link>
          ))}
        </div>
      </section>

      {otras.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-dc-navy mb-4">
            Tambien trabajamos con
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {otras.map((a) => (
              <Link
                key={a.id}
                href={`/aseguradoras/${a.slug}`}
                className="border border-dc-blue/30 rounded-lg p-3 hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
              >
                Siniestros con {a.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoPageLayout>
  );
}
