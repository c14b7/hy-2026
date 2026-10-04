import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col items-start justify-center gap-4 px-4">
      <p className="font-heading text-sm font-bold tracking-[0.18em] text-primary">MOST</p>
      <h1 className="font-heading text-3xl font-medium tracking-tight">Nie znaleziono strony</h1>
      <p className="text-muted-foreground">
        Ten adres nie istnieje w portalu Hubu. Wróć do startu albo opisz problem — pomożemy znaleźć
        właściwą ścieżkę.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/portal" className={cn(buttonVariants())}>
          Portal
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Strona główna
        </Link>
      </div>
    </div>
  )
}
