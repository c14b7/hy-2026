import { Suspense } from "react"

import { InnovationsCatalog } from "@/components/innovations/innovations-catalog"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Innowacje" }

export default function InnowacjePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <InnovationsCatalog />
      </Suspense>
    </div>
  )
}
