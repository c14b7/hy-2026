"use client"

import { useEffect, useState } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels"
import { getServices } from "@/lib/services"
import type { Innovation } from "@/types/domain"

async function loadInnovations(role: string, orgId?: string) {
  if (role === "admin") {
    return getServices().innovations.list({ includeUnpublished: true })
  }
  if (orgId) {
    return getServices().innovations.listByOrg(orgId)
  }
  return getServices().innovations.listByOrg("org-rops")
}

export default function PanelInnowacjePage() {
  const { user, role } = useRole()
  const [items, setItems] = useState<Innovation[]>([])

  useEffect(() => {
    void loadInnovations(role, user?.orgId).then(setItems)
  }, [user, role])

  async function setStatus(id: string, status: Innovation["status"]) {
    await getServices().innovations.updateStatus(id, status)
    setItems(await loadInnovations(role, user?.orgId))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Treści"
        title="Innowacje organizacji"
        description="Publikuj wpisy w Bibliotece Hubu albo trzymaj je jako szkic."
      />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak innowacji dla tej roli.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((inn) => (
            <li
              key={inn.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/6"
            >
              <div className="min-w-0 space-y-1.5">
                <p className="font-heading font-bold tracking-tight">{inn.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{STATUS_LABELS[inn.status]}</Badge>
                  <Badge variant="secondary">{STAGE_LABELS[inn.stage]}</Badge>
                </div>
              </div>
              {role === "admin" || role === "org" || role === "jst" ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(inn.id, "published")}>
                    Publikuj
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(inn.id, "draft")}>
                    Szkic
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
