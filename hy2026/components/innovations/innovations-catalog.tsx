"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { InnovationCard } from "@/components/innovations/innovation-card"
import { AiBadge } from "@/components/ai/ai-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { challenges, counties } from "@/data/mocks/seed"
import { getServices } from "@/lib/services"
import type { Innovation, InnovationStage } from "@/types/domain"

export function InnovationsCatalog() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [items, setItems] = useState<Innovation[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  const q = searchParams.get("q") ?? ""
  const challengeId = searchParams.get("challengeId") ?? ""
  const county = searchParams.get("county") ?? ""
  const tag = searchParams.get("tag") ?? ""
  const stage = (searchParams.get("stage") ?? "") as InnovationStage | ""
  const testRecruiting = searchParams.get("test") === "1"

  useEffect(() => {
    setLoading(true)
    getServices()
      .innovations.list({
        q: q || undefined,
        challengeId: challengeId || undefined,
        county: county || undefined,
        tag: tag || undefined,
        stage: stage || undefined,
        testRecruiting: testRecruiting || undefined,
      })
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
  }, [q, challengeId, county, tag, stage, testRecruiting])

  useEffect(() => {
    if (!q) {
      setSuggestions([])
      return
    }
    getServices()
      .ai.suggestKeywords(q)
      .then(setSuggestions)
  }, [q])

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/innowacje?${params.toString()}`))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium">Biblioteka innowacji</h1>
        <p className="text-muted-foreground">
          Przeglądaj sprawdzone i testowane rozwiązania społeczne w Małopolsce.
        </p>
      </div>

      <form
        className="grid gap-3 rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-4 md:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          updateParam("q", String(fd.get("q") ?? ""))
        }}
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Szukaj po tytule, opisie, tagu…"
          aria-label="Szukaj innowacji"
        />
        <Select
          aria-label="Wyzwanie"
          value={challengeId}
          onChange={(e) => updateParam("challengeId", e.target.value)}
        >
          <option value="">Wszystkie wyzwania</option>
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Powiat / lokalizacja"
          value={county}
          onChange={(e) => updateParam("county", e.target.value)}
        >
          <option value="">Cała Małopolska</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Etap"
          value={stage}
          onChange={(e) => updateParam("stage", e.target.value)}
        >
          <option value="">Wszystkie etapy</option>
          <option value="idea">Pomysł</option>
          <option value="prototype">Prototyp</option>
          <option value="pilot">Pilot</option>
          <option value="scaled">Skalowana</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={testRecruiting}
            onChange={(e) => updateParam("test", e.target.checked ? "1" : "")}
          />
          Tylko szukające testerów
        </label>
        <Button type="submit" disabled={pending}>
          Filtruj
        </Button>
      </form>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <AiBadge>Sugerowane tagi</AiBadge>
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => updateParam("tag", s)}>
              <Badge variant={tag === s ? "default" : "outline"}>{s}</Badge>
            </button>
          ))}
          {tag ? (
            <Button type="button" size="xs" variant="ghost" onClick={() => updateParam("tag", "")}>
              Wyczyść tag
            </Button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Brak wyników"
          description="Zmień filtry lub opisz problem asystentowi AI — dobierze innowacje za Ciebie."
          actionHref="/potrzeba"
          actionLabel="Opisz problem"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((inn) => (
            <InnovationCard key={inn.id} innovation={inn} />
          ))}
        </div>
      )}
    </div>
  )
}
