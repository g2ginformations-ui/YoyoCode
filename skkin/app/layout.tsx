import type { Metadata } from "next";
import { readStore } from "@/lib/store";
import "./globals.css";

// Chaque modification faite dans l'admin doit apparaître tout de suite sur le site.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await readStore();
  return {
    title: { default: `${settings.brandName} · ${settings.tagline}`, template: `%s · ${settings.brandName}` },
    description: settings.hero.subtitle,
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await readStore();
  const { colors } = settings;
  const theme = {
    "--bg": colors.background,
    "--text": colors.text,
    "--primary": colors.primary,
    "--accent": colors.accent,
    "--muted": colors.muted,
  } as React.CSSProperties;
  return (
    <html lang="fr" style={theme}>
      <body>{children}</body>
    </html>
  );
}
