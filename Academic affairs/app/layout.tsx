'use client';

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-context"
import { CourseProvider } from "@/components/course-context"
import { AcademicProvider } from "@/components/academic-context"
import { StudentProvider } from "@/components/student-context"
import { FirebaseProvider } from "@/components/firebase-context"
import { SpinnerContainer } from "@/components/ui/spinner"
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ["latin"] })

// Use dynamic import to load MongoDB provider on client side only
// This prevents server-only modules from being included in client bundles
const DynamicMongoDBProvider = dynamic(
  () => import('@/components/mongodb-context').then((mod) => mod.MongoDBProvider),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <SpinnerContainer>
          Loading database connection...
        </SpinnerContainer>
      </div>
    )
  }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Academic Affairs Portal</title>
        <meta name="description" content="University Academic Affairs Management System" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <DynamicMongoDBProvider>
            <FirebaseProvider>
              <AuthProvider>
                <CourseProvider>
                  <AcademicProvider>
                    <StudentProvider>{children}</StudentProvider>
                  </AcademicProvider>
                </CourseProvider>
              </AuthProvider>
            </FirebaseProvider>
          </DynamicMongoDBProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
