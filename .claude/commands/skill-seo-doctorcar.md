---
name: SEO DoctorCar
description: Estado completo del proyecto SEO programático de DoctorCar. Arquitectura, keywords, pendientes, avance y decisiones técnicas. Referencia central para cualquier tarea SEO en este proyecto.
---

# Skill — SEO DoctorCar (estado completo del proyecto)

> Referencia central para el SEO programático de doctorcar.com.ar.
> Contiene: auditoría, arquitectura, keywords, pendientes, avance y decisiones.
> Usar en combinación con `skill-seo` (metodología general).

---

## Estado del proyecto (última actualización: 2026-05-19)

### Rama activa: `seo-rebranding`

### Progreso general

| Fase | Estado | Detalle |
|------|--------|---------|
| Auditoría inicial | HECHO | Sitio era one-pager sin arquitectura. 1 click / 13 impresiones en 7 días. |
| Keyword research | HECHO | 59 keywords priorizadas en `seo/keywords-doctorcar.csv` |
| Estructura de archivos | HECHO | Data JSONs, lib helpers, components SEO, pages programáticas integradas |
| Metadata completa | HECHO | OG image, icons, manifest, GTM placeholder, metadataBase, lang="es-AR" |
| Sitemap dinámico | HECHO | Genera ~173 URLs desde los JSONs |
| Robots.txt | HECHO | Bloquea /portal, /api/, /_next/ |
| Redirects 301 | HECHO | /chapa-pintura-rosario → /chapa-y-pintura/rosario, idem siniestros |
| Contenido LLM (seo-content.json) | PENDIENTE | Script listo, falta correr con GROQ_API_KEY |
| Google Business Profile | PENDIENTE | Taller físico en Rosario, no reclamado |
| Datos reales (capa 2) | PENDIENTE | datos-reales.json tiene TODOs, llenar desde proyecto paralelo |
| Dirección física real | PENDIENTE | schema.js tiene placeholders, sobre-doctorcar tiene placeholders |
| WhatsApp real | PENDIENTE | Todos los archivos tienen 549341XXXXXXX como placeholder |
| GTM Container ID | PENDIENTE | layout.jsx tiene GTM-XXXXXXX |
| OG image real | PENDIENTE | layout apunta a /og-image.jpg, falta crear la imagen |
| Icons 192/512 | PENDIENTE | manifest apunta a /icon-192x192.png y /icon-512x512.png, falta generarlos |
| Blog / recursos | PENDIENTE | Fase 2 |
| Deploy + GSC | PENDIENTE | Verificar por DNS, submit sitemap |

---

## Arquitectura del sitio

### Árbol de URLs

```
/                                          → Home + LocalBusiness schema
/[servicio]/                               → Hub servicio (7 servicios)
/[servicio]/[ciudad]/                      → Programática servicio×ciudad (7×13=91)
/aseguradoras/                             → Hub aseguradoras
/aseguradoras/[aseguradora]/               → Hub por aseguradora (8)
/aseguradoras/[aseguradora]/[ciudad]/      → Aseguradora×ciudad (8×8=64)
/zonas/                                    → Hub zonas
/zonas/[ciudad]/                           → Hub local con todos los servicios
/sobre-doctorcar/                          → E-E-A-T (dirección, equipo, datos)
/portal                                    → No-index (app interna)
```

### Dimensiones del sistema programático

| Dimensión | Items | Archivo JSON |
|-----------|-------|-------------|
| Servicios | 7 (chapa-y-pintura, siniestros, granizo, abolladuras-sin-pintura, enderezado-carroceria, pintura-automotor, peritaje-aseguradora) | `data/servicios.json` |
| Zonas | 13 (Rosario + 4 subzonas + Funes, Roldán, G. Baigorria, VGG, Pérez, Soldini, Victoria, Arroyo Seco) | `data/zonas.json` |
| Aseguradoras | 8 (La Caja, Sancor, Allianz, Fed. Patronal, Zurich, San Cristóbal, Provincia, Mercantil Andina) | `data/aseguradoras.json` |

### Patrón de composición

**N+M+K llamadas LLM → N×M + N×K + M×K páginas únicas**

- 7 servicios + 13 zonas + 8 aseguradoras = **28 llamadas** al LLM
- Generan contenido para **~173 páginas** indexables
- Cada página compone: párrafo servicio + párrafo zona + FAQs servicio + FAQs zona + datos reales

### Tiers de zonas

- **Tier 1** (páginas activas): Rosario, Rosario Centro/Norte/Sur/Oeste, Funes, Roldán, G. Baigorria, VGG, Pérez
- **Tier 2** (expansión futura): Soldini, Victoria (Entre Ríos), Arroyo Seco
- Para activar tier 2: cambiar `"tier": 2` → `"tier": 1` en zonas.json y rebuild

---

## Archivos del proyecto SEO

### Data (JSONs base)

| Archivo | Función | Editable |
|---------|---------|----------|
| `data/servicios.json` | Catálogo de 7 servicios con keywords, slugs, descripciones | Sí, a mano |
| `data/zonas.json` | 13 zonas con geo, tier, datos locales | Sí, a mano |
| `data/aseguradoras.json` | 8 aseguradoras con atributos, teléfonos, procesos | Sí, a mano |
| `data/seo-content.json` | Contenido generado por LLM (párrafos + FAQs por dimensión) | NO, lo genera el script |
| `data/datos-reales.json` | Capa 2: datos del taller, por zona, por aseguradora, estacionalidad | Sí, desde proyecto paralelo |

### Lib (helpers)

| Archivo | Función |
|---------|---------|
| `lib/seo.js` | Getters de catálogo, contenido SEO, datos reales, composición FAQs, interlinking |
| `lib/metadata.js` | Factories de generateMetadata por tipo de página (home, servicio, ciudad, aseg) |
| `lib/schema.js` | JSON-LD builders (AutoBodyShop, Service, FAQPage, BreadcrumbList, Organization) |
| `lib/tracking.js` | sendBeacon tracking propio + dataLayer push para GTM |

### Components SEO

| Archivo | Función |
|---------|---------|
| `components/seo/JsonLd.jsx` | Inyecta JSON-LD en head |
| `components/seo/FaqList.jsx` | Renderiza FAQs como `<details>` (SEO-friendly, sin JS) |
| `components/seo/Breadcrumb.jsx` | Breadcrumb visible + JSON-LD BreadcrumbList automático |

### Pages programáticas

| Ruta | Genera |
|------|--------|
| `app/[servicio]/page.jsx` | 7 hubs de servicio |
| `app/[servicio]/[ciudad]/page.jsx` | 91 páginas servicio×ciudad |
| `app/aseguradoras/page.jsx` | 1 hub aseguradoras |
| `app/aseguradoras/[aseguradora]/page.jsx` | 8 hubs de aseguradora |
| `app/aseguradoras/[aseguradora]/[ciudad]/page.jsx` | 64 aseguradora×ciudad |
| `app/zonas/page.jsx` | 1 hub zonas |
| `app/zonas/[ciudad]/page.jsx` | ~8 hubs locales |
| `app/sobre-doctorcar/page.jsx` | 1 página E-E-A-T |

### Scripts

| Archivo | Función |
|---------|---------|
| `scripts/generate-seo-content.mjs` | Pipeline Groq para llenar seo-content.json. Resumable, normaliza respuestas. |

### Config actualizado

| Archivo | Cambios SEO |
|---------|-------------|
| `app/layout.jsx` | metadataBase, OG image, Twitter card, icons completos, manifest, GTM, lang="es-AR" |
| `app/sitemap.js` | Dinámico: genera todas las URLs desde los JSONs |
| `app/robots.js` | Bloquea /portal, /api/, /_next/. Host y sitemap con www |
| `next.config.mjs` | Redirects 301 de URLs viejas |
| `public/manifest.json` | PWA manifest con icons |

---

## Keyword research

### Archivo: `seo/keywords-doctorcar.csv`

59 keywords priorizadas con:
- **Prioridad** (P0/P1/P2)
- **Query** exacta
- **Intención** (transaccional/informacional)
- **Volumen mensual estimado**
- **Dificultad** y **competencia**
- **Página destino** (mapeada a la estructura programática)
- **Score de oportunidad** (0-10)

### Resumen por prioridad

| Prioridad | Cantidad | Score promedio | Foco |
|-----------|----------|---------------|------|
| P0 | 19 | 9.3 | Aseguradoras (CERO competencia), sacabollos, siniestros, granizo |
| P1 | 23 | 8.2 | Pintura, enderezado, ciudades cercanas, subzonas, presupuestos |
| P2 | 17 | 7.3 | Blog informacional (qué hacer tras siniestro, peritaje, granizo seguro) |

### Insights clave del keyword research

1. **Aseguradoras = oro puro**: "taller habilitado [aseguradora] rosario" tiene CERO competencia y score 9.3-9.8. Google rankea la propia aseguradora (no es lo que el usuario quiere). Primera página que aparezca captura todo.
2. **Sacabollos rosario** (320/mes): competencia son artesanos sin SEO. Alta conversión.
3. **Granizo**: volumen base bajo pero spikes BRUTALES post-tormenta. Páginas deben estar pre-rankeadas antes de octubre (temporada granizo).
4. **Subzonas** (Fisherton, zona norte): 28 páginas extra con intención 100% transaccional y competencia CERO.
5. **FAQ ganadora**: "¿La aseguradora me puede obligar a usar su taller?" — NO. Va en TODAS las páginas de aseguradora.

---

## Decisiones de arquitectura

### Granizo como servicio top-level
`/granizo/rosario` en vez de `/siniestros/granizo/rosario`. La keyword se busca como concepto independiente. Si se quiere jerarquía padre-hijo, mover carpeta.

### Subzonas generan páginas servicio×subzona
`/chapa-y-pintura/rosario-norte` existe. 7 servicios × 4 subzonas = 28 páginas extra. Si Google las mete en thin content, marcar noindex hasta que tengan contenido único.

### dynamicParams = false
Slug desconocido = 404 limpio. Evita spam de URLs. Zona nueva requiere rebuild.

### No hay canonical en root layout
Cada página hija define el suyo via metadata factories. Root layout no envenena.

### Páginas viejas → 301
`/chapa-pintura-rosario` → `/chapa-y-pintura/rosario`
`/siniestros-rosario` → `/siniestros/rosario`
Configurado en `next.config.mjs`.

---

## TODOs pendientes (ordenados por impacto)

### Críticos (bloquean deployment)

1. **WhatsApp real**: buscar `549341XXXXXXX` y reemplazar por el número real argentino
2. **Dirección física**: completar en `lib/schema.js` (streetAddress, postalCode, telephone) y `app/sobre-doctorcar/page.jsx`
3. **GTM Container ID**: reemplazar `GTM-XXXXXXX` en `app/layout.jsx`
4. **OG image**: crear `/public/og-image.jpg` (1200x630px) con branding DoctorCar
5. **Icons 192/512**: generar `/public/icon-192x192.png` y `/public/icon-512x512.png` desde el logo

### Importantes (mejoran SEO antes del launch)

6. **Correr script generador**: `GROQ_API_KEY=xxx node scripts/generate-seo-content.mjs` para llenar seo-content.json
7. **Google Business Profile**: reclamar, completar, subir fotos, pedir 5-10 reviews
8. **datos-reales.json**: llenar TODOs desde proyecto paralelo (modelos más reparados, métricas por aseguradora)
9. **Email propio**: contacto@doctorcar.com.ar en vez de gmail
10. **GSC**: verificar por DNS, submit sitemap

### Fase 2

11. **Blog / recursos**: 6-8 artículos pilares (qué hacer tras siniestro, peritaje, granizo seguro)
12. **Activar zonas tier 2**: Soldini, Victoria, Arroyo Seco
13. **Córdoba Capital**: solo si hay presencia física o demanda validada con ads
14. **GTM eventos**: configurar triggers para click_whatsapp, submit_presupuesto, view_aseguradora
15. **Microsoft Clarity**: instalar para heatmaps y session recordings
16. **Meta Pixel**: cuando hagan ads

---

## Tracking (plan de eventos)

### Eventos GA4 vía GTM

| Evento | Trigger | Conversión |
|--------|---------|-----------|
| click_whatsapp | click en wa.me/* | Sí |
| submit_presupuesto | form submit | Sí |
| click_portal | click "Ingresar al Portal" | No |
| view_aseguradora | pageview /aseguradoras/* | No |
| scroll_50 / scroll_90 | scroll depth | No |
| outbound_maps | click Maps | No |

### Tracking propio (lib/tracking.js)

sendBeacon a `/api/tracking/event` con: evento, página, session_id, UTMs, timestamp, mobile flag.
Complementa GA4 (pierde ~30% por adblockers en AR).

---

## Schema.org implementado

| Tipo | Dónde | Estado |
|------|-------|--------|
| AutoBodyShop (LocalBusiness) | Home | Listo (falta dirección real) |
| Service | Hubs servicio, servicio×ciudad | Listo |
| FAQPage | Todas las páginas con FAQs | Listo (falta contenido LLM) |
| BreadcrumbList | Todas las páginas | Listo |
| Organization | Home (secundario) | Listo |
| Service (aseguradora) | Hubs aseguradora, aseg×ciudad | Listo |

---

## Roadmap por fases

### Fase 0 — Sangrado (inmediato)
- [ ] WhatsApp +34 → +54 9 341 real
- [ ] Dirección física en footer y schema
- [ ] Google Business Profile reclamado
- [ ] Email propio
- [ ] GA4 + GTM + GSC + Clarity
- [ ] LocalBusiness schema con datos reales

### Fase 1 — Arquitectura + ~100 páginas (semanas 2-5)
- [x] Estructura de carpetas Next.js
- [x] Data JSONs base
- [x] Helpers SEO (lib/seo.js, metadata.js, schema.js)
- [x] Components SEO (JsonLd, FaqList, Breadcrumb)
- [x] Pages programáticas
- [x] Sitemap dinámico
- [x] Redirects 301
- [ ] Correr pipeline contenido LLM
- [ ] Interlinking verificado
- [ ] Deploy + GSC submit

### Fase 2 — Profundización (semanas 6-10)
- [ ] Blog: 6-8 artículos pilares
- [ ] Datos reales integrados (capa 2)
- [ ] Expansión zonas tier 2
- [ ] Hubs /zonas/[ciudad]/ con todos los servicios

### Fase 3 — Optimización por GSC (mes 3+)
- [ ] Identificar posición 5-15 con impresiones altas
- [ ] Mejorar titles/descriptions de low-hanging fruit
- [ ] Crear páginas para queries inesperadas
- [ ] Loop de feedback GSC → contenido → deploy

---

## SERP actual (competencia en Rosario)

| Query | Quién rankea | Calidad SEO | Hueco |
|-------|-------------|-------------|-------|
| taller chapa y pintura rosario | San Antonio, Modena, Picar, Master, directorios | Bajo | Alto |
| taller habilitado [aseguradora] rosario | La propia aseguradora, ML | Ninguno | Altísimo |
| reparacion granizo auto rosario | Autoestética, notas periodísticas | Bajo | Alto |
| peritaje siniestro rosario | Aseguradoras, notas policiales | Ninguno | Alto |
| presupuesto chapa y pintura rosario | Sitios de Bs As, México, España | Cero local | Alto |

**Insight**: la SERP de Rosario está floja. No hay ningún taller con SEO técnico serio. DoctorCar con schema, contenido único y páginas dedicadas debería rankear en 6-12 semanas para las P0.

---

## Estacionalidad

- **Granizo**: octubre a marzo (primavera-verano pampeano). Spikes de 1000+ búsquedas/día post-tormenta.
- **Siniestros**: relativamente estable, leve aumento en vacaciones (enero, julio).
- **Páginas de granizo deben estar pre-rankeadas antes de octubre 2026**.

---

## Notas técnicas

- El proyecto NO tiene `src/`: todo en raíz (`app/`, `lib/`, `data/`, `components/`)
- Path alias: `@/*` → raíz del proyecto (jsconfig.json)
- Prettier: semi=true, singleQuote=false, tabWidth=2
- Next.js 16 con App Router
- Tailwind CSS v4
- `dynamicParams = false` en todas las rutas dinámicas
