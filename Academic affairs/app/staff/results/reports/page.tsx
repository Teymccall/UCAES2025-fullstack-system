"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RouteGuard } from "@/components/route-guard"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { 
  Loader2, 
  Printer, 
  Search, 
  Download, 
  FileText, 
  Users, 
  TrendingUp, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react"

interface Row {
  id: string
  academicYear: string
  semester: string
  programme?: string
  programmeId?: string
  registrationNumber: string
  studentName?: string
  studentId?: string
  courseCode: string
  courseTitle?: string
  grade: string
  total: number
}

function CourseResultsReportContent() {
  const { toast } = useToast()
  
  // State management
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("First")
  const [courseCode, setCourseCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [programmeFilter, setProgrammeFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [courseInfo, setCourseInfo] = useState<{title?: string, lecturer?: string} | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // Enhanced filtering with multiple criteria
  const filtered = useMemo(() => {
    let result = rows
    
    // Text search filter
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(r =>
        r.registrationNumber.toLowerCase().includes(s) ||
        (r.studentName || "").toLowerCase().includes(s) ||
        (r.programme || "").toLowerCase().includes(s)
      )
    }
    
    // Grade filter
    if (gradeFilter !== "all") {
      result = result.filter(r => r.grade === gradeFilter)
    }
    
    // Programme filter
    if (programmeFilter !== "all") {
      result = result.filter(r => r.programme === programmeFilter)
    }
    
    return result.sort((a, b) => (a.registrationNumber || "").localeCompare(b.registrationNumber || ""))
  }, [rows, search, gradeFilter, programmeFilter])

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = filtered.length
    const gradeDistribution = filtered.reduce((acc, row) => {
      acc[row.grade] = (acc[row.grade] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const averageScore = total > 0 ? 
      filtered.reduce((sum, row) => sum + row.total, 0) / total : 0
    
    const passRate = total > 0 ? 
      (filtered.filter(row => ['A', 'B', 'C', 'D'].includes(row.grade)).length / total) * 100 : 0
    
    const programmes = [...new Set(filtered.map(r => r.programme).filter(Boolean))]
    
    return {
      total,
      gradeDistribution,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      programmes: programmes.length
    }
  }, [filtered])

  // Get unique values for filters
  const uniqueGrades = useMemo(() => 
    [...new Set(rows.map(r => r.grade))].sort(), [rows])
  
  const uniqueProgrammes = useMemo(() => 
    [...new Set(rows.map(r => r.programme).filter(Boolean))].sort(), [rows])

  const load = async () => {
    if (!academicYear || !semester || !courseCode) {
      toast({ title: "Missing filters", description: "Enter academic year, semester and course code", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const qSub = query(
        collection(db, "grade-submissions"),
        where("academicYear", "==", academicYear),
        where("semester", "==", semester),
        where("courseCode", "==", courseCode)
      )
      const snap = await getDocs(qSub)
      const out: Row[] = []
      for (const docSnap of snap.docs) {
        const d: any = docSnap.data()
        // 1) Inline grades array (newer flow)
        const grades: any[] = Array.isArray(d.grades) ? d.grades : []
        for (const g of grades) {
          out.push({
            id: `${docSnap.id}_${g.studentId || g.registrationNumber}`,
            academicYear: d.academicYear,
            semester: d.semester,
            programme: d.programme || d.program || undefined,
            programmeId: d.programmeId || undefined,
            registrationNumber: g.registrationNumber || g.indexNumber || g.studentId || "",
            studentName: g.studentName || undefined,
            studentId: g.studentId || undefined,
            courseCode: d.courseCode,
            courseTitle: d.courseTitle || undefined,
            grade: g.grade,
            total: Number(g.total || 0)
          })
        }
        // 2) Student-grades collection tied by submissionId (publishing path)
        try {
          const sgSnap = await getDocs(
            query(collection(db, "student-grades"), where("submissionId", "==", docSnap.id))
          )
          sgSnap.forEach(sg => {
            const g: any = sg.data()
            out.push({
              id: sg.id,
              academicYear: d.academicYear,
              semester: d.semester,
              programme: d.programme || d.program || g.programme || undefined,
              programmeId: d.programmeId || g.programmeId || undefined,
              registrationNumber: g.registrationNumber || g.indexNumber || g.studentId || "",
              studentName: g.studentName || undefined,
              studentId: g.studentId || undefined,
              courseCode: d.courseCode,
              courseTitle: d.courseTitle || undefined,
              grade: g.grade,
              total: Number(g.total || 0)
            })
          })
        } catch {}
      }

      // 3) Fallback legacy 'grades' collection (if above produced nothing)
      if (out.length === 0) {
        try {
          const legacy = await getDocs(
            query(
              collection(db, "grades"),
              where("academicYear", "==", academicYear),
              where("semester", "==", semester),
              where("courseCode", "==", courseCode)
            )
          )
          legacy.forEach(docSnap => {
            const g: any = docSnap.data()
            out.push({
              id: docSnap.id,
              academicYear: g.academicYear,
              semester: g.semester,
              programme: g.programme || undefined,
              programmeId: g.programmeId || undefined,
              registrationNumber: g.registrationNumber || g.indexNumber || g.studentId || "",
              studentName: g.studentName || undefined,
              studentId: g.studentId || undefined,
              courseCode: g.courseCode || courseCode,
              courseTitle: g.courseTitle || undefined,
              grade: g.grade,
              total: Number(g.total || 0)
            })
          })
        } catch {}
      }

      // Enrich missing student info from users/students
      const needLookup = out.filter(r => (!r.studentName || !r.registrationNumber) && r.studentId)
      const uniqueIds = Array.from(new Set(needLookup.map(r => r.studentId!)))
      for (const sid of uniqueIds) {
        try {
          // Try users first
          const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", sid)))
          let rec: any = null
          if (!userSnap.empty) rec = userSnap.docs[0].data()
          if (!rec) {
            // Try students by document id
            const sSnap = await getDocs(query(collection(db, "students"), where("id", "==", sid)))
            if (!sSnap.empty) rec = sSnap.docs[0].data()
          }
          if (rec) {
            out.forEach(r => {
              if (r.studentId === sid) {
                if (!r.studentName) r.studentName = rec.name || `${rec.firstName || ""} ${rec.surname || ""}`.trim()
                if (!r.registrationNumber) r.registrationNumber = rec.registrationNumber || rec.indexNumber || rec.studentId || r.registrationNumber
              }
            })
          }
        } catch {}
      }

      setRows(out.sort((a,b)=> (a.registrationNumber || "").localeCompare(b.registrationNumber || "")))
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message || "Could not load results" , variant: "destructive"})
    } finally { setIsLoading(false) }
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const w = window.open("", "print")
    if (!w) return
    const html = printRef.current.innerHTML
    w.document.write(`<html><head><title>Course Results Report</title><style>
      body{font-family: sans-serif;}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ddd;padding:6px;font-size:12px}
      th{text-align:left;background:#f5f5f5}
      h2{margin:0 0 8px 0}
      .meta{margin-bottom:8px;font-size:12px}
    </style></head><body>${html}</body></html>`)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  useEffect(()=>{
    // optional defaults
    const y = new Date().getFullYear()
    setAcademicYear(`${y}/${y+1}`)
  },[])

  // CSV Export function
  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast({ title: "No data to export", description: "Load course results first", variant: "destructive" })
      return
    }

    const csvContent = [
      // Header row
      ['Programme', 'Registration Number', 'Student Name', 'Course Code', 'Course Title', 'Total Score', 'Grade', 'Academic Year', 'Semester'].join(','),
      // Data rows
      ...filtered.map(row => [
        row.programme || '',
        row.registrationNumber,
        row.studentName || '',
        row.courseCode,
        row.courseTitle || '',
        row.total,
        row.grade,
        row.academicYear,
        row.semester
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${courseCode}_${academicYear}_${semester}_results.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: 'Export Successful',
      description: `Course results exported to CSV`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Course Results Report
          </h1>
          <p className="text-muted-foreground">Generate comprehensive course performance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          {rows.length > 0 && (
            <Badge variant="secondary">
              {filtered.length} of {rows.length} results
            </Badge>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.averageScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.passRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programmes</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.programmes}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Distribution */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center p-3 rounded-lg border">
                  <div className={`text-2xl font-bold ${
                    grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-blue-600' :
                    grade === 'C' ? 'text-yellow-600' :
                    grade === 'D' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {count}
                  </div>
                  <div className="text-sm text-muted-foreground">Grade {grade}</div>
                  <div className="text-xs text-muted-foreground">
                    {statistics.total > 0 ? Math.round((count / statistics.total) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Course Results Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            {/* Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Academic Year</label>
                <Input 
                  placeholder="e.g., 2024/2025" 
                  value={academicYear} 
                  onChange={e => setAcademicYear(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Semester</label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First Semester</SelectItem>
                    <SelectItem value="Second">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Course Code</label>
                <Input 
                  placeholder="e.g., CSC101" 
                  value={courseCode} 
                  onChange={e => setCourseCode(e.target.value.toUpperCase())} 
                />
              </div>
            </div>

            {/* Secondary Filters */}
            {rows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    className="pl-8" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
                </div>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {uniqueGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programmes</SelectItem>
                    {uniqueProgrammes.map(programme => (
                      <SelectItem key={programme} value={programme}>{programme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearch("")
                    setGradeFilter("all")
                    setProgrammeFilter("all")
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={load} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isLoading ? 'Loading...' : 'Load Results'}
              </Button>
              {rows.length > 0 && (
                <>
                  <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Report
                  </Button>
                  <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div ref={printRef}>
            {/* Print Header */}
            <div className="print-header mb-4 hidden print:block">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold">University College of Agriculture and Environmental Studies</h1>
                <h2 className="text-xl font-semibold">Course Results Report</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <strong>Academic Year:</strong> {academicYear}<br />
                  <strong>Semester:</strong> {semester} Semester<br />
                  <strong>Course Code:</strong> {courseCode}
                </div>
                <div>
                  <strong>Total Students:</strong> {filtered.length}<br />
                  <strong>Average Score:</strong> {statistics.averageScore}%<br />
                  <strong>Pass Rate:</strong> {statistics.passRate}%
                </div>
              </div>
            </div>

            {/* Course Information */}
            {courseInfo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{courseInfo.title}</h3>
                {courseInfo.lecturer && <p className="text-sm text-muted-foreground">Lecturer: {courseInfo.lecturer}</p>}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">S/N</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead className="text-center">Total Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, index) => (
                    <TableRow key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.registrationNumber}</TableCell>
                      <TableCell>{row.studentName || '-'}</TableCell>
                      <TableCell>{row.programme || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          row.total >= 80 ? 'bg-green-100 text-green-800' :
                          row.total >= 70 ? 'bg-blue-100 text-blue-800' :
                          row.total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          row.total >= 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.total}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${
                          row.grade === 'A' ? 'bg-green-600 text-white' :
                          row.grade === 'B' ? 'bg-blue-600 text-white' :
                          row.grade === 'C' ? 'bg-yellow-600 text-white' :
                          row.grade === 'D' ? 'bg-orange-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {row.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={['A', 'B', 'C', 'D'].includes(row.grade) ? 'default' : 'destructive'}>
                          {['A', 'B', 'C', 'D'].includes(row.grade) ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {rows.length === 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No results loaded</p>
                            <p className="text-sm text-muted-foreground">Enter course details and click "Load Results"</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No results match your filters</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Print Footer */}
            {filtered.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground print:block">
                <div className="flex justify-between items-center">
                  <div>
                    Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </div>
                  <div>
                    Total Records: {filtered.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CourseResultsReportPage(){
  return (
    <RouteGuard requiredPermissions={["results_approval"]}>
      <CourseResultsReportContent/>
    </RouteGuard>
  )
}


