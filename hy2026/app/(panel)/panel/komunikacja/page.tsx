import { Suspense } from "react"

import { CommunicationInbox } from "@/components/communication/inbox"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Panel · Komunikacja" }

export default function PanelKomunikacjaPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-medium">Komunikacja</h1>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <CommunicationInbox />
      </Suspense>
    </div>
  )
}
