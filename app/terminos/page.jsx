import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Términos y Condiciones | DoctorCar",
  description:
    "Términos y condiciones de uso del sitio de DoctorCar, taller de chapa y pintura en Rosario.",
  alternates: { canonical: `${SITE_URL}/terminos` },
};

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-dc-navy mb-3">{title}</h2>
    <div className="text-dc-navy/80 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TerminosPage() {
  return (
    <SeoPageLayout>
      <Breadcrumb items={[{ name: "Inicio", url: "/" }, { name: "Términos y Condiciones" }]} />
      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-6">Términos y Condiciones</h1>
      <p className="text-dc-navy/70 mb-8">Última actualización: junio de 2026.</p>

      <Section title="1. Aceptación">
        <p>Al utilizar el sitio de DoctorCar aceptás estos Términos y Condiciones. Si no estás de acuerdo, te pedimos que no utilices el sitio.</p>
      </Section>

      <Section title="2. Servicios">
        <p>DoctorCar es un taller de chapa y pintura en Rosario especializado en reparación de siniestros, granizo, pintura automotor y gestión con aseguradoras. La información del sitio es orientativa; el alcance, los plazos y los costos de cada trabajo se definen tras evaluar el vehículo.</p>
      </Section>

      <Section title="3. Presupuestos">
        <p>Los presupuestos son estimaciones sujetas a la inspección del vehículo y pueden variar según el daño real, repuestos y disponibilidad. Ningún presupuesto constituye un compromiso de precio definitivo hasta su confirmación por escrito.</p>
      </Section>

      <Section title="4. Limitación de responsabilidad">
        <p>El contenido del sitio se ofrece "tal cual", con fines informativos. No garantizamos que esté libre de errores ni que sea aplicable a tu caso particular. DoctorCar no se responsabiliza por decisiones tomadas únicamente en base a la información publicada.</p>
      </Section>

      <Section title="5. Enlaces y publicidad de terceros">
        <p>El sitio puede contener enlaces y anuncios de terceros (incluido Google AdSense). No controlamos esos sitios ni sus políticas; el acceso es bajo tu responsabilidad. Ver nuestra <a className="text-dc-blue hover:underline" href="/privacidad">Política de Privacidad</a>.</p>
      </Section>

      <Section title="6. Propiedad intelectual">
        <p>Las marcas, textos e imágenes del sitio pertenecen a DoctorCar o a sus respectivos titulares y no pueden reproducirse sin autorización.</p>
      </Section>

      <Section title="7. Ley aplicable">
        <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se somete a los tribunales ordinarios de la ciudad de Rosario, Santa Fe.</p>
      </Section>

      <Section title="8. Contacto">
        <p>9 de julio 4231, Rosario, Santa Fe — Tel/WhatsApp <a className="text-dc-blue hover:underline" href="https://wa.me/543412697000">341 269-7000</a>.</p>
      </Section>
    </SeoPageLayout>
  );
}
