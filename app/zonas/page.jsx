import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { getZonas } from "@/lib/seo";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Zonas de cobertura | DoctorCar Rosario",
  description:
    "Atendemos en Rosario, Funes, Roldán, Granadero Baigorria, Villa Gobernador Gálvez, Pérez y zona metropolitana.",
  alternates: { canonical: `${SITE_URL}/zonas` },
};

export default function ZonasHubPage() {
  const zonas = getZonas({ tier: 1 }).filter((z) => z.tipo !== "subzona");

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Zonas" }]}
      />
      <h1 className="text-4xl font-bold mb-8">Zonas de cobertura</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {zonas.map((z) => (
          <Link
            key={z.id}
            href={`/zonas/${z.slug}`}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{z.nombre}</h2>
            <p className="text-sm text-gray-600">{z.provincia}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
