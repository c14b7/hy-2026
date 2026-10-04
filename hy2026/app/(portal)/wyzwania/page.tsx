import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { getServices } from "@/lib/services"
import { cn } from "cn"

export const metadata = { title: "Wyzwania" }

export default async function WyzwaniaPage() {
  const challenges = await getServices().challenges.list()

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Mapa regionu"
        title="Wyzwania społeczne"
        description="Kondycja Małopolski w kluczowych obszarach — punkt wyjścia do innowacji, wiedzy i naborów ROPS."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <Link
            key={c.id}
            href={`/wyzwania/${c.slug}`}
            className={cn(
              "group flex h-full flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/6",
              "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            )}
          >
            <div className="space-y-2">
              <h2 className="font-heading text-lg font-bold tracking-tight group-hover:text-primary">
                {c.title}
              </h2>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {c.summary}
              </p>
            </div>
            {c.metrics.length > 0 ? (
              <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
                {c.metrics.slice(0, 2).map((m) => (
                  <div key={m.label}>
                    <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                      {m.label}
                    </dt>
                    <dd className="text-sm font-semibold text-foreground/90">{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
