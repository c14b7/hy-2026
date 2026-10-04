import { cn } from "cn"

/** Soft content surface without heavy card chrome — for lists, inboxes, forms. */
export function Surface({
  children,
  className,
  as: Comp = "div",
}: {
  children: React.ReactNode
  className?: string
  as?: "div" | "section" | "aside" | "article"
}) {
  return (
    <Comp
      className={cn(
        "rounded-2xl bg-card/80 p-4 ring-1 ring-foreground/6 md:p-5",
        className
      )}
    >
      {children}
    </Comp>
  )
}
