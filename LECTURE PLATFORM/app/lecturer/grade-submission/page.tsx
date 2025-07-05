"use client"

import * as React from "react"
import { Search, Upload, Save, Download, Users, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sampleCourses, sampleStudents, sampleRegistrations } from "@/lib/sample-data"
import type { Student } from "@/lib/types"

interface StudentGrade {
  studentId: string
  student: Student
  grade: string
  remarks: string
}

export default function GradeSubmissionPage() {
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")
  const [selectedSemester, setSelectedSemester] = React.useState<string>("2024/2025 Semester 1")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [studentGrades, setStudentGrades] = React.useState<StudentGrade[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)

  const courses = sampleCourses.filter((course) => course.lecturerId === "lecturer-001")

  const gradeOptions = ["A", "B+", "B", "C+", "C", "D+", "D", "E", "F"]

  React.useEffect(() => {
    if (selectedCourse) {
      // Get students enrolled in the selected course
      const enrolledStudents = sampleRegistrations
        .filter((reg) => reg.courseId === selectedCourse && reg.status === "Active")
        .map((reg) => {
          const student = sampleStudents.find((s) => s.id === reg.studentId)
          return student
            ? {
                studentId: reg.studentId,
                student,
                grade: "",
                remarks: "",
              }
            : null
        })
        .filter(Boolean) as StudentGrade[]

      setStudentGrades(enrolledStudents)
    }
  }, [selectedCourse])

  const updateGrade = (studentId: string, field: "grade" | "remarks", value: string) => {
    setStudentGrades((prev) => prev.map((sg) => (sg.studentId === studentId ? { ...sg, [field]: value } : sg)))
  }

  const filteredStudents = studentGrades.filter(
    (sg) =>
      sg.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sg.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sg.student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmitGrades = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Here you would call your Firebase service
    // await FirebaseService.submitGrades(gradesToSubmit)

    setIsSubmitting(false)
    setShowConfirmDialog(false)

    // Show success message or redirect
    alert("Grades submitted successfully!")
  }

  const getGradesToSubmit = () => {
    return studentGrades.filter((sg) => sg.grade.trim() !== "")
  }

  const downloadTemplate = () => {
    const csvContent =
      "Student ID,Index Number,Student Name,Grade,Remarks\n" +
      studentGrades
        .map((sg) => `${sg.studentId},${sg.student.indexNumber},"${sg.student.firstName} ${sg.student.lastName}",,`)
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grade_template_${selectedCourse}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-green-800">Grade Submission</h1>
        <p className="text-green-600">Submit grades for your assigned courses</p>
      </div>

      {/* Course and Semester Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">Select Course and Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-green-700 mb-2 block">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-green-700 mb-2 block">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025 Semester 1">2024/2025 Semester 1</SelectItem>
                  <SelectItem value="2024/2025 Semester 2">2024/2025 Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Course Info and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      {courses.find((c) => c.id === selectedCourse)?.code} -{" "}
                      {courses.find((c) => c.id === selectedCourse)?.title}
                    </h3>
                    <p className="text-sm text-green-600">{studentGrades.length} students enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name or index number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  {filteredStudents.length} Student{filteredStudents.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Student Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((studentGrade) => (
                        <TableRow key={studentGrade.studentId} className="hover:bg-green-50">
                          <TableCell className="font-medium text-green-800">
                            {studentGrade.student.indexNumber}
                          </TableCell>
                          <TableCell>
                            {studentGrade.student.firstName} {studentGrade.student.lastName}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={studentGrade.grade}
                              onValueChange={(value) => updateGrade(studentGrade.studentId, "grade", value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Grade" />
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
                          <TableCell>
                            <Textarea
                              placeholder="Optional remarks..."
                              value={studentGrade.remarks}
                              onChange={(e) => updateGrade(studentGrade.studentId, "remarks", e.target.value)}
                              className="min-h-[60px] resize-none"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          {getGradesToSubmit().length > 0 && (
            <Card>
              <CardContent className="p-6">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have {getGradesToSubmit().length} grade(s) ready for submission. Once submitted, grades will be
                    sent to the Admin Panel for approval.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">Ready to submit {getGradesToSubmit().length} grade(s)</p>
                    <p className="text-sm text-green-600">
                      Grades will be pending approval until reviewed by administration
                    </p>
                  </div>

                  <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Submit Grades
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Grade Submission</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to submit {getGradesToSubmit().length} grade(s) for{" "}
                          {courses.find((c) => c.id === selectedCourse)?.code}? This action cannot be undone and grades
                          will be sent for approval.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitGrades}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? "Submitting..." : "Confirm Submit"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
