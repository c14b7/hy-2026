"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getServices } from "@/lib/services"
import type { Message, Thread } from "@/types/domain"

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
    getServices()
      .communication.getMessages(activeId)
      .then(setMessages)
  }, [activeId])

  useEffect(() => {
    if (related && relatedId) {
      setSubject(
        related === "innovation"
          ? `Pytanie o innowację ${relatedId}`
          : `Kontakt: ${related} ${relatedId}`
      )
      setFirstMessage("Dzień dobry, chciałbym/chciałabym dowiedzieć się więcej…")
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
    const msgs = await getServices().communication.getMessages(activeId)
    setMessages(msgs)
    await refresh()
  }

  async function createThread(e: React.FormEvent) {
    e.preventDefault()
    if (!subject || !firstMessage) return
    const thread = await getServices().communication.createThread({
      subject,
      participantIds: [user?.id ?? "guest", "u-tomek"],
      participantNames: [user?.displayName ?? "Gość", "Tomek ROPS"],
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

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-2">
        <h2 className="font-medium">Wątki</h2>
        <ul className="space-y-1">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                  activeId === t.id ? "bg-muted font-medium" : "hover:bg-muted/60"
                }`}
              >
                {t.subject}
                {role === "admin" && t.unreadForAdmin ? (
                  <span className="ml-2 text-xs text-primary">nowe</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="space-y-6">
        <section className="rounded-[min(var(--radius-4xl),24px)] border border-border p-4">
          <h2 className="mb-3 font-medium">Nowy wątek</h2>
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
            />
            <Button type="submit">Wyślij do Hubu / mentora</Button>
          </form>
        </section>

        {activeId ? (
          <section className="space-y-4">
            <h2 className="font-medium">
              {threads.find((t) => t.id === activeId)?.subject ?? "Rozmowa"}
            </h2>
            <ul className="space-y-3" aria-live="polite">
              {messages.map((m) => (
                <li key={m.id} className="rounded-2xl bg-muted/50 px-4 py-3 text-sm">
                  <div className="font-medium">{m.authorName}</div>
                  <p>{m.body}</p>
                  <time className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString("pl-PL")}
                  </time>
                </li>
              ))}
            </ul>
            <form onSubmit={sendReply} className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Odpowiedź…"
                aria-label="Odpowiedź"
                className="flex-1"
              />
              <Button type="submit">Wyślij</Button>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  )
}
