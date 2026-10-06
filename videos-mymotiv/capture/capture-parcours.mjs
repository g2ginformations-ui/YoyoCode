// Captures du parcours ACTUEL « Lancer une candidature » (/candidature) du vrai site, build local (npx next start -p 3500),
// écran de téléphone 432×768 en ×2,5 = 1080×1920 → public/parcours/*.png + public/parcours/boxes.json (cadres des cases
// et boutons, en pixels 1080×1920, pour les isoler dans les vidéos). Visiteur sans compte, 1re lettre offerte.
// Données fictives : Camille Dubois, Maison Lumen. Usage : cd videos-mymotiv/capture && node capture-parcours.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
const OUT = "../public/parcours"; fs.mkdirSync(OUT, { recursive: true });
const boxes = {};
const LETTER = fs.readFileSync("letter.txt", "utf8");
const CV = "Camille Dubois — Conseillère de vente, Lyon\nMaison & Déco (2019-2025) : conseil client, management d'une équipe de 6 conseillers, merchandising, suivi des objectifs de vente.\nBTS Management des unités commerciales.\nCompétences : relation client, management, mise en scène des produits, objectifs.";
const OFFER = "Maison Lumen recrute un(e) Manager des ventes (CDI) pour sa boutique de Lyon.\nVos missions : manager et animer une équipe de conseillers de vente ; piloter les objectifs de vente de la boutique ; assurer le merchandising et la mise en scène des produits ; garantir un conseil client personnalisé ; former les conseillers au conseil et à la vente.\nVotre profil : une première expérience réussie en management d'équipe dans le retail ; le goût du conseil client et des objectifs ; un sens aigu du merchandising ; une expérience de la vente en boutique de décoration est un plus.\nLa boutique : 6 conseillers, des produits de décoration et de mobilier, une clientèle fidèle.";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true });
await ctx.route("**/api/access", (r) => r.fulfill({ json: { active: false, loggedIn: false, trialAvailable: true, plan: null, credits: 0, adjustLeft: 0, weekLeft: 0 } }));
await ctx.route("**/api/motives", (r) => r.fulfill({ json: { total: 0 } }));
await ctx.route("**/api/extract", async (r) => { await new Promise((o) => setTimeout(o, 300)); r.fulfill({ json: { text: CV } }); });
await ctx.route("**/api/offre", async (r) => { await new Promise((o) => setTimeout(o, 500)); r.fulfill({ json: { text: OFFER, company: "Maison Lumen", domain: "maison-lumen.fr", logoUrl: "" } }); });
await ctx.route("**/api/entreprise**", (r) => r.fulfill({ json: { domain: "maison-lumen.fr" } }));
await ctx.route("**/api/logo**", (r) => r.fulfill({ body: fs.readFileSync("../public/company.png"), contentType: "image/png" }));
await ctx.addInitScript(([l1]) => {
  localStorage.setItem("mymotiv:theme", "dark");
  const real = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.includes("/api/generate")) return real(input, init);
    const kw = { type: "keywords", keywords: ["Manager des ventes", "équipe", "objectifs", "conseil client", "Lyon", "mise en scène"] };
    const events = [[0, { type: "step", step: "analyse" }], [500, kw], [1600, { type: "step", step: "redaction" }], [3200, { type: "step", step: "humanisation" }], [4600, { type: "done", letter: l1 }]];
    const enc = new TextEncoder();
    return Promise.resolve(new Response(new ReadableStream({ start(c) { for (const [ms, e] of events) setTimeout(() => { c.enqueue(enc.encode(JSON.stringify(e) + "\n")); if (e.type === "done") c.close(); }, ms); } }), { headers: { "Content-Type": "application/x-ndjson" } }));
  };
}, [LETTER]);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("ERREUR:", e.message));
let n = 0;
async function shot(name, sel = {}) {
  await page.waitForTimeout(150);
  const file = `${String(++n).padStart(3, "0")}-${name}`;
  await page.screenshot({ path: `${OUT}/${file}.png` });
  const b = {};
  for (const [k, s] of Object.entries(sel)) { const loc = page.locator(s).first(); if (await loc.count()) { const bb = await loc.boundingBox(); if (bb) b[k] = [bb.x * 2.5, bb.y * 2.5, bb.width * 2.5, bb.height * 2.5].map(Math.round); } }
  boxes[file] = b; console.log(file, JSON.stringify(b));
}
const NEXT = ".pc-next";

await page.goto("http://localhost:3500/"); await page.waitForTimeout(2600);
await shot("accueil", { cta: ".landing-cta", title: "h1" });
await page.click(".landing-cta"); await page.waitForURL("**/candidature"); await page.waitForTimeout(1200);
await shot("profil", { title: ".pc-title", options: ".pc-options", o2: ".pc-option >> nth=1", next: NEXT });
await page.locator(".pc-option").nth(1).click(); await shot("profil-choisi", { o2: ".pc-option >> nth=1", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(700);
await shot("douleur", { title: ".pc-title", options: ".pc-options", o1: ".pc-option >> nth=0", next: NEXT });
await page.locator(".pc-option").nth(0).click(); await shot("douleur-choisie", { o1: ".pc-option >> nth=0", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(900);
await shot("reponse", { title: ".pc-title", card: ".pc-card", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(700);
await shot("cv", { title: ".pc-title", drop: ".pc-step label, .pc-drop, .dropzone", next: NEXT });
await page.locator("input[type=file]").first().setInputFiles({ name: "CV_Camille_Dubois.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
await page.waitForTimeout(800);
await shot("cv-ajoute", { file: ".pc-file", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(700);
await shot("offre", { title: ".pc-title", input: ".pc-input", next: NEXT });
const URL = "https://carrieres.maison-lumen.fr/offre/manager-ventes";
await page.locator(".pc-input").first().click();
for (let i = 8; i < URL.length + 8; i += 8) { await page.locator(".pc-input").first().fill(URL.slice(0, Math.min(i, URL.length))); await shot("offre-lien", { input: ".pc-input", next: NEXT }); }
await page.click(NEXT); await page.waitForTimeout(250); await shot("offre-lecture", { next: NEXT });
await page.waitForTimeout(900);
await shot("compte", { title: ".pc-title", prenom: ".pc-input.big >> nth=0", email: ".pc-input.big >> nth=1", next: NEXT });
await page.locator(".pc-input.big").nth(0).fill("Camille"); await page.locator(".pc-input.big").nth(1).fill("camille.dubois@exemple.fr");
await shot("compte-rempli", { prenom: ".pc-input.big >> nth=0", email: ".pc-input.big >> nth=1", next: NEXT });
await page.click(NEXT);
for (let k = 0; k < 8; k++) { await page.waitForTimeout(600); await shot("analyse", { load: ".pc-load", steps: ".pc-load-steps" }); }
await page.waitForSelector(".pc-hold", { timeout: 8000 }); await page.waitForTimeout(500);
await shot("engagement", { quote: ".pc-quote", hold: ".pc-hold" });
const hb = await page.locator(".pc-hold").boundingBox();
await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down();
for (let k = 0; k < 4; k++) { await page.waitForTimeout(400); await shot("engagement-maintien", { hold: ".pc-hold" }); }
await page.mouse.up(); await page.waitForTimeout(300); await shot("engagement-ok", { hold: ".pc-hold" });
await page.waitForSelector(".pc-score-card", { timeout: 10000 }); await page.waitForTimeout(1200);
await shot("resultat", { title: ".pc-title", score: ".pc-score-card", ring: ".pc-ring", chips: ".pc-chips", docs: ".pc-docs", next: NEXT });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
await shot("resultat-bas", { docs: ".pc-docs", bubble: ".pc-bubble", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(400);
for (let k = 0; k < 12; k++) { await page.waitForTimeout(450); await shot("generation", {}); }
await page.waitForTimeout(1200);
const del = page.locator(".deliverable").first();
if (await del.count()) { await page.evaluate(() => document.querySelector(".deliverable").scrollIntoView({ block: "center" })); await page.waitForTimeout(500); }
await shot("lettre", { letter: ".deliverable", logo: ".deliverable img" });
fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 1));
await browser.close();
