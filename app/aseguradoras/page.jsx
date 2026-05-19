import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { getAseguradoras } from "@/lib/seo";
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

  return (
    <SeoPageLayout>
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Aseguradoras" }]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4">
        Trabajamos con todas las aseguradoras del pais
      </h1>
      <p className="text-lg text-dc-navy/80 mb-8">
        Si tuviste un siniestro y tenes un seguro contratado, nos encargamos del
        proceso completo: peritaje, presupuesto, reparacion y facturacion
        directa con tu compania. Sin tramites, sin demoras.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">Companias principales</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {principales.map((a) => (
            <Link
              key={a.id}
              href={`/aseguradoras/${a.slug}`}
              className="border border-dc-blue/30 rounded-xl p-4 hover:shadow-md hover:border-dc-navy/40 transition-all bg-white"
            >
              <h3 className="font-semibold text-dc-navy">{a.nombre}</h3>
              <p className="text-xs text-dc-navy/60 mt-1">Taller habilitado</p>
            </Link>
          ))}
        </div>
      </section>

      {otras.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-dc-navy mb-4">Tambien trabajamos con</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {otras.map((a) => (
              <Link
                key={a.id}
                href={`/aseguradoras/${a.slug}`}
                className="border border-dc-blue/30 rounded-lg p-3 hover:bg-dc-blue-light hover:border-dc-navy/40 transition-colors text-dc-navy font-medium"
              >
                {a.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoPageLayout>
  );
}
