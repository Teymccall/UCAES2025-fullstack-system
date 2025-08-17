import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { AuthProvider } from "@/components/auth-provider"
import { SystemConfigProvider } from "@/components/system-config-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "UCAES Student Portal",
  description: "University College of Agriculture and Environmental Studies Student Portal",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <SystemConfigProvider>
            <ClientLayout>{children}</ClientLayout>
          </SystemConfigProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
