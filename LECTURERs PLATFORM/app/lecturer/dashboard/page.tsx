"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth-context"
import { useSystemConfig } from "@/components/system-config-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Users, Calendar } from "lucide-react"

interface LecturerAssignment {
  id: string
  lecturerId: string
  academicYearId: string
  academicSemesterId: string
  programId: string
  courseId: string
  programmeCourseType: "Regular" | "Weekend"
  level: number
  status: string
}

interface Course {
  id: string
  code: string
  title: string
  level: number
  semester: number
  credits: number
}

interface Program {
  id: string
  name: string
  code: string
}

interface AcademicYear {
  id: string
  name: string
  year: string
}

interface AcademicSemester {
  id: string
  name: string
  academicYearId: string
}

export default function LecturerDashboard() {
  const { user } = useAuth()
  const { 
    currentAcademicYear, 
    currentAcademicYearId,
    currentSemester,
    currentSemesterId,
    isLoading: configLoading
  } = useSystemConfig()
  const [isLoading, setIsLoading] = useState(true)
  const [assignments, setAssignments] = useState<LecturerAssignment[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicSemesters, setAcademicSemesters] = useState<AcademicSemester[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturerDetails, setLecturerDetails] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        // First get the lecturer ID from users collection
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("email", "==", user.email))
        const userSnapshot = await getDocs(q)
        
        if (userSnapshot.empty) {
          console.error("User not found in database")
          setIsLoading(false)
          return
        }
        
        const lecturerId = userSnapshot.docs[0].id
        const lecturerData = userSnapshot.docs[0].data()
        setLecturerDetails(lecturerData)
        
        // Fetch lecturer assignments
        const assignmentsRef = collection(db, "lecturer-assignments")
        const assignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId))
        const assignmentsSnapshot = await getDocs(assignmentsQuery)
        
        const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LecturerAssignment))
        
        setAssignments(assignmentsData)
        
        // Fetch courses
        const coursesRef = collection(db, "academic-courses")
        const coursesSnapshot = await getDocs(coursesRef)
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course))
        
        setCourses(coursesData)
        
        // Fetch programs
        const programsRef = collection(db, "academic-programs")
        const programsSnapshot = await getDocs(programsRef)
        const programsData = programsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Program))
        
        setPrograms(programsData)
        
        // Fetch academic years (still needed for historical data)
        const yearsRef = collection(db, "academic-years")
        const yearsSnapshot = await getDocs(yearsRef)
        const yearsData = yearsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AcademicYear))
        
        setAcademicYears(yearsData)
        
        // Fetch academic semesters (still needed for historical data)
        const semestersRef = collection(db, "academic-semesters")
        const semestersSnapshot = await getDocs(semestersRef)
        const semestersData = semestersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AcademicSemester))
        
        setAcademicSemesters(semestersData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  // Helper functions
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? `${course.code} - ${course.title}` : "Unknown Course"
  }
  
  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program ? program.name : "Unknown Program"
  }
  
  const getAcademicYearName = (yearId: string) => {
    const year = academicYears.find(y => y.id === yearId)
    return year ? year.name : "Unknown Year"
  }
  
  const getSemesterName = (semesterId: string) => {
    const semester = academicSemesters.find(s => s.id === semesterId)
    return semester ? semester.name : "Unknown Semester"
  }
  
  // Calculate statistics
  const totalAssignments = assignments.length
  const totalPrograms = new Set(assignments.map(a => a.programId)).size
  const totalCourses = new Set(assignments.map(a => a.courseId)).size
  const uniqueLevels = new Set(assignments.map(a => a.level))
  const totalLevels = uniqueLevels.size

  // Use the centralized system config for current assignments
  const currentAssignments = assignments.filter(a => 
    currentAcademicYearId && a.academicYearId === currentAcademicYearId &&
    currentSemesterId && a.academicSemesterId === currentSemesterId
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[100px] w-full" />
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {lecturerDetails?.name || user?.displayName || "Lecturer"}
        </p>
      </div>
      
      {/* Add Academic Period Banner */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">Current Academic Period</h3>
              <p className="text-blue-600">
                {configLoading ? "Loading..." : 
                  `${currentAcademicYear || "No active year"} • ${currentSemester || "No active semester"}`}
              </p>
            </div>
            <Badge variant="outline" className="mt-2 sm:mt-0 border-blue-300 text-blue-800">
              {configLoading ? "..." : currentSemester ? "Active" : "Not Set"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalCourses}</div>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalPrograms}</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Levels Taught</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalLevels}</div>
              <div className="flex flex-wrap gap-1">
                {Array.from(uniqueLevels).map(level => (
                  <Badge key={level} variant="outline">{level}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentAssignments.length}</div>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSemester || "No active semester"} {currentAcademicYear || ""}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Courses</CardTitle>
          <CardDescription>
            All courses assigned to you across programs and academic periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="current">Current Semester</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses assigned to you yet
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div 
                      key={assignment.id} 
                      className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{getCourseName(assignment.courseId)}</h3>
                        <p className="text-sm text-muted-foreground">{getProgramName(assignment.programId)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{getAcademicYearName(assignment.academicYearId)}</div>
                        <div className="text-sm text-muted-foreground">{getSemesterName(assignment.academicSemesterId)}</div>
                        <div className="mt-1">
                          <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                            {assignment.programmeCourseType}
                          </Badge>
                          <Badge variant="outline" className="ml-1">Level {assignment.level}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="current">
              {currentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses assigned for the current semester
                </div>
              ) : (
                <div className="space-y-4">
                  {currentAssignments.map(assignment => (
                    <div 
                      key={assignment.id} 
                      className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{getCourseName(assignment.courseId)}</h3>
                        <p className="text-sm text-muted-foreground">{getProgramName(assignment.programId)}</p>
                      </div>
                      <div className="text-right">
                        <div className="mt-1">
                          <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                            {assignment.programmeCourseType}
                          </Badge>
                          <Badge variant="outline" className="ml-1">Level {assignment.level}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/lecturer/courses">View My Courses</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/lecturer/students">View Students</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/lecturer/grades">Grade Management</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 