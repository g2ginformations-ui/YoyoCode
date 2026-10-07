import { UNREADABLE, fileToText } from "@/lib/extract";
import { rateLimited } from "@/lib/guard";
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from "@/lib/upload";

export const runtime = "nodejs";
// Une photo de CV est lue par l'IA : quelques secondes de plus qu'un PDF.
export const maxDuration = 60;

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { error: `Fichier trop volumineux (${MAX_FILE_LABEL} maximum) : collez plutôt le texte.` },
      { status: 413 },
    );
  }

  try {
    // 20 lectures par l'IA (photos, PDF scannés) par heure et par adresse IP au maximum.
    const text = (await fileToText(file, async () => !(await rateLimited(request, "ocr", 20, 3600)))).replace(/\n{3,}/g, "\n\n").trim();
    if (!text) {
      return Response.json(
        { error: UNREADABLE },
        { status: 422 },
      );
    }
    return Response.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lecture du fichier impossible.";
    return Response.json({ error: message }, { status: 422 });
  }
}
