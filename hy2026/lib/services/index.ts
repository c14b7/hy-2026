import { callServiceAction } from "@/lib/services/actions"
import type { Services } from "@/lib/services/interfaces"
import { mockServices } from "@/lib/services/mock"

export type { Services } from "@/lib/services/interfaces"
export { mockServices } from "@/lib/services/mock"

function isAppwriteMode() {
  if (typeof window === "undefined") {
    return (
      (process.env.MOST_DATA_SOURCE ?? process.env.NEXT_PUBLIC_MOST_DATA_SOURCE) === "appwrite"
    )
  }
  return process.env.NEXT_PUBLIC_MOST_DATA_SOURCE === "appwrite"
}

/** Proxy every domain method to a Server Action (API key never reaches the browser). */
function createActionProxy(): Services {
  const handler = <D extends keyof Services>(domain: D): Services[D] =>
    new Proxy({} as Services[D], {
      get(_target, method: string | symbol) {
        if (typeof method !== "string") return undefined
        return (...args: unknown[]) => callServiceAction(domain, method, args)
      },
    })

  return {
    innovations: handler("innovations"),
    organizations: handler("organizations"),
    challenges: handler("challenges"),
    needs: handler("needs"),
    ideas: handler("ideas"),
    knowledge: handler("knowledge"),
    grants: handler("grants"),
    communication: handler("communication"),
    tester: handler("tester"),
    ai: handler("ai"),
    orgCrm: handler("orgCrm"),
  }
}

/**
 * Unified service access.
 * - mock: in-memory seed (offline / default)
 * - appwrite: TablesDB via Server Actions (admin API key stays on server)
 */
export function getServices(): Services {
  if (!isAppwriteMode()) {
    return mockServices
  }
  return createActionProxy()
}

export function getDataSourceLabel(): "appwrite" | "mock" {
  return isAppwriteMode() ? "appwrite" : "mock"
}
