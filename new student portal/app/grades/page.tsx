"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Award, Search, TrendingUp, Calendar, BookOpen, Target, BarChart3, Loader2 } from "lucide-react"
import { useStudent } from "@/hooks/useStudent"
import {
  type SemesterResult,
  getStudentGrades,
  getGradesByYearAndSemester,
  calculateCumulativeGPA,
  getStudentRegistrations,
} from "@/lib/firebase-utils"
import { Loader } from "@/components/ui/loader"
import { useSystemConfig } from "@/components/system-config-provider"

const gradeColors: { [key: string]: string } = {
  A: "bg-green-100 text-green-800",
  "A-": "bg-green-100 text-green-700",
  "B+": "bg-blue-100 text-blue-800",
  B: "bg-blue-100 text-blue-700",
  "B-": "bg-yellow-100 text-yellow-800",
  "C+": "bg-orange-100 text-orange-800",
  C: "bg-orange-100 text-orange-700",
  D: "bg-red-100 text-red-800",
  F: "bg-red-200 text-red-900",
}

export default function Grades() {
  const { student, loading: studentLoading } = useStudent()
  const { currentAcademicYear, currentSemester } = useSystemConfig()
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedResult, setSelectedResult] = useState<SemesterResult | null>(null)
  const [allGrades, setAllGrades] = useState<SemesterResult[]>([])
  const [courseRegistrations, setCourseRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableSemesters = ["First", "Second"]
  
  // Helper function to normalize semester format
  const normalizeSemesterForSearch = (semester: string): string => {
    if (semester === "First" || semester === "1" || semester === "Semester 1") return "First"
    if (semester === "Second" || semester === "2" || semester === "Semester 2") return "Second"
    return semester
  }
  
  // Helper function to convert semester number to name
  const semesterNumberToName = (semester: string): string => {
    if (semester === "1" || semester === "Semester 1") return "First"
    if (semester === "2" || semester === "Semester 2") return "Second"
    return semester
  }

  // Fetch all grades and course registrations when student is loaded
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!student?.id) return

      try {
        setLoading(true)
        
        // Fetch published grades
        const grades = await getStudentGrades(student.id)
        setAllGrades(grades)
        
        // Fetch course registrations
        const registrations = await getStudentRegistrations(student.id)
        setCourseRegistrations(registrations)
        // Debug: Log available semesters and selected year
        console.log('Available Semesters:', availableSemesters)
        console.log('Selected Year:', selectedYear)
        console.log('Selected Semester:', selectedSemester)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch student data")
        console.error("Error fetching student data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [student?.id])

  // Get available years from both grades and course registrations
  const yearsFromGrades = allGrades
    .map((result) => result.academicYear)
    .filter(year => year && typeof year === 'string')
    .map(year => year.trim())
  
  const yearsFromRegistrations = courseRegistrations
    .map((reg) => reg.academicYear)
    .filter(year => year && typeof year === 'string')
    .map(year => year.trim())
  
  // Combine and remove duplicates, then sort
  const allYears = [...new Set([...yearsFromGrades, ...yearsFromRegistrations])]
    .filter(year => year && year.length > 0)
    .sort()
  
  // Debug logging
  console.log('Student ID:', student?.id)
  console.log('All Grades:', allGrades)
  console.log('Course Registrations:', courseRegistrations)
  console.log('Years from Grades:', yearsFromGrades)
  console.log('Years from Registrations:', yearsFromRegistrations)
  console.log('All Years (cleaned):', allYears)
  console.log('All Years length:', allYears.length)
  
  // Set default values from system config when data loads
  useEffect(() => {
    if (currentAcademicYear && !selectedYear) {
      setSelectedYear(currentAcademicYear);
      
      // Extract semester number from semester name if available
      if (currentSemester) {
        const semesterName = currentSemester.includes("First") ? "First" : 
                             currentSemester.includes("Second") ? "Second" : "";
        if (semesterName) {
          setSelectedSemester(semesterName);
        }
      }
    }
  }, [currentAcademicYear, currentSemester]);

  const handleSearch = async () => {
    if (!student?.id || !selectedYear || !selectedSemester) {
      console.log('❌ Missing required data for search:', {
        studentId: student?.id,
        selectedYear,
        selectedSemester
      })
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔍 Searching for grades: Student=${student.id}, Year=${selectedYear}, Semester=${selectedSemester}`)
      
      const result = await getGradesByYearAndSemester(student.id, selectedYear, selectedSemester)
      console.log('📊 Search result:', result)
      
      setSelectedResult(result)

      if (!result) {
        // Check if student has registrations for this period
        const hasRegistrations = courseRegistrations.some(reg => {
          const normalizedRegSemester = semesterNumberToName(reg.semester)
          const normalizedSelectedSemester = normalizeSemesterForSearch(selectedSemester)
          const match = reg.academicYear === selectedYear && normalizedRegSemester === normalizedSelectedSemester
          console.log(`📋 Checking registration: ${reg.academicYear} ${reg.semester} (normalized: ${normalizedRegSemester}) vs ${selectedYear} ${selectedSemester} (normalized: ${normalizedSelectedSemester}) = ${match}`)
          return match
        })
        
        console.log(`📝 Has registrations for ${selectedYear} ${selectedSemester}: ${hasRegistrations}`)
        console.log('📋 All registrations:', courseRegistrations.map(reg => ({
          year: reg.academicYear,
          semester: reg.semester
        })))
        
        if (hasRegistrations) {
          setError(`No published results found for ${selectedYear} - ${selectedSemester} Semester. Your results will be available here once they are published by the director.`)
        } else {
          setError(`No course registrations found for ${selectedYear} - ${selectedSemester} Semester. Please check if you registered for courses in this period.`)
        }
      } else {
        console.log('✅ Found results:', result)
      }
    } catch (err) {
      console.error("❌ Error fetching grades:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch grades")
    } finally {
      setLoading(false)
    }
  }

  const calculateCumulativeGPAUpToSemester = () => {
    if (!selectedResult) return "0.00"

    // Get all grades up to the selected semester
    const relevantResults = allGrades.filter((result) => {
      const [year] = result.academicYear.split("/")
      const [selectedYearStart] = selectedResult.academicYear.split("/")
      const yearNum = Number.parseInt(year)
      const selectedYearNum = Number.parseInt(selectedYearStart)

      if (yearNum < selectedYearNum) return true
      if (yearNum === selectedYearNum) {
        if (selectedResult.semester === "Second") return true
        return result.semester === "First"
      }
      return false
    })

    return calculateCumulativeGPA(relevantResults).toFixed(2)
  }

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Not Found</h3>
              <p className="text-gray-600">Unable to load student information. Please contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
          <Award className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades & Results</h1>
          <p className="text-gray-600">Check your academic performance by semester</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            Select Academic Period
          </CardTitle>
          <CardDescription>Choose the academic year and semester to view your results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {allYears.map((year, index) => (
                    <SelectItem key={`${year}-${index}`} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {availableSemesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedYear || !selectedSemester || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="relative h-4 w-4">
                    <Loader className="h-4 w-4" />
                  </div>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  View Results
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
              <p className="text-gray-600">
                {error.includes("No results found") 
                  ? "No published results found for the selected academic period. Results will be available here once they are published by the director."
                  : error
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {selectedResult && !error && (
        <>
          {/* Semester Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Semester Overview - {selectedResult.academicYear} ({selectedResult.semester} Semester)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedResult.totalCredits}</p>
                  <p className="text-sm text-gray-600">Total Credits</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedResult.semesterGPA.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Semester GPA</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{calculateCumulativeGPAUpToSemester()}</p>
                  <p className="text-sm text-gray-600">Cumulative GPA</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedResult.courses.length}</p>
                  <p className="text-sm text-gray-600">Courses Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Course Results
              </CardTitle>
              <CardDescription>Detailed breakdown of your performance in each course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Course Code</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Course Title</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Credits</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Assessment (10%)</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Mid-Semester (20%)</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Final Exam (70%)</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Total (100%)</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Grade</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.courses.map((course, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{course.courseCode}</td>
                        <td className="p-3 text-gray-700">{course.courseTitle}</td>
                        <td className="p-3 text-center text-gray-700">{course.credits}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            (course.assessment || 0) >= 8 ? 'bg-green-100 text-green-800' :
                            (course.assessment || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.assessment || 0}/10
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            (course.midsem || 0) >= 16 ? 'bg-green-100 text-green-800' :
                            (course.midsem || 0) >= 12 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.midsem || 0}/20
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            (course.exams || 0) >= 56 ? 'bg-green-100 text-green-800' :
                            (course.exams || 0) >= 42 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.exams || 0}/70
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={`px-3 py-1 rounded text-sm ${
                            (course.total || 0) >= 80 ? 'bg-green-100 text-green-800' :
                            (course.total || 0) >= 70 ? 'bg-blue-100 text-blue-800' :
                            (course.total || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            (course.total || 0) >= 50 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.total || 0}/100
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={gradeColors[course.grade] || "bg-gray-100 text-gray-800"}>
                            {course.grade}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-medium text-gray-900">{course.gradePoint.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="p-3 font-bold text-gray-900" colSpan={2}>
                        SEMESTER TOTALS
                      </td>
                      <td className="p-3 text-center font-bold text-gray-900">{selectedResult.totalCredits}</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center font-bold text-gray-900">
                        {selectedResult.semesterGPA.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Grade Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      selectedResult.courses.reduce(
                        (acc, course) => {
                          acc[course.grade] = (acc[course.grade] || 0) + 1
                          return acc
                        },
                        {} as { [key: string]: number },
                      ),
                    ).map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={gradeColors[grade] || "bg-gray-100 text-gray-800"}>{grade}</Badge>
                        </div>
                        <span className="text-sm text-gray-600">
                          {count} course{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Academic Standing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Semester GPA:</span>
                      <Badge
                        className={
                          selectedResult.semesterGPA >= 3.5
                            ? "bg-green-100 text-green-800"
                            : selectedResult.semesterGPA >= 3.0
                              ? "bg-blue-100 text-blue-800"
                              : selectedResult.semesterGPA >= 2.5
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedResult.semesterGPA >= 3.5
                          ? "Excellent"
                          : selectedResult.semesterGPA >= 3.0
                            ? "Very Good"
                            : selectedResult.semesterGPA >= 2.5
                              ? "Good"
                              : "Needs Improvement"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cumulative GPA:</span>
                      <span className="font-medium text-gray-900">{calculateCumulativeGPAUpToSemester()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Class Standing:</span>
                      <span className="font-medium text-gray-900">
                        {Number.parseFloat(calculateCumulativeGPAUpToSemester()) >= 3.6
                          ? "First Class"
                          : Number.parseFloat(calculateCumulativeGPAUpToSemester()) >= 3.0
                            ? "Second Class Upper"
                            : Number.parseFloat(calculateCumulativeGPAUpToSemester()) >= 2.5
                              ? "Second Class Lower"
                              : Number.parseFloat(calculateCumulativeGPAUpToSemester()) >= 2.0
                                ? "Third Class"
                                : "Pass"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Instructions */}
      {!selectedResult && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              How to Check Your Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. Select the academic year from the dropdown menu</p>
              <p>2. Choose the semester (First or Second)</p>
              <p>3. Click "View Results" to display your grades</p>
              <p>4. Review your course results, GPA, and performance analysis</p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Grade Scale</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>A: 4.0 (80-100%)</div>
                <div>A-: 3.7 (75-79%)</div>
                <div>B+: 3.5 (70-74%)</div>
                <div>B: 3.0 (65-69%)</div>
                <div>B-: 2.7 (60-64%)</div>
                <div>C+: 2.5 (55-59%)</div>
                <div>C: 2.0 (50-54%)</div>
                <div>D: 1.0 (45-49%)</div>
                <div>F: 0.0 (Below 45%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
