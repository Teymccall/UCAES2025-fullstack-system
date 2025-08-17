"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { auth } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { StudentService } from "@/lib/student-service"
import { CheckCircle, AlertTriangle, Eye, Send } from "lucide-react"

interface AcademicYear {
  id: string
  year: string
  name: string
  status: string
}

interface AcademicSemester {
  id: string
  name: string
  academicYearId: string
  status: string
}

interface Course {
  id: string
  code: string
  title: string
  name: string
  credits: number
}

interface LecturerAssignment {
  id: string
  lecturerId: string
  courseId: string
  academicYearId: string
  academicSemesterId: string
  academicYear: string
  semester: string
  status: string
}

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  email: string
  level: string
  program: string
}

interface StudentGrade {
  studentId: string
  student: Student
  assessment: number | string
  midsem: number | string
  exams: number | string
  total: number
  grade: string
  isSubmitted?: boolean
  submissionStatus?: 'pending_approval' | 'approved' | 'published'
  submittedAt?: string
}

interface ExistingSubmission {
  id: string
  submissionId: string
  status: string
  submittedAt: string
  grades: any[]
}

export default function NewGradeSubmissionPage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [currentLecturerId, setCurrentLecturerId] = useState("")
  const [assignments, setAssignments] = useState<LecturerAssignment[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicSemesters, setAcademicSemesters] = useState<AcademicSemester[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  
  // Selection state
  const [selectedYearId, setSelectedYearId] = useState("")
  const [selectedSemesterId, setSelectedSemesterId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  
  // Student state
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [isStudentsLoading, setIsStudentsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Preview and submission state
  const [showPreview, setShowPreview] = useState(false)
  const [existingSubmissions, setExistingSubmissions] = useState<ExistingSubmission[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  


  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        window.location.href = "/login"
      }
    })
    return () => unsubscribe()
  }, [])

  // Fetch lecturer data on component mount
  useEffect(() => {
    if (currentUser) {
      fetchLecturerData()
    }
  }, [currentUser])

  const fetchLecturerData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Fetching lecturer data...")
      
      // Get lecturer document
      const lecturersRef = collection(db, "users")
      const lecturerQuery = query(lecturersRef, where("email", "==", currentUser.email))
      const lecturerSnapshot = await getDocs(lecturerQuery)
      
      if (lecturerSnapshot.empty) {
        console.log("❌ No lecturer found with email:", currentUser.email)
        setIsLoading(false)
        return
      }
      
      const lecturerId = lecturerSnapshot.docs[0].id
      setCurrentLecturerId(lecturerId)
      console.log("✅ Lecturer ID:", lecturerId)
      
      // Fetch assignments
      const assignmentsRef = collection(db, "lecturer-assignments")
      const assignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId))
      const assignmentsSnapshot = await getDocs(assignmentsQuery)
      
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as LecturerAssignment)
      
      setAssignments(assignmentsData)
      console.log("📋 Lecturer assignments:", assignmentsData.length)
      
      // Fetch academic years
      const yearsRef = collection(db, "academic-years")
      const yearsSnapshot = await getDocs(yearsRef)
      
      const yearsData = yearsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as AcademicYear)
      
      setAcademicYears(yearsData)
      console.log("📅 Academic years:", yearsData.length)
      
      // Fetch academic semesters
      const semestersRef = collection(db, "academic-semesters")
      const semestersSnapshot = await getDocs(semestersRef)
      
      const semestersData = semestersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as AcademicSemester)
      
      setAcademicSemesters(semestersData)
      console.log("📚 Academic semesters:", semestersData.length)
      
      // Fetch courses
      const coursesRef = collection(db, "academic-courses")
      const coursesSnapshot = await getDocs(coursesRef)
      
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Course)
      
      setCourses(coursesData)
      console.log("📖 Academic courses:", coursesData.length)
      
             // Set default selections from assigned data
       if (assignmentsData.length > 0) {
         const assignedYearIds = [...new Set(assignmentsData.map(a => a.academicYearId))]
         if (assignedYearIds.length > 0) {
           const defaultYearId = assignedYearIds[0]
           setSelectedYearId(defaultYearId)
           console.log("🎯 Setting default year ID:", defaultYearId)
           
           // Find semesters for this year
           const yearAssignments = assignmentsData.filter(a => a.academicYearId === defaultYearId)
           if (yearAssignments.length > 0) {
             const defaultSemesterId = yearAssignments[0].academicSemesterId
             setSelectedSemesterId(defaultSemesterId)
             console.log("🎯 Setting default semester ID:", defaultSemesterId)
           }
         }
       }
      
    } catch (error) {
      console.error("❌ Error fetching lecturer data:", error)
      toast({
        title: "Error",
        description: "Failed to load lecturer data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique academic years from lecturer assignments
  const assignedAcademicYears = [...new Set(assignments.map(a => a.academicYearId))].map(yearId => {
    const year = academicYears.find(y => y.id === yearId)
    return year ? { id: year.id, year: year.year || year.name, name: year.name } : null
  }).filter(Boolean) as AcademicYear[]

  // Get unique semesters from lecturer assignments for selected year
  const assignedSemesters = [...new Set(
    assignments
      .filter(a => !selectedYearId || a.academicYearId === selectedYearId)
      .map(a => a.academicSemesterId)
  )].map(semesterId => {
    const semester = academicSemesters.find(s => s.id === semesterId)
    return semester ? { id: semester.id, name: semester.name, academicYearId: semester.academicYearId } : null
  }).filter(Boolean) as AcademicSemester[]

  // Get available courses for the selected year/semester (only assigned courses)
  const availableCourses = assignments
    .filter(assignment => {
      const yearMatch = !selectedYearId || assignment.academicYearId === selectedYearId
      const semesterMatch = !selectedSemesterId || assignment.academicSemesterId === selectedSemesterId
      return yearMatch && semesterMatch
    })
    .map(assignment => {
      const course = courses.find(c => c.id === assignment.courseId)
      return course ? { ...course, assignmentId: assignment.id } : null
    })
    .filter(Boolean) as (Course & { assignmentId: string })[]

  // Auto-select first course when year/semester changes
  useEffect(() => {
    if (selectedYearId && selectedSemesterId && availableCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(availableCourses[0].id)
      console.log("🎯 Auto-selecting course:", availableCourses[0].title || availableCourses[0].code)
    }
  }, [selectedYearId, selectedSemesterId, availableCourses, selectedCourseId])

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourseId && selectedYearId && selectedSemesterId && currentLecturerId) {
      fetchStudentsForCourse()
      checkExistingSubmissions()
    }
  }, [selectedCourseId, selectedYearId, selectedSemesterId, currentLecturerId])

  const checkExistingSubmissions = async () => {
    try {
      console.log("🔍 Checking for existing grade submissions...")
      
      const selectedCourse = courses.find(c => c.id === selectedCourseId)
      const selectedYear = academicYears.find(y => y.id === selectedYearId)
      const selectedSemester = academicSemesters.find(s => s.id === selectedSemesterId)
      
      if (!selectedCourse || !selectedYear || !selectedSemester) return
      
      const courseCode = selectedCourse.code || selectedCourse.title || selectedCourseId
      const academicYear = selectedYear.year || selectedYear.name
      const semester = selectedSemester.name
      
      // Query existing submissions
      const submissionsRef = collection(db, "grade-submissions")
      const submissionsQuery = query(
        submissionsRef,
        where("submittedBy", "==", currentLecturerId),
        where("courseCode", "==", courseCode),
        where("academicYear", "==", academicYear),
        where("semester", "==", semester)
      )
      
      const submissionsSnapshot = await getDocs(submissionsQuery)
      const existingSubmissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExistingSubmission[]
      
      setExistingSubmissions(existingSubmissionsData)
      console.log("📋 Found existing submissions:", existingSubmissionsData.length)
      
    } catch (error) {
      console.error("❌ Error checking existing submissions:", error)
    }
  }

  const fetchStudentsForCourse = async () => {
    setIsStudentsLoading(true)
    try {
      console.log("🔍 Fetching students for course...")
      
      // Get course details
      const selectedCourse = courses.find(c => c.id === selectedCourseId)
      if (!selectedCourse) {
        console.log("❌ Course not found:", selectedCourseId)
        return
      }
      
             // Extract course code - try multiple sources
       let courseCode = selectedCourse.code || selectedCourseId
       
       // If no code, try to extract from title
       if (!courseCode && selectedCourse.title) {
         const titleParts = selectedCourse.title.split(' - ')
         if (titleParts.length > 0) {
           courseCode = titleParts[0].trim()
         }
       }
       
       // If still no code, try to extract from name
       if (!courseCode && selectedCourse.name) {
         const nameParts = selectedCourse.name.split(' - ')
         if (nameParts.length > 0) {
           courseCode = nameParts[0].trim()
         }
       }
       
       // If we still don't have a proper course code, use the course ID as fallback
       if (!courseCode || courseCode === selectedCourseId) {
         courseCode = selectedCourseId
       }
       
       console.log("🔍 Course code extraction:", {
         originalCode: selectedCourse.code,
         originalTitle: selectedCourse.title,
         originalName: selectedCourse.name,
         extractedCode: courseCode,
         courseId: selectedCourseId
       })
      
      // Get academic year and semester details
      const selectedYear = academicYears.find(year => year.id === selectedYearId)
      const selectedSemester = academicSemesters.find(sem => sem.id === selectedSemesterId)
      
      const academicYear = selectedYear?.year || selectedYear?.name || "2026-2027"
      const semester = selectedSemester?.name || "1"
      
             console.log("🔍 Search parameters:", {
         courseCode,
         academicYear,
         semester,
         lecturerId: currentLecturerId
       })
       
               // Debug: Log all assignments for this lecturer
        console.log("📋 All assignments for lecturer:", assignments.map(a => ({
          id: a.id,
          courseId: a.courseId,
          academicYear: a.academicYear,
          semester: a.semester,
          courseTitle: courses.find(c => c.id === a.courseId)?.title,
          courseCode: courses.find(c => c.id === a.courseId)?.code,
          courseName: courses.find(c => c.id === a.courseId)?.name
        })))
       
       // Debug: Log all available courses
       console.log("📚 Available courses:", availableCourses.map(c => ({
         id: c.id,
         title: c.title,
         code: c.code,
         name: c.name
       })))
       
       // Debug: Log selected course details
       console.log("🎯 Selected course details:", {
         id: selectedCourse.id,
         title: selectedCourse.title,
         code: selectedCourse.code,
         name: selectedCourse.name
       })
      
      
      
      // Fetch students
      const students = await StudentService.getStudentsForCourse(
        courseCode,
        academicYear,
        semester,
        currentLecturerId
      )
      
      console.log("✅ Found students:", students.length)
      
      // Create grade entries and check for existing submissions
      const gradeEntries = students.map(student => {
        // Check if this student has already been graded in any existing submission
        let isSubmitted = false
        let submissionStatus: 'pending_approval' | 'approved' | 'published' | undefined
        let submittedAt: string | undefined
        
        for (const submission of existingSubmissions) {
          const existingGrade = submission.grades?.find(g => g.studentId === student.id)
          if (existingGrade) {
            isSubmitted = true
            submissionStatus = submission.status as 'pending_approval' | 'approved' | 'published'
            submittedAt = submission.submittedAt
            break
          }
        }
        
        return {
          studentId: student.id,
          student,
          assessment: '',
          midsem: '',
          exams: '',
          total: 0,
          grade: '',
          isSubmitted,
          submissionStatus,
          submittedAt
        }
      })
      
      setStudentGrades(gradeEntries)
      
    } catch (error) {
      console.error("❌ Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setIsStudentsLoading(false)
    }
  }

  const updateGradeComponent = (studentId: string, field: 'assessment' | 'midsem' | 'exams', value: string) => {
    setStudentGrades(prev => prev.map(sg => {
      if (sg.studentId !== studentId) return sg
      
      let assessment = sg.assessment
      let midsem = sg.midsem
      let exams = sg.exams
      
      // Handle empty string or convert to number with bounds
      if (field === 'assessment') {
        assessment = value === '' ? '' : Math.max(0, Math.min(10, Number(value) || 0))
      }
      if (field === 'midsem') {
        midsem = value === '' ? '' : Math.max(0, Math.min(20, Number(value) || 0))
      }
      if (field === 'exams') {
        exams = value === '' ? '' : Math.max(0, Math.min(70, Number(value) || 0))
      }
      
      // Calculate total only if we have numeric values
      const assessmentNum = Number(assessment) || 0
      const midsemNum = Number(midsem) || 0
      const examsNum = Number(exams) || 0
      const total = assessmentNum + midsemNum + examsNum
      
      // Only assign grade if at least one component has a value
      let grade = ''
      if (assessment !== '' || midsem !== '' || exams !== '') {
        if (total >= 80) grade = 'A'
        else if (total >= 75) grade = 'B+'
        else if (total >= 70) grade = 'B'
        else if (total >= 65) grade = 'C+'
        else if (total >= 60) grade = 'C'
        else if (total >= 55) grade = 'D+'
        else if (total >= 50) grade = 'D'
        else if (total >= 45) grade = 'E'
        else grade = 'F'
      }
      
      return { ...sg, assessment, midsem, exams, total, grade }
    }))
  }

  const filteredStudents = studentGrades.filter(sg =>
    (sg.student.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sg.student.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sg.student.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGradesToSubmit = () => {
    const selectedCourse = courses.find(c => c.id === selectedCourseId)
    const selectedYear = academicYears.find(y => y.id === selectedYearId)
    const selectedSemester = academicSemesters.find(s => s.id === selectedSemesterId)
    
    return studentGrades
      .filter(sg => !sg.isSubmitted && (
        (typeof sg.assessment === 'number' && sg.assessment > 0) || 
        (typeof sg.assessment === 'string' && sg.assessment !== '') ||
        (typeof sg.midsem === 'number' && sg.midsem > 0) || 
        (typeof sg.midsem === 'string' && sg.midsem !== '') ||
        (typeof sg.exams === 'number' && sg.exams > 0) || 
        (typeof sg.exams === 'string' && sg.exams !== '')
      ))
      .map(sg => ({
        ...sg,
        assessment: Number(sg.assessment) || 0,
        midsem: Number(sg.midsem) || 0,
        exams: Number(sg.exams) || 0,
        courseId: selectedCourse?.id || '',
        courseCode: selectedCourse?.code || '',
        courseName: selectedCourse?.title || selectedCourse?.name || '',
        academicYear: selectedYear?.year || selectedYear?.name || '',
        semester: selectedSemester?.name || '',
        lecturerId: currentLecturerId,
        studentName: `${sg.student.firstName} ${sg.student.lastName}`,
        registrationNumber: sg.student.registrationNumber
      }))
  }

  const handlePreviewGrades = () => {
    const gradesToSubmit = getGradesToSubmit()
    if (gradesToSubmit.length === 0) {
      toast({
        title: "No grades to preview",
        description: "Please enter grades for at least one student",
        variant: "destructive",
      })
      return
    }
    setShowPreview(true)
  }

  const handleSubmitGrades = async () => {
    const gradesToSubmit = getGradesToSubmit()
    if (gradesToSubmit.length === 0) {
      toast({
        title: "No grades to submit",
        description: "Please enter grades for at least one student",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log("📤 Submitting grades:", gradesToSubmit.length)
      const success = await StudentService.submitGrades(gradesToSubmit)
      
      if (success) {
        toast({
          title: "Success",
          description: `Submitted ${gradesToSubmit.length} grade(s) successfully to Academic Affairs for approval`,
        })
        setShowPreview(false)
        // Refresh data
        await checkExistingSubmissions()
        await fetchStudentsForCourse()
      } else {
        toast({
          title: "Error",
          description: "Failed to submit grades",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("❌ Error submitting grades:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit grades",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading lecturer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Grade Submission</h1>
        <Badge variant="outline" className="text-sm">
          {currentUser?.email}
        </Badge>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Course Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                                 <SelectContent>
                   {assignedAcademicYears.map(year => (
                     <SelectItem key={year.id} value={year.id}>
                       {year.year || year.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Semester</label>
              <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                                 <SelectContent>
                   {assignedSemesters.map(semester => (
                     <SelectItem key={semester.id} value={semester.id}>
                       {semester.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title || course.code || course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedCourseId && (
            <Alert>
              <AlertDescription>
                <strong>Selected Course:</strong> {courses.find(c => c.id === selectedCourseId)?.title || selectedCourseId}
                <br />
                <strong>Students Found:</strong> {studentGrades.length}
                <br />
                <strong>Academic Year:</strong> {academicYears.find(y => y.id === selectedYearId)?.year || selectedYearId}
                <br />
                <strong>Semester:</strong> {academicSemesters.find(s => s.id === selectedSemesterId)?.name || selectedSemesterId}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Existing Submissions Alert */}
      {existingSubmissions.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Existing Submissions Found:</strong> You have {existingSubmissions.length} previous grade submission(s) for this course. 
            Students with already submitted grades are marked and cannot be resubmitted.
            <div className="mt-2 space-y-1">
              {existingSubmissions.map((submission, index) => (
                <div key={submission.id} className="text-xs">
                  • Submission {index + 1}: {submission.grades?.length || 0} students - 
                  <Badge variant={
                    submission.status === 'published' ? 'default' : 
                    submission.status === 'approved' ? 'secondary' : 'destructive'
                  } className="ml-1 text-xs">
                    {submission.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Student Grades */}
      {selectedCourseId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Student Grades</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button onClick={handlePreviewGrades} disabled={getGradesToSubmit().length === 0} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Grades ({getGradesToSubmit().length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isStudentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2">Loading students...</p>
              </div>
            ) : studentGrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found for this course
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Assessment (10%)</TableHead>
                      <TableHead>Mid-Semester (20%)</TableHead>
                      <TableHead>Exams (70%)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((studentGrade, index) => (
                      <TableRow key={`${studentGrade.studentId}-${index}`}>
                        <TableCell className="font-medium">
                          {studentGrade.student.registrationNumber}
                        </TableCell>
                        <TableCell>
                          {studentGrade.student.firstName} {studentGrade.student.lastName}
                        </TableCell>
                        <TableCell>{studentGrade.student.program}</TableCell>
                        <TableCell>{studentGrade.student.level}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={studentGrade.assessment}
                            onChange={e => updateGradeComponent(studentGrade.studentId, 'assessment', e.target.value)}
                            className="w-20"
                            disabled={studentGrade.isSubmitted}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            step={0.1}
                            value={studentGrade.midsem}
                            onChange={e => updateGradeComponent(studentGrade.studentId, 'midsem', e.target.value)}
                            className="w-20"
                            disabled={studentGrade.isSubmitted}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={70}
                            step={0.1}
                            value={studentGrade.exams}
                            onChange={e => updateGradeComponent(studentGrade.studentId, 'exams', e.target.value)}
                            className="w-20"
                            disabled={studentGrade.isSubmitted}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{studentGrade.total}</TableCell>
                        <TableCell>
                          <Badge variant={studentGrade.grade === 'F' ? 'destructive' : 'default'}>
                            {studentGrade.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {studentGrade.isSubmitted ? (
                            <div className="space-y-1">
                              <Badge variant={
                                studentGrade.submissionStatus === 'published' ? 'default' : 
                                studentGrade.submissionStatus === 'approved' ? 'secondary' : 'destructive'
                              } className="text-xs">
                                {studentGrade.submissionStatus?.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Submitted
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Not Submitted
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grade Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Grade Submission Preview
            </DialogTitle>
            <DialogDescription>
              Review the grades before submitting to Academic Affairs for approval.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Course Information */}
            <Alert>
              <AlertDescription>
                <strong>Course:</strong> {courses.find(c => c.id === selectedCourseId)?.title || selectedCourseId}
                <br />
                <strong>Academic Year:</strong> {academicYears.find(y => y.id === selectedYearId)?.year || selectedYearId}
                <br />
                <strong>Semester:</strong> {academicSemesters.find(s => s.id === selectedSemesterId)?.name || selectedSemesterId}
                <br />
                <strong>Total Students:</strong> {getGradesToSubmit().length}
              </AlertDescription>
            </Alert>

            {/* Grades Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Mid-Semester</TableHead>
                    <TableHead>Exams</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getGradesToSubmit().map((grade, index) => (
                    <TableRow key={`preview-${grade.studentId}-${index}`}>
                      <TableCell className="font-medium">{grade.registrationNumber}</TableCell>
                      <TableCell>{grade.studentName}</TableCell>
                      <TableCell>{Number(grade.assessment) || 0}/10</TableCell>
                      <TableCell>{Number(grade.midsem) || 0}/20</TableCell>
                      <TableCell>{Number(grade.exams) || 0}/70</TableCell>
                      <TableCell className="font-medium">{grade.total}/100</TableCell>
                      <TableCell>
                        <Badge variant={grade.grade === 'F' ? 'destructive' : 'default'}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Grade Distribution Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F'].map(gradeLevel => {
                const count = getGradesToSubmit().filter(g => g.grade === gradeLevel).length
                return count > 0 ? (
                  <div key={gradeLevel} className="text-center p-2 border rounded">
                    <div className="font-bold text-lg">{count}</div>
                    <div className="text-sm text-gray-600">Grade {gradeLevel}</div>
                  </div>
                ) : null
              }).filter(Boolean)}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrades} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit to Academic Affairs
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 