/**
 * Lista de FAQs renderizadas como <details><summary> (SEO-friendly, sin JS).
 */
export default function FaqList({ faqs, titulo = "Preguntas frecuentes" }) {
  if (!faqs?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-dc-navy">{titulo}</h2>
      <div className="divide-y divide-dc-blue/20 border border-dc-blue/20 rounded-xl overflow-hidden">
        {faqs.map((f, i) => (
          <details key={i} className="group p-4 cursor-pointer hover:bg-dc-blue-pale transition-colors">
            <summary className="font-semibold text-dc-navy list-none flex justify-between items-center">
              <span>{f.q}</span>
              <span className="text-xl text-dc-blue group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-dc-navy/80 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
