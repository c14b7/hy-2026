import Link from "next/link"

import { InnovationCard } from "@/components/innovations/innovation-card"
import { EmptyState } from "@/components/shared/empty-state"
import { getServices } from "@/lib/services"

export const metadata = { title: "Tester innowacji" }

export default async function TesterPage() {
  const inns = await getServices().innovations.list({ testRecruiting: true })

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl font-medium">Tester innowacji</h1>
        <p className="text-muted-foreground">
          Zgłoś chęć udziału w testach, oceń rozwiązania i zaproponuj usprawnienia.
        </p>
      </div>
      {inns.length === 0 ? (
        <EmptyState
          title="Brak otwartych rekrutacji"
          description="Wróć później lub przeglądaj bibliotekę innowacji."
          actionHref="/innowacje"
          actionLabel="Biblioteka"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inns.map((inn) => (
            <div key={inn.id} className="space-y-2">
              <InnovationCard innovation={inn} />
              <Link href={`/tester/${inn.id}`} className="text-sm text-primary hover:underline">
                Zapisz się / oceń →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
