"use client"

import Link from "next/link"

import { useRole } from "@/components/shared/role-provider"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function GuestAuthPrompt({
  action = "tej akcji",
}: {
  action?: string
}) {
  const { role } = useRole()
  if (role !== "guest") return null

  return (
    <div
      role="status"
      className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm"
    >
      Przeglądasz jako gość. Do {action} warto{" "}
      <Link href="/login?to=portal" className="font-medium text-primary hover:underline">
        zalogować się jako mieszkaniec
      </Link>{" "}
      (demo) — możesz też kontynuować bez konta.
      <div className="mt-2">
        <Link href="/login?to=portal" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Zaloguj się
        </Link>
      </div>
    </div>
  )
}
