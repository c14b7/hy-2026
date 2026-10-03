import { PanelSidebar } from "@/components/layout/panel-shell"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <PanelSidebar />
      <main id="main" className="min-w-0 flex-1 bg-background p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
