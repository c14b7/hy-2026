"use client"

import { SparklesIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

type AiGenerateButtonProps = ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    /** When true — soft AI “magic” shimmer while work is in progress. */
    busy?: boolean
    busyLabel?: string
    idleLabel?: ReactNode
  }

/**
 * Primary CTA for AI-backed actions. Idle: quiet sparkle. Busy: subtle shimmer rim.
 */
export function AiGenerateButton({
  busy = false,
  busyLabel = "Generuję…",
  idleLabel,
  children,
  className,
  disabled,
  ...props
}: AiGenerateButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      data-ai-busy={busy ? "true" : undefined}
      className={cn(
        "ai-magic-btn relative overflow-hidden",
        busy && "ai-magic-btn--busy disabled:opacity-100",
        className
      )}
    >
      <span className="relative z-[1] inline-flex items-center gap-1.5">
        <SparklesIcon
          className={cn(
            "size-3.5 shrink-0 transition-opacity duration-300",
            busy ? "animate-pulse opacity-100" : "opacity-80"
          )}
          aria-hidden
        />
        {busy ? busyLabel : (idleLabel ?? children)}
      </span>
    </Button>
  )
}
