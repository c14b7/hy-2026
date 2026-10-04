import { Suspense } from "react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/login-form"
import { ThemeControl } from "@/components/theme-control"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Logowanie",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_oklch(0.94_0.04_55),_oklch(0.97_0.01_75)_45%,_oklch(0.985_0.006_75))] p-6 md:p-10 dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.28_0.04_50),_oklch(0.2_0.02_48)_50%,_oklch(0.18_0.015_50))]">
      <div className="w-full max-w-sm md:max-w-md">
        <Suspense
          fallback={<Skeleton className="h-80 w-full rounded-[min(var(--radius-4xl),24px)]" />}
        >
          <LoginForm />
        </Suspense>
      </div>
      <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6">
        <ThemeControl />
      </div>
    </div>
  )
}
