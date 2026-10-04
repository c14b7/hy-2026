import { TesterSignupForm } from "@/components/tester/tester-signup-form"

export const metadata = { title: "Zapis na testy" }

export default function TesterDetailPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <TesterSignupForm />
    </div>
  )
}
