// Lettre au format PDF, générée dans le navigateur et téléchargée directement (aucune boîte d'impression).
// jsPDF n'est chargé qu'au clic pour ne pas alourdir la page.

export type Rgb = [number, number, number];

export type Logo = { data: string; width: number; height: number; color: Rgb | null };

// Styles proposés pour le PDF. Les trois premiers restent sur fond blanc (impression, logiciels de tri) ;
// « Sombre » est une option assumée, signalée par un avertissement à l'écran.
// Seul « Classique » est ouvert à tous : les autres sont inclus dans les offres illimitées (semaine, mois, à vie).
export const PDF_STYLES = [
  { id: "classique", label: "Classique", hint: "Sobre, police à empattements", premium: false },
  { id: "moderne", label: "Moderne", hint: "Liseré aux couleurs de l'entreprise, police sans empattements", premium: true },
  { id: "minimaliste", label: "Minimaliste", hint: "Épuré, grandes marges", premium: true },
  { id: "sombre", label: "Sombre", hint: "Fond noir, texte blanc", premium: true },
] as const;

export type PdfStyle = (typeof PDF_STYLES)[number]["id"];

export function isPdfStyle(value: unknown): value is PdfStyle {
  return PDF_STYLES.some((style) => style.id === value);
}

export function isPremiumPdfStyle(style: PdfStyle): boolean {
  return PDF_STYLES.some((s) => s.id === style && s.premium);
}

type Layout = {
  font: "times" | "helvetica";
  fontSize: number;
  lineHeight: number;
  margin: number;
  text: Rgb;
  // Fond de page (null : papier blanc, rien n'est dessiné).
  background: Rgb | null;
  // Liseré vertical à gauche de chaque page.
  band: { color: Rgb; width: number } | null;
  // Filet fin sous le logo.
  rule: Rgb | null;
  logoSize: number;
  logoSide: "left" | "right";
  // Pastille claire derrière le logo, pour qu'il reste visible sur fond sombre.
  logoTile: Rgb | null;
};

const MAUVE: Rgb = [142, 110, 130];

const LAYOUTS: Record<PdfStyle, Layout> = {
  classique: {
    font: "times", fontSize: 11.5, lineHeight: 5.6, margin: 22, text: [0, 0, 0],
    background: null, band: null, rule: null, logoSize: 18, logoSide: "right", logoTile: null,
  },
  moderne: {
    font: "helvetica", fontSize: 10.5, lineHeight: 5.4, margin: 24, text: [51, 51, 51],
    background: null, band: { color: MAUVE, width: 6 }, rule: MAUVE, logoSize: 18, logoSide: "right", logoTile: null,
  },
  minimaliste: {
    font: "helvetica", fontSize: 10.5, lineHeight: 5.8, margin: 28, text: [43, 43, 43],
    background: null, band: null, rule: [210, 210, 210], logoSize: 14, logoSide: "left", logoTile: null,
  },
  sombre: {
    font: "helvetica", fontSize: 10.5, lineHeight: 5.6, margin: 24, text: [242, 242, 242],
    background: [17, 17, 17], band: null, rule: [90, 90, 90], logoSize: 16, logoSide: "right", logoTile: [255, 255, 255],
  },
};

const STYLE_KEY = "mymotiv:style-pdf";

export function readPdfStyle(): PdfStyle {
  try {
    const saved = window.localStorage.getItem(STYLE_KEY);
    // « Sombre » n'est jamais repris d'une visite à l'autre : chaque nouvelle lettre repart sur un style
    // à fond blanc, le fond noir doit être choisi exprès (et son avertissement lu) à chaque fois.
    return isPdfStyle(saved) && saved !== "sombre" ? saved : "classique";
  } catch {
    return "classique";
  }
}

export function savePdfStyle(style: PdfStyle): void {
  try {
    window.localStorage.setItem(STYLE_KEY, style);
  } catch {
    // Stockage indisponible : le style revient à « Classique » à la prochaine visite.
  }
}

// Logo de l'entreprise : celui publié avec l'offre s'il existe, sinon l'icône de son site.
async function fetchLogo(query: string): Promise<Logo | null> {
  try {
    const res = await fetch(`/api/logo?${query}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = data;
    });
    // Les icônes trop petites (16 px) seraient floues une fois imprimées : on les ignore.
    if (img.naturalWidth < 48 || img.naturalHeight < 48) return null;
    return { data: toPng(img) ?? data, width: img.naturalWidth, height: img.naturalHeight, color: dominantColor(img) };
  } catch {
    return null;
  }
}

// Tous les formats de logo (ICO, WebP, GIF…) passent en PNG : c'est ce que le PDF sait intégrer.
function toPng(img: HTMLImageElement): string | null {
  try {
    const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function loadLogo(logoUrl: string, domain: string, name = ""): Promise<Logo | null> {
  if (logoUrl) {
    const logo = await fetchLogo(`url=${encodeURIComponent(logoUrl)}`);
    if (logo) return logo;
  }
  return domain ? fetchLogo(`domain=${encodeURIComponent(domain)}&nom=${encodeURIComponent(name)}`) : null;
}

// Couleur dominante du logo (hors blanc, noir et gris), pour habiller le style Moderne aux couleurs
// de l'entreprise. Trop claire, elle est foncée pour rester visible sur la page blanche.
function dominantColor(img: HTMLImageElement): Rgb | null {
  try {
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (a < 200 || max - min < 40 || max < 40) continue;
      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      bucket.n++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      buckets.set(key, bucket);
    }
    const best = [...buckets.values()].sort((x, y) => y.n - x.n)[0];
    // Moins de 3 % de pixels colorés : logo noir et blanc, on garde le mauve MyMotiv.
    if (!best || best.n < size * size * 0.03) return null;
    let color: Rgb = [best.r / best.n, best.g / best.n, best.b / best.n];
    const luminance = (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255;
    if (luminance > 0.6) color = color.map((c) => c * (0.6 / luminance)) as Rgb;
    return color.map(Math.round) as Rgb;
  } catch {
    return null;
  }
}

export function fileName(domain: string, companyName: string, prefix = "lettre-de-motivation"): string {
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const company = slug(companyName) || slug(domain.split(".")[0] ?? "");
  return company ? `${prefix}-${company}.pdf` : `${prefix}.pdf`;
}

export type PdfOptions = {
  domain: string;
  companyName?: string;
  style?: PdfStyle;
  // Logo officiel publié avec l'offre (lien lu depuis la page de l'offre).
  logoUrl?: string;
};

// Taille de texte minimale : en dessous, la lettre passe sur deux pages plutôt que de devenir illisible.
const MIN_FONT_SIZE = 9.5;
const MIN_MARGIN = 16;

export async function downloadLetterPdf(letter: string, options: PdfOptions): Promise<void> {
  const { domain, companyName = "", style = "classique", logoUrl = "" } = options;
  const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), loadLogo(logoUrl, domain, companyName)]);
  const base = LAYOUTS[style];
  // Style Moderne : liseré et filet aux couleurs du logo de l'entreprise, quand il est en couleur.
  const accent = style === "moderne" && logo?.color ? logo.color : null;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const paragraphs = letter.replace(/\r/g, "").split("\n");

  const logoBox = logo
    ? (() => {
        const scale = Math.min(base.logoSize / logo.width, base.logoSize / logo.height);
        return { width: logo.width * scale, height: logo.height * scale };
      })()
    : null;
  const headerHeight = (logoBox ? logoBox.height + (base.logoTile ? 10 : 8) : 0) + (base.rule ? 4 : 0);

  // Lettre sur une seule page : on réduit d'abord la taille du texte, puis les marges.
  const fit = (fontSize: number, margin: number) => {
    const lineHeight = (base.lineHeight * fontSize) / base.fontSize;
    doc.setFont(base.font, "normal");
    doc.setFontSize(fontSize);
    const width = pageWidth - margin * 2;
    const lines = paragraphs.reduce(
      (total, p) => total + (p.trim() ? (doc.splitTextToSize(p, width) as string[]).length : 1),
      0,
    );
    return { fontSize, margin, lineHeight, fits: margin + headerHeight + lines * lineHeight <= pageHeight - margin + lineHeight };
  };
  let layout = fit(base.fontSize, base.margin);
  for (let size = base.fontSize - 0.25; !layout.fits && size >= MIN_FONT_SIZE; size -= 0.25) layout = fit(size, base.margin);
  for (let margin = base.margin - 2; !layout.fits && margin >= MIN_MARGIN; margin -= 2) layout = fit(MIN_FONT_SIZE, margin);
  if (!layout.fits) layout = fit(base.fontSize, base.margin);
  const { fontSize, margin, lineHeight } = layout;
  const textWidth = pageWidth - margin * 2;

  // Fond et liseré, redessinés sur chaque nouvelle page avant le texte.
  const decorate = () => {
    if (base.background) {
      doc.setFillColor(...base.background);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    }
    if (base.band) {
      doc.setFillColor(...(accent ?? base.band.color));
      doc.rect(0, 0, base.band.width, pageHeight, "F");
    }
  };
  decorate();
  let y = margin;

  if (logo && logoBox) {
    const { width, height } = logoBox;
    const x = base.logoSide === "right" ? pageWidth - margin - width : margin;
    if (base.logoTile) {
      const pad = 2.5;
      doc.setFillColor(...base.logoTile);
      doc.roundedRect(x - pad, y - pad, width + pad * 2, height + pad * 2, 2, 2, "F");
    }
    doc.addImage(logo.data, logo.data.startsWith("data:image/jpeg") ? "JPEG" : "PNG", x, y, width, height);
    y += height + (base.logoTile ? 10 : 8);
  }

  if (base.rule) {
    doc.setDrawColor(...(accent ?? base.rule));
    doc.setLineWidth(0.3);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
    y += 4;
  }

  doc.setFont(base.font, "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...base.text);
  for (const paragraph of paragraphs) {
    const lines: string[] = paragraph.trim() ? doc.splitTextToSize(paragraph, textWidth) : [""];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        decorate();
        // Le texte garde sa couleur après le dessin du fond.
        doc.setTextColor(...base.text);
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  doc.save(fileName(domain, companyName));
}
