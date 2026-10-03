"use client"

import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"
import type { Beneficiary } from "@/types/domain"

export default function PanelPodopieczniPage() {
  const { user } = useRole()
  const [rows, setRows] = useState<Beneficiary[]>([])

  useEffect(() => {
    const orgId = user?.orgId ?? "org-fundacja"
    getServices()
      .orgCrm.listBeneficiaries(orgId)
      .then(setRows)
  }, [user])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-medium">Podopieczni</h1>
        <p className="text-sm text-muted-foreground">
          Stub CRM (rozszerzenie poza PDF). Wyłącznie dane demonstracyjne — bez danych wrażliwych.
        </p>
      </div>
      <ul className="space-y-2">
        {rows.map((b) => (
          <li key={b.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{b.displayName}</span>
              <Badge variant="secondary">{b.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{b.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
