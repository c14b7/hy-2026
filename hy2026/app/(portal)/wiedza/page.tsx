import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { KNOWLEDGE_KIND_LABELS } from "@/lib/labels"
import { getServices } from "@/lib/services"
import { cn } from "cn"

export const metadata = { title: "Wiedza" }

export default async function WiedzaPage() {
  const articles = await getServices().knowledge.list()

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Zasobnik"
        title="Wiedza Hubu"
        description="Raporty, kanwy, poradniki i materiały o innowacjach społecznych — dla mieszkańców, NGO i JST."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/wiedza/${a.slug}`}
            className={cn(
              "group flex h-full flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/6",
              "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{KNOWLEDGE_KIND_LABELS[a.kind]}</Badge>
              <span className="text-xs text-muted-foreground">{a.readingMinutes} min</span>
            </div>
            <h2 className="font-heading text-lg font-bold tracking-tight group-hover:text-primary">
              {a.title}
            </h2>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {a.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
