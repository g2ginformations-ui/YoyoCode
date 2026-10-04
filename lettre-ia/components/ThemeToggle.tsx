"use client";

import { useEffect, useState } from "react";
import { applyTheme, currentTheme, type Theme } from "@/lib/theme";

// Bouton lune / soleil : bascule l'écran entre clair et sombre.
export default function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  // Inconnu tant que la page n'est pas chargée dans le navigateur (le rendu serveur ne connaît pas le thème).
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Mode sombre" : "Mode clair";

  return (
    <button
      type="button"
      className={withLabel ? "theme-toggle with-label" : "theme-toggle"}
      aria-label={withLabel ? undefined : label}
      title={label}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      <span className="nav-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
          {next === "dark" ? (
            <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.78-.73A9.5 9.5 0 1 0 21.23 15.4a.6.6 0 0 0-.73-.79Z" />
          ) : (
            <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17.5a1 1 0 0 1 1 1V21a1 1 0 1 1-2 0v-.5a1 1 0 0 1 1-1ZM3 11h1.5a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Zm16.5 0H21a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2ZM5.64 4.22l1.06 1.06A1 1 0 0 1 5.28 6.7L4.22 5.64a1 1 0 0 1 1.42-1.42Zm12.02 12.02 1.06 1.06a1 1 0 0 1-1.42 1.42l-1.06-1.06a1 1 0 0 1 1.42-1.42ZM4.22 18.36l1.06-1.06a1 1 0 0 1 1.42 1.42l-1.06 1.06a1 1 0 0 1-1.42-1.42ZM16.24 5.28l1.06-1.06a1 1 0 0 1 1.42 1.42L17.66 6.7a1 1 0 0 1-1.42-1.42Z" />
          )}
        </svg>
      </span>
      {withLabel && <span>{label}</span>}
    </button>
  );
}
