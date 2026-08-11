import { findServicio, findZona, findAseguradora } from "./seo";

const SITE_URL = "https://www.doctorcar.com.ar";
const SITE_NAME = "DoctorCar";

/* ===================== Helpers base ===================== */

function baseOg(overrides = {}) {
  return {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
    ...overrides,
  };
}

function mesActual() {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const d = new Date();
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

/* ===================== Factories ===================== */

export function makeHomeMetadata() {
  const titulo =
    "Taller de Chapa y Pintura en Rosario | DoctorCar – Siniestros y Aseguradoras";
  const desc =
    "Especialistas en reparación de siniestros, chapa y pintura en Rosario. Trabajamos con todas las aseguradoras. Presupuestos en 24hs y seguimiento online.";
  return {
    title: titulo,
    description: desc,
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/`,
    }),
  };
}

export function makeServicioMetadata(servicioSlug) {
  const s = findServicio(servicioSlug);
  if (!s) return {};
  const titulo = `${s.nombre} en Rosario: proceso, plazos y presupuesto | DoctorCar`;
  const desc = `${s.descripcion_corta} Envia fotos por WhatsApp y recibi presupuesto sin cargo en 24hs. Rosario y Gran Rosario.`;
  return {
    title: titulo,
    description: desc,
    keywords: [s.keyword_principal, ...s.keywords_secundarias].join(", "),
    alternates: { canonical: `${SITE_URL}/${s.slug}` },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/${s.slug}`,
    }),
  };
}

export function makeServicioCiudadMetadata(servicioSlug, ciudadSlug) {
  const s = findServicio(servicioSlug);
  const z = findZona(ciudadSlug);
  if (!s || !z) return {};
  const titulo = `${s.nombre} ${z.nombre_h1_sufijo} | Presupuesto en 24hs | DoctorCar`;
  const desc = `Envia fotos por WhatsApp y recibi presupuesto sin cargo en 24hs. ${s.descripcion_corta} Gestion directa con aseguradoras (${mesActual()}).`;
  return {
    title: titulo,
    description: desc,
    keywords: [
      s.keyword_principal,
      `${s.keyword_principal} ${z.nombre}`,
      z.nombre,
    ].join(", "),
    alternates: { canonical: `${SITE_URL}/${s.slug}/${z.slug}` },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/${s.slug}/${z.slug}`,
    }),
  };
}

export function makeAseguradoraMetadata(aseguradoraSlug) {
  const a = findAseguradora(aseguradoraSlug);
  if (!a) return {};
  const titulo = `Taller Habilitado ${a.nombre} en Rosario | DoctorCar`;
  const desc = `¿Cliente de ${a.nombre}? Podés elegir dónde reparar: gestionamos el peritaje y facturamos directo a ${a.nombre_completo}. Sin adelantar plata, presupuesto en 24hs.`;
  return {
    title: titulo,
    description: desc,
    keywords: [
      `taller ${a.nombre} Rosario`,
      `siniestro ${a.nombre}`,
      `peritaje ${a.nombre}`,
    ].join(", "),
    alternates: { canonical: `${SITE_URL}/aseguradoras/${a.slug}` },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/aseguradoras/${a.slug}`,
    }),
  };
}

export function makeAseguradoraCiudadMetadata(aseguradoraSlug, ciudadSlug) {
  const a = findAseguradora(aseguradoraSlug);
  const z = findZona(ciudadSlug);
  if (!a || !z) return {};
  const titulo = `Taller ${a.nombre} ${z.nombre_h1_sufijo} | Siniestros y Peritaje | DoctorCar`;
  const desc = `¿Siniestro con ${a.nombre} ${z.nombre_h1_sufijo}? Podés elegir tu taller: gestionamos el peritaje y facturamos directo a la compañía. Presupuesto en 24hs.`;
  return {
    title: titulo,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/aseguradoras/${a.slug}/${z.slug}`,
    },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/aseguradoras/${a.slug}/${z.slug}`,
    }),
  };
}

export function makeZonaMetadata(ciudadSlug) {
  const z = findZona(ciudadSlug);
  if (!z) return {};
  const titulo = `Taller de Chapa, Pintura y Siniestros ${z.nombre_h1_sufijo} | DoctorCar`;
  const desc = `Todos los servicios de reparación automotor ${z.nombre_h1_sufijo}: chapa, pintura, siniestros, granizo y gestión con aseguradoras.`;
  return {
    title: titulo,
    description: desc,
    alternates: { canonical: `${SITE_URL}/zonas/${z.slug}` },
    openGraph: baseOg({
      title: titulo,
      description: desc,
      url: `${SITE_URL}/zonas/${z.slug}`,
    }),
  };
}

export { SITE_URL, SITE_NAME, mesActual };
