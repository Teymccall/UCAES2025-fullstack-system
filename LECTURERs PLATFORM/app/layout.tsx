import type { Metadata } from 'next'
import './globals.css'
import ClientWrapper from "@/components/ClientWrapper"

export const metadata: Metadata = {
  title: 'UCAES Lecturer Portal',
  description: 'University College of Agriculture and Environmental Studies Lecturer Portal',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
