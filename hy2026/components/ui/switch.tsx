import { cn } from "cn"

function Switch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      className={cn(
        "peer h-5 w-9 shrink-0 appearance-none rounded-full bg-input transition-colors checked:bg-primary focus-visible:ring-3 focus-visible:ring-ring/30",
        className
      )}
      {...props}
    />
  )
}

export { Switch }
