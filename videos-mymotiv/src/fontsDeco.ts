import { continueRender, delayRender, staticFile } from "remotion";

// Polices « Art déco » (Google Fonts, licence OFL) pour les vidéos de style années 30 : Limelight (titres) et
// Josefin Sans (sous-titres en capitales espacées). Les polices de la marque restent dans fonts.ts.
const FONTS: [string, string, string][] = [
  ["Limelight", "400", "fonts/limelight-latin-400-normal.woff2"],
  ["Josefin Sans", "100 700", "fonts/josefin-sans-latin-wght-normal.woff2"],
];
if (typeof document !== "undefined") {
  const handle = delayRender("Chargement des polices Art déco");
  Promise.all(
    FONTS.map(([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}
