import Breadcrumb from "@/components/seo/Breadcrumb";
import { SITE_URL } from "@/lib/metadata";
import { getAgregadoTaller } from "@/lib/seo";

export const metadata = {
  title: "Sobre DoctorCar | Taller de Chapa y Pintura en Rosario",
  description:
    "Quiénes somos: taller especializado en chapa, pintura y reparación de siniestros en Rosario. Equipo, dirección y trayectoria.",
  alternates: { canonical: `${SITE_URL}/sobre-doctorcar` },
};

export default function SobrePage() {
  const agregado = getAgregadoTaller();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Sobre DoctorCar" }]}
      />
      <h1 className="text-4xl font-bold mb-6">Sobre DoctorCar</h1>

      <p className="text-lg text-gray-700 mb-6">
        DoctorCar es un taller de chapa y pintura ubicado en Rosario,
        especializado en reparación de siniestros y gestión integral con
        aseguradoras. Atendemos toda la zona metropolitana de Rosario.
      </p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-3xl font-bold">
            +{agregado.vehiculos_reparados_total}
          </div>
          <div className="text-sm text-gray-600">Vehículos reparados</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-3xl font-bold">
            {agregado.calificacion_google}
          </div>
          <div className="text-sm text-gray-600">en Google</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-3xl font-bold">
            {agregado.tiempo_promedio_reparacion_dias}d
          </div>
          <div className="text-sm text-gray-600">Tiempo promedio</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-3xl font-bold">
            {Math.round(
              agregado.porcentaje_gestion_directa_aseguradora * 100
            )}
            %
          </div>
          <div className="text-sm text-gray-600">Gestión directa</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dirección</h2>
        <address className="not-italic text-gray-700">
          {/* TODO: completar con dirección real */}
          <strong>DoctorCar</strong>
          <br />
          [Calle y número], Rosario, Santa Fe
          <br />
          Tel: +54 9 341 XXX-XXXX
          <br />
          Email: contacto@doctorcar.com.ar
          <br />
          Lunes a Viernes: 8:00 — 18:00
        </address>
      </section>
    </main>
  );
}
