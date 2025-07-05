"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useStudents, type Student } from "@/components/student-context"
import { useCourses } from "@/components/course-context"
import { Search, Plus, Trash2, BookOpen, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StaffStudentManagement() {
  const {
    searchStudents,
    addCourseToStudent,
    removeCourseFromStudent,
    validateCoursePrerequisites,
    getStudentByIndex,
    updateStudentInfo,
  } = useStudents()
  const { courses } = useCourses()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isManagingCourses, setIsManagingCourses] = useState(false)
  const [courseToAdd, setCourseToAdd] = useState("")

  // Add these state variables and functions
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [showAcademicHistory, setShowAcademicHistory] = useState(false)

  // Filter courses that staff can manage (only their assigned courses)
  const assignedCourses = courses.filter(
    (course) => course.instructor === "Prof. Michael Chen" || course.status === "active",
  )

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a student ID or name to search",
        variant: "destructive",
      })
      return
    }

    try {
      const results = searchStudents(searchQuery.trim())
      setSearchResults(results || [])

      if (!results || results.length === 0) {
        toast({
          title: "No Results",
          description: "No students found matching your search criteria",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      })
      setSearchResults([])
    }
  }

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsManagingCourses(true)
  }

  // Enhanced validation function
  const validateCourseRegistration = async (studentId: string, courseCode: string) => {
    const validationResults = {
      prerequisites: validateCoursePrerequisites(studentId, courseCode),
      capacity: validateEnrollmentCapacity(courseCode),
      staffAccess: validateStaffCourseAccess("STAFF001", courseCode),
      alreadyEnrolled: selectedStudent?.enrolledCourses.includes(courseCode),
    }

    return validationResults
  }

  // Enhanced handleAddCourse with comprehensive validation
  const handleAddCourse = async () => {
    if (!selectedStudent || !courseToAdd) return

    const validation = await validateCourseRegistration(selectedStudent.studentId, courseToAdd)

    if (!validation.staffAccess) {
      toast({
        title: "Access Denied",
        description: "You can only register students for courses you teach",
        variant: "destructive",
      })
      return
    }

    if (validation.alreadyEnrolled) {
      toast({
        title: "Already Enrolled",
        description: "Student is already enrolled in this course",
        variant: "destructive",
      })
      return
    }

    if (!validation.prerequisites.valid) {
      toast({
        title: "Prerequisites Not Met",
        description: `Student must complete: ${validation.prerequisites.missingPrereqs.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    if (!validation.capacity.canEnroll) {
      toast({
        title: "Course Full",
        description: `Course has reached maximum capacity (${validation.capacity.maxCapacity} students)`,
        variant: "destructive",
      })
      return
    }

    // Log the action
    addAuditLog({
      action: "COURSE_ADDED",
      performedBy: "Prof. Michael Chen",
      performedByRole: "staff",
      targetStudentId: selectedStudent.studentId,
      details: `Added course ${courseToAdd} to student registration`,
    })

    const success = addCourseToStudent(selectedStudent.studentId, courseToAdd)
    if (success) {
      toast({
        title: "Course Added Successfully",
        description: `${selectedStudent.name} has been registered for ${courseToAdd}`,
      })
      // Refresh student data and clear form
      const updatedStudent = getStudentByIndex(selectedStudent.studentId)
      if (updatedStudent) setSelectedStudent(updatedStudent)
      setCourseToAdd("")
    }
  }

  const handleRemoveCourse = (courseCode: string) => {
    if (!selectedStudent) return

    // Check if staff is authorized to remove this course
    const course = courses.find((c) => c.code === courseCode)
    if (course && course.instructor !== "Prof. Michael Chen") {
      toast({
        title: "Unauthorized",
        description: "You can only manage courses you teach",
        variant: "destructive",
      })
      return
    }

    const success = removeCourseFromStudent(selectedStudent.studentId, courseCode)
    if (success) {
      toast({
        title: "Course Removed",
        description: `Successfully removed ${courseCode} from ${selectedStudent.name}'s registration`,
      })
      // Refresh the selected student data
      const updatedStudent = getStudentByIndex(selectedStudent.studentId)
      if (updatedStudent) setSelectedStudent(updatedStudent)
    }
  }

  const getAvailableCourses = () => {
    if (!selectedStudent) return []
    return assignedCourses.filter((course) => !selectedStudent.enrolledCourses.includes(course.code))
  }

  const getStudentCourses = () => {
    if (!selectedStudent) return []
    return selectedStudent.enrolledCourses
      .map((courseCode) => courses.find((c) => c.code === courseCode))
      .filter(Boolean)
      .filter((course) => assignedCourses.some((ac) => ac.code === course?.code))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">Search and manage student course registrations</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-query">Student ID or Name</Label>
              <Input
                id="search-query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter student ID (e.g., ST001) or student name"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Enrolled Courses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.program}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Level {student.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledCourses.slice(0, 3).map((course) => (
                          <Badge key={course} variant="secondary" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                        {student.enrolledCourses.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.enrolledCourses.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleSelectStudent(student)}>
                        Manage Courses
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Course Management Dialog */}
      <Dialog open={isManagingCourses} onOpenChange={setIsManagingCourses}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Course Registration</DialogTitle>
            <DialogDescription>
              {selectedStudent && `Managing courses for ${selectedStudent.name} (${selectedStudent.studentId})`}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Student Information</Label>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {selectedStudent.studentId}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {selectedStudent.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedStudent.email}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Academic Information</Label>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Program:</span> {selectedStudent.program}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {selectedStudent.level}
                    </div>
                    <div>
                      <span className="font-medium">CGPA:</span> {selectedStudent.cgpa.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Course Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <Label className="text-base font-medium">Add Course</Label>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={courseToAdd} onValueChange={setCourseToAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCourses().map((course) => (
                          <SelectItem key={course.code} value={course.code}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddCourse} disabled={!courseToAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Course
                  </Button>
                </div>
                {getAvailableCourses().length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No available courses that you can register this student for.
                  </p>
                )}
              </div>

              {/* Current Courses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <Label className="text-base font-medium">Current Courses (Your Courses Only)</Label>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getStudentCourses().map((course) => (
                      <TableRow key={course?.id}>
                        <TableCell className="font-medium">{course?.code}</TableCell>
                        <TableCell>{course?.name}</TableCell>
                        <TableCell>{course?.credits}</TableCell>
                        <TableCell>{course?.instructor}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {course?.code} from {selectedStudent.name}'s
                                  registration? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => course && handleRemoveCourse(course.code)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Course
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getStudentCourses().length === 0 && (
                  <p className="text-sm text-muted-foreground">Student is not enrolled in any of your courses.</p>
                )}
              </div>

              {/* Authorization Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Access Restrictions</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      As a staff member, you can only manage course registrations for courses that you teach. For
                      registrations in other courses, please contact the respective course instructor or the academic
                      director.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingCourses(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Dummy functions for validation and audit logging
const validateEnrollmentCapacity = (courseCode: string) => {
  // Replace with actual implementation
  return { canEnroll: true, maxCapacity: 50 }
}

const validateStaffCourseAccess = (staffId: string, courseCode: string) => {
  // Replace with actual implementation
  return true
}

const addAuditLog = (log: AuditLog) => {
  // Replace with actual implementation
  console.log("Audit Log:", log)
}

interface AuditLog {
  action: string
  performedBy: string
  performedByRole: string
  targetStudentId: string
  details: string
}
