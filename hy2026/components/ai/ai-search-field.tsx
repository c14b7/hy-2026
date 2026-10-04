"use client"

import { SearchIcon, SparklesIcon } from "lucide-react"
import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "cn"

type AiSearchFieldProps = {
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  "aria-label"?: string
  className?: string
  hint?: string
}

/** Search input with a soft AI “glitter” rim — calm, not flashy. */
export function AiSearchField({
  name = "q",
  defaultValue,
  value,
  onChange,
  placeholder = "Szukaj…",
  "aria-label": ariaLabel = "Szukaj",
  className,
  hint = "Sugestie AI dopasowują frazy do innowacji",
}: AiSearchFieldProps) {
  const hintId = useId()
  const [focused, setFocused] = useState(false)
  const filled = Boolean((value ?? defaultValue ?? "").toString().trim())

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "ai-glitter-shell relative rounded-2xl transition-[box-shadow,transform] duration-300",
          focused || filled ? "ai-glitter-shell--active" : null
        )}
      >
        <div className="relative flex items-center gap-2 rounded-[inherit] bg-card/90 px-3 ring-1 ring-foreground/8 backdrop-blur-sm dark:bg-card/80">
          <SearchIcon
            className={cn(
              "size-4 shrink-0 transition-colors duration-300",
              focused ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden
          />
          <Input
            name={name}
            {...(onChange != null
              ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
              : { defaultValue })}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-describedby={hintId}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-10 border-0 bg-transparent px-0 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0"
          />
          <SparklesIcon
            className={cn(
              "size-3.5 shrink-0 transition-all duration-500",
              focused || filled
                ? "text-primary/80 opacity-100"
                : "text-muted-foreground/50 opacity-70"
            )}
            aria-hidden
          />
        </div>
      </div>
      <p
        id={hintId}
        className={cn(
          "mt-1.5 px-1 text-[0.7rem] text-muted-foreground transition-opacity duration-300",
          focused ? "opacity-100" : "opacity-70"
        )}
      >
        {hint}
      </p>
    </div>
  )
}
