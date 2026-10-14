// Captures du parcours ACTUEL « Lancer une candidature » sur ORDINATEUR (1280×800 en ×2 = 2560×1600, JPEG), pour la vidéo
// tuto « écran filmé au téléphone » (composition TutoEcran) : CV glissé en PHOTO puis lu (animation de lecture), lien de
// l'offre, analyse, score de matching (mots-clés ✓ trouvés / non cochés), lettre avec le logo et les 4 styles de PDF, puis
// la page « Mon CV adapté à l'offre ». Build local (npx next build && npx next start -p 3500), API simulées.
// Données fictives : Camille Dubois, Maison Lumen. → public/tuto/*.jpg + public/tuto/boxes.json (cadres des cases en px
// de l'image). Usage : cd videos-mymotiv/capture && node capture-tuto.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
const OUT = "../public/tuto"; fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const S = 2, boxes = {};
const LETTER = fs.readFileSync("letter.txt", "utf8");
// Le CV contient tout ce que la lettre et le CV adapté reprennent (rien n'est inventé, même dans l'exemple).
const CV = "Camille Dubois — Conseillère de vente, Lyon — camille.dubois@exemple.fr\nMaison & Déco (2019-2025) : conseil client, management d'une équipe de 6 conseillers, merchandising, suivi des objectifs de vente ; panier moyen en hausse de 18 % en 2024.\nBTS Management des unités commerciales.\nCompétences : relation client, management, mise en scène des produits, objectifs.";
const OFFER = "Maison Lumen recrute un(e) Manager des ventes (CDI) pour sa boutique de Lyon.\nVos missions : manager et animer une équipe de conseillers de vente ; piloter les objectifs de vente de la boutique ; assurer le merchandising et la mise en scène des produits ; garantir un conseil client personnalisé ; former les conseillers au conseil et à la vente.\nVotre profil : une première expérience réussie en management d'équipe dans le retail ; le goût du conseil client et des objectifs ; un sens aigu du merchandising ; une expérience de la vente en boutique de décoration est un plus.\nLa boutique : 6 conseillers, des produits de décoration et de mobilier, une clientèle fidèle.";
const TAILORED = {
  name: "Camille Dubois", headline: "Conseillère de vente — management d'équipe et conseil client", contact: ["camille.dubois@exemple.fr", "Lyon"],
  summary: "Conseillère de vente chez Maison & Déco depuis 2019 : je manage une équipe de 6 conseillers, je suis les objectifs de vente de la boutique et je soigne le conseil client.",
  experiences: [{ role: "Conseillère de vente", company: "Maison & Déco", place: "Lyon", dates: "2019 — 2025", bullets: [
    "Management d'une équipe de 6 conseillers de vente", "Suivi des objectifs de vente de la boutique", "Panier moyen en hausse de 18 % en 2024",
    "Conseil client et mise en scène des produits (merchandising)"] }],
  education: [{ degree: "BTS Management des unités commerciales", school: "", dates: "" }],
  skills: ["Management d'équipe", "Conseil client", "Merchandising", "Mise en scène des produits", "Objectifs de vente", "Relation client"], languages: [], extras: [],
};
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: S });
let paid = false;
await ctx.route("**/api/access", (r) => r.fulfill({ json: paid ? { active: true, loggedIn: true, email: "camille.dubois@exemple.fr", plan: "semaine", credits: 0, cvLeft: 1, adjustLeft: 3, weekLeft: 29 }
  : { active: false, loggedIn: false, trialAvailable: true, plan: null, credits: 0, adjustLeft: 0, weekLeft: 0 } }));
await ctx.route("**/api/motives", (r) => r.fulfill({ json: { total: 0 } }));
await ctx.route("**/api/extract", async (r) => { await new Promise((o) => setTimeout(o, 5200)); r.fulfill({ json: { text: CV } }); });
await ctx.route("**/api/offre", async (r) => { await new Promise((o) => setTimeout(o, 900)); r.fulfill({ json: { text: OFFER, company: "Maison Lumen", domain: "maison-lumen.fr", logoUrl: "" } }); });
await ctx.route("**/api/entreprise**", (r) => r.fulfill({ json: { domain: "maison-lumen.fr" } }));
await ctx.route("**/api/logo**", (r) => r.fulfill({ body: fs.readFileSync("../public/company.png"), contentType: "image/png" }));
await ctx.route("**/api/cv", async (r) => { await new Promise((o) => setTimeout(o, 2500)); r.fulfill({ json: { cv: TAILORED } }); });
await ctx.addInitScript(([l1]) => {
  localStorage.setItem("mymotiv:theme", "dark");
  const real = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.includes("/api/generate")) return real(input, init);
    const kw = { type: "keywords", keywords: ["Manager des ventes", "équipe", "objectifs", "conseil client", "Lyon", "mise en scène"] };
    const events = [[0, { type: "step", step: "analyse" }], [600, kw], [1900, { type: "step", step: "redaction" }], [3600, { type: "step", step: "humanisation" }], [5200, { type: "done", letter: l1 }]];
    const enc = new TextEncoder();
    return Promise.resolve(new Response(new ReadableStream({ start(c) { for (const [ms, e] of events) setTimeout(() => { c.enqueue(enc.encode(JSON.stringify(e) + "\n")); if (e.type === "done") c.close(); }, ms); } }), { headers: { "Content-Type": "application/x-ndjson" } }));
  };
}, [LETTER]);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("ERREUR:", e.message));
let n = 0;
async function shot(name, sel = {}) {
  await page.waitForTimeout(120);
  const file = `${String(++n).padStart(3, "0")}-${name}`;
  await page.screenshot({ path: `${OUT}/${file}.jpg`, type: "jpeg", quality: 88 });
  const b = {};
  for (const [k, s] of Object.entries(sel)) { const loc = page.locator(s).first(); if (await loc.count()) { const bb = await loc.boundingBox(); if (bb) b[k] = [bb.x * S, bb.y * S, bb.width * S, bb.height * S].map(Math.round); } }
  boxes[file] = b; console.log(file, JSON.stringify(b));
}
const NEXT = ".pc-next";

// questionnaire (non filmé) jusqu'au CV
await page.goto("http://localhost:3500/candidature"); await page.waitForTimeout(1500);
await page.locator(".pc-option").nth(1).click(); await page.click(NEXT); await page.waitForTimeout(600);
await page.locator(".pc-option").nth(0).click(); await page.click(NEXT); await page.waitForTimeout(800);
await page.click(NEXT); await page.waitForTimeout(700);

// CV : la zone, puis une PHOTO du CV glissée dessus, puis la lecture
const CVSEL = { title: ".pc-title", sub: ".pc-sub", drop: ".pc-drop", next: NEXT };
await shot("cv", CVSEL);
await page.evaluate(async () => {
  // une vraie image JPEG (feuille blanche avec des lignes), comme la photo d'un CV papier
  const c = document.createElement("canvas"); c.width = 900; c.height = 1270; const g = c.getContext("2d");
  g.fillStyle = "#f4f1ec"; g.fillRect(0, 0, 900, 1270); g.fillStyle = "#333";
  for (let y = 120; y < 1200; y += 46) g.fillRect(80, y, 300 + ((y * 37) % 440), 14);
  const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
  window.__cvPhoto = new File([blob], "CV_Camille.jpg", { type: "image/jpeg" });
});
await page.evaluate(() => { const dt = new DataTransfer(); dt.items.add(window.__cvPhoto); document.querySelector(".pc-drop").dispatchEvent(new DragEvent("dragover", { dataTransfer: dt, bubbles: true, cancelable: true })); });
await shot("cv-glisse", CVSEL);
await page.evaluate(() => { const dt = new DataTransfer(); dt.items.add(window.__cvPhoto); document.querySelector(".pc-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })); });
for (let k = 0; k < 9; k++) { await page.waitForTimeout(420); await shot("cv-lecture", { drop: ".pc-drop", reading: ".reading", next: NEXT }); }
await page.waitForSelector(".pc-file", { timeout: 9000 }); await page.waitForTimeout(400);
await shot("cv-lu", { file: ".pc-file", next: NEXT });

// offre : le lien collé d'un coup (Ctrl+V), puis la lecture
await page.click(NEXT); await page.waitForTimeout(700);
await shot("offre", { title: ".pc-title", sub: ".pc-sub", input: ".pc-input", paste: ".pc-link", next: NEXT });
await page.locator(".pc-input").first().fill("https://carrieres.maison-lumen.fr/offre/manager-ventes");
await shot("offre-collee", { input: ".pc-input", paste: ".pc-link", next: NEXT });
await page.click(NEXT); await page.waitForTimeout(300); await shot("offre-lecture", { next: NEXT });
await page.waitForSelector(".pc-input.big", { timeout: 8000 }); await page.waitForTimeout(500);
await page.locator(".pc-input.big").nth(0).fill("Camille"); await page.locator(".pc-input.big").nth(1).fill("camille.dubois@exemple.fr");
await page.click(NEXT);
for (let k = 0; k < 9; k++) { await page.waitForTimeout(560); await shot("analyse", { load: ".pc-load", steps: ".pc-load-steps" }); }
await page.waitForSelector(".pc-hold", { timeout: 8000 }); await page.waitForTimeout(400);
const hb = await page.locator(".pc-hold").boundingBox();
await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down(); await page.waitForTimeout(2200); await page.mouse.up();
await page.waitForSelector(".pc-score-card", { timeout: 10000 }); await page.waitForTimeout(1300);
const CHIPS = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`chip${i}`, `.pc-chips li >> nth=${i}`]));
await shot("resultat", { title: ".pc-title", score: ".pc-score-card", ring: ".pc-ring", scoreText: ".pc-score-text", chips: ".pc-chips", docs: ".pc-docs", next: NEXT, ...CHIPS });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
await shot("resultat-bas", { chips: ".pc-chips", docs: ".pc-docs", next: NEXT });

// génération puis la lettre (logo en tête) et les styles de PDF
await page.click(NEXT); await page.waitForTimeout(300);
for (let k = 0; k < 12; k++) {
  await page.waitForTimeout(450);
  await page.evaluate(() => document.querySelector(".liquid-button.filling, .liquid-button")?.scrollIntoView({ block: "center" }));
  await shot("generation", { go: ".liquid-button", logoOk: "text=Site et logo trouvés" });
}
await page.waitForSelector(".deliverable", { timeout: 10000 }); await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector(".deliverable").scrollIntoView({ block: "start" })); await page.evaluate(() => window.scrollBy(0, -140)); await page.waitForTimeout(500);
await shot("lettre", { letter: ".deliverable", logo: ".deliverable img" });
const style = page.getByText("Style du PDF").first();
if (await style.count()) { await style.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -60)); await page.waitForTimeout(400); }
await shot("styles", { label: "text=Style du PDF", letter: ".deliverable", s0: "button:has-text('Classique')", s1: "button:has-text('Moderne')", s2: "button:has-text('Minimaliste')", s3: "button:has-text('Sombre')" });

// la page « Mon CV adapté à l'offre » (accès payant simulé), avec le logo de l'entreprise en option
paid = true;
await page.evaluate(([cv, offer]) => localStorage.setItem("lettre-ia:brouillon", JSON.stringify({ cv, offer, length: "", instructions: "", availability: "", companyName: "Maison Lumen", companySite: "maison-lumen.fr", letter: "", historyId: null })), [CV, OFFER]);
await page.goto("http://localhost:3500/cv"); await page.waitForTimeout(1800);
await page.locator(".consent input").check().catch(() => {});
await shot("cv-page", { title: "h1", lead: ".lead", go: ".cv-options .primary" });
await page.click(".cv-options .primary"); await page.waitForTimeout(500);
await shot("cv-adaptation", { go: ".cv-options .primary" });
await page.waitForSelector(".cv-result", { timeout: 9000 }); await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector(".cv-result").scrollIntoView({ block: "start" })); await page.waitForTimeout(500);
await shot("cv-adapte", { result: ".cv-result", cv: ".cv-result .deliverable", pdf: ".cv-result .primary" });
await page.evaluate(() => window.scrollBy(0, 520)); await page.waitForTimeout(400);
await shot("cv-adapte-bas", { cv: ".cv-result .deliverable" });
fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 1));
await browser.close();
