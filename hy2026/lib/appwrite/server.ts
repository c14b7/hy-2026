import "server-only"

import { Client, Functions, TablesDB } from "node-appwrite"

export function getAppwriteConfig() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? process.env.APPWRITE_ENDPOINT ?? ""
  const projectId =
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? process.env.APPWRITE_PROJECT_ID ?? ""
  const apiKey = process.env.APPWRITE_API_KEY ?? ""
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? "most"

  if (!endpoint || !projectId || !apiKey) {
    throw new Error(
      "Missing Appwrite env: NEXT_PUBLIC_APPWRITE_ENDPOINT / NEXT_PUBLIC_APPWRITE_PROJECT_ID / APPWRITE_API_KEY"
    )
  }

  return { endpoint, projectId, apiKey, databaseId }
}

export function createAdminClient() {
  const { endpoint, projectId, apiKey } = getAppwriteConfig()
  return new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
}

export function getTablesDB() {
  return new TablesDB(createAdminClient())
}

export function getFunctions() {
  return new Functions(createAdminClient())
}

export function getDatabaseId() {
  return getAppwriteConfig().databaseId
}
