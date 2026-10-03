"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { demoScenarios } from "@/lib/ai/match"
import { getServices } from "@/lib/services"
import { AiBadge } from "@/components/ai/ai-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { challenges } from "@/data/mocks/seed"

export function MatchmakingForm() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [useAi, setUseAi] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 12) {
      setError("Opisz problem dokładniej (min. kilka zdań) — pomoże to w lepszym dopasowaniu.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (useAi) {
        const result = await getServices().ai.matchNeed(query, {
          location: location || undefined,
          challengeId: challengeId || undefined,
        })
        sessionStorage.setItem("most-match-result", JSON.stringify(result))
      } else {
        const keywords = await getServices().ai.suggestKeywords(query)
        sessionStorage.setItem(
          "most-match-result",
          JSON.stringify({
            id: "manual",
            query,
            keywords,
            items: [],
            createdAt: new Date().toISOString(),
            manual: true,
          })
        )
      }
      const params = new URLSearchParams()
      if (!useAi && query) params.set("q", query)
      if (location) params.set("county", location)
      if (challengeId) params.set("challengeId", challengeId)
      router.push(`/potrzeba/wynik?${params.toString()}`)
    } catch {
      setError("Nie udało się przygotować dopasowań. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">Opisz swój problem</h1>
        <p className="text-muted-foreground">
          Napisz własnymi słowami, z czym potrzebujesz pomocy. MOST zaproponuje innowacje i
          organizacje — to sugestia, decyzja należy do Ciebie.
        </p>
        <AiBadge>Matchmaking społeczny</AiBadge>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Scenariusze demo">
        {demoScenarios.map((s) => (
          <Button
            key={s.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setQuery(s.query)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Field>
        <FieldLabel htmlFor="problem">Twój opis</FieldLabel>
        <Textarea
          id="problem"
          name="problem"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Np. Mama mieszka sama i prawie z nikim nie rozmawia…"
          className="min-h-36 text-base"
          aria-describedby="problem-hint"
        />
        <FieldDescription id="problem-hint">
          Nie podawaj prawdziwych danych wrażliwych — to środowisko demonstracyjne.
        </FieldDescription>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="location">Lokalizacja (opcjonalnie)</FieldLabel>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="np. Limanowa"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="challenge">Obszar wyzwania</FieldLabel>
          <Select
            id="challenge"
            value={challengeId}
            onChange={(e) => setChallengeId(e.target.value)}
          >
            <option value="">Wszystkie / nie wiem</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={useAi}
          onChange={(e) => setUseAi(e.target.checked)}
          aria-describedby="ai-hint"
        />
        Użyj dopasowania AI
      </label>
      <p id="ai-hint" className="text-xs text-muted-foreground">
        Możesz wyłączyć AI i przejść do ręcznego katalogu z wygenerowanymi słowami kluczowymi.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Szukam dopasowań…" : "Znajdź rozwiązania"}
        </Button>
        <Link href="/innowacje" className="text-sm text-muted-foreground underline-offset-4 hover:underline self-center">
          Albo przeglądaj katalog bez AI
        </Link>
      </div>
    </form>
  )
}
