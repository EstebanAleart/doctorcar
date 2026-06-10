import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Shield,
  Wrench,
  FileText,
  Smartphone,
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  MessageCircle
} from "lucide-react"
import WhatsAppFloat from "@/components/seo/WhatsAppFloat"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-dc-blue/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="DoctorCar Logo" className="w-12 h-12 rounded shadow-sm object-contain bg-white border border-dc-navy/10" />
            <span className="text-2xl font-bold text-dc-navy tracking-tight">DOCTORCAR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#servicios" className="text-base font-medium text-dc-navy hover:text-dc-blue transition-colors">Servicios</Link>
            <Link href="#proceso" className="text-base font-medium text-dc-navy hover:text-dc-blue transition-colors">Proceso</Link>
            <Link href="#cobertura" className="text-base font-medium text-dc-navy hover:text-dc-blue transition-colors">Cobertura</Link>
            <Link href="#contacto" className="text-base font-medium text-dc-navy hover:text-dc-blue transition-colors">Contacto</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="https://newton-broker.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center text-sm font-medium border border-dc-navy text-dc-navy px-4 py-2 rounded-md hover:bg-dc-navy/5 transition cursor-pointer"
            >
              Acceder al Portal
            </Link>
            <Link
              href="https://wa.me/543412697000?text=Hola,%20me%20contacto%20desde%20la%20pagina%20principal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-dc-green text-white text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:brightness-110 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-linear-to-br from-dc-blue-light via-white to-[#d6eaf7]">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-dc-blue/10 text-dc-navy border-dc-blue/20">
              <MapPin className="w-3 h-3 mr-1" />
              Rosario, Santa Fe
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dc-navy mb-6 text-balance drop-shadow-sm">
              Taller de Chapa y Pintura en <span className="text-dc-blue">Rosario</span>
            </h1>
            <p className="text-lg md:text-xl text-dc-navy/80 mb-8 max-w-2xl mx-auto text-pretty">
              Especialistas en reparacion de siniestros, pintura automotor, carroceria y gestion integral con aseguradoras.<br />
              Presupuestos, turnos y seguimiento 100% online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="https://wa.me/543412697000?text=Hola,%20me%20contacto%20desde%20la%20pagina%20principal.%20Quiero%20un%20presupuesto"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-dc-green text-white text-lg font-semibold px-8 h-12 rounded-md shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                Presupuesto por WhatsApp
              </Link>
              <Link
                href="https://newton-broker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-dc-navy text-dc-navy bg-white text-lg font-semibold px-8 h-12 rounded-md hover:bg-dc-navy/10 transition cursor-pointer"
              >
                Ingresar al Portal
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-dc-blue/30 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-dc-navy">+300</p>
                <p className="text-sm text-dc-navy/60">Vehiculos reparados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-dc-navy/60">4.9 en Google</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-dc-navy">24hs</p>
                <p className="text-sm text-dc-navy/60">Presupuesto gratis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 md:py-28 bg-dc-blue-pale">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4 tracking-tight drop-shadow-sm">
              Servicios de Chapa y Pintura en <span className="text-dc-blue">Rosario</span>
            </h2>
            <p className="text-lg text-dc-navy/80 max-w-2xl mx-auto">
              Soluciones integrales para tu vehiculo con tecnologia de ultima generacion y tecnicos certificados
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <Wrench className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Chapa y Pintura</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Reparacion y pintura de carroceria con materiales premium y acabado de fabrica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Pintura poliuretanica
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Igualacion de color exacta
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Garantia de trabajo
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <Car className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Reparacion de Siniestros</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Especialistas en todo tipo de siniestros: choques, granizo y accidentes viales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Abolladuras y golpes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Danos por granizo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Reparacion integral
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <Shield className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Gestion con Aseguradoras</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Nos encargamos de todo el tramite con tu compania de seguros. Trabajamos con todas las aseguradoras del pais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Gestion de reclamos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Coordinacion de peritajes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Facturacion directa
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <FileText className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Presupuestos Online</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Recibi tu presupuesto detallado en menos de 24 horas sin cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Sin compromiso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Detalle de trabajos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Precios transparentes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <Smartphone className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Seguimiento Digital</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Segui el estado de tu vehiculo en tiempo real desde nuestro portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Portal web 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Fotos del avance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Notificaciones
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-dc-blue/40 hover:border-dc-navy bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-dc-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-dc-blue/20 transition-colors">
                  <Wrench className="w-6 h-6 text-dc-navy" />
                </div>
                <CardTitle className="text-dc-navy font-semibold">Enderezado de Carroceria</CardTitle>
                <CardDescription className="text-dc-navy/80">
                  Recuperamos la estructura original de tu vehiculo con equipamiento especializado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-dc-navy/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Bancada de enderezado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Medicion electronica
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dc-blue" />
                    Garantia estructural
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="py-20 md:py-28 bg-dc-blue-pale">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4 tracking-tight drop-shadow-sm">
              Proceso <span className="text-dc-blue">Simple</span> y Transparente
            </h2>
            <p className="text-lg text-dc-navy/80 max-w-2xl mx-auto">
              Reparamos tu vehiculo en 4 simples pasos con total transparencia
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Carga del Siniestro",
                description: "Envianos fotos y detalles de los danos por WhatsApp o el portal"
              },
              {
                step: "02",
                title: "Presupuesto",
                description: "Recibis un presupuesto detallado en menos de 24 horas"
              },
              {
                step: "03",
                title: "Reparacion",
                description: "Coordinamos el turno y reparamos tu vehiculo con garantia"
              },
              {
                step: "04",
                title: "Entrega",
                description: "Te avisamos cuando este listo y coordinamos la entrega"
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-6 h-full border border-dc-blue/40 hover:border-dc-navy transition-colors shadow-sm">
                  <span className="text-5xl font-bold text-dc-blue/40">{item.step}</span>
                  <h3 className="text-xl font-semibold text-dc-navy mt-4 mb-2">{item.title}</h3>
                  <p className="text-dc-navy/80">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-dc-blue/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MiSeguro Banner */}
      <section className="py-12 bg-linear-to-r from-dc-navy to-dc-blue">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-white" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Necesitas un seguro? Cotiza online
            </h2>
          </div>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Auto-cotizacion, auto-emision, mejores precios del mercado y dashboard completo en{" "}
            <a href="https://miseguro.com.ar" target="_blank" rel="noopener noreferrer" className="text-white font-semibold underline underline-offset-2">
              miseguro.com.ar
            </a>
          </p>
          <a
            href="https://miseguro.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-dc-navy font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition shadow-md text-lg"
          >
            Cotizar ahora
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Zona de Cobertura */}
      <section id="cobertura" className="py-20 md:py-28 bg-dc-blue-pale">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dc-navy mb-4 tracking-tight drop-shadow-sm">
                Zona de Cobertura en <span className="text-dc-blue">Rosario</span> y Alrededores
              </h2>
              <p className="text-lg text-dc-navy/80 mb-6">
                Atendemos toda la zona metropolitana de Rosario, Santa Fe. Si tenes un siniestro o necesitas reparar tu vehiculo, estamos cerca de vos.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "Rosario Centro",
                  "Rosario Norte",
                  "Rosario Sur",
                  "Funes",
                  "Granadero Baigorria",
                  "Villa Gobernador Galvez",
                  "Perez",
                  "Soldini"
                ].map((zone) => (
                  <div key={zone} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-dc-blue" />
                    <span className="text-dc-navy font-medium">{zone}</span>
                  </div>
                ))}
              </div>
              <Link
                href="https://wa.me/543412697000?text=Hola,%20me%20contacto%20desde%20la%20pagina%20principal.%20Quiero%20saber%20si%20llegan%20a%20mi%20zona"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-dc-navy text-white font-semibold px-6 py-3 rounded-md shadow-md hover:bg-dc-blue transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Consulta por tu zona
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden border border-dc-blue/30 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106973.8597889927!2d-60.73975!3d-32.94682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b6539335d7d75b%3A0xec4086e90258a557!2sRosario%2C%20Santa%20Fe!5e0!3m2!1ses-419!2sar!4v1706000000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicacion DoctorCar en Rosario, Santa Fe"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-dc-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Listo para reparar tu vehiculo?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Presupuesto sin cargo en menos de 24 horas. Contactanos ahora y te asesoramos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/543412697000?text=Hola,%20me%20contacto%20desde%20la%20pagina%20principal.%20Quiero%20un%20presupuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-dc-green text-white text-lg font-semibold px-8 h-12 rounded-lg shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              Presupuesto por WhatsApp
            </Link>
            <Link
              href="https://newton-broker.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white text-lg font-semibold px-8 h-12 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              Ingresar al Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Contacto / Footer */}
      <footer id="contacto" className="py-16 bg-dc-navy text-white">
        <div className="container mx-auto px-4">
          {/* MiSeguro mini-banner */}
          <div className="bg-white/10 rounded-xl p-4 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-dc-blue" />
              <p className="text-sm">
                Cotiza tu seguro en{" "}
                <a href="https://miseguro.com.ar" target="_blank" rel="noopener noreferrer" className="text-dc-blue font-semibold hover:underline">
                  miseguro.com.ar
                </a>
                {" "}&mdash; auto-cotizacion, mejores precios, dashboard completo
              </p>
            </div>
            <a
              href="https://miseguro.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-dc-blue hover:underline whitespace-nowrap"
            >
              Cotizar ahora &rarr;
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="DoctorCar Logo" className="w-12 h-12 rounded shadow-sm object-contain bg-white border border-white/20" />
                <span className="text-2xl font-bold tracking-tight">DOCTORCAR</span>
              </Link>
              <p className="text-white/70 mb-4">
                Taller de chapa y pintura en Rosario. Especialistas en reparacion de siniestros y gestion con aseguradoras.
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-white/50 ml-2 text-sm">4.9 en Google</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/chapa-y-pintura" className="text-white/70 hover:text-dc-blue transition-colors">
                    Chapa y Pintura
                  </Link>
                </li>
                <li>
                  <Link href="/siniestros" className="text-white/70 hover:text-dc-blue transition-colors">
                    Siniestros
                  </Link>
                </li>
                <li>
                  <Link href="/granizo" className="text-white/70 hover:text-dc-blue transition-colors">
                    Granizo
                  </Link>
                </li>
                <li>
                  <Link href="/pintura-automotor" className="text-white/70 hover:text-dc-blue transition-colors">
                    Pintura Automotor
                  </Link>
                </li>
                <li>
                  <Link href="/abolladuras-sin-pintura" className="text-white/70 hover:text-dc-blue transition-colors">
                    Abolladuras sin Pintura
                  </Link>
                </li>
                <li>
                  <Link href="/aseguradoras" className="text-white/70 hover:text-dc-blue transition-colors">
                    Aseguradoras
                  </Link>
                </li>
                <li>
                  <Link href="/zonas" className="text-white/70 hover:text-dc-blue transition-colors">
                    Zonas
                  </Link>
                </li>
                <li>
                  <a href="https://miseguro.com.ar" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-dc-blue transition-colors">
                    Cotizar Seguro Online
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <address className="not-italic space-y-3 text-white/70">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-dc-blue" />
                  <span>9 de julio 4231, Rosario, Santa Fe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-dc-blue" />
                  <a href="tel:+543412697000" className="hover:text-white transition-colors">
                    341 269-7000
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-dc-blue" />
                  <span>Lun-Vie: 8:00 - 18:00</span>
                </div>
              </address>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm space-y-1">
            <p>&copy; {new Date().getFullYear()} DoctorCar. Todos los derechos reservados. Rosario, Santa Fe, Argentina.</p>
            <p>
              Potenciado por{" "}
              <a
                href="https://www.pairprogramming.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dc-blue hover:text-white transition-colors"
              >
                pairprogramming
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloat />

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            "name": "DoctorCar - Taller de Chapa y Pintura",
            "description": "Taller de chapa y pintura en Rosario especializado en reparacion de siniestros, pintura automotor y gestion con aseguradoras.",
            "image": "https://doctorcar.com.ar/og-image.jpg",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "9 de julio 4231",
              "addressLocality": "Rosario",
              "addressRegion": "Santa Fe",
              "postalCode": "2000",
              "addressCountry": "AR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -32.94682,
              "longitude": -60.63932
            },
            "url": "https://doctorcar.com.ar",
            "telephone": "+543412697000",
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "18:00"
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "127"
            },
            "areaServed": [
              { "@type": "City", "name": "Rosario" },
              { "@type": "City", "name": "Funes" },
              { "@type": "City", "name": "Granadero Baigorria" },
              { "@type": "City", "name": "Villa Gobernador Galvez" }
            ],
            "priceRange": "$$",
            "sameAs": [
              "https://wa.me/543412697000"
            ]
          })
        }}
      />
    </main>
  )
}
