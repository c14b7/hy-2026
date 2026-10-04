import { notFound } from "next/navigation"

import { MarkdownView } from "@/components/knowledge/markdown-view"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"

export default async function WiedzaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getServices().knowledge.getBySlug(slug)
  if (!article || article.status !== "published") notFound()

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <Badge variant="secondary">{article.kind}</Badge>
      <h1 className="font-heading text-3xl font-medium">{article.title}</h1>
      <p className="text-muted-foreground">{article.summary}</p>
      <div className="rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-6">
        <MarkdownView content={article.body} />
      </div>
      <p className="text-xs text-muted-foreground">
        Aktualizacja: {article.updatedAt} · ok. {article.readingMinutes} min czytania
      </p>
    </article>
  )
}
