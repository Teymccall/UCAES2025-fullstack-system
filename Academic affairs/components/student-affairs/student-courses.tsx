"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"
import { CoursesService, Course, Program, ProgramsService } from "@/lib/firebase-service"
import { useToast } from "@/components/ui/use-toast"

interface StudentCoursesProps {
  studentId?: string
  programId?: string
  currentLevel?: number
  currentSemester?: number
}

interface EnrollmentStatus {
  isEnrolled: boolean
  isEligible: boolean
  message?: string
}

export default function StudentCourses({
  studentId = "",
  programId = "",
  currentLevel = 100,
  currentSemester = 1
}: StudentCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState<{[key: string]: EnrollmentStatus}>({})
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      if (!programId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Load program details
        const programData = await ProgramsService.getById(programId)
        setProgram(programData)
        
        // Load courses for this program
        const programCourses = await CoursesService.getByProgram(programId)
        
        // Filter courses by level and semester
        const filteredCourses = programCourses.filter(course => 
          course.level === currentLevel && 
          (!course.semester || course.semester === currentSemester)
        )
        
        setCourses(filteredCourses)
        
        // Check enrollment status for each course
        const enrollmentChecks: {[key: string]: EnrollmentStatus} = {}
        
        for (const course of filteredCourses) {
          if (course.id) {
            // In a real app, check the database for actual enrollment status
            enrollmentChecks[course.id] = {
              isEnrolled: false,
              isEligible: true
            }
          }
        }
        
        setEnrollmentStatus(enrollmentChecks)
      } catch (error) {
        console.error("Error loading student courses:", error)
        toast({
          title: "Error loading courses",
          description: "Could not load courses for the selected program",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [programId, currentLevel, currentSemester, toast])

  const enrollInCourse = async (courseId: string) => {
    if (!courseId || !studentId) return
    
    try {
      // In a real app, make an API call to enroll the student
      // For now, just update the local state
      setEnrollmentStatus(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          isEnrolled: true,
          message: "Successfully enrolled"
        }
      }))
      
      toast({
        title: "Success",
        description: "You have been enrolled in this course",
        variant: "default"
      })
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Enrollment Failed",
        description: "Could not enroll in the selected course",
        variant: "destructive"
      })
    }
  }

  const unenrollFromCourse = async (courseId: string) => {
    if (!courseId || !studentId) return
    
    try {
      // In a real app, make an API call to unenroll the student
      // For now, just update the local state
      setEnrollmentStatus(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          isEnrolled: false,
          message: "Successfully unenrolled"
        }
      }))
      
      toast({
        title: "Success",
        description: "You have been unenrolled from this course",
        variant: "default"
      })
    } catch (error) {
      console.error("Error unenrolling from course:", error)
      toast({
        title: "Action Failed",
        description: "Could not unenroll from the selected course",
        variant: "destructive"
      })
    }
  }

  if (!programId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Courses</CardTitle>
          <CardDescription>
            No program selected. Please select a program to view available courses.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Courses</CardTitle>
        <CardDescription>
          {program ? `${program.name} - Level ${currentLevel}, Semester ${currentSemester}` : 'Loading program information...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <Info className="h-8 w-8 mb-4" />
            <p>No courses available for this program, level, and semester.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden md:table-cell">Prerequisites</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const status = course.id ? enrollmentStatus[course.id] : null
                const isEnrolled = status?.isEnrolled || false
                
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.department}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.prerequisites?.length ? course.prerequisites.join(", ") : "None"}
                    </TableCell>
                    <TableCell>
                      {isEnrolled ? (
                        <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEnrolled ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => course.id && unenrollFromCourse(course.id)}
                        >
                          Unenroll
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => course.id && enrollInCourse(course.id)}
                        >
                          Enroll
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 