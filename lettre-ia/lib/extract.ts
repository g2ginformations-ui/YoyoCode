import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { readDocument, type OcrMediaType } from "@/lib/claude";
import { mistralEnabled, readImageMistral } from "@/lib/mistral";

const IMAGE_TYPES: Record<string, OcrMediaType> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
};

const OCR_INSTRUCTION =
  "Ce document est un CV ou une offre d'emploi (photo, capture d'écran ou scan). Transcris fidèlement TOUT son texte, " +
  "dans l'ordre de lecture, en gardant les titres de sections et les listes (une ligne par élément). N'invente rien, " +
  "ne corrige pas, ne résume pas, n'ajoute aucun commentaire. Si le document ne contient pas de texte lisible, " +
  "réponds exactement : AUCUN_TEXTE";

export const UNREADABLE = "Aucun texte lisible dans ce fichier. Reprenez la photo bien à plat, avec de la lumière, ou collez le texte.";

// Type d'image reconnu d'après le nom ou le type du fichier (null si ce n'est pas une image prise en charge).
export function imageType(file: File): OcrMediaType | null {
  const fromType = Object.values(IMAGE_TYPES).find((t) => t === file.type);
  return fromType ?? IMAGE_TYPES[file.name.toLowerCase().split(".").pop() ?? ""] ?? null;
}

// Lecture par l'IA (image ou PDF scanné) : Claude si sa clé est configurée, sinon Mistral (images seulement).
async function ocr(buffer: Uint8Array, mediaType: OcrMediaType): Promise<string> {
  const data = Buffer.from(buffer).toString("base64");
  const claude = Boolean(process.env.ANTHROPIC_API_KEY);
  if (!claude && !(mistralEnabled() && mediaType !== "application/pdf")) throw new Error(UNREADABLE);
  try {
    const text = claude
      ? await readDocument(data, mediaType, OCR_INSTRUCTION)
      : await readImageMistral(data, mediaType, OCR_INSTRUCTION);
    return text.includes("AUCUN_TEXTE") ? "" : text;
  } catch (error) {
    console.error(error);
    throw new Error("Lecture de la photo impossible pour le moment : réessayez, ou collez le texte de votre CV.");
  }
}

// Convertit un fichier importé (PDF, DOCX, TXT, image) en texte brut.
// allowOcr est appelé juste avant une lecture par l'IA (payante) : il peut la refuser (limite d'abus).
export async function fileToText(file: File, allowOcr: () => Promise<boolean> = async () => true): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = new Uint8Array(await file.arrayBuffer());

  const image = imageType(file);
  if (image) {
    if (!(await allowOcr())) throw new Error("Trop de photos envoyées : réessayez dans une heure, ou collez le texte.");
    return ocr(buffer, image);
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdf = await getDocumentProxy(buffer.slice());
    const { text } = await extractText(pdf, { mergePages: true });
    // PDF scanné (une image dans un PDF) : presque pas de texte, on le fait lire par l'IA.
    if (text.replace(/\s+/g, "").length >= 40 || !process.env.ANTHROPIC_API_KEY) return text;
    if (!(await allowOcr())) return text;
    return ocr(buffer, "application/pdf");
  }
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return value;
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return new TextDecoder().decode(buffer);
  }
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    throw new Error("Photo au format HEIC : prenez une capture d'écran du CV, ou exportez-la en JPEG.");
  }
  throw new Error("Format non pris en charge. Utilisez un PDF, un DOCX, un fichier texte ou une photo (JPG, PNG).");
}
