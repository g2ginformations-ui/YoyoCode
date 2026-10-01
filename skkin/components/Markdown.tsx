import { markdownToHtml } from "@/lib/markdown";

export function Markdown({ source, className = "prose" }: { source: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: markdownToHtml(source) }} />;
}
