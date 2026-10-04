// Thème de l'écran (clair ou sombre), choisi par le visiteur et gardé dans son navigateur.
// Sans choix enregistré, le site est sombre (identité « in shadow »). Le PDF téléchargé n'est pas concerné.
export type Theme = "light" | "dark";

export const THEME_KEY = "mymotiv:theme";

// Appliqué avant l'affichage de la page (voir app/layout.tsx) pour éviter un flash de la mauvaise couleur.
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function currentTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  return forced === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Stockage indisponible : le choix vaut seulement pour cette page.
  }
}
