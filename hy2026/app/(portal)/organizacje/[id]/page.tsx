import Link from "next/link"
import { notFound } from "next/navigation"

import { InnovationCard } from "@/components/innovations/innovation-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getServices } from "@/lib/services"
import { cn } from "cn"

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const services = getServices()
  const org = await services.organizations.getById(id)
  if (!org) notFound()
  const inns = (await services.innovations.list()).filter((i) => i.orgId === org.id)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <Badge variant="secondary">{org.type}</Badge>
        <h1 className="font-heading text-3xl font-medium">{org.name}</h1>
        <p className="max-w-2xl text-muted-foreground">{org.description}</p>
        <p className="text-sm">
          {org.location} · {org.contactEmail}
        </p>
        <Link
          href={`/komunikacja?related=organization&id=${org.id}`}
          className={cn(buttonVariants())}
        >
          Napisz do organizacji
        </Link>
      </header>
      <section>
        <h2 className="mb-4 font-heading text-xl font-medium">Innowacje organizacji</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inns.map((inn) => (
            <InnovationCard key={inn.id} innovation={inn} />
          ))}
        </div>
      </section>
    </div>
  )
}
