"use client"

import { useState, useEffect, FormEvent, useRef, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Eye, Trash2, Download, Upload, Filter, MoreHorizontal, AlertCircle, Wifi, WifiOff, User, Calendar, MapPin, Phone, Mail, Book, GraduationCap, FileText, UserPlus, Camera } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAllStudents, exportStudentsToCSV, addStudent, updateStudent } from "@/lib/student-services"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Student } from "@/lib/types"
import { ImportCSVDialog } from "@/components/admin/students/import-csv-dialog"
import { CreateAccountsDialog } from "@/components/admin/students/create-accounts-dialog"
import { useAuth } from "@/lib/auth-context"
import { uploadToCloudinary } from "@/lib/cloudinary-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { clearAllData, syncModuleData } from "@/lib/firebase-services"

export default function StudentManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProgram, setFilterProgram] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isCreateAccountsDialogOpen, setIsCreateAccountsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [editedStudent, setEditedStudent] = useState<Student | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Add a new state for reset dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetResults, setResetResults] = useState<{ success: boolean; message: string; deletedCount: Record<string, number> } | null>(null)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial state
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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

  useEffect(() => {
    // Fetch students from Firebase
    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        const data = await getAllStudents()
        setStudents(data)
        setFilteredStudents(data)
      } catch (error) {
        console.error("Error fetching students:", error)
        setFormError("Failed to load students. Please check your internet connection.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${student.surname} ${student.otherNames}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Program filter
    if (filterProgram !== "all") {
      filtered = filtered.filter((student) => student.programme === filterProgram)
    }

    // Level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter((student) => student.level === filterLevel)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, filterProgram, filterLevel])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "Graduated":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Graduated</Badge>
      case "Suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Make sure programs and levels have unique values for keys
  const programs = [...new Set(students.map((s) => s.programme))].filter(Boolean)
  const levels = [...new Set(students.map((s) => s.level))].filter(Boolean)

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsViewDialogOpen(true)
  }
  
  const handleEditStudent = (student: Student) => {
    console.log("Editing student:", student);
    setSelectedStudent(student);
    setEditedStudent({...student});
    console.log("Student data loaded for editing:", {...student});
    setProfileImagePreview(student.profilePictureUrl || null);
    setIsEditDialogOpen(true);
  }
  
  const handleEditInputChange = (field: string, value: string | number) => {
    if (!editedStudent) return
    
    if (field.includes('.')) {
      // Handle nested fields (emergency contact, guardian, etc.)
      const [parent, child] = field.split('.')
      setEditedStudent(prev => {
        if (!prev) return prev
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as Record<string, any> || {}),
            [child]: value
          }
        }
      })
    } else {
      setEditedStudent(prev => {
        if (!prev) return prev
        return {
          ...prev,
          [field]: value
        }
      })
    }
  }
  
  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImagePreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleUpdateStudent = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!isOnline) {
      setFormError("You are currently offline. Please connect to the internet to update the student.")
      return
    }
    
    if (!editedStudent) return
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      
      let updatedStudent = {...editedStudent}
      console.log("Preparing to update student:", updatedStudent);
      
      // Upload profile image if changed
      if (profileImage) {
        try {
          console.log("Uploading profile image to Cloudinary...")
          
          // Upload to Cloudinary using our service
          const result = await uploadToCloudinary(profileImage, "student-profiles")
          console.log("Cloudinary upload result:", result)
          
          // Update student with the secure URL from Cloudinary
          updatedStudent.profilePictureUrl = result.secure_url
        } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError)
          setFormError(`Error uploading profile image: ${(uploadError as Error).message}`)
          return
        }
      }
      
      // Update student in database (this will also sync across all modules)
      console.log("Calling updateStudent with ID:", editedStudent.id);
      await updateStudent(editedStudent.id, updatedStudent)
      console.log("Student updated with data:", updatedStudent)
      
      // Refresh student list
      console.log("Refreshing student list...");
      const updatedStudents = await getAllStudents()
      console.log(`Refreshed student list, retrieved ${updatedStudents.length} students`);
      setStudents(updatedStudents)
      setFilteredStudents(updatedStudents)
      
      // Update the selected student
      setSelectedStudent(updatedStudent)
      
      // Show success message
      toast({
        title: "Student Updated Successfully",
        description: "Student information has been updated and synchronized across all modules",
      })
      
      // Reset and close dialog
      setProfileImage(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating student:", error)
      setFormError(`Error updating student: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleExportCSV = async () => {
    try {
      const csvContent = await exportStudentsToCSV(filteredStudents)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'students_export.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting students:", error)
      setFormError("Failed to export students. Please try again.")
    }
  }
  
  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!isOnline) {
      setFormError("You are currently offline. Please connect to the internet to add a student.")
      return
    }
    
    // Validate required fields
    if (!newStudent.indexNumber || !newStudent.surname || !newStudent.otherNames || 
        !newStudent.gender || !newStudent.level || !newStudent.programme) {
      setFormError("Please fill in all required fields")
      return
    }
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      
      await addStudent(newStudent)
      
      // Refresh student list
      const updatedStudents = await getAllStudents()
      setStudents(updatedStudents)
      setFilteredStudents(updatedStudents)
      
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
    } catch (error) {
      console.error("Error adding student:", error)
      setFormError(`Error adding student: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleImportSuccess = async () => {
    // Refresh student list after successful import
    try {
      setIsLoading(true)
      const data = await getAllStudents()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error("Error refreshing students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to handle database reset
  const handleResetDatabase = async () => {
    setIsResetting(true)
    setResetResults(null)
    
    try {
      // Step 1: Clear all data
      const result = await clearAllData()
      setResetResults(result)
      
      if (result.success) {
        // Step 2: Sync initial data between modules
        const syncResult = await syncModuleData()
        
        if (syncResult.success) {
          toast({
            title: "Database Reset Successful",
            description: `Successfully cleared ${Object.values(result.deletedCount).reduce((a, b) => a + b, 0)} records and synchronized initial data.`,
            variant: "default",
          })
        } else {
          toast({
            title: "Database Reset Successful, but Sync Failed",
            description: `Database was cleared, but sync failed: ${syncResult.message}`,
            variant: "default",
          })
        }
        
        // Refresh the students list
        setStudents([])
        setFilteredStudents([])
      } else {
        toast({
          title: "Database Reset Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resetting database:", error)
      toast({
        title: "Error",
        description: "An error occurred while resetting the database.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
      setIsResetDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Network Status Indicator */}
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently offline. Some features may be limited. Data will be synchronized when you reconnect.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            disabled={!isOnline}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600"
            onClick={() => setIsCreateAccountsDialogOpen(true)}
            disabled={!isOnline}
          >
            <User className="mr-2 h-4 w-4" />
            Create Portal Accounts
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={!isOnline}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset Database
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800" disabled={!isOnline}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleAddStudent}>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student's information below. A portal account will be automatically created 
                    if a Date of Birth is provided.
                  </DialogDescription>
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
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date" 
                        value={newStudent.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
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
                    className="bg-green-700 hover:bg-green-800"
                    disabled={isSubmitting || !isOnline}
                  >
                    {isSubmitting ? "Adding..." : "Add Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or index number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program || `program-${Math.random()}`} value={program || ""}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level || `level-${Math.random()}`} value={level || ""}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <CardDescription>Manage student records and view detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Index Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading students...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-gray-600">No students found</p>
                      {!isOnline && (
                        <p className="text-sm text-gray-500 mt-2">
                          You are currently offline. Connect to the internet to access all student records.
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.indexNumber}</TableCell>
                      <TableCell>{`${student.surname}, ${student.otherNames}`}</TableCell>
                      <TableCell>{student.programme}</TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditStudent(student)}
                              disabled={!isOnline}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" disabled={!isOnline}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.surname}, {selectedStudent?.otherNames}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Student Header with Profile Picture */}
              <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {selectedStudent.profilePictureUrl ? (
                    <img 
                      src={selectedStudent.profilePictureUrl} 
                      alt={`${selectedStudent.surname} ${selectedStudent.otherNames}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.surname}, {selectedStudent.otherNames}
                  </h2>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-gray-600">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{selectedStudent.indexNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      <span>{selectedStudent.programme}</span>
                    </div>
                    <div>{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                </div>
              </div>
              
              {/* Student Information Tabs */}
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="guardian">Guardian</TabsTrigger>
                </TabsList>
                
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.surname}, {selectedStudent.otherNames}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date of Birth</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Nationality</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.nationality || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Religion</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.religion || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Marital Status</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.maritalStatus || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">National ID</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.nationalId || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Index Number</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.indexNumber}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Academic Information Tab */}
                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Programme</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.programme}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Level</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.level}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Year of Entry</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.yearOfEntry || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Entry Level</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.entryLevel || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Entry Qualification</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.entryQualification || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Registration Date</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Contact Information Tab */}
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-sm text-gray-600">
                          {typeof selectedStudent.address === 'object' ? (
                            <>
                              {selectedStudent.address?.street && <span className="block">{selectedStudent.address.street}</span>}
                              {selectedStudent.address?.city && <span className="block">{selectedStudent.address.city}</span>}
                              {selectedStudent.address?.country && <span className="block">{selectedStudent.address.country}</span>}
                            </>
                          ) : (
                            selectedStudent.address || "Not provided"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-green-700">Emergency Contact</h3>
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.emergencyContact?.name || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.emergencyContact?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Relationship</Label>
                        <p className="text-sm text-gray-600">{selectedStudent.emergencyContact?.relationship || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Guardian Information Tab */}
                <TabsContent value="guardian" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Guardian Name</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.guardianName || 
                           selectedStudent.guardian?.name || 
                           selectedStudent.guardianDetails?.name || 
                           "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Guardian Phone</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.guardianContact || 
                           selectedStudent.guardian?.contact || 
                           selectedStudent.guardianDetails?.contact || 
                           "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Relationship</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.guardian?.relationship || 
                           selectedStudent.guardianDetails?.relationship || 
                           "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Guardian Email</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.guardianEmail || 
                           selectedStudent.guardian?.email || 
                           selectedStudent.guardianDetails?.email || 
                           "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Guardian Address</Label>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.guardianAddress || 
                           selectedStudent.guardian?.address || 
                           selectedStudent.guardianDetails?.address || 
                           "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              className="bg-green-700 hover:bg-green-800" 
              disabled={!isOnline}
              onClick={() => {
                setIsViewDialogOpen(false)
                if (selectedStudent) {
                  handleEditStudent(selectedStudent)
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import CSV Dialog */}
      <ImportCSVDialog 
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={handleImportSuccess}
      />
      
      {/* Create Accounts Dialog */}
      <CreateAccountsDialog open={isCreateAccountsDialogOpen} onOpenChange={setIsCreateAccountsDialogOpen} />
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update information for {editedStudent?.surname}, {editedStudent?.otherNames}
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {editedStudent && (
            <form onSubmit={handleUpdateStudent} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center group">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile Preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="profile-upload" className="cursor-pointer text-white flex items-center justify-center">
                      <Camera className="h-6 w-6" />
                    </label>
                  </div>
                </div>
                <input 
                  type="file" 
                  id="profile-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  ref={fileInputRef}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              
              {/* Student Edit Tabs */}
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="guardian">Guardian</TabsTrigger>
                </TabsList>
                
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="indexNumber">Index Number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="indexNumber" 
                        value={editedStudent.indexNumber}
                        onChange={(e) => handleEditInputChange('indexNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Surname <span className="text-red-500">*</span></Label>
                      <Input 
                        id="surname" 
                        value={editedStudent.surname}
                        onChange={(e) => handleEditInputChange('surname', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherNames">Other Names <span className="text-red-500">*</span></Label>
                      <Input 
                        id="otherNames" 
                        value={editedStudent.otherNames}
                        onChange={(e) => handleEditInputChange('otherNames', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                      <Select 
                        value={editedStudent.gender} 
                        onValueChange={(value) => handleEditInputChange('gender', value)}
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
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date" 
                        value={editedStudent.dateOfBirth?.split('T')[0] || ''}
                        onChange={(e) => handleEditInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input 
                        id="nationality" 
                        value={editedStudent.nationality || ''}
                        onChange={(e) => handleEditInputChange('nationality', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input 
                        id="religion" 
                        value={editedStudent.religion || ''}
                        onChange={(e) => handleEditInputChange('religion', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select 
                        value={editedStudent.maritalStatus || ''} 
                        onValueChange={(value) => handleEditInputChange('maritalStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input 
                        id="nationalId" 
                        value={editedStudent.nationalId || ''}
                        onChange={(e) => handleEditInputChange('nationalId', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Academic Information Tab */}
                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="programme">Programme <span className="text-red-500">*</span></Label>
                      <Select 
                        value={editedStudent.programme} 
                        onValueChange={(value) => handleEditInputChange('programme', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select programme" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program || `program-${Math.random()}`} value={program || ""}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Current Level <span className="text-red-500">*</span></Label>
                      <Select 
                        value={editedStudent.level} 
                        onValueChange={(value) => handleEditInputChange('level', value)}
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
                      <Label htmlFor="yearOfEntry">Year of Entry</Label>
                      <Input 
                        id="yearOfEntry" 
                        value={editedStudent.yearOfEntry || ''}
                        onChange={(e) => handleEditInputChange('yearOfEntry', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entryLevel">Entry Level</Label>
                      <Select 
                        value={editedStudent.entryLevel || ''} 
                        onValueChange={(value) => handleEditInputChange('entryLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entry level" />
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
                      <Label htmlFor="entryQualification">Entry Qualification</Label>
                      <Input 
                        id="entryQualification" 
                        value={editedStudent.entryQualification || ''}
                        onChange={(e) => handleEditInputChange('entryQualification', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={editedStudent.status} 
                        onValueChange={(value) => handleEditInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Graduated">Graduated</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Contact Information Tab */}
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={editedStudent.email || ''}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={editedStudent.phone || ''}
                        onChange={(e) => handleEditInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    {typeof editedStudent.address === 'object' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="street">Street</Label>
                          <Input 
                            id="street" 
                            value={editedStudent.address?.street || ''}
                            onChange={(e) => handleEditInputChange('address.street', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            value={editedStudent.address?.city || ''}
                            onChange={(e) => handleEditInputChange('address.city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            value={editedStudent.address?.country || ''}
                            onChange={(e) => handleEditInputChange('address.country', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea 
                          id="address" 
                          value={editedStudent.address || ''}
                          onChange={(e) => handleEditInputChange('address', e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                    
                    <div className="md:col-span-2 pt-4 border-t">
                      <h3 className="font-semibold text-green-700 mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactName">Name</Label>
                          <Input 
                            id="emergencyContactName" 
                            value={editedStudent.emergencyContact?.name || ''}
                            onChange={(e) => handleEditInputChange('emergencyContact.name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactPhone">Phone</Label>
                          <Input 
                            id="emergencyContactPhone" 
                            value={editedStudent.emergencyContact?.phone || ''}
                            onChange={(e) => handleEditInputChange('emergencyContact.phone', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                          <Input 
                            id="emergencyContactRelationship" 
                            value={editedStudent.emergencyContact?.relationship || ''}
                            onChange={(e) => handleEditInputChange('emergencyContact.relationship', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Guardian Information Tab */}
                <TabsContent value="guardian" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">Guardian Name</Label>
                      <Input 
                        id="guardianName" 
                        value={editedStudent.guardianName || 
                               editedStudent.guardian?.name || 
                               editedStudent.guardianDetails?.name || ''}
                        onChange={(e) => handleEditInputChange('guardianName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianContact">Guardian Phone</Label>
                      <Input 
                        id="guardianContact" 
                        value={editedStudent.guardianContact || 
                               editedStudent.guardian?.contact || 
                               editedStudent.guardianDetails?.contact || ''}
                        onChange={(e) => handleEditInputChange('guardianContact', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianRelationship">Relationship</Label>
                      <Input 
                        id="guardianRelationship" 
                        value={editedStudent.guardian?.relationship || 
                               editedStudent.guardianDetails?.relationship || ''}
                        onChange={(e) => {
                          if (editedStudent.guardian) {
                            handleEditInputChange('guardian.relationship', e.target.value);
                          } else if (editedStudent.guardianDetails) {
                            handleEditInputChange('guardianDetails.relationship', e.target.value);
                          } else {
                            // Create guardian object if it doesn't exist
                            handleEditInputChange('guardian', { relationship: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianEmail">Guardian Email</Label>
                      <Input 
                        id="guardianEmail" 
                        type="email"
                        value={editedStudent.guardianEmail || 
                               editedStudent.guardian?.email || 
                               editedStudent.guardianDetails?.email || ''}
                        onChange={(e) => handleEditInputChange('guardianEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="guardianAddress">Guardian Address</Label>
                      <Textarea 
                        id="guardianAddress" 
                        value={editedStudent.guardianAddress || 
                               editedStudent.guardian?.address || 
                               editedStudent.guardianDetails?.address || ''}
                        onChange={(e) => handleEditInputChange('guardianAddress', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-700 hover:bg-green-800"
                  disabled={isSubmitting || !isOnline}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Database Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Reset Database
            </DialogTitle>
            <DialogDescription>
              This action will delete ALL data from the database, including students, courses, programs, and more.
              This cannot be undone. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          
          {resetResults && (
            <div className={`p-3 rounded-md ${resetResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{resetResults.message}</p>
              {resetResults.success && (
                <div className="mt-2 text-sm">
                  <p>Records deleted:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {Object.entries(resetResults.deletedCount)
                      .filter(([_, count]) => count > 0)
                      .map(([collection, count]) => (
                        <li key={collection}>
                          {collection}: {count} records
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetDatabase}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> 
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Reset Everything
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
