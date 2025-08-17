"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RouteGuard } from "@/components/route-guard"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Search, Eye, Users, GraduationCap, TrendingUp, Loader2, AlertCircle, RefreshCw, FileText } from "lucide-react"

interface Student {
  id: string
  name: string
  registrationNumber: string
  studentId: string
  email: string
  programme: string
  program: string
  level: string
  yearOfAdmission: number
  status: string
  gpa?: number
  cgpa?: number
  semester?: string
  enrolledCourses?: string[]
  createdAt?: any
}

interface StudentGrade {
  id: string
  studentId: string
  registrationNumber: string
  studentName: string
  courseCode: string
  courseName: string
  courseTitle: string
  academicYear: string
  semester: string
  programme: string
  assessment: number
  midsem: number
  exams: number
  total: number
  grade: string
  status: string
  submittedBy?: string
  submittedAt?: any
}

function StudentRecordsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State management
  const [students, setStudents] = useState<Student[]>([])
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Load students from Firebase
  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Loading students from Firebase...")

      // Try multiple collections where students might be stored
      const studentCollections = ['students', 'users', 'student-registrations', 'academic-students']
      let allStudents: Student[] = []

      for (const collectionName of studentCollections) {
        try {
          console.log(`Checking collection: ${collectionName}`)
          const studentsRef = collection(db, collectionName)
          const studentsQuery = query(studentsRef, limit(100))
          const studentsSnapshot = await getDocs(studentsQuery)
          
          console.log(`Found ${studentsSnapshot.size} documents in ${collectionName}`)
          
          studentsSnapshot.forEach(doc => {
            const data = doc.data()
            
            // Check if this looks like a student record
            const hasStudentFields = data.registrationNumber || data.studentId || data.indexNumber || 
                                   data.programme || data.program || data.level || data.yearOfAdmission
            
            if (hasStudentFields) {
              const student: Student = {
                id: doc.id,
                name: data.name || data.firstName || data.surname || 
                      `${data.firstName || ''} ${data.surname || ''}`.trim() || 
                      `${data.surname || ''} ${data.otherNames || ''}`.trim() || 
                      'Unknown Student',
                registrationNumber: data.registrationNumber || data.indexNumber || data.studentId || data.studentNumber || doc.id,
                studentId: data.studentId || data.registrationNumber || data.indexNumber || doc.id,
                email: data.email || `${data.registrationNumber || doc.id}@student.ucaes.edu.gh`,
                programme: data.programme || data.program || data.course || 'Unknown Programme',
                program: data.program || data.programme || data.course || 'Unknown Programme',
                level: data.level || data.currentLevel || data.year || '100',
                yearOfAdmission: data.yearOfAdmission || data.admissionYear || new Date().getFullYear(),
                status: data.status || 'active',
                gpa: data.gpa || data.currentGPA || 0,
                cgpa: data.cgpa || data.cumulativeGPA || data.CGPA || 0,
                semester: data.semester || data.currentSemester || 'First',
                enrolledCourses: data.enrolledCourses || data.courses || [],
                createdAt: data.createdAt
              }
              
              // Avoid duplicates
              if (!allStudents.find(s => s.registrationNumber === student.registrationNumber)) {
                allStudents.push(student)
              }
            }
          })
        } catch (error) {
          console.warn(`Error accessing ${collectionName}:`, error)
        }
      }

      console.log(`Total students loaded: ${allStudents.length}`)
      setStudents(allStudents)

      // Load student grades
      await loadStudentGrades()

    } catch (error) {
      console.error("Error loading students:", error)
      setError("Failed to load student records. Please try again.")
      toast({
        title: "Error Loading Students",
        description: "Failed to load student records from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load student grades from Firebase
  const loadStudentGrades = async () => {
    try {
      console.log("Loading student grades...")
      
      // Check student-grades collection
      const gradesRef = collection(db, 'student-grades')
      const gradesQuery = query(gradesRef, limit(500))
      const gradesSnapshot = await getDocs(gradesQuery)
      
      const grades: StudentGrade[] = []
      gradesSnapshot.forEach(doc => {
        const data = doc.data()
        grades.push({
          id: doc.id,
          studentId: data.studentId || '',
          registrationNumber: data.registrationNumber || '',
          studentName: data.studentName || '',
          courseCode: data.courseCode || '',
          courseName: data.courseName || data.courseTitle || '',
          courseTitle: data.courseTitle || data.courseName || '',
          academicYear: data.academicYear || '',
          semester: data.semester || '',
          programme: data.programme || data.program || '',
          assessment: data.assessment || 0,
          midsem: data.midsem || 0,
          exams: data.exams || 0,
          total: data.total || 0,
          grade: data.grade || '',
          status: data.status || 'pending',
          submittedBy: data.submittedBy,
          submittedAt: data.submittedAt
        })
      })

      console.log(`Loaded ${grades.length} student grades`)
      setStudentGrades(grades)

    } catch (error) {
      console.error("Error loading student grades:", error)
    }
  }

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.programme.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProgram = selectedProgram === "all" || 
      student.programme === selectedProgram || 
      student.program === selectedProgram

    const matchesLevel = selectedLevel === "all" || student.level === selectedLevel

    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus

    return matchesSearch && matchesProgram && matchesLevel && matchesStatus
  })

  // Get unique values for filters
  const programs = Array.from(new Set(students.map(student => student.programme || student.program).filter(Boolean)))
  const levels = Array.from(new Set(students.map(student => student.level).filter(Boolean)))
  const statuses = Array.from(new Set(students.map(student => student.status).filter(Boolean)))

  // Get student results
  const getStudentResults = (studentId: string, registrationNumber: string) => {
    return studentGrades.filter(grade => 
      grade.studentId === studentId || 
      grade.registrationNumber === registrationNumber
    )
  }

  // Calculate statistics
  const statistics = {
    total: filteredStudents.length,
    active: filteredStudents.filter(s => s.status === 'active').length,
    programs: programs.length,
    averageGPA: filteredStudents.length > 0 ? 
      filteredStudents.reduce((sum, s) => sum + (s.cgpa || 0), 0) / filteredStudents.length : 0
  }

  // Load data on component mount
  useEffect(() => {
    loadStudents()
  }, [])

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Student Records
          </h1>
          <p className="text-muted-foreground">View and manage student academic records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadStudents} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {filteredStudents.length > 0 && (
            <Badge variant="secondary">
              {filteredStudents.length} of {students.length} students
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.programs}</div>
            <p className="text-xs text-muted-foreground">Different programs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.averageGPA.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Student Records Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Student Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registration number, email, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading student records...</p>
            </div>
          ) : (
            <>
              {/* Students Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.registrationNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.programme}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {student.level}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className={`px-2 py-1 rounded text-sm ${
                            (student.cgpa || 0) >= 3.5 ? 'bg-green-100 text-green-800' :
                            (student.cgpa || 0) >= 3.0 ? 'bg-blue-100 text-blue-800' :
                            (student.cgpa || 0) >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(student.cgpa || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedStudent(student)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {student.name} ({student.registrationNumber})
                                </DialogTitle>
                                <DialogDescription>
                                  Complete academic record and performance history
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                {/* Student Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-3 text-lg">Student Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Registration Number:</span>
                                        <span>{student.registrationNumber}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Student ID:</span>
                                        <span>{student.studentId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Email:</span>
                                        <span>{student.email}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Program:</span>
                                        <span>{student.programme}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Level:</span>
                                        <span>{student.level}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Year of Admission:</span>
                                        <span>{student.yearOfAdmission}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-3 text-lg">Academic Performance</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Current GPA:</span>
                                        <span className="font-bold">{(student.gpa || 0).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Cumulative GPA:</span>
                                        <span className="font-bold">{(student.cgpa || 0).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Current Semester:</span>
                                        <span>{student.semester}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Status:</span>
                                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                          {student.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Academic Results */}
                                <div>
                                  <h4 className="font-semibold mb-3 text-lg">Academic Results</h4>
                                  {(() => {
                                    const results = getStudentResults(student.studentId, student.registrationNumber)
                                    return results.length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Course</TableHead>
                                              <TableHead>Academic Year</TableHead>
                                              <TableHead>Semester</TableHead>
                                              <TableHead className="text-center">Assessment</TableHead>
                                              <TableHead className="text-center">Mid-Semester</TableHead>
                                              <TableHead className="text-center">Final Exam</TableHead>
                                              <TableHead className="text-center">Total</TableHead>
                                              <TableHead className="text-center">Grade</TableHead>
                                              <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {results.map((result) => (
                                              <TableRow key={result.id}>
                                                <TableCell>
                                                  <div>
                                                    <div className="font-medium">{result.courseCode}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {result.courseName || result.courseTitle}
                                                    </div>
                                                  </div>
                                                </TableCell>
                                                <TableCell>{result.academicYear}</TableCell>
                                                <TableCell>{result.semester}</TableCell>
                                                <TableCell className="text-center">{result.assessment}/10</TableCell>
                                                <TableCell className="text-center">{result.midsem}/20</TableCell>
                                                <TableCell className="text-center">{result.exams}/70</TableCell>
                                                <TableCell className="text-center font-bold">
                                                  <span className={`px-2 py-1 rounded text-sm ${
                                                    result.total >= 80 ? 'bg-green-100 text-green-800' :
                                                    result.total >= 70 ? 'bg-blue-100 text-blue-800' :
                                                    result.total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    result.total >= 50 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                  }`}>
                                                    {result.total}%
                                                  </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                  <Badge className={`${
                                                    result.grade === 'A' ? 'bg-green-600 text-white' :
                                                    result.grade === 'B' ? 'bg-blue-600 text-white' :
                                                    result.grade === 'C' ? 'bg-yellow-600 text-white' :
                                                    result.grade === 'D' ? 'bg-orange-600 text-white' :
                                                    'bg-red-600 text-white'
                                                  }`}>
                                                    {result.grade}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                  <Badge variant={
                                                    result.status === "published" ? "default" :
                                                    result.status === "approved" ? "secondary" :
                                                    "outline"
                                                  }>
                                                    {result.status}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p>No academic results found for this student</p>
                                        <p className="text-sm">Results will appear here once grades are published</p>
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Empty State */}
              {filteredStudents.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground mb-4">
                    {students.length === 0 
                      ? "No student records are available in the database"
                      : "No students match your current search criteria"
                    }
                  </p>
                  {students.length === 0 && (
                    <Button onClick={loadStudents} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function StudentRecordsPage() {
  return (
    <RouteGuard requiredPermissions={["student_records"]}>
      <StudentRecordsContent />
    </RouteGuard>
  )
}