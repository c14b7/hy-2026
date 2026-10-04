import { markdownToHtml } from "@/lib/markdown"

/** Detect TipTap / HTML bodies vs legacy Markdown seed content. */
export function looksLikeHtml(content: string): boolean {
  return /^\s*</.test(content.trim())
}

/** Load article body into TipTap (HTML). Markdown seed is converted once. */
export function toEditorHtml(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return "<p></p>"
  if (looksLikeHtml(trimmed)) return trimmed
  return markdownToHtml(trimmed)
}

/** Render stored body for readers — HTML passthrough or Markdown pipeline. */
export function bodyToDisplayHtml(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return ""
  if (looksLikeHtml(trimmed)) return trimmed
  return markdownToHtml(trimmed)
}
