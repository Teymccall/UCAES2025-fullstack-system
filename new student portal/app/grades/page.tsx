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
} from "@/lib/firebase-utils"

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
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedResult, setSelectedResult] = useState<SemesterResult | null>(null)
  const [allGrades, setAllGrades] = useState<SemesterResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableSemesters = ["First", "Second"]

  // Fetch all grades when student is loaded
  useEffect(() => {
    const fetchAllGrades = async () => {
      if (!student?.id) return

      try {
        setLoading(true)
        const grades = await getStudentGrades(student.id)
        setAllGrades(grades)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch grades")
        console.error("Error fetching grades:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllGrades()
  }, [student?.id])

  // Get available years from fetched grades
  const availableYears = [...new Set(allGrades.map((result) => result.academicYear))].sort()

  const handleSearch = async () => {
    if (!student?.id || !selectedYear || !selectedSemester) return

    try {
      setLoading(true)
      setError(null)
      const result = await getGradesByYearAndSemester(student.id, selectedYear, selectedSemester)
      setSelectedResult(result)

      if (!result) {
        setError(`No results found for ${selectedYear} - ${selectedSemester} Semester`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grades")
      console.error("Error fetching grades:", err)
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
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading student data...</span>
        </div>
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
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
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
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              View Results
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
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
                      <th className="text-center p-3 font-semibold text-gray-700">Grade</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Grade Point</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.courses.map((course, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{course.courseCode}</td>
                        <td className="p-3 text-gray-700">{course.courseTitle}</td>
                        <td className="p-3 text-center text-gray-700">{course.credits}</td>
                        <td className="p-3 text-center">
                          <Badge className={gradeColors[course.grade] || "bg-gray-100 text-gray-800"}>
                            {course.grade}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-medium text-gray-900">{course.gradePoint.toFixed(1)}</td>
                        <td className="p-3 text-center font-medium text-gray-900">{course.totalPoints.toFixed(1)}</td>
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
                      <td className="p-3 text-center font-bold text-gray-900">
                        {selectedResult.semesterGPA.toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-900">
                        {selectedResult.totalGradePoints.toFixed(1)}
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
