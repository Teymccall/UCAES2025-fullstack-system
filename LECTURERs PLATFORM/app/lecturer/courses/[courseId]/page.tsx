"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
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
import { BookOpen, Users, Save, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StudentService } from "@/lib/student-service"

interface Student {
  id: string
  indexNumber: string
  firstName: string
  lastName: string
  email: string
  level: string
  department: string
  registrationId?: string
}

interface Course {
  id: string
  code: string
  title: string
  credits: number
  level: number
  semester: number
  department: string
  description?: string
}

interface Program {
  id: string
  name: string
  code: string
}

interface StudentGrade {
  id?: string
  studentId: string
  studentName: string
  indexNumber: string
  courseId: string
  courseName: string
  courseCode: string
  lecturerId: string
  academicYearId: string
  academicSemesterId: string
  assessment: number
  midsem: number
  exams: number
  total: number
  grade: string
  status: "pending" | "approved" | "rejected"
  submittedAt?: any
  comments?: string
}

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [lecturerId, setLecturerId] = useState<string>("")
  const [course, setCourse] = useState<Course | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [studentGrades, setStudentGrades] = useState<{[key: string]: StudentGrade}>({})
  const [existingGrades, setExistingGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [academicYearId, setAcademicYearId] = useState<string>("")
  const [academicSemesterId, setAcademicSemesterId] = useState<string>("")
  const [academicYear, setAcademicYear] = useState<string>("")
  const [academicSemester, setAcademicSemester] = useState<string>("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("students")

  // Grade options
  const gradeOptions = ["A", "B+", "B", "C+", "C", "D+", "D", "E", "F"]

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  // Fetch lecturer data
  useEffect(() => {
    if (!currentUser) return
    
    const fetchLecturerData = async () => {
      try {
        // Get lecturer document
        const lecturersRef = collection(db, "users")
        const lecturerQuery = query(lecturersRef, where("email", "==", currentUser.email))
        const lecturerSnapshot = await getDocs(lecturerQuery)
        
        if (lecturerSnapshot.empty) {
          toast({
            title: "Error",
            description: "Lecturer profile not found",
            variant: "destructive",
          })
          return
        }
        
        const lecturerDoc = lecturerSnapshot.docs[0]
        setLecturerId(lecturerDoc.id)
        
        // Now fetch course details and assignment
        await fetchCourseDetails()
      } catch (error) {
        console.error("Error fetching lecturer data:", error)
        toast({
          title: "Error",
          description: "Failed to load lecturer data",
          variant: "destructive",
        })
      }
    }
    
    fetchLecturerData()
  }, [currentUser, courseId, toast])

  // Fetch course details and students
  const fetchCourseDetails = async () => {
    setLoading(true)
    try {
      // Get course details
      const courseDoc = await getDoc(doc(db, "academic-courses", courseId))
      
      if (!courseDoc.exists()) {
        toast({
          title: "Error",
          description: "Course not found",
          variant: "destructive",
        })
        router.push("/lecturer/courses")
        return
      }
      
      const courseData = courseDoc.data() as Course
      setCourse({
        id: courseDoc.id,
        ...courseData
      })
      
      // Get program details if programId exists
      if (courseData.programId) {
        const programDoc = await getDoc(doc(db, "academic-programs", courseData.programId))
        if (programDoc.exists()) {
          setProgram({
            id: programDoc.id,
            ...programDoc.data() as Program
          })
        }
      }
      
      // Get lecturer assignment for this course to get academic year and semester
      const assignmentsRef = collection(db, "lecturer-assignments")
      const assignmentQuery = query(
        assignmentsRef,
        where("courseId", "==", courseId),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      )
      
      const assignmentSnapshot = await getDocs(assignmentQuery)
      
      if (!assignmentSnapshot.empty) {
        const assignmentData = assignmentSnapshot.docs[0].data()
        setAcademicYearId(assignmentData.academicYearId)
        setAcademicSemesterId(assignmentData.academicSemesterId)
        
        // Get academic year and semester names
        const yearDoc = await getDoc(doc(db, "academic-years", assignmentData.academicYearId))
        const semesterDoc = await getDoc(doc(db, "academic-semesters", assignmentData.academicSemesterId))
        
        if (yearDoc.exists()) {
          setAcademicYear(yearDoc.data().name || yearDoc.data().year)
        }
        
        if (semesterDoc.exists()) {
          setAcademicSemester(semesterDoc.data().name)
        }
        
        // Now fetch students registered for this course
        await fetchRegisteredStudents(assignmentData.academicYearId, assignmentData.academicSemesterId)
        
        // Also fetch any existing grades
        await fetchExistingGrades(assignmentData.academicYearId, assignmentData.academicSemesterId)
      } else {
        toast({
          title: "Warning",
          description: "No active assignment found for this course",
        })
      }
      
    } catch (error) {
      console.error("Error fetching course details:", error)
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch students registered for this course
  const fetchRegisteredStudents = async (yearId: string, semesterId: string) => {
    try {
      // First get registrations for this course
      const registrationsRef = collection(db, "course-registrations")
      const registrationsQuery = query(
        registrationsRef,
        where("academicYear", "==", yearId),
        where("semester", "==", semesterId),
        where("status", "==", "approved")
      )
      
      const registrationsSnapshot = await getDocs(registrationsQuery)
      const studentsList: Student[] = []
      
      // For each registration, check if it contains our course
      for (const regDoc of registrationsSnapshot.docs) {
        const registration = regDoc.data()
        
        // Check if this registration includes our course
        const hasCourse = registration.courses && 
                         registration.courses.some((c: any) => 
                           c.courseId === courseId || c.id === courseId)
        
        if (hasCourse) {
          // Get student details
          try {
            const studentDoc = await getDoc(doc(db, "students", registration.studentId))
            
            if (studentDoc.exists()) {
              const studentData = studentDoc.data()
              studentsList.push({
                id: studentDoc.id,
                indexNumber: registration.registrationNumber || studentData.indexNumber || "N/A",
                firstName: studentData.firstName || studentData.name?.split(" ")[0] || "Unknown",
                lastName: studentData.lastName || studentData.name?.split(" ").slice(1).join(" ") || "Student",
                email: studentData.email || registration.email || "N/A",
                level: registration.level || studentData.level || "N/A",
                department: studentData.department || "N/A",
                registrationId: regDoc.id
              })
            }
          } catch (error) {
            console.error("Error fetching student data:", error)
          }
        }
      }
      
      setStudents(studentsList)
      
      // Initialize grade objects for all students
      const initialGrades: {[key: string]: StudentGrade} = {}
      studentsList.forEach(student => {
        initialGrades[student.id] = {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          indexNumber: student.indexNumber,
          courseId: courseId,
          courseName: course?.title || "",
          courseCode: course?.code || "",
          lecturerId: lecturerId,
          academicYearId: yearId,
          academicSemesterId: semesterId,
          assessment: 0,
          midsem: 0,
          exams: 0,
          total: 0,
          grade: "",
          status: "pending"
        }
      })
      
      setStudentGrades(initialGrades)
      
    } catch (error) {
      console.error("Error fetching registered students:", error)
      toast({
        title: "Error",
        description: "Failed to load registered students",
        variant: "destructive",
      })
    }
  }

  // Fetch existing grades
  const fetchExistingGrades = async (yearId: string, semesterId: string) => {
    try {
      const gradesRef = collection(db, "grades")
      const gradesQuery = query(
        gradesRef,
        where("courseId", "==", courseId),
        where("academicYearId", "==", yearId),
        where("academicSemesterId", "==", semesterId),
        where("lecturerId", "==", lecturerId)
      )
      
      const gradesSnapshot = await getDocs(gradesQuery)
      
      if (!gradesSnapshot.empty) {
        const grades = gradesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentGrade[]
        
        setExistingGrades(grades)
        
        // Update student grades with existing data
        const updatedGrades = {...studentGrades}
        grades.forEach(grade => {
          if (updatedGrades[grade.studentId]) {
            updatedGrades[grade.studentId] = {
              ...grade
            }
          }
        })
        
        setStudentGrades(updatedGrades)
      }
    } catch (error) {
      console.error("Error fetching existing grades:", error)
    }
  }

  // Update grade component (assessment, midsem, exam)
  const updateGradeComponent = (studentId: string, field: 'assessment' | 'midsem' | 'exams', value: string) => {
    const numValue = parseFloat(value) || 0
    
    setStudentGrades(prev => {
      const student = {...prev[studentId]}
      student[field] = numValue
      
      // Calculate total and letter grade
      const total = student.assessment + student.midsem + student.exams
      student.total = total
      
      // Assign letter grade based on total
      if (total >= 80) student.grade = "A"
      else if (total >= 75) student.grade = "B+"
      else if (total >= 70) student.grade = "B"
      else if (total >= 65) student.grade = "C+"
      else if (total >= 60) student.grade = "C"
      else if (total >= 55) student.grade = "D+"
      else if (total >= 50) student.grade = "D"
      else if (total >= 45) student.grade = "E"
      else student.grade = "F"
      
      return {
        ...prev,
        [studentId]: student
      }
    })
  }

  // Update letter grade directly
  const updateLetterGrade = (studentId: string, grade: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade
      }
    }))
  }

  // Submit grades
  const handleSubmitGrades = async () => {
    setSubmitting(true)
    
    try {
      const gradesToSubmit: StudentGrade[] = []
      
      // Prepare grades for submission
      Object.values(studentGrades).forEach(grade => {
        // Only include grades that have been entered
        if (grade.assessment > 0 || grade.midsem > 0 || grade.exams > 0 || grade.grade) {
          gradesToSubmit.push({
            ...grade,
            submittedAt: Timestamp.now()
          })
        }
      })
      
      if (gradesToSubmit.length === 0) {
        toast({
          title: "Warning",
          description: "No grades to submit",
        })
        setSubmitting(false)
        return
      }
      
      // Submit grades
      for (const grade of gradesToSubmit) {
        if (grade.id) {
          // Update existing grade
          await updateDoc(doc(db, "grades", grade.id), {
            assessment: grade.assessment,
            midsem: grade.midsem,
            exams: grade.exams,
            total: grade.total,
            grade: grade.grade,
            updatedAt: Timestamp.now()
          })
        } else {
          // Create new grade
          await addDoc(collection(db, "grades"), {
            ...grade,
            submittedAt: Timestamp.now()
          })
        }
      }
      
      toast({
        title: "Success",
        description: `Submitted grades for ${gradesToSubmit.length} students`,
      })
      
      // Refresh existing grades
      await fetchExistingGrades(academicYearId, academicSemesterId)
      
    } catch (error) {
      console.error("Error submitting grades:", error)
      toast({
        title: "Error",
        description: "Failed to submit grades",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  // Filter students by search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return fullName.includes(searchLower) || 
           student.indexNumber.toLowerCase().includes(searchLower) ||
           student.email.toLowerCase().includes(searchLower)
  })

  // Define the columns for the students table
  const studentColumns = [
    {
      key: "indexNumber",
      label: "Index Number",
      sortable: true,
    },
    {
      key: "firstName",
      label: "First Name",
      sortable: true,
    },
    {
      key: "lastName",
      label: "Last Name",
      sortable: true,
    },
    {
      key: "level",
      label: "Level",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    }
  ]

  const handleViewStudent = (student: Student) => {
    // Navigate to the grade submission page with this student pre-selected
    setActiveTab("grades")
    setSearchTerm(student.indexNumber)
  }
  
  const handleAssignGrade = (student: Student) => {
    // Navigate to the grade submission tab
    setActiveTab("grades")
    
    // Pre-fill the grade for this specific student
    const gradesCopy = { ...studentGrades }
    if (!gradesCopy[student.id]) {
      gradesCopy[student.id] = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        indexNumber: student.indexNumber,
        courseId: courseId,
        courseName: course?.title || "",
        courseCode: course?.code || "",
        lecturerId: lecturerId,
        academicYearId: academicYearId,
        academicSemesterId: academicSemesterId,
        assessment: 0,
        midsem: 0,
        exams: 0,
        total: 0,
        grade: "",
        status: "pending"
      }
    }
    
    setStudentGrades(gradesCopy)
    setSearchTerm(student.indexNumber)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back button and course info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/lecturer/courses" className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          <h1 className="text-2xl font-bold">{course?.code}: {course?.title}</h1>
          <p className="text-gray-500">
            {program?.name} • Level {course?.level} • {academicYear} • {academicSemester}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1">
            {students.length} Students Registered
          </Badge>
          <Badge variant="outline" className="text-sm py-1">
            {existingGrades.length} Grades Submitted
          </Badge>
        </div>
      </div>
      
      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Registered Students
          </TabsTrigger>
          <TabsTrigger value="grades">
            <BookOpen className="h-4 w-4 mr-2" />
            Grade Submission
          </TabsTrigger>
        </TabsList>
        
        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Students</CardTitle>
              <CardDescription>
                Students registered for {course?.code}: {course?.title} in {academicSemester} {academicYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : (
                <EnhancedDataTable
                  data={students}
                  columns={studentColumns}
                  title="Registered Students"
                  searchPlaceholder="Search students by name, ID..."
                  loading={loading}
                  onView={handleViewStudent}
                  onAdminAction={(student, action) => {
                    if (action === 'assign-grade') {
                      handleAssignGrade(student);
                    }
                  }}
                  filters={[
                    {
                      key: "level",
                      label: "Level",
                      options: [
                        { value: "100", label: "Level 100" },
                        { value: "200", label: "Level 200" },
                        { value: "300", label: "Level 300" },
                        { value: "400", label: "Level 400" }
                      ]
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Submission</CardTitle>
              <CardDescription>
                Submit grades for students registered in {course?.code}: {course?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  {searchTerm ? "No students match your search" : "No students registered for this course"}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Index Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Assessment (30%)</TableHead>
                        <TableHead className="text-center">Mid-Sem (20%)</TableHead>
                        <TableHead className="text-center">Exams (50%)</TableHead>
                        <TableHead className="text-center">Total (100%)</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const studentGrade = studentGrades[student.id]
                        return (
                          <TableRow key={student.id}>
                            <TableCell>{student.indexNumber}</TableCell>
                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                value={studentGrade?.assessment || ""}
                                onChange={(e) => updateGradeComponent(student.id, 'assessment', e.target.value)}
                                className="w-20 mx-auto text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={studentGrade?.midsem || ""}
                                onChange={(e) => updateGradeComponent(student.id, 'midsem', e.target.value)}
                                className="w-20 mx-auto text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="50"
                                value={studentGrade?.exams || ""}
                                onChange={(e) => updateGradeComponent(student.id, 'exams', e.target.value)}
                                className="w-20 mx-auto text-center"
                              />
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {studentGrade?.total || 0}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={studentGrade?.grade || ""}
                                onValueChange={(value) => updateLetterGrade(student.id, value)}
                              >
                                <SelectTrigger className="w-20 mx-auto text-center">
                                  <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                  {gradeOptions.map((grade) => (
                                    <SelectItem key={grade} value={grade}>
                                      {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => setShowConfirmDialog(true)}
                disabled={loading || submitting || filteredStudents.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Grades
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Grade Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit these grades? This action will update any existing grades for these students.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Once submitted, grades will be recorded in the system and visible to administrators.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrades} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 