"use client"

import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"
import type { StaffMember } from "@/types/domain"

export default function PanelZespolPage() {
  const { user } = useRole()
  const [staff, setStaff] = useState<StaffMember[]>([])

  useEffect(() => {
    const orgId = user?.orgId ?? "org-fundacja"
    getServices()
      .orgCrm.listStaff(orgId)
      .then(setStaff)
  }, [user])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-medium">Zespół i wolontariusze</h1>
        <p className="text-sm text-muted-foreground">
          Stub CRM (rozszerzenie poza PDF) — dane syntetyczne do demonstracji.
        </p>
      </div>
      <ul className="space-y-2">
        {staff.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"
          >
            <div>
              <div className="font-medium">{s.displayName}</div>
              <div className="text-xs text-muted-foreground">{s.email}</div>
            </div>
            <Badge variant="outline">{s.role}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
