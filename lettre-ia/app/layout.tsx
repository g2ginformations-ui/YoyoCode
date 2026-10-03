import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaMotiv",
  description: "Des lettres de motivation personnalisées et humaines à partir de votre CV et de l'offre d'emploi.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "MaMotiv", statusBarStyle: "default" },
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
