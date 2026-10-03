import { Suspense } from "react"

import { CommunicationInbox } from "@/components/communication/inbox"
import { GuestAuthPrompt } from "@/components/shared/guest-auth-prompt"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Komunikacja" }

export default function KomunikacjaPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-medium">Komunikacja</h1>
        <p className="text-muted-foreground">
          Dialog z ROPS, mentorami i organizacjami — szybkie pytania i partnerstwa.
        </p>
      </div>
      <GuestAuthPrompt action="rozmów z Hubem" />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CommunicationInbox />
      </Suspense>
    </div>
  )
}
