import Link from "next/link"
import { notFound } from "next/navigation"

import { AiBadge } from "@/components/ai/ai-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import { cn } from "cn"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const inn = await getServices().innovations.getById(id)
  return { title: inn?.title ?? "Innowacja" }
}

export default async function InnovationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const services = getServices()
  const inn = await services.innovations.getById(id)
  if (!inn) notFound()
  const org = await services.organizations.getById(inn.orgId)
  const challengeList = await services.challenges.list()
  const related = challengeList.filter((c) => inn.challengeIds.includes(c.id))

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{inn.stage}</Badge>
          {inn.testRecruiting ? <Badge variant="outline">Szuka testerów</Badge> : null}
        </div>
        <h1 className="font-heading text-3xl font-medium tracking-tight">{inn.title}</h1>
        <p className="text-lg text-muted-foreground">{inn.summary}</p>
      </div>

      {inn.media ? (
        <div className="overflow-hidden rounded-[min(var(--radius-4xl),24px)] bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={inn.media.url}
            alt={inn.media.label}
            className="aspect-video w-full object-cover"
          />
          <p className="px-4 py-2 text-xs text-muted-foreground">{inn.media.label} (placeholder)</p>
        </div>
      ) : null}

      <div className="prose-sm space-y-3 text-foreground">
        <p>{inn.description}</p>
        <p>
          <strong>Dla kogo:</strong> {inn.beneficiaries}
        </p>
        <p>
          <strong>Lokalizacja:</strong> {inn.location} ({inn.county})
        </p>
        {org ? (
          <p>
            <strong>Organizacja:</strong>{" "}
            <Link href={`/organizacje/${org.id}`} className="text-primary underline-offset-4 hover:underline">
              {org.name}
            </Link>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {inn.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Powiązane wyzwania</h2>
        <ul className="flex flex-wrap gap-2">
          {related.map((c) => (
            <li key={c.id}>
              <Link href={`/wyzwania/${c.slug}`} className="text-sm text-primary hover:underline">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <Link
          href={`/komunikacja?related=innovation&id=${inn.id}`}
          className={cn(buttonVariants())}
        >
          Skontaktuj się
        </Link>
        {inn.testRecruiting ? (
          <Link href={`/tester/${inn.id}`} className={cn(buttonVariants({ variant: "outline" }))}>
            Dołącz do testów
          </Link>
        ) : null}
        <Link
          href={`/middleman?innovationId=${inn.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center gap-2")}
        >
          <AiBadge>Middleman</AiBadge>
          Dostosuj jako usługę
        </Link>
      </div>
    </article>
  )
}
