import { currentAccess } from "@/lib/access";
import { aiProvider } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ...(await currentAccess()), ai: aiProvider() });
}
