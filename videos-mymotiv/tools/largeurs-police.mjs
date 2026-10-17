// Mesure la chasse (largeur) de chaque caractère de Poppins 800 / 900 dans Chromium, pour ajuster la taille des titres
// géants de la série « typo animée » (src/kinetic.tsx) sans les mesurer pendant le rendu. Sortie : src/data/poppins-k.json
// (largeur pour une taille de 1 px). Usage : node tools/largeurs-police.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
const fonts = { 800: "public/fonts/poppins-latin-800-normal.woff2", 900: "public/fonts/poppins-latin-900-normal.woff2", "900i": "public/fonts/poppins-latin-900-italic.woff2" };
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.'’!?-:;*%€$()ÉÈÊËÀÂÎÏÔÛÙÇéèêàâîôûç✓&↑«»";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
await page.setContent("<html><body></body></html>");
const out = {};
for (const [w, f] of Object.entries(fonts)) {
  const b64 = fs.readFileSync(f).toString("base64");
  out[w] = await page.evaluate(async ({ b64, w, chars }) => {
    const face = new FontFace("M" + w, `url(data:font/woff2;base64,${b64})`);
    await face.load(); document.fonts.add(face);
    const ctx = document.createElement("canvas").getContext("2d"); ctx.font = `1000px M${w}`;
    const r = {}; for (const c of chars) r[c] = Math.round(ctx.measureText(c).width) / 1000;
    return r;
  }, { b64, w, chars });
}
await browser.close();
fs.writeFileSync("src/data/poppins-k.json", JSON.stringify(out));
console.log("ok", Object.keys(out).map((k) => `${k}: A=${out[k].A} I=${out[k].I} M=${out[k].M}`).join(" · "));
