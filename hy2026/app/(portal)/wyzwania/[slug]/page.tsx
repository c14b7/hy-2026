import Link from "next/link"
import { notFound } from "next/navigation"

import { InnovationCard } from "@/components/innovations/innovation-card"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"

export default async function WyzwanieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const services = getServices()
  const challenge = await services.challenges.getBySlug(slug)
  if (!challenge) notFound()
  const inns = await services.innovations.list({ challengeId: challenge.id })
  const articles = (await services.knowledge.list()).filter((k) =>
    k.challengeIds.includes(challenge.id)
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-heading text-3xl font-medium">{challenge.title}</h1>
        <p className="text-muted-foreground">{challenge.summary}</p>
        <div className="flex flex-wrap gap-3">
          {challenge.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl bg-muted px-3 py-2 text-sm">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="font-medium">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {challenge.relatedTags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-heading text-xl font-medium">Powiązane innowacje</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inns.map((inn) => (
            <InnovationCard key={inn.id} innovation={inn} />
          ))}
        </div>
      </section>

      {articles.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-xl font-medium">Materiały</h2>
          <ul className="space-y-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/wiedza/${a.slug}`} className="text-primary hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
