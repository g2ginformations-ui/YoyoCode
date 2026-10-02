import path from "node:path";
import { readUpload } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Photos envoyées depuis l'admin (DATA_DIR ou Postgres), servies sans rebuild.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = path.basename(file);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name !== file) return new Response("Introuvable", { status: 404 });
  const data = await readUpload(name);
  if (!data) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
