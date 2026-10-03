import { Badge } from "@/components/ui/badge"

export function AiBadge({ children = "Sugestia AI" }: { children?: React.ReactNode }) {
  return (
    <Badge variant="ai" className="gap-1">
      <span aria-hidden>✦</span>
      {children}
    </Badge>
  )
}
