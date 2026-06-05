import {
  findServicio,
  findZona,
  findAseguradora,
  getAgregadoTaller,
} from "./seo";
import { SITE_URL, SITE_NAME } from "./metadata";

/* ===================== LocalBusiness / AutoBodyShop ===================== */

export function schemaAutoBodyShop({
  streetAddress = "9 de julio 4231",
  postalCode = "2000",
  telephone = "+543412697000",
  email = "contacto@doctorcar.com.ar",
  reviewCount = 0,
} = {}) {
  const agregado = getAgregadoTaller();
  return {
    "@context": "https://schema.org",
    "@type": "AutoBodyShop",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpeg`,
    image: `${SITE_URL}/logo.jpeg`,
    description:
      "Taller de chapa y pintura en Rosario especializado en reparación de siniestros y gestión con aseguradoras.",
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: "Rosario",
      addressRegion: "Santa Fe",
      postalCode,
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -32.9468,
      longitude: -60.6393,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Rosario" },
      { "@type": "City", name: "Funes" },
      { "@type": "City", name: "Roldán" },
      { "@type": "City", name: "Granadero Baigorria" },
      { "@type": "City", name: "Villa Gobernador Gálvez" },
      { "@type": "City", name: "Pérez" },
      { "@type": "City", name: "Soldini" },
    ],
    aggregateRating: agregado?.calificacion_google
      ? {
          "@type": "AggregateRating",
          ratingValue: String(agregado.calificacion_google),
          reviewCount: String(
            reviewCount || agregado.vehiculos_reparados_total || 1
          ),
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,
    sameAs: [
      // TODO: agregar perfiles cuando existan
      // "https://www.instagram.com/doctorcar",
      // "https://www.facebook.com/doctorcar",
    ],
  };
}

/* ===================== Service ===================== */

export function schemaService(servicioSlug, ciudadSlug = null) {
  const s = findServicio(servicioSlug);
  if (!s) return null;
  const z = ciudadSlug ? findZona(ciudadSlug) : null;
  const nombre = z
    ? `${s.nombre} ${z.nombre_h1_sufijo}`
    : `${s.nombre} en Rosario y zona`;
  const url = z
    ? `${SITE_URL}/${s.slug}/${z.slug}`
    : `${SITE_URL}/${s.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: nombre,
    description: s.descripcion_corta,
    serviceType: s.nombre,
    provider: {
      "@type": "AutoBodyShop",
      "@id": `${SITE_URL}/#localbusiness`,
    },
    areaServed: z
      ? {
          "@type": "City",
          name: z.nombre,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: z.provincia,
          },
        }
      : { "@type": "City", name: "Rosario" },
    url,
  };
}

/* ===================== FAQPage ===================== */

export function schemaFaq(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* ===================== BreadcrumbList ===================== */

export function schemaBreadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url ? `${SITE_URL}${it.url}` : undefined,
    })),
  };
}

/* ===================== Organization ===================== */

export function schemaOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpeg`,
  };
}

/* ===================== Aseguradora como Service ===================== */

export function schemaServiceAseguradora(aseguradoraSlug, ciudadSlug = null) {
  const a = findAseguradora(aseguradoraSlug);
  if (!a) return null;
  const z = ciudadSlug ? findZona(ciudadSlug) : null;
  const nombre = `Reparación de siniestros para clientes ${a.nombre_completo}${z ? ` ${z.nombre_h1_sufijo}` : ""}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: nombre,
    description: `Gestión integral del siniestro con ${a.nombre_completo}: peritaje, reparación y facturación directa.`,
    serviceType: "Reparación de siniestros",
    provider: {
      "@type": "AutoBodyShop",
      "@id": `${SITE_URL}/#localbusiness`,
    },
    audience: {
      "@type": "Audience",
      name: `Asegurados ${a.nombre_completo}`,
    },
    areaServed: z
      ? { "@type": "City", name: z.nombre }
      : { "@type": "City", name: "Rosario" },
  };
}
