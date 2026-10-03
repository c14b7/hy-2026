import Link from "next/link"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-primary">
            MOST
          </Link>
          <Link
            href="/login?to=panel"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
