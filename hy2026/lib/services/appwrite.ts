import "server-only"

import { ExecutionMethod, ID, Query } from "node-appwrite"

import {
  mapBeneficiary,
  mapChallenge,
  mapGrant,
  mapIdea,
  mapInnovation,
  mapKnowledge,
  mapMessage,
  mapNeed,
  mapOrganization,
  mapStaff,
  mapTestSignup,
  mapThread,
} from "@/lib/appwrite/mappers"
import { getDatabaseId, getFunctions, getTablesDB } from "@/lib/appwrite/server"
import { buildMatchItems, extractKeywords } from "@/lib/ai/match"
import type { Services } from "@/lib/services/interfaces"
import type {
  IdeaCard,
  Innovation,
  InnovationFilters,
  OrganizationFilters,
  PublishStatus,
  ServiceAdaptation,
  TrendCluster,
} from "@/types/domain"

type Row = Record<string, unknown>

async function listAll(tableId: string, queries: string[] = []): Promise<Row[]> {
  const db = getTablesDB()
  const databaseId = getDatabaseId()
  const rows: Row[] = []
  let cursor: string | undefined

  for (;;) {
    const pageQueries = [...queries, Query.limit(100)]
    if (cursor) pageQueries.push(Query.cursorAfter(cursor))
    const res = await db.listRows({
      databaseId,
      tableId,
      queries: pageQueries,
    })
    const batch = ((res as { rows?: Row[] }).rows ?? []) as Row[]
    rows.push(...batch)
    if (batch.length < 100) break
    cursor = String(batch[batch.length - 1].$id)
  }
  return rows
}

function filterInnovations(items: Innovation[], filters?: InnovationFilters) {
  return items.filter((i) => {
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

async function executeFunction(functionId: string, body: Record<string, unknown>) {
  const fn = getFunctions()
  const execution = await fn.createExecution({
    functionId,
    body: JSON.stringify(body),
    async: false,
    xpath: "/",
    method: ExecutionMethod.POST,
    headers: { "content-type": "application/json" },
  })
  const status = String((execution as { status?: string }).status ?? "")
  const responseStatus = Number(
    (execution as { responseStatusCode?: number }).responseStatusCode ?? 0
  )
  const responseBody = String((execution as { responseBody?: string }).responseBody ?? "")
  if (status === "failed" || responseStatus >= 400) {
    throw new Error(responseBody || `Function ${functionId} failed`)
  }
  return JSON.parse(responseBody || "{}") as Record<string, unknown>
}

export function createAppwriteServices(): Services {
  const databaseId = getDatabaseId()

  return {
    innovations: {
      async list(filters) {
        const rows = await listAll("innovations")
        return filterInnovations(rows.map(mapInnovation), filters)
      },
      async getById(id) {
        try {
          const row = await getTablesDB().getRow({ databaseId, tableId: "innovations", rowId: id })
          return mapInnovation(row as Row)
        } catch {
          return null
        }
      },
      async listByOrg(orgId) {
        const rows = await listAll("innovations", [Query.equal("orgId", orgId)])
        return rows.map(mapInnovation)
      },
      async updateStatus(id, status: PublishStatus) {
        try {
          const row = await getTablesDB().updateRow({
            databaseId,
            tableId: "innovations",
            rowId: id,
            data: { status },
          })
          return mapInnovation(row as Row)
        } catch {
          return null
        }
      },
    },

    organizations: {
      async list(filters?: OrganizationFilters) {
        const rows = await listAll("organizations")
        return rows.map(mapOrganization).filter((o) => {
          if (filters?.q) {
            const q = filters.q.toLowerCase()
            if (!`${o.name} ${o.description} ${o.tags.join(" ")}`.toLowerCase().includes(q))
              return false
          }
          if (filters?.type && o.type !== filters.type) return false
          if (filters?.county && o.county !== filters.county) return false
          if (filters?.tag && !o.tags.includes(filters.tag)) return false
          return true
        })
      },
      async getById(id) {
        try {
          const row = await getTablesDB().getRow({
            databaseId,
            tableId: "organizations",
            rowId: id,
          })
          return mapOrganization(row as Row)
        } catch {
          return null
        }
      },
    },

    challenges: {
      async list() {
        return (await listAll("challenges")).map(mapChallenge)
      },
      async getBySlug(slug) {
        const rows = await listAll("challenges", [Query.equal("slug", slug)])
        return rows[0] ? mapChallenge(rows[0]) : null
      },
      async getById(id) {
        try {
          const row = await getTablesDB().getRow({ databaseId, tableId: "challenges", rowId: id })
          return mapChallenge(row as Row)
        } catch {
          return null
        }
      },
    },

    needs: {
      async list() {
        return (await listAll("needs", [Query.orderDesc("$createdAt")])).map(mapNeed)
      },
      async create(input) {
        const row = await getTablesDB().createRow({
          databaseId,
          tableId: "needs",
          rowId: ID.unique(),
          data: {
            body: input.body,
            location: input.location ?? "",
            county: input.county ?? "",
            challengeIds: input.challengeIds,
            tags: input.tags,
            authorRole: input.authorRole,
            authorName: input.authorName,
            authorId: "",
            status: "pending",
          },
        })
        return mapNeed(row as Row)
      },
      async updateStatus(id, status) {
        try {
          const row = await getTablesDB().updateRow({
            databaseId,
            tableId: "needs",
            rowId: id,
            data: { status },
          })
          return mapNeed(row as Row)
        } catch {
          return null
        }
      },
    },

    ideas: {
      async list() {
        return (await listAll("ideas", [Query.orderDesc("$createdAt")])).map(mapIdea)
      },
      async getById(id) {
        try {
          const row = await getTablesDB().getRow({ databaseId, tableId: "ideas", rowId: id })
          return mapIdea(row as Row)
        } catch {
          return null
        }
      },
      async create(input) {
        const row = await getTablesDB().createRow({
          databaseId,
          tableId: "ideas",
          rowId: ID.unique(),
          data: {
            title: input.title,
            essence: input.essence,
            audience: input.audience,
            stage: input.stage,
            description: input.description,
            authorId: input.authorId,
            authorName: input.authorName,
            challengeIds: input.challengeIds,
            tags: input.tags,
            status: "pending",
          },
        })
        return mapIdea(row as Row)
      },
      async updateStatus(id, status) {
        try {
          const row = await getTablesDB().updateRow({
            databaseId,
            tableId: "ideas",
            rowId: id,
            data: { status },
          })
          return mapIdea(row as Row)
        } catch {
          return null
        }
      },
    },

    knowledge: {
      async list() {
        return (await listAll("knowledge", [Query.equal("status", "published")])).map(mapKnowledge)
      },
      async listAll() {
        return (await listAll("knowledge", [Query.orderDesc("$updatedAt")])).map(mapKnowledge)
      },
      async getById(id) {
        try {
          const row = await getTablesDB().getRow({ databaseId, tableId: "knowledge", rowId: id })
          return mapKnowledge(row as Row)
        } catch {
          return null
        }
      },
      async getBySlug(slug) {
        const rows = await listAll("knowledge", [Query.equal("slug", slug)])
        return rows[0] ? mapKnowledge(rows[0]) : null
      },
      async create(input) {
        const existing = await listAll("knowledge")
        const baseSlug = input.slug?.trim() || slugify(input.title) || `wpis-${Date.now()}`
        let slug = baseSlug
        let i = 2
        while (existing.some((r) => str(r.slug) === slug)) {
          slug = `${baseSlug}-${i++}`
        }
        const body = input.body
        const row = await getTablesDB().createRow({
          databaseId,
          tableId: "knowledge",
          rowId: ID.unique(),
          data: {
            slug,
            title: input.title,
            kind: input.kind,
            summary: input.summary,
            body,
            challengeIds: input.challengeIds,
            tags: input.tags,
            readingMinutes: input.readingMinutes ?? estimateReadingMinutes(body),
            status: input.status,
            attachmentFileIds: [],
          },
        })
        return mapKnowledge(row as Row)
      },
      async update(id, patch) {
        try {
          const data: Record<string, unknown> = { ...patch }
          if (patch.body !== undefined && patch.readingMinutes === undefined) {
            data.readingMinutes = estimateReadingMinutes(patch.body)
          }
          delete data.id
          delete data.updatedAt
          const row = await getTablesDB().updateRow({
            databaseId,
            tableId: "knowledge",
            rowId: id,
            data,
          })
          return mapKnowledge(row as Row)
        } catch {
          return null
        }
      },
      async remove(id) {
        try {
          await getTablesDB().deleteRow({ databaseId, tableId: "knowledge", rowId: id })
          return true
        } catch {
          return false
        }
      },
    },

    grants: {
      async list() {
        return (await listAll("grant_calls")).map(mapGrant)
      },
    },

    communication: {
      async listThreads() {
        return (await listAll("threads", [Query.orderDesc("$updatedAt")])).map(mapThread)
      },
      async getMessages(threadId) {
        return (
          await listAll("messages", [
            Query.equal("threadId", threadId),
            Query.orderAsc("$createdAt"),
          ])
        ).map(mapMessage)
      },
      async sendMessage(threadId, body, authorName, authorId) {
        const row = await getTablesDB().createRow({
          databaseId,
          tableId: "messages",
          rowId: ID.unique(),
          data: { threadId, authorId, authorName, body },
        })
        await getTablesDB().updateRow({
          databaseId,
          tableId: "threads",
          rowId: threadId,
          data: {
            unreadForAdmin: authorId !== "u-tomek",
            status: "open",
          },
        })
        return mapMessage(row as Row)
      },
      async createThread(input) {
        const id = ID.unique()
        const threadRow = await getTablesDB().createRow({
          databaseId,
          tableId: "threads",
          rowId: id,
          data: {
            subject: input.subject,
            participantIds: input.participantIds,
            participantNames: input.participantNames,
            ...(input.relatedType
              ? { relatedType: input.relatedType, relatedId: input.relatedId ?? "" }
              : {}),
            status: input.status,
            unreadForAdmin: true,
          },
        })
        await getTablesDB().createRow({
          databaseId,
          tableId: "messages",
          rowId: ID.unique(),
          data: {
            threadId: id,
            authorId: input.participantIds[0] ?? "u-anna",
            authorName: input.participantNames[0] ?? "Użytkownik",
            body: input.firstMessage,
          },
        })
        return mapThread(threadRow as Row)
      },
    },

    tester: {
      async listSignups(innovationId) {
        const queries = innovationId ? [Query.equal("innovationId", innovationId)] : []
        return (await listAll("test_signups", queries)).map(mapTestSignup)
      },
      async signup(input) {
        const row = await getTablesDB().createRow({
          databaseId,
          tableId: "test_signups",
          rowId: ID.unique(),
          data: {
            innovationId: input.innovationId,
            userId: input.userId,
            userName: input.userName,
            ...(input.rating != null ? { rating: input.rating } : {}),
            feedback: input.feedback ?? "",
            improvement: input.improvement ?? "",
          },
        })
        return mapTestSignup(row as Row)
      },
    },

    ai: {
      async matchNeed(query, options) {
        try {
          const res = await executeFunction("match-need", {
            query,
            location: options?.location,
            challengeId: options?.challengeId,
          })
          const items = Array.isArray(res.items) ? (res.items as { score?: number }[]) : []
          const best = items.reduce((m, i) => Math.max(m, Number(i.score) || 0), 0)
          if (items.length === 0 || best < 40) {
            throw new Error("weak match-need result")
          }
          return {
            id: str(res.id) || `match-${Date.now()}`,
            query,
            keywords: Array.isArray(res.keywords) ? res.keywords.map(String) : [],
            items: items as never[],
            createdAt: str(res.createdAt) || new Date().toISOString(),
          }
        } catch {
          const [innovations, organizations, needs, challenges] = await Promise.all([
            listAll("innovations").then((r) => r.map(mapInnovation)),
            listAll("organizations").then((r) => r.map(mapOrganization)),
            listAll("needs").then((r) => r.map(mapNeed)),
            listAll("challenges").then((r) => r.map(mapChallenge)),
          ])
          const { keywords, items } = buildMatchItems(query, options, {
            innovations,
            organizations,
            needs,
            challenges,
          })
          const id = ID.unique()
          await getTablesDB().createRow({
            databaseId,
            tableId: "match_queries",
            rowId: id,
            data: {
              query,
              keywords,
              location: options?.location ?? "",
              challengeId: options?.challengeId ?? "",
              authorId: "",
              itemsJson: JSON.stringify(items),
              createdAt: new Date().toISOString(),
            },
          })
          return { id, query, keywords, items, createdAt: new Date().toISOString() }
        }
      },

      async suggestKeywords(query) {
        const [innovations, organizations, challenges] = await Promise.all([
          listAll("innovations").then((r) => r.map(mapInnovation)),
          listAll("organizations").then((r) => r.map(mapOrganization)),
          listAll("challenges").then((r) => r.map(mapChallenge)),
        ])
        return extractKeywords(query, {
          innovations,
          organizations,
          needs: [],
          challenges,
        })
      },

      async suggestIdeaImprovements(idea: Partial<IdeaCard>) {
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
        try {
          const res = await executeFunction("middleman-adapt", {
            innovationId,
            institutionBrief,
          })
          return {
            id: str(res.id) || ID.unique(),
            innovationId,
            institutionBrief,
            steps: strArr(res.steps),
            resources: strArr(res.resources),
            risks: strArr(res.risks),
            summary: str(res.summary),
            createdAt: str(res.createdAt) || new Date().toISOString(),
          } satisfies ServiceAdaptation
        } catch {
          let title = "wybrana innowacja"
          try {
            const inn = await getTablesDB().getRow({
              databaseId,
              tableId: "innovations",
              rowId: innovationId,
            })
            title = str((inn as Row).title, title)
          } catch {
            /* ignore */
          }
          const row: ServiceAdaptation = {
            id: ID.unique(),
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
          await getTablesDB().createRow({
            databaseId,
            tableId: "service_adaptations",
            rowId: row.id,
            data: {
              innovationId: row.innovationId,
              institutionBrief: row.institutionBrief,
              steps: row.steps,
              resources: row.resources,
              risks: row.risks,
              summary: row.summary,
              authorId: "",
            },
          })
          return row
        }
      },

      async getTrendClusters() {
        try {
          const res = await executeFunction("trend-clusters", {})
          if (Array.isArray(res.clusters)) return res.clusters as TrendCluster[]
        } catch {
          /* fallback below */
        }
        const [needs, challenges] = await Promise.all([
          listAll("needs").then((r) => r.map(mapNeed)),
          listAll("challenges").then((r) => r.map(mapChallenge)),
        ])
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
        return (await listAll("beneficiaries", [Query.equal("orgId", orgId)])).map(mapBeneficiary)
      },
      async listStaff(orgId) {
        return (await listAll("staff_members", [Query.equal("orgId", orgId)])).map(mapStaff)
      },
    },
  }
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v)
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : []
}
