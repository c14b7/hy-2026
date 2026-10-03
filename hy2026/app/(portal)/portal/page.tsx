"use client"

import Link from "next/link"

import { useRole, ROLE_LABELS } from "@/components/shared/role-provider"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

const actions = [
  {
    href: "/potrzeba",
    title: "Opisz problem",
    description: "Asystent AI dobierze innowacje i organizacje do Twojej sytuacji.",
  },
  {
    href: "/innowacje",
    title: "Przeglądaj innowacje",
    description: "Biblioteka sprawdzonych rozwiązań społecznych w Małopolsce.",
  },
  {
    href: "/pomysly/nowy",
    title: "Zgłoś pomysł",
    description: "Fiszka innowacji — warto zalogować się jako mieszkaniec (demo).",
  },
]

export default function PortalHubPage() {
  const { role, user } = useRole()
  const isGuest = role === "guest"

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-medium tracking-tight">Portal MOST</h1>
        <p className="max-w-2xl text-muted-foreground">
          Odkrywaj innowacje, zgłaszaj potrzeby i łącz się z organizacjami Hubu. Nawigacja jest
          w menu bocznym.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {isGuest ? (
            <>
              <Badge variant="outline">Gość</Badge>
              <span className="text-muted-foreground">Przeglądasz bez konta.</span>
              <Link href="/login?to=portal" className="text-primary hover:underline">
                Zaloguj się jako mieszkaniec
              </Link>
            </>
          ) : (
            <>
              <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
              <span className="text-muted-foreground">
                Zalogowano: {user?.displayName ?? ROLE_LABELS[role]}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="block h-full">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
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
