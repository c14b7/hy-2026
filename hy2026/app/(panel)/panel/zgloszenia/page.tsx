"use client"

import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { IdeaCard, NeedReport } from "@/types/domain"

export default function PanelZgloszeniaPage() {
  const { role } = useRole()
  const [needs, setNeeds] = useState<NeedReport[]>([])
  const [ideas, setIdeas] = useState<IdeaCard[]>([])

  async function refresh() {
    const [n, i] = await Promise.all([
      getServices().needs.list(),
      getServices().ideas.list(),
    ])
    setNeeds(n)
    setIdeas(i)
  }

  useEffect(() => {
    void refresh()
  }, [])

  if (role !== "admin" && role !== "org") {
    return <p className="text-muted-foreground">Moderacja dostępna dla admina i organizacji.</p>
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-medium">Zgłoszenia</h1>
      <section className="space-y-3">
        <h2 className="font-medium">Potrzeby</h2>
        {needs.slice(0, 12).map((n) => (
          <div
            key={n.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border p-4"
          >
            <div className="max-w-xl space-y-1">
              <Badge variant="outline">{n.status}</Badge>
              <p className="text-sm">{n.body}</p>
            </div>
            {role === "admin" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    await getServices().needs.updateStatus(n.id, "published")
                    await refresh()
                  }}
                >
                  Publikuj
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await getServices().needs.updateStatus(n.id, "rejected")
                    await refresh()
                  }}
                >
                  Odrzuć
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-medium">Fiszki pomysłów</h2>
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
          >
            <div>
              <div className="font-medium">{idea.title}</div>
              <Badge variant="outline">{idea.status}</Badge>
            </div>
            {role === "admin" ? (
              <Button
                size="sm"
                onClick={async () => {
                  await getServices().ideas.updateStatus(idea.id, "published")
                  await refresh()
                }}
              >
                Publikuj
              </Button>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  )
}
