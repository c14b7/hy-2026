import Link from "next/link"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link
            href="/"
            className="font-heading text-sm font-bold tracking-[0.18em] text-white/90 transition-colors hover:text-white"
          >
            MOST
          </Link>
          <Link
            href="/login?to=panel"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Panel organizacji
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}
