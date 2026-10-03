import Link from "next/link"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServices } from "@/lib/services"

export const metadata = { title: "Wyzwania" }

export default async function WyzwaniaPage() {
  const challenges = await getServices().challenges.list()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl font-medium">Mapa wyzwań społecznych</h1>
        <p className="text-muted-foreground">
          Kondycja Małopolski w kluczowych obszarach — punkt wyjścia do innowacji i wiedzy.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/wyzwania/${c.slug}`} className="hover:underline">
                  {c.title}
                </Link>
              </CardTitle>
              <CardDescription>{c.summary}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
