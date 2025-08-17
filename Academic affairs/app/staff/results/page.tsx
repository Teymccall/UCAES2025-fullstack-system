"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

import { Search, Eye, Check, X, Loader2, Download, RefreshCw, AlertCircle, CheckCircle, Clock, FileText, Users, TrendingUp } from "lucide-react"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from "@/hooks/use-toast"
import { RouteGuard } from "@/components/route-guard"
import { useAuth } from "@/components/auth-context"

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  academicYear: string;
  semester: string;
  lecturerId: string;
  assessment: number;
  midsem: number;
  exams: number;
  total: number;
  grade: string;
  status: 'submitted' | 'approved' | 'published';
  submittedAt?: Date;
  submittedBy?: string;
  approvedBy?: string;
  publishedBy?: string;
}

interface PendingResult {
  id: string;
  courseId: string;
  course: string;
  courseCode: string;
  lecturerId: string;
  lecturerName: string;
  lecturerDepartment?: string;
  submittedDate: string;
  studentsCount: number;
  status: string;
  semester: string;
  academicYear: string;
  programId?: string;
  programName?: string;
  programType?: string;
  studyMode?: string;
  grades: Grade[];
}

function ResultApprovals() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<PendingResult | null>(null)
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([])
  const [publishedResults, setPublishedResults] = useState<PendingResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [studentInfo, setStudentInfo] = useState<{[key: string]: {name: string, registrationNumber: string}}>({})
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'published'>('pending')
  const [approvedResults, setApprovedResults] = useState<PendingResult[]>([])
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterSemester, setFilterSemester] = useState<string>("all")
  const [filterProgramType, setFilterProgramType] = useState<string>("all")
  const [filterProgram, setFilterProgram] = useState<string>("all")
  const [filterStudyMode, setFilterStudyMode] = useState<string>("all")
  const [filterLecturer, setFilterLecturer] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Export grades to CSV
  const exportGradesToCSV = (result: PendingResult) => {
    try {
      const csvContent = [
        // Header row
        ['Registration Number', 'Student Name', 'Course Code', 'Course Name', 'Academic Year', 'Semester', 'Assessment (10%)', 'Mid-Semester (20%)', 'Final Exam (70%)', 'Total (100%)', 'Grade', 'Lecturer', 'Submitted Date'].join(','),
        // Data rows
        ...result.grades.map(grade => [
          studentInfo[grade.studentId]?.registrationNumber || `REG-${grade.studentId.slice(0, 8)}`,
          studentInfo[grade.studentId]?.name || `Student ${grade.studentId.slice(0, 8)}`,
          result.courseCode,
          result.course,
          result.academicYear,
          result.semester,
          grade.assessment,
          grade.midsem,
          grade.exams,
          grade.total,
          grade.grade,
          result.lecturerName,
          result.submittedDate
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${result.courseCode}_${result.academicYear}_${result.semester}_grades.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export Successful',
        description: `Grades for ${result.courseCode} have been exported to CSV`,
      })
    } catch (error) {
      console.error('Error exporting grades:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export grades. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Fetch pending grade submissions
  const fetchPendingGrades = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching pending grades...")
      
      // First try to get from grade-submissions collection (new format)
      const submissionsRef = collection(db, 'grade-submissions')
      const submissionsQuery = query(submissionsRef, where('status', '==', 'pending_approval'))
      const submissionsSnapshot = await getDocs(submissionsQuery)
      
      console.log(`Found ${submissionsSnapshot.size} grade submissions`)
      
      const grades: Grade[] = []
      
      // Process grade submissions
      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data()
        console.log('Processing submission:', submissionData)
        
        // Convert submission data to individual grades
        if (submissionData.grades && Array.isArray(submissionData.grades)) {
          submissionData.grades.forEach((gradeData: any) => {
            grades.push({
              id: `${submissionDoc.id}_${gradeData.studentId}`,
              studentId: gradeData.studentId,
              courseId: submissionData.courseId,
              courseCode: submissionData.courseCode,
              academicYear: submissionData.academicYear,
              semester: submissionData.semester,
              lecturerId: submissionData.submittedBy,
              assessment: gradeData.assessment,
              midsem: gradeData.midsem,
              exams: gradeData.exams,
              total: gradeData.total,
              grade: gradeData.grade,
              status: 'submitted',
              submittedAt: submissionData.submissionDate,
              submittedBy: submissionData.submittedBy
            } as Grade)
          })
        }
      }
      
      // Also check the old grades collection for backward compatibility
      const gradesRef = collection(db, 'grades')
      const gradesQuery = query(gradesRef, where('status', '==', 'submitted'))
      const gradesSnapshot = await getDocs(gradesQuery)
      
      gradesSnapshot.forEach(doc => {
        grades.push({ id: doc.id, ...doc.data() } as Grade)
      })
      
      console.log(`Total found: ${grades.length} submitted grades`)
      
      // Group grades by course and lecturer
      const groupedResults = await groupGradesByCourse(grades)
      
      // Check for new submissions
      const previousCount = pendingResults.length
      const newCount = groupedResults.length
      if (newCount > previousCount) {
        setNewSubmissionsCount(newCount - previousCount)
        toast({
          title: "New Grade Submissions",
          description: `${newCount - previousCount} new grade submission(s) received`,
        })
      }
      
      setPendingResults(groupedResults)
      setLastRefreshTime(new Date())
      
    } catch (error) {
      console.error("Error fetching pending grades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch approved grade submissions
  const fetchApprovedGrades = async () => {
    try {
      console.log("Fetching approved grades...")
      
      const grades: Grade[] = []
      
      // Check grade-submissions collection for approved submissions
      const submissionsRef = collection(db, 'grade-submissions')
      const submissionsQuery = query(submissionsRef, where('status', '==', 'approved'))
      const submissionsSnapshot = await getDocs(submissionsQuery)
      
      console.log(`Found ${submissionsSnapshot.size} approved submissions`)
      
      // Process approved submissions
      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data()
        
        // Convert submission data to individual grades
        if (submissionData.grades && Array.isArray(submissionData.grades)) {
          submissionData.grades.forEach((gradeData: any) => {
            grades.push({
              id: `${submissionDoc.id}_${gradeData.studentId}`,
              studentId: gradeData.studentId,
              courseId: submissionData.courseId,
              courseCode: submissionData.courseCode,
              academicYear: submissionData.academicYear,
              semester: submissionData.semester,
              lecturerId: submissionData.submittedBy,
              assessment: gradeData.assessment,
              midsem: gradeData.midsem,
              exams: gradeData.exams,
              total: gradeData.total,
              grade: gradeData.grade,
              status: 'approved',
              submittedAt: submissionData.submissionDate,
              submittedBy: submissionData.submittedBy,
              approvedBy: submissionData.approvedBy
            } as Grade)
          })
        }
      }
      
      // Also check the old grades collection for backward compatibility
      const gradesRef = collection(db, 'grades')
      const gradesQuery = query(gradesRef, where('status', '==', 'approved'))
      const gradesSnapshot = await getDocs(gradesQuery)
      
      gradesSnapshot.forEach(doc => {
        grades.push({ id: doc.id, ...doc.data() } as Grade)
      })
      
      console.log(`Total found: ${grades.length} approved grades`)
      
      // Group grades by course and lecturer
      const groupedResults = await groupGradesByCourse(grades)
      setApprovedResults(groupedResults)
      
    } catch (error) {
      console.error("Error fetching approved grades:", error)
    }
  }

  // Group grades by academic year, semester, course and lecturer for better organization
  const groupGradesByCourse = async (grades: Grade[]): Promise<PendingResult[]> => {
    const grouped: { [key: string]: PendingResult } = {}
    const courseCache: Record<string, any> = {}
    const programCache: Record<string, any> = {}
    const lecturerDeptCache: Record<string, string> = {}
    
    for (const grade of grades) {
      // Create a unique key that includes academic year and semester to prevent confusion
      const key = `${grade.academicYear}-${grade.semester}-${grade.courseId}-${grade.lecturerId}`
      
      if (!grouped[key]) {
        // Fetch course and lecturer names
        const courseName = await getCourseName(grade.courseId)
        const lecturerName = await getLecturerName(grade.lecturerId)

        // Enrich program/mode
        let programId: string | undefined
        let programName: string | undefined
        let programType: string | undefined
        let studyMode: string | undefined = 'Regular'
        try {
          if (!courseCache[grade.courseId]) {
            const courseRefNames = ['academic-courses', 'courses']
            for (const coll of courseRefNames) {
              try {
                const courseRef = doc(db, coll, grade.courseId)
                const courseDoc = await getDoc(courseRef)
                if (courseDoc.exists()) { courseCache[grade.courseId] = courseDoc.data(); break }
              } catch {}
            }
          }
          const courseData = courseCache[grade.courseId]
          if (courseData) { programId = courseData.programId; studyMode = courseData.studyMode || studyMode }
          if (programId) {
            if (!programCache[programId]) {
              const progRef = doc(db, 'academic-programs', programId)
              const progDoc = await getDoc(progRef)
              if (progDoc.exists()) programCache[programId] = progDoc.data()
            }
            const progData = programCache[programId]
            if (progData) { programName = progData.name; programType = (progData.type || '').toString(); if (programType) programType = programType.charAt(0).toUpperCase()+programType.slice(1) }
          }
        } catch {}

        // Lecturer department
        let lecturerDepartment: string | undefined
        try {
          if (!lecturerDeptCache[grade.lecturerId]) {
            const staffRef = doc(db, 'academic-staff', grade.lecturerId)
            const staffDoc = await getDoc(staffRef)
            if (staffDoc.exists()) lecturerDeptCache[grade.lecturerId] = staffDoc.data().department || staffDoc.data().faculty || ''
            else {
              const userRef = doc(db, 'users', grade.lecturerId)
              const userDoc = await getDoc(userRef)
              lecturerDeptCache[grade.lecturerId] = userDoc.exists() ? (userDoc.data().department || userDoc.data().faculty || '') : ''
            }
          }
          lecturerDepartment = lecturerDeptCache[grade.lecturerId]
        } catch {}
        
        // Fix date parsing - handle both Date objects and timestamps
        let submittedDate = 'Unknown'
        if (grade.submittedAt) {
          try {
            if (grade.submittedAt instanceof Date) {
              submittedDate = grade.submittedAt.toLocaleDateString()
            } else if (typeof grade.submittedAt === 'string') {
              submittedDate = new Date(grade.submittedAt).toLocaleDateString()
            } else if (grade.submittedAt.toDate) {
              // Handle Firestore Timestamp
              submittedDate = grade.submittedAt.toDate().toLocaleDateString()
            } else {
              submittedDate = new Date(grade.submittedAt).toLocaleDateString()
            }
          } catch (error) {
            console.error("Error parsing submitted date:", error)
            submittedDate = 'Invalid Date'
          }
        }
        
        grouped[key] = {
          id: key,
          courseId: grade.courseId,
          course: courseName,
          courseCode: grade.courseCode,
          lecturerId: grade.lecturerId,
          lecturerName: lecturerName,
          lecturerDepartment,
          submittedDate: submittedDate,
          studentsCount: 0,
          status: 'pending',
          semester: grade.semester,
          academicYear: grade.academicYear,
          programId,
          programName,
          programType,
          studyMode,
          grades: []
        }
      }
      
      grouped[key].grades.push(grade)
      grouped[key].studentsCount++
    }
    
    // Sort results by academic year (descending), semester, then course code
    return Object.values(grouped).sort((a, b) => {
      // First sort by academic year (newest first)
      if (a.academicYear !== b.academicYear) {
        return b.academicYear.localeCompare(a.academicYear)
      }
      // Then by semester (First before Second)
      if (a.semester !== b.semester) {
        return a.semester.localeCompare(b.semester)
      }
      // Finally by course code
      return a.courseCode.localeCompare(b.courseCode)
    })
  }

  // Load pending grades on component mount
  useEffect(() => {
    fetchPendingGrades()
    fetchApprovedGrades()
  }, [])

  // Filter results based on search term and filters
  const filteredResults = pendingResults.filter(
    (result) => {
      // Text search filter
      const matchesSearch = 
        result.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.semester.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Year filter
      const matchesYear = !filterYear || filterYear === "all" || result.academicYear === filterYear
      
      // Semester filter
      const matchesSemester = !filterSemester || filterSemester === "all" || result.semester === filterSemester
      const matchesProgramType = !filterProgramType || filterProgramType === 'all' || (result.programType || '').toLowerCase() === filterProgramType.toLowerCase()
      const matchesProgram = !filterProgram || filterProgram === 'all' || result.programId === filterProgram || result.programName === filterProgram
      const matchesMode = !filterStudyMode || filterStudyMode === 'all' || (result.studyMode || 'Regular') === filterStudyMode
      const matchesLecturer = !filterLecturer || filterLecturer === 'all' || result.lecturerName === filterLecturer
      const matchesDept = !filterDepartment || filterDepartment === 'all' || (result.lecturerDepartment || '') === filterDepartment
      
      return matchesSearch && matchesYear && matchesSemester && matchesProgramType && matchesProgram && matchesMode && matchesLecturer && matchesDept
    }
  )

  // Get unique academic years and semesters for filter dropdowns
  const availableYears = [...new Set(pendingResults.map(r => r.academicYear))].sort().reverse()
  const availableSemesters = [...new Set(pendingResults.map(r => r.semester))].sort()
  const availableProgramTypes = [...new Set(pendingResults.map(r => (r.programType || 'Unknown')))].sort()
  const availablePrograms = [...new Set(pendingResults.map(r => r.programId || r.programName).filter(Boolean))] as string[]
  const availableStudyModes = [...new Set(pendingResults.map(r => r.studyMode || 'Regular'))].sort()
  const availableLecturers = [...new Set(pendingResults.map(r => r.lecturerName))].sort()
  const availableDepartments = [...new Set(pendingResults.map(r => r.lecturerDepartment || '').filter(Boolean))].sort()

  // Function to render table rows with grouping
  const renderTableRows = () => {
    const results = activeTab === 'pending' ? filteredResults : approvedResults
    
    // Group results by program type → program → academic year → semester → mode
    const groupedResults = results.reduce((acc, result) => {
      const key = `${result.programType || 'Unknown'}|${result.programName || 'Unknown Program'}|${result.academicYear}|${result.semester}|${result.studyMode || 'Regular'}`
      if (!acc[key]) {
        acc[key] = {
          programType: result.programType || 'Unknown',
          programName: result.programName || 'Unknown Program',
          academicYear: result.academicYear,
          semester: result.semester,
          studyMode: result.studyMode || 'Regular',
          results: []
        }
      }
      acc[key].results.push(result)
      return acc
    }, {} as Record<string, { programType: string; programName: string; academicYear: string; semester: string; studyMode: string; results: PendingResult[] }>)

    // Convert to array and sort
    const sortedGroups = Object.values(groupedResults).sort((a, b) => {
      if (a.programType !== b.programType) return a.programType.localeCompare(b.programType)
      if (a.programName !== b.programName) return a.programName.localeCompare(b.programName)
      if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear)
      if (a.semester !== b.semester) return a.semester.localeCompare(b.semester)
      return a.studyMode.localeCompare(b.studyMode)
    })

    return sortedGroups.flatMap((group) => [
      // Group header row
      <TableRow key={`header-${group.programType}-${group.programName}-${group.academicYear}-${group.semester}-${group.studyMode}`} className="bg-gray-50">
        <TableCell colSpan={7} className="font-semibold text-gray-700 py-3">
          📚 {group.programName} – {group.academicYear} – {group.semester} – {group.studyMode} • {group.programType}
          <span className="ml-2 text-sm text-muted-foreground">{group.results.length} course{group.results.length !== 1 ? 's' : ''}</span>
        </TableCell>
      </TableRow>,
      // Individual result rows
      ...group.results.map((result) => (
        <TableRow key={result.id}>
          <TableCell>
            <div>
              <div className="font-medium">{result.academicYear}</div>
              <div className="text-sm text-muted-foreground">{result.semester} Semester</div>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <div className="font-medium">{result.course}</div>
              <div className="text-sm text-muted-foreground">{result.courseCode}</div>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <div className="font-medium">{result.lecturerName}</div>
              {result.lecturerDepartment && (
                <div className="text-sm text-muted-foreground">{result.lecturerDepartment}</div>
              )}
            </div>
          </TableCell>
          <TableCell>{result.submittedDate}</TableCell>
          <TableCell>{result.studentsCount}</TableCell>
          <TableCell>
            <Badge variant={activeTab === 'pending' ? 'outline' : 'default'}>
              {activeTab === 'pending' ? 'Pending' : 'Approved'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              {activeTab === 'pending' ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedResult(result)
                                              fetchStudentInfo(result.grades)
                    }}>
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </DialogTrigger>
                  {/* Review Dialog Content */}
                  <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Review Results - {result?.courseCode}</DialogTitle>
                      <DialogDescription>
                        Review and approve/reject the submitted results for {result?.courseCode} - {result?.academicYear} ({result?.semester} Semester)
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Course</label>
                          <p>
                            {result?.course} ({result?.courseCode})
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Staff</label>
                          <p>{result?.lecturerName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Academic Year</label>
                          <p>{result?.academicYear}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Semester</label>
                          <p>{result?.semester} Semester</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Students</label>
                          <p>{result?.studentsCount} students</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Submitted Date</label>
                          <p>{result?.submittedDate}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Student Results ({result?.grades.length} students)</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => exportGradesToCSV(result)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export to CSV
                          </Button>
                        </div>
                        
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Registration Number</TableHead>
                                <TableHead className="font-semibold">Student Name</TableHead>
                                <TableHead className="font-semibold text-center">Assessment (10%)</TableHead>
                                <TableHead className="font-semibold text-center">Mid-Semester (20%)</TableHead>
                                <TableHead className="font-semibold text-center">Final Exam (70%)</TableHead>
                                <TableHead className="font-semibold text-center">Total (100%)</TableHead>
                                <TableHead className="font-semibold text-center">Grade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result?.grades.map((grade, index) => (
                                <TableRow key={grade.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <TableCell className="font-medium text-sm">
                                    {studentInfo[grade.studentId]?.registrationNumber || `REG-${grade.studentId.slice(0, 8)}`}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {studentInfo[grade.studentId]?.name || `Student ${grade.studentId.slice(0, 8)}`}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                                      grade.assessment >= 8 ? 'bg-green-100 text-green-800' :
                                      grade.assessment >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {grade.assessment}/10
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                                      grade.midsem >= 16 ? 'bg-green-100 text-green-800' :
                                      grade.midsem >= 12 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {grade.midsem}/20
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                                      grade.exams >= 56 ? 'bg-green-100 text-green-800' :
                                      grade.exams >= 42 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {grade.exams}/70
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center font-bold">
                                    <span className={`px-3 py-1 rounded text-sm ${
                                      grade.total >= 80 ? 'bg-green-100 text-green-800' :
                                      grade.total >= 70 ? 'bg-blue-100 text-blue-800' :
                                      grade.total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                      grade.total >= 50 ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {grade.total}/100
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge className={`${
                                      grade.grade === 'A' ? 'bg-green-600 text-white' :
                                      grade.grade === 'B' ? 'bg-blue-600 text-white' :
                                      grade.grade === 'C' ? 'bg-yellow-600 text-white' :
                                      grade.grade === 'D' ? 'bg-orange-600 text-white' :
                                      'bg-red-600 text-white'
                                    }`}>
                                      {grade.grade}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Summary Statistics */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {result?.grades.length || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {result?.grades.filter(g => g.total >= 80).length || 0}
                            </div>
                            <div className="text-sm text-gray-600">A Grades</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {result?.grades.filter(g => g.total >= 60 && g.total < 80).length || 0}
                            </div>
                            <div className="text-sm text-gray-600">B-C Grades</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {result?.grades.filter(g => g.total < 60).length || 0}
                            </div>
                            <div className="text-sm text-gray-600">D-F Grades</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button variant="outline" onClick={handleReject} disabled={isRejecting}>
                        <X className="h-4 w-4 mr-1" />
                        {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reject"}
                      </Button>
                      <Button onClick={handleApprove} disabled={isApproving}>
                        <Check className="h-4 w-4 mr-1" />
                        {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Approve"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePublish(result)}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish to Students'}
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))
    ])
  }

  // Handle grade approval
  const handleApprove = async () => {
    if (!selectedResult) return
    
    try {
      setIsApproving(true)
      console.log(`Approving grades for course: ${selectedResult.courseCode}`)
      
      // Find the submission document in grade-submissions collection
      const submissionsRef = collection(db, 'grade-submissions')
      const submissionQuery = query(
        submissionsRef, 
        where('courseId', '==', selectedResult.courseId),
        where('submittedBy', '==', selectedResult.lecturerId),
        where('status', '==', 'pending_approval')
      )
      const submissionSnapshot = await getDocs(submissionQuery)
      
      if (!submissionSnapshot.empty) {
        // Update the submission status
        const submissionDoc = submissionSnapshot.docs[0]
        await updateDoc(doc(db, 'grade-submissions', submissionDoc.id), {
          status: 'approved',
          approvedBy: 'director', // In real app, get from auth context
          approvedDate: new Date()
        })
        
        // Also update individual student grades
        const studentGradesRef = collection(db, 'student-grades')
        const studentGradesQuery = query(
          studentGradesRef,
          where('submissionId', '==', submissionDoc.id)
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        
        const updatePromises = studentGradesSnapshot.docs.map(doc =>
          updateDoc(doc.ref, {
            status: 'approved',
            approvedBy: 'director',
            approvedAt: new Date()
          })
        )
        
        await Promise.all(updatePromises)
      }
      
      // Note: We only update the new format (grade-submissions and student-grades)
      // The old grades collection is not used in the new workflow
      
      console.log('✅ Grades approved successfully')
      toast({
        title: 'Grades Approved',
        description: `Results for ${selectedResult.courseCode} have been approved.`,
      })
      
      // Refresh the list
      await fetchPendingGrades()
      await fetchApprovedGrades()
      setSelectedResult(null)
      
    } catch (error) {
      console.error("Error approving grades:", error)
      toast({
        title: 'Error Approving Grades',
        description: 'Failed to approve grades. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Handle grade rejection
  const handleReject = async () => {
    if (!selectedResult) return
    
    try {
      setIsRejecting(true)
      console.log(`Rejecting grades for course: ${selectedResult.courseCode}`)
      
      // Find the submission document in grade-submissions collection
      const submissionsRef = collection(db, 'grade-submissions')
      const submissionQuery = query(
        submissionsRef, 
        where('courseId', '==', selectedResult.courseId),
        where('submittedBy', '==', selectedResult.lecturerId),
        where('status', '==', 'pending_approval')
      )
      const submissionSnapshot = await getDocs(submissionQuery)
      
      if (!submissionSnapshot.empty) {
        // Update the submission status
        const submissionDoc = submissionSnapshot.docs[0]
        await updateDoc(doc(db, 'grade-submissions', submissionDoc.id), {
          status: 'rejected',
          rejectedBy: 'director', // In real app, get from auth context
          rejectedDate: new Date(),
          comments: 'Rejected by director'
        })
        
        // Also update individual student grades
        const studentGradesRef = collection(db, 'student-grades')
        const studentGradesQuery = query(
          studentGradesRef,
          where('submissionId', '==', submissionDoc.id)
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        
        const updatePromises = studentGradesSnapshot.docs.map(doc =>
          updateDoc(doc.ref, {
            status: 'rejected',
            rejectedBy: 'director',
            rejectedAt: new Date(),
            comments: 'Rejected by director'
          })
        )
        
        await Promise.all(updatePromises)
      }
      
      // Note: We only update the new format (grade-submissions and student-grades)
      // The old grades collection is not used in the new workflow
      
      console.log('✅ Grades rejected successfully')
      toast({
        title: 'Grades Rejected',
        description: `Results for ${selectedResult.courseCode} have been rejected.`,
      })
      
      // Refresh the list
      await fetchPendingGrades()
      setSelectedResult(null)
      
    } catch (error) {
      console.error("Error rejecting grades:", error)
      toast({
        title: 'Error Rejecting Grades',
        description: 'Failed to reject grades. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsRejecting(false)
    }
  }

  // Handle grade publishing
  const handlePublish = async (result: PendingResult) => {
    try {
      setIsPublishing(true)
      console.log(`Publishing grades for course: ${result.courseCode}`)
      
      // Find the submission document in grade-submissions collection
      const submissionsRef = collection(db, 'grade-submissions')
      const submissionQuery = query(
        submissionsRef, 
        where('courseId', '==', result.courseId),
        where('submittedBy', '==', result.lecturerId),
        where('status', '==', 'approved')
      )
      const submissionSnapshot = await getDocs(submissionQuery)
      
      if (!submissionSnapshot.empty) {
        // Update the submission status to published
        const submissionDoc = submissionSnapshot.docs[0]
        await updateDoc(doc(db, 'grade-submissions', submissionDoc.id), {
          status: 'published',
          publishedBy: 'director', // In real app, get from auth context
          publishedDate: new Date()
        })
        
        // Also update individual student grades to published
        const studentGradesRef = collection(db, 'student-grades')
        const studentGradesQuery = query(
          studentGradesRef,
          where('submissionId', '==', submissionDoc.id)
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        
        const updatePromises = studentGradesSnapshot.docs.map(doc =>
          updateDoc(doc.ref, {
            status: 'published',
            publishedBy: 'director',
            publishedAt: new Date()
          })
        )
        
        await Promise.all(updatePromises)
      }
      
      // Note: We only update the new format (grade-submissions and student-grades)
      // The old grades collection is not used in the new workflow
      
      console.log('✅ Grades published successfully')
      toast({
        title: 'Grades Published',
        description: `Results for ${result.courseCode} have been published.`,
      })
      
      // Refresh the lists
      await fetchPendingGrades()
      await fetchApprovedGrades()
      
    } catch (error) {
      console.error("Error publishing grades:", error)
      toast({
        title: 'Error Publishing Grades',
        description: 'Failed to publish grades. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Fetch student information for display
  const fetchStudentInfo = async (grades: Grade[]) => {
    const info: {[key: string]: {name: string, registrationNumber: string}} = {}
    
    for (const grade of grades) {
      if (!studentInfo[grade.studentId]) {
        try {
          const studentData = await getStudentInfo(grade.studentId)
          info[grade.studentId] = studentData
        } catch (error) {
          console.error(`Error fetching info for student ${grade.studentId}:`, error)
          info[grade.studentId] = {
            name: `Student ${grade.studentId.slice(0, 8)}`,
            registrationNumber: `REG-${grade.studentId.slice(0, 8)}`
          }
        }
      }
    }
    
    setStudentInfo(prev => ({ ...prev, ...info }))
  }

  // Get student information by ID
  const getStudentInfo = async (studentId: string): Promise<{name: string, registrationNumber: string}> => {
    try {
      // Try multiple student collections that might exist in the system
      const studentCollections = ['students', 'users', 'student-registrations']
      
      for (const collectionName of studentCollections) {
        try {
          const studentRef = doc(db, collectionName, studentId)
          const studentDoc = await getDoc(studentRef)
          
          if (studentDoc.exists()) {
            const studentData = studentDoc.data()
            
            // Try different possible field names for student name
            const name = studentData.name || 
                        studentData.firstName || 
                        studentData.surname || 
                        `${studentData.firstName || ''} ${studentData.surname || ''}`.trim() ||
                        `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim()
            
            // Try different possible field names for registration number
            const registrationNumber = studentData.registrationNumber || 
                                     studentData.studentId || 
                                     studentData.regNumber ||
                                     studentData.studentNumber ||
                                     studentData.matricNumber ||
                                     studentData.indexNumber
            
            if (name && name !== ' ') {
              return {
                name: name,
                registrationNumber: registrationNumber || `REG-${studentId.slice(0, 8)}`
              }
            }
          }
        } catch (error) {
          console.warn(`Error checking ${collectionName} collection:`, error)
          continue
        }
      }
      
      return {
        name: `Student ${studentId.slice(0, 8)}`,
        registrationNumber: `REG-${studentId.slice(0, 8)}`
      }
    } catch (error) {
      console.error("Error fetching student info:", error)
      return {
        name: `Student ${studentId.slice(0, 8)}`,
        registrationNumber: `REG-${studentId.slice(0, 8)}`
      }
    }
  }

  // Get course name by ID
  const getCourseName = async (courseId: string): Promise<string> => {
    try {
      // Try multiple course collections that might exist in the system
      const courseCollections = ['courses', 'academic-courses', 'program-courses']
      
      for (const collectionName of courseCollections) {
        try {
          const courseRef = doc(db, collectionName, courseId)
          const courseDoc = await getDoc(courseRef)
          
          if (courseDoc.exists()) {
            const courseData = courseDoc.data()
            // Try different possible field names for course title
            const title = courseData.title || courseData.name || courseData.courseName || courseData.courseTitle
            if (title) {
              return title
            }
          }
        } catch (error) {
          console.warn(`Error checking ${collectionName} collection:`, error)
          continue
        }
      }
      
      // If no course found, return a more descriptive fallback
      return `Course ${courseId.slice(0, 8)}...`
    } catch (error) {
      console.error("Error fetching course name:", error)
      return `Course ${courseId.slice(0, 8)}...`
    }
  }

  // Get lecturer name by ID
  const getLecturerName = async (lecturerId: string): Promise<string> => {
    try {
      const lecturerRef = doc(db, 'users', lecturerId)
      const lecturerDoc = await getDoc(lecturerRef)
      
      if (lecturerDoc.exists()) {
        const lecturerData = lecturerDoc.data()
        return lecturerData.name || lecturerData.firstName || `Lecturer ${lecturerId.slice(0, 8)}`
      }
      
      return `Lecturer ${lecturerId.slice(0, 8)}`
    } catch (error) {
      console.error("Error fetching lecturer name:", error)
      return `Lecturer ${lecturerId.slice(0, 8)}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Result Approvals
            </h1>
            <p className="text-muted-foreground">Review and approve results submitted by lecturers</p>
          </div>
          <div className="flex items-center space-x-2">
            {newSubmissionsCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {newSubmissionsCount} New
              </Badge>
            )}
            <div className="text-sm text-muted-foreground">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingResults.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved Results</p>
                  <p className="text-2xl font-bold text-green-600">{approvedResults.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingResults.reduce((sum, result) => sum + result.studentsCount, 0) + 
                     approvedResults.reduce((sum, result) => sum + result.studentsCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Lecturers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {[...new Set([...pendingResults, ...approvedResults].map(r => r.lecturerName))].length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Result Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {/* Search and Refresh */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course, code, staff, academic year, or semester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={fetchPendingGrades} disabled={isLoading}>
                <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Academic Year:</label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Semester:</label>
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {availableSemesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester} Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Program Type:</label>
                <Select value={filterProgramType} onValueChange={setFilterProgramType}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableProgramTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Program:</label>
                <Select value={filterProgram} onValueChange={setFilterProgram}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {availablePrograms.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Mode:</label>
                <Select value={filterStudyMode} onValueChange={setFilterStudyMode}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {availableStudyModes.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Lecturer:</label>
                <Select value={filterLecturer} onValueChange={setFilterLecturer}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All Lecturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lecturers</SelectItem>
                    {availableLecturers.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Department:</label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {availableDepartments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(filterYear !== "all" || filterSemester !== "all" || filterProgramType !== 'all' || filterProgram !== 'all' || filterStudyMode !== 'all' || filterLecturer !== 'all' || filterDepartment !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFilterYear("all")
                    setFilterSemester("all")
                    setFilterProgramType('all')
                    setFilterProgram('all')
                    setFilterStudyMode('all')
                    setFilterLecturer('all')
                    setFilterDepartment('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Tabs for Pending and Approved */}
          <div className="flex space-x-1 mb-4">
            <Button
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pending')}
              className="flex-1"
            >
              Pending Approvals ({pendingResults.length})
            </Button>
            <Button
              variant={activeTab === 'approved' ? 'default' : 'outline'}
              onClick={() => setActiveTab('approved')}
              className="flex-1"
            >
              Approved ({approvedResults.length})
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Period</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2">Loading results...</p>
                  </TableCell>
                </TableRow>
              ) : (activeTab === 'pending' ? filteredResults : approvedResults).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p>No {activeTab} results found.</p>
                  </TableCell>
                </TableRow>
                            ) : (
                renderTableRows()
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffResultsPage() {
  return (
    <RouteGuard requiredPermissions={["results_approval"]}>
      <ResultApprovals />
    </RouteGuard>
  )
}