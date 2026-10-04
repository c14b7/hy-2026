"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { RichBodyEditor } from "@/components/knowledge/rich-body-editor"
import { MarkdownView } from "@/components/knowledge/markdown-view"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toEditorHtml } from "@/lib/content-html"
import { KNOWLEDGE_KIND_LABELS } from "@/lib/labels"
import { getServices } from "@/lib/services"
import type { KnowledgeArticle, KnowledgeKind, PublishStatus } from "@/types/domain"

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
    body: toEditorHtml(article?.body ?? ""),
    tags: article?.tags.join(", ") ?? "",
    status: article?.status ?? "draft",
    externalUrl: "",
  }
}

function plainTextFromHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
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

  const initialHtml = useMemo(() => toEditorHtml(article?.body ?? ""), [article?.id, article?.body])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError("Podaj tytuł wpisu.")
      return
    }
    const text = plainTextFromHtml(form.body)
    if (!text) {
      setError("Treść nie może być pusta.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      let body = form.body.trim()
      if (form.externalUrl.trim() && !body.includes(form.externalUrl.trim())) {
        body += `<p><strong>Powiązany link:</strong> <a href="${form.externalUrl.trim()}">${form.title.trim() || "Źródło"}</a></p>`
      }
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        kind: form.kind,
        summary: form.summary.trim() || text.slice(0, 140),
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
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Wiedza organizacji"
        title={mode === "create" ? "Nowy wpis wiki" : "Edycja wpisu"}
        description="Edytor wizualny z formatowaniem, listami, tabelami i linkami — jak w nowoczesnych narzędziach Hubu."
        actions={
          <Link href="/panel/wiedza" className="text-sm text-muted-foreground hover:underline">
            ← Lista wpisów
          </Link>
        }
      />

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
            {(Object.keys(KNOWLEDGE_KIND_LABELS) as KnowledgeKind[]).map((k) => (
              <option key={k} value={k}>
                {KNOWLEDGE_KIND_LABELS[k]}
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
          placeholder="np. seniorzy, kanwa, wdrozenie"
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
          Możesz też wstawić link w treści przez menu bąbelkowe (Link).
        </FieldDescription>
      </Field>

      <div className="space-y-2">
        <FieldLabel>Treść</FieldLabel>
        <Tabs>
          <TabsList>
            <TabsTrigger active={tab === "write"} onClick={() => setTab("write")}>
              Edytor
            </TabsTrigger>
            <TabsTrigger active={tab === "preview"} onClick={() => setTab("preview")}>
              Podgląd
            </TabsTrigger>
          </TabsList>
          {tab === "write" ? (
            <TabsContent>
              <RichBodyEditor
                editorKey={article?.id ?? "new"}
                initialHtml={initialHtml}
                onHtmlChange={(html) => patch("body", html)}
              />
            </TabsContent>
          ) : (
            <TabsContent>
              <div className="min-h-72 rounded-2xl border border-border bg-card p-4 md:p-5">
                {plainTextFromHtml(form.body) ? (
                  <MarkdownView content={form.body} />
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
        <Button type="button" variant="outline" onClick={() => router.push("/panel/wiedza")}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}
