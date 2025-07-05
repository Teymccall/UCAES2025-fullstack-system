import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Check, X } from "lucide-react"
import { createMissingStudentAccounts, ensureTestStudent } from "@/lib/auth-utils"

interface CreateAccountsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAccountsDialog({ open, onOpenChange }: CreateAccountsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    total: number
    created: number
    failed: number
    errors: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPreparingDemo, setIsPreparingDemo] = useState(false)

  const handleCreateAccounts = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setResult(null)

      const results = await createMissingStudentAccounts()
      setResult(results)
    } catch (err) {
      console.error("Error creating accounts:", err)
      setError("An unexpected error occurred while creating student accounts.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrepareDemo = async () => {
    try {
      setIsPreparingDemo(true)
      setError(null)
      
      const success = await ensureTestStudent()
      
      if (success) {
        setError("Demo student has been added or prepared for testing. Click 'Create Accounts' to continue.")
      } else {
        setError("Failed to prepare demo student. Check console for details.")
      }
    } catch (err) {
      console.error("Error preparing demo:", err)
      setError("An unexpected error occurred while preparing demo data.")
    } finally {
      setIsPreparingDemo(false)
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
          <DialogTitle>Create Student Portal Accounts</DialogTitle>
          <DialogDescription>
            This will create portal accounts for all students who don't have one yet.
            Students will be able to log in using their Student ID and Date of Birth.
            <br /><br />
            <strong>Note:</strong> New students added to the system now automatically get portal accounts,
            so you only need this for existing students who don't have accounts yet.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant={error.includes("Demo student") ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.includes("Demo student") ? "Info" : "Error"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              The system will automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Create Firebase Authentication accounts for new students</li>
              <li>Use Student ID and Date of Birth for initial login credentials</li>
              <li>Link each account to the corresponding student record</li>
              <li>Skip students who already have accounts</li>
            </ul>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="font-medium">Total Students Processed:</span>
              <span>{result.total}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="font-medium text-green-700 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Accounts Created:
              </span>
              <span className="text-green-700 font-medium">{result.created}</span>
            </div>
            <div className="flex items-center justify-between pb-3 mb-3">
              <span className="font-medium text-red-700 flex items-center">
                <X className="h-4 w-4 mr-2" />
                Failed:
              </span>
              <span className="text-red-700 font-medium">{result.failed}</span>
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
          {isProcessing || isPreparingDemo ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessing ? "Processing..." : "Preparing Demo..."}
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
              <Button variant="secondary" onClick={handlePrepareDemo} className="mr-2">
                Prepare Demo
              </Button>
              <Button onClick={handleCreateAccounts}>
                Create Accounts
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 