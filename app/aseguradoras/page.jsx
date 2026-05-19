import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { getAseguradoras } from "@/lib/seo";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Taller habilitado para aseguradoras en Rosario | DoctorCar",
  description:
    "Trabajamos con todas las aseguradoras del país. Gestión integral del peritaje, reparación y facturación directa con tu compañía de seguros.",
  alternates: { canonical: `${SITE_URL}/aseguradoras` },
};

export default function AseguradorasHubPage() {
  const aseguradoras = getAseguradoras();
  const principales = aseguradoras.filter((a) => a.es_principal);
  const otras = aseguradoras.filter((a) => !a.es_principal);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Aseguradoras" }]}
      />

      <h1 className="text-4xl font-bold mb-4">
        Trabajamos con todas las aseguradoras
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Si tuviste un siniestro y tenés un seguro contratado, nos encargamos del
        proceso completo: peritaje, presupuesto, reparación y facturación
        directa con tu compañía. Sin trámites, sin demoras.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Compañías principales</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {principales.map((a) => (
            <Link
              key={a.id}
              href={`/aseguradoras/${a.slug}`}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-semibold">{a.nombre}</h3>
              <p className="text-xs text-gray-600 mt-1">Taller habilitado</p>
            </Link>
          ))}
        </div>
      </section>

      {otras.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">También trabajamos con</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {otras.map((a) => (
              <Link
                key={a.id}
                href={`/aseguradoras/${a.slug}`}
                className="border rounded p-3 hover:bg-gray-50"
              >
                {a.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
