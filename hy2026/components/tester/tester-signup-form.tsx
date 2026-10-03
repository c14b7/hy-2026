"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useRole } from "@/components/shared/role-provider"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { getServices } from "@/lib/services"
import type { Innovation, TestSignup } from "@/types/domain"

export function TesterSignupForm() {
  const params = useParams<{ id: string }>()
  const { user } = useRole()
  const [inn, setInn] = useState<Innovation | null>(null)
  const [signups, setSignups] = useState<TestSignup[]>([])
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState("")
  const [improvement, setImprovement] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const id = params.id
    getServices()
      .innovations.getById(id)
      .then(setInn)
    getServices()
      .tester.listSignups(id)
      .then(setSignups)
  }, [params.id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await getServices().tester.signup({
      innovationId: params.id,
      userId: user?.id ?? "guest",
      userName: user?.displayName ?? "Gość demo",
      rating,
      feedback,
      improvement,
    })
    setDone(true)
    const next = await getServices().tester.listSignups(params.id)
    setSignups(next)
  }

  if (!inn) return <p className="text-muted-foreground">Ładowanie…</p>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium">Test: {inn.title}</h1>
        <p className="text-muted-foreground">{inn.summary}</p>
      </div>

      {done ? (
        <p role="status" className="rounded-2xl bg-primary/10 px-4 py-3 text-sm">
          Dziękujemy! Twoja opinia trafiła do listy testerów (demo).
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="rating">Ocena (1–5)</FieldLabel>
            <input
              id="rating"
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm">{rating} / 5</p>
          </Field>
          <Field>
            <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="improvement">Propozycja usprawnienia</FieldLabel>
            <Textarea
              id="improvement"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
            />
          </Field>
          <Button type="submit">Wyślij zgłoszenie</Button>
        </form>
      )}

      <section>
        <h2 className="mb-2 font-medium">Opinie testerów (demo)</h2>
        <ul className="space-y-2 text-sm">
          {signups.map((s) => (
            <li key={s.id} className="rounded-xl border border-border p-3">
              <strong>{s.userName}</strong>
              {s.rating ? ` · ${s.rating}/5` : null}
              <p className="text-muted-foreground">{s.feedback}</p>
              {s.improvement ? <p>Usprawnienie: {s.improvement}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
