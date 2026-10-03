import { cn } from "cn"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ai"
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border bg-background text-foreground",
        variant === "destructive" && "bg-destructive/10 text-destructive",
        variant === "ai" && "bg-amber-500/15 text-amber-800 dark:text-amber-200",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
