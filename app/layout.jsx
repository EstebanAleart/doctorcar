import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthInitializer } from "@/components/auth-initializer";
import { SessionProviderWrapper } from "@/components/session-provider";
import { RoleRedirect } from "@/components/role-redirect";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

// TODO: reemplazar con tu GTM Container ID real
const GTM_ID = "GTM-XXXXXXX";

export const metadata = {
  metadataBase: new URL("https://www.doctorcar.com.ar"),
  title: {
    default:
      "Taller de Chapa y Pintura en Rosario | DoctorCar – Siniestros y Aseguradoras",
    template: "%s | DoctorCar",
  },
  description:
    "DoctorCar es un taller de chapa y pintura en Rosario especializado en reparación de siniestros, pintura automotor y gestión con aseguradoras. Presupuestos en 24hs y seguimiento online.",
  keywords: [
    "taller de chapa y pintura rosario",
    "reparación de siniestros rosario",
    "pintura automotor rosario",
    "taller carrocería rosario",
    "taller aseguradoras rosario",
    "arreglo de golpes rosario",
    "sacabollos rosario",
    "taller habilitado aseguradora rosario",
    "peritaje siniestro rosario",
  ],
  authors: [{ name: "DoctorCar" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "DoctorCar – Chapa y Pintura en Rosario",
    description:
      "Especialistas en reparación de siniestros y pintura automotor en Rosario. Trabajamos con todas las aseguradoras.",
    url: "https://www.doctorcar.com.ar",
    siteName: "DoctorCar",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DoctorCar – Taller de Chapa y Pintura en Rosario",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoctorCar – Chapa y Pintura en Rosario",
    description:
      "Especialistas en reparación de siniestros y pintura automotor en Rosario.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#1a1a2e",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SessionProviderWrapper>
          <ReduxProvider>
            <AuthInitializer />
            <RoleRedirect />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ReduxProvider>
        </SessionProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}