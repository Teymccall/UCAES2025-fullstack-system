"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, AlertCircle, FileText, Download, Check, X } from "lucide-react"
import { uploadStudentCredentials, generateStudentCSVTemplate } from "@/lib/student-services"
import type { BulkUploadResult } from "@/lib/types"

interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportCSVDialog({ open, onOpenChange, onSuccess }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError(null)
      setUploadResult(null)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = generateStudentCSVTemplate()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'student_upload_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpload = async () => {
    if (!file) return
    
    try {
      setIsUploading(true)
      setError(null)
      setUploadResult(null)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 200)
      
      const result = await uploadStudentCredentials(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadResult(result)
      
      if (result.successful > 0) {
        // Wait a bit before closing the dialog
        setTimeout(() => {
          if (result.failed === 0) {
            onOpenChange(false)
            onSuccess()
          }
        }, 3000)
      }
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isUploading) {
        resetForm()
        onOpenChange(newOpen)
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing student information to bulk import or update student records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!isUploading && !uploadResult && (
            <div className="flex flex-col gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="csv-file" className="text-sm font-medium">
                  CSV File
                </label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a CSV file with student data. Make sure it follows the required format.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto flex items-center gap-2"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{file?.name}</span>
              </div>
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Processing student data... {uploadProgress}%
                </p>
              </div>
            </div>
          )}
          
          {uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {uploadResult.failed === 0 ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-medium">Upload Result</span>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Processed:</div>
                  <div className="font-medium">{uploadResult.totalProcessed}</div>
                  
                  <div>Successfully Added/Updated:</div>
                  <div className="font-medium text-green-600">{uploadResult.successful}</div>
                  
                  <div>Failed:</div>
                  <div className="font-medium text-red-600">{uploadResult.failed}</div>
                </div>
                
                {uploadResult.failed > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Errors:</h4>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-600 py-1 border-b last:border-0">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          {!uploadResult ? (
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="bg-green-700 hover:bg-green-800"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          ) : (
            <Button 
              onClick={() => {
                onOpenChange(false)
                onSuccess()
              }} 
              className="bg-green-700 hover:bg-green-800"
            >
              <Check className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 