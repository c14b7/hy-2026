"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { MarkdownView } from "@/components/knowledge/markdown-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getServices } from "@/lib/services"
import type { KnowledgeArticle } from "@/types/domain"
import { cn } from "cn"

export function KnowledgeDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices()
      .knowledge.getById(params.id)
      .then((a) => {
        setArticle(a)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-3">
        <p>Nie znaleziono wpisu.</p>
        <Link href="/panel/wiedza" className={cn(buttonVariants())}>
          Wróć do listy
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{article.kind}</Badge>
            <Badge variant="outline">{article.status}</Badge>
          </div>
          <h1 className="font-heading text-3xl font-medium tracking-tight">{article.title}</h1>
          <p className="text-muted-foreground">{article.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/panel/wiedza/${article.id}/edytuj`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Edytuj
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push("/panel/wiedza")}
          >
            Lista
          </Button>
        </div>
      </div>

      <div className="rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-6">
        <MarkdownView content={article.body} />
      </div>

      <div className="flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Aktualizacja: {article.updatedAt} · ~{article.readingMinutes} min · slug:{" "}
        <code className="rounded bg-muted px-1">{article.slug}</code>
        {article.status === "published" ? (
          <>
            {" · "}
            <Link href={`/wiedza/${article.slug}`} className="text-primary hover:underline">
              widok publiczny
            </Link>
          </>
        ) : null}
      </p>
    </article>
  )
}
