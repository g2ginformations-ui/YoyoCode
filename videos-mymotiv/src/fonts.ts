import { continueRender, delayRender, staticFile } from "remotion";

// Polices du site (Poppins pour les titres, Open Sans pour le texte), chargées depuis public/fonts.
const FONTS: [string, string, string][] = [
  ["Poppins", "600", "fonts/poppins-latin-600-normal.woff2"],
  ["Poppins", "700", "fonts/poppins-latin-700-normal.woff2"],
  ["Open Sans", "400", "fonts/open-sans-latin-400-normal.woff2"],
  ["Open Sans", "600", "fonts/open-sans-latin-600-normal.woff2"],
];
if (typeof document !== "undefined") {
  const handle = delayRender("Chargement des polices");
  Promise.all(
    FONTS.map(([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}
