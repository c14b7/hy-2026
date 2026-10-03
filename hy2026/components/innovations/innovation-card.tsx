import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Innovation } from "@/types/domain"
import Link from "next/link"

const stageLabel: Record<Innovation["stage"], string> = {
  idea: "Pomysł",
  prototype: "Prototyp",
  pilot: "Pilot",
  scaled: "Skalowana",
  archived: "Archiwum",
}

export function InnovationCard({ innovation }: { innovation: Innovation }) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{stageLabel[innovation.stage]}</Badge>
          {innovation.testRecruiting ? <Badge variant="outline">Szuka testerów</Badge> : null}
        </div>
        <CardTitle>
          <Link href={`/innowacje/${innovation.id}`} className="hover:underline">
            {innovation.title}
          </Link>
        </CardTitle>
        <CardDescription>{innovation.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground">{innovation.location}</span>
        {innovation.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </CardContent>
    </Card>
  )
}
