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
    <nav aria-label="Panel" className="flex flex-col gap-5">
      {navGroups.map((group) => {
        const items = group.items.filter((l) => !l.adminOnly || role === "admin")
        if (items.length === 0) return null
        return (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
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
                        "block rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/70"
                      )}
                    >
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
      <div>
        <Link
          href="/panel"
          onClick={onNavigate}
          className="font-heading text-lg font-semibold text-sidebar-primary"
        >
          MOST
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Panel organizacji / Hub</p>
        {user ? (
          <p className="mt-2 text-sm">
            {user.displayName}{" "}
            <Badge variant="secondary" className="ml-1">
              {ROLE_LABELS[role]}
            </Badge>
          </p>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto">
        <PanelNav role={role} onNavigate={onNavigate} />
      </div>
      <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
        <Link
          href="/portal"
          onClick={onNavigate}
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Portal mieszkańców
        </Link>
        <Link
          href="/"
          onClick={onNavigate}
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          Strona główna
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
          Wyloguj (demo)
        </Button>
        <div>
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setDemoOpen((v) => !v)}
            aria-expanded={demoOpen}
          >
            {demoOpen ? "Ukryj tryb demo" : "Tryb demo"}
          </button>
          {demoOpen ? (
            <div className="mt-2">
              <RoleSwitcher />
            </div>
          ) : null}
        </div>
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
      <aside className="border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground md:w-60 md:min-h-svh">
        <p className="text-sm text-muted-foreground">Przekierowanie do logowania…</p>
      </aside>
    )
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:flex md:min-h-svh">
        <PanelSidebarBody />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/panel" className="font-heading font-semibold text-primary">
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
            className="absolute inset-0 bg-black/40"
            aria-label="Zamknij"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-4 bg-sidebar p-4 shadow-lg">
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
