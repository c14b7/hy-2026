import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

export function MatchScore({ score, className }: { score: number; className?: string }) {
  const label = score >= 70 ? "Silne" : score >= 40 ? "Częściowe" : "Słabe"
  return (
    <Badge
      variant="outline"
      className={cn("tabular-nums", className)}
      title={`Ocena dopasowania: ${score}/100`}
    >
      {label} · {score}%
    </Badge>
  )
}
