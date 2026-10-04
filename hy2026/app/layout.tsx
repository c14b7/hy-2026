import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { RoleProvider } from "@/components/shared/role-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "MOST — Małopolski Hub Innowacji Społecznych",
    template: "%s · MOST",
  },
  description:
    "MOST łączy potrzeby mieszkańców z innowacjami społecznymi, organizacjami i wiedzą Hubu.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className={cn("font-sans antialiased", fontMono.variable)}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <RoleProvider>{children}</RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
