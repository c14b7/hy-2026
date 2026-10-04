import { PanelSidebar } from "@/components/layout/panel-shell"
import { DataSourceBadge } from "@/components/shared/data-source-badge"
import { ThemeControl } from "@/components/theme-control"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <PanelSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">
          {children}
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-4 py-3 md:px-8">
          <DataSourceBadge />
          <ThemeControl />
        </footer>
      </div>
    </div>
  )
}
