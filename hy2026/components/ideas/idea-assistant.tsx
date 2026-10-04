"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { AiBadge } from "@/components/ai/ai-badge"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { Button } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { IdeaCard } from "@/types/domain"
import { cn } from "cn"

export function IdeaAssistant({
  idea,
  onClose,
}: {
  idea: Partial<IdeaCard>
  onClose: () => void
}) {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    const next = await getServices().ai.suggestIdeaImprovements(idea)
    setTips(next)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <aside
      className={cn(
        "h-fit rounded-[min(var(--radius-4xl),24px)] border border-border bg-muted/40 p-4",
        loading && "ai-magic-surface--busy"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <AiBadge busy={loading}>Asystent kreatora</AiBadge>
          <p className="mt-2 text-xs text-muted-foreground">
            Podpowiedzi możesz zignorować — nic nie zapisujemy automatycznie.
          </p>
        </div>
        <Button type="button" size="xs" variant="ghost" onClick={onClose} aria-label="Zamknij asystenta">
          Zamknij
        </Button>
      </div>
      {loading ? (
        <p className="relative z-[1] text-sm text-muted-foreground">Przygotowuję sugestie…</p>
      ) : (
        <ul className="relative z-[1] space-y-2 text-sm">
          {tips.map((t) => (
            <li key={t} className="rounded-xl bg-background/80 px-3 py-2">
              {t}
            </li>
          ))}
        </ul>
      )}
      <AiGenerateButton
        type="button"
        size="sm"
        variant="outline"
        className="relative z-[1] mt-3"
        busy={loading}
        busyLabel="Odświeżam…"
        idleLabel="Odśwież sugestie"
        onClick={refresh}
      />
      <div className="relative z-[1] mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Kanwy Hubu:{" "}
        <Link href="/wiedza/kanwa-innowacji" className="underline">
          innowacji
        </Link>
        ,{" "}
        <Link href="/wiedza/kanwa-interesariuszy" className="underline">
          interesariuszy
        </Link>
        ,{" "}
        <Link href="/wiedza/kanwa-testu" className="underline">
          testu
        </Link>
        .
      </div>
    </aside>
  )
}
