"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServices } from "@/lib/services"

export default function PanelDashboardPage() {
  const { role, user, canAccessPanel } = useRole()
  const [stats, setStats] = useState({ inns: 0, needs: 0, threads: 0, ideas: 0 })

  useEffect(() => {
    if (!canAccessPanel) return
    Promise.all([
      getServices().innovations.list(),
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
  }, [canAccessPanel])

  if (!canAccessPanel) {
    return (
      <p>
        Wybierz rolę Organizacja / JST / Ekspert / Admin w przełączniku po lewej, aby zobaczyć
        panel.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium">Pulpit</h1>
        <p className="text-muted-foreground">
          Witaj, {user?.displayName ?? "użytkowniku"}{" "}
          <Badge variant="secondary">{role}</Badge>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{stats.inns}</CardTitle>
            <CardDescription>Innowacje w katalogu</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.needs}</CardTitle>
            <CardDescription>Potrzeby do moderacji</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.ideas}</CardTitle>
            <CardDescription>Fiszki oczekujące</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.threads}</CardTitle>
            <CardDescription>Nowe wątki (admin)</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/panel/zgloszenia" className="text-primary hover:underline">
            Moderuj zgłoszenia →
          </Link>
        </li>
        <li>
          <Link href="/panel/komunikacja" className="text-primary hover:underline">
            Otwórz komunikację →
          </Link>
        </li>
        {role === "admin" ? (
          <li>
            <Link href="/panel/admin/trendy" className="text-primary hover:underline">
              Trendy potrzeb (AI) →
            </Link>
          </li>
        ) : null}
      </ul>
    </div>
  )
}
