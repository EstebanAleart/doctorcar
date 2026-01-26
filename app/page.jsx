
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Taller de Chapa y Pintura en Rosario | DoctorCar",
  description:
    "Reparación de siniestros, pintura automotor, carrocería y gestión con aseguradoras en Rosario. Presupuestos, turnos y seguimiento online.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/whatsapp-20image-202025-12-29-20at-2000.jpeg"
            alt="DOCTORCAR"
            width={48}
            height={48}
            className="object-contain rounded"
          />
          <span className="text-2xl font-bold text-[#1a4d6d]">DOCTORCAR</span>
        </div>
        <nav className="mt-4 sm:mt-0 flex gap-4">
          <Link href="/chapa-pintura-rosario" className="text-[#1a4d6d] hover:underline">Chapa y Pintura</Link>
          <Link href="/siniestros-rosario" className="text-[#1a4d6d] hover:underline">Siniestros</Link>
          <Link href="/portal" className="bg-[#1a4d6d] text-white px-4 py-2 rounded hover:bg-[#2d6a8f] font-semibold">Acceder al Portal</Link>
        </nav>
      </header>
      <section className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="mb-6 text-4xl md:text-5xl font-bold text-[#1a4d6d]">Taller de Chapa y Pintura en Rosario</h1>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Reparación de siniestros, pintura automotor, carrocería y gestión con aseguradoras en Rosario. Presupuestos, turnos y seguimiento online.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/chapa-pintura-rosario" className="bg-[#1a4d6d] text-white px-5 py-3 rounded hover:bg-[#2d6a8f] font-semibold">Ver servicios de Chapa y Pintura</Link>
          <Link href="/siniestros-rosario" className="bg-[#6cb4d8] text-white px-5 py-3 rounded hover:bg-[#1a4d6d] font-semibold">Reparar Siniestro</Link>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">Servicios</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li>Chapa y pintura automotor</li>
          <li>Reparación de siniestros y golpes</li>
          <li>Gestión con aseguradoras</li>
          <li>Presupuestos y turnos online</li>
          <li>Seguimiento digital del trabajo</li>
        </ul>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">Siniestros</h2>
        <p className="mb-4 text-lg">Especialistas en reparación de vehículos siniestrados, abolladuras, granizo y accidentes viales. Trabajamos con todas las compañías de seguros.</p>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">Aseguradoras</h2>
        <p className="mb-4 text-lg">Gestión integral de reclamos y trámites con aseguradoras como La Caja, Sancor, Allianz y Federación Patronal.</p>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">Proceso</h2>
        <ol className="list-decimal pl-6 space-y-2 text-lg">
          <li>Solicitá presupuesto online</li>
          <li>Coordiná turno y llevá tu vehículo</li>
          <li>Seguimiento digital y entrega</li>
        </ol>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">Zona de cobertura</h2>
        <p className="mb-4 text-lg">Rosario, Funes, Granadero Baigorria, Villa Gobernador Gálvez y alrededores.</p>
      </section>
      <section className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#1a4d6d]">¿Listo para reparar tu vehículo?</h2>
        <p className="mb-6 text-lg">Contactanos y te asesoramos sin cargo. Ingresá al portal para iniciar tu reclamo online.</p>
        <Link href="/portal" className="inline-block bg-[#1a4d6d] text-white px-6 py-3 rounded hover:bg-[#2d6a8f] font-semibold">Ingresar al Sistema</Link>
      </section>
      {/* SEO JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoBodyShop",
            "name": "DoctorCar",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Rosario",
              "addressRegion": "Santa Fe",
              "addressCountry": "AR"
            },
            "areaServed": "Rosario",
            "url": "https://doctorcar.com.ar",
            "sameAs": [
              "https://wa.me/34673782934"
            ]
          })
        }}
      />
    </main>
  );
}