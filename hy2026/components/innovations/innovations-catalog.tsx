"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { InnovationCard } from "@/components/innovations/innovation-card"
import { AiBadge } from "@/components/ai/ai-badge"
import { AiSearchField } from "@/components/ai/ai-search-field"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MALOPOLSKA_COUNTIES } from "@/lib/geo"
import { getServices } from "@/lib/services"
import type { ChallengeArea, Innovation, InnovationStage } from "@/types/domain"
import { cn } from "cn"

export function InnovationsCatalog() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [items, setItems] = useState<Innovation[]>([])
  const [challenges, setChallenges] = useState<ChallengeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  const q = searchParams.get("q") ?? ""
  const challengeId = searchParams.get("challengeId") ?? ""
  const county = searchParams.get("county") ?? ""
  const tag = searchParams.get("tag") ?? ""
  const stage = (searchParams.get("stage") ?? "") as InnovationStage | ""
  const testRecruiting = searchParams.get("test") === "1"

  const [draftQ, setDraftQ] = useState(q)

  useEffect(() => {
    setDraftQ(q)
  }, [q])

  useEffect(() => {
    getServices().challenges.list().then(setChallenges)
  }, [])

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
    getServices().ai.suggestKeywords(q).then(setSuggestions)
  }, [q])

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/innowacje?${params.toString()}`))
  }

  function applySearch(nextQ: string) {
    updateParam("q", nextQ.trim())
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Biblioteka Hubu"
        title="Innowacje społeczne"
        description="Sprawdzone i testowane rozwiązania z Małopolski — filtruj po wyzwaniu, powiecie i etapie."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => router.push("/potrzeba")}>
            Opisz problem
          </Button>
        }
      />

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          applySearch(draftQ)
        }}
      >
        <AiSearchField
          value={draftQ}
          onChange={setDraftQ}
          placeholder="Szukaj po tytule, opisie, tagu…"
          aria-label="Szukaj innowacji"
          hint="AI podpowiada powiązane tagi po zatwierdzeniu frazy"
          className="max-w-2xl"
        />
        <FilterBar className="xl:grid-cols-5">
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
            {MALOPOLSKA_COUNTIES.map((c) => (
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
          <div className="flex items-center gap-3 xl:col-span-2">
            <label className="flex flex-1 items-center gap-2 text-sm">
              <Checkbox
                checked={testRecruiting}
                onChange={(e) => updateParam("test", e.target.checked ? "1" : "")}
              />
              Szuka testerów
            </label>
            <Button type="submit" size="sm" disabled={pending}>
              Filtruj
            </Button>
          </div>
        </FilterBar>
      </form>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
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

      {!loading ? (
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "wynik" : "wyników"}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Brak wyników"
          description="Zmień filtry albo opisz problem — Hub dobierze innowacje za Ciebie."
          actionHref="/potrzeba"
          actionLabel="Opisz problem"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((inn, index) => (
            <div
              key={inn.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500",
                "motion-reduce:animate-none"
              )}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <InnovationCard innovation={inn} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
