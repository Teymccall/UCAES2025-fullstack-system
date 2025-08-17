"use client"

import React, { useState, useEffect } from "react"
import { collection, getDocs, query, where, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAcademic } from "@/components/academic-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Eye, Download, Trash2, Loader2, FileText, Printer } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface RegisteredCourse {
  courseId: string
  courseCode: string
  courseName: string
  credits: number
}

interface Registration {
  id: string
  studentId: string
  studentName: string
  registrationNumber?: string
  academicYear: string
  semester: string
  level: string
  program: string
  studyMode: string
  courses: RegisteredCourse[]
  totalCredits: number
  registrationDate: any
  status: "pending" | "approved" | "rejected"
  registeredBy: string
}

export default function RegisteredStudentsPage() {
  const { academicYears, currentAcademicYear, currentSemester } = useAcademic()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClearingRegistrations, setIsClearingRegistrations] = useState(false)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedStudyMode, setSelectedStudyMode] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [programNames, setProgramNames] = useState<Record<string, string>>({})
  const [availablePeriods, setAvailablePeriods] = useState<{years: string[], semesters: string[]}>({years: [], semesters: []})
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  
  // Load program names and available periods
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load program names
        const programsRef = collection(db, "academic-programs")
        const programsSnapshot = await getDocs(programsRef)
        
        const names: Record<string, string> = {}
        programsSnapshot.forEach(doc => {
          names[doc.id] = doc.data().name || doc.id
        })
        
        setProgramNames(names)
        console.log("Loaded program names:", names)

        // Load available periods from course registrations
        const registrationsRef = collection(db, "course-registrations")
        const registrationsSnapshot = await getDocs(registrationsRef)
        
        const years = new Set<string>()
        const semesters = new Set<string>()
        
        registrationsSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.courses && data.courses.length > 0) {
            if (data.academicYear) years.add(data.academicYear)
            if (data.semester) {
              // Convert semester number to name for display
              const semesterName = data.semester === "1" ? "First Semester" :
                                   data.semester === "2" ? "Second Semester" :
                                   data.semester === "3" ? "Third Trimester" :
                                   data.semester
              semesters.add(semesterName)
            }
          }
        })
        
        setAvailablePeriods({
          years: Array.from(years).sort().reverse(), // Most recent first
          semesters: Array.from(semesters).sort()
        })
        
        console.log("Available periods:", { years: Array.from(years), semesters: Array.from(semesters) })
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    
    loadInitialData()
  }, [])

  // Helper function to get program name
  const getProgramName = (programId: string) => {
    // If it already looks like a name (contains BSc. or B.Sc.), return it
    if (programId.includes("BSc.") || programId.includes("B.Sc.")) {
      return programId
    }
    
    // Otherwise, look it up in our programNames map
    return programNames[programId] || programId
  }
  
  // Set default filters based on available periods
  useEffect(() => {
    if (availablePeriods.years.length > 0 && !selectedYear) {
      // Prefer current academic year if it has registrations, otherwise use most recent
      const yearValue = typeof currentAcademicYear === 'string' 
        ? currentAcademicYear 
        : (currentAcademicYear?.year || '')
      
      if (yearValue && availablePeriods.years.includes(yearValue)) {
        setSelectedYear(yearValue)
      } else {
        setSelectedYear(availablePeriods.years[0]) // Most recent year with registrations
      }
    }
    
    if (availablePeriods.semesters.length > 0 && !selectedSemester) {
      // Prefer current semester if it has registrations, otherwise use first available
      const semesterValue = typeof currentSemester === 'string' 
        ? currentSemester 
        : (currentSemester?.name || "First Semester")
      
      if (semesterValue && availablePeriods.semesters.includes(semesterValue)) {
        setSelectedSemester(semesterValue)
      } else {
        setSelectedSemester(availablePeriods.semesters[0]) // First available semester
      }
    }
  }, [availablePeriods, currentAcademicYear, currentSemester, selectedYear, selectedSemester])

  // Fetch registrations based on filters
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedYear || !selectedSemester) return
      
      setIsLoading(true)
      try {
        // Convert semester name back to number for query
        const semesterNumber = selectedSemester === "First Semester" ? "1" :
                              selectedSemester === "Second Semester" ? "2" :
                              selectedSemester === "Third Trimester" ? "3" :
                              selectedSemester
        
        const registrationsRef = collection(db, "course-registrations")
        const whereClauses: any[] = [
          where("academicYear", "==", selectedYear),
          where("semester", "==", semesterNumber)
        ]
        if (selectedProgram && selectedProgram !== 'all') whereClauses.push(where("program", "==", selectedProgram))
        if (selectedStudyMode && selectedStudyMode !== 'all') whereClauses.push(where("studyMode", "==", selectedStudyMode))
        if (selectedLevel && selectedLevel !== 'all') whereClauses.push(where("level", "==", selectedLevel))
        const q = query(registrationsRef, ...whereClauses)
        
        const snapshot = await getDocs(q)
        const registrationsData: Registration[] = []
        
        snapshot.forEach(doc => {
          const data = doc.data()
          registrationsData.push({
            id: doc.id,
            studentId: data.studentId,
            studentName: data.studentName,
            registrationNumber: data.registrationNumber,
            academicYear: data.academicYear,
            semester: data.semester,
            level: data.level,
            program: data.program,
            studyMode: data.studyMode,
            courses: data.courses || [],
            totalCredits: data.totalCredits || 0,
            registrationDate: data.registrationDate?.toDate() || new Date(),
            status: data.status || "pending",
            registeredBy: data.registeredBy
          })
        })
        
        setRegistrations(registrationsData)
        console.log("Fetched registrations:", registrationsData)
      } catch (error) {
        console.error("Error fetching registrations:", error)
        toast.error("Failed to load registrations")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRegistrations()
  }, [selectedYear, selectedSemester, toast])

  // Filter registrations based on search term and client-side filters
  useEffect(() => {
    let filtered = registrations
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = registrations.filter(registration => 
        registration.studentName.toLowerCase().includes(searchLower) ||
        (registration.registrationNumber && registration.registrationNumber.toLowerCase().includes(searchLower)) ||
        getProgramName(registration.program).toLowerCase().includes(searchLower)
      )
    }
    if (selectedProgram && selectedProgram !== 'all') filtered = filtered.filter(r => r.program === selectedProgram)
    if (selectedStudyMode && selectedStudyMode !== 'all') filtered = filtered.filter(r => r.studyMode === selectedStudyMode)
    if (selectedLevel && selectedLevel !== 'all') filtered = filtered.filter(r => String(r.level) === String(selectedLevel))
    
    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm, programNames, selectedProgram, selectedStudyMode, selectedLevel])

  const toggleExpand = (id: string) => {
    if (expandedStudent === id) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(id)
    }
  }

  const openCourseDialog = (registration: Registration) => {
    setSelectedRegistration(registration)
    setIsDialogOpen(true)
  }
  
  // Generate course registration printout
  const printRegistration = async (registration: Registration) => {
    setIsPrinting(true)
    
    // Fetch student profile picture
    let profilePictureUrl = ''
    try {
      if (registration.registrationNumber) {
        const studentsRef = collection(db, "students")
        const q = query(studentsRef, where("registrationNumber", "==", registration.registrationNumber))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data()
          profilePictureUrl = studentData.profilePictureUrl || ''
          console.log('📸 Found student photo for printing:', profilePictureUrl ? 'Yes' : 'No')
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch student photo for printing:', error)
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Please allow popups to print registration")
      setIsPrinting(false)
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Course Registration - ${registration.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; position: relative; }
          .school-logo { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 80px; 
            height: 80px; 
            object-fit: contain;
          }
          .logo { font-size: 24px; font-weight: bold; color: #166534; }
          .title { font-size: 20px; font-weight: bold; margin: 10px 0; }
          .student-photo { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 120px; 
            height: 140px; 
            border: 2px solid #166534; 
            object-fit: cover;
            border-radius: 5px;
          }
          .photo-placeholder { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 120px; 
            height: 140px; 
            border: 2px solid #ccc; 
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 12px;
            text-align: center;
            border-radius: 5px;
          }
          .info { margin: 20px 0; }
          .info-row { display: flex; margin: 5px 0; }
          .label { font-weight: bold; width: 150px; }
          .value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 30px; }
          .total { font-weight: bold; margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/uceslogo.png" alt="UCAES Logo" class="school-logo" />
          <div class="logo">UCAES</div>
          <div class="title">Course Registration Form</div>
          <div>University College of Agriculture and Environmental Studies</div>
          ${profilePictureUrl 
            ? `<img src="${profilePictureUrl}" alt="Student Photo" class="student-photo" />` 
            : `<div class="photo-placeholder">No Photo<br/>Available</div>`
          }
        </div>
        
        <div class="info">
          <div class="info-row">
            <span class="label">Student Name:</span>
            <span class="value">${registration.studentName}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration No:</span>
            <span class="value">${registration.registrationNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Program:</span>
            <span class="value">${getProgramName(registration.program)}</span>
          </div>
          <div class="info-row">
            <span class="label">Level:</span>
            <span class="value">${registration.level}</span>
          </div>
          <div class="info-row">
            <span class="label">Academic Year:</span>
            <span class="value">${registration.academicYear}</span>
          </div>
          <div class="info-row">
            <span class="label">Semester:</span>
            <span class="value">${registration.semester === "1" ? "First Semester" : registration.semester === "2" ? "Second Semester" : registration.semester}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration Date:</span>
            <span class="value">${registration.registrationDate.toLocaleDateString()}</span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            ${registration.courses.map(course => `
              <tr>
                <td>${course.courseCode}</td>
                <td>${course.courseName}</td>
                <td>${course.credits}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <strong>Total Credits: ${registration.totalCredits}</strong>
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Student Signature</div>
            <div>Date: _______________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Director's Signature</div>
            <div>Date: _______________</div>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
      setIsPrinting(false)
    }
  }
  
  // Create array of year options from available periods (years with actual registrations)
  const yearOptions = availablePeriods.years.map(year => {
    const isActive = typeof currentAcademicYear === 'string' 
      ? currentAcademicYear === year
      : currentAcademicYear?.year === year
    return {
      value: year,
      label: `${year}${isActive ? " (Current)" : ""}`
    }
  })

  const handleClearAllRegistrations = async () => {
    try {
      setIsClearingRegistrations(true)
      
      // Get all course registrations
      const registrationsRef = collection(db, "course-registrations")
      const registrationsSnapshot = await getDocs(registrationsRef)
      
      // Get all student registrations that have course registrations
      const studentRegistrationsRef = collection(db, "student-registrations")
      const studentRegistrationsSnapshot = await getDocs(studentRegistrationsRef)
      
      // Create a batch for efficient deletion
      const batch = writeBatch(db)
      
      // Add all course-registrations documents to batch
      registrationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Update student-registrations to remove course registration data
      studentRegistrationsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.courses && data.courses.length > 0) {
          batch.update(doc.ref, {
            courses: [],
            totalCredits: 0,
            registrationDate: null,
            status: "pending"
          })
        }
      })
      
      // Commit the batch
      await batch.commit()
      
      toast({
        title: "Success",
        description: `Successfully cleared ${registrationsSnapshot.size} course registrations and reset ${studentRegistrationsSnapshot.size} student registrations`,
        variant: "default"
      })
      
      // Refresh the data
      window.location.reload()
      
    } catch (error) {
      console.error("Error clearing registrations:", error)
      toast({
        title: "Error",
        description: "Failed to clear registrations. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsClearingRegistrations(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Registered Students</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearingRegistrations}>
                {isClearingRegistrations ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear All Registrations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Course Registrations</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all course registrations from Firebase including:
                  <br />• All course-registrations documents
                  <br />• Reset all student course data
                  <br />• Clear all registration dates and statuses
                  <br />• Reset total credits to 0
                  <br /><br />
                  <strong>This action cannot be undone!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllRegistrations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All Registrations
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Registrations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRegistrations.length} students who registered for courses in {selectedSemester} {selectedYear}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex-1">
              <Label htmlFor="year">Academic Year</Label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.semesters.map((semester, index) => (
                    <SelectItem key={index} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="program">Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  {Object.entries(programNames).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="mode">Mode</Label>
              <Select value={selectedStudyMode} onValueChange={setSelectedStudyMode}>
                <SelectTrigger>
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {[100,200,300,400,500,600].map(l => (
                    <SelectItem key={l} value={String(l)}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="Search by name, ID or program"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner className="h-8 w-8" />
              <span className="ml-2">Loading registrations...</span>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No registrations found</h3>
              <p className="text-muted-foreground">
                No students have registered for courses in {selectedSemester} {selectedYear}
                {searchTerm && " matching your search criteria"}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Total Credits</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <React.Fragment key={registration.id}>
                      <TableRow>
                        <TableCell>{registration.registrationNumber || "N/A"}</TableCell>
                        <TableCell>{registration.studentName}</TableCell>
                        <TableCell>{getProgramName(registration.program)}</TableCell>
                        <TableCell>{registration.level}</TableCell>
                        <TableCell>
                          <Badge variant={registration.totalCredits > 24 ? "destructive" : "default"}>
                            {registration.totalCredits}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {registration.registrationDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openCourseDialog(registration)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Courses
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => printRegistration(registration)} disabled={isPrinting}>
                            {isPrinting ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Printer className="h-4 w-4 mr-1" />
                            )}
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedStudent === registration.id && (
                        <TableRow key={`details-${registration.id}`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <div className="p-4">
                              <h4 className="font-medium mb-2">Registered Courses</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead className="text-center">Credits</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {registration.courses.map((course) => (
                                    <TableRow key={course.courseId || course.courseCode}>
                                      <TableCell>{course.courseCode}</TableCell>
                                      <TableCell>{course.courseName}</TableCell>
                                      <TableCell className="text-center">{course.credits}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Course Registration Details</DialogTitle>
            <DialogDescription>
              {selectedRegistration && `Viewing courses for ${selectedRegistration.studentName} (${selectedRegistration.registrationNumber || 'N/A'})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6 pb-4">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Student Name</Label>
                  <p className="text-sm">{selectedRegistration.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registration Number</Label>
                  <p className="text-sm">{selectedRegistration.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Program</Label>
                  <p className="text-sm">{getProgramName(selectedRegistration.program)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Level</Label>
                  <p className="text-sm">{selectedRegistration.level}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Academic Year</Label>
                  <p className="text-sm">{selectedRegistration.academicYear}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Semester</Label>
                  <p className="text-sm">
                    {selectedRegistration.semester === "1" ? "First Semester" : 
                     selectedRegistration.semester === "2" ? "Second Semester" : 
                     selectedRegistration.semester}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registration Date</Label>
                  <p className="text-sm">{selectedRegistration.registrationDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Credits</Label>
                  <div className="text-sm">
                    <Badge variant={selectedRegistration.totalCredits > 24 ? "destructive" : "default"}>
                      {selectedRegistration.totalCredits}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div>
                <h4 className="font-medium mb-4">Registered Courses</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRegistration.courses.map((course) => (
                        <TableRow key={course.courseId || course.courseCode}>
                          <TableCell className="font-medium">{course.courseCode}</TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell className="text-center">{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  printRegistration(selectedRegistration)
                  setIsDialogOpen(false)
                }} disabled={isPrinting}>
                  {isPrinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Printing...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Registration
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 