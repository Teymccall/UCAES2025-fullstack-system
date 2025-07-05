import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Check, RefreshCw } from "lucide-react"
import { syncRegistrationsWithAdmin } from "@/lib/student-services"

interface SyncRegistrationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSyncComplete: () => void
}

export function SyncRegistrationsDialog({ open, onOpenChange, onSyncComplete }: SyncRegistrationsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    total: number;
    created: number;
    updated: number;
    errors: string[];
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSyncRegistrations = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setResult(null)

      const results = await syncRegistrationsWithAdmin()
      setResult(results)
      
      if (results.success) {
        // Call the completion handler to refresh the main student list
        onSyncComplete();
      }
    } catch (err) {
      console.error("Error syncing registrations:", err)
      setError("An unexpected error occurred while syncing student registrations.")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetDialog = () => {
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sync Student Registrations</DialogTitle>
          <DialogDescription>
            This will synchronize data from the student registration system to the admin database.
            Any new registrations will be added to the admin system, and existing records will be updated.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              The system will automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Import new student registrations to the admin system</li>
              <li>Update existing student records with latest registration data</li>
              <li>Mark registrations as synchronized for tracking</li>
            </ul>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="font-medium">Total Registrations Processed:</span>
              <span>{result.total}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="font-medium text-green-700 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                New Records Created:
              </span>
              <span className="text-green-700 font-medium">{result.created}</span>
            </div>
            <div className="flex items-center justify-between pb-3 mb-3">
              <span className="font-medium text-blue-700 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Records Updated:
              </span>
              <span className="text-blue-700 font-medium">{result.updated}</span>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Errors:</h4>
                <div className="max-h-[150px] overflow-y-auto border rounded-md p-2 bg-gray-50">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 py-1 border-b last:border-0">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {isProcessing ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : result ? (
            <Button onClick={resetDialog}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSyncRegistrations}>
                Sync Registrations
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 