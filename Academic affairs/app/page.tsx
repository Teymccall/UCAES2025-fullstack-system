"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Database, RefreshCw, Check } from "lucide-react"
import migrateToFirebase from "@/scripts/migrate-to-firebase"

export default function HomePage() {
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [dbInitialized, setDbInitialized] = useState(false)
  
  // Check if database needs initialization
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // We'll check localStorage for a flag indicating DB has been initialized
        const isInitialized = localStorage.getItem("dbInitialized") === "true"
        setDbInitialized(isInitialized)
      } catch (error) {
        console.error("Error checking database status:", error)
      }
    }
    
    checkDatabase()
  }, [])
  
  const handleMigration = async () => {
    setMigrationStatus("running")
    
    try {
      // Call API route to initialize the database
      await fetch("/api/init-db", { method: "POST" })
      // Then migrate any mock data
      await migrateToFirebase()
      
      // Set success status
      setMigrationStatus("success")
      setDbInitialized(true)
      
      // Store initialization status in localStorage
      localStorage.setItem("dbInitialized", "true")
    } catch (error) {
      console.error("Migration error:", error)
      setMigrationStatus("error")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Academic Affairs Portal
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Manage academic programs, student registrations, and staff activities efficiently.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link href="/director/dashboard" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Director Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/staff/dashboard" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Staff Dashboard
                  </Link>
                </div>
                
                {/* Database Migration Card - Only show if not initialized */}
                {!dbInitialized && (
                  <Card className="mt-8 border-dashed border-2 border-gray-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        Database Setup Required
                      </CardTitle>
                      <CardDescription>
                        Initialize the database with real data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        This appears to be your first time using the system. 
                        Click the button below to set up the database with all required data.
                      </p>
                      <Button 
                        onClick={handleMigration}
                        disabled={migrationStatus === "running"}
                        className="w-full"
                      >
                        {migrationStatus === "running" ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Setting up database...
                          </>
                        ) : migrationStatus === "success" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Database Ready!
                          </>
                        ) : (
                          <>
                            <Database className="mr-2 h-4 w-4" />
                            Initialize Database
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Manage programs, courses, and academic sessions with ease.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Track student registrations, academic progress, and results.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Staff Oversight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Supervise staff activities, monitor performance, and manage assignments.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
