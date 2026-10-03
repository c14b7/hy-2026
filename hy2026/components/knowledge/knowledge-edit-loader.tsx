"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { KnowledgeEditor } from "@/components/knowledge/knowledge-editor"
import { Skeleton } from "@/components/ui/skeleton"
import { getServices } from "@/lib/services"
import type { KnowledgeArticle } from "@/types/domain"

export function KnowledgeEditLoader() {
  const params = useParams<{ id: string }>()
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices()
      .knowledge.getById(params.id)
      .then((a) => {
        setArticle(a)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <Skeleton className="h-64 w-full" />
  if (!article) return <p>Nie znaleziono wpisu do edycji.</p>
  return <KnowledgeEditor mode="edit" article={article} />
}
