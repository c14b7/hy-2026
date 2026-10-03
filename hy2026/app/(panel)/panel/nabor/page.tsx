import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServices } from "@/lib/services"

export const metadata = { title: "Nabory" }

export default async function PanelNaborPage() {
  const grants = await getServices().grants.list()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-medium">Kalendarz naborów</h1>
        <p className="text-sm text-muted-foreground">
          Generator wniosków per nabór — stub UI (pełny formularz dynamiczny później).
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {grants.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <div className="flex gap-2">
                <Badge variant={g.active ? "default" : "secondary"}>
                  {g.active ? "Aktywny" : "Planowany"}
                </Badge>
              </div>
              <CardTitle>{g.title}</CardTitle>
              <CardDescription>
                {g.summary}
                <br />
                {g.opensAt} — {g.closesAt}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
