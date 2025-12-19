import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Campus Connect - University Event Management Portal",
  description: "Discover, register, and manage campus events with ease",
  generator: "v0.app"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="campus-connect-theme"
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
