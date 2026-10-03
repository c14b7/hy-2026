"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { FilePlus2, Pencil, Trash2 } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { KnowledgeArticle, KnowledgeKind } from "@/types/domain"
import { cn } from "cn"

const KIND_LABELS: Record<KnowledgeKind, string> = {
  edu: "Edukacja",
  report: "Raport",
  canvas: "Canva",
  video: "Film",
}

const STATUS_LABELS: Record<KnowledgeArticle["status"], string> = {
  draft: "Szkic",
  pending: "Do weryfikacji",
  published: "Opublikowany",
  rejected: "Odrzucony",
}

export function KnowledgePanel() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [kind, setKind] = useState<"" | KnowledgeKind>("")
  const [status, setStatus] = useState<"" | KnowledgeArticle["status"]>("")

  async function refresh() {
    setLoading(true)
    const list = await getServices().knowledge.listAll()
    setArticles(list)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (kind && a.kind !== kind) return false
      if (status && a.status !== status) return false
      if (q) {
        const hay = `${a.title} ${a.summary} ${a.tags.join(" ")}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [articles, q, kind, status])

  async function remove(id: string, title: string) {
    if (!window.confirm(`Usunąć wpis „${title}”?`)) return
    await getServices().knowledge.remove(id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-medium">Wiki / wiedza organizacji</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Wewnętrzna baza wiedzy Hubu — karty wpisów, Markdown, linki. Zmiany zapisują się w
            warstwie mock (gotowe pod Appwrite).
          </p>
        </div>
        <Link href="/panel/wiedza/nowy" className={cn(buttonVariants())}>
          <FilePlus2 className="size-4" />
          Nowy wpis
        </Link>
      </div>

      <div className="grid gap-2 rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-3 sm:grid-cols-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj w tytułach i tagach…"
          aria-label="Szukaj wpisów"
        />
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value as "" | KnowledgeKind)}
          aria-label="Filtr typu"
        >
          <option value="">Wszystkie typy</option>
          {(Object.keys(KIND_LABELS) as KnowledgeKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | KnowledgeArticle["status"])}
          aria-label="Filtr statusu"
        >
          <option value="">Wszystkie statusy</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Ładowanie wpisów…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Brak wpisów"
          description="Dodaj pierwszy artykuł wiki albo zmień filtry."
          actionHref="/panel/wiedza/nowy"
          actionLabel="Nowy wpis"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id} className="h-full">
              <CardHeader>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{KIND_LABELS[a.kind]}</Badge>
                  <Badge variant="outline">{STATUS_LABELS[a.status]}</Badge>
                </div>
                <CardTitle>
                  <Link href={`/panel/wiedza/${a.id}`} className="hover:underline">
                    {a.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">{a.summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {a.tags.slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
                <span className="w-full text-xs text-muted-foreground">
                  {a.updatedAt} · ~{a.readingMinutes} min
                </span>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Link
                  href={`/panel/wiedza/${a.id}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  Otwórz
                </Link>
                <Link
                  href={`/panel/wiedza/${a.id}/edytuj`}
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                >
                  <Pencil className="size-3.5" />
                  Edytuj
                </Link>
                {a.status === "published" ? (
                  <Link
                    href={`/wiedza/${a.slug}`}
                    className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                  >
                    Publiczny
                  </Link>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(a.id, a.title)}
                >
                  <Trash2 className="size-3.5" />
                  Usuń
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
