import { MatchmakingForm } from "@/components/matchmaking/matchmaking-form"

export const metadata = { title: "Opisz problem" }

export default function PotrzebaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <MatchmakingForm />
    </div>
  )
}
