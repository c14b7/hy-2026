import { cn } from "cn"

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50",
        "[color-scheme:light] dark:[color-scheme:dark]",
        "[&_option]:bg-popover [&_option]:text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Select }
