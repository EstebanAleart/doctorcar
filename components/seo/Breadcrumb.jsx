import Link from "next/link";
import JsonLd from "./JsonLd";
import { schemaBreadcrumb } from "@/lib/schema";

/**
 * Breadcrumb visible + JSON-LD BreadcrumbList automatico.
 * items: [{ name, url }] — el ultimo item NO debe tener url (es la pagina actual).
 */
export default function Breadcrumb({ items }) {
  if (!items?.length) return null;

  return (
    <>
      <JsonLd data={schemaBreadcrumb(items)} />
      <nav aria-label="breadcrumb" className="text-sm text-dc-navy/60 mb-4">
        <ol className="flex flex-wrap gap-2 items-center">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              {it.url ? (
                <Link
                  href={it.url}
                  className="hover:text-dc-blue hover:underline transition-colors"
                >
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-dc-navy font-medium">
                  {it.name}
                </span>
              )}
              {i < items.length - 1 && (
                <span className="text-dc-navy/30">&rsaquo;</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
