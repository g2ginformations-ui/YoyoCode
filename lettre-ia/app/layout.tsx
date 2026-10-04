import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const DESCRIPTION =
  "Des lettres de motivation personnalisées et humaines à partir de votre CV et de l'offre d'emploi. Première lettre offerte.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MyMotiv — Votre lettre de motivation en 5 clics",
  description: DESCRIPTION,
  applicationName: "MyMotiv",
  // Aperçu affiché quand le lien est partagé (WhatsApp, LinkedIn, Facebook…).
  openGraph: {
    type: "website",
    siteName: "MyMotiv",
    locale: "fr_FR",
    title: "MyMotiv — Votre lettre de motivation en 5 clics",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MyMotiv : votre lettre de motivation, précise et personnelle" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "MyMotiv", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b4332",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
