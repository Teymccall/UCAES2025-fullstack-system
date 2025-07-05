"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCourses } from "@/components/course-context"
import { useAuth } from "@/components/auth-context"
import { useStudents } from "@/components/student-context"
import { Search, Eye, Users, BookOpen, Calendar, MapPin, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AssignedCourses() {
  const { courses } = useCourses()
  const { user, isLoading, isAuthenticated, canAccessCourse } = useAuth()
  const { students, getStudentsByCourse } = useStudents()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [assignedCourses, setAssignedCourses] = useState<typeof courses>([])
  const [courseStudents, setCourseStudents] = useState<{ [courseId: string]: typeof students }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isLoading && user) {
      // Filter courses that the staff is assigned to
      const staffCourses = courses.filter(course => 
        user.assignedCourses?.includes(course.code) || canAccessCourse(course.code)
      )
      setAssignedCourses(staffCourses)
      
      // Get students for each course
      const studentsMap: { [courseId: string]: typeof students } = {}
      
      staffCourses.forEach(course => {
        studentsMap[course.id] = getStudentsByCourse(course.code)
      })
      
      setCourseStudents(studentsMap)
      setLoading(false)
    }
  }, [user, isLoading, isAuthenticated, courses, router, canAccessCourse, getStudentsByCourse])

  const filteredCourses = assignedCourses.filter(
    (course) =>
      course && ((course.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (course.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (course.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
  )

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading your courses...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Please log in to access your courses</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assigned Courses</h1>
        <p className="text-muted-foreground">Manage your assigned courses and students</p>
      </div>

      {/* Course Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCourses.length}</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedCourses.reduce((sum, course) => sum + (course.students || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                assignedCourses.reduce((sum, course) => sum + (course.students || 0), 0) / 
                (assignedCourses.length || 1),
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Students per course</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedCourses.reduce((sum, course) => sum + (course.credits || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Teaching load</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  try {
                    setSearchTerm(e.target.value)
                  } catch (error) {
                    console.error("Error updating search term:", error)
                  }
                }}
                className="pl-8"
              />
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses assigned to you yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name || 'Unnamed Course'}</div>
                        {course.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{course.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {course.department || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{course.credits || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.students || 0}
                      </div>
                    </TableCell>
                    <TableCell>{course.semester || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>
                        {course.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                {course.code} - {course.name}
                              </DialogTitle>
                              <DialogDescription>Course details and enrolled students</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Course Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Course Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">Code:</span> {course.code}
                                    </div>
                                    <div>
                                      <span className="font-medium">Credits:</span> {course.credits}
                                    </div>
                                    <div>
                                      <span className="font-medium">Department:</span> {course.department}
                                    </div>
                                    <div>
                                      <span className="font-medium">Semester:</span> {course.semester}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Prerequisites</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {course.prerequisites && course.prerequisites.length > 0 ? (
                                      course.prerequisites.map((prereq) => (
                                        <Badge key={prereq} variant="outline">
                                          {prereq}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">None</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {course.description && (
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">{course.description}</p>
                                </div>
                              )}

                              {/* Enrolled Students */}
                              <div>
                                <h4 className="font-medium mb-2">
                                  Enrolled Students ({courseStudents[course.id]?.length || 0})
                                </h4>
                                {courseStudents[course.id]?.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {courseStudents[course.id].map((student) => (
                                        <TableRow key={student.id}>
                                          <TableCell className="font-medium">{student.studentId}</TableCell>
                                          <TableCell>{student.name}</TableCell>
                                          <TableCell>{student.email}</TableCell>
                                          <TableCell>
                                            <Badge variant="secondary">{student.status}</Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    No students enrolled in this course
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
