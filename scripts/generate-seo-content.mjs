/**
 * scripts/generate-seo-content.mjs
 *
 * Genera contenido SEO único por dimensión (servicio, zona, aseguradora).
 * Usa Groq (free tier ~30 RPM). Resumable: salta entradas ya generadas.
 *
 * Uso:
 *   GROQ_API_KEY=xxx node scripts/generate-seo-content.mjs
 *   GROQ_API_KEY=xxx node scripts/generate-seo-content.mjs --dim=servicios
 *   GROQ_API_KEY=xxx node scripts/generate-seo-content.mjs --force
 *
 * Patrón N+M+K → N×M×K páginas únicas.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const GROQ_API_KEY = process.env.GROQ_API_KEY
if (!GROQ_API_KEY) {
  console.error('Falta GROQ_API_KEY')
  process.exit(1)
}

const MODEL = 'llama-3.3-70b-versatile'  // o 'llama-3.1-8b-instant' para tier free más amplio

const args = process.argv.slice(2)
const onlyDim = args.find(a => a.startsWith('--dim='))?.split('=')[1]
const force = args.includes('--force')

const servicios = JSON.parse(readFileSync(join(DATA_DIR, 'servicios.json'), 'utf-8')).servicios
const zonas = JSON.parse(readFileSync(join(DATA_DIR, 'zonas.json'), 'utf-8')).zonas
const aseguradoras = JSON.parse(readFileSync(join(DATA_DIR, 'aseguradoras.json'), 'utf-8')).aseguradoras

const OUT = join(DATA_DIR, 'seo-content.json')
const result = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf-8'))
  : { meta: {}, servicios: {}, zonas: {}, aseguradoras: {} }

result.meta.actualizado = new Date().toISOString().slice(0, 10)
result.servicios ??= {}
result.zonas ??= {}
result.aseguradoras ??= {}

/* ===================== Prompts ===================== */

const SYSTEM_BASE = `Sos un redactor SEO experto en talleres de chapa y pintura en Argentina. Escribís en español rioplatense neutro (uso de "vos" pero claro). Generás contenido único, factual, sin clichés ni rellenos. Cada FAQ debe ser específica y no genérica.

Devolvés SOLO JSON válido con esta forma exacta:
{
  "parrafo": "string de 100-150 palabras",
  "faqs": [
    { "q": "pregunta", "a": "respuesta de 30-60 palabras" }
  ]
}`

function promptServicio(s) {
  return {
    system: SYSTEM_BASE,
    user: `Generá contenido SEO para la página del servicio "${s.nombre}" en un taller de chapa y pintura llamado DoctorCar ubicado en Rosario, Argentina.

Contexto del servicio:
- Descripción: ${s.descripcion_corta}
- Keyword principal: ${s.keyword_principal}
- Intención de búsqueda: ${s.intencion}

Generá:
1. Un párrafo único de 100-150 palabras explicando el servicio, sus características técnicas y por qué elegir DoctorCar. NO usar clichés tipo "tu vehículo en las mejores manos". Sí incluir detalles técnicos concretos (tipo de pintura, equipamiento, proceso).
2. 3 FAQs ESPECÍFICAS del servicio (no de la ciudad). Ejemplos válidos: "¿cuánto dura el proceso?", "¿qué garantía ofrecen?", "¿se igualan colores especiales?". No usar preguntas genéricas tipo "¿qué incluye el servicio?".

JSON only.`,
  }
}

function promptZona(z) {
  return {
    system: SYSTEM_BASE,
    user: `Generá contenido SEO para una página dedicada a "${z.nombre}" en un taller de chapa y pintura de Rosario llamado DoctorCar.

Contexto de la zona:
- Nombre: ${z.nombre}
- Provincia: ${z.provincia}
- Tipo: ${z.tipo}
- Distancia desde el taller: ${z.distancia_taller_km || 0} km
${z.datos_locales?.vias_principales ? `- Vías principales: ${z.datos_locales.vias_principales.join(', ')}` : ''}
${z.datos_locales?.tipo_trafico ? `- Tipo de tráfico: ${z.datos_locales.tipo_trafico}` : ''}
${z.datos_locales?.siniestros_predominantes ? `- Siniestros típicos: ${z.datos_locales.siniestros_predominantes.join(', ')}` : ''}
${z.datos_locales?.nota_seo ? `- Nota: ${z.datos_locales.nota_seo}` : ''}

Generá:
1. Un párrafo único de 100-150 palabras describiendo cómo opera DoctorCar en esa zona, vinculando con vías o características locales reales. NO inventar lugares ni nombres. Si la zona es lejana, mencionar el framing honesto (cliente trae el auto, vamos a buscarlo, etc.).
2. 2 FAQs específicas de esa ZONA (no del servicio). Ejemplos: "¿llevan el auto desde X?", "¿cuánto tarda llegar al taller desde X?", "¿operan en X?". 

JSON only.`,
  }
}

function promptAseguradora(a) {
  return {
    system: SYSTEM_BASE,
    user: `Generá contenido SEO para la página de DoctorCar como taller habilitado para ${a.nombre_completo}.

Contexto:
- Aseguradora: ${a.nombre_completo}
- Tipo de facturación: ${a.atributos.tipo_facturacion}
- Tipo de taller: ${a.atributos.tipo_de_taller}
- Tiempo de peritaje promedio: ${a.atributos.tiempo_peritaje_promedio_dias} días
${a.atributos.nota_local ? `- Nota: ${a.atributos.nota_local}` : ''}

Generá:
1. Un párrafo único de 100-150 palabras explicando cómo DoctorCar gestiona los siniestros con ${a.nombre}: proceso de peritaje, papeles, qué hace el cliente, qué hace el taller. Incluir detalles concretos del proceso con esa compañía. NO inventar políticas que no estén en los atributos.
2. 2 FAQs específicas de esta aseguradora. Ejemplos: "¿puedo elegir DoctorCar siendo cliente de ${a.nombre}?", "¿qué papeles necesito de ${a.nombre}?", "¿cuánto tarda el peritaje con ${a.nombre}?".

JSON only.`,
  }
}

/* ===================== Llamada al LLM ===================== */

async function callGroq({ system, user }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 800,
    }),
  })

  if (res.status === 429) {
    console.warn('  rate limited, sleeping 30s')
    await new Promise(r => setTimeout(r, 30000))
    return null
  }

  if (!res.ok) {
    console.error(`  HTTP ${res.status}: ${await res.text()}`)
    return null
  }

  const json = await res.json()
  const text = json.choices?.[0]?.message?.content
  if (!text) return null

  try {
    return normalize(JSON.parse(text))
  } catch (e) {
    console.error('  Parse error:', e.message)
    return null
  }
}

function normalize(parsed) {
  const parrafo = parsed.parrafo || parsed.paragraph || parsed.descripcion || ''
  let faqs = parsed.faqs || parsed.FAQ || parsed.faq || parsed.preguntas || []
  if (!Array.isArray(faqs)) faqs = []
  faqs = faqs
    .filter(f => f && (f.q || f.question || f.pregunta) && (f.a || f.answer || f.respuesta))
    .map(f => ({
      q: f.q || f.question || f.pregunta,
      a: f.a || f.answer || f.respuesta,
    }))
  return { parrafo, faqs }
}

/* ===================== Loop principal ===================== */

async function processItems({ items, key, makePrompt }) {
  console.log(`\n=== ${key} (${items.length}) ===`)
  let done = 0, skip = 0, fail = 0

  for (const item of items) {
    if (!force && result[key][item.id]?.parrafo) {
      skip++
      continue
    }

    process.stdout.write(`  [${++done + skip + fail}/${items.length}] ${item.id}... `)
    const content = await callGroq(makePrompt(item))

    if (!content) {
      console.log('FAIL')
      fail++
      continue
    }

    if (!content.parrafo || content.faqs.length < 1) {
      console.log('EMPTY')
      fail++
      continue
    }

    result[key][item.id] = content
    writeFileSync(OUT, JSON.stringify(result, null, 2))
    console.log('OK')
    await new Promise(r => setTimeout(r, 2000)) // 2s entre llamadas
  }

  console.log(`  done=${done} skip=${skip} fail=${fail}`)
}

async function main() {
  if (!onlyDim || onlyDim === 'servicios') {
    await processItems({ items: servicios, key: 'servicios', makePrompt: promptServicio })
  }
  if (!onlyDim || onlyDim === 'zonas') {
    await processItems({ items: zonas, key: 'zonas', makePrompt: promptZona })
  }
  if (!onlyDim || onlyDim === 'aseguradoras') {
    await processItems({ items: aseguradoras, key: 'aseguradoras', makePrompt: promptAseguradora })
  }
  console.log('\nListo. Output:', OUT)
}

main().catch(e => { console.error(e); process.exit(1) })
