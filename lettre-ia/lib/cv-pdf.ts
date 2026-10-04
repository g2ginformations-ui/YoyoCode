// CV adapté à l'offre, en PDF A4 d'une seule page, généré dans le navigateur.
// Pour tenir sur une page : on réduit d'abord l'échelle du texte, puis on retire les puces les moins utiles
// (les dernières des expériences les plus détaillées), jamais une expérience entière.

import type { TailoredCv } from "@/lib/cv";
import { type Logo, type Rgb, fileName, loadLogo } from "@/lib/pdf";

type JsPdf = InstanceType<(typeof import("jspdf"))["jsPDF"]>;

export type CvPdfOptions = {
  // Photo déjà recadrée en rond (image PNG), ou rien.
  photo: string;
  // Logo de l'entreprise en haut à droite : désactivé par défaut.
  showLogo: boolean;
  logoUrl: string;
  domain: string;
  companyName: string;
};

const MAUVE: Rgb = [142, 110, 130];
const TEXT: Rgb = [40, 40, 40];
const MUTED: Rgb = [105, 100, 96];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const MIN_SCALE = 0.8;

type Ctx = { doc: JsPdf; s: number; draw: boolean; accent: Rgb; y: number };

function font(ctx: Ctx, size: number, style: "normal" | "bold" | "italic", color: Rgb) {
  ctx.doc.setFont("helvetica", style);
  ctx.doc.setFontSize(size * ctx.s);
  ctx.doc.setTextColor(...color);
}

// Texte sur plusieurs lignes ; renvoie la hauteur occupée.
function block(ctx: Ctx, text: string, x: number, width: number, size: number, lead = 1.32): number {
  const lines: string[] = ctx.doc.splitTextToSize(text, width);
  const step = size * ctx.s * 0.3528 * lead;
  if (ctx.draw) lines.forEach((line, i) => ctx.doc.text(line, x, ctx.y + i * step));
  ctx.y += lines.length * step;
  return lines.length * step;
}

function section(ctx: Ctx, title: string) {
  ctx.y += 3.2 * ctx.s;
  font(ctx, 9.5, "bold", ctx.accent);
  if (ctx.draw) {
    ctx.doc.text(title.toUpperCase(), MARGIN, ctx.y);
    ctx.doc.setDrawColor(...ctx.accent);
    ctx.doc.setLineWidth(0.25);
    ctx.doc.line(MARGIN, ctx.y + 1.3 * ctx.s, PAGE_W - MARGIN, ctx.y + 1.3 * ctx.s);
  }
  ctx.y += 5.2 * ctx.s;
}

// Titre à gauche, dates alignées à droite.
function lineWithDates(ctx: Ctx, title: string, dates: string, size: number) {
  const width = PAGE_W - MARGIN * 2;
  font(ctx, size - 1, "normal", MUTED);
  const datesWidth = dates ? ctx.doc.getTextWidth(dates) + 4 : 0;
  if (ctx.draw && dates) ctx.doc.text(dates, PAGE_W - MARGIN, ctx.y, { align: "right" });
  font(ctx, size, "bold", TEXT);
  block(ctx, title, MARGIN, width - datesWidth, size, 1.25);
}

function render(doc: JsPdf, cv: TailoredCv, s: number, draw: boolean, accent: Rgb, photo: string, logo: Logo | null): number {
  const ctx: Ctx = { doc, s, draw, accent, y: MARGIN + 2 };
  const width = PAGE_W - MARGIN * 2;

  // En-tête : photo à gauche, nom, intitulé et coordonnées ; logo de l'entreprise à droite (option).
  const photoSize = photo ? 26 * Math.min(1, s + 0.1) : 0;
  const logoSize = logo ? 15 : 0;
  const left = MARGIN + (photo ? photoSize + 5 : 0);
  const headWidth = PAGE_W - MARGIN - left - (logo ? logoSize + 5 : 0);
  if (draw && photo) doc.addImage(photo, "PNG", MARGIN, MARGIN, photoSize, photoSize);
  if (draw && logo) {
    const scale = Math.min(logoSize / logo.width, logoSize / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;
    doc.addImage(logo.data, logo.data.startsWith("data:image/jpeg") ? "JPEG" : "PNG", PAGE_W - MARGIN - w, MARGIN, w, h);
  }
  ctx.y = MARGIN + 6.5 * s;
  font(ctx, 20, "bold", TEXT);
  block(ctx, cv.name, left, headWidth, 20, 1.1);
  if (cv.headline) {
    ctx.y += 0.5 * s;
    font(ctx, 11.5, "bold", accent);
    block(ctx, cv.headline, left, headWidth, 11.5, 1.2);
  }
  if (cv.contact.length) {
    ctx.y += 0.8 * s;
    font(ctx, 8.5, "normal", MUTED);
    block(ctx, cv.contact.join("   ·   "), left, headWidth, 8.5, 1.3);
  }
  ctx.y = Math.max(ctx.y, MARGIN + photoSize, MARGIN + logoSize) + 2 * s;

  if (cv.summary) {
    section(ctx, "Profil");
    font(ctx, 9, "normal", TEXT);
    block(ctx, cv.summary, MARGIN, width, 9, 1.35);
  }

  if (cv.experiences.length) {
    section(ctx, "Expérience professionnelle");
    cv.experiences.forEach((exp, index) => {
      if (index) ctx.y += 2.4 * s;
      lineWithDates(ctx, exp.role || exp.company, exp.dates, 10);
      const where = [exp.role ? exp.company : "", exp.place].filter(Boolean).join(" · ");
      if (where) {
        font(ctx, 8.8, "italic", MUTED);
        block(ctx, where, MARGIN, width, 8.8, 1.3);
      }
      ctx.y += 0.6 * s;
      font(ctx, 8.8, "normal", TEXT);
      for (const bullet of exp.bullets) {
        if (draw) {
          doc.setFillColor(...accent);
          doc.circle(MARGIN + 1.3, ctx.y - 1.05 * s, 0.55 * s, "F");
        }
        block(ctx, bullet, MARGIN + 4, width - 4, 8.8, 1.3);
        ctx.y += 0.5 * s;
      }
    });
  }

  if (cv.education.length) {
    section(ctx, "Formation");
    cv.education.forEach((edu, index) => {
      if (index) ctx.y += 1.6 * s;
      lineWithDates(ctx, edu.degree || edu.school, edu.dates, 9.5);
      if (edu.degree && edu.school) {
        font(ctx, 8.8, "italic", MUTED);
        block(ctx, edu.school, MARGIN, width, 8.8, 1.3);
      }
    });
  }

  const lists: [string, string[]][] = [
    ["Compétences", cv.skills],
    ["Langues", cv.languages],
    ["Atouts", cv.extras],
  ];
  for (const [title, items] of lists) {
    if (!items.length) continue;
    section(ctx, title);
    font(ctx, 8.8, "normal", TEXT);
    block(ctx, items.join("   ·   "), MARGIN, width, 8.8, 1.4);
  }
  return ctx.y;
}

// Retire une puce de l'expérience qui en a le plus (en partant de la fin) ; faux s'il n'y a plus rien à retirer.
function trimOne(cv: TailoredCv): boolean {
  let target = -1;
  cv.experiences.forEach((exp, i) => {
    if (exp.bullets.length > 1 && (target === -1 || exp.bullets.length >= cv.experiences[target].bullets.length)) target = i;
  });
  if (target === -1) {
    if (cv.extras.length) {
      cv.extras = [];
      return true;
    }
    return false;
  }
  cv.experiences[target].bullets = cv.experiences[target].bullets.slice(0, -1);
  return true;
}

export async function downloadCvPdf(source: TailoredCv, options: CvPdfOptions): Promise<void> {
  const [{ jsPDF }, logo] = await Promise.all([
    import("jspdf"),
    options.showLogo ? loadLogo(options.logoUrl, options.domain, options.companyName) : Promise.resolve(null),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Avec le logo affiché, les titres prennent la couleur de l'entreprise.
  const accent = logo?.color ?? MAUVE;
  const cv: TailoredCv = structuredClone(source);
  const limit = PAGE_H - MARGIN;

  let scale = 1;
  while (render(doc, cv, scale, false, accent, options.photo, logo) > limit) {
    if (scale > MIN_SCALE) scale = Math.max(MIN_SCALE, scale - 0.03);
    else if (!trimOne(cv)) break;
  }
  render(doc, cv, scale, true, accent, options.photo, logo);
  doc.save(fileName(options.domain, options.companyName, "cv"));
}

// Photo choisie par le candidat : recadrée en carré, arrondie et réduite, dans le navigateur uniquement.
export async function preparePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image illisible : choisissez une photo JPEG ou PNG."));
      image.src = url;
    });
    const size = 360;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Photo impossible à préparer sur ce navigateur.");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
