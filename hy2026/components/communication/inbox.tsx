"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { Surface } from "@/components/shared/surface"
import { useRole } from "@/components/shared/role-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getServices } from "@/lib/services"
import type { Message, Thread } from "@/types/domain"
import { cn } from "cn"

export function CommunicationInbox() {
  const { user, role } = useRole()
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [subject, setSubject] = useState("")
  const [firstMessage, setFirstMessage] = useState("")
  const related = searchParams.get("related")
  const relatedId = searchParams.get("id")

  async function refresh() {
    const list = await getServices().communication.listThreads()
    setThreads(list)
    if (!activeId && list[0]) setActiveId(list[0].id)
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!activeId) return
    getServices().communication.getMessages(activeId).then(setMessages)
  }, [activeId])

  useEffect(() => {
    if (!related || !relatedId) return
    let cancelled = false
    ;(async () => {
      if (related === "innovation") {
        const inn = await getServices().innovations.getById(relatedId)
        if (cancelled) return
        setSubject(inn ? `Pytanie o innowację: ${inn.title}` : "Pytanie o innowację")
      } else if (related === "organization") {
        const org = await getServices().organizations.getById(relatedId)
        if (cancelled) return
        setSubject(org ? `Kontakt: ${org.name}` : "Kontakt z organizacją")
      } else {
        setSubject("Kontakt Hub MOST")
      }
      setFirstMessage(
        "Dzień dobry, chciałbym/chciałabym dowiedzieć się więcej o tej innowacji / ofercie…"
      )
    })()
    return () => {
      cancelled = true
    }
  }, [related, relatedId])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!activeId || !body.trim()) return
    await getServices().communication.sendMessage(
      activeId,
      body,
      user?.displayName ?? "Gość",
      user?.id ?? "guest"
    )
    setBody("")
    setMessages(await getServices().communication.getMessages(activeId))
    await refresh()
  }

  async function createThread(e: React.FormEvent) {
    e.preventDefault()
    if (!subject || !firstMessage) return
    const thread = await getServices().communication.createThread({
      subject,
      participantIds: [user?.id ?? "guest", "u-tomek"],
      participantNames: [user?.displayName ?? "Gość", "Tomasz Kalina"],
      relatedType: (related as Thread["relatedType"]) ?? undefined,
      relatedId: relatedId ?? undefined,
      status: "open",
      firstMessage,
    })
    setActiveId(thread.id)
    setSubject("")
    setFirstMessage("")
    await refresh()
  }

  const active = threads.find((t) => t.id === activeId)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Kontakt"
        title="Komunikacja"
        description="Pisz do Hubu i mentorów o innowacjach, wdrożeniach i wsparciu lokalnym."
      />

      <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
        <Surface as="aside" className="h-fit space-y-3 lg:sticky lg:top-6">
          <h2 className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Wątki
          </h2>
          <ul className="space-y-1">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    activeId === t.id
                      ? "bg-primary/10 font-semibold text-foreground"
                      : "hover:bg-muted/80"
                  )}
                >
                  <span className="line-clamp-2">{t.subject}</span>
                  {role === "admin" && t.unreadForAdmin ? (
                    <span className="mt-1 block text-[0.7rem] font-bold text-primary">Nowe</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </Surface>

        <div className="space-y-5">
          <Surface className="space-y-4">
            <h2 className="font-heading text-base font-bold">Nowy wątek</h2>
            <form onSubmit={createThread} className="space-y-3">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Temat"
                aria-label="Temat wątku"
              />
              <Textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Wiadomość"
                aria-label="Treść wiadomości"
                className="min-h-24"
              />
              <Button type="submit">Wyślij do Hubu</Button>
            </form>
          </Surface>

          {activeId && active ? (
            <Surface className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold tracking-tight">{active.subject}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {active.participantNames.join(" · ")}
                </p>
              </div>
              <ul className="space-y-3" aria-live="polite">
                {messages.map((m) => {
                  const mine = m.authorId === (user?.id ?? "guest")
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                        mine ? "ml-auto bg-primary/12" : "bg-muted/70"
                      )}
                    >
                      <div className="text-xs font-semibold text-foreground/80">{m.authorName}</div>
                      <p className="mt-1 leading-relaxed">{m.body}</p>
                      <time className="mt-2 block text-[0.7rem] text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString("pl-PL")}
                      </time>
                    </li>
                  )
                })}
              </ul>
              <form onSubmit={sendReply} className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Napisz odpowiedź…"
                  aria-label="Odpowiedź"
                  className="flex-1"
                />
                <Button type="submit">Wyślij</Button>
              </form>
            </Surface>
          ) : null}
        </div>
      </div>
    </div>
  )
}
