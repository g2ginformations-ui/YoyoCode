import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { readStore } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = (await readStore()).pages.find((p) => p.slug === slug && p.published);
  return page ? { title: page.title } : {};
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = (await readStore()).pages.find((p) => p.slug === slug && p.published);
  if (!page) notFound();
  return (
    <article className="container narrow section">
      <h1>{page.title}</h1>
      <Markdown source={page.content} />
    </article>
  );
}
