"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { AiBadge } from "@/components/ai/ai-badge"
import { MatchScore } from "@/components/ai/match-score"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { Innovation, MatchResult, NeedReport, Organization } from "@/types/domain"
import { cn } from "cn"

type Stored = MatchResult & { manual?: boolean }

export function MatchResults() {
  const [result, setResult] = useState<Stored | null>(null)
  const [innovations, setInnovations] = useState<Innovation[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [needs, setNeeds] = useState<NeedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const raw = sessionStorage.getItem("most-match-result")
    if (!raw) {
      setLoading(false)
      return
    }
    const parsed = JSON.parse(raw) as Stored
    setResult(parsed)
    setKeywords(parsed.keywords)
    Promise.all([
      getServices().innovations.list(),
      getServices().organizations.list(),
      getServices().needs.list(),
    ]).then(([inns, organizations, needList]) => {
      setInnovations(inns)
      setOrgs(organizations)
      setNeeds(needList)
      setLoading(false)
    })
  }, [])

  function toggleKeyword(kw: string) {
    const next = keywords.includes(kw) ? keywords.filter((k) => k !== kw) : [...keywords, kw]
    setKeywords(next)
    if (!result) return
    startTransition(async () => {
      const refreshed = await getServices().ai.matchNeed(next.join(" ") || result.query, {
        location: undefined,
        challengeId: undefined,
      })
      const merged: Stored = {
        ...refreshed,
        query: result.query,
        keywords: next,
        manual: result.manual,
      }
      setResult(merged)
      sessionStorage.setItem("most-match-result", JSON.stringify(merged))
    })
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!result) {
    return (
      <EmptyState
        title="Brak wyniku dopasowania"
        description="Najpierw opisz swój problem — przygotujemy listę innowacji i organizacji."
        actionHref="/potrzeba"
        actionLabel="Opisz problem"
      />
    )
  }

  const innItems = result.items.filter((i) => i.targetType === "innovation")
  const orgItems = result.items.filter((i) => i.targetType === "organization")
  const needItems = result.items.filter((i) => i.targetType === "need")

  return (
    <div className="space-y-8" aria-live="polite">
      <PageHeader
        eyebrow="Wynik"
        title="Dopasowania"
        description={`Na podstawie: „${result.query.slice(0, 160)}${result.query.length > 160 ? "…" : ""}”. Sugestia Hubu nie zastępuje Twojej decyzji.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AiBadge>{result.manual ? "Katalog + tagi" : "Dopasowanie AI"}</AiBadge>
            {pending ? <span className="text-xs text-muted-foreground">Aktualizuję…</span> : null}
          </div>
        }
      />

      <div>
        <h2 className="mb-2 text-sm font-medium">Słowa kluczowe</h2>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => {
            const on = keywords.includes(kw)
            return (
              <button
                key={kw}
                type="button"
                onClick={() => toggleKeyword(kw)}
                className="rounded-full focus-visible:ring-3 focus-visible:ring-ring/30"
                aria-pressed={on}
              >
                <Badge variant={on ? "secondary" : "outline"}>{kw} ×</Badge>
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/innowacje?q=${encodeURIComponent(keywords.join(" "))}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Szukaj w katalogu z tymi tagami
          </Link>
          <Link href="/potrzeba" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Opisz ponownie
          </Link>
        </div>
      </div>

      {innItems.length === 0 ? (
        <EmptyState
          title="Brak silnych dopasowań"
          description="Spróbuj innych słów kluczowych albo przeglądaj katalog innowacji ręcznie."
          actionHref="/innowacje"
          actionLabel="Otwórz katalog"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-medium">Innowacje i rozwiązania</h2>
            {innItems.map((item) => {
              const inn = innovations.find((i) => i.id === item.targetId)
              if (!inn) return null
              return (
                <Card key={item.targetId}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <MatchScore score={item.score} />
                      {!result.manual ? <AiBadge>Dlaczego pasuje</AiBadge> : null}
                    </div>
                    <CardTitle>
                      <Link href={`/innowacje/${inn.id}`} className="hover:underline">
                        {inn.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {result.manual
                        ? `${inn.summary} · ${inn.location}`
                        : item.rationale}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Link
                      href={`/innowacje/${inn.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Szczegóły
                    </Link>
                    <Link
                      href={`/komunikacja?related=innovation&id=${inn.id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Napisz
                    </Link>
                    {inn.testRecruiting ? (
                      <Link
                        href={`/tester/${inn.id}`}
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      >
                        Dołącz do testów
                      </Link>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setFeedback("Dziękujemy — sygnał pomoże dopracować dopasowania Hubu.")
                      }
                    >
                      To nie to
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-medium">Organizacje i podobne potrzeby</h2>
            {orgItems.map((item) => {
              const org = orgs.find((o) => o.id === item.targetId)
              if (!org) return null
              return (
                <Card key={item.targetId} size="sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MatchScore score={item.score} />
                    </div>
                    <CardTitle>
                      <Link href={`/organizacje/${org.id}`} className="hover:underline">
                        {org.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{item.rationale}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
            {needItems.map((item) => {
              const need = needs.find((n) => n.id === item.targetId)
              if (!need) return null
              return (
                <Card key={item.targetId} size="sm">
                  <CardHeader>
                    <MatchScore score={item.score} />
                    <CardTitle className="text-base">Podobne zgłoszenie</CardTitle>
                    <CardDescription>
                      {need.body.slice(0, 140)}
                      {need.body.length > 140 ? "…" : ""}
                      <br />
                      <span className="mt-1 block text-xs">{item.rationale}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </section>
        </div>
      )}

      {feedback ? (
        <p role="status" className="text-sm text-primary">
          {feedback}
        </p>
      ) : null}
    </div>
  )
}
