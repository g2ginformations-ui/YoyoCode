import type { Metadata, Viewport } from "next";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-600.css";
import "@fontsource/open-sans/latin-700.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "./globals.css";
import LogoBar from "@/components/LogoBar";
import TabBar from "@/components/TabBar";
import { PLANS, PLAN_ORDER } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const DESCRIPTION =
  "Des lettres de motivation personnalisées et humaines à partir de votre CV et de l'offre d'emploi. Première lettre offerte.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MyMotiv — Votre lettre de motivation en 5 clics",
  description: DESCRIPTION,
  applicationName: "MyMotiv",
  // Adresse de référence de chaque page (« ./ » : l'adresse de la page elle-même), pour Google et les partages.
  alternates: { canonical: "./" },
  // Aperçu affiché quand le lien est partagé (WhatsApp, LinkedIn, Facebook…).
  openGraph: {
    type: "website",
    url: "./",
    siteName: "MyMotiv",
    locale: "fr_FR",
    title: "MyMotiv — Votre lettre de motivation en 5 clics",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MyMotiv : votre lettre de motivation en 5 clics" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "MyMotiv", statusBarStyle: "default" },
};

// Fiche « application » pour Google (données structurées), sans note : les avis affichés viennent en partie
// de notre précédent site, et Google n'accepte pas d'étoiles bâties sur des avis importés d'ailleurs.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MyMotiv",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "fr",
  description: DESCRIPTION,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "0",
    highPrice: (Math.max(...PLAN_ORDER.map((id) => PLANS[id].cents)) / 100).toFixed(2),
    offerCount: PLAN_ORDER.length + 1,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Le site occupe tout l'écran (encoche, barre d'accueil de l'iPhone) : les marges de sécurité sont gérées en CSS.
  viewportFit: "cover",
  themeColor: "#0e0c0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Le thème choisi (clair ou sombre) est posé sur <html> avant l'hydratation : React ne doit pas s'en étonner.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      </head>
      <body>
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <LogoBar />
        {children}
        <TabBar />
      </body>
    </html>
  );
}
