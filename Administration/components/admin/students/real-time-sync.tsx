"use client"

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Check, AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { syncStudentRegistrations } from '@/lib/student-services'
import { useToast } from '@/hooks/use-toast'

export function RealTimeStudentSync({ 
  onSync,
  refreshStudents 
}: { 
  onSync: (result: { created: number; updated: number; errors: string[] }) => void;
  refreshStudents: () => Promise<void>; 
}) {
  const { toast } = useToast()
  const [newRegistrations, setNewRegistrations] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Setup real-time listener for new registrations
  useEffect(() => {
    // Get the current timestamp for comparison
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // Query for registrations created in the last 24 hours
    const registrationsRef = collection(db, 'student-registrations')
    const recentRegistrationsQuery = query(
      registrationsRef,
      where('createdAt', '>', Timestamp.fromDate(oneDayAgo)),
      orderBy('createdAt', 'desc')
    )
    
    // Set up the listener
    const unsubscribe = onSnapshot(
      recentRegistrationsQuery,
      (snapshot) => {
        setNewRegistrations(snapshot.size)
      },
      (error) => {
        console.error("Error in real-time registration listener:", error)
        toast({
          title: "Connection Error",
          description: "Could not establish real-time connection to student registrations",
          variant: "destructive"
        })
      }
    )
    
    // Cleanup listener when component unmounts
    return () => unsubscribe()
  }, [toast])

  // Function to manually sync registrations
  const handleSync = async () => {
    try {
      setIsSyncing(true)
      setSyncError(null)
      
      // Call the sync function
      const result = await syncStudentRegistrations()
      
      if (result.success) {
        setLastSync(new Date())
        setNewRegistrations(0)
        
        // Show success message
        toast({
          title: "Sync Complete",
          description: `Created ${result.created} and updated ${result.updated} student records`,
          variant: "default"
        })
        
        // Pass result to parent component
        onSync({
          created: result.created,
          updated: result.updated,
          errors: result.errors
        })
        
        // Refresh the student list
        await refreshStudents()
      } else {
        setSyncError("Sync failed. See console for details.")
        toast({
          title: "Sync Failed",
          description: result.errors.length > 0 ? result.errors[0] : "Unknown error occurred",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error during sync:", error)
      setSyncError("Error occurred during sync")
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className={newRegistrations > 0 ? "border-green-600 text-green-600" : ""}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className={`h-4 w-4 mr-2 ${newRegistrations > 0 ? "text-green-600" : ""}`} />
            )}
            Sync Registrations
            {newRegistrations > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {newRegistrations} new
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {newRegistrations > 0 
            ? `Sync ${newRegistrations} new student registrations to the admin system` 
            : "Check for new student registrations"}
        </TooltipContent>
      </Tooltip>

      {lastSync && !syncError && (
        <div className="flex items-center text-xs text-gray-500">
          <Check className="h-3 w-3 text-green-600 mr-1" />
          Last synced: {lastSync.toLocaleTimeString()}
        </div>
      )}

      {syncError && (
        <div className="flex items-center text-xs text-red-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {syncError}
        </div>
      )}
    </div>
  )
} 