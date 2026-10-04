"use client"

import dynamic from "next/dynamic"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

const HeroGradient = dynamic(
  () => import("@/components/marketing/hero-gradient").then((m) => m.HeroGradient),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#ff6a2a,transparent_55%),linear-gradient(135deg,#e8a86a,#ff5005_55%,#c43a08)]"
      />
    ),
  }
)

export default function HomePage() {
  return (
    <section className="relative min-h-svh overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <HeroGradient />
      </div>
      {/* Soft left scrim — keeps type readable on the grainy plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(28,12,4,0.55)_0%,rgba(28,12,4,0.22)_42%,transparent_72%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col justify-center gap-7 px-4 py-28 md:gap-9 md:py-32">
        <p
          className={cn(
            "font-heading text-6xl font-black tracking-[-0.04em] text-white md:text-8xl",
            "animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both",
            "[text-shadow:0_2px_40px_rgba(0,0,0,0.35)]"
          )}
        >
          MOST
        </p>

        <div
          className={cn(
            "max-w-xl space-y-4",
            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both"
          )}
        >
          <h1 className="font-heading text-2xl font-medium leading-snug tracking-tight text-white/95 text-balance md:text-3xl md:leading-snug">
            Most między potrzebą a rozwiązaniem w Małopolsce
          </h1>
          <p className="max-w-md text-base font-medium leading-relaxed text-white/75 md:text-lg">
            Opisz problem własnymi słowami i znajdź innowacje społeczne — albo pracuj w panelu
            organizacji Hubu.
          </p>
        </div>

        <div
          className={cn(
            "flex flex-wrap gap-3",
            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both"
          )}
        >
          <Link
            href="/portal"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 rounded-full border-0 bg-white px-6 text-neutral-900 shadow-lg shadow-black/20 hover:bg-white/90 hover:text-neutral-900"
            )}
          >
            Wejdź do portalu
          </Link>
          <Link
            href="/login?to=panel"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-11 rounded-full border-white/45 bg-transparent px-6 text-white hover:bg-white/12 hover:text-white"
            )}
          >
            Panel organizacji
          </Link>
        </div>

        <p className="text-sm font-medium text-white/70 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          Przeglądasz bez konta. Logowanie mieszkańca jest opcjonalne.
        </p>
      </div>
    </section>
  )
}
