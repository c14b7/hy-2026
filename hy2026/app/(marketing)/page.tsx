import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.92_0.06_70),transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.95_0.03_40),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,oklch(0.3_0.06_50),transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.22_0.03_40),transparent_50%)]"
      />
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center gap-8 px-4 py-24 md:py-28">
        <p className="font-heading text-5xl font-semibold tracking-tight text-primary md:text-6xl">
          MOST
        </p>
        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance md:text-4xl">
            Most między potrzebą a rozwiązaniem w Małopolsce
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Wejdź do portalu, opisz problem własnymi słowami i znajdź innowacje społeczne — albo
            pracuj w panelu organizacji Hubu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal" className={cn(buttonVariants({ size: "lg" }))}>
            Wejdź do portalu
          </Link>
          <Link
            href="/login?to=panel"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Panel organizacji
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Możesz przeglądać portal bez konta. Logowanie mieszkańca jest opcjonalne.
        </p>
      </div>
    </section>
  )
}
