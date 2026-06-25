import Breadcrumb from "@/components/seo/Breadcrumb";
import SeoPageLayout from "@/components/seo/SeoPageLayout";
import { SITE_URL } from "@/lib/metadata";

export const metadata = {
  title: "Política de Privacidad | DoctorCar",
  description:
    "Cómo DoctorCar recopila, usa y protege tu información, incluido el uso de cookies y de publicidad de terceros (Google AdSense).",
  alternates: { canonical: `${SITE_URL}/privacidad` },
};

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-dc-navy mb-3">{title}</h2>
    <div className="text-dc-navy/80 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacidadPage() {
  return (
    <SeoPageLayout>
      <Breadcrumb items={[{ name: "Inicio", url: "/" }, { name: "Política de Privacidad" }]} />
      <h1 className="text-3xl md:text-4xl font-bold text-dc-navy mb-6">Política de Privacidad</h1>
      <p className="text-dc-navy/70 mb-8">Última actualización: junio de 2026.</p>

      <Section title="1. Quiénes somos">
        <p>DoctorCar es un taller de chapa y pintura ubicado en 9 de julio 4231, Rosario, Santa Fe, Argentina. Esta política explica qué información recopilamos cuando usás nuestro sitio y cómo la tratamos.</p>
      </Section>

      <Section title="2. Información que recopilamos">
        <p>Cuando nos contactás (por WhatsApp, teléfono o formularios) podemos recopilar tu nombre, teléfono, email y los datos de tu consulta o vehículo. Al navegar el sitio se recopilan automáticamente datos técnicos (dirección IP, tipo de navegador, dispositivo y páginas visitadas) mediante cookies y tecnologías similares.</p>
      </Section>

      <Section title="3. Cookies">
        <p>Usamos cookies propias y de terceros para mejorar la experiencia, analizar el tráfico y mostrar publicidad. Podés gestionar o desactivar las cookies desde la configuración de tu navegador; algunas funciones podrían dejar de estar disponibles.</p>
      </Section>

      <Section title="4. Publicidad de terceros (Google AdSense)">
        <p>Este sitio utiliza Google AdSense para mostrar anuncios. Google y sus socios usan cookies (incluida la cookie DART) para mostrar anuncios basados en tus visitas a este y otros sitios web.</p>
        <p>Podés desactivar la publicidad personalizada visitando la <a className="text-dc-blue hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configuración de anuncios de Google</a>, o desactivar las cookies de proveedores externos en <a className="text-dc-blue hover:underline" href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>. Más información en la <a className="text-dc-blue hover:underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">política de publicidad de Google</a>.</p>
      </Section>

      <Section title="5. Analítica">
        <p>Podemos usar herramientas de analítica web (como Google Analytics) para entender de forma agregada cómo se usa el sitio y mejorarlo. Estos datos no se utilizan para identificarte personalmente.</p>
      </Section>

      <Section title="6. Uso de la información">
        <p>Usamos tu información para responder consultas, coordinar presupuestos y reparaciones, mejorar el sitio, cumplir obligaciones legales y prevenir abusos. No vendemos tu información personal.</p>
      </Section>

      <Section title="7. Tus derechos">
        <p>Podés solicitar el acceso, la corrección o la eliminación de tus datos personales escribiéndonos por los canales de contacto. Responderemos en un plazo razonable conforme a la normativa aplicable (Ley 25.326 de Protección de Datos Personales, Argentina).</p>
      </Section>

      <Section title="8. Cambios en esta política">
        <p>Podemos actualizar esta política periódicamente. La versión vigente siempre estará publicada en esta página.</p>
      </Section>

      <Section title="9. Contacto">
        <p>Por consultas sobre privacidad: 9 de julio 4231, Rosario, Santa Fe — Tel/WhatsApp <a className="text-dc-blue hover:underline" href="https://wa.me/543412697000">341 269-7000</a>.</p>
      </Section>
    </SeoPageLayout>
  );
}
