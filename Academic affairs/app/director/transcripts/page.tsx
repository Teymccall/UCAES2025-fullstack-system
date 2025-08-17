"use client"

import { useState, useEffect, useRef } from "react"
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
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { RouteGuard } from "@/components/route-guard"
import { 
  Search, 
  User, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Download, 
  BookOpen,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from "lucide-react"

// Types for transcript data
interface CourseResult {
  courseCode: string
  courseTitle: string
  credits: number
  grade: string
  gradePoint: number
  totalPoints: number
  lecturer: string
  assessment?: number
  midsem?: number
  exams?: number
  total?: number
  status: 'Published' | 'Pending'
}

interface SemesterResult {
  academicYear: string
  semester: string
  courses: CourseResult[]
  semesterGPA: number
  totalCredits: number
  totalGradePoints: number
  hasGrades: boolean
}

interface StudentInfo {
  id: string
  registrationNumber: string
  name: string
  email: string
  program: string
  level: string
  dateOfBirth?: string
  gender?: string
  entryLevel?: string
  currentLevel?: string
  yearOfAdmission?: number
  profilePictureUrl?: string
}

interface TranscriptData {
  student: StudentInfo
  semesters: SemesterResult[]
  summary: {
    totalCreditsEarned: number
    totalCreditsAttempted: number
    cumulativeGPA: number
    currentLevel: string
    classStanding: string
    academicStatus: string
  }
}

const gradeColors: { [key: string]: string } = {
  A: "bg-green-100 text-green-800",
  "A-": "bg-green-100 text-green-700",
  "B+": "bg-green-100 text-green-800",
  B: "bg-green-100 text-green-700",
  "B-": "bg-yellow-100 text-yellow-800",
  "C+": "bg-orange-100 text-orange-800",
  C: "bg-orange-100 text-orange-700",
  D: "bg-red-100 text-red-800",
  F: "bg-red-200 text-red-900",
}

function TranscriptsContent() {
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)
  
  // Helper function to format semester name
  const formatSemesterName = (semesterValue: string) => {
    if (!semesterValue) return 'Unknown Semester'
    
    // Handle different semester formats
    const semester = semesterValue.toLowerCase()
    if (semester.includes('first') || semester === '1' || semester === 'semester 1') {
      return 'First Semester'
    } else if (semester.includes('second') || semester === '2' || semester === 'semester 2') {
      return 'Second Semester'
    } else if (semester.includes('third') || semester === '3' || semester === 'semester 3') {
      return 'Third Semester'
    } else {
      // Return original value with proper case
      return semesterValue.charAt(0).toUpperCase() + semesterValue.slice(1)
    }
  }

  // Helper function to format academic year with semester
  const formatAcademicYearWithSemester = (academicYear: string, semester: string) => {
    // Ensure academic year is in YYYY-YYYY format
    let formattedYear = academicYear;
    
    // If the academic year doesn't contain a dash, it might be a single year
    if (!academicYear.includes('-')) {
      const year = parseInt(academicYear);
      if (!isNaN(year)) {
        formattedYear = `${year}-${year + 1}`;
      }
    }
    
    // If the academicYear looks like it was split incorrectly (e.g., "2026" and semester is "2027")
    // Try to reconstruct it
    if (academicYear.length === 4 && semester.length === 4) {
      const year1 = parseInt(academicYear);
      const year2 = parseInt(semester);
      if (!isNaN(year1) && !isNaN(year2) && year2 === year1 + 1) {
        return `${year1}-${year2} Academic Year - First Semester`;
      }
    }
    
    return `${formattedYear} Academic Year - ${formatSemesterName(semester)}`;
  }
  
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null)
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false)
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")

  // Search for students
  const searchStudents = async (term: string) => {
    if (term.length < 2) {
      setStudents([])
      return
    }

    setIsSearching(true)
    console.log(`🔍 Frontend: Searching for "${term}"`)
    
    try {
      const response = await fetch('/api/director/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: term }),
      })

      if (response.ok) {
        const studentsData = await response.json()
        console.log(`📊 Frontend: Received ${studentsData.length} students`)
        setStudents(studentsData)
        
        if (studentsData.length === 0) {
          toast({
            title: "No Students Found",
            description: `No students found matching "${term}". Please verify the search criteria and try again.`,
            variant: "default",
          })
        }
      } else {
        throw new Error('Failed to search students')
      }
    } catch (error) {
      console.error('Error searching students:', error)
      toast({
        title: "Search Error",
        description: "Failed to search for students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Load transcript for selected student
  const loadTranscript = async (student: StudentInfo) => {
    setSelectedStudent(student)
    setIsLoadingTranscript(true)
    setShowTranscriptDialog(true)

    try {
      const response = await fetch(`/api/director/transcripts?studentId=${student.id}`)
      
      if (response.ok) {
        const transcript = await response.json()
        setTranscriptData(transcript)
      } else {
        throw new Error('Failed to load transcript')
      }
    } catch (error) {
      console.error('Error loading transcript:', error)
      toast({
        title: "Load Error",
        description: "Failed to load student transcript. Please try again.",
        variant: "destructive",
      })
      setShowTranscriptDialog(false)
    } finally {
      setIsLoadingTranscript(false)
    }
  }

  // Print transcript
  const printTranscript = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Academic Transcript - ${transcriptData?.student.name}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.4; 
                  margin: 20px;
                  color: #333;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 3px solid #16a34a; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                  position: relative;
                }
                .header-content {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 20px;
                  margin-bottom: 15px;
                }
                .university-logo {
                  width: 80px;
                  height: 80px;
                  object-fit: contain;
                }
                .header-text {
                  text-align: center;
                }
                .header h1 { 
                  color: #16a34a; 
                  margin: 0; 
                  font-size: 28px;
                  font-weight: bold;
                }
                .header h2 { 
                  color: #15803d; 
                  margin: 5px 0; 
                  font-size: 18px;
                  font-weight: normal;
                }
                .header h3 {
                  color: #1f2937;
                  margin: 10px 0 0 0;
                  font-size: 16px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .student-info { 
                  margin-bottom: 30px; 
                  background: #f8fafc;
                  padding: 20px;
                  border-radius: 8px;
                  position: relative;
                }
                .student-info h3 { 
                  color: #15803d; 
                  margin-top: 0; 
                }
                .student-info-content {
                  display: flex;
                  gap: 20px;
                  align-items: flex-start;
                }
                .student-photo {
                  width: 120px;
                  height: 150px;
                  object-fit: cover;
                  border: 3px solid #16a34a;
                  border-radius: 8px;
                  flex-shrink: 0;
                }
                .student-photo-placeholder {
                  width: 120px;
                  height: 150px;
                  background: #e5e7eb;
                  border: 3px solid #9ca3af;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #6b7280;
                  font-size: 12px;
                  text-align: center;
                  flex-shrink: 0;
                }
                .student-details {
                  flex: 1;
                }
                .info-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px; 
                }
                .info-item { 
                  display: flex; 
                  justify-content: space-between; 
                }
                .info-item strong { 
                  color: #374151; 
                }
                .semester-section { 
                  margin-bottom: 25px; 
                  break-inside: avoid;
                }
                .semester-header { 
                  background: #16a34a; 
                  color: white; 
                  padding: 10px 15px; 
                  margin-bottom: 10px;
                  border-radius: 5px;
                  font-weight: bold;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 15px;
                  font-size: 12px;
                }
                th, td { 
                  border: 1px solid #d1d5db; 
                  padding: 8px; 
                  text-align: left; 
                }
                th { 
                  background: #f3f4f6; 
                  font-weight: bold;
                  color: #374151;
                }
                .semester-summary { 
                  background: #f0f9ff; 
                  padding: 10px; 
                  border-radius: 5px;
                  font-weight: bold;
                  color: #15803d;
                }
                .final-summary { 
                  background: #065f46; 
                  color: white; 
                  padding: 20px; 
                  border-radius: 8px; 
                  margin-top: 30px;
                }
                .final-summary h3 { 
                  margin-top: 0; 
                  color: white;
                }
                .summary-grid { 
                  display: grid; 
                  grid-template-columns: repeat(2, 1fr); 
                  gap: 20px; 
                }
                .summary-item { 
                  text-align: center; 
                }
                .summary-value { 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin-bottom: 5px;
                }
                .footer { 
                  margin-top: 40px; 
                  text-align: center; 
                  font-size: 11px; 
                  color: #6b7280;
                  border-top: 1px solid #d1d5db;
                  padding-top: 15px;
                  position: relative;
                }
                .page-number {
                  position: fixed;
                  bottom: 20px;
                  right: 30px;
                  font-size: 12px;
                  color: #6b7280;
                  font-weight: bold;
                }
                .watermark {
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 72px;
                  color: rgba(34, 197, 94, 0.05);
                  font-weight: bold;
                  z-index: -1;
                  pointer-events: none;
                }
                .logo-watermark {
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 400px;
                  height: 400px;
                  opacity: 0.03;
                  z-index: -1;
                  pointer-events: none;
                  background-image: url('/logo.png');
                  background-size: contain;
                  background-repeat: no-repeat;
                  background-position: center;
                }
                .logo-watermark-pattern {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  opacity: 0.02;
                  z-index: -2;
                  pointer-events: none;
                  background-image: url('/logo.png');
                  background-size: 150px 150px;
                  background-repeat: repeat;
                }
                @media print {
                  body { 
                    margin: 0; 
                    padding-bottom: 60px;
                  }
                  .header { 
                    page-break-after: avoid; 
                  }
                  .semester-section { 
                    page-break-inside: avoid; 
                    margin-bottom: 30px;
                  }
                  .student-info {
                    page-break-after: avoid;
                  }
                  .page-break-inside-avoid {
                    page-break-inside: avoid;
                  }
                  .page-number {
                    display: block;
                  }
                  @page {
                    margin: 20mm;
                    @bottom-right {
                      content: "Page " counter(page) " of " counter(pages);
                    }
                  }
                }
              </style>
            </head>
            <body>
              <!-- Security Watermarks -->
              <div class="watermark">OFFICIAL TRANSCRIPT</div>
              <div class="logo-watermark"></div>
              <div class="logo-watermark-pattern"></div>
              
              <!-- Page Number -->
              <div class="page-number">Page 1</div>
              
              <div class="header">
                <div class="header-content">
                  <img src="${window.location.origin}/logo.png" alt="UCAES Logo" class="university-logo" />
                  <div class="header-text">
                    <h1>UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</h1>
                    <h2>OFFICIAL ACADEMIC TRANSCRIPT</h2>
                  </div>
                </div>
              </div>
              
              <div class="student-info">
                <h3>Student Information</h3>
                <div class="student-info-content">
                  <div class="student-photo-container">
                    ${transcriptData?.student.profilePictureUrl ? 
                      `<img src="${transcriptData.student.profilePictureUrl}" alt="${transcriptData.student.name} Photo" class="student-photo" />` :
                      `<div class="student-photo-placeholder">Student<br/>Photo</div>`
                    }
                  </div>
                  <div class="student-details">
                    <div class="info-grid">
                      <div class="info-item"><strong>Name:</strong> <span>${transcriptData?.student.name}</span></div>
                      <div class="info-item"><strong>Registration Number:</strong> <span>${transcriptData?.student.registrationNumber}</span></div>
                      <div class="info-item"><strong>Email:</strong> <span>${transcriptData?.student.email}</span></div>
                      <div class="info-item"><strong>Gender:</strong> <span>${transcriptData?.student.gender || 'N/A'}</span></div>
                      <div class="info-item"><strong>Program:</strong> <span>${transcriptData?.student.program}</span></div>
                      <div class="info-item"><strong>Current Level:</strong> <span>${transcriptData?.student.currentLevel}</span></div>
                      <div class="info-item"><strong>Year of Admission:</strong> <span>${transcriptData?.student.yearOfAdmission}</span></div>
                      <div class="info-item"><strong>Date of Birth:</strong> <span>${transcriptData?.student.dateOfBirth || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="academic-records">
                <h3>📚 Academic Records</h3>
                ${transcriptData?.semesters.map((semester, index) => `
                  <div class="semester-section page-break-inside-avoid">
                    <div class="semester-header">
                      <strong>${formatAcademicYearWithSemester(semester.academicYear, semester.semester)}</strong>
                      <span style="float: right; font-size: 14px;">Credits: ${semester.totalCredits} | GPA: ${semester.semesterGPA.toFixed(2)}</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Credits</th>
                          <th>Assessment</th>
                          <th>Mid-Sem</th>
                          <th>Final</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${semester.courses.map(course => `
                          <tr>
                            <td>${course.courseCode}</td>
                            <td>${course.courseTitle}</td>
                            <td>${course.credits}</td>
                            <td>${course.assessment || '-'}/10</td>
                            <td>${course.midsem || '-'}/20</td>
                            <td>${course.exams || '-'}/70</td>
                            <td>${course.total || '-'}/100</td>
                            <td><strong>${course.grade}</strong></td>
                            <td>${course.gradePoint}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <div class="semester-summary">
                      Semester Credits: ${semester.totalCredits} | Grade Points: ${semester.totalGradePoints.toFixed(1)} | Semester GPA: ${semester.semesterGPA.toFixed(2)}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="final-summary">
                <h3>Academic Summary</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="summary-value">${transcriptData?.summary.totalCreditsEarned}</div>
                    <div>Credits Earned</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-value">${transcriptData?.summary.totalCreditsAttempted}</div>
                    <div>Credits Attempted</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-value">${transcriptData?.summary.cumulativeGPA.toFixed(2)}</div>
                    <div>Cumulative GPA</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-value">${transcriptData?.summary.classStanding}</div>
                    <div>Class Standing</div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div style="border-top: 2px solid #16a34a; padding-top: 15px; margin-top: 30px;">
                  <p style="font-weight: bold; color: #15803d; margin-bottom: 10px;">
                    🎓 UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES
                  </p>
                  <p style="margin-bottom: 8px;">
                    <strong>This is an official academic transcript issued by UCAES.</strong>
                  </p>
                  <p style="margin-bottom: 8px;">
                    Generated on: <strong>${new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</strong>
                  </p>
                  <p style="margin-bottom: 8px;">
                    Transcript ID: <strong>UCAES-${transcriptData?.student.registrationNumber}-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}</strong>
                  </p>
                  <p style="font-size: 10px; color: #6b7280; margin-top: 15px;">
                    This document contains confidential student information and should be handled accordingly.<br/>
                    For verification, contact the Academic Affairs Office at academic@ucaes.edu.gh
                  </p>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Export transcript as PDF (using browser print to PDF)
  const exportPDF = () => {
    printTranscript()
    toast({
      title: "PDF Export",
      description: "Use your browser's print dialog to save as PDF",
    })
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchStudents(searchTerm)
      } else {
        setStudents([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter students
  const filteredStudents = students.filter(student => {
    const yearMatch = filterYear === "all" || 
      (student.yearOfAdmission && student.yearOfAdmission.toString() === filterYear)
    const levelMatch = filterLevel === "all" || student.level === filterLevel
    return yearMatch && levelMatch
  })

  // Get unique years and levels for filters
  const availableYears = [...new Set(students.map(s => s.yearOfAdmission).filter(Boolean))]
    .sort((a, b) => (b as number) - (a as number))
  const availableLevels = [...new Set(students.map(s => s.level).filter(Boolean))]
    .sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Student Transcripts
          </h1>
          <p className="text-muted-foreground">Search and view comprehensive academic transcripts</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, registration number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

            </div>
            
            {students.length > 0 && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by admission year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year!.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {availableLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Search Results ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Searching students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {students.length === 0 ? "No students found" : "No students match the selected filters"}
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
                      <TableHead>Year of Admission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.registrationNumber}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {student.program}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {student.level}</Badge>
                        </TableCell>
                        <TableCell>{student.yearOfAdmission}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => loadTranscript(student)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            View Transcript
                          </Button>
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

      {/* Transcript Dialog */}
      <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Academic Transcript
            </DialogTitle>
            <DialogDescription>
              Complete academic record for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          {isLoadingTranscript ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading transcript...</p>
            </div>
          ) : transcriptData ? (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={printTranscript}>
                  <FileText className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={exportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              {/* Printable Content */}
              <div ref={printRef} className="space-y-6 relative">
                {/* Security Watermarks */}
                <div className="watermark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-blue-600 opacity-5 text-8xl font-bold pointer-events-none z-0">
                  OFFICIAL TRANSCRIPT
                </div>
                {/* Logo Watermark - Large Central */}
                <div 
                  className="logo-watermark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    width: '400px',
                    height: '400px',
                    opacity: 0.03,
                    zIndex: -1,
                    backgroundImage: 'url(/logo.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
                {/* Logo Watermark Pattern - Repeating Background */}
                <div 
                  className="logo-watermark-pattern fixed top-0 left-0 w-full h-full pointer-events-none"
                  style={{
                    opacity: 0.02,
                    zIndex: -2,
                    backgroundImage: 'url(/logo.png)',
                    backgroundSize: '150px 150px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                {/* Header */}
                <div className="header text-center border-b-2 border-green-600 pb-4">
                  <div className="header-content flex items-center justify-center gap-5 mb-4">
                    <img 
                      src="/logo.png" 
                      alt="UCAES Logo" 
                      className="university-logo w-20 h-20 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="header-text">
                      <h1 className="text-2xl font-bold text-blue-600">
                        UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES
                      </h1>
                      <h2 className="text-lg text-muted-foreground">OFFICIAL ACADEMIC TRANSCRIPT</h2>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="student-info bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-green-700 mb-4">Student Information</h3>
                  <div className="student-info-content flex gap-5">
                    {/* Student Photo */}
                    <div className="flex-shrink-0">
                      {transcriptData.student.profilePictureUrl ? (
                        <img 
                          src={transcriptData.student.profilePictureUrl} 
                          alt={`${transcriptData.student.name} Photo`}
                          className="student-photo w-28 h-32 object-cover border-2 border-green-600 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="student-photo-placeholder w-28 h-32 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-gray-500 text-xs text-center"
                        style={{ display: transcriptData.student.profilePictureUrl ? 'none' : 'flex' }}
                      >
                        Student<br/>Photo
                      </div>
                    </div>
                    
                    {/* Student Details */}
                    <div className="student-details flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span className="font-semibold">{transcriptData.student.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Registration Number:</span>
                            <span className="font-semibold text-green-700">{transcriptData.student.registrationNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{transcriptData.student.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Gender:</span>
                            <span>{transcriptData.student.gender || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Program:</span>
                            <span className="text-right font-medium">{transcriptData.student.program}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Current Level:</span>
                            <span className="font-semibold">{transcriptData.student.currentLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Year of Admission:</span>
                            <span className="font-semibold">{transcriptData.student.yearOfAdmission}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Date of Birth:</span>
                            <span>{transcriptData.student.dateOfBirth || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Records by Semester */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Academic Records
                  </h3>
                  
                  {transcriptData.semesters.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No academic records found for this student.
                    </div>
                  ) : (
                    transcriptData.semesters.map((semester, index) => (
                      <div key={index} className="semester-section border rounded-lg p-4 page-break-inside-avoid">
                        <div className="semester-header bg-green-600 text-white p-3 rounded-t-lg -m-4 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">
                              {formatAcademicYearWithSemester(semester.academicYear, semester.semester)}
                            </span>
                            <span className="text-sm">
                              Credits: {semester.totalCredits} | GPA: {semester.semesterGPA.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Title</TableHead>
                                <TableHead className="text-center">Credits</TableHead>
                                <TableHead className="text-center">Assessment</TableHead>
                                <TableHead className="text-center">Mid-Sem</TableHead>
                                <TableHead className="text-center">Final</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                                <TableHead className="text-center">Grade</TableHead>
                                <TableHead className="text-center">Points</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {semester.courses.map((course, courseIndex) => (
                                <TableRow key={courseIndex}>
                                  <TableCell className="font-medium">
                                    {course.courseCode}
                                  </TableCell>
                                  <TableCell>{course.courseTitle}</TableCell>
                                  <TableCell className="text-center">{course.credits}</TableCell>
                                  <TableCell className="text-center">
                                    {course.assessment ? `${course.assessment}/10` : '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {course.midsem ? `${course.midsem}/20` : '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {course.exams ? `${course.exams}/70` : '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {course.total ? `${course.total}/100` : '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge className={gradeColors[course.grade] || "bg-gray-100 text-gray-800"}>
                                      {course.grade}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {course.gradePoint.toFixed(1)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="semester-summary mt-4 bg-green-50 p-3 rounded">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Semester Credits:</span> {semester.totalCredits}
                            </div>
                            <div>
                              <span className="font-medium">Grade Points:</span> {semester.totalGradePoints.toFixed(1)}
                            </div>
                            <div>
                              <span className="font-medium">Semester GPA:</span> {semester.semesterGPA.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Final Summary */}
                <div className="final-summary bg-green-700 text-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Academic Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{transcriptData.summary.totalCreditsEarned}</div>
                      <div className="text-sm opacity-90">Credits Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{transcriptData.summary.totalCreditsAttempted}</div>
                      <div className="text-sm opacity-90">Credits Attempted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{transcriptData.summary.cumulativeGPA.toFixed(2)}</div>
                      <div className="text-sm opacity-90">Cumulative GPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{transcriptData.summary.classStanding}</div>
                      <div className="text-sm opacity-90">Class Standing</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded">
                      <CheckCircle className="h-5 w-5" />
                      Academic Status: {transcriptData.summary.academicStatus}
                    </div>
                  </div>
                </div>

                {/* Official Footer */}
                <div className="footer text-center text-sm border-t-2 border-green-600 pt-6 mt-8">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-bold text-green-700 mb-2">🎓 UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</p>
                    <p className="font-semibold text-gray-700 mb-2">This is an official academic transcript issued by UCAES.</p>
                    <p className="text-gray-600 mb-1">
                      Generated on: <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}</span> at <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                    </p>
                    <p className="text-gray-600 mb-3">
                      Transcript ID: <span className="font-medium text-green-700">
                        UCAES-{transcriptData.student.registrationNumber}-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}
                      </span>
                    </p>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <p>This document contains confidential student information and should be handled accordingly.</p>
                      <p>For verification, contact the Academic Affairs Office at academic@ucaes.edu.gh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load transcript data.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Statistics Cards */}
      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">Search to View</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transcripts Available</p>
                  <p className="text-2xl font-bold">Search to View</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programs</p>
                  <p className="text-2xl font-bold">Multiple</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function TranscriptsPage() {
  return (
    <RouteGuard requiredPermissions={["transcript_generation"]}>
      <TranscriptsContent />
    </RouteGuard>
  )
}
