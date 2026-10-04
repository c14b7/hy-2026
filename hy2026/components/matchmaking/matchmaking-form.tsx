"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { demoScenarios } from "@/lib/ai/match"
import { normalizeCounty } from "@/lib/geo"
import { getServices } from "@/lib/services"
import { useRole } from "@/components/shared/role-provider"
import { AiBadge } from "@/components/ai/ai-badge"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ChallengeArea } from "@/types/domain"

export function MatchmakingForm() {
  const router = useRouter()
  const { role, user } = useRole()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [challenges, setChallenges] = useState<ChallengeArea[]>([])
  const [useAi, setUseAi] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getServices().challenges.list().then(setChallenges)
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 12) {
      setError("Opisz problem dokładniej (min. kilka zdań) — pomoże to w lepszym dopasowaniu.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const county = normalizeCounty(location)
      const keywords = await getServices().ai.suggestKeywords(query)

      // Persist anonymous need for Hub analytics / moderation (demo store).
      await getServices().needs.create({
        body: query.trim(),
        location: location.trim() || undefined,
        county,
        challengeIds: challengeId ? [challengeId] : [],
        tags: keywords.slice(0, 5),
        authorRole: role,
        authorName: user?.displayName ?? "Mieszkaniec (anonimowo)",
      })

      if (useAi) {
        const result = await getServices().ai.matchNeed(query, {
          location: location || county || undefined,
          challengeId: challengeId || undefined,
        })
        sessionStorage.setItem("most-match-result", JSON.stringify(result))
      } else {
        const result = await getServices().ai.matchNeed(query, {
          location: location || county || undefined,
          challengeId: challengeId || undefined,
        })
        sessionStorage.setItem(
          "most-match-result",
          JSON.stringify({
            ...result,
            keywords,
            manual: true,
          })
        )
      }
      const params = new URLSearchParams()
      if (location) params.set("location", location)
      if (county) params.set("county", county)
      if (challengeId) params.set("challengeId", challengeId)
      router.push(`/potrzeba/wynik?${params.toString()}`)
    } catch {
      setError("Nie udało się przygotować dopasowań. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        eyebrow="Matchmaking"
        title="Opisz swój problem"
        description="Napisz własnymi słowami, z czym potrzebujesz pomocy. MOST zaproponuje innowacje i organizacje — to sugestia, decyzja należy do Ciebie."
        actions={<AiBadge busy={loading}>Asystent Hubu</AiBadge>}
        className="border-0 pb-0"
      />

      <div className="flex flex-wrap gap-2" aria-label="Przykładowe sytuacje">
        {demoScenarios.map((s) => (
          <Button
            key={s.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setQuery(s.query)
              if (s.label.includes("senior")) setLocation("Limanowa")
              if (s.label.includes("cyfrowe")) setLocation("Olkusz")
              if (s.label.includes("młodzieży") || s.label.includes("Kryzys"))
                setLocation("Nowy Sącz")
            }}
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
          Nie podawaj prawdziwych danych wrażliwych — to środowisko demonstracyjne Hubu.
        </FieldDescription>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="location">Miejscowość / powiat (opcjonalnie)</FieldLabel>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="np. Limanowa, Myślenice"
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
        Podświetl dopasowania AI (możesz potem edytować tagi)
      </label>
      <p id="ai-hint" className="text-xs text-muted-foreground">
        Wyłączenie AI nadal zapisuje zgłoszenie i pokazuje wyniki katalogowe — bez „czarnej skrzynki”
        w uzasadnieniach.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <AiGenerateButton
          type="submit"
          size="lg"
          busy={loading}
          busyLabel="Szukam dopasowań…"
          idleLabel="Znajdź rozwiązania"
        />
        <Link
          href="/innowacje"
          className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Albo przeglądaj katalog
        </Link>
      </div>
    </form>
  )
}
