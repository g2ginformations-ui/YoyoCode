// Lettre au format PDF, générée dans le navigateur et téléchargée directement (aucune boîte d'impression).
// jsPDF n'est chargé qu'au clic pour ne pas alourdir la page.

type Logo = { data: string; width: number; height: number };

// Styles proposés pour le PDF. Les trois premiers restent sur fond blanc (impression, logiciels de tri) ;
// « Sombre » est une option assumée, signalée par un avertissement à l'écran.
// Seul « Classique » est ouvert à tous : les autres sont inclus dans les offres illimitées (semaine, mois, à vie).
export const PDF_STYLES = [
  { id: "classique", label: "Classique", hint: "Sobre, police à empattements", premium: false },
  { id: "moderne", label: "Moderne", hint: "Liseré mauve, police sans empattements", premium: true },
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

type Rgb = [number, number, number];

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
    return isPdfStyle(saved) ? saved : "classique";
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

async function loadLogo(domain: string): Promise<Logo | null> {
  if (!domain) return null;
  try {
    const res = await fetch(`/api/logo?domain=${encodeURIComponent(domain)}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = data;
    });
    // Les icônes trop petites (16 px) seraient floues une fois imprimées : on les ignore.
    if (size.width < 48 || size.height < 48) return null;
    return { data, ...size };
  } catch {
    return null;
  }
}

function fileName(domain: string, companyName: string): string {
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const company = slug(companyName) || slug(domain.split(".")[0] ?? "");
  return company ? `lettre-de-motivation-${company}.pdf` : "lettre-de-motivation.pdf";
}

export async function downloadLetterPdf(
  letter: string,
  domain: string,
  companyName = "",
  style: PdfStyle = "classique",
): Promise<void> {
  const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), loadLogo(domain)]);
  const layout = LAYOUTS[style];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { margin, lineHeight } = layout;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - margin * 2;

  // Fond et liseré, redessinés sur chaque nouvelle page avant le texte.
  const decorate = () => {
    if (layout.background) {
      doc.setFillColor(...layout.background);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    }
    if (layout.band) {
      doc.setFillColor(...layout.band.color);
      doc.rect(0, 0, layout.band.width, pageHeight, "F");
    }
  };
  decorate();
  let y = margin;

  if (logo) {
    const scale = Math.min(layout.logoSize / logo.width, layout.logoSize / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    const x = layout.logoSide === "right" ? pageWidth - margin - width : margin;
    if (layout.logoTile) {
      const pad = 2.5;
      doc.setFillColor(...layout.logoTile);
      doc.roundedRect(x - pad, y - pad, width + pad * 2, height + pad * 2, 2, 2, "F");
    }
    doc.addImage(logo.data, logo.data.startsWith("data:image/jpeg") ? "JPEG" : "PNG", x, y, width, height);
    y += height + (layout.logoTile ? 10 : 8);
  }

  if (layout.rule) {
    doc.setDrawColor(...layout.rule);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
    y += 4;
  }

  doc.setFont(layout.font, "normal");
  doc.setFontSize(layout.fontSize);
  doc.setTextColor(...layout.text);
  for (const paragraph of letter.replace(/\r/g, "").split("\n")) {
    const lines: string[] = paragraph.trim() ? doc.splitTextToSize(paragraph, textWidth) : [""];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        decorate();
        // Le texte garde sa couleur après le dessin du fond.
        doc.setTextColor(...layout.text);
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  doc.save(fileName(domain, companyName));
}
