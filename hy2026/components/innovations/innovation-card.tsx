import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { STAGE_LABELS } from "@/lib/labels"
import type { Innovation } from "@/types/domain"
import { cn } from "cn"

export function InnovationCard({
  innovation,
  href,
  footer,
  className,
}: {
  innovation: Innovation
  href?: string
  footer?: React.ReactNode
  className?: string
}) {
  const target = href ?? `/innowacje/${innovation.id}`

  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[11.5rem] flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/6",
        "transition-[transform,box-shadow,ring-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/12",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
    >
      <Link
        href={target}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
      >
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{STAGE_LABELS[innovation.stage]}</Badge>
            {innovation.testRecruiting ? (
              <Badge variant="outline">Szuka testerów</Badge>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-base font-bold tracking-tight text-balance transition-colors duration-200 group-hover:text-primary">
              {innovation.title}
            </h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {innovation.summary}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-foreground/70">{innovation.location}</span>
            {innovation.tags.length > 0 ? (
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
            ) : null}
            {innovation.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {footer}
      </Link>
    </article>
  )
}
