import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ORG_TYPE_LABELS } from "@/lib/labels"
import { getServices } from "@/lib/services"
import { cn } from "cn"

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
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Sieć Hubu"
        title="Organizacje"
        description="NGO, JST, CUS i partnerzy działający w Małopolsce — od ROPS po lokalne stowarzyszenia."
      />

      <FilterBar className="sm:grid-cols-[1fr_10rem_auto]">
        <Input name="q" defaultValue={sp.q} placeholder="Szukaj organizacji…" aria-label="Szukaj" />
        <Select name="type" defaultValue={sp.type ?? ""} aria-label="Typ">
          <option value="">Wszystkie typy</option>
          <option value="ngo">NGO</option>
          <option value="jst">JST / CUS</option>
          <option value="rops">ROPS</option>
          <option value="other">Partner</option>
        </Select>
        <Button type="submit" size="sm">
          Filtruj
        </Button>
      </FilterBar>

      {orgs.length === 0 ? (
        <EmptyState title="Brak organizacji" description="Zmień kryteria wyszukiwania." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/organizacje/${org.id}`}
              className={cn(
                "group flex h-full flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/6",
                "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-sm font-bold text-primary"
                >
                  {org.logoInitials}
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="font-heading text-base font-bold tracking-tight group-hover:text-primary">
                    {org.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {ORG_TYPE_LABELS[org.type]} · {org.location}
                  </p>
                </div>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {org.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {org.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
