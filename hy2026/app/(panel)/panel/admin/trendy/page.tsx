"use client"

import { useEffect, useState } from "react"

import { AiBadge } from "@/components/ai/ai-badge"
import { useRole } from "@/components/shared/role-provider"
import { getServices } from "@/lib/services"
import type { TrendCluster } from "@/types/domain"

export default function AdminTrendyPage() {
  const { role } = useRole()
  const [clusters, setClusters] = useState<TrendCluster[]>([])

  useEffect(() => {
    if (role !== "admin") return
    getServices()
      .ai.getTrendClusters()
      .then(setClusters)
  }, [role])

  if (role !== "admin") {
    return (
      <p className="text-muted-foreground">
        Trendy potrzeb są widoczne wyłącznie dla administratora ROPS. Przełącz rolę na Admin.
      </p>
    )
  }

  const max = Math.max(...clusters.map((c) => c.count), 1)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium">Trendy potrzeb</h1>
          <AiBadge>Wgląd AI</AiBadge>
        </div>
        <p className="text-sm text-muted-foreground">
          Agregacja zgłoszeń mieszkańców według obszarów wyzwań. Obok klastrów widać surowe
          fragmenty zgłoszeń.
        </p>
      </div>
      <ul className="space-y-4">
        {clusters.map((c) => (
          <li key={c.challengeId} className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium">{c.challengeTitle}</h2>
              <span className="tabular-nums text-sm">{c.count} zgłoszeń</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`Wykres: ${c.count} z ${max}`}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(c.count / max) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tagi: {c.topTags.join(", ")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {c.sampleNeeds.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
