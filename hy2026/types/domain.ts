export type UserRole = "guest" | "seeker" | "org" | "jst" | "expert" | "admin"

export type OrganizationType = "ngo" | "jst" | "rops" | "other"

export type PublishStatus = "draft" | "pending" | "published" | "rejected"

export type InnovationStage =
  | "idea"
  | "prototype"
  | "pilot"
  | "scaled"
  | "archived"

export type IdeaStage = "concept" | "prototype" | "testing" | "ready"

export type KnowledgeKind = "edu" | "report" | "canvas" | "video"

export type ThreadStatus = "open" | "waiting" | "resolved"

export interface User {
  id: string
  displayName: string
  email: string
  roles: UserRole[]
  orgId?: string
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  location: string
  county: string
  description: string
  tags: string[]
  contactEmail: string
  website?: string
  logoInitials: string
}

export interface ChallengeArea {
  id: string
  slug: string
  title: string
  summary: string
  metrics: { label: string; value: string }[]
  relatedTags: string[]
}

export interface Innovation {
  id: string
  title: string
  summary: string
  description: string
  stage: InnovationStage
  orgId: string
  challengeIds: string[]
  tags: string[]
  location: string
  county: string
  media?: { type: "image" | "video"; url: string; label: string }
  testRecruiting: boolean
  status: PublishStatus
  beneficiaries: string
  createdAt: string
}

export interface NeedReport {
  id: string
  body: string
  location?: string
  county?: string
  challengeIds: string[]
  tags: string[]
  authorRole: UserRole
  authorName: string
  status: PublishStatus
  createdAt: string
}

export interface IdeaCard {
  id: string
  title: string
  essence: string
  audience: string
  stage: IdeaStage
  description: string
  authorId: string
  authorName: string
  challengeIds: string[]
  tags: string[]
  status: PublishStatus
  createdAt: string
}

export interface GrantCall {
  id: string
  title: string
  summary: string
  opensAt: string
  closesAt: string
  active: boolean
}

export interface KnowledgeArticle {
  id: string
  slug: string
  title: string
  kind: KnowledgeKind
  summary: string
  body: string
  challengeIds: string[]
  tags: string[]
  readingMinutes: number
  status: PublishStatus
  updatedAt: string
}

export interface TestSignup {
  id: string
  innovationId: string
  userId: string
  userName: string
  rating?: number
  feedback?: string
  improvement?: string
  createdAt: string
}

export interface Thread {
  id: string
  subject: string
  participantIds: string[]
  participantNames: string[]
  relatedType?: "innovation" | "need" | "idea" | "organization"
  relatedId?: string
  status: ThreadStatus
  updatedAt: string
  unreadForAdmin: boolean
}

export interface Message {
  id: string
  threadId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface MatchItem {
  targetType: "innovation" | "organization" | "need"
  targetId: string
  score: number
  rationale: string
}

export interface MatchResult {
  id: string
  query: string
  keywords: string[]
  items: MatchItem[]
  createdAt: string
}

export interface ServiceAdaptation {
  id: string
  innovationId: string
  institutionBrief: string
  steps: string[]
  resources: string[]
  risks: string[]
  summary: string
  createdAt: string
}

export interface Beneficiary {
  id: string
  orgId: string
  displayName: string
  status: "active" | "paused" | "closed"
  notes: string
  updatedAt: string
}

export interface StaffMember {
  id: string
  orgId: string
  displayName: string
  role: "employee" | "volunteer" | "coordinator"
  email: string
  active: boolean
}

export interface TrendCluster {
  challengeId: string
  challengeTitle: string
  count: number
  topTags: string[]
  sampleNeeds: string[]
}

export interface InnovationFilters {
  q?: string
  challengeId?: string
  county?: string
  tag?: string
  stage?: InnovationStage
  testRecruiting?: boolean
  /** When true, include draft/pending (panel / admin). */
  includeUnpublished?: boolean
}

export interface OrganizationFilters {
  q?: string
  type?: OrganizationType
  county?: string
  tag?: string
}
