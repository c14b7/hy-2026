import { MatchResults } from "@/components/matchmaking/match-results"

export const metadata = { title: "Wyniki dopasowania" }

export default function WynikPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <MatchResults />
    </div>
  )
}
