"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Bold, Eye, Heading2, Italic, Link2, List, ListOrdered } from "lucide-react"

import { MarkdownView } from "@/components/knowledge/markdown-view"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServices } from "@/lib/services"
import type { KnowledgeArticle, KnowledgeKind, PublishStatus } from "@/types/domain"

const KIND_LABELS: Record<KnowledgeKind, string> = {
  edu: "Edukacja",
  report: "Raport",
  canvas: "Canva",
  video: "Film / media",
}

type FormState = {
  title: string
  slug: string
  kind: KnowledgeKind
  summary: string
  body: string
  tags: string
  status: PublishStatus
  externalUrl: string
}

function toForm(article?: KnowledgeArticle | null): FormState {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    kind: article?.kind ?? "edu",
    summary: article?.summary ?? "",
    body: article?.body ?? "",
    tags: article?.tags.join(", ") ?? "",
    status: article?.status ?? "draft",
    externalUrl: "",
  }
}

export function KnowledgeEditor({
  article,
  mode,
}: {
  article?: KnowledgeArticle | null
  mode: "create" | "edit"
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toForm(article))
  const [tab, setTab] = useState<"write" | "preview">("write")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null)

  const previewBody = useMemo(() => {
    let body = form.body
    if (form.externalUrl.trim()) {
      body += `\n\n**Powiązany link:** [${form.externalUrl.trim()}](${form.externalUrl.trim()})`
    }
    return body
  }, [form.body, form.externalUrl])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function wrapSelection(before: string, after = before) {
    const el = textareaEl
    if (!el) {
      patch("body", `${form.body}${before}${after}`)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.body.slice(start, end) || "tekst"
    const next =
      form.body.slice(0, start) + before + selected + after + form.body.slice(end)
    patch("body", next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + before.length + selected.length + after.length
      el.setSelectionRange(pos, pos)
    })
  }

  function insertLine(prefix: string) {
    const el = textareaEl
    if (!el) {
      patch("body", `${form.body}\n${prefix}`)
      return
    }
    const start = el.selectionStart
    const lineStart = form.body.lastIndexOf("\n", start - 1) + 1
    const next = form.body.slice(0, lineStart) + prefix + form.body.slice(lineStart)
    patch("body", next)
  }

  function insertLink() {
    const url = form.externalUrl.trim() || "https://example.com"
    wrapSelection("[", `](${url})`)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError("Podaj tytuł wpisu.")
      return
    }
    if (!form.body.trim()) {
      setError("Treść nie może być pusta — możesz użyć Markdown.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      let body = form.body.trim()
      if (form.externalUrl.trim() && !body.includes(form.externalUrl.trim())) {
        body += `\n\n**Powiązany link:** [${form.title.trim() || "Źródło"}](${form.externalUrl.trim()})`
      }
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        kind: form.kind,
        summary: form.summary.trim() || form.body.trim().slice(0, 140),
        body,
        tags,
        challengeIds: article?.challengeIds ?? [],
        status: form.status,
      }

      if (mode === "create") {
        const created = await getServices().knowledge.create(payload)
        router.push(`/panel/wiedza/${created.id}`)
        router.refresh()
      } else if (article) {
        await getServices().knowledge.update(article.id, payload)
        router.push(`/panel/wiedza/${article.id}`)
        router.refresh()
      }
    } catch {
      setError("Nie udało się zapisać wpisu. Spróbuj ponownie.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            {mode === "create" ? "Nowy wpis wiki" : "Edycja wpisu"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Markdown: nagłówki, listy, **pogrubienie**, linki `[tekst](url)`.
          </p>
        </div>
        <Link href="/panel/wiedza" className="text-sm text-muted-foreground hover:underline">
          ← Lista wpisów
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="title">Tytuł</FieldLabel>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => patch("title", e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug (URL)</FieldLabel>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => patch("slug", e.target.value)}
            placeholder="auto z tytułu, jeśli puste"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="kind">Typ</FieldLabel>
          <Select
            id="kind"
            value={form.kind}
            onChange={(e) => patch("kind", e.target.value as KnowledgeKind)}
          >
            {(Object.keys(KIND_LABELS) as KnowledgeKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            id="status"
            value={form.status}
            onChange={(e) => patch("status", e.target.value as PublishStatus)}
          >
            <option value="draft">Szkic</option>
            <option value="pending">Do weryfikacji</option>
            <option value="published">Opublikowany</option>
            <option value="rejected">Odrzucony</option>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="summary">Krótki opis</FieldLabel>
        <Input
          id="summary"
          value={form.summary}
          onChange={(e) => patch("summary", e.target.value)}
          placeholder="Widoczny na kartach katalogu"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="tags">Tagi (po przecinku)</FieldLabel>
        <Input
          id="tags"
          value={form.tags}
          onChange={(e) => patch("tags", e.target.value)}
          placeholder="np. seniorzy, canva, wdrozenie"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="externalUrl">Link zewnętrzny (opcjonalnie)</FieldLabel>
        <Input
          id="externalUrl"
          type="url"
          value={form.externalUrl}
          onChange={(e) => patch("externalUrl", e.target.value)}
          placeholder="https://…"
        />
        <FieldDescription>
          Możesz wstawić go do treści przyciskiem „Link” albo zostanie dopisany przy zapisie.
        </FieldDescription>
      </Field>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          <Button type="button" size="xs" variant="outline" onClick={() => wrapSelection("**")}>
            <Bold className="size-3.5" />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={() => wrapSelection("*")}>
            <Italic className="size-3.5" />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={() => insertLine("## ")}>
            <Heading2 className="size-3.5" />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={() => insertLine("- ")}>
            <List className="size-3.5" />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={() => insertLine("1. ")}>
            <ListOrdered className="size-3.5" />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={insertLink}>
            <Link2 className="size-3.5" />
            Link
          </Button>
        </div>

        <Tabs>
          <TabsList>
            <TabsTrigger active={tab === "write"} onClick={() => setTab("write")}>
              Markdown
            </TabsTrigger>
            <TabsTrigger active={tab === "preview"} onClick={() => setTab("preview")}>
              <Eye className="mr-1 size-3.5" />
              Podgląd
            </TabsTrigger>
          </TabsList>
          {tab === "write" ? (
            <TabsContent>
              <Textarea
                ref={setTextareaEl}
                id="body"
                value={form.body}
                onChange={(e) => patch("body", e.target.value)}
                className="min-h-64 font-mono text-sm"
                placeholder={`## Nagłówek\n\nTreść z **Markdown** i [linkiem](https://example.com).\n\n- punkt 1\n- punkt 2`}
                aria-label="Treść Markdown"
              />
            </TabsContent>
          ) : (
            <TabsContent>
              <div className="min-h-64 rounded-2xl border border-border bg-card p-4">
                {previewBody.trim() ? (
                  <MarkdownView content={previewBody} />
                ) : (
                  <p className="text-sm text-muted-foreground">Brak treści do podglądu.</p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Zapisuję…" : mode === "create" ? "Utwórz wpis" : "Zapisz zmiany"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/panel/wiedza")}
        >
          Anuluj
        </Button>
      </div>
    </form>
  )
}
