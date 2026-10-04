"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import type { GrantCall } from "@/types/domain"
import { cn } from "cn"

const actions = [
  {
    href: "/potrzeba",
    title: "Opisz problem",
    description: "Dobierzemy innowacje i organizacje do Twojej sytuacji w Małopolsce.",
    accent: true,
  },
  {
    href: "/innowacje",
    title: "Przeglądaj innowacje",
    description: "Biblioteka rozwiązań — od klubów sąsiedzkich po CUS i zatrudnienie wspierane.",
  },
  {
    href: "/pomysly/nowy",
    title: "Zgłoś pomysł",
    description: "Fiszka innowacji z podpowiedziami Hubu — warto zalogować się jako mieszkaniec.",
  },
]

export default function PortalHubPage() {
  const { role, user } = useRole()
  const isGuest = role === "guest"
  const [grants, setGrants] = useState<GrantCall[]>([])

  useEffect(() => {
    getServices()
      .grants.list()
      .then((list) => setGrants(list.filter((g) => g.active).slice(0, 3)))
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <PageHeader
        eyebrow="Hub mieszkańców"
        title="Portal MOST"
        description="Most między potrzebą a rozwiązaniem — innowacje społeczne, organizacje i wiedza Hubu koordynowanego przez ROPS w Krakowie."
        actions={
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {isGuest ? (
              <>
                <Badge variant="outline">Gość</Badge>
                <Link href="/login?to=portal" className={cn(buttonVariants({ size: "sm" }))}>
                  Zaloguj się
                </Link>
              </>
            ) : (
              <>
                <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
                <span className="text-muted-foreground">{user?.displayName}</span>
              </>
            )}
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/6 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
              a.accent && "bg-[linear-gradient(145deg,oklch(0.96_0.04_55),oklch(0.99_0.01_80))] ring-primary/20"
            )}
          >
            {a.accent ? (
              <span className="w-fit rounded-md bg-primary/12 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary uppercase">
                Start tutaj
              </span>
            ) : null}
            <h2 className="font-heading text-base font-bold tracking-tight group-hover:text-primary">
              {a.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{a.description}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Przejdź <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      {grants.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight">Aktualne nabory ROPS</h2>
              <p className="text-sm text-muted-foreground">
                Szkolenia, specjalizacje i wizyty studyjne z ogłoszeń ROPS Kraków.
              </p>
            </div>
            <Link
              href="/panel/nabor"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Kalendarz
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {grants.map((g) => (
              <li
                key={g.id}
                className="flex h-full flex-col gap-2 rounded-2xl bg-card/90 p-4 ring-1 ring-foreground/6"
              >
                <Badge variant="outline" className="w-fit">
                  do {g.closesAt}
                </Badge>
                <h3 className="font-heading text-sm font-bold leading-snug">{g.title}</h3>
                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {g.summary}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Źródło:{" "}
            <a
              href="https://rops.krakow.pl/"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              rops.krakow.pl
            </a>
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-border/70 pt-6">
        <Link href="/wyzwania" className={cn(buttonVariants({ variant: "outline" }))}>
          Mapa wyzwań
        </Link>
        <Link href="/wiedza" className={cn(buttonVariants({ variant: "outline" }))}>
          Zasobnik wiedzy
        </Link>
        <Link href="/login?to=panel" className={cn(buttonVariants({ variant: "ghost" }))}>
          Jestem organizacją →
        </Link>
      </div>
    </div>
  )
}
