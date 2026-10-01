import { isAdmin } from "@/lib/auth";
import { readStore } from "@/lib/store";

// Export à importer dans Brevo, Mailchimp, Klaviyo…
export async function GET() {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  const { subscribers } = await readStore();
  const csv = ["email,date_inscription", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-skkin.csv"',
    },
  });
}
