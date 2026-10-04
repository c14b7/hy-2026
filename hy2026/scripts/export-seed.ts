/**
 * Dump data/mocks/seed.ts → data/mocks/appwrite-seed.json for Python bootstrap.
 * Usage: npx tsx scripts/export-seed.ts
 */
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

import {
  beneficiaries,
  challenges,
  grantCalls,
  ideas,
  innovations,
  knowledge,
  messages,
  needs,
  organizations,
  staff,
  testSignups,
  threads,
  users,
} from "../data/mocks/seed"

const out = {
  profiles: users.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    orgId: u.orgId ?? "",
    primaryLabel: u.roles.find((r) => r !== "guest") ?? "seeker",
  })),
  organizations: organizations.map((o) => ({
    id: o.id,
    name: o.name,
    type: o.type,
    location: o.location,
    county: o.county,
    description: o.description,
    tags: o.tags,
    contactEmail: o.contactEmail,
    website: o.website ?? "",
    logoInitials: o.logoInitials,
    teamId: `team-${o.id}`,
    logoFileId: "",
  })),
  challenges: challenges.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    metricsJson: JSON.stringify(c.metrics),
    relatedTags: c.relatedTags,
  })),
  innovations: innovations.map((i) => {
    const url = i.media?.url ?? ""
    const validUrl = /^https?:\/\//i.test(url)
    return {
      id: i.id,
      title: i.title,
      summary: i.summary,
      description: i.description,
      stage: i.stage,
      orgId: i.orgId,
      challengeIds: i.challengeIds,
      tags: i.tags,
      location: i.location,
      county: i.county,
      mediaType: validUrl ? (i.media?.type ?? "") : "",
      mediaUrl: validUrl ? url : "",
      mediaLabel: validUrl ? (i.media?.label ?? "") : "",
      mediaFileId: "",
      testRecruiting: i.testRecruiting,
      status: i.status,
      beneficiaries: i.beneficiaries,
    }
  }),
  needs: needs.map((n) => ({
    id: n.id,
    body: n.body,
    location: n.location ?? "",
    county: n.county ?? "",
    challengeIds: n.challengeIds,
    tags: n.tags,
    authorRole: n.authorRole,
    authorName: n.authorName,
    authorId: "",
    status: n.status,
  })),
  ideas: ideas.map((i) => ({
    id: i.id,
    title: i.title,
    essence: i.essence,
    audience: i.audience,
    stage: i.stage,
    description: i.description,
    authorId: i.authorId,
    authorName: i.authorName,
    challengeIds: i.challengeIds,
    tags: i.tags,
    status: i.status,
  })),
  grant_calls: grantCalls.map((g) => ({
    id: g.id,
    title: g.title,
    summary: g.summary,
    opensAt: g.opensAt.includes("T") ? g.opensAt : `${g.opensAt}T00:00:00.000+00:00`,
    closesAt: g.closesAt.includes("T") ? g.closesAt : `${g.closesAt}T23:59:59.000+00:00`,
    active: g.active,
  })),
  knowledge: knowledge.map((k) => ({
    id: k.id,
    slug: k.slug,
    title: k.title,
    kind: k.kind,
    summary: k.summary,
    body: k.body,
    challengeIds: k.challengeIds,
    tags: k.tags,
    readingMinutes: k.readingMinutes,
    status: k.status,
    attachmentFileIds: [] as string[],
  })),
  test_signups: testSignups.map((t) => ({
    id: t.id,
    innovationId: t.innovationId,
    userId: t.userId,
    userName: t.userName,
    rating: t.rating ?? 0,
    feedback: t.feedback ?? "",
    improvement: t.improvement ?? "",
  })),
  threads: threads.map((t) => ({
    id: t.id,
    subject: t.subject,
    participantIds: t.participantIds,
    participantNames: t.participantNames,
    relatedType: t.relatedType ?? "",
    relatedId: t.relatedId ?? "",
    status: t.status,
    unreadForAdmin: t.unreadForAdmin,
  })),
  messages: messages.map((m) => ({
    id: m.id,
    threadId: m.threadId,
    authorId: m.authorId,
    authorName: m.authorName,
    body: m.body,
  })),
  beneficiaries: beneficiaries.map((b) => ({
    id: b.id,
    orgId: b.orgId,
    displayName: b.displayName,
    status: b.status,
    notes: b.notes,
  })),
  staff_members: staff.map((s) => ({
    id: s.id,
    orgId: s.orgId,
    displayName: s.displayName,
    role: s.role,
    email: s.email,
    active: s.active,
    userId: "",
  })),
}

const path = resolve("data/mocks/appwrite-seed.json")
writeFileSync(path, JSON.stringify(out, null, 2), "utf8")
console.log(`Wrote ${path}`)
for (const [k, v] of Object.entries(out)) {
  console.log(`  ${k}: ${(v as unknown[]).length}`)
}
