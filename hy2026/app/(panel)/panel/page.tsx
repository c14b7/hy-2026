"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import { cn } from "cn"

export default function PanelDashboardPage() {
  const { role, user, canAccessPanel } = useRole()
  const [stats, setStats] = useState({ inns: 0, needs: 0, threads: 0, ideas: 0 })

  useEffect(() => {
    if (!canAccessPanel) return
    Promise.all([
      getServices().innovations.list({ includeUnpublished: role === "admin" }),
      getServices().needs.list(),
      getServices().communication.listThreads(),
      getServices().ideas.list(),
    ]).then(([inns, needs, threads, ideas]) => {
      setStats({
        inns: inns.length,
        needs: needs.filter((n) => n.status === "pending").length,
        threads: threads.filter((t) => t.unreadForAdmin).length,
        ideas: ideas.filter((i) => i.status === "pending").length,
      })
    })
  }, [canAccessPanel, role])

  if (!canAccessPanel) {
    return (
      <p className="text-muted-foreground">
        Wybierz rolę Organizacja / JST / Ekspert / Admin, aby zobaczyć panel.
      </p>
    )
  }

  const tiles = [
    { label: "Innowacje", value: stats.inns, href: "/panel/innowacje" },
    { label: "Potrzeby do moderacji", value: stats.needs, href: "/panel/zgloszenia" },
    { label: "Nieprzeczytane wątki", value: stats.threads, href: "/panel/komunikacja" },
    { label: "Pomysły do przeglądu", value: stats.ideas, href: "/panel/zgloszenia" },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Panel organizacji"
        title="Pulpit"
        description={`Witaj, ${user?.displayName ?? "użytkowniku"} — skrót pracy w Hubie MOST.`}
        actions={<Badge variant="secondary">{ROLE_LABELS[role]}</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/6 transition-shadow hover:shadow-md"
          >
            <p className="font-heading text-3xl font-black tracking-tight text-primary">{t.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.label}</p>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold">Szybkie ścieżki</h2>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href="/panel/nabor" className={cn(buttonVariants({ variant: "outline" }))}>
              Nabory ROPS
            </Link>
          </li>
          <li>
            <Link href="/panel/wiedza" className={cn(buttonVariants({ variant: "outline" }))}>
              Wiedza organizacji
            </Link>
          </li>
          <li>
            <Link href="/portal" className={cn(buttonVariants({ variant: "ghost" }))}>
              Portal mieszkańców
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
