export default function robots() {
  return {
    rules: [
      // GoogleOther (crawler R&D de Google, token aparte de Googlebot Search): costo Vercel, 0 SEO. Reversible.
      { userAgent: ["GoogleOther", "GoogleOther-Image", "GoogleOther-Video"], disallow: "/" },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal", "/api/", "/_next/"],
      },
    ],
    sitemap: "https://www.doctorcar.com.ar/sitemap.xml",
    host: "https://www.doctorcar.com.ar",
  };
}
