/**
 * Inyecta uno o varios objetos JSON-LD en el <head>.
 * Pasarle un objeto o un array. Filtra nulls automáticamente.
 */
export default function JsonLd({ data }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
