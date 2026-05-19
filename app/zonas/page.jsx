import Link from "next/link";
import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { getZonas } from "@/lib/seo";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Zonas de cobertura | DoctorCar Rosario",
  description:
    "Atendemos en Rosario, Funes, Roldan, Granadero Baigorria, Villa Gobernador Galvez, Perez y zona metropolitana.",
  alternates: { canonical: `${SITE_URL}/zonas` },
};

export default function ZonasHubPage() {
  const zonas = getZonas({ tier: 1 }).filter((z) => z.tipo !== "subzona");

  return (
    <SeoPageLayout>
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Zonas" }]}
      />
      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-8">
        Zonas de cobertura
      </h1>
      <div className="grid md:grid-cols-3 gap-4">
        {zonas.map((z) => (
          <Link
            key={z.id}
            href={`/zonas/${z.slug}`}
            className="border border-dc-blue/30 rounded-xl p-4 hover:shadow-md hover:border-dc-navy/40 transition-all bg-white"
          >
            <h2 className="font-semibold text-lg text-dc-navy">{z.nombre}</h2>
            <p className="text-sm text-dc-navy/60">{z.provincia}</p>
          </Link>
        ))}
      </div>
    </SeoPageLayout>
  );
}
