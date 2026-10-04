"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { AiBadge } from "@/components/ai/ai-badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getServices } from "@/lib/services"
import type { Innovation, ServiceAdaptation } from "@/types/domain"

export function MiddlemanForm() {
  const searchParams = useSearchParams()
  const [innovations, setInnovations] = useState<Innovation[]>([])
  const [innovationId, setInnovationId] = useState(searchParams.get("innovationId") ?? "")
  const [brief, setBrief] = useState("")
  const [result, setResult] = useState<ServiceAdaptation | null>(null)
  const [editedSummary, setEditedSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getServices()
      .innovations.list()
      .then((list) => {
        setInnovations(list)
        if (!innovationId && list[0]) setInnovationId(list[0].id)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    if (!innovationId || brief.trim().length < 20) return
    setLoading(true)
    setSaved(false)
    const adaptation = await getServices().ai.adaptInnovationToService(innovationId, brief)
    setResult(adaptation)
    setEditedSummary(adaptation.summary)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-3xl font-medium">Middleman Innowacji</h1>
          <AiBadge>Asystent AI</AiBadge>
        </div>
        <p className="text-muted-foreground">
          Dostosuj innowację do formy usługi publicznej według potrzeb Twojej instytucji. To
          sugestia — możesz ją edytować przed zapisem.
        </p>
      </div>

      <form onSubmit={generate} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="inn">Innowacja</FieldLabel>
          <Select
            id="inn"
            value={innovationId}
            onChange={(e) => setInnovationId(e.target.value)}
          >
            {innovations.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="brief">Brief instytucji</FieldLabel>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Opisz zasoby, ograniczenia, grupę odbiorców i cel wdrożenia…"
            className="min-h-32"
            required
          />
          <FieldDescription>
            Nie podawaj danych osobowych mieszkańców — używaj opisu syntetycznego.
          </FieldDescription>
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Generuję plan…" : "Wygeneruj plan wdrożenia"}
        </Button>
      </form>

      {result ? (
        <section className="space-y-4 rounded-[min(var(--radius-4xl),24px)] border border-border bg-card p-6" aria-live="polite">
          <AiBadge>Wynik AI — do edycji</AiBadge>
          <Field>
            <FieldLabel htmlFor="summary">Podsumowanie</FieldLabel>
            <Textarea
              id="summary"
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
            />
          </Field>
          <div>
            <h2 className="font-medium">Kroki</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {result.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-medium">Zasoby</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {result.resources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-medium">Ryzyka</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {result.risks.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!result) return
              const payload = { ...result, summary: editedSummary }
              sessionStorage.setItem("most-middleman-draft", JSON.stringify(payload))
              setSaved(true)
            }}
            variant="outline"
          >
            Zapisz w przeglądarce
          </Button>
          {saved ? (
            <p role="status" className="text-sm text-primary">
              Plan zapisany w sesji przeglądarki (sessionStorage).
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
