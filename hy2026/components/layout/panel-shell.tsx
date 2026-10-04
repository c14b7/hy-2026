"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { RoleSwitcher } from "@/components/shared/role-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

type NavItem = {
  href: string
  label: string
  exact?: boolean
  adminOnly?: boolean
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Pulpit",
    items: [{ href: "/panel", label: "Pulpit", exact: true }],
  },
  {
    label: "Treści",
    items: [
      { href: "/panel/innowacje", label: "Innowacje" },
      { href: "/panel/wiedza", label: "Wiedza org." },
    ],
  },
  {
    label: "Operacje",
    items: [
      { href: "/panel/zgloszenia", label: "Zgłoszenia" },
      { href: "/panel/komunikacja", label: "Komunikacja" },
      { href: "/panel/nabor", label: "Nabory" },
    ],
  },
  {
    label: "Zespół",
    items: [
      { href: "/panel/zespol", label: "Zespół" },
      { href: "/panel/podopieczni", label: "Podopieczni" },
    ],
  },
  {
    label: "Admin",
    items: [{ href: "/panel/admin/trendy", label: "Trendy", adminOnly: true }],
  },
]

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function PanelNav({
  role,
  onNavigate,
}: {
  role: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Panel" className="flex flex-col gap-6">
      {navGroups.map((group) => {
        const items = group.items.filter((l) => !l.adminOnly || role === "admin")
        if (items.length === 0) return null
        return (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href, item.exact)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        />
                      ) : null}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function PanelSidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { role, user, setRole } = useRole()
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <div className="px-1">
        <Link
          href="/panel"
          onClick={onNavigate}
          className="font-heading text-xl font-black tracking-tight text-sidebar-primary"
        >
          MOST
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">Panel organizacji</p>
        {user ? (
          <div className="mt-3 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <PanelNav role={role} onNavigate={onNavigate} />
      </div>
      <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
        <Link
          href="/portal"
          onClick={onNavigate}
          className="block rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
        >
          ← Portal mieszkańców
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            setRole("guest")
            onNavigate?.()
          }}
        >
          Wyloguj
        </Button>
        <button
          type="button"
          className="w-full px-1 text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => setDemoOpen((v) => !v)}
          aria-expanded={demoOpen}
        >
          {demoOpen ? "Ukryj demo" : "Demo · zmień rolę"}
        </button>
        {demoOpen ? <RoleSwitcher /> : null}
      </div>
    </>
  )
}

export function PanelSidebar() {
  const { canAccessPanel } = useRole()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!canAccessPanel) {
      router.replace("/login?to=panel")
    }
  }, [canAccessPanel, router])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!canAccessPanel) {
    return (
      <aside className="border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground md:w-64 md:min-h-svh">
        <p className="font-heading text-sm font-medium text-muted-foreground">MOST</p>
        <p className="mt-2 text-sm text-muted-foreground">Przekierowanie do logowania…</p>
      </aside>
    )
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar/90 p-4 text-sidebar-foreground backdrop-blur-sm md:flex">
        <PanelSidebarBody />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/panel" className="font-heading text-lg font-black tracking-tight text-primary">
          MOST · Panel
        </Link>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Menu className="size-4" />
          Menu
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Zamknij"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-4 bg-sidebar p-4 shadow-xl">
            <div className="flex justify-end">
              <Button type="button" size="icon-sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <PanelSidebarBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  )
}
