import { cn } from "cn"

/** Shared surface for search/filter rows — keeps catalog pages visually consistent. */
export function FilterBar({
  children,
  className,
  onSubmit,
}: {
  children: React.ReactNode
  className?: string
  onSubmit?: React.FormEventHandler<HTMLFormElement>
}) {
  const surface = cn(
    "grid gap-3 rounded-2xl bg-muted/55 p-3 ring-1 ring-foreground/5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    className
  )

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className={surface}>
        {children}
      </form>
    )
  }

  return <div className={surface}>{children}</div>
}
