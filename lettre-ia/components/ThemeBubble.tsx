"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

// Bulle flottante en bas à gauche pour passer de l'écran clair à l'écran sombre, sur toutes les pages
// (sauf le parcours plein écran /candidature et l'administration).
export default function ThemeBubble() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/candidature")) return null;
  return (
    <div className="theme-bubble">
      <ThemeToggle />
    </div>
  );
}
