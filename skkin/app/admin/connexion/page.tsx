import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/connexion/LoginForm";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion admin", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="admin-login">
      <LoginForm />
    </div>
  );
}
