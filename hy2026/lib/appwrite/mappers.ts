import type {
  Beneficiary,
  ChallengeArea,
  GrantCall,
  IdeaCard,
  Innovation,
  KnowledgeArticle,
  Message,
  NeedReport,
  Organization,
  PublishStatus,
  ServiceAdaptation,
  StaffMember,
  TestSignup,
  Thread,
  UserRole,
} from "@/types/domain"

type Row = Record<string, unknown>

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v)
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && !Number.isNaN(v) ? v : undefined
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : []
}

function rowId(row: Row): string {
  return str(row.$id ?? row.id)
}

function createdAt(row: Row): string {
  return str(row.$createdAt ?? row.createdAt).slice(0, 10) || new Date().toISOString().slice(0, 10)
}

function updatedAt(row: Row): string {
  return str(row.$updatedAt ?? row.updatedAt).slice(0, 10) || createdAt(row)
}

export function mapOrganization(row: Row): Organization {
  return {
    id: rowId(row),
    name: str(row.name),
    type: str(row.type) as Organization["type"],
    location: str(row.location),
    county: str(row.county),
    description: str(row.description),
    tags: strArr(row.tags),
    contactEmail: str(row.contactEmail),
    website: str(row.website) || undefined,
    logoInitials: str(row.logoInitials, "?"),
  }
}

export function mapChallenge(row: Row): ChallengeArea {
  let metrics: ChallengeArea["metrics"] = []
  try {
    const raw = row.metricsJson
    metrics = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : []
  } catch {
    metrics = []
  }
  return {
    id: rowId(row),
    slug: str(row.slug),
    title: str(row.title),
    summary: str(row.summary),
    metrics,
    relatedTags: strArr(row.relatedTags),
  }
}

export function mapInnovation(row: Row): Innovation {
  const mediaType = str(row.mediaType)
  const mediaUrl = str(row.mediaUrl)
  return {
    id: rowId(row),
    title: str(row.title),
    summary: str(row.summary),
    description: str(row.description),
    stage: str(row.stage) as Innovation["stage"],
    orgId: str(row.orgId),
    challengeIds: strArr(row.challengeIds),
    tags: strArr(row.tags),
    location: str(row.location),
    county: str(row.county),
    media:
      mediaType && mediaUrl
        ? {
            type: mediaType as "image" | "video",
            url: mediaUrl,
            label: str(row.mediaLabel, "Media"),
          }
        : undefined,
    testRecruiting: bool(row.testRecruiting),
    status: str(row.status, "published") as PublishStatus,
    beneficiaries: str(row.beneficiaries),
    createdAt: createdAt(row),
  }
}

export function mapNeed(row: Row): NeedReport {
  return {
    id: rowId(row),
    body: str(row.body),
    location: str(row.location) || undefined,
    county: str(row.county) || undefined,
    challengeIds: strArr(row.challengeIds),
    tags: strArr(row.tags),
    authorRole: str(row.authorRole, "seeker") as UserRole,
    authorName: str(row.authorName),
    status: str(row.status, "pending") as PublishStatus,
    createdAt: createdAt(row),
  }
}

export function mapIdea(row: Row): IdeaCard {
  return {
    id: rowId(row),
    title: str(row.title),
    essence: str(row.essence),
    audience: str(row.audience),
    stage: str(row.stage) as IdeaCard["stage"],
    description: str(row.description),
    authorId: str(row.authorId),
    authorName: str(row.authorName),
    challengeIds: strArr(row.challengeIds),
    tags: strArr(row.tags),
    status: str(row.status, "pending") as PublishStatus,
    createdAt: createdAt(row),
  }
}

export function mapGrant(row: Row): GrantCall {
  return {
    id: rowId(row),
    title: str(row.title),
    summary: str(row.summary),
    opensAt: str(row.opensAt).slice(0, 10),
    closesAt: str(row.closesAt).slice(0, 10),
    active: bool(row.active),
  }
}

export function mapKnowledge(row: Row): KnowledgeArticle {
  return {
    id: rowId(row),
    slug: str(row.slug),
    title: str(row.title),
    kind: str(row.kind) as KnowledgeArticle["kind"],
    summary: str(row.summary),
    body: str(row.body),
    challengeIds: strArr(row.challengeIds),
    tags: strArr(row.tags),
    readingMinutes: num(row.readingMinutes) ?? 1,
    status: str(row.status, "published") as PublishStatus,
    updatedAt: updatedAt(row),
  }
}

export function mapTestSignup(row: Row): TestSignup {
  return {
    id: rowId(row),
    innovationId: str(row.innovationId),
    userId: str(row.userId),
    userName: str(row.userName),
    rating: num(row.rating),
    feedback: str(row.feedback) || undefined,
    improvement: str(row.improvement) || undefined,
    createdAt: createdAt(row),
  }
}

export function mapThread(row: Row): Thread {
  const relatedType = str(row.relatedType)
  return {
    id: rowId(row),
    subject: str(row.subject),
    participantIds: strArr(row.participantIds),
    participantNames: strArr(row.participantNames),
    relatedType: relatedType
      ? (relatedType as Thread["relatedType"])
      : undefined,
    relatedId: str(row.relatedId) || undefined,
    status: str(row.status, "open") as Thread["status"],
    updatedAt: str(row.$updatedAt ?? row.updatedAt) || new Date().toISOString(),
    unreadForAdmin: bool(row.unreadForAdmin),
  }
}

export function mapMessage(row: Row): Message {
  return {
    id: rowId(row),
    threadId: str(row.threadId),
    authorId: str(row.authorId),
    authorName: str(row.authorName),
    body: str(row.body),
    createdAt: str(row.$createdAt ?? row.createdAt) || new Date().toISOString(),
  }
}

export function mapBeneficiary(row: Row): Beneficiary {
  return {
    id: rowId(row),
    orgId: str(row.orgId),
    displayName: str(row.displayName),
    status: str(row.status, "active") as Beneficiary["status"],
    notes: str(row.notes),
    updatedAt: updatedAt(row),
  }
}

export function mapStaff(row: Row): StaffMember {
  return {
    id: rowId(row),
    orgId: str(row.orgId),
    displayName: str(row.displayName),
    role: str(row.role) as StaffMember["role"],
    email: str(row.email),
    active: bool(row.active, true),
  }
}

export function mapAdaptation(row: Row): ServiceAdaptation {
  return {
    id: rowId(row),
    innovationId: str(row.innovationId),
    institutionBrief: str(row.institutionBrief),
    steps: strArr(row.steps),
    resources: strArr(row.resources),
    risks: strArr(row.risks),
    summary: str(row.summary),
    createdAt: createdAt(row),
  }
}
