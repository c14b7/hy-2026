import { Suspense } from "react"

import { CommunicationInbox } from "@/components/communication/inbox"
import { GuestAuthPrompt } from "@/components/shared/guest-auth-prompt"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Komunikacja" }

export default function KomunikacjaPage() {
  return (
    <div className="space-y-4">
      <GuestAuthPrompt action="rozmów z Hubem" />
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
        <CommunicationInbox />
      </Suspense>
    </div>
  )
}
