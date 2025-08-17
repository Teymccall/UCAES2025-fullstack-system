import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import NetworkStatus from '@/components/network-status'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Student Registration - UCAES',
  description: 'University College of Agriculture and Environmental Studies - Student Information System',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <NetworkStatus />
        <Toaster />
      </body>
    </html>
  )
}
