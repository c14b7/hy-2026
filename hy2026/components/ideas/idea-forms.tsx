"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { IdeaAssistant } from "@/components/ideas/idea-assistant"
import { AiBadge } from "@/components/ai/ai-badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { challenges } from "@/data/mocks/seed"
import { getServices } from "@/lib/services"
import { useRole } from "@/components/shared/role-provider"
import type { IdeaStage } from "@/types/domain"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function IdeaCreateForm() {
  const { user } = useRole()
  const [title, setTitle] = useState("")
  const [essence, setEssence] = useState("")
  const [audience, setAudience] = useState("")
  const [description, setDescription] = useState("")
  const [stage, setStage] = useState<IdeaStage>("concept")
  const [challengeId, setChallengeId] = useState("")
  const [savedId, setSavedId] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !essence) {
      setError("Uzupełnij tytuł i istotę pomysłu.")
      return
    }
    const idea = await getServices().ideas.create({
      title,
      essence,
      audience,
      description,
      stage,
      authorId: user?.id ?? "guest",
      authorName: user?.displayName ?? "Gość demo",
      challengeIds: challengeId ? [challengeId] : [],
      tags: [],
    })
    setSavedId(idea.id)
  }

  if (savedId) {
    return (
      <div className="space-y-4 rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-medium">Fiszka zgłoszona</h2>
        <p className="text-muted-foreground">
          Status: oczekuje na weryfikację. Możesz zobaczyć ją na liście pomysłów.
        </p>
        <Link href={`/pomysly/${savedId}`} className={cn(buttonVariants())}>
          Otwórz fiszkę
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-heading text-3xl font-medium">Nowa fiszka pomysłu</h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAssistantOpen((v) => !v)}
          >
            {assistantOpen ? "Ukryj asystenta" : "Pokaż asystenta AI"}
          </Button>
        </div>
        <Field>
          <FieldLabel htmlFor="title">Tytuł</FieldLabel>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="essence">Istota pomysłu</FieldLabel>
          <Textarea
            id="essence"
            value={essence}
            onChange={(e) => setEssence(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="audience">Dla kogo</FieldLabel>
          <Input
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Opis</FieldLabel>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="stage">Etap</FieldLabel>
            <Select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as IdeaStage)}
            >
              <option value="concept">Koncepcja</option>
              <option value="prototype">Prototyp</option>
              <option value="testing">Testy</option>
              <option value="ready">Gotowy</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="challenge">Wyzwanie</FieldLabel>
            <Select
              id="challenge"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
            >
              <option value="">Wybierz…</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit">Wyślij fiszkę</Button>
      </form>

      {assistantOpen ? (
        <IdeaAssistant
          idea={{ title, essence, audience, description, stage }}
          onClose={() => setAssistantOpen(false)}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <AiBadge /> Asystent jest wyłączony — włącz, gdy potrzebujesz podpowiedzi.
        </div>
      )}
    </div>
  )
}

export function IdeasList() {
  const [ideas, setIdeas] = useState<Awaited<ReturnType<ReturnType<typeof getServices>["ideas"]["list"]>>>([])

  useEffect(() => {
    getServices()
      .ideas.list()
      .then((all) => setIdeas(all.filter((i) => i.status === "published" || i.status === "pending")))
  }, [])

  return (
    <ul className="space-y-3">
      {ideas.map((idea) => (
        <li key={idea.id} className="rounded-2xl border border-border bg-card p-4">
          <Link href={`/pomysly/${idea.id}`} className="font-medium hover:underline">
            {idea.title}
          </Link>
          <p className="text-sm text-muted-foreground">{idea.essence}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {idea.authorName} · {idea.stage} · {idea.status}
          </p>
        </li>
      ))}
    </ul>
  )
}
