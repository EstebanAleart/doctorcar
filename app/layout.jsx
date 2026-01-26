import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthInitializer } from "@/components/auth-initializer";
import { SessionProviderWrapper } from "@/components/session-provider";
import { RoleRedirect } from "@/components/role-redirect";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Taller de Chapa y Pintura en Rosario | DoctorCar – Siniestros y Aseguradoras",
  description:
    "DoctorCar es un taller de chapa y pintura en Rosario especializado en reparación de siniestros, pintura automotor y gestión con aseguradoras. Presupuestos, turnos y seguimiento online.",
  keywords: [
    "taller de chapa y pintura rosario",
    "reparación de siniestros rosario",
    "pintura automotor rosario",
    "taller carrocería rosario",
    "taller aseguradoras rosario",
    "arreglo de golpes rosario"
  ],
  openGraph: {
    title: "DoctorCar – Chapa y Pintura en Rosario",
    description:
      "Especialistas en reparación de siniestros y pintura automotor en Rosario. Seguimiento online y trabajo con aseguradoras.",
    locale: "es_AR",
    type: "website",
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  );
} 