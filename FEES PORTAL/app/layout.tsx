import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import ConditionalPortalHeader from "@/components/shared/conditional-portal-header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UCAES Fees Portal",
  description: "University College of Agriculture and Environmental Studies - Fees Portal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalPortalHeader />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
