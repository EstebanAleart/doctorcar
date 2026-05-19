import Link from "next/link";
import JsonLd from "./JsonLd";
import { schemaBreadcrumb } from "@/lib/schema";

/**
 * Breadcrumb visible + JSON-LD BreadcrumbList automático.
 * items: [{ name, url }] — el último item NO debe tener url (es la página actual).
 */
export default function Breadcrumb({ items }) {
  if (!items?.length) return null;

  return (
    <>
      <JsonLd data={schemaBreadcrumb(items)} />
      <nav aria-label="breadcrumb" className="text-sm text-gray-600 mb-4">
        <ol className="flex flex-wrap gap-2 items-center">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              {it.url ? (
                <Link
                  href={it.url}
                  className="hover:text-blue-600 hover:underline"
                >
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-gray-900">
                  {it.name}
                </span>
              )}
              {i < items.length - 1 && (
                <span className="text-gray-400">&rsaquo;</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
