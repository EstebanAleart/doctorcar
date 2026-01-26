import Link from "next/link"
import { Button } from "@/components/ui/button"
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="DoctorCar Logo" className="w-12 h-12 rounded shadow-sm object-contain bg-white border border-[#1a4d6d]/10" />
            <span className="text-2xl font-bold text-[#1a4d6d] tracking-tight">DOCTORCAR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#servicios" className="text-base font-medium text-[#1a4d6d] hover:text-[#6cb4d8] transition-colors">Servicios</Link>
            <Link href="#proceso" className="text-base font-medium text-[#1a4d6d] hover:text-[#6cb4d8] transition-colors">Proceso</Link>
            <Link href="#cobertura" className="text-base font-medium text-[#1a4d6d] hover:text-[#6cb4d8] transition-colors">Cobertura</Link>
            <Link href="#contacto" className="text-base font-medium text-[#1a4d6d] hover:text-[#6cb4d8] transition-colors">Contacto</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="hidden sm:flex border-[#1a4d6d] text-[#1a4d6d] hover:bg-[#1a4d6d]/10">
              <Link href="/portal">Acceder al Portal</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-md">
              <Link href="https://wa.me/34673782934?text=Hola,%20quiero%20un%20presupuesto" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#eaf3fa] via-white to-[#d6eaf7]">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-[#6cb4d8]/10 text-[#1a4d6d] border-[#6cb4d8]/20">
              <MapPin className="w-3 h-3 mr-1" />
              Rosario, Santa Fe
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a4d6d] mb-6 text-balance drop-shadow-sm">
              Taller de Chapa y Pintura en <span className="text-[#6cb4d8]">Rosario</span>
            </h1>
            <p className="text-lg md:text-xl text-[#1a4d6d]/80 mb-8 max-w-2xl mx-auto text-pretty">
              Especialistas en reparación de siniestros, pintura automotor, carrocería y gestión integral con aseguradoras.<br />
              Presupuestos, turnos y seguimiento 100% online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 shadow-md">
                <Link href="https://wa.me/34673782934?text=Hola,%20quiero%20un%20presupuesto" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Presupuesto por WhatsApp
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 border-[#1a4d6d] text-[#1a4d6d] bg-white hover:bg-[#1a4d6d]/10">
                <Link href="/portal">
                  Ingresar al Portal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-[#6cb4d8]/30 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">+300</p>
                <p className="text-sm text-muted-foreground">Vehículos reparados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">4.9 en Google</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">24hs</p>
                <p className="text-sm text-muted-foreground">Presupuesto gratis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aseguradoras */}
      <section className="py-12 bg-[#f4fafd] border-y border-[#6cb4d8]/30" id="aseguradoras">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">Trabajamos con las principales aseguradoras</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {["La Caja", "Sancor", "Allianz", "Federación Patronal", "Zurich", "San Cristóbal"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-muted-foreground/70 hover:text-primary transition-colors">
                <Shield className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a4d6d] mb-4 tracking-tight drop-shadow-sm">
              Servicios de Chapa y Pintura en <span className="text-[#6cb4d8]">Rosario</span>
            </h2>
            <p className="text-lg text-[#1a4d6d]/80 max-w-2xl mx-auto">
              Soluciones integrales para tu vehículo con tecnología de última generación y técnicos certificados
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-[#6cb4d8]/40 hover:border-[#1a4d6d] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#eaf3fa] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#6cb4d8]/20 transition-colors">
                  <Wrench className="w-6 h-6 text-[#1a4d6d]" />
                </div>
                <CardTitle className="text-[#1a4d6d] font-semibold">Chapa y Pintura</CardTitle>
                <CardDescription className="text-[#1a4d6d]/80">
                  Reparación y pintura de carrocería con materiales premium y acabado de fábrica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#1a4d6d]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Pintura poliuretánica
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Igualación de color exacta
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Garantía de trabajo
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-[#6cb4d8]/40 hover:border-[#1a4d6d] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#eaf3fa] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#6cb4d8]/20 transition-colors">
                  <Car className="w-6 h-6 text-[#1a4d6d]" />
                </div>
                <CardTitle className="text-[#1a4d6d] font-semibold">Reparación de Siniestros</CardTitle>
                <CardDescription className="text-[#1a4d6d]/80">
                  Especialistas en todo tipo de siniestros: choques, granizo y accidentes viales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#1a4d6d]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Abolladuras y golpes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Daños por granizo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Reparación integral
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-[#6cb4d8]/40 hover:border-[#1a4d6d] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#eaf3fa] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#6cb4d8]/20 transition-colors">
                  <Shield className="w-6 h-6 text-[#1a4d6d]" />
                </div>
                <CardTitle className="text-[#1a4d6d] font-semibold">Gestión con Aseguradoras</CardTitle>
                <CardDescription className="text-[#1a4d6d]/80">
                  Nos encargamos de todo el trámite con tu compañía de seguros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#1a4d6d]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Gestión de reclamos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Coordinación de peritajes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Facturación directa
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-[#6cb4d8]/40 hover:border-[#1a4d6d] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#eaf3fa] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#6cb4d8]/20 transition-colors">
                  <FileText className="w-6 h-6 text-[#1a4d6d]" />
                </div>
                <CardTitle className="text-[#1a4d6d] font-semibold">Presupuestos Online</CardTitle>
                <CardDescription className="text-[#1a4d6d]/80">
                  Recibí tu presupuesto detallado en menos de 24 horas sin cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#1a4d6d]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Sin compromiso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Detalle de trabajos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6cb4d8]" />
                    Precios transparentes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Seguimiento Digital</CardTitle>
                <CardDescription>
                  Seguí el estado de tu vehículo en tiempo real desde nuestro portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Portal web 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Fotos del avance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Notificaciones
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Enderezado de Carrocería</CardTitle>
                <CardDescription>
                  Recuperamos la estructura original de tu vehículo con equipamiento especializado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Bancada de enderezado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Medición electrónica
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Garantía estructural
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a4d6d] mb-4 tracking-tight drop-shadow-sm">
              Proceso <span className="text-[#6cb4d8]">Simple</span> y Transparente
            </h2>
            <p className="text-lg text-[#1a4d6d]/80 max-w-2xl mx-auto">
              Reparamos tu vehículo en 4 simples pasos con total transparencia
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Carga del Siniestro",
                description: "Envianos fotos y detalles de los daños por WhatsApp o el portal"
              },
              {
                step: "02",
                title: "Presupuesto",
                description: "Recibís un presupuesto detallado en menos de 24 horas"
              },
              {
                step: "03",
                title: "Reparación",
                description: "Coordinamos el turno y reparamos tu vehículo con garantía"
              },
              {
                step: "04",
                title: "Entrega",
                description: "Te avisamos cuando esté listo y coordinamos la entrega"
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-6 h-full border border-[#6cb4d8]/40 hover:border-[#1a4d6d] transition-colors shadow-sm">
                  <span className="text-5xl font-bold text-[#6cb4d8]/40">{item.step}</span>
                  <h3 className="text-xl font-semibold text-[#1a4d6d] mt-4 mb-2">{item.title}</h3>
                  <p className="text-[#1a4d6d]/80">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#6cb4d8]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zona de Cobertura */}
      <section id="cobertura" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a4d6d] mb-4 tracking-tight drop-shadow-sm">
                Zona de Cobertura en <span className="text-[#6cb4d8]">Rosario</span> y Alrededores
              </h2>
              <p className="text-lg text-[#1a4d6d]/80 mb-6">
                Atendemos toda la zona metropolitana de Rosario, Santa Fe. Si tenés un siniestro o necesitás reparar tu vehículo, estamos cerca de vos.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "Rosario Centro",
                  "Rosario Norte",
                  "Rosario Sur",
                  "Funes",
                  "Granadero Baigorria",
                  "Villa Gobernador Gálvez",
                  "Pérez",
                  "Soldini"
                ].map((zone) => (
                  <div key={zone} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6cb4d8]" />
                    <span className="text-[#1a4d6d] font-medium">{zone}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="bg-[#1a4d6d] hover:bg-[#6cb4d8] text-white font-semibold shadow-md">
                <Link href="https://wa.me/34673782934?text=Hola,%20quiero%20saber%20si%20llegan%20a%20mi%20zona" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Consultá por tu zona
                </Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden border border-[#6cb4d8]/30 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106973.8597889927!2d-60.73975!3d-32.94682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b6539335d7d75b%3A0xec4086e90258a557!2sRosario%2C%20Santa%20Fe!5e0!3m2!1ses-419!2sar!4v1706000000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación DoctorCar en Rosario, Santa Fe"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a4d6d] mb-4 tracking-tight drop-shadow-sm">
            ¿Listo para reparar tu vehículo?
          </h2>
          <p className="text-lg text-[#1a4d6d]/80 mb-8 max-w-2xl mx-auto">
            Presupuesto sin cargo en menos de 24 horas. Contactanos ahora y te asesoramos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 shadow-md">
              <Link href="https://wa.me/34673782934?text=Hola,%20quiero%20un%20presupuesto" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Presupuesto por WhatsApp
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-[#1a4d6d] text-[#1a4d6d] bg-white hover:bg-[#1a4d6d]/10 text-lg px-8">
              <Link href="/portal">
                Ingresar al Portal
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contacto / Footer */}
      <footer id="contacto" className="py-16 bg-white text-[#1a4d6d]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="DoctorCar Logo" className="w-12 h-12 rounded shadow-sm object-contain bg-white border border-[#1a4d6d]/10" />
                <span className="text-2xl font-bold text-[#1a4d6d] tracking-tight">DOCTORCAR</span>
              </Link>
              <p className="text-[#1a4d6d]/80 mb-4">
                Taller de chapa y pintura en Rosario. Especialistas en reparación de siniestros y gestión con aseguradoras.
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-[#1a4d6d]/60 ml-2 text-sm">4.9 en Google</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[#1a4d6d] mb-4">Servicios</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/chapa-pintura-rosario" className="text-[#1a4d6d]/70 hover:text-[#6cb4d8] transition-colors">
                    Chapa y Pintura
                  </Link>
                </li>
                <li>
                  <Link href="/siniestros-rosario" className="text-[#1a4d6d]/70 hover:text-[#6cb4d8] transition-colors">
                    Reparación de Siniestros
                  </Link>
                </li>
                <li>
                  <Link href="/portal" className="text-[#1a4d6d]/70 hover:text-[#6cb4d8] transition-colors">
                    Portal de Clientes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1a4d6d] mb-4">Contacto</h3>
              <address className="not-italic space-y-3 text-[#1a4d6d]/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6cb4d8]" />
                  <span>Rosario, Santa Fe, Argentina</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#6cb4d8]" />
                  <a href="tel:+34673782934" className="hover:text-[#1a4d6d] transition-colors">
                    +34 673 782 934
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#6cb4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                  <a href="mailto:doctorcar@gmail.com" className="hover:text-[#1a4d6d] transition-colors">doctorcar@gmail.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6cb4d8]" />
                  <span>Lun-Vie: 8:00 - 18:00</span>
                </div>
              </address>
            </div>
          </div>
          <div className="border-t border-[#6cb4d8]/20 pt-8 text-center text-[#1a4d6d]/50 text-sm">
            <p>© {new Date().getFullYear()} DoctorCar. Todos los derechos reservados. Rosario, Santa Fe, Argentina.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <Link
        href="https://wa.me/34673782934?text=Hola,%20quiero%20información"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </Link>

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoBodyShop",
            "name": "DoctorCar - Taller de Chapa y Pintura",
            "description": "Taller de chapa y pintura en Rosario especializado en reparación de siniestros, pintura automotor y gestión con aseguradoras.",
            "image": "https://doctorcar.com.ar/og-image.jpg",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Rosario",
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
            "telephone": "+34673782934",
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
              {
                "@type": "City",
                "name": "Rosario"
              },
              {
                "@type": "City",
                "name": "Funes"
              },
              {
                "@type": "City",
                "name": "Granadero Baigorria"
              },
              {
                "@type": "City",
                "name": "Villa Gobernador Gálvez"
              }
            ],
            "priceRange": "$$",
            "sameAs": [
              "https://wa.me/34673782934"
            ]
          })
        }}
      />
    </main>
  )
}
