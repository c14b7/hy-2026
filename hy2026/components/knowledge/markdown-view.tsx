"use client"

import { useMemo } from "react"

import { bodyToDisplayHtml } from "@/lib/content-html"
import { cn } from "cn"

export function MarkdownView({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  const html = useMemo(() => bodyToDisplayHtml(content), [content])

  return (
    <div
      className={cn(
        "prose-sm max-w-none text-foreground",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight",
        "[&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-3",
        "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_th]:text-left",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
