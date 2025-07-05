"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Calendar, Download, FileText, BarChart3, PieChart } from "lucide-react"
import { sampleStudents, sampleCourses, sampleRegistrations } from "@/lib/sample-data"

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("student-stats")
  const [selectedPeriod, setSelectedPeriod] = useState("2023/2024")

  // Calculate statistics
  const totalStudents = sampleStudents.length
  const activeStudents = sampleStudents.filter((s) => s.status === "Active").length
  const graduatedStudents = sampleStudents.filter((s) => s.status === "Graduated").length
  const totalCourses = sampleCourses.length
  const activeCourses = sampleCourses.filter((c) => c.status === "Active").length

  // Program distribution
  const programStats = sampleStudents.reduce(
    (acc, student) => {
      acc[student.programme] = (acc[student.programme] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Level distribution
  const levelStats = sampleStudents.reduce(
    (acc, student) => {
      acc[student.level] = (acc[student.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Registration statistics
  const registrationStats = {
    total: sampleRegistrations.length,
    approved: sampleRegistrations.filter((r) => r.status === "approved").length,
    pending: sampleRegistrations.filter((r) => r.status === "pending").length,
    rejected: sampleRegistrations.filter((r) => r.status === "rejected").length,
  }

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`)
    // In a real app, this would trigger report generation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and view analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023/2024">2023/2024</SelectItem>
              <SelectItem value="2022/2023">2022/2023</SelectItem>
              <SelectItem value="2021/2022">2021/2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="student-reports">Student Reports</TabsTrigger>
          <TabsTrigger value="academic-reports">Academic Reports</TabsTrigger>
          <TabsTrigger value="custom-reports">Custom Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-green-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last year
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeStudents}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalCourses}</div>
                <p className="text-xs text-muted-foreground">{activeCourses} active courses</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                <PieChart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{registrationStats.total}</div>
                <p className="text-xs text-muted-foreground">{registrationStats.approved} approved</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(programStats).map(([program, count]) => (
                    <div key={program} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{program}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-700 h-2 rounded-full"
                            style={{ width: `${(count / totalStudents) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(levelStats).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm font-medium">Level {level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / totalStudents) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Student Reports Tab */}
        <TabsContent value="student-reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Enrollment Report</CardTitle>
                <CardDescription>Complete list of enrolled students with details</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-green-700 hover:bg-green-800"
                  onClick={() => generateReport("student-enrollment")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Demographics</CardTitle>
                <CardDescription>Age, gender, and nationality statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => generateReport("demographics")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Graduation Eligibility</CardTitle>
                <CardDescription>Students eligible for graduation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => generateReport("graduation-eligibility")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Reports Tab */}
        <TabsContent value="academic-reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grade Distribution</CardTitle>
                <CardDescription>Grade statistics across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-green-700 hover:bg-green-800"
                  onClick={() => generateReport("grade-distribution")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Enrollment</CardTitle>
                <CardDescription>Student enrollment per course</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => generateReport("course-enrollment")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Performance</CardTitle>
                <CardDescription>GPA and performance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => generateReport("academic-performance")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create custom reports with specific criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student-stats">Student Statistics</SelectItem>
                      <SelectItem value="course-stats">Course Statistics</SelectItem>
                      <SelectItem value="grade-analysis">Grade Analysis</SelectItem>
                      <SelectItem value="registration-report">Registration Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2022/2023">2022/2023</SelectItem>
                      <SelectItem value="all-time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={() => generateReport("custom")}>
                <Download className="mr-2 h-4 w-4" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
