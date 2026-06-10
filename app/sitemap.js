import { getServicios, getZonas, getAseguradoras } from "@/lib/seo";
import activas from "@/data/aseguradoras-zonas-activas.json";

const SITE_URL = "https://www.doctorcar.com.ar";
const activasSet = new Set(activas.activas);

export default function sitemap() {
  const now = new Date().toISOString();

  const servicios = getServicios();
  const zonas = getZonas({ tier: 1 });
  const ciudadesHub = zonas.filter((z) => z.tipo !== "subzona");
  const aseguradoras = getAseguradoras();

  const estaticas = [
    { url: `${SITE_URL}/`, priority: 1.0 },
    { url: `${SITE_URL}/aseguradoras`, priority: 0.8 },
    { url: `${SITE_URL}/zonas`, priority: 0.7 },
    { url: `${SITE_URL}/sobre-doctorcar`, priority: 0.5 },
  ];

  const hubsServicio = servicios.map((s) => ({
    url: `${SITE_URL}/${s.slug}`,
    priority: 0.9,
  }));

  const servicioCiudad = servicios.flatMap((s) =>
    zonas
      .filter((z) => z.slug !== "rosario")
      .map((z) => ({
        url: `${SITE_URL}/${s.slug}/${z.slug}`,
        priority: z.tipo === "subzona" ? 0.7 : 0.8,
      }))
  );

  const hubsAseguradora = aseguradoras.map((a) => ({
    url: `${SITE_URL}/aseguradoras/${a.slug}`,
    priority: 0.8,
  }));

  const aseguradoraCiudad = aseguradoras.flatMap((a) =>
    ciudadesHub
      .filter((z) => activasSet.has(`${a.slug}/${z.slug}`))
      .map((z) => ({
        url: `${SITE_URL}/aseguradoras/${a.slug}/${z.slug}`,
        priority: 0.7,
      }))
  );

  const zonasHub = ciudadesHub.map((z) => ({
    url: `${SITE_URL}/zonas/${z.slug}`,
    priority: 0.7,
  }));

  return [
    ...estaticas,
    ...hubsServicio,
    ...servicioCiudad,
    ...hubsAseguradora,
    ...aseguradoraCiudad,
    ...zonasHub,
  ].map((item) => ({
    ...item,
    lastModified: now,
    changeFrequency: "weekly",
  }));
}
