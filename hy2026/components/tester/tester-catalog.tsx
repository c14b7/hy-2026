"use client"

import { ArrowRight } from "lucide-react"
import { useMemo, useState } from "react"

import { AiSearchField } from "@/components/ai/ai-search-field"
import { InnovationCard } from "@/components/innovations/innovation-card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import type { Innovation } from "@/types/domain"
import { cn } from "cn"

export function TesterCatalog({ items }: { items: Innovation[] }) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter((inn) => {
      const hay = [inn.title, inn.summary, inn.location, ...inn.tags]
        .join(" ")
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [items, q])

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Udział mieszkańców"
        title="Tester innowacji"
        description="Zgłoś chęć udziału w testach, oceń rozwiązania i zaproponuj usprawnienia."
        actions={
          <Badge variant="secondary" className="tabular-nums">
            {items.length} otwartych
          </Badge>
        }
      />

      <AiSearchField
        value={q}
        onChange={setQ}
        placeholder="Szukaj innowacji do testów — miasto, temat, tag…"
        aria-label="Szukaj innowacji otwartych na testy"
        hint="Lekkie podpowiedzi AI po frazie — bez hałasu, tylko trafniejsze wyniki"
        className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "Brak otwartych rekrutacji" : "Brak trafień"}
          description={
            items.length === 0
              ? "Wróć później lub przeglądaj bibliotekę innowacji."
              : "Spróbuj innej frazy albo wyczyść wyszukiwanie."
          }
          actionHref="/innowacje"
          actionLabel="Biblioteka"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inn, index) => (
            <div
              key={inn.id}
              className={cn(
                "min-h-0 animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500",
                "motion-reduce:animate-none motion-reduce:opacity-100"
              )}
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <InnovationCard
                innovation={inn}
                href={`/tester/${inn.id}`}
                footer={
                  <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/25 px-5 py-3 text-sm transition-colors duration-300 group-hover:bg-muted/40">
                    <span className="font-medium text-primary">Zapisz się / oceń</span>
                    <ArrowRight
                      className="size-3.5 text-primary transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
