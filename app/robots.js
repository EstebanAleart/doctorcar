export default function robots() {
  return {
    rules: [
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
