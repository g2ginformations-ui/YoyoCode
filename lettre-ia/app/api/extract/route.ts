import { fileToText } from "@/lib/extract";
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from "@/lib/upload";

export const runtime = "nodejs";

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
    const text = (await fileToText(file)).replace(/\n{3,}/g, "\n\n").trim();
    if (!text) {
      return Response.json(
        { error: "Aucun texte lisible dans ce fichier (PDF scanné ?). Collez le texte directement." },
        { status: 422 },
      );
    }
    return Response.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lecture du fichier impossible.";
    return Response.json({ error: message }, { status: 422 });
  }
}
