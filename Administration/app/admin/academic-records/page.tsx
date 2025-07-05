"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, Download, Check, X, Clock, FileSpreadsheet, GraduationCap, Settings } from "lucide-react"
import { sampleGrades, sampleCourses, sampleStudents } from "@/lib/sample-data"
import type { Grade } from "@/lib/types"

export default function AcademicRecords() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [pendingGrades, setPendingGrades] = useState<Grade[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")

  useEffect(() => {
    // Simulate fetching from Firebase
    setGrades(sampleGrades)
    setPendingGrades(sampleGrades.filter((g) => g.status === "pending"))
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGradeBadge = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      "A+": "bg-green-600 text-white",
      A: "bg-green-500 text-white",
      "B+": "bg-blue-500 text-white",
      B: "bg-blue-400 text-white",
      "C+": "bg-yellow-500 text-white",
      C: "bg-yellow-400 text-white",
      "D+": "bg-orange-500 text-white",
      D: "bg-orange-400 text-white",
      E: "bg-red-400 text-white",
      F: "bg-red-600 text-white",
    }

    return (
      <Badge
        className={`${gradeColors[grade] || "bg-gray-500 text-white"} hover:${gradeColors[grade] || "bg-gray-500"}`}
      >
        {grade}
      </Badge>
    )
  }

  const handleApproveGrade = (gradeId: string) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId
          ? { ...g, status: "approved" as const, approvedBy: "Registrar", approvedAt: new Date().toISOString() }
          : g,
      ),
    )
    setPendingGrades((prev) => prev.filter((g) => g.id !== gradeId))
  }

  const handleRejectGrade = (gradeId: string) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId
          ? { ...g, status: "rejected" as const, approvedBy: "Registrar", approvedAt: new Date().toISOString() }
          : g,
      ),
    )
    setPendingGrades((prev) => prev.filter((g) => g.id !== gradeId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Academic Records</h1>
        <p className="text-gray-600">Manage grades, submissions, and academic records</p>
      </div>

      <Tabs defaultValue="grade-upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grade-upload">Grade Upload</TabsTrigger>
          <TabsTrigger value="grade-approval">Grade Approval</TabsTrigger>
          <TabsTrigger value="semester-management">Semester Management</TabsTrigger>
          <TabsTrigger value="grade-reports">Grade Reports</TabsTrigger>
        </TabsList>

        {/* Grade Upload Tab */}
        <TabsContent value="grade-upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Manual Grade Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-700" />
                  Manual Grade Entry
                </CardTitle>
                <CardDescription>Enter grades individually for students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023/2024-First">2023/2024 - First</SelectItem>
                        <SelectItem value="2023/2024-Second">2023/2024 - Second</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedCourse && selectedSemester && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Student Grades</h4>
                      <div className="space-y-3">
                        {sampleStudents.slice(0, 3).map((student) => (
                          <div key={student.id} className="grid grid-cols-4 gap-2 items-center">
                            <div className="col-span-2">
                              <p className="text-sm font-medium">
                                {student.surname}, {student.otherNames}
                              </p>
                              <p className="text-xs text-gray-500">{student.indexNumber}</p>
                            </div>
                            <Select>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C+">C+</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="D+">D+</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                                <SelectItem value="F">F</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Remarks" className="h-8 text-xs" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-green-700 hover:bg-green-800">Submit Grades</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bulk Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-700" />
                  Bulk Grade Upload
                </CardTitle>
                <CardDescription>Upload grades using CSV file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm font-medium">Upload CSV file</p>
                    <p className="text-xs text-gray-500 mt-1">
                      File should contain: Index Number, Course Code, Grade, Remarks
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Download the CSV template to ensure proper formatting
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grade Approval Tab */}
        <TabsContent value="grade-approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Pending Grade Approvals ({pendingGrades.length})
              </CardTitle>
              <CardDescription>Review and approve grade submissions from lecturers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingGrades.map((grade) => {
                      const student = sampleStudents.find((s) => s.id === grade.studentId)
                      const course = sampleCourses.find((c) => c.id === grade.courseId)
                      return (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {student?.surname}, {student?.otherNames}
                              </p>
                              <p className="text-sm text-gray-500">{student?.indexNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course?.code}</p>
                              <p className="text-sm text-gray-500">{course?.title}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getGradeBadge(grade.grade)}</TableCell>
                          <TableCell>{grade.submittedBy}</TableCell>
                          <TableCell>{new Date(grade.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(grade.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                className="bg-green-700 hover:bg-green-800"
                                onClick={() => handleApproveGrade(grade.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectGrade(grade.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semester Management Tab */}
        <TabsContent value="semester-management" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-700" />
                  Current Academic Settings
                </CardTitle>
                <CardDescription>Manage current academic year and semester</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select defaultValue="2023/2024">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentSemester">Current Semester</Label>
                  <Select defaultValue="Second">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First">First Semester</SelectItem>
                      <SelectItem value="Second">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeDeadline">Grade Submission Deadline</Label>
                  <Input type="date" defaultValue="2024-02-15" />
                </div>
                <Button className="w-full bg-green-700 hover:bg-green-800">Update Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Calendar</CardTitle>
                <CardDescription>Important dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-sm text-gray-600">January 31, 2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Grade Submission</p>
                      <p className="text-sm text-gray-600">February 15, 2024</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Semester End</p>
                      <p className="text-sm text-gray-600">May 30, 2024</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grade Reports Tab */}
        <TabsContent value="grade-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution Reports</CardTitle>
              <CardDescription>Generate and view grade statistics and reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">85%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">3.2</div>
                  <div className="text-sm text-gray-600">Average GPA</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">12</div>
                  <div className="text-sm text-gray-600">Pending Grades</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">156</div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Grade Report
                </Button>
                <Button variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
