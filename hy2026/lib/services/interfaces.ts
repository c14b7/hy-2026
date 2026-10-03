import type {
  ChallengeArea,
  GrantCall,
  IdeaCard,
  Innovation,
  InnovationFilters,
  KnowledgeArticle,
  MatchResult,
  Message,
  NeedReport,
  Organization,
  OrganizationFilters,
  ServiceAdaptation,
  TestSignup,
  Thread,
  TrendCluster,
  Beneficiary,
  StaffMember,
  PublishStatus,
} from "@/types/domain"

export interface InnovationService {
  list(filters?: InnovationFilters): Promise<Innovation[]>
  getById(id: string): Promise<Innovation | null>
  listByOrg(orgId: string): Promise<Innovation[]>
  updateStatus(id: string, status: PublishStatus): Promise<Innovation | null>
}

export interface OrganizationService {
  list(filters?: OrganizationFilters): Promise<Organization[]>
  getById(id: string): Promise<Organization | null>
}

export interface ChallengeService {
  list(): Promise<ChallengeArea[]>
  getBySlug(slug: string): Promise<ChallengeArea | null>
  getById(id: string): Promise<ChallengeArea | null>
}

export interface NeedService {
  list(): Promise<NeedReport[]>
  create(input: Omit<NeedReport, "id" | "createdAt" | "status">): Promise<NeedReport>
  updateStatus(id: string, status: PublishStatus): Promise<NeedReport | null>
}

export interface IdeaService {
  list(): Promise<IdeaCard[]>
  getById(id: string): Promise<IdeaCard | null>
  create(input: Omit<IdeaCard, "id" | "createdAt" | "status">): Promise<IdeaCard>
  updateStatus(id: string, status: PublishStatus): Promise<IdeaCard | null>
}

export interface KnowledgeService {
  list(): Promise<KnowledgeArticle[]>
  listAll(): Promise<KnowledgeArticle[]>
  getById(id: string): Promise<KnowledgeArticle | null>
  getBySlug(slug: string): Promise<KnowledgeArticle | null>
  create(
    input: Omit<KnowledgeArticle, "id" | "updatedAt" | "readingMinutes"> & {
      readingMinutes?: number
    }
  ): Promise<KnowledgeArticle>
  update(
    id: string,
    patch: Partial<Omit<KnowledgeArticle, "id">>
  ): Promise<KnowledgeArticle | null>
  remove(id: string): Promise<boolean>
}

export interface GrantService {
  list(): Promise<GrantCall[]>
}

export interface CommunicationService {
  listThreads(): Promise<Thread[]>
  getMessages(threadId: string): Promise<Message[]>
  sendMessage(threadId: string, body: string, authorName: string, authorId: string): Promise<Message>
  createThread(input: Omit<Thread, "id" | "updatedAt" | "unreadForAdmin"> & { firstMessage: string }): Promise<Thread>
}

export interface TesterService {
  listSignups(innovationId?: string): Promise<TestSignup[]>
  signup(input: Omit<TestSignup, "id" | "createdAt">): Promise<TestSignup>
}

export interface AiService {
  matchNeed(query: string, options?: { location?: string; challengeId?: string }): Promise<MatchResult>
  suggestKeywords(query: string): Promise<string[]>
  suggestIdeaImprovements(idea: Partial<IdeaCard>): Promise<string[]>
  adaptInnovationToService(innovationId: string, institutionBrief: string): Promise<ServiceAdaptation>
  getTrendClusters(): Promise<TrendCluster[]>
}

export interface OrgCrmService {
  listBeneficiaries(orgId: string): Promise<Beneficiary[]>
  listStaff(orgId: string): Promise<StaffMember[]>
}

export interface Services {
  innovations: InnovationService
  organizations: OrganizationService
  challenges: ChallengeService
  needs: NeedService
  ideas: IdeaService
  knowledge: KnowledgeService
  grants: GrantService
  communication: CommunicationService
  tester: TesterService
  ai: AiService
  orgCrm: OrgCrmService
}
