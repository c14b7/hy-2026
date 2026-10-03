import { Suspense } from "react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/login-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Logowanie",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-[min(var(--radius-4xl),24px)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
