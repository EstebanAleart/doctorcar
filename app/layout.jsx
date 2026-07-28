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

// TODO: reemplazar con tu Measurement ID real de GA4
const GA_ID = "G-GQ5QK4C04E";

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
  // manifest removed — was triggering "install app" prompt on mobile
  other: {
    "msapplication-TileColor": "#1a1a2e",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9884098505893083"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <meta name="google-adsense-account" content="ca-pub-9884098505893083" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
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
        <script src="/an.js" data-site="doctorcar" defer />
      </body>
    </html>
  );
}