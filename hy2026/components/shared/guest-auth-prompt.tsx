"use client"

import Link from "next/link"

import { useRole } from "@/components/shared/role-provider"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function GuestAuthPrompt({ action = "tej akcji" }: { action?: string }) {
  const { role } = useRole()
  if (role !== "guest") return null

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl bg-primary/8 px-4 py-3.5 text-sm ring-1 ring-primary/15 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-foreground/90">
        Przeglądasz jako gość. Do {action} warto{" "}
        <span className="font-semibold">zalogować się jako mieszkaniec</span> — możesz też
        kontynuować bez konta.
      </p>
      <Link
        href="/login?to=portal"
        className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
      >
        Zaloguj się
      </Link>
    </div>
  )
}
