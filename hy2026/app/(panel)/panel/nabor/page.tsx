import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"

export const metadata = { title: "Nabory" }

export default async function PanelNaborPage() {
  const grants = await getServices().grants.list()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Operacje"
        title="Kalendarz naborów"
        description="Szkolenia, specjalizacje i wizyty studyjne ROPS oraz mikrogranty Hubu. Szczegóły zgłoszeń na rops.krakow.pl."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {grants.map((g) => (
          <article
            key={g.id}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/6"
          >
            <Badge variant={g.active ? "default" : "secondary"} className="w-fit">
              {g.active ? "Aktywny" : "Zakończony / planowany"}
            </Badge>
            <h2 className="font-heading text-base font-bold tracking-tight">{g.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{g.summary}</p>
            <p className="mt-auto text-xs font-medium text-foreground/70">
              {g.opensAt} — {g.closesAt}
            </p>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Źródło ogłoszeń:{" "}
        <a
          href="https://rops.krakow.pl/"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          rops.krakow.pl
        </a>
      </p>
    </div>
  )
}
