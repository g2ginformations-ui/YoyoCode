"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminToken, passwordMatches, requireAdmin } from "@/lib/auth";
import { parsePrice, slugify } from "@/lib/format";
import { UPLOADS_DIR, updateStore } from "@/lib/store";
import type { LinkItem, OrderStatus, Page, Product } from "@/lib/types";

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const lines = (value: string) => value.split("\n").map((l) => l.trim()).filter(Boolean);
const parts = (line: string) => line.split("|").map((p) => p.trim());

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

async function saveUploads(form: FormData, name: string): Promise<string[]> {
  const urls: string[] = [];
  for (const entry of form.getAll(name)) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    const ext = IMAGE_TYPES[entry.type];
    if (!ext) throw new Error(`Format d'image non pris en charge : ${entry.name}`);
    await mkdir(UPLOADS_DIR, { recursive: true });
    const file = `${randomUUID()}${ext}`;
    await writeFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, file), Buffer.from(await entry.arrayBuffer()));
    urls.push(`/uploads/${file}`);
  }
  return urls;
}

// ---- Connexion ----

export type LoginState = { error: string } | null;

export async function login(_state: LoginState, form: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD n'est pas défini sur le serveur." };
  if (!passwordMatches(text(form, "password"))) return { error: "Mot de passe incorrect." };
  const secure = (await headers()).get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
  (await cookies()).set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/connexion");
}

// ---- Produits ----

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name") || "Nouveau produit";
  const uploaded = await saveUploads(form, "upload");
  const values: Omit<Product, "id"> = {
    name,
    slug: slugify(text(form, "slug") || name),
    subtitle: text(form, "subtitle"),
    priceCents: parsePrice(form.get("price")) ?? 0,
    compareAtCents: parsePrice(form.get("compareAt")),
    category: text(form, "category"),
    images: [...lines(text(form, "images")), ...uploaded],
    description: text(form, "description"),
    howToUse: text(form, "howToUse"),
    ingredients: text(form, "ingredients"),
    optionName: text(form, "optionName"),
    optionValues: text(form, "optionValues").split(",").map((v) => v.trim()).filter(Boolean),
    stock: Math.max(0, Math.floor(Number(text(form, "stock")) || 0)),
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    position: Number(text(form, "position")) || 0,
  };

  const savedId = await updateStore((store) => {
    const taken = (slug: string) => store.products.some((p) => p.slug === slug && p.id !== id);
    let slug = values.slug || "produit";
    for (let n = 2; taken(slug); n++) slug = `${values.slug}-${n}`;
    const existing = store.products.find((p) => p.id === id);
    if (existing) {
      Object.assign(existing, values, { slug });
      return existing.id;
    }
    const product: Product = { ...values, slug, id: `p-${randomUUID().slice(0, 8)}` };
    store.products.push(product);
    return product.id;
  });
  redirect(`/admin/produits/${savedId}?ok=1`);
}

export async function duplicateProduct(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const newId = await updateStore((store) => {
    const source = store.products.find((p) => p.id === id);
    if (!source) return null;
    const copy: Product = {
      ...structuredClone(source),
      id: `p-${randomUUID().slice(0, 8)}`,
      name: `${source.name} (copie)`,
      slug: `${source.slug}-copie-${Date.now().toString(36)}`,
      published: false,
    };
    store.products.push(copy);
    return copy.id;
  });
  redirect(newId ? `/admin/produits/${newId}` : "/admin/produits");
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  await updateStore((store) => {
    store.products = store.products.filter((p) => p.id !== id);
  });
  redirect("/admin/produits");
}

// ---- Pages ----

export async function savePage(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const title = text(form, "title") || "Nouvelle page";
  const values: Omit<Page, "id"> = {
    title,
    slug: slugify(text(form, "slug") || title),
    content: text(form, "content"),
    published: form.get("published") === "on",
  };
  const savedId = await updateStore((store) => {
    const taken = (slug: string) => store.pages.some((p) => p.slug === slug && p.id !== id);
    let slug = values.slug || "page";
    for (let n = 2; taken(slug); n++) slug = `${values.slug}-${n}`;
    const existing = store.pages.find((p) => p.id === id);
    if (existing) {
      Object.assign(existing, values, { slug });
      return existing.id;
    }
    const page: Page = { ...values, slug, id: `pg-${randomUUID().slice(0, 8)}` };
    store.pages.push(page);
    return page.id;
  });
  redirect(`/admin/pages/${savedId}?ok=1`);
}

export async function deletePage(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  await updateStore((store) => {
    store.pages = store.pages.filter((p) => p.id !== id);
  });
  redirect("/admin/pages");
}

// ---- Réglages ----

const links = (value: string): LinkItem[] =>
  lines(value).map((line) => {
    const [label, href] = parts(line);
    return { label, href: href || "/" };
  });

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const [logo] = await saveUploads(form, "logoUpload");
  const [heroImage] = await saveUploads(form, "heroUpload");
  const beforeAfterUploads = await saveUploads(form, "beforeAfterUpload");
  await updateStore(({ settings }) => {
    settings.brandName = text(form, "brandName") || settings.brandName;
    settings.tagline = text(form, "tagline");
    settings.announcement = text(form, "announcement");
    settings.logoUrl = logo ?? text(form, "logoUrl");
    settings.colors = {
      background: text(form, "colorBackground") || settings.colors.background,
      text: text(form, "colorText") || settings.colors.text,
      primary: text(form, "colorPrimary") || settings.colors.primary,
      accent: text(form, "colorAccent") || settings.colors.accent,
      muted: text(form, "colorMuted") || settings.colors.muted,
    };
    settings.hero = {
      title: text(form, "heroTitle"),
      subtitle: text(form, "heroSubtitle"),
      ctaLabel: text(form, "heroCtaLabel"),
      ctaHref: text(form, "heroCtaHref"),
      image: heroImage ?? text(form, "heroImage"),
    };
    settings.menu = links(text(form, "menu"));
    settings.footerLinks = links(text(form, "footerLinks"));
    settings.categories = lines(text(form, "categories")).map((line) => {
      const [slug, name, description] = parts(line);
      return { slug: slugify(slug), name: name || slug, description: description ?? "" };
    });
    settings.benefits = lines(text(form, "benefits")).map((line) => {
      const [title, body] = parts(line);
      return { title, text: body ?? "" };
    });
    settings.testimonials = lines(text(form, "testimonials")).map((line) => {
      const [name, rating, body] = parts(line);
      return { name, rating: Math.max(1, Math.min(5, Number(rating) || 5)), text: body ?? "" };
    });
    settings.contactEmail = text(form, "contactEmail");
    settings.instagram = text(form, "instagram");
    settings.tiktok = text(form, "tiktok");
    settings.footerText = text(form, "footerText");
    settings.shippingCents = parsePrice(form.get("shipping")) ?? 0;
    settings.freeShippingFromCents = parsePrice(form.get("freeShippingFrom")) ?? 0;
    settings.beforeAfter = {
      title: text(form, "beforeAfterTitle"),
      text: text(form, "beforeAfterText"),
      images: [...lines(text(form, "beforeAfterImages")), ...beforeAfterUploads],
    };
    settings.newsletter = {
      enabled: form.get("newsletterEnabled") === "on",
      title: text(form, "newsletterTitle"),
      text: text(form, "newsletterText"),
      code: text(form, "newsletterCode").toUpperCase().replace(/\s/g, ""),
      percent: Math.max(0, Math.min(100, Number(text(form, "newsletterPercent")) || 0)),
    };
  });
  redirect("/admin/reglages?ok=1");
}

// ---- Commandes ----

const STATUSES: OrderStatus[] = ["en attente", "payée", "expédiée", "annulée"];

export async function setOrderStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const status = text(form, "status") as OrderStatus;
  if (!STATUSES.includes(status)) return;
  await updateStore((store) => {
    const order = store.orders.find((o) => o.id === id);
    if (order) order.status = status;
  });
  redirect(`/admin/commandes/${encodeURIComponent(id)}?ok=1`);
}
