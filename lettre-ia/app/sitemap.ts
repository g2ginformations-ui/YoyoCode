import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { NEWS } from "@/lib/news";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/abonnement`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/conseils`, changeFrequency: "weekly", priority: 0.8 },
    ...GUIDES.map((guide) => ({
      url: `${SITE_URL}/conseils/${guide.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/actualites`, changeFrequency: "weekly", priority: 0.8 },
    ...NEWS.map((article) => ({
      url: `${SITE_URL}/actualites/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
