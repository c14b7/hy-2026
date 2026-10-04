import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-muted/40 px-6 py-12 ring-1 ring-dashed ring-foreground/10">
      <div className="space-y-2">
        <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants())}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
