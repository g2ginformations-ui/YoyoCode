import { continueRender, delayRender, staticFile } from "remotion";

// Police « pixel » Silkscreen (Google Fonts, licence OFL, paquet @fontsource/silkscreen) pour les vidéos au style
// rétro pixel (fenêtres, étiquettes, messages). Les polices de la marque restent dans fonts.ts.
const FONTS: [string, string, string][] = [
  ["Silkscreen", "400", "fonts/silkscreen-latin-400-normal.woff2"],
  ["Silkscreen", "700", "fonts/silkscreen-latin-700-normal.woff2"],
];
if (typeof document !== "undefined") {
  const handle = delayRender("Chargement de la police pixel");
  Promise.all(
    FONTS.map(([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}
