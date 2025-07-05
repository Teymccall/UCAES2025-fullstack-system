"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileUp, AlertCircle, CheckCircle2, Download, Plus, User } from "lucide-react"
import { uploadStudentsFromCSV, generateStudentCSVTemplate, addStudent } from "@/lib/student-services"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ImportStudentsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    details?: {
      totalProcessed: number
      successful: number
      failed: number
      errors: Array<{ row: number; error: string }>
    }
  } | null>(null)
  
  // Form state for adding a new student
  const [newStudent, setNewStudent] = useState({
    indexNumber: "",
    surname: "",
    otherNames: "",
    gender: "",
    level: "",
    dateOfBirth: "",
    nationality: "Ghanaian",
    programme: "",
    entryQualification: "WASSCE",
    status: "Active",
    email: "",
    phone: "",
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    }
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      // Handle nested fields (emergency contact)
      const [parent, child] = field.split('.')
      setNewStudent(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as Record<string, string>,
          [child]: value
        }
      }))
    } else {
      setNewStudent(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setImportResult(null) // Reset previous results
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setImportResult(null)

      // Check file type
      if (!file.name.endsWith('.csv')) {
        setImportResult({
          success: false,
          message: "Please upload a CSV file"
        })
        return
      }

      const result = await uploadStudentsFromCSV(file)
      
      setImportResult({
        success: true,
        message: "Student data imported successfully",
        details: result
      })
    } catch (error: any) {
      setImportResult({
        success: false,
        message: `Error importing data: ${error.message}`
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!newStudent.indexNumber || !newStudent.surname || !newStudent.otherNames || 
        !newStudent.gender || !newStudent.level || !newStudent.programme || !newStudent.dateOfBirth) {
      setFormError("Please fill in all required fields")
      return
    }
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      
      await addStudent(newStudent)
      
      // Reset form and close dialog
      setNewStudent({
        indexNumber: "",
        surname: "",
        otherNames: "",
        gender: "",
        level: "",
        dateOfBirth: "",
        nationality: "Ghanaian",
        programme: "",
        entryQualification: "WASSCE",
        status: "Active",
        email: "",
        phone: "",
        address: "",
        emergencyContact: {
          name: "",
          phone: "",
          relationship: ""
        }
      })
      
      setIsAddDialogOpen(false)
      
      setImportResult({
        success: true,
        message: "Student added successfully",
        details: {
          totalProcessed: 1,
          successful: 1,
          failed: 0,
          errors: []
        }
      })
    } catch (error: any) {
      setFormError(`Error adding student: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateStudentCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'student_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Student Data</h1>
          <p className="text-gray-600">Upload student information for portal access</p>
        </div>
        <Link href="/admin/students">
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
            Back to Students
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList>
          <TabsTrigger value="import">Import Students</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Upload Student Data</CardTitle>
              <CardDescription>
                Import student data from a CSV file. Students will be able to access the portal
                using their Student ID and Date of Birth after import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Manual Add Student Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student Manually
                  </Button>
                </div>
                
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <FileUp className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload a CSV file with student data
                    </p>
                    <div className="mt-2 flex justify-center">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" type="button" className="relative" onClick={() => document.getElementById('file-upload')?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Select CSV File
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    
                    {file && (
                      <p className="text-sm font-medium text-green-600 mt-2">
                        Selected file: {file.name}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={handleDownloadTemplate}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* Import Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-4"
                    disabled={!file || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Students
                      </>
                    )}
                  </Button>
                </div>

                {/* Results Section */}
                {importResult && (
                  <Alert variant={importResult.success ? "default" : "destructive"}>
                    {importResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {importResult.success ? "Import Successful" : "Import Error"}
                    </AlertTitle>
                    <AlertDescription>
                      {importResult.message}
                      
                      {importResult.details && (
                        <div className="mt-4">
                          <p>Summary:</p>
                          <ul className="list-disc list-inside text-sm">
                            <li>Total records: {importResult.details.totalProcessed}</li>
                            <li>Successfully imported: {importResult.details.successful}</li>
                            <li>Failed: {importResult.details.failed}</li>
                          </ul>
                          
                          {importResult.details.errors && importResult.details.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="font-semibold">Errors:</p>
                              <div className="max-h-40 overflow-y-auto mt-2 text-sm">
                                <table className="min-w-full border border-gray-300">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 border">Row</th>
                                      <th className="px-4 py-2 border">Error</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {importResult.details.errors.map((error, idx) => (
                                      <tr key={idx} className="bg-red-50">
                                        <td className="px-4 py-2 border">{error.row}</td>
                                        <td className="px-4 py-2 border">{error.error}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
              <CardDescription>
                Follow these guidelines to properly import student data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Fields</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-medium">indexNumber</span> - Unique student ID (e.g., AG/2023/001234)</li>
                  <li><span className="font-medium">surname</span> - Student's last name</li>
                  <li><span className="font-medium">otherNames</span> - Student's first and middle names</li>
                  <li><span className="font-medium">gender</span> - Male or Female</li>
                  <li><span className="font-medium">dateOfBirth</span> - Format: YYYY-MM-DD (e.g., 1999-05-15)</li>
                  <li><span className="font-medium">programme</span> - Degree program</li>
                  <li><span className="font-medium">level</span> - Current level (e.g., 100, 200, 300, 400)</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-6">Optional Fields</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-medium">nationality</span> - Default: Ghanaian</li>
                  <li><span className="font-medium">entryQualification</span> - Default: WASSCE</li>
                  <li><span className="font-medium">status</span> - Default: Active</li>
                  <li><span className="font-medium">email</span></li>
                  <li><span className="font-medium">phone</span></li>
                  <li><span className="font-medium">address</span></li>
                  <li><span className="font-medium">emergencyContactName</span></li>
                  <li><span className="font-medium">emergencyContactPhone</span></li>
                  <li><span className="font-medium">emergencyContactRelationship</span></li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h3 className="text-blue-800 font-semibold flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Important Notes
                  </h3>
                  <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1 text-sm">
                    <li>Students will use their <strong>index number</strong> and <strong>date of birth</strong> to log in to the student portal</li>
                    <li>Ensure date of birth is in the correct format (YYYY-MM-DD)</li>
                    <li>The index number must be unique for each student</li>
                    <li>Download the template for the correct CSV format</li>
                    <li>Student data will be automatically synced across all portals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddStudent}>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enter student information for portal access</DialogDescription>
            </DialogHeader>
            
            {formError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="indexNumber">Index Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="indexNumber" 
                    placeholder="AG/2024/001234" 
                    value={newStudent.indexNumber}
                    onChange={(e) => handleInputChange('indexNumber', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programme">Programme <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newStudent.programme} 
                    onValueChange={(value) => handleInputChange('programme', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSc Agriculture">BSc Agriculture</SelectItem>
                      <SelectItem value="BSc Environmental Science">BSc Environmental Science</SelectItem>
                      <SelectItem value="BSc Information Technology">BSc Information Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname <span className="text-red-500">*</span></Label>
                  <Input 
                    id="surname" 
                    value={newStudent.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherNames">Other Names <span className="text-red-500">*</span></Label>
                  <Input 
                    id="otherNames" 
                    value={newStudent.otherNames}
                    onChange={(e) => handleInputChange('otherNames', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newStudent.gender} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newStudent.level} 
                    onValueChange={(value) => handleInputChange('level', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    value={newStudent.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newStudent.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newStudent.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={newStudent.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input 
                    id="emergencyContactName" 
                    value={newStudent.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input 
                    id="emergencyContactPhone" 
                    value={newStudent.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input 
                    id="emergencyContactRelationship" 
                    value={newStudent.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Add Student
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 