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
import { Search, Plus, Edit, Eye, Trash2, Download, Upload, Filter, MoreHorizontal, AlertCircle, Wifi, WifiOff, User, Calendar, MapPin, Phone, Mail, Book, GraduationCap, FileText, UserPlus, Camera, Check, RefreshCw, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { getAllStudents, exportStudentsToCSV, addStudent, updateStudent, syncStudentRegistrations, getStudentsRealtime } from "@/lib/student-services"
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
import { ThemeToggle } from "@/components/theme-toggle"

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
  
  // CSS styles for student table
  const tableStyles = {
    studentTable: `
      .student-table {
        border-collapse: separate;
        border-spacing: 0;
      }
      
      .student-table th {
        font-weight: 600;
        text-align: left;
        padding: 0.75rem 1rem;
        background-color: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .dark .student-table th {
        background-color: #1f2937;
        border-bottom: 1px solid #374151;
        color: #e5e7eb;
      }
      
      .student-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: middle;
      }
      
      .dark .student-table td {
        border-bottom: 1px solid #374151;
      }
      
      .student-table tr:hover td {
        background-color: #f3f4f6;
      }
      
      .dark .student-table tr:hover td {
        background-color: #1f2937;
      }
      
      .badge-active {
        background-color: #d1fae5;
        color: #065f46;
        border-color: #a7f3d0;
      }
      
      .dark .badge-active {
        background-color: rgba(6, 95, 70, 0.2);
        color: #34d399;
        border-color: rgba(6, 95, 70, 0.5);
      }
      
      .badge-inactive {
        background-color: #fee2e2;
        color: #b91c1c;
        border-color: #fecaca;
      }
      
      .dark .badge-inactive {
        background-color: rgba(185, 28, 28, 0.2);
        color: #f87171;
        border-color: rgba(185, 28, 28, 0.5);
      }
      
      .badge-pending {
        background-color: #fef3c7;
        color: #92400e;
        border-color: #fde68a;
      }
      
      .dark .badge-pending {
        background-color: rgba(146, 64, 14, 0.2);
        color: #fbbf24;
        border-color: rgba(146, 64, 14, 0.5);
      }
      
      .badge-suspended {
        background-color: #e0e7ff;
        color: #4338ca;
        border-color: #c7d2fe;
      }
      
      .dark .badge-suspended {
        background-color: rgba(67, 56, 202, 0.2);
        color: #818cf8;
        border-color: rgba(67, 56, 202, 0.5);
      }
      
      .badge-regular {
        background-color: #f3f4f6;
        color: #4b5563;
        border-color: #e5e7eb;
      }
      
      .dark .badge-regular {
        background-color: rgba(75, 85, 99, 0.2);
        color: #9ca3af;
        border-color: rgba(75, 85, 99, 0.5);
      }
      
      .badge-weekend {
        background-color: #dbeafe;
        color: #1e40af;
        border-color: #bfdbfe;
      }
      
      .dark .badge-weekend {
        background-color: rgba(30, 64, 175, 0.2);
        color: #60a5fa;
        border-color: rgba(30, 64, 175, 0.5);
      }
      
      .badge-evening {
        background-color: #ede9fe;
        color: #5b21b6;
        border-color: #ddd6fe;
      }
      
      .dark .badge-evening {
        background-color: rgba(91, 33, 182, 0.2);
        color: #a78bfa;
        border-color: rgba(91, 33, 182, 0.5);
      }
      
      .student-table-container {
        overflow-x: auto;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
      }
      
      .dark .student-table-container {
        border-color: #374151;
      }
      
      .theme-transition {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
      }
    `
  }
  
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
  
  // New state for sync results
  const [syncResults, setSyncResults] = useState<{ created: number; updated: number; errors: string[] } | null>(null)

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
    // Fetch students from Firebase with real-time updates
    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        setFormError(null)
        
        // Set up real-time listener for student data
        const unsubscribe = getStudentsRealtime(
          (data) => {
            setStudents(data)
            setFilteredStudents(data)
            setIsLoading(false)
            
            // If no students, try to sync from registrations
            if (data.length === 0) {
              console.log("No students found, attempting to sync from registrations")
              handleSyncNow()
            }
          },
          (error) => {
            console.error("Error fetching students:", error)
            setFormError("Failed to load students. Please check your internet connection.")
            setIsLoading(false)
            
            // Fallback to regular fetch if real-time fails
            fallbackFetchStudents()
          }
        )
        
        // Cleanup function to unsubscribe from listener
        return () => {
          unsubscribe()
        }
      } catch (error) {
        console.error("Error setting up student listener:", error)
        setFormError("Failed to load students. Please check your internet connection.")
        setIsLoading(false)
        
        // Fallback to regular fetch
        fallbackFetchStudents()
      }
    }
    
    // Fallback function to use regular fetch
    const fallbackFetchStudents = async () => {
      try {
        const data = await getAllStudents()
        setStudents(data)
        setFilteredStudents(data)
        
        // If no students from collections, try to sync from registrations
        if (data.length === 0) {
          console.log("No students found, attempting to sync from registrations")
          const syncResult = await syncStudentRegistrations()
          if (syncResult.success) {
            // Refresh students after sync
            const refreshedData = await getAllStudents()
            setStudents(refreshedData)
            setFilteredStudents(refreshedData)
            setSyncResults({
              created: syncResult.created,
              updated: syncResult.updated,
              errors: syncResult.errors
            })
          }
        }
      } catch (error) {
        console.error("Error in fallback fetch:", error)
        setFormError("Failed to load students. Please check your internet connection.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStudents()
  }, [])

  // Function to refresh students
  const refreshStudents = async () => {
    try {
      setIsLoading(true)
      setFormError(null)
      const data = await getAllStudents()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error("Error refreshing students:", error)
      setFormError("Failed to refresh students. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to sync registrations
  const handleSyncNow = async () => {
    try {
      setIsLoading(true)
      setFormError(null)
      
      const syncResult = await syncStudentRegistrations()
      setSyncResults({
        created: syncResult.created,
        updated: syncResult.updated,
        errors: syncResult.errors
      })
      
      if (syncResult.success) {
        toast({
          title: "Sync Complete",
          description: `Created ${syncResult.created} and updated ${syncResult.updated} student records`,
          variant: "default"
        })
        
        // Refresh the student list
        await refreshStudents()
      } else {
        toast({
          title: "Sync Failed",
          description: syncResult.errors.length > 0 ? syncResult.errors[0] : "Unknown error occurred",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error syncing student registrations:", error)
      setFormError("Failed to sync student registrations. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }

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
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="badge-active">Active</Badge>
      case "inactive":
        return <Badge className="badge-inactive">Inactive</Badge>
      case "graduated":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Graduated</Badge>
      case "suspended":
        return <Badge className="badge-suspended">Suspended</Badge>
      case "pending":
        return <Badge className="badge-pending">Pending</Badge>
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const getScheduleBadge = (scheduleType?: string) => {
    if (!scheduleType) return null;
    
    switch (scheduleType.toLowerCase()) {
      case "regular":
        return <Badge variant="outline" className="badge-regular">Regular</Badge>
      case "weekend":
        return <Badge variant="outline" className="badge-weekend">Weekend</Badge>
      case "evening":
        return <Badge variant="outline" className="badge-evening">Evening</Badge>
      case "distance":
        return <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-900/50">Distance</Badge>
      default:
        return <Badge variant="outline">{scheduleType}</Badge>
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
  
  const handleDownloadTemplate = () => {
    try {
      // Create a template CSV with headers and one example row
      const headers = [
        "Index Number",
        "Surname",
        "Other Names",
        "Gender",
        "Date of Birth",
        "Programme",
        "Level",
        "Schedule Type",
        "Status",
        "Email",
        "Phone",
        "Address",
        "Emergency Contact Name",
        "Emergency Contact Phone",
        "Emergency Relationship"
      ].join(",");
      
      const exampleRow = [
        "UCAES123456",
        "Doe",
        "John",
        "Male",
        "1995-05-15",
        "B.Sc. Sustainable Agriculture",
        "100",
        "Regular",
        "Active",
        "student@example.com",
        "+233555123456",
        "123 Main St, Accra",
        "Jane Doe",
        "+233555789012",
        "Parent"
      ].join(",");
      
      const csvContent = headers + "\n" + exampleRow;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Template Downloaded",
        description: "CSV template for student upload has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        title: "Error",
        description: "Failed to generate CSV template.",
        variant: "destructive"
      });
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
  
  const handleResetDatabase = async () => {
    try {
    setIsResetting(true)
    setResetResults(null)
    
      // Clear all data
      const clearResult = await clearAllData()
      
      if (clearResult.success) {
        // Re-initialize with base data and sync student registrations
        const syncResult = await syncModuleData()
        
        setResetResults({
          success: syncResult.success,
          message: `Database reset successful. ${syncResult.message}`,
          deletedCount: clearResult.deletedCount
        })
        
        // Refresh student list
        await refreshStudents()
      } else {
        setResetResults({
          success: false,
          message: clearResult.message,
          deletedCount: {}
        })
      }
    } catch (error) {
      console.error("Error resetting database:", error)
      setResetResults({
        success: false,
        message: `Error resetting database: ${error instanceof Error ? error.message : "Unknown error"}`,
        deletedCount: {}
      })
    } finally {
      setIsResetting(false)
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

  return (
    <div className="space-y-6">
      {/* Apply table styles */}
      <style dangerouslySetInnerHTML={{ __html: tableStyles.studentTable }} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage student records and synchronize with registration system</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isOnline ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
              <Wifi className="h-3 w-3" /> Online
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5">
              <WifiOff className="h-3 w-3" /> Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
            type="search"
                  placeholder="Search by name or index number..."
            className="pl-10 w-full dark:bg-gray-800 dark:border-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

        <div className="md:col-span-3">
              <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span>{filterProgram === "all" ? "All Programs" : filterProgram}</span>
              </div>
                </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program || `program-${Math.random()}`} value={program || ""}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>

        <div className="md:col-span-3">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                <span>{filterLevel === "all" ? "All Levels" : `Level ${filterLevel}`}</span>
              </div>
                </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level || `level-${Math.random()}`} value={level || ""}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

        <div className="md:col-span-2">
          <Button 
            onClick={handleSyncNow}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Registrations
          </Button>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
        
        <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        
        <Button onClick={handleExportCSV} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button onClick={handleDownloadTemplate} variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50">
          <FileText className="h-4 w-4 mr-2" />
          Template
        </Button>
        
        <Button onClick={() => setIsCreateAccountsDialogOpen(true)} variant="outline" className="border-violet-600 text-violet-600 hover:bg-violet-50">
          <UserPlus className="h-4 w-4 mr-2" />
          Create Accounts
        </Button>
        
        <Button 
          onClick={() => setIsResetDialogOpen(true)} 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
          disabled={!isOnline}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Database
        </Button>
      </div>

      {/* Online/Offline indicator */}
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center">
            <WifiOff className="h-4 w-4 mr-2" />
            Offline Mode
          </AlertTitle>
          <AlertDescription>
            You are currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Results */}
      {syncResults && (syncResults.created > 0 || syncResults.updated > 0) && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <AlertTitle className="text-green-700">Sync Complete</AlertTitle>
          </div>
          <AlertDescription className="text-green-700">
            Successfully synced student data: {syncResults.created} new students imported, {syncResults.updated} student records updated.
            {syncResults.errors.length > 0 && (
              <div className="mt-2">
                <strong>Some errors occurred:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {syncResults.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {syncResults.errors.length > 3 && (
                    <li>...and {syncResults.errors.length - 3} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Student table */}
      <Card className="border-none shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Registered Students ({filteredStudents.length})
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                View and manage all registered students
              </CardDescription>
            </div>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="student-table-container">
            <Table className="student-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="theme-transition">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading student data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <User className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">No students found</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSyncNow}
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync from Registration System
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.indexNumber || "No ID"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {student.profilePictureUrl ? (
                              <img 
                                src={student.profilePictureUrl} 
                                alt={`${student.surname}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <span>{`${student.surname || ""}, ${student.otherNames || ""}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={student.programme}>
                        {student.programme}
                      </TableCell>
                      <TableCell>
                        {student.scheduleType ? 
                          getScheduleBadge(student.scheduleType) : 
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Not Set</Badge>
                        }
                      </TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2 py-0">
                              {getStatusBadge(student.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                            <DropdownMenuItem
                              onClick={() => {
                                const updatedStudent = { ...student, status: "Active" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating status:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <Badge className="badge-active mr-2">Active</Badge>
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                const updatedStudent = { ...student, status: "Inactive" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating status:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <Badge className="badge-inactive mr-2">Inactive</Badge>
                              Mark as Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const updatedStudent = { ...student, status: "pending" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating status:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <Badge className="badge-pending mr-2">Pending</Badge>
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">Schedule Type</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                const updatedStudent = { ...student, scheduleType: "Regular" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating schedule type:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              Regular
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const updatedStudent = { ...student, scheduleType: "Weekend" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating schedule type:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              Weekend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const updatedStudent = { ...student, scheduleType: "Evening" };
                                updateStudent(student.id, updatedStudent)
                                  .then(() => refreshStudents())
                                  .catch(error => console.error("Error updating schedule type:", error));
                              }}
                              className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              Evening
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                            onClick={() => handleViewStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-500"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Database
            </DialogTitle>
            <DialogDescription>
              This will clear all student data and reset the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {resetResults && (
            <Alert 
              variant={resetResults.success ? "default" : "destructive"}
              className={resetResults.success ? "bg-green-50 border-green-200" : ""}
            >
              <AlertTitle className={resetResults.success ? "text-green-700" : ""}>
                {resetResults.success ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription className={resetResults.success ? "text-green-700" : ""}>
                {resetResults.message}
                {resetResults.success && resetResults.deletedCount && (
                  <div className="mt-2">
                    <strong>Deleted records:</strong>
                    <ul className="list-disc pl-5">
                      {Object.entries(resetResults.deletedCount).map(([collection, count]) => (
                        <li key={collection}>
                          {collection}: {count} records
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Type <strong>RESET</strong> to confirm this action.
            </p>
            <Input 
              placeholder="Type RESET to confirm"
              onChange={(e) => e.target.value === 'RESET' ? setIsResetting(false) : setIsResetting(true)}
              className="border-red-300"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetDatabase}
              disabled={isResetting}
            >
              Reset Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
