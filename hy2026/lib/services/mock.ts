import {
  beneficiaries,
  challenges,
  grantCalls,
  ideas as ideasSeed,
  innovations as innovationsSeed,
  knowledge,
  messages as messagesSeed,
  needs as needsSeed,
  organizations,
  staff,
  testSignups as testSignupsSeed,
  threads as threadsSeed,
} from "@/data/mocks/seed"
import { buildMatchItems, extractKeywords } from "@/lib/ai/match"
import type { Services } from "@/lib/services/interfaces"
import type {
  IdeaCard,
  InnovationFilters,
  KnowledgeArticle,
  Message,
  NeedReport,
  OrganizationFilters,
  PublishStatus,
  ServiceAdaptation,
  TestSignup,
  Thread,
  TrendCluster,
} from "@/types/domain"

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

let innovations = [...innovationsSeed]
let needs = [...needsSeed]
let ideas = [...ideasSeed]
let knowledgeArticles = [...knowledge]
let threads = [...threadsSeed]
let messages = [...messagesSeed]
let testSignups = [...testSignupsSeed]
let adaptations: ServiceAdaptation[] = []

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

function estimateReadingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

function filterInnovations(filters?: InnovationFilters) {
  return innovations.filter((i) => {
    if (!filters?.includeUnpublished && i.status !== "published") return false
    if (filters?.q) {
      const q = filters.q.toLowerCase()
      const hay = `${i.title} ${i.summary} ${i.tags.join(" ")}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters?.challengeId && !i.challengeIds.includes(filters.challengeId)) return false
    if (filters?.county && i.county !== filters.county) return false
    if (filters?.tag && !i.tags.includes(filters.tag)) return false
    if (filters?.stage && i.stage !== filters.stage) return false
    if (filters?.testRecruiting && !i.testRecruiting) return false
    return true
  })
}

export const mockServices: Services = {
  innovations: {
    async list(filters) {
      await delay()
      return filterInnovations(filters)
    },
    async getById(id) {
      await delay()
      return innovations.find((i) => i.id === id) ?? null
    },
    async listByOrg(orgId) {
      await delay()
      return innovations.filter((i) => i.orgId === orgId)
    },
    async updateStatus(id, status: PublishStatus) {
      await delay()
      innovations = innovations.map((i) => (i.id === id ? { ...i, status } : i))
      return innovations.find((i) => i.id === id) ?? null
    },
  },
  organizations: {
    async list(filters?: OrganizationFilters) {
      await delay()
      return organizations.filter((o) => {
        if (filters?.q) {
          const q = filters.q.toLowerCase()
          if (!`${o.name} ${o.description} ${o.tags.join(" ")}`.toLowerCase().includes(q)) return false
        }
        if (filters?.type && o.type !== filters.type) return false
        if (filters?.county && o.county !== filters.county) return false
        if (filters?.tag && !o.tags.includes(filters.tag)) return false
        return true
      })
    },
    async getById(id) {
      await delay()
      return organizations.find((o) => o.id === id) ?? null
    },
  },
  challenges: {
    async list() {
      await delay()
      return challenges
    },
    async getBySlug(slug) {
      await delay()
      return challenges.find((c) => c.slug === slug) ?? null
    },
    async getById(id) {
      await delay()
      return challenges.find((c) => c.id === id) ?? null
    },
  },
  needs: {
    async list() {
      await delay()
      return needs
    },
    async create(input) {
      await delay()
      const row: NeedReport = {
        ...input,
        id: `need-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
      }
      needs = [row, ...needs]
      return row
    },
    async updateStatus(id, status) {
      await delay()
      needs = needs.map((n) => (n.id === id ? { ...n, status } : n))
      return needs.find((n) => n.id === id) ?? null
    },
  },
  ideas: {
    async list() {
      await delay()
      return ideas
    },
    async getById(id) {
      await delay()
      return ideas.find((i) => i.id === id) ?? null
    },
    async create(input) {
      await delay()
      const row: IdeaCard = {
        ...input,
        id: `idea-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
      }
      ideas = [row, ...ideas]
      return row
    },
    async updateStatus(id, status) {
      await delay()
      ideas = ideas.map((i) => (i.id === id ? { ...i, status } : i))
      return ideas.find((i) => i.id === id) ?? null
    },
  },
  knowledge: {
    async list() {
      await delay()
      return knowledgeArticles.filter((k) => k.status === "published")
    },
    async listAll() {
      await delay()
      return [...knowledgeArticles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    async getById(id) {
      await delay()
      return knowledgeArticles.find((k) => k.id === id) ?? null
    },
    async getBySlug(slug) {
      await delay()
      return knowledgeArticles.find((k) => k.slug === slug) ?? null
    },
    async create(input) {
      await delay()
      const baseSlug = input.slug?.trim() || slugify(input.title) || `wpis-${Date.now()}`
      let slug = baseSlug
      let i = 2
      while (knowledgeArticles.some((k) => k.slug === slug)) {
        slug = `${baseSlug}-${i++}`
      }
      const row: KnowledgeArticle = {
        ...input,
        id: `know-${Date.now()}`,
        slug,
        body: input.body,
        readingMinutes: input.readingMinutes ?? estimateReadingMinutes(input.body),
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      knowledgeArticles = [row, ...knowledgeArticles]
      return row
    },
    async update(id, patch) {
      await delay()
      knowledgeArticles = knowledgeArticles.map((k) => {
        if (k.id !== id) return k
        const next = { ...k, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
        if (patch.body !== undefined && patch.readingMinutes === undefined) {
          next.readingMinutes = estimateReadingMinutes(patch.body)
        }
        return next
      })
      return knowledgeArticles.find((k) => k.id === id) ?? null
    },
    async remove(id) {
      await delay()
      const before = knowledgeArticles.length
      knowledgeArticles = knowledgeArticles.filter((k) => k.id !== id)
      return knowledgeArticles.length < before
    },
  },
  grants: {
    async list() {
      await delay()
      return grantCalls
    },
  },
  communication: {
    async listThreads() {
      await delay()
      return [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    async getMessages(threadId) {
      await delay()
      return messages.filter((m) => m.threadId === threadId)
    },
    async sendMessage(threadId, body, authorName, authorId) {
      await delay()
      const msg: Message = {
        id: `msg-${Date.now()}`,
        threadId,
        authorId,
        authorName,
        body,
        createdAt: new Date().toISOString(),
      }
      messages = [...messages, msg]
      threads = threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              updatedAt: msg.createdAt,
              unreadForAdmin: authorId !== "u-tomek",
              status: "open" as const,
            }
          : t
      )
      return msg
    },
    async createThread(input) {
      await delay()
      const id = `th-${Date.now()}`
      const thread: Thread = {
        id,
        subject: input.subject,
        participantIds: input.participantIds,
        participantNames: input.participantNames,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        status: input.status,
        updatedAt: new Date().toISOString(),
        unreadForAdmin: true,
      }
      threads = [thread, ...threads]
      const msg: Message = {
        id: `msg-${Date.now()}`,
        threadId: id,
        authorId: input.participantIds[0] ?? "u-anna",
        authorName: input.participantNames[0] ?? "Użytkownik",
        body: input.firstMessage,
        createdAt: thread.updatedAt,
      }
      messages = [...messages, msg]
      return thread
    },
  },
  tester: {
    async listSignups(innovationId) {
      await delay()
      return innovationId
        ? testSignups.filter((t) => t.innovationId === innovationId)
        : testSignups
    },
    async signup(input) {
      await delay()
      const row: TestSignup = {
        ...input,
        id: `test-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      testSignups = [row, ...testSignups]
      return row
    },
  },
  ai: {
    async matchNeed(query, options) {
      await delay(400)
      const { keywords, items } = buildMatchItems(query, options)
      return {
        id: `match-${Date.now()}`,
        query,
        keywords,
        items,
        createdAt: new Date().toISOString(),
      }
    },
    async suggestKeywords(query) {
      await delay(200)
      return extractKeywords(query)
    },
    async suggestIdeaImprovements(idea) {
      await delay(250)
      const tips = [
        "Doprecyzuj, kto konkretnie skorzysta w pierwszym miesiącu testu.",
        "Dodaj prosty wskaźnik sukcesu (np. liczba spotkań / satysfakcja 1–5).",
        "Wskaż lokalnego partnera (CUS, biblioteka, sołtys), który ułatwi start.",
        "Opisz ryzyko i jak je obniżysz przy małym pilotażu.",
      ]
      if (idea.audience?.toLowerCase().includes("senior")) {
        tips.unshift("Zaplanuj kanał kontaktu offline (telefon / ogłoszenie w parafii / CUS).")
      }
      if (!idea.essence || idea.essence.length < 40) {
        tips.unshift("Rozwiń istotę pomysłu o 1–2 zdania: co jest nowe wobec status quo?")
      }
      return tips.slice(0, 4)
    },
    async adaptInnovationToService(innovationId, institutionBrief) {
      await delay(450)
      const inn = innovations.find((i) => i.id === innovationId)
      const title = inn?.title ?? "wybrana innowacja"
      const row: ServiceAdaptation = {
        id: `adapt-${Date.now()}`,
        innovationId,
        institutionBrief,
        summary: `Propozycja wdrożenia „${title}” jako usługi publicznej dopasowanej do briefu instytucji.`,
        steps: [
          "Diagnoza lokalna: potwierdź skalę potrzeby wśród mieszkańców (ankieta CUS / dyżur).",
          `Dostosuj model „${title}” do zasobów gminy (lokal, kadra, wolontariat).`,
          "Uruchom 8–12 tygodniowy pilotaż z 1–2 lokalizacjami.",
          "Zbierz feedback testerów i decyzja: skala / poprawki / stop.",
        ],
        resources: [
          "Koordynator lokalny (0.25–0.5 etatu)",
          "Sala / punkt stacjonarny lub kanał zdalny",
          "Budżet startowy na komunikację i materiały",
          "Partner NGO lub mentor z Hubu",
        ],
        risks: [
          "Niska frekwencja na starcie — mitigacja: lokalne ambasadorstwo i łatwy zapis telefonem",
          "Zależność od jednej osoby — mitigacja: procedura zastępstw",
          "Oczekiwania vs możliwości kadrowe — mitigacja: wąski zakres pilotażu",
        ],
        createdAt: new Date().toISOString(),
      }
      adaptations = [row, ...adaptations]
      return row
    },
    async getTrendClusters() {
      await delay()
      const map = new Map<string, TrendCluster>()
      for (const n of needs) {
        for (const cid of n.challengeIds) {
          const ch = challenges.find((c) => c.id === cid)
          if (!ch) continue
          const prev = map.get(cid) ?? {
            challengeId: cid,
            challengeTitle: ch.title,
            count: 0,
            topTags: [],
            sampleNeeds: [],
          }
          prev.count += 1
          prev.topTags = [...new Set([...prev.topTags, ...n.tags])].slice(0, 5)
          if (prev.sampleNeeds.length < 3) prev.sampleNeeds.push(n.body.slice(0, 120) + "…")
          map.set(cid, prev)
        }
      }
      return [...map.values()].sort((a, b) => b.count - a.count)
    },
  },
  orgCrm: {
    async listBeneficiaries(orgId) {
      await delay()
      return beneficiaries.filter((b) => b.orgId === orgId)
    },
    async listStaff(orgId) {
      await delay()
      return staff.filter((s) => s.orgId === orgId)
    },
  },
}

