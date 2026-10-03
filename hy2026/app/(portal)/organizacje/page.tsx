import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { getServices } from "@/lib/services"

export const metadata = { title: "Organizacje" }

export default async function OrganizacjePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; county?: string }>
}) {
  const sp = await searchParams
  const orgs = await getServices().organizations.list({
    q: sp.q,
    type: sp.type as "ngo" | "jst" | "rops" | "other" | undefined,
    county: sp.county,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl font-medium">Organizacje</h1>
        <p className="text-muted-foreground">
          NGO, JST, CUS i partnerzy Hubu działający w Małopolsce.
        </p>
      </div>
      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Szukaj…"
          className="h-8 rounded-2xl border-transparent bg-input/50 px-3 text-sm"
        />
        <select
          name="type"
          defaultValue={sp.type ?? ""}
          className="h-8 rounded-2xl bg-input/50 px-2 text-sm"
        >
          <option value="">Wszystkie typy</option>
          <option value="ngo">NGO</option>
          <option value="jst">JST</option>
          <option value="rops">ROPS</option>
          <option value="other">Inne</option>
        </select>
        <button type="submit" className="h-8 rounded-2xl bg-primary px-3 text-sm text-primary-foreground">
          Filtruj
        </button>
      </form>
      {orgs.length === 0 ? (
        <EmptyState title="Brak organizacji" description="Zmień kryteria wyszukiwania." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary"
                  >
                    {org.logoInitials}
                  </div>
                  <div>
                    <CardTitle>
                      <Link href={`/organizacje/${org.id}`} className="hover:underline">
                        {org.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {org.type.toUpperCase()} · {org.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{org.description}</p>
                <div className="flex flex-wrap gap-1">
                  {org.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
