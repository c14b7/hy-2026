import { Suspense } from "react"

import { MiddlemanForm } from "@/components/middleman/middleman-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Middleman AI" }

export default function MiddlemanPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <MiddlemanForm />
      </Suspense>
    </div>
  )
}
