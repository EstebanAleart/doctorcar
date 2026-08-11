import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function CtaBox({
  titulo = "Presupuesto sin cargo en 24 horas",
  subtitulo = "Enviá fotos por WhatsApp y recibí el detalle.",
  whatsappText = "Hola, quiero un presupuesto",
}) {
  const waUrl = `https://wa.me/543412697000?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="bg-linear-to-r from-dc-navy to-dc-blue rounded-xl p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-4 items-center shadow-md">
      <div className="flex-1 text-white">
        <p className="font-bold text-lg md:text-xl">{titulo}</p>
        <p className="text-white/80 text-sm mt-1">{subtitulo}</p>
      </div>
      <Link
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-goal="presupuesto"
        data-cta="ctabox-presupuesto"
        className="inline-flex items-center gap-2 bg-dc-green text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition-all shadow whitespace-nowrap"
      >
        <MessageCircle className="w-5 h-5" />
        Pedir presupuesto
      </Link>
    </div>
  );
}
