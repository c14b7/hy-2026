/**
 * Lightweight Markdown → React renderer (headings, emphasis, links, lists, code).
 * No external deps — enough for wiki demo; swap for remark later if needed.
 */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inlineToHtml(text: string): string {
  let out = escapeHtml(text)
  // links: [label](url)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g,
    (_m, label: string, href: string) => {
      const safeHref = href.startsWith("http") || href.startsWith("/") ? href : "#"
      const external = safeHref.startsWith("http")
      return `<a href="${safeHref}" class="text-primary underline underline-offset-2 hover:opacity-90"${
        external ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${label}</a>`
    }
  )
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // italic *text*
  out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
  // inline code `code`
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">$1</code>'
  )
  return out
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  let i = 0
  let inUl = false
  let inOl = false
  let inCode = false
  let codeBuf: string[] = []

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>")
      inUl = false
    }
    if (inOl) {
      html.push("</ol>")
      inOl = false
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre class="overflow-x-auto rounded-2xl bg-muted p-4 font-mono text-xs"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`
        )
        codeBuf = []
        inCode = false
      } else {
        closeLists()
        inCode = true
      }
      i++
      continue
    }

    if (inCode) {
      codeBuf.push(line)
      i++
      continue
    }

    if (!line.trim()) {
      closeLists()
      i++
      continue
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line)
    if (h) {
      closeLists()
      const level = h[1].length
      const cls =
        level === 1
          ? "font-heading text-2xl font-medium mt-4 mb-2"
          : level === 2
            ? "font-heading text-xl font-medium mt-4 mb-2"
            : "font-heading text-lg font-medium mt-3 mb-1"
      html.push(`<h${level} class="${cls}">${inlineToHtml(h[2])}</h${level}>`)
      i++
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        closeLists()
        html.push('<ul class="my-2 list-disc space-y-1 pl-5">')
        inUl = true
      }
      html.push(`<li>${inlineToHtml(line.replace(/^[-*]\s+/, ""))}</li>`)
      i++
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists()
        html.push('<ol class="my-2 list-decimal space-y-1 pl-5">')
        inOl = true
      }
      html.push(`<li>${inlineToHtml(line.replace(/^\d+\.\s+/, ""))}</li>`)
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      closeLists()
      html.push(
        `<blockquote class="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">${inlineToHtml(line.replace(/^>\s?/, ""))}</blockquote>`
      )
      i++
      continue
    }

    closeLists()
    html.push(`<p class="my-2 leading-relaxed">${inlineToHtml(line)}</p>`)
    i++
  }

  if (inCode) {
    html.push(
      `<pre class="overflow-x-auto rounded-2xl bg-muted p-4 font-mono text-xs"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`
    )
  }
  closeLists()
  return html.join("\n")
}
