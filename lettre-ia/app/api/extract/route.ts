import { MAX_FILE_BYTES, fileToText } from "@/lib/extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "Fichier trop volumineux (10 Mo maximum)." }, { status: 413 });
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
