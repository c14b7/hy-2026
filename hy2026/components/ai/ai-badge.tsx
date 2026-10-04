import { cn } from "cn"

import { Badge } from "@/components/ui/badge"

export function AiBadge({
  children = "Sugestia AI",
  busy = false,
  className,
}: {
  children?: React.ReactNode
  /** Soft pulse while a related AI job runs nearby. */
  busy?: boolean
  className?: string
}) {
  return (
    <Badge
      variant="ai"
      className={cn("ai-magic-badge gap-1", busy && "ai-magic-badge--busy", className)}
    >
      <span className="ai-magic-badge__spark" aria-hidden>
        ✦
      </span>
      {children}
    </Badge>
  )
}
