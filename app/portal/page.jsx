"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signIn, signOut } from "next-auth/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  FileCheck, 
  Clock, 
  Shield, 
  CheckCircle, 
  LogOut, 
  Menu, 
  X,
  Car,
  Calendar,
  FileText,
  MessageCircle,
  ChevronRight,
  Phone,
  MapPin,
  Users,
  Star,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PortalHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAvatar = (user) => {
    if (user?.profile_image) {
      return user.profile_image;
    }
    if (!user?.email) return null;
    return `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`;
  };

  useEffect(() => {
    db.initialize();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "employee") {
        router.push("/employee");
      } else if (user.role === "client") {
        router.push("/client");
      }
    }
  }, [user, router]);

  const features = [
    {
      icon: Car,
      title: "Seguimiento en Tiempo Real",
      description: "Conoce el estado de tu vehiculo en cada etapa del proceso de reparacion."
    },
    {
      icon: Calendar,
      title: "Gestion de Turnos",
      description: "Agenda y administra tus turnos de forma rapida y sencilla."
    },
    {
      icon: FileText,
      title: "Reclamos y Siniestros",
      description: "Gestiona tus reclamos con aseguradoras desde un solo lugar."
    },
    {
      icon: MessageCircle,
      title: "Comunicacion Directa",
      description: "Chatea con nuestro equipo y recibe notificaciones de avances."
    }
  ];

  const stats = [
    { value: "+300", label: "Vehiculos Reparados" },
    { value: "4.9", label: "Calificacion Promedio" },
    { value: "24hs", label: "Respuesta Garantizada" },
    { value: "15+", label: "Anos de Experiencia" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">DOCTORCAR</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/chapa-pintura-rosario" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Servicios
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Funciones
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.email && (
                    <Image
                      src={getAvatar(user) || "/placeholder.svg"}
                      alt={user.name || "Perfil"}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-primary/20"
                    />
                  )}
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Cerrar sesion"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => signIn("auth0")}
                >
                  Iniciar Sesion
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => signIn("auth0")}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-card p-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                Inicio
              </Link>
              <Link href="/chapa-pintura-rosario" className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                Servicios
              </Link>
            </div>
            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3">
                    {user.email && (
                      <Image
                        src={getAvatar(user) || "/placeholder.svg"}
                        alt={user.name || "Perfil"}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-primary/20"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesion
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent"
                    onClick={() => signIn("auth0")}
                  >
                    Iniciar Sesion
                  </Button>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => signIn("auth0")}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>Portal de Clientes DoctorCar</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Gestiona tu vehiculo desde cualquier lugar
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto text-pretty">
              Accede a tu panel personal, gestiona reclamos, agenda turnos y sigue el estado de tu vehiculo en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!user && (
                <>
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8"
                    onClick={() => signIn("auth0")}
                  >
                    Acceder al Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-primary/30 hover:bg-primary/10 bg-transparent"
                    asChild
                  >
                    <a 
                      href="https://wa.me/5493415551234?text=Hola,%20quiero%20información%20sobre%20el%20portal"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contactar por WhatsApp
                    </a>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestro portal te ofrece todas las herramientas para gestionar tus vehiculos y servicios de forma eficiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona el portal
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En simples pasos, accede a todos nuestros servicios digitales.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Registrate", desc: "Crea tu cuenta en segundos con tu email o redes sociales." },
                { step: "2", title: "Accede al Panel", desc: "Ingresa a tu dashboard personalizado segun tu rol." },
                { step: "3", title: "Gestiona Todo", desc: "Turnos, reclamos, seguimiento y comunicacion en un solo lugar." }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Comienza a usar el portal hoy
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Registrate gratis y accede a todas las funcionalidades para gestionar tu vehiculo de forma simple y rapida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-card text-foreground hover:bg-card/90"
              onClick={() => signIn("auth0")}
            >
              Crear Cuenta Gratis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <Link href="/chapa-pintura-rosario">
                Ver Servicios
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">DOCTORCAR</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Taller especializado en chapa y pintura en Rosario. Mas de 15 anos de experiencia cuidando tu vehiculo.
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Rosario, Santa Fe, Argentina</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Inicio</Link></li>
                <li><Link href="/chapa-pintura-rosario" className="text-muted-foreground hover:text-primary transition-colors text-sm">Servicios</Link></li>
                <li><Link href="/portal" className="text-muted-foreground hover:text-primary transition-colors text-sm">Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  <span>+54 341 555-1234</span>
                </li>
                <li>
                  <a 
                    href="https://wa.me/5493415551234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DoctorCar. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/5493415551234?text=Hola,%20necesito%20información%20sobre%20el%20portal"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
