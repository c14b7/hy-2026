import type { Innovation, MatchItem } from "@/types/domain"
import { challenges, innovations, needs, organizations } from "@/data/mocks/seed"

const STOP = new Set([
  "i",
  "w",
  "z",
  "na",
  "do",
  "nie",
  "się",
  "to",
  "jest",
  "a",
  "o",
  "jak",
  "czy",
  "dla",
  "moja",
  "moje",
  "mam",
  "szukam",
  "potrzebuję",
  "bardzo",
  "oraz",
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ąćęłńóśźż\s-]/gi, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOP.has(t))
}

export function extractKeywords(query: string): string[] {
  const tokens = tokenize(query)
  const catalogTags = new Set(
    [
      ...innovations.flatMap((i) => i.tags),
      ...challenges.flatMap((c) => c.relatedTags),
      ...organizations.flatMap((o) => o.tags),
    ].map((t) => t.toLowerCase())
  )

  const fromCatalog = tokens.filter((t) =>
    [...catalogTags].some((tag) => tag.includes(t) || t.includes(tag.replace(/-/g, "")))
  )

  const mapped: string[] = []
  const q = query.toLowerCase()
  if (q.includes("samot") || q.includes("sąsiad")) mapped.push("samotnosc", "seniorzy")
  if (q.includes("psych") || q.includes("lęk") || q.includes("depres") || q.includes("kryzys"))
    mapped.push("zdrowie-psychiczne", "mlodziez")
  if (q.includes("cyfr") || q.includes("e-recept") || q.includes("internet") || q.includes("tablet"))
    mapped.push("wykluczenie-cyfrowe", "edukacja")
  if (q.includes("opiek") || q.includes("demenc")) mapped.push("opieka", "opiekunowie")
  if (q.includes("transport") || q.includes("dojazd") || q.includes("autobus"))
    mapped.push("transport", "dostepnosc")
  if (q.includes("mieszka")) mapped.push("mieszkalnictwo")
  if (q.includes("senior") || q.includes(" Babcia") || q.includes("mama ma"))
    mapped.push("seniorzy")

  return [...new Set([...mapped, ...fromCatalog, ...tokens.slice(0, 6)])].slice(0, 10)
}

function scoreInnovation(inn: Innovation, keywords: string[], location?: string, challengeId?: string): number {
  let score = 0
  const hay = `${inn.title} ${inn.summary} ${inn.description} ${inn.tags.join(" ")} ${inn.beneficiaries}`.toLowerCase()
  for (const kw of keywords) {
    if (hay.includes(kw.toLowerCase()) || inn.tags.some((t) => t.includes(kw))) score += 18
  }
  if (challengeId && inn.challengeIds.includes(challengeId)) score += 25
  if (location && (inn.location.toLowerCase().includes(location.toLowerCase()) || inn.county.toLowerCase().includes(location.toLowerCase())))
    score += 12
  if (inn.testRecruiting) score += 3
  return Math.min(score, 98)
}

export function buildMatchItems(
  query: string,
  options?: { location?: string; challengeId?: string }
): { keywords: string[]; items: MatchItem[] } {
  const keywords = extractKeywords(query)
  const loc = options?.location
  const challengeId = options?.challengeId

  const innItems: MatchItem[] = innovations
    .filter((i) => i.status === "published")
    .map((inn) => {
      const score = scoreInnovation(inn, keywords, loc, challengeId)
      return {
        targetType: "innovation" as const,
        targetId: inn.id,
        score,
        rationale: buildRationale(inn.title, keywords, score, "innowację"),
      }
    })
    .filter((i) => i.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const orgIds = new Set(
    innItems
      .map((i) => innovations.find((x) => x.id === i.targetId)?.orgId)
      .filter(Boolean) as string[]
  )

  const orgItems: MatchItem[] = organizations
    .filter((o) => orgIds.has(o.id) || o.tags.some((t) => keywords.includes(t)))
    .map((o) => {
      const overlap = o.tags.filter((t) => keywords.some((k) => t.includes(k) || k.includes(t)))
      const score = Math.min(40 + overlap.length * 15, 92)
      return {
        targetType: "organization" as const,
        targetId: o.id,
        score,
        rationale: overlap.length
          ? `Organizacja działa w obszarach: ${overlap.join(", ")} — blisko Twojego opisu.`
          : `Powiązana z dopasowanymi innowacjami w katalogu Hubu.`,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const needItems: MatchItem[] = needs
    .filter((n) => n.status === "published")
    .map((n) => {
      const hay = `${n.body} ${n.tags.join(" ")}`.toLowerCase()
      let score = 0
      for (const kw of keywords) if (hay.includes(kw.toLowerCase())) score += 16
      if (challengeId && n.challengeIds.includes(challengeId)) score += 20
      return {
        targetType: "need" as const,
        targetId: n.id,
        score: Math.min(score, 90),
        rationale: `Podobne zgłoszenie: porusza zbliżone słowa kluczowe (${n.tags.slice(0, 3).join(", ")}).`,
      }
    })
    .filter((i) => i.score >= 24)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  // Ensure demo always has results for common scenarios
  const items = [...innItems, ...orgItems, ...needItems]
  if (items.length < 3) {
    const fallback = innovations.slice(0, 3).map((inn, idx) => ({
      targetType: "innovation" as const,
      targetId: inn.id,
      score: 70 - idx * 8,
      rationale: `Sugestia katalogowa: „${inn.title}” często pomaga w podobnych sytuacjach w Małopolsce.`,
    }))
    return { keywords, items: fallback }
  }

  return { keywords, items }
}

function buildRationale(title: string, keywords: string[], score: number, kind: string): string {
  const top = keywords.slice(0, 3).join(", ") || "opisany kontekst"
  if (score >= 70) return `Silne dopasowanie ${kind} „${title}” do słów kluczowych: ${top}.`
  if (score >= 40) return `Częściowe dopasowanie ${kind} „${title}” — warto sprawdzić szczegóły i lokalizację.`
  return `Może być pomocne: „${title}” pojawia się w powiązanych obszarach Hubu.`
}

export const demoScenarios: { label: string; query: string }[] = [
  {
    label: "Samotność seniora",
    query:
      "Moja mama ma 78 lat, mieszka sama i niemal z nikim nie rozmawia. Szukam lokalnego wsparcia sąsiedzkiego w Limanowej.",
  },
  {
    label: "Wykluczenie cyfrowe",
    query:
      "Seniorzy w naszej gminie nie radzą sobie z e-receptami i profilem zaufanym. Potrzebujemy punktów pomocy cyfrowej.",
  },
  {
    label: "Kryzys młodzieży",
    query:
      "Syn w liceum ma kryzys lękowy, a kolejka do psychologa to miesiące. Czy jest lokalne szybkie wsparcie zdrowia psychicznego?",
  },
]
