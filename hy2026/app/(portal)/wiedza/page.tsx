import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServices } from "@/lib/services"

export const metadata = { title: "Wiedza" }

const kindLabel = {
  edu: "Edukacja",
  report: "Raport",
  canvas: "Canva",
  video: "Film",
}

export default async function WiedzaPage() {
  const articles = await getServices().knowledge.list()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl font-medium">Zasobnik wiedzy</h1>
        <p className="text-muted-foreground">
          Raporty, canwy, materiały edukacyjne i filmy o innowacjach społecznych.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                {kindLabel[a.kind]}
              </Badge>
              <CardTitle>
                <Link href={`/wiedza/${a.slug}`} className="hover:underline">
                  {a.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {a.summary} · {a.readingMinutes} min
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
