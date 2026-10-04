import { cn } from "cn"

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-[0.7rem] font-bold tracking-[0.16em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-[2.15rem]">
          {title}
        </h1>
        {description ? (
          <p className="text-[0.95rem] leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
