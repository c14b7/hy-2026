"use client"

import { getDataSourceLabel } from "@/lib/services"

/** Compact demo indicator: Appwrite Cloud vs in-memory mock. */
export function DataSourceBadge() {
  const mode = getDataSourceLabel()
  return (
    <span
      className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground tabular-nums"
      title={
        mode === "appwrite"
          ? "Dane z Appwrite TablesDB (demo)"
          : "Dane w pamięci (mock) — ustaw MOST_DATA_SOURCE=appwrite"
      }
    >
      {mode === "appwrite" ? "Appwrite" : "mock"}
    </span>
  )
}
