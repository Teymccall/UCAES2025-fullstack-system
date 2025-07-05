"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Database, HardDrive, RefreshCcw, Settings, Trash2, RefreshCw } from "lucide-react"
import { clearAllData, syncModuleData } from "@/lib/firebase-services"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isClearing, setIsClearing] = useState(false)
  const [clearResults, setClearResults] = useState<{
    success: boolean;
    message: string;
    deletedCount: Record<string, number>;
  } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleClearAllData = async () => {
    setIsClearing(true)
    setClearResults(null)
    
    try {
      const result = await clearAllData()
      setClearResults(result)
      setShowResults(true)
      
      if (result.success) {
        toast.success("Database cleared successfully")
      } else {
        toast.error("Failed to clear database")
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      toast.error("An error occurred while clearing the database")
    } finally {
      setIsClearing(false)
    }
  }

  const handleSyncData = async () => {
    setIsSyncing(true)
    
    try {
      const result = await syncModuleData()
      
      if (result.success) {
        toast.success("Data synchronized successfully")
      } else {
        toast.error(`Failed to synchronize data: ${result.message}`)
      }
    } catch (error) {
      console.error("Error syncing data:", error)
      toast.error("An error occurred while synchronizing data")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage system settings and perform maintenance tasks</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Management */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-red-600" />
              Database Management
            </CardTitle>
            <CardDescription>
              Perform database operations including clearing data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Sync Section */}
            <div className="border p-4 rounded-md bg-blue-50 border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-blue-700">Data Synchronization</h3>
                  <p className="text-sm text-gray-700">
                    Synchronize essential data between different modules. This will create default programs, academic years, and semesters.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                  onClick={handleSyncData}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Data
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border p-4 rounded-md bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-red-700">Danger Zone</h3>
                  <p className="text-sm text-gray-700">
                    The following actions are destructive and cannot be undone. Please proceed with caution.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete ALL data from the database, including students,
                        courses, programs, registrations, and more. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Yes, Clear All Data
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {clearResults?.success ? (
                      <Badge className="bg-green-600">Success</Badge>
                    ) : (
                      <Badge className="bg-red-600">Error</Badge>
                    )}
                    Database Clearing Results
                  </DialogTitle>
                  <DialogDescription>
                    {clearResults?.message}
                  </DialogDescription>
                </DialogHeader>
                
                {clearResults && clearResults.success && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Deleted Records</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records Deleted</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(clearResults.deletedCount).map(([collection, count]) => (
                            <tr key={collection}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{collection}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button onClick={() => setShowResults(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 