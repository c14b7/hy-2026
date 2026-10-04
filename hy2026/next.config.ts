import type { NextConfig } from "next"
import os from "node:os"

/**
 * Next.js 16 blocks cross-origin requests to /_next/* in development.
 * Access via Tailscale / LAN IP loads the document (tab title) but not JS bundles
 * unless those hostnames are listed here.
 *
 * Optional override: DEV_ALLOWED_ORIGINS=my-machine.tailnet-name.ts.net,10.0.0.5
 */
function localDevOrigins(): string[] {
  const fromEnv = (process.env.DEV_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        if (entry.includes("://")) return new URL(entry).hostname
      } catch {
        /* keep raw */
      }
      return entry.replace(/:\d+$/, "")
    })

  const fromNics: string[] = []
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.internal) continue
      const family = net.family
      if (family === "IPv4" || family === 4) {
        fromNics.push(net.address)
      }
    }
  }

  const host = os.hostname().toLowerCase()
  const hostShort = host.split(".")[0] ?? host

  return [
    ...new Set([
      // Tailscale MagicDNS (multi-label: name.tailnet.ts.net)
      "**.ts.net",
      "*.ts.net",
      host,
      hostShort,
      ...fromNics,
      ...fromEnv,
    ]),
  ]
}

const nextConfig: NextConfig = {
  allowedDevOrigins: localDevOrigins(),
}

export default nextConfig
