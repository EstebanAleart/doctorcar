import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { SITE_URL } from "@/lib/metadata";
import { getAgregadoTaller } from "@/lib/seo";

export const metadata = {
  title: "Sobre DoctorCar | Taller de Chapa y Pintura en Rosario",
  description:
    "Quienes somos: taller especializado en chapa, pintura y reparacion de siniestros en Rosario. Equipo, direccion y trayectoria.",
  alternates: { canonical: `${SITE_URL}/sobre-doctorcar` },
};

export default function SobrePage() {
  const agregado = getAgregadoTaller();

  return (
    <SeoPageLayout>
      <Breadcrumb
        items={[{ name: "Inicio", url: "/" }, { name: "Sobre DoctorCar" }]}
      />
      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-6">
        Sobre DoctorCar
      </h1>

      <p className="text-lg text-dc-navy/80 mb-8">
        DoctorCar es un taller de chapa y pintura ubicado en Rosario,
        especializado en reparacion de siniestros y gestion integral con
        aseguradoras. Atendemos toda la zona metropolitana de Rosario.
      </p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="text-center p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <div className="text-3xl font-bold text-dc-navy">
            +{agregado.vehiculos_reparados_total}
          </div>
          <div className="text-sm text-dc-navy/60">Vehiculos reparados</div>
        </div>
        <div className="text-center p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <div className="text-3xl font-bold text-dc-navy">
            {agregado.calificacion_google}
          </div>
          <div className="text-sm text-dc-navy/60">en Google</div>
        </div>
        <div className="text-center p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <div className="text-3xl font-bold text-dc-navy">
            {agregado.tiempo_promedio_reparacion_dias}d
          </div>
          <div className="text-sm text-dc-navy/60">Tiempo promedio</div>
        </div>
        <div className="text-center p-5 bg-dc-blue-pale border border-dc-blue/20 rounded-xl">
          <div className="text-3xl font-bold text-dc-navy">
            {Math.round(
              agregado.porcentaje_gestion_directa_aseguradora * 100
            )}
            %
          </div>
          <div className="text-sm text-dc-navy/60">Gestion directa</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-dc-navy mb-4">Direccion</h2>
        <address className="not-italic text-dc-navy/80">
          <strong className="text-dc-navy">DoctorCar</strong>
          <br />
          9 de julio 4231, Rosario, Santa Fe
          <br />
          Tel: 341 269-7000
          <br />
          Email: doctorcar@gmail.com
          <br />
          Lunes a Viernes: 8:00 — 18:00
        </address>
      </section>
    </SeoPageLayout>
  );
}
