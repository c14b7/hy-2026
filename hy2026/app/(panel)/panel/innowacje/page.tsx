"use client"

import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { Innovation } from "@/types/domain"

export default function PanelInnowacjePage() {
  const { user, role } = useRole()
  const [items, setItems] = useState<Innovation[]>([])

  useEffect(() => {
    if (role === "admin") {
      getServices()
        .innovations.list()
        .then(setItems)
      return
    }
    if (user?.orgId) {
      getServices()
        .innovations.listByOrg(user.orgId)
        .then(setItems)
    }
  }, [user, role])

  async function setStatus(id: string, status: Innovation["status"]) {
    await getServices().innovations.updateStatus(id, status)
    if (user?.orgId && role !== "admin") {
      setItems(await getServices().innovations.listByOrg(user.orgId))
    } else {
      setItems(await getServices().innovations.list())
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-medium">Innowacje organizacji</h1>
      <ul className="space-y-3">
        {items.map((inn) => (
          <li
            key={inn.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
          >
            <div>
              <div className="font-medium">{inn.title}</div>
              <Badge variant="outline">{inn.status}</Badge>
            </div>
            {role === "admin" || role === "org" ? (
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
    </div>
  )
}
