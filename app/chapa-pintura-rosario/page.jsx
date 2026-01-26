import { Phone, MapPin, Clock, CheckCircle2, Shield, Car, Wrench, Sparkles, Users, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Taller de Chapa y Pintura en Rosario | DoctorCar - Reparación de Siniestros",
  description:
    "Taller especializado en chapa y pintura en Rosario, Santa Fe. Reparación de siniestros, pintura automotor, carrocería y gestión con aseguradoras. Presupuestos gratis en 24hs.",
  keywords: [
    "taller de chapa y pintura rosario",
    "reparación de siniestros rosario",
    "pintura automotor rosario",
    "carrocería rosario",
    "arreglo de golpes rosario",
    "taller aseguradoras rosario",
    "enderezado chasis rosario",
    "reparación granizo rosario",
    "taller chapa rosario santa fe"
  ],
  openGraph: {
    title: "Taller de Chapa y Pintura en Rosario | DoctorCar",
    description: "Especialistas en reparación de siniestros, pintura automotor y gestión con aseguradoras en Rosario, Santa Fe.",
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://doctorcar.com.ar/chapa-pintura-rosario",
  },
}

const servicios = [
  {
    icon: Wrench,
    title: "Reparación de golpes y abolladuras",
    description: "Eliminamos abolladuras y golpes con técnicas profesionales de enderezado."
  },
  {
    icon: Car,
    title: "Enderezado de carrocería y estructura",
    description: "Diagnóstico estructural y enderezado de chasis con equipos de precisión."
  },
  {
    icon: Sparkles,
    title: "Pintura completa y parcial",
    description: "Pintura en cabina presurizada con terminación de calidad original."
  },
  {
    icon: CheckCircle2,
    title: "Pulido y terminación estética",
    description: "Pulido profesional para recuperar el brillo original de tu vehículo."
  },
  {
    icon: FileCheck,
    title: "Reemplazo y alineación de piezas",
    description: "Instalación de repuestos originales y alternativos con garantía."
  },
  {
    icon: Shield,
    title: "Gestión con compañías de seguros",
    description: "Tramitamos tu siniestro con todas las aseguradoras del mercado."
  }
]

const faqs = [
  {
    question: "¿Cuánto tiempo demora la reparación de chapa y pintura?",
    answer: "El tiempo varía según el daño. Reparaciones menores pueden completarse en 2-3 días, mientras que siniestros mayores pueden requerir 7-15 días hábiles. Te damos un estimado preciso al evaluar tu vehículo."
  },
  {
    question: "¿Trabajan con todas las compañías de seguros?",
    answer: "Sí, gestionamos reparaciones con todas las aseguradoras del mercado argentino: La Segunda, Federación Patronal, Sancor, Mapfre, Allianz, Zurich, entre otras."
  },
  {
    question: "¿Ofrecen garantía en los trabajos de pintura?",
    answer: "Todos nuestros trabajos de pintura tienen garantía escrita. Utilizamos pinturas de primera calidad y cabina presurizada para asegurar una terminación duradera."
  },
  {
    question: "¿Puedo seguir el estado de mi reparación online?",
    answer: "Sí, contamos con un portal online donde podés cargar tu siniestro, recibir presupuestos y seguir el estado de la reparación en tiempo real."
  },
  {
    question: "¿Qué zonas cubren en Rosario?",
    answer: "Atendemos Rosario y zonas cercanas: Funes, Granadero Baigorria, Villa Gobernador Gálvez, Pérez, Soldini y toda el área metropolitana."
  }
]

const zonas = [
  "Rosario Centro",
  "Funes",
  "Granadero Baigorria",
  "Villa Gobernador Gálvez",
  "Pérez",
  "Soldini",
  "Fisherton",
  "Alberdi"
]

export default function ChapaPinturaRosario() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoBodyShop",
    "name": "DoctorCar - Taller de Chapa y Pintura",
    "description": "Taller especializado en chapa y pintura en Rosario. Reparación de siniestros, pintura automotor y gestión con aseguradoras.",
    "url": "https://doctorcar.com.ar/chapa-pintura-rosario",
    "telephone": "+54 341 555-1234",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Ejemplo 1234",
      "addressLocality": "Rosario",
      "addressRegion": "Santa Fe",
      "postalCode": "2000",
      "addressCountry": "AR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-32.9442",
      "longitude": "-60.6505"
    },
    "areaServed": [
      { "@type": "City", "name": "Rosario" },
      { "@type": "City", "name": "Funes" },
      { "@type": "City", "name": "Granadero Baigorria" },
      { "@type": "City", "name": "Villa Gobernador Gálvez" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "13:00"
      }
    ],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
    }
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/10 via-white to-secondary/10 border-b border-primary/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.jpeg" alt="DoctorCar Logo" className="w-14 h-14 rounded shadow-sm object-contain bg-white" />
              <span className="text-3xl font-bold text-primary tracking-tight">DOCTORCAR</span>
              <span className="ml-4 flex items-center gap-2 text-base text-muted-foreground"><MapPin className="h-4 w-4" />Rosario, Santa Fe</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance drop-shadow-sm">
              Taller de Chapa y Pintura en Rosario
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl opacity-95 leading-relaxed">
              En <strong>DoctorCar</strong> somos especialistas en <strong>reparación de vehículos siniestrados</strong>, trabajos de carrocería, pintura automotor y gestión integral de reclamos con compañías de seguros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md">
                <a href="https://wa.me/5493415551234?text=Hola,%20quiero%20un%20presupuesto" target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-4 w-4" />
                  Presupuesto por WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary bg-white hover:bg-primary/10 font-semibold">
                <Link href="/portal">
                  Iniciar Reclamo Online
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span>Presupuestos gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span>Respuesta en 24hs</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <span>Garantía escrita</span>
              </div>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
              Especialistas en reparación de siniestros en Rosario
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Atendemos todo tipo de daños producto de <strong>choques, roces, granizo y accidentes viales</strong>. 
              Realizamos diagnóstico estructural, enderezado de chasis, reemplazo de piezas, 
              preparación de superficies y pintura en cabina presurizada para lograr terminaciones 
              de calidad original.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Con más de <strong>15 años de experiencia</strong> en el rubro automotor, nuestro equipo 
              técnico está capacitado para trabajar con todas las marcas y modelos del mercado argentino.
            </p>
          </div>
        </section>

        {/* Servicios Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
              Servicios de chapa y pintura automotor
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Ofrecemos soluciones completas para la reparación y restauración de tu vehículo.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio, index) => (
                <article 
                  key={index}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <servicio.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{servicio.title}</h3>
                  <p className="text-muted-foreground text-sm">{servicio.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
              Taller de carrocería en Rosario con seguimiento online
            </h2>
            <p className="text-muted-foreground mb-10 max-w-3xl text-lg leading-relaxed">
              En DoctorCar combinamos la experiencia de taller tradicional con tecnología. 
              Nuestros clientes pueden cargar su siniestro, recibir presupuestos y seguir el 
              estado de la reparación en tiempo real a través de nuestro portal online.
            </p>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Cargá tu siniestro", desc: "Subí fotos del daño desde cualquier dispositivo" },
                { step: "2", title: "Recibí presupuesto", desc: "Te enviamos cotización en menos de 24 horas" },
                { step: "3", title: "Coordinamos retiro", desc: "Buscamos tu vehículo o lo traés al taller" },
                { step: "4", title: "Seguí el avance", desc: "Monitoreá la reparación en tiempo real" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Aseguradoras Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
              Atención a particulares y aseguradoras en Rosario
            </h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed max-w-3xl">
              Trabajamos tanto con clientes particulares como con compañías de seguros, 
              gestionando presupuestos, aprobaciones y reparaciones bajo estándares profesionales, 
              reduciendo tiempos y asegurando transparencia en cada etapa del proceso.
            </p>
            
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">Trabajamos con las principales aseguradoras:</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {["La Segunda", "Federación Patronal", "Sancor Seguros", "Mapfre", "Allianz", "Zurich", "Rivadavia", "San Cristóbal"].map((aseg, i) => (
                <span 
                  key={i}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground"
                >
                  {aseg}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Zona de Cobertura Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
              Zona de cobertura en Rosario y alrededores
            </h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Nuestro taller de chapa y pintura presta servicios en Rosario y zonas cercanas, 
              atendiendo vehículos particulares, flotas y siniestros asegurados.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {zonas.map((zona, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-foreground"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{zona}</span>
                </div>
              ))}
            </div>
            
            <div className="rounded-lg overflow-hidden border border-border h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106948.41625705942!2d-60.73969645!3d-32.9587022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b6539335d7d75b%3A0xec4086e90258a557!2sRosario%2C%20Santa%20Fe%2C%20Argentina!5e0!3m2!1ses!2sus!4v1706097600000!5m2!1ses!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de DoctorCar en Rosario, Santa Fe"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-foreground">
              Preguntas frecuentes sobre chapa y pintura
            </h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <article 
                  key={index}
                  className="bg-card p-6 rounded-lg border border-border"
                >
                  <h3 className="font-semibold text-lg mb-3 text-foreground">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Tuviste un siniestro en Rosario?
            </h2>
            <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
              Contactanos y te asesoramos sin cargo. Podés iniciar tu reclamo online y 
              coordinar la reparación de tu vehículo con nuestro equipo especializado en 
              chapa y pintura automotor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link href="/portal">
                  Iniciar Reclamo en DoctorCar
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                <a 
                  href="https://wa.me/5493415551234?text=Hola%2C%20necesito%20un%20presupuesto%20de%20chapa%20y%20pintura"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Breadcrumb / Footer info */}
        <section className="py-8 bg-card border-t border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
                <li>/</li>
                <li className="text-foreground">Chapa y Pintura Rosario</li>
              </ol>
            </nav>
          </div>
        </section>
      </main>
    </>
  )
}
