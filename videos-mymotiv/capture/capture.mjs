// Captures du VRAI site MyMotiv (build local), écran de téléphone 432×768 en ×2,5 = 1080×1920.
// Les réponses des API sont simulées avec un exemple fictif (Camille Dubois, Maison Lumen).
import { chromium } from "playwright-core";
import fs from "node:fs";
const OUT = "shots"; fs.mkdirSync(OUT, { recursive: true });
const boxes = {};
const LETTER = fs.readFileSync("letter.txt", "utf8"), LETTER2 = fs.readFileSync("letter2.txt", "utf8");
const CV = "Camille Dubois — Conseillère de vente, Lyon\nMaison & Déco (2019-2025) : conseil client, management d'une équipe de 6, panier moyen +18 %.\nBTS Management des unités commerciales.";
const OFFER = "Maison Lumen recrute un(e) Manager des ventes (CDI) pour sa boutique de Lyon.\nMissions : animer une équipe de conseillers, atteindre les objectifs, mise en scène des produits, conseil client.\nProfil : expérience du retail et du management.";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: false });
await ctx.route("**/api/access", (r) => r.fulfill({ json: { active: true, loggedIn: true, trialAvailable: false, plan: "month", credits: 0, adjustLeft: 0, weekLeft: 30 } }));
await ctx.route("**/api/motives", (r) => r.fulfill({ json: { total: 200 } }));
await ctx.route("**/api/extract", async (r) => { await new Promise((o) => setTimeout(o, 300)); r.fulfill({ json: { text: CV } }); });
await ctx.route("**/api/offre", async (r) => { await new Promise((o) => setTimeout(o, 300)); r.fulfill({ json: { text: OFFER, company: "Maison Lumen", domain: "maison-lumen.fr", logoUrl: "" } }); });
await ctx.route("**/api/logo**", (r) => r.fulfill({ body: fs.readFileSync("../public/company.png"), contentType: "image/png" }));
await ctx.addInitScript(([l1, l2]) => {
  localStorage.setItem("mymotiv:theme", "dark");
  const real = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.includes("/api/generate")) return real(input, init);
    const adjust = init && init.body && JSON.parse(init.body).adjust;
    const kw = { type: "keywords", keywords: ["Manager des ventes", "équipe", "objectifs", "conseil client", "Lyon", "mise en scène"] };
    const events = adjust ? [[0, { type: "step", step: "ajustement" }], [1800, { type: "done", letter: l2 }]]
      : [[0, { type: "step", step: "analyse" }], [500, kw], [1600, { type: "step", step: "redaction" }], [3200, { type: "step", step: "humanisation" }], [4600, { type: "done", letter: l1 }]];
    const enc = new TextEncoder();
    return Promise.resolve(new Response(new ReadableStream({ start(c) { for (const [ms, e] of events) setTimeout(() => { c.enqueue(enc.encode(JSON.stringify(e) + "\n")); if (e.type === "done") c.close(); }, ms); } }), { headers: { "Content-Type": "application/x-ndjson" } }));
  };
}, [LETTER, LETTER2]);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("ERREUR:", e.message)); page.on("console", (m) => m.type() === "error" && console.log("console:", m.text()));
let n = 0;
async function shot(name, sel = {}) {
  await page.waitForTimeout(120);
  const file = `${OUT}/${String(++n).padStart(3, "0")}-${name}.png`;
  await page.screenshot({ path: file });
  const b = {};
  for (const [k, s] of Object.entries(sel)) { const bb = await page.locator(s).first().boundingBox(); if (bb) b[k] = [bb.x * 2.5, bb.y * 2.5, bb.width * 2.5, bb.height * 2.5]; }
  boxes[file] = b; console.log(file);
}
async function center(sel, off = 0) { await page.evaluate(([s, off]) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2 + off); }, [sel, off]); await page.waitForTimeout(250); }
async function typeShots(sel, text, name, per = 3, boxSel = {}) {
  await page.locator(sel).first().click();
  for (let i = per; i < text.length + per; i += per) { await page.locator(sel).first().fill(text.slice(0, Math.min(i, text.length))); await shot(`${name}`, boxSel); }
}

await page.goto("http://localhost:3500/"); await page.waitForTimeout(2600);
await shot("accueil", { cta: ".landing-cta" });
await page.click(".landing-cta"); await page.waitForTimeout(1300);
await center(".doc-cv", 40);
await shot("cv-vide", { drop: ".doc-cv .dropzone", card: ".doc-cv" });
await page.locator(".doc-cv input[type=file]").setInputFiles({ name: "CV_Camille_Dubois.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
await page.waitForTimeout(700);
await shot("cv-ajoute", { drop: ".doc-cv .dropzone", card: ".doc-cv" });
await center(".doc-offer", 40);
await shot("offre-vide", { url: ".doc-offer .url-import input", btn: ".doc-offer .url-import button", card: ".doc-offer" });
await typeShots(".doc-offer .url-import input", "https://carrieres.maison-lumen.fr/offre/manager-ventes", "offre-lien", 4, { url: ".doc-offer .url-import input", btn: ".doc-offer .url-import button" });
await page.click(".doc-offer .url-import button"); await page.waitForTimeout(150);
await shot("offre-lecture", { btn: ".doc-offer .url-import button" });
await page.waitForTimeout(1200);
await shot("offre-lue", { card: ".doc-offer" });
await center(".company-status", -80); await page.waitForTimeout(500);
await shot("entreprise", { block: ".company-status", logo: ".company-logo", site: ".company-status" });
fs.writeFileSync("boxes.json", JSON.stringify(boxes, null, 1));
await center(".options", 0);
await shot("options", { seg: ".segmented", longue: ".segmented button:nth-child(3)", standard: ".segmented button:nth-child(2)", extras: ".extras-toggle" });
await page.click(".segmented button:nth-child(3)"); await shot("longueur-longue", { seg: ".segmented" });
await page.click(".segmented button:nth-child(2)"); await shot("longueur-standard", { seg: ".segmented" });
if (await page.locator(".extras-toggle").isVisible()) { await page.click(".extras-toggle"); await page.waitForTimeout(400); }
await center(".options", 40);
await shot("options-ouvertes", { consigne: "#options-facultatives input >> nth=0", dispo: "#options-facultatives input >> nth=1", gen: ".options .liquid-button" });
await typeShots("#options-facultatives input >> nth=0", "Insister sur mon management d'équipe", "consigne", 3, { consigne: "#options-facultatives input >> nth=0" });
await typeShots("#options-facultatives input >> nth=1", "Immédiate", "dispo", 2, { dispo: "#options-facultatives input >> nth=1" });
await center(".options .liquid-button", 0);
await shot("avant-generer", { gen: ".options .liquid-button" });
await page.click(".options .liquid-button");
for (let k = 0; k < 10; k++) { await page.waitForTimeout(380); await shot("generation", { gen: ".options .liquid-button" }); }
await page.waitForTimeout(1500);
await center(".deliverable", 0); await page.waitForTimeout(400);
await shot("lettre", { letter: ".deliverable textarea", kw: ".keywords" });
await center(".keywords", 0); await shot("mots-cles", { kw: ".keywords" });
await center(".adjust", 0);
await shot("ajuster", { input: ".adjust input", btn: ".adjust form button", court: ".adjust > button:nth-child(1)" });
await typeShots(".adjust input", "Plus chaleureux", "ajuster-texte", 2, { input: ".adjust input", btn: ".adjust form button" });
await page.click(".adjust form button"); await page.waitForTimeout(300); await shot("ajustement", {});
await page.waitForTimeout(2200);
await center(".deliverable", 0); await shot("lettre-ajustee", { letter: ".deliverable textarea" });
await center(".pdf-style", 0); await shot("styles-pdf", { styles: ".pdf-style" });
for (const st of ["Moderne", "Minimaliste", "Sombre"]) { await page.locator(".pdf-style button", { hasText: st }).first().click(); await page.waitForTimeout(300); await shot("style-" + st.toLowerCase(), { styles: ".pdf-style", btn: `.pdf-style button:has-text('${st}')`, dl: "button:has-text('Télécharger en PDF')" }); }
fs.writeFileSync("boxes.json", JSON.stringify(boxes, null, 1));
await browser.close();
