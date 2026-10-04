"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { RoleSwitcher } from "@/components/shared/role-switcher"
import { DataSourceBadge } from "@/components/shared/data-source-badge"
import { ThemeControl } from "@/components/theme-control"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

const navGroups: {
  label: string
  items: { href: string; label: string; exact?: boolean }[]
}[] = [
  {
    label: "Start",
    items: [{ href: "/portal", label: "Portal", exact: true }],
  },
  {
    label: "Odkrywaj",
    items: [
      { href: "/innowacje", label: "Innowacje" },
      { href: "/organizacje", label: "Organizacje" },
      { href: "/wyzwania", label: "Wyzwania" },
      { href: "/wiedza", label: "Wiedza" },
    ],
  },
  {
    label: "Działaj",
    items: [
      { href: "/potrzeba", label: "Opisz problem" },
      { href: "/pomysly", label: "Pomysły" },
      { href: "/tester", label: "Tester" },
      { href: "/middleman", label: "Middleman" },
    ],
  },
  {
    label: "Kontakt",
    items: [{ href: "/komunikacja", label: "Komunikacja" }],
  },
]

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function PortalNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Portal" className={cn("flex flex-col gap-6", className)}>
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
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
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
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
      ))}
    </nav>
  )
}

function PortalAccountBlock({ onNavigate }: { onNavigate?: () => void }) {
  const { role, user, setRole } = useRole()
  const [demoOpen, setDemoOpen] = useState(false)
  const isGuest = role === "guest"
  const canPanel = role === "org" || role === "jst" || role === "expert" || role === "admin"

  return (
    <div className="space-y-3 border-t border-sidebar-border pt-4">
      <div className="rounded-xl bg-sidebar-accent/50 px-3 py-3">
        {isGuest ? (
          <div className="space-y-2.5">
            <div>
              <p className="text-sm font-semibold">Gość</p>
              <p className="text-xs text-muted-foreground">Przeglądasz bez konta</p>
            </div>
            <Link
              href="/login?to=portal"
              onClick={onNavigate}
              className={cn(buttonVariants({ size: "sm" }), "w-full")}
            >
              Zaloguj się
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.displayName ?? ROLE_LABELS[role]}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {ROLE_LABELS[role]}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {canPanel ? (
                <Link
                  href="/panel"
                  onClick={onNavigate}
                  className={cn(buttonVariants({ size: "sm" }), "w-full")}
                >
                  Panel organizacji
                </Link>
              ) : (
                <Link
                  href="/login?to=panel"
                  onClick={onNavigate}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
                >
                  Panel organizacji
                </Link>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRole("guest")
                  onNavigate?.()
                }}
              >
                Wyloguj
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-xs">
        <Link href="/" onClick={onNavigate} className="text-muted-foreground hover:text-foreground">
          Strona główna
        </Link>
        <button
          type="button"
          className="text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => setDemoOpen((v) => !v)}
          aria-expanded={demoOpen}
        >
          {demoOpen ? "Ukryj demo" : "Demo"}
        </button>
      </div>
      {demoOpen ? (
        <div className="px-0.5">
          <RoleSwitcher />
        </div>
      ) : null}
    </div>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="px-1 pb-1">
        <Link
          href="/portal"
          onClick={onNavigate}
          className="font-heading text-xl font-black tracking-tight text-sidebar-primary"
        >
          MOST
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">Portal mieszkańców</p>
      </div>
      <PortalNav onNavigate={onNavigate} className="min-h-0 flex-1 overflow-y-auto py-1" />
      <PortalAccountBlock onNavigate={onNavigate} />
    </>
  )
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Przejdź do treści
      </a>

      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar/90 p-4 text-sidebar-foreground backdrop-blur-sm md:flex">
        <SidebarBody />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/portal" className="font-heading text-lg font-black tracking-tight text-primary">
          MOST
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="portal-mobile-nav"
        >
          <Menu className="size-4" />
          Menu
        </Button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu portalu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Zamknij menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="portal-mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold">Menu</span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Zamknij"
              >
                <X className="size-4" />
              </Button>
            </div>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" className="flex-1 px-4 py-6 pb-10 md:px-8 md:py-8 md:pb-12 lg:px-10">
          {children}
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <p className="flex flex-wrap items-center gap-2">
            <span>
              MOST · Hub Innowacji Społecznych ·{" "}
              <a
                href="https://rops.krakow.pl/"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                ROPS Kraków
              </a>
            </span>
            <DataSourceBadge />
          </p>
          <ThemeControl />
        </footer>
      </div>
    </div>
  )
}
