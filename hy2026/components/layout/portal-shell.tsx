"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { RoleSwitcher } from "@/components/shared/role-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
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
      { href: "/middleman", label: "Middleman AI" },
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
    <nav aria-label="Portal" className={cn("flex flex-col gap-5", className)}>
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
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
                      "block rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70"
                    )}
                  >
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
  const isSeeker = role === "seeker"

  return (
    <div className="space-y-3 border-t border-sidebar-border pt-4">
      {isGuest ? (
        <div className="space-y-2 px-1">
          <p className="text-xs text-muted-foreground">Przeglądasz bez konta</p>
          <Link
            href="/login?to=portal"
            onClick={onNavigate}
            className={cn(buttonVariants({ size: "sm" }), "w-full")}
          >
            Zaloguj się
          </Link>
        </div>
      ) : isSeeker || user ? (
        <div className="space-y-2 px-1">
          <p className="text-sm font-medium">
            {user?.displayName ?? ROLE_LABELS[role]}
          </p>
          <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
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
          {!isSeeker ? (
            <Link
              href="/panel"
              onClick={onNavigate}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
            >
              Przejdź do panelu
            </Link>
          ) : null}
        </div>
      ) : null}

      <Link
        href="/login?to=panel"
        onClick={onNavigate}
        className="block px-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Panel organizacji →
      </Link>
      <Link
        href="/"
        onClick={onNavigate}
        className="block px-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Strona główna
      </Link>

      <div>
        <button
          type="button"
          className="px-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
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
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="px-1">
        <Link
          href="/portal"
          onClick={onNavigate}
          className="font-heading text-lg font-semibold text-sidebar-primary"
        >
          MOST
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">Portal mieszkańców</p>
      </div>
      <PortalNav onNavigate={onNavigate} className="flex-1 overflow-y-auto py-2" />
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

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:flex md:min-h-svh">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/portal" className="font-heading font-semibold text-primary">
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

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu portalu">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Zamknij menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="portal-mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Menu</span>
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
        <main id="main" className="flex-1 bg-background p-4 md:p-8">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-8">
          MOST — portal demonstracyjny Hubu Innowacji Społecznych.{" "}
          <Link href="/" className="hover:text-foreground">
            Landing
          </Link>
        </footer>
      </div>
    </div>
  )
}
