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
    <div className="flex flex-col items-start gap-3 rounded-[min(var(--radius-4xl),24px)] border border-dashed border-border bg-muted/40 px-6 py-10">
      <h2 className="font-heading text-lg font-medium">{title}</h2>
      <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants())}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
