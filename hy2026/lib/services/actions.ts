"use server"

import { createAppwriteServices } from "@/lib/services/appwrite"
import { mockServices } from "@/lib/services/mock"
import type { Services } from "@/lib/services/interfaces"

function serverServices(): Services {
  const mode = process.env.MOST_DATA_SOURCE ?? process.env.NEXT_PUBLIC_MOST_DATA_SOURCE
  if (mode === "appwrite") {
    return createAppwriteServices()
  }
  return mockServices
}

/** Generic typed bridge for client components — keeps API key on the server. */
export async function callServiceAction(
  domain: keyof Services,
  method: string,
  args: unknown[] = []
): Promise<unknown> {
  const services = serverServices()
  const svc = services[domain] as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>
  const fn = svc[method]
  if (typeof fn !== "function") {
    throw new Error(`Unknown service method: ${domain}.${method}`)
  }
  return fn(...args)
}

export async function getDataSourceMode(): Promise<"appwrite" | "mock"> {
  const mode = process.env.MOST_DATA_SOURCE ?? process.env.NEXT_PUBLIC_MOST_DATA_SOURCE
  return mode === "appwrite" ? "appwrite" : "mock"
}
