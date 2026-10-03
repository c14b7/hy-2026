"use client"

import { useMemo } from "react"

import { markdownToHtml } from "@/lib/markdown"
import { cn } from "cn"

export function MarkdownView({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  const html = useMemo(() => markdownToHtml(content), [content])

  return (
    <div
      className={cn("text-sm text-foreground [&_a]:break-words", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
