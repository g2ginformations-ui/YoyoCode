// Fait le PDF d'impression (A5 + 3 mm de fond perdu, 2 pages) et les aperçus PNG du flyer à partir de flyer.html.
// Usage (depuis la racine du dépôt) : node marketing/flyer/imprimer-flyer.mjs
import { chromium } from "../../videos-mymotiv/node_modules/playwright-core/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ICI = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.goto("file://" + path.join(ICI, "flyer.html"));
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: path.join(ICI, "flyer-mymotiv-a5-fond-perdu.pdf"), width: "154mm", height: "216mm", printBackground: true, preferCSSPageSize: true });
// aperçus à 300 dpi, rognés au format fini (sans les 3 mm de fond perdu)
const mm = 300 / 25.4;
await page.setViewportSize({ width: Math.round(154 * 96 / 25.4), height: Math.round(216 * 96 / 25.4) });
const pages = await page.$$(".page");
const noms = ["recto", "verso"];
for (let i = 0; i < pages.length; i++) {
  await page.evaluate((i) => document.querySelectorAll(".page")[i].scrollIntoView(), i);
  const box = await pages[i].boundingBox();
  const p2 = await browser.newPage({ deviceScaleFactor: 300 / 96 });
  await p2.setViewportSize({ width: Math.round(154 * 96 / 25.4), height: Math.round(216 * 96 / 25.4) * 2 });
  await p2.goto("file://" + path.join(ICI, "flyer.html"));
  await p2.evaluate(() => document.fonts.ready);
  const b = await (await p2.$$(".page"))[i].boundingBox();
  const c = 3 * 96 / 25.4;
  await p2.screenshot({ path: path.join(ICI, `flyer-mymotiv-a5-${noms[i]}.png`), clip: { x: b.x + c, y: b.y + c, width: b.width - 2 * c, height: b.height - 2 * c } });
  await p2.close();
}
await browser.close();
console.log("PDF + PNG ok");
