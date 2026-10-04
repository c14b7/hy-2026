"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { User, UserRole } from "@/types/domain"
import { users } from "@/data/mocks/seed"
import { ROLE_LABELS } from "@/lib/labels"

export { ROLE_LABELS }

const STORAGE_KEY = "most-demo-role"

type RoleContextValue = {
  role: UserRole
  setRole: (role: UserRole) => void
  user: User | null
  canAccessPanel: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

const roleUser: Record<UserRole, User | null> = {
  guest: null,
  seeker: users.find((u) => u.id === "u-anna") ?? null,
  org: users.find((u) => u.id === "u-marek") ?? null,
  jst: users.find((u) => u.id === "u-ewa") ?? null,
  expert: users.find((u) => u.id === "u-olga") ?? null,
  admin: users.find((u) => u.id === "u-tomek") ?? null,
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("guest")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as UserRole | null
    if (saved && saved in roleUser) setRoleState(saved)
    setReady(true)
  }, [])

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      user: roleUser[role],
      canAccessPanel: role === "org" || role === "jst" || role === "expert" || role === "admin",
    }),
    [role, setRole]
  )

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background" aria-busy="true">
        <p className="font-heading text-sm font-medium tracking-wide text-muted-foreground">
          MOST
        </p>
      </div>
    )
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
