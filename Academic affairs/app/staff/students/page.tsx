"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStudents } from "@/components/student-context"
import { useCourses } from "@/components/course-context"
import { Search, Eye, Users, GraduationCap, TrendingUp } from "lucide-react"

export default function StudentRecords() {
  const { students, results } = useStudents()
  const { courses } = useCourses()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Filter students based on staff's assigned courses
  const assignedCourses = courses.filter(
    (course) => course.instructor === "Prof. Michael Chen" || course.status === "active",
  )
  const assignedCourseCodes = assignedCourses.map((course) => course.code)

  const accessibleStudents = students.filter((student) =>
    student.enrolledCourses.some((courseCode) => assignedCourseCodes.includes(courseCode)),
  )

  const filteredStudents = accessibleStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProgram = selectedProgram === "all" || student.program === selectedProgram
    const matchesLevel = selectedLevel === "all" || student.level === selectedLevel

    return matchesSearch && matchesProgram && matchesLevel
  })

  const programs = Array.from(new Set(accessibleStudents.map((student) => student.program)))
  const levels = Array.from(new Set(accessibleStudents.map((student) => student.level)))

  const getStudentResults = (studentId: string) => {
    return results.filter((result) => result.studentId === studentId)
  }

  const getStudentCourses = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId)
    if (!student) return []

    return student.enrolledCourses
      .map((courseCode) => courses.find((course) => course.code === courseCode))
      .filter(Boolean)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Records</h1>
        <p className="text-muted-foreground">View academic records for students in your assigned courses</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessibleStudents.length}</div>
            <p className="text-xs text-muted-foreground">Students in your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">Different programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(accessibleStudents.reduce((sum, student) => sum + student.cgpa, 0) / accessibleStudents.length).toFixed(
                2,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessibleStudents.filter((student) => student.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, student ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.studentId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Level {student.level}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{student.gpa.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">{student.cgpa.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>
                            {student.name} ({student.studentId})
                          </DialogTitle>
                          <DialogDescription>Academic record and course history</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Student Information */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Student Information</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Student ID:</span> {student.studentId}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {student.email}
                                </div>
                                <div>
                                  <span className="font-medium">Program:</span> {student.program}
                                </div>
                                <div>
                                  <span className="font-medium">Level:</span> {student.level}
                                </div>
                                <div>
                                  <span className="font-medium">Semester:</span> {student.semester}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Academic Performance</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Current GPA:</span> {student.gpa.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">Cumulative GPA:</span> {student.cgpa.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span>{" "}
                                  <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                    {student.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enrolled Courses */}
                          <div>
                            <h4 className="font-medium mb-2">Enrolled Courses</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {getStudentCourses(student.studentId).map((course) => (
                                <div key={course?.id} className="p-3 border rounded-lg">
                                  <div className="font-medium">{course?.code}</div>
                                  <div className="text-sm text-muted-foreground">{course?.name}</div>
                                  <div className="text-xs text-muted-foreground">{course?.credits} credits</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Academic Results */}
                          <div>
                            <h4 className="font-medium mb-2">Academic Results</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Course</TableHead>
                                  <TableHead>Midterm</TableHead>
                                  <TableHead>Final</TableHead>
                                  <TableHead>Assignments</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getStudentResults(student.studentId).map((result) => (
                                  <TableRow key={result.id}>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{result.courseCode}</div>
                                        <div className="text-sm text-muted-foreground">{result.courseName}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{result.midterm || "-"}</TableCell>
                                    <TableCell>{result.final || "-"}</TableCell>
                                    <TableCell>{result.assignments || "-"}</TableCell>
                                    <TableCell className="font-medium">{result.total}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          result.grade.startsWith("A")
                                            ? "default"
                                            : result.grade.startsWith("B")
                                              ? "secondary"
                                              : result.grade === "F"
                                                ? "destructive"
                                                : "outline"
                                        }
                                      >
                                        {result.grade}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          result.status === "approved"
                                            ? "default"
                                            : result.status === "submitted"
                                              ? "secondary"
                                              : "outline"
                                        }
                                      >
                                        {result.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {getStudentResults(student.studentId).length === 0 && (
                              <div className="text-center py-4 text-muted-foreground">
                                No results available for this student
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedProgram !== "all" || selectedLevel !== "all"
                  ? "Try adjusting your search criteria"
                  : "No students are enrolled in your assigned courses"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
