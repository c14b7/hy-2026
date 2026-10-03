import { MatchResults } from "@/components/matchmaking/match-results"

export const metadata = { title: "Wyniki dopasowania" }

export default function WynikPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <MatchResults />
    </div>
  )
}
