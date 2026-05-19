import servicios from "@/data/servicios.json";
import zonas from "@/data/zonas.json";
import aseguradoras from "@/data/aseguradoras.json";
import seoContent from "@/data/seo-content.json";
import datosReales from "@/data/datos-reales.json";

/* ===================== Catálogo: getters ===================== */

export function getServicios() {
  return servicios.servicios;
}

export function getZonas({ tier = null } = {}) {
  if (tier === null) return zonas.zonas;
  return zonas.zonas.filter((z) => z.tier === tier);
}

export function getAseguradoras({ soloPrincipales = false } = {}) {
  if (soloPrincipales)
    return aseguradoras.aseguradoras.filter((a) => a.es_principal);
  return aseguradoras.aseguradoras;
}

export function findServicio(slug) {
  return servicios.servicios.find((s) => s.slug === slug) ?? null;
}

export function findZona(slug) {
  return zonas.zonas.find((z) => z.slug === slug) ?? null;
}

export function findAseguradora(slug) {
  return aseguradoras.aseguradoras.find((a) => a.slug === slug) ?? null;
}

/* ===================== Contenido SEO generado ===================== */

export function getSeoServicio(id) {
  return seoContent.servicios?.[id] ?? null;
}

export function getSeoZona(id) {
  return seoContent.zonas?.[id] ?? null;
}

export function getSeoAseguradora(id) {
  return seoContent.aseguradoras?.[id] ?? null;
}

/* ===================== Datos reales ===================== */

export function getDatosZona(id) {
  return datosReales.por_zona?.[id] ?? null;
}

export function getDatosAseguradora(id) {
  return datosReales.por_aseguradora?.[id] ?? null;
}

export function getAgregadoTaller() {
  return datosReales.agregado_taller;
}

/* ===================== Composición de FAQs y contenido ===================== */

export function getFaqsServicioCiudad(servicioId, zonaId) {
  const servSeo = getSeoServicio(servicioId);
  const zonaSeo = getSeoZona(zonaId);
  const servicio = findServicio(servicioId);
  const zona = findZona(zonaId);

  const faqs = [...(servSeo?.faqs || []), ...(zonaSeo?.faqs || [])];

  const datos = getDatosZona(zonaId);
  if (servicio && zona && datos?.siniestros_tipo_distribucion) {
    const tipoMax = Object.entries(datos.siniestros_tipo_distribucion).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (tipoMax) {
      faqs.push({
        q: `¿Qué tipo de siniestros son más comunes ${zona.nombre_h1_sufijo}?`,
        a: `Según datos propios de DoctorCar, el tipo más frecuente en ${zona.nombre} es "${tipoMax[0].replace("_", " ")}" representando aproximadamente el ${Math.round(tipoMax[1] * 100)}% de los casos.`,
      });
    }
  }

  return faqs;
}

export function getFaqsAseguradoraCiudad(aseguradoraId, zonaId) {
  const aseSeo = getSeoAseguradora(aseguradoraId);
  const zonaSeo = getSeoZona(zonaId);
  return [...(aseSeo?.faqs || []), ...(zonaSeo?.faqs || [])];
}

/* ===================== Interlinking ===================== */

export function getOtrosServiciosEnZona(servicioActualId, zonaId) {
  return getServicios()
    .filter((s) => s.id !== servicioActualId)
    .map((s) => ({
      slug: s.slug,
      nombre: s.nombre,
      href: `/${s.slug}/${zonaId}`,
    }));
}

export function getServicioEnOtrasZonas(servicioId, zonaActualId) {
  return getZonas({ tier: 1 })
    .filter((z) => z.id !== zonaActualId && z.tipo !== "subzona")
    .map((z) => ({
      slug: z.slug,
      nombre: z.nombre,
      href: `/${servicioId}/${z.slug}`,
    }));
}

export function getAseguradorasDisponibles({ soloPrincipales = true } = {}) {
  return getAseguradoras({ soloPrincipales }).map((a) => ({
    slug: a.slug,
    nombre: a.nombre,
    href: `/aseguradoras/${a.slug}`,
  }));
}
