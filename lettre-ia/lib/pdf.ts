// Lettre au format PDF, générée dans le navigateur et téléchargée directement (aucune boîte d'impression).
// jsPDF n'est chargé qu'au clic pour ne pas alourdir la page.

type Logo = { data: string; width: number; height: number };

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

export async function downloadLetterPdf(letter: string, domain: string, companyName = ""): Promise<void> {
  const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), loadLogo(domain)]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 22;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - margin * 2;
  const lineHeight = 5.6;
  let y = margin;

  if (logo) {
    const maxSize = 18;
    const scale = Math.min(maxSize / logo.width, maxSize / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    doc.addImage(logo.data, logo.data.startsWith("data:image/jpeg") ? "JPEG" : "PNG", pageWidth - margin - width, y, width, height);
    y += height + 8;
  }

  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  for (const paragraph of letter.replace(/\r/g, "").split("\n")) {
    const lines: string[] = paragraph.trim() ? doc.splitTextToSize(paragraph, textWidth) : [""];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  doc.save(fileName(domain, companyName));
}
