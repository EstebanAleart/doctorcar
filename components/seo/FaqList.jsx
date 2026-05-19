/**
 * Lista de FAQs renderizadas como <details><summary> (SEO-friendly, sin JS).
 */
export default function FaqList({ faqs, titulo = "Preguntas frecuentes" }) {
  if (!faqs?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{titulo}</h2>
      <div className="divide-y border rounded-lg">
        {faqs.map((f, i) => (
          <details key={i} className="group p-4 cursor-pointer">
            <summary className="font-semibold list-none flex justify-between items-center">
              <span>{f.q}</span>
              <span className="text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-700 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
