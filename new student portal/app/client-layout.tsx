"use client"

import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { AppSidebar } from "@/components/app-sidebar"
import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider } from "@/components/ui/sidebar"

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Avoid hydration errors by initializing with null/false values
  const [isClient, setIsClient] = useState(false)
  const { student, isAuthenticated, refreshUserData } = useAuth()
  const { toast } = useToast()

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleRefresh = async () => {
    if (isAuthenticated) {
      toast({
        title: "Refreshing data...",
        description: "Getting your latest information from the database.",
      })
      
      try {
        await refreshUserData();
        
        toast({
          title: "Data refreshed",
          description: "Your information has been updated from the database.",
        })
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast({
          title: "Error refreshing data",
          description: "Please try again or reload the page.",
          variant: "destructive"
        })
      }
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1">
          {/* Only render client-specific components when on client */}
          {isClient && isAuthenticated && (
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="text-xs">Refresh Data</span>
              </Button>
            </div>
          )}
          
          <main className="p-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
