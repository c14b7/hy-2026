"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { ROLE_LABELS, useRole } from "@/components/shared/role-provider"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import type { UserRole } from "@/types/domain"
import { cn } from "cn"

const orgRoles: UserRole[] = ["org", "jst", "expert", "admin"]

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { setRole } = useRole()
  const router = useRouter()
  const searchParams = useSearchParams()
  const intent = searchParams.get("to") === "panel" ? "panel" : "portal"
  const [tab, setTab] = useState<"portal" | "panel">(intent)
  const [orgRole, setOrgRole] = useState<UserRole>("org")

  useEffect(() => {
    setTab(intent)
  }, [intent])

  const title = useMemo(
    () => (tab === "portal" ? "Wejście do portalu" : "Wejście do panelu"),
    [tab]
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="font-heading text-2xl font-bold text-primary">MOST</h1>
                <p className="text-balance text-muted-foreground">{title} (demo)</p>
              </div>

              <div
                className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1"
                role="tablist"
                aria-label="Cel logowania"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "portal"}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm",
                    tab === "portal" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setTab("portal")}
                >
                  Portal
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "panel"}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm",
                    tab === "panel" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setTab("panel")}
                >
                  Panel org.
                </button>
              </div>

              {tab === "portal" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Jako mieszkaniec możesz wygodniej zgłaszać pomysły i pisać na Hub.
                    Przeglądanie działa też bez konta.
                  </p>
                  <Field>
                    <FieldLabel htmlFor="email-portal">Email (demo)</FieldLabel>
                    <Input
                      id="email-portal"
                      type="email"
                      defaultValue="anna.kowalska@poczta.demo.pl"
                      readOnly
                    />
                  </Field>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setRole("seeker")
                      router.push("/portal")
                    }}
                  >
                    Wejdź jako mieszkaniec
                  </Button>
                  <Link
                    href="/portal"
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    onClick={() => setRole("guest")}
                  >
                    Kontynuuj bez logowania
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Panel to miejsce pracy organizacji, JST, ekspertów i admina ROPS.
                  </p>
                  <Field>
                    <FieldLabel htmlFor="email-panel">Email (demo)</FieldLabel>
                    <Input
                      id="email-panel"
                      type="email"
                      defaultValue="marek.nowak@fundacja-most.pl"
                      readOnly
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="org-role">Rola w panelu</FieldLabel>
                    <Select
                      id="org-role"
                      value={orgRole}
                      onChange={(e) => setOrgRole(e.target.value as UserRole)}
                    >
                      {orgRoles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setRole(orgRole)
                      router.push("/panel")
                    }}
                  >
                    Wejdź do panelu
                  </Button>
                </>
              )}

              <FieldDescription className="text-center">
                <Link href="/" className="underline">
                  Wróć na stronę główną
                </Link>
              </FieldDescription>
            </FieldGroup>
          </div>
          <div className="relative hidden bg-muted md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Prototyp demonstracyjny — bez prawdziwego uwierzytelniania.
      </FieldDescription>
    </div>
  )
}
