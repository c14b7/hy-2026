import { IdeaCreateForm } from "@/components/ideas/idea-forms"
import { GuestAuthPrompt } from "@/components/shared/guest-auth-prompt"

export const metadata = { title: "Nowa fiszka" }

export default function NowyPomyslPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <GuestAuthPrompt action="zapisania fiszki na konto" />
      <IdeaCreateForm />
    </div>
  )
}
