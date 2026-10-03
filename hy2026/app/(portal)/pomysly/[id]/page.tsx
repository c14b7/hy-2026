import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/services"

export default async function PomyslDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idea = await getServices().ideas.getById(id)
  if (!idea) notFound()

  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{idea.stage}</Badge>
        <Badge variant="outline">{idea.status}</Badge>
      </div>
      <h1 className="font-heading text-3xl font-medium">{idea.title}</h1>
      <p className="text-lg text-muted-foreground">{idea.essence}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Dla kogo</dt>
          <dd>{idea.audience || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Autor</dt>
          <dd>{idea.authorName}</dd>
        </div>
      </dl>
      <p className="leading-relaxed">{idea.description}</p>
    </article>
  )
}
