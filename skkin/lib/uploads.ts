import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, dbEnabled } from "@/lib/db";
import { DATA_DIR } from "@/lib/store";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export async function saveUpload(name: string, type: string, data: Buffer) {
  if (dbEnabled()) {
    const sql = await db();
    await sql`insert into skkin_uploads (name, type, data) values (${name}, ${type}, ${data})`;
    return;
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name), data);
}

export async function readUpload(name: string): Promise<Buffer | null> {
  if (dbEnabled()) {
    const sql = await db();
    const [row] = await sql`select data from skkin_uploads where name = ${name}`;
    return row ? Buffer.from(row.data) : null;
  }
  try {
    return await readFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name));
  } catch {
    return null;
  }
}
