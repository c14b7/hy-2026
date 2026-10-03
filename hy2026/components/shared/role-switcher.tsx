"use client"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import type { UserRole } from "@/types/domain"

const roles: UserRole[] = ["guest", "seeker", "org", "jst", "expert", "admin"]

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { role, setRole } = useRole()

  if (compact) {
    return (
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="sr-only">Rola demo</span>
        <Select
          aria-label="Przełącz rolę demo"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-7 w-auto max-w-[9rem]"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </label>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Przełącznik roli demo">
      <span className="text-xs text-muted-foreground">Demo jako:</span>
      {roles.map((r) => (
        <Button
          key={r}
          type="button"
          size="xs"
          variant={role === r ? "default" : "outline"}
          onClick={() => setRole(r)}
          aria-pressed={role === r}
        >
          {ROLE_LABELS[r]}
        </Button>
      ))}
    </div>
  )
}
