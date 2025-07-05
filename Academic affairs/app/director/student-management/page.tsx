"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useStudents, type Student } from "@/components/student-context"
import { useCourses } from "@/components/course-context"
import { Search, Plus, Trash2, Users, BookOpen, Edit, CheckCircle, Download, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { useFirebase } from "@/components/firebase-context"

export default function DirectorStudentManagement() {
  const {
    students,
    searchStudents,
    addCourseToStudent,
    removeCourseFromStudent,
    validateCoursePrerequisites,
    getStudentByIndex,
    updateStudentInfo,
    addStudent,
    addAuditLog,
  } = useStudents()
  const { courses } = useCourses()
  const { toast } = useToast()
  const { db } = useFirebase()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isManagingCourses, setIsManagingCourses] = useState(false)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [courseToAdd, setCourseToAdd] = useState("")

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    name: "",
    email: "",
    program: "",
    level: "",
    semester: "",
    gpa: 0,
    cgpa: 0,
    status: "active" as const,
  })

  const programs = [
    "B.Sc. Sustainable Agriculture",
    "B.Sc. Sustainable Forestry", 
    "B.Sc. Environmental Science and Management"
  ]
  const levels = ["100", "200", "300", "400"]

  // Add these new state variables
  const [bulkOperationMode, setBulkOperationMode] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [filterProgram, setFilterProgram] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  // Add these new state variables for registrations
  const [activeTab, setActiveTab] = useState<"students" | "registrations">("students")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all")

  // Enhanced search with filters
  const handleAdvancedSearch = () => {
    try {
      let results = searchStudents(searchQuery.trim()) || [];

      if (filterProgram !== "all") {
        results = results.filter((s) => s && s.program === filterProgram);
      }

      if (filterLevel !== "all") {
        results = results.filter((s) => s && s.level === filterLevel);
      }

      if (filterStatus !== "all") {
        results = results.filter((s) => s && s.status === filterStatus);
      }

      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No students found matching your search criteria and filters",
          variant: "destructive",
        });
      }

      // Log search action
      addAuditLog({
        action: "STUDENT_SEARCH",
        performedBy: "Dr. Sarah Johnson",
        performedByRole: "director",
        targetStudentId: "SYSTEM",
        details: `Searched for students with query: "${searchQuery}", filters: program=${filterProgram}, level=${filterLevel}, status=${filterStatus}`,
      });
    } catch (error) {
      console.error("Advanced search error:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    }
  }

  // Bulk course registration
  const handleBulkCourseRegistration = (courseCode: string) => {
    const successCount = selectedStudents.reduce((count, studentId) => {
      const student = getStudentByIndex(studentId)
      if (student && !student.enrolledCourses.includes(courseCode)) {
        const validation = validateCoursePrerequisites(studentId, courseCode)
        if (validation.valid) {
          addCourseToStudent(studentId, courseCode)
          addAuditLog({
            action: "BULK_COURSE_REGISTRATION",
            performedBy: "Dr. Sarah Johnson",
            performedByRole: "director",
            targetStudentId: studentId,
            details: `Bulk registered for course ${courseCode}`,
          })
          return count + 1
        }
      }
      return count
    }, 0)

    toast({
      title: "Bulk Registration Complete",
      description: `Successfully registered ${successCount} students for ${courseCode}`,
    })
  }

  // Student analytics
  const getStudentAnalytics = () => {
    const analytics = {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      averageCGPA: students.reduce((sum, s) => sum + s.cgpa, 0) / students.length,
      programDistribution: programs.map((program) => ({
        program,
        count: students.filter((s) => s.program === program).length,
      })),
      levelDistribution: levels.map((level) => ({
        level,
        count: students.filter((s) => s.level === level).length,
      })),
      performanceDistribution: {
        excellent: students.filter((s) => s.cgpa >= 3.5).length,
        good: students.filter((s) => s.cgpa >= 3.0 && s.cgpa < 3.5).length,
        satisfactory: students.filter((s) => s.cgpa >= 2.5 && s.cgpa < 3.0).length,
        needsImprovement: students.filter((s) => s.cgpa < 2.5).length,
      },
    }

    return analytics
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a student ID or name to search",
        variant: "destructive",
      })
      return
    }

    try {
      const results = searchStudents(searchQuery.trim())
      setSearchResults(results || [])

      if (!results || results.length === 0) {
        toast({
          title: "No Results",
          description: "No students found matching your search criteria",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      })
      setSearchResults([])
    }
  }

  const handleSelectStudent = (student: Student, action: "manage" | "edit") => {
    setSelectedStudent(student)
    if (action === "manage") {
      setIsManagingCourses(true)
    } else {
      setStudentForm({
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        program: student.program,
        level: student.level,
        semester: student.semester,
        gpa: student.gpa,
        cgpa: student.cgpa,
        status: student.status,
      })
      setIsEditingStudent(true)
    }
  }

  const handleAddCourse = () => {
    if (!selectedStudent || !courseToAdd) return

    // Validate prerequisites
    const validation = validateCoursePrerequisites(selectedStudent.studentId, courseToAdd)
    if (!validation.valid) {
      toast({
        title: "Prerequisites Not Met",
        description: `Student must complete: ${validation.missingPrereqs.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    const success = addCourseToStudent(selectedStudent.studentId, courseToAdd)
    if (success) {
      toast({
        title: "Course Added",
        description: `Successfully registered ${selectedStudent.name} for ${courseToAdd}`,
      })
      // Refresh the selected student data
      const updatedStudent = getStudentByIndex(selectedStudent.studentId)
      if (updatedStudent) setSelectedStudent(updatedStudent)
      setCourseToAdd("")
    } else {
      toast({
        title: "Registration Failed",
        description: "Student is already enrolled in this course",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCourse = (courseCode: string) => {
    if (!selectedStudent) return

    const success = removeCourseFromStudent(selectedStudent.studentId, courseCode)
    if (success) {
      toast({
        title: "Course Removed",
        description: `Successfully removed ${courseCode} from ${selectedStudent.name}'s registration`,
      })
      // Refresh the selected student data
      const updatedStudent = getStudentByIndex(selectedStudent.studentId)
      if (updatedStudent) setSelectedStudent(updatedStudent)
    }
  }

  const handleUpdateStudent = () => {
    if (!selectedStudent) return

    updateStudentInfo(selectedStudent.id, {
      studentId: studentForm.studentId,
      name: studentForm.name,
      email: studentForm.email,
      program: studentForm.program,
      level: studentForm.level,
      semester: studentForm.semester,
      gpa: studentForm.gpa,
      cgpa: studentForm.cgpa,
      status: studentForm.status,
    })

    toast({
      title: "Student Updated",
      description: "Student information has been updated successfully",
    })

    setIsEditingStudent(false)
    setSelectedStudent(null)
  }

  const handleAddStudent = () => {
    if (!studentForm.studentId || !studentForm.name || !studentForm.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if student ID already exists
    if (getStudentByIndex(studentForm.studentId)) {
      toast({
        title: "Student ID Exists",
        description: "A student with this ID already exists",
        variant: "destructive",
      })
      return
    }

    addStudent({
      studentId: studentForm.studentId,
      name: studentForm.name,
      email: studentForm.email,
      program: studentForm.program,
      level: studentForm.level,
      semester: studentForm.semester,
      enrolledCourses: [],
      gpa: studentForm.gpa,
      cgpa: studentForm.cgpa,
      status: studentForm.status,
    })

    toast({
      title: "Student Added",
      description: "New student has been added successfully",
    })

    resetForm()
    setIsAddingStudent(false)
  }

  const resetForm = () => {
    setStudentForm({
      studentId: "",
      name: "",
      email: "",
      program: "",
      level: "",
      semester: "",
      gpa: 0,
      cgpa: 0,
      status: "active",
    })
  }

  const getAvailableCourses = () => {
    if (!selectedStudent) return []
    return courses.filter((course) => !selectedStudent.enrolledCourses.includes(course.code))
  }

  const getStudentCourses = () => {
    if (!selectedStudent) return []
    return selectedStudent.enrolledCourses
      .map((courseCode) => courses.find((c) => c.code === courseCode))
      .filter(Boolean)
  }

  // Add this function to fetch course registrations
  const fetchCourseRegistrations = async () => {
    setLoadingRegistrations(true)
    try {
      if (!db) {
        throw new Error("Firebase database not initialized")
      }
      
      const registrationsRef = collection(db, "registrations")
      
      // Start with a base query
      let registrationsQuery = query(registrationsRef)
      
      // Add orderBy only if we're not adding other filters, or if it's compatible with the filters
      let hasFilters = false
      
      // Add filters if they are not "all"
      if (selectedSemester !== "all") {
        registrationsQuery = query(registrationsRef, where("semester", "==", selectedSemester))
        hasFilters = true
      }
      
      if (selectedAcademicYear !== "all") {
        // If we already have a filter, we need to combine them
        if (hasFilters) {
          registrationsQuery = query(registrationsQuery, where("academicYear", "==", selectedAcademicYear))
        } else {
          registrationsQuery = query(registrationsRef, where("academicYear", "==", selectedAcademicYear))
          hasFilters = true
        }
      }
      
      // Only add orderBy if it doesn't conflict with our filters
      if (!hasFilters) {
        registrationsQuery = query(registrationsRef, orderBy("registrationDate", "desc"))
      } else {
        // Use a different approach when we have filters - get all data and sort in memory
        console.log("Using filters - will sort results in memory")
      }
      
      const snapshot = await getDocs(registrationsQuery)
      
      // Get all student data for the registrations
      const studentIds = new Set(snapshot.docs.map(doc => doc.data().studentId))
      const studentData: {[key: string]: Student} = {}
      
      for (const studentId of studentIds) {
        const student = await getStudentByIndex(studentId)
        if (student) {
          studentData[studentId] = student
        }
      }
      
      // Build combined registration data
      const registrationData = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data()
        const student = studentData[data.studentId]
        
        // Skip if we're filtering by program and this doesn't match
        if (selectedProgram !== "all" && student && student.program !== selectedProgram) {
          return null
        }
        
        // Get course details
        const courseDetails = await Promise.all((data.courses || []).map(async (courseId: string) => {
          const course = courses.find(c => c.id === courseId) || { code: "Unknown", name: "Unknown Course" }
          return course
        }))
        
        return {
          id: doc.id,
          ...data,
          student: student || { name: "Unknown Student", studentId: data.studentId },
          formattedDate: formatRegistrationDate(data.registrationDate),
          courseDetails
        }
      }))
      
      // If we couldn't use orderBy in the query because of filters, sort the results in memory
      let sortedData = registrationData.filter(Boolean)
      
      if (hasFilters) {
        sortedData = sortedData.sort((a, b) => {
          // Try to compare registration dates
          const dateA = a.registrationDate ? new Date(formatRegistrationDate(a.registrationDate)) : new Date(0)
          const dateB = b.registrationDate ? new Date(formatRegistrationDate(b.registrationDate)) : new Date(0)
          return dateB.getTime() - dateA.getTime() // Descending order
        })
      }
      
      // Filter out null values (from program filtering)
      setRegistrations(sortedData)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast({
        title: "Error",
        description: "Failed to load registration data: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      })
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }
  
  // Load registrations when tab changes to registrations
  useEffect(() => {
    if (activeTab === "registrations") {
      fetchCourseRegistrations()
    }
  }, [activeTab, selectedProgram, selectedSemester, selectedAcademicYear])
  
  // Export registrations as CSV
  const exportRegistrationsCSV = () => {
    if (registrations.length === 0) {
      toast({
        title: "No Data",
        description: "There are no registrations to export",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Prepare CSV headers
      const headers = [
        "Student ID",
        "Student Name",
        "Program",
        "Level",
        "Academic Year",
        "Semester",
        "Registration Date",
        "Total Credits",
        "Status",
        "Courses"
      ]
      
      // Prepare CSV rows
      const rows = registrations.map(reg => [
        reg.student.studentId,
        reg.student.name,
        reg.student.program,
        reg.student.level,
        reg.academicYear,
        reg.semester,
        reg.formattedDate,
        reg.totalCredits,
        reg.status,
        (reg.courseDetails || []).map((c: any) => `${c.code}`).join(", ")
      ])
      
      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n")
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      
      // Set download attributes
      link.setAttribute("href", url)
      link.setAttribute("download", `course-registrations-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      
      // Append to document, click and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Log action
      addAuditLog({
        action: "EXPORT_REGISTRATIONS",
        performedBy: "Dr. Sarah Johnson",
        performedByRole: "director",
        targetStudentId: "SYSTEM",
        details: `Exported ${registrations.length} course registrations as CSV`
      })
      
      toast({
        title: "Export Successful",
        description: `Exported ${registrations.length} registrations to CSV`
      })
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast({
        title: "Export Failed",
        description: "Failed to generate CSV file",
        variant: "destructive"
      })
    }
  }

  // Add this helper function near the top of the component
  const formatRegistrationDate = (date: any): string => {
    if (!date) return "Unknown Date"
    
    try {
      // Check if it's a Firebase Timestamp (has toDate method)
      if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString()
      }
      
      // Check if it's already a Date object
      if (date instanceof Date) {
        return date.toLocaleDateString()
      }
      
      // Check if it's a timestamp number
      if (typeof date === 'number') {
        return new Date(date).toLocaleDateString()
      }
      
      // Check if it's an ISO string
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString()
      }
      
      return "Unknown Date Format"
    } catch (error) {
      console.error("Error formatting date:", error, date)
      return "Date Error"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage students, their courses, and academic progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Button variant="outline" onClick={() => setBulkOperationMode(!bulkOperationMode)}>
            {bulkOperationMode ? "Exit Bulk Mode" : "Bulk Operations"}
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "students" | "registrations")}>
        <TabsList className="grid w-full md:w-80 grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Records
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Registrations
          </TabsTrigger>
        </TabsList>

        {/* Student Records Tab */}
        <TabsContent value="students" className="space-y-4">
          {/* Search & Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Student Search & Management
                </CardTitle>
                <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Register a new student in the system</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="student-id">Student ID *</Label>
                          <Input
                            id="student-id"
                            value={studentForm.studentId}
                            onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                            placeholder="ST001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student-name">Full Name *</Label>
                          <Input
                            id="student-name"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          placeholder="john.doe@student.edu"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="program">Program</Label>
                          <Select
                            value={studentForm.program}
                            onValueChange={(value) => setStudentForm({ ...studentForm, program: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              {programs.map((program) => (
                                <SelectItem key={program} value={program}>
                                  {program}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="level">Level</Label>
                          <Select
                            value={studentForm.level}
                            onValueChange={(value) => setStudentForm({ ...studentForm, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  Level {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                          id="semester"
                          value={studentForm.semester}
                          onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                          placeholder="Fall 2024"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingStudent(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStudent}>Add Student</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="search-query">Student ID or Name</Label>
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter student ID (e.g., ST001) or student name"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {student.level}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{student.cgpa.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.enrolledCourses.slice(0, 3).map((course) => (
                            <Badge key={course} variant="secondary" className="text-xs">
                              {course}
                            </Badge>
                          ))}
                          {student.enrolledCourses.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.enrolledCourses.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSelectStudent(student, "manage")}>
                            Manage Courses
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSelectStudent(student, "edit")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Registrations Tab */}
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Course Registration Records
              </CardTitle>
              <CardDescription>
                View and export student course registration data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                  <div>
                    <Label htmlFor="program-filter">Program</Label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map(program => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester-filter">Semester</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        <SelectItem value="First Semester">First Semester</SelectItem>
                        <SelectItem value="Second Semester">Second Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academic-year-filter">Academic Year</Label>
                    <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                        <SelectItem value="2022/2023">2022/2023</SelectItem>
                        <SelectItem value="2021/2022">2021/2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={exportRegistrationsCSV} 
                    className="flex gap-2 items-center"
                    disabled={registrations.length === 0 || loadingRegistrations}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Registration Table */}
              {loadingRegistrations ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <p className="text-sm text-muted-foreground">Loading registration data...</p>
                  </div>
                </div>
              ) : registrations.length === 0 ? (
                <div className="flex justify-center items-center py-8 border rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                    <p className="text-muted-foreground">No registration records found</p>
                    <p className="text-xs text-muted-foreground">Try changing your filters</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{registration.student.studentId}</TableCell>
                          <TableCell>{registration.student.name}</TableCell>
                          <TableCell>{registration.student.program}</TableCell>
                          <TableCell>{registration.academicYear}</TableCell>
                          <TableCell>{registration.semester}</TableCell>
                          <TableCell>{registration.formattedDate}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto text-blue-600">
                                  {registration.courseDetails?.length || 0} courses
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Registered Courses</DialogTitle>
                                  <DialogDescription>
                                    Courses registered by {registration.student.name} ({registration.student.studentId})
                                    for {registration.semester}, {registration.academicYear}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                  {registration.courseDetails?.map((course: any, index: number) => (
                                    <div key={index} className="p-3 bg-slate-50 rounded flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{course.code}</p>
                                        <p className="text-sm text-muted-foreground">{course.name}</p>
                                      </div>
                                      <Badge>{course.credits || "?"} credits</Badge>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                registration.status === "Approved" ? "default" : 
                                registration.status === "Pending" ? "secondary" : "destructive"
                              }
                            >
                              {registration.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Management Dialog */}
      <Dialog open={isManagingCourses} onOpenChange={setIsManagingCourses}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Course Registration</DialogTitle>
            <DialogDescription>
              {selectedStudent && `Managing courses for ${selectedStudent.name} (${selectedStudent.studentId})`}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Student Information</Label>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {selectedStudent.studentId}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {selectedStudent.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedStudent.email}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Academic Information</Label>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Program:</span> {selectedStudent.program}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {selectedStudent.level}
                    </div>
                    <div>
                      <span className="font-medium">CGPA:</span> {selectedStudent.cgpa.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Course Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <Label className="text-base font-medium">Add Course</Label>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={courseToAdd} onValueChange={setCourseToAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCourses().map((course) => (
                          <SelectItem key={course.code} value={course.code}>
                            {course.code} - {course.name} ({course.credits} credits)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddCourse} disabled={!courseToAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Course
                  </Button>
                </div>
              </div>

              {/* Current Courses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <Label className="text-base font-medium">Enrolled Courses</Label>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getStudentCourses().map((course) => (
                      <TableRow key={course?.id}>
                        <TableCell className="font-medium">{course?.code}</TableCell>
                        <TableCell>{course?.name}</TableCell>
                        <TableCell>{course?.credits}</TableCell>
                        <TableCell>{course?.department}</TableCell>
                        <TableCell>{course?.instructor}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {course?.code} from {selectedStudent.name}'s
                                  registration? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => course && handleRemoveCourse(course.code)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Course
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getStudentCourses().length === 0 && (
                  <p className="text-sm text-muted-foreground">Student is not enrolled in any courses.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingCourses(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditingStudent} onOpenChange={setIsEditingStudent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>Update student details and academic information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-student-id">Student ID</Label>
                <Input
                  id="edit-student-id"
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-student-name">Full Name</Label>
                <Input
                  id="edit-student-name"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-program">Program</Label>
                <Select
                  value={studentForm.program}
                  onValueChange={(value) => setStudentForm({ ...studentForm, program: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select
                  value={studentForm.level}
                  onValueChange={(value) => setStudentForm({ ...studentForm, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-gpa">Current GPA</Label>
                <Input
                  id="edit-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={studentForm.gpa}
                  onChange={(e) => setStudentForm({ ...studentForm, gpa: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-cgpa">Cumulative GPA</Label>
                <Input
                  id="edit-cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={studentForm.cgpa}
                  onChange={(e) => setStudentForm({ ...studentForm, cgpa: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={studentForm.status}
                onValueChange={(value: any) => setStudentForm({ ...studentForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingStudent(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent}>Update Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
