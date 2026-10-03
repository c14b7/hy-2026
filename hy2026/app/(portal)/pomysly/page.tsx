import Link from "next/link"

import { IdeasList } from "@/components/ideas/idea-forms"
import { GuestAuthPrompt } from "@/components/shared/guest-auth-prompt"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export const metadata = { title: "Pomysły" }

export default function PomyslyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium">Kreator pomysłów</h1>
          <p className="text-muted-foreground">
            Zgłaszaj fiszki innowacji i dobrych praktyk. Nabory grantowe pojawią się osobno.
          </p>
        </div>
        <Link href="/pomysly/nowy" className={cn(buttonVariants())}>
          Nowa fiszka
        </Link>
      </div>
      <GuestAuthPrompt action="zgłaszania pomysłów" />
      <IdeasList />
    </div>
  )
}
