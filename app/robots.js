export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/portal/',
      },
    ],
    sitemap: 'https://doctorcar.com.ar/sitemap.xml',
  };
}
