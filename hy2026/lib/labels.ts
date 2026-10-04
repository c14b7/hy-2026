import type {
  IdeaStage,
  InnovationStage,
  KnowledgeKind,
  OrganizationType,
  PublishStatus,
  ThreadStatus,
  UserRole,
} from "@/types/domain"

export const STAGE_LABELS: Record<InnovationStage, string> = {
  idea: "Pomysł",
  prototype: "Prototyp",
  pilot: "Pilot",
  scaled: "Skalowana",
  archived: "Archiwum",
}

export const IDEA_STAGE_LABELS: Record<IdeaStage, string> = {
  concept: "Koncepcja",
  prototype: "Prototyp",
  testing: "Test",
  ready: "Gotowa",
}

export const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Szkic",
  pending: "Do moderacji",
  published: "Opublikowana",
  rejected: "Odrzucona",
}

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  ngo: "NGO",
  jst: "JST / CUS",
  rops: "ROPS",
  other: "Partner",
}

export const KNOWLEDGE_KIND_LABELS: Record<KnowledgeKind, string> = {
  edu: "Poradnik",
  report: "Raport",
  canvas: "Kanwa",
  video: "Materiał wideo",
}

export const THREAD_STATUS_LABELS: Record<ThreadStatus, string> = {
  open: "Otwarty",
  waiting: "Oczekuje",
  resolved: "Zamknięty",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Gość",
  seeker: "Mieszkaniec",
  org: "Organizacja",
  jst: "JST",
  expert: "Ekspert",
  admin: "Admin ROPS",
}
