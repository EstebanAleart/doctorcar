export const metadata = {
  title: "Taller de Chapa y Pintura en Rosario | DoctorCar – Reparación de Siniestros",
  description:
    "DoctorCar es un taller de chapa y pintura en Rosario especializado en reparación de siniestros, pintura automotor y trabajos de carrocería para particulares y aseguradoras.",
  keywords: [
    "taller de chapa y pintura rosario",
    "reparación de siniestros rosario",
    "pintura automotor rosario",
    "carrocería rosario",
    "arreglo de golpes rosario",
    "taller aseguradoras rosario"
  ]
};

export default function ChapaPinturaRosario() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1a4d6d]">
        Taller de Chapa y Pintura en Rosario
      </h1>

      <p className="text-lg mb-6">
        En <strong>DoctorCar</strong> somos un taller especializado en chapa y pintura en Rosario,
        enfocados en la <strong>reparación de vehículos siniestrados</strong>, trabajos de
        carrocería, pintura automotor y gestión integral de reclamos con compañías de seguros.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Especialistas en reparación de siniestros
      </h2>
      <p className="mb-4">
        Atendemos todo tipo de daños producto de choques, roces, granizo y accidentes viales.
        Realizamos diagnóstico estructural, enderezado de chasis, reemplazo de piezas,
        preparación de superficies y pintura en cabina presurizada para lograr terminaciones
        de calidad original.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Servicios de chapa y pintura automotor
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Reparación de golpes y abolladuras</li>
        <li>Enderezado de carrocería y estructura</li>
        <li>Pintura completa y parcial</li>
        <li>Pulido y terminación estética</li>
        <li>Reemplazo y alineación de piezas</li>
        <li>Trabajos para compañías de seguros</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Taller de carrocería en Rosario con seguimiento online
      </h2>
      <p className="mb-4">
        En DoctorCar combinamos la experiencia de taller tradicional con tecnología.
        Nuestros clientes pueden cargar su siniestro, recibir presupuestos y seguir el
        estado de la reparación en tiempo real a través de nuestro portal online.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Atención a particulares y aseguradoras
      </h2>
      <p className="mb-4">
        Trabajamos tanto con clientes particulares como con compañías de seguros,
        gestionando presupuestos, aprobaciones y reparaciones bajo estándares profesionales,
        reduciendo tiempos y asegurando transparencia en cada etapa del proceso.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Zona de cobertura
      </h2>
      <p className="mb-4">
        Nuestro taller de chapa y pintura presta servicios en Rosario y zonas cercanas
        como Funes, Granadero Baigorria y Villa Gobernador Gálvez, atendiendo vehículos
        particulares, flotas y siniestros asegurados.
      </p>

      <div className="mt-12 p-6 bg-muted/40 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">
          ¿Tuviste un siniestro en Rosario?
        </h3>
        <p className="mb-4">
          Contactanos y te asesoramos sin cargo. Podés iniciar tu reclamo online y
          coordinar la reparación de tu vehículo con un equipo especializado en
          chapa y pintura automotor.
        </p>
        <a
          href="/portal"
          className="inline-block bg-[#1a4d6d] text-white px-5 py-3 rounded hover:bg-[#2d6a8f]"
        >
          Iniciar Reclamo en DoctorCar
        </a>
      </div>
    </main>
  );
}
